#!/usr/bin/env python3
"""
Database Manager for Job Portal
===============================

This script provides database management functionality for the Job Portal application.
It can reset the database, create tables, and populate with sample data.

Usage:
    python database_manager.py --reset --setup
    python database_manager.py --reset-only
    python database_manager.py --setup-only
    python database_manager.py --status
"""

import argparse
import os
import sys
import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT
import json
from datetime import datetime, timezone
import uuid

# Database configuration
DB_CONFIG = {
    'host': os.getenv('DB_HOST', '127.0.0.1'),
    'port': os.getenv('DB_PORT', '5432'),
    'database': os.getenv('DB_NAME', 'job_portal'),
    'user': os.getenv('DB_USER', 'postgres'),
    'password': os.getenv('DB_PASSWORD', 'password')
}

class DatabaseManager:
    def __init__(self, config):
        self.config = config
        self.connection = None
        
    def connect(self):
        """Establish database connection"""
        try:
            self.connection = psycopg2.connect(**self.config)
            self.connection.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
            print("✅ Connected to database successfully")
            return True
        except psycopg2.Error as e:
            print(f"❌ Database connection failed: {e}")
            return False
    
    def disconnect(self):
        """Close database connection"""
        if self.connection:
            self.connection.close()
            print("✅ Database connection closed")
    
    def execute_sql_file(self, file_path):
        """Execute SQL commands from a file"""
        try:
            with open(file_path, 'r', encoding='utf-8') as file:
                sql_commands = file.read()
            
            cursor = self.connection.cursor()
            cursor.execute(sql_commands)
            cursor.close()
            print(f"✅ Successfully executed {file_path}")
            return True
        except Exception as e:
            print(f"❌ Error executing {file_path}: {e}")
            return False
    
    def reset_database(self):
        """Reset the database by dropping and recreating all tables"""
        print("🔄 Resetting database...")
        
        reset_sql = """
        -- Drop all existing tables (in correct order to handle foreign key constraints)
        DROP TABLE IF EXISTS job_applications CASCADE;
        DROP TABLE IF EXISTS jobs CASCADE;
        DROP TABLE IF EXISTS profiles CASCADE;
        DROP TABLE IF EXISTS users CASCADE;
        DROP TABLE IF EXISTS user_roles CASCADE;
        DROP TABLE IF EXISTS education CASCADE;
        DROP TABLE IF EXISTS projects CASCADE;
        DROP TABLE IF EXISTS job_preferences CASCADE;

        -- Drop any existing sequences
        DROP SEQUENCE IF EXISTS users_id_seq CASCADE;
        DROP SEQUENCE IF EXISTS jobs_id_seq CASCADE;
        DROP SEQUENCE IF EXISTS profiles_id_seq CASCADE;
        DROP SEQUENCE IF EXISTS job_applications_id_seq CASCADE;
        """
        
        try:
            cursor = self.connection.cursor()
            cursor.execute(reset_sql)
            cursor.close()
            print("✅ Database reset completed")
            return True
        except Exception as e:
            print(f"❌ Error resetting database: {e}")
            return False
    
    def create_tables(self):
        """Create all database tables"""
        print("🏗️  Creating database tables...")
        
        create_tables_sql = """
        -- =====================================================
        -- 1. USERS TABLE
        -- =====================================================
        CREATE TABLE users (
            id SERIAL PRIMARY KEY,
            username VARCHAR(150) UNIQUE NOT NULL,
            email VARCHAR(254) UNIQUE NOT NULL,
            password_hash VARCHAR(128) NOT NULL,
            first_name VARCHAR(150),
            last_name VARCHAR(150),
            is_active BOOLEAN DEFAULT TRUE,
            is_staff BOOLEAN DEFAULT FALSE,
            is_superuser BOOLEAN DEFAULT FALSE,
            date_joined TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            last_login TIMESTAMP WITH TIME ZONE,
            email_verified BOOLEAN DEFAULT FALSE,
            verification_token VARCHAR(255),
            reset_token VARCHAR(255),
            reset_token_expires TIMESTAMP WITH TIME ZONE
        );

        -- =====================================================
        -- 2. USER ROLES TABLE
        -- =====================================================
        CREATE TABLE user_roles (
            id SERIAL PRIMARY KEY,
            user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
            role VARCHAR(50) NOT NULL CHECK (role IN ('candidate', 'employer', 'admin')),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(user_id, role)
        );

        -- =====================================================
        -- 3. PROFILES TABLE
        -- =====================================================
        CREATE TABLE profiles (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
            full_name VARCHAR(100) NOT NULL,
            mobile_number VARCHAR(15),
            location VARCHAR(100),
            skills TEXT[], -- Array of skills
            experience_years INTEGER CHECK (experience_years >= 0 AND experience_years <= 50),
            education TEXT,
            bio TEXT CHECK (LENGTH(bio) >= 10 AND LENGTH(bio) <= 1000),
            headline VARCHAR(200),
            current_job_title VARCHAR(100),
            company VARCHAR(100),
            country VARCHAR(100),
            state VARCHAR(100),
            city VARCHAR(100),
            resume_url TEXT,
            cover_letter_url TEXT,
            is_active BOOLEAN DEFAULT TRUE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );

        -- =====================================================
        -- 4. JOB PREFERENCES TABLE
        -- =====================================================
        CREATE TABLE job_preferences (
            id SERIAL PRIMARY KEY,
            profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
            preferred_job_title VARCHAR(100),
            job_location_preferences VARCHAR(200),
            employment_type VARCHAR(50) CHECK (employment_type IN ('full-time', 'part-time', 'contract', 'internship')),
            expected_salary_ctc VARCHAR(50),
            notice_period VARCHAR(50),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );

        -- =====================================================
        -- 5. EDUCATION TABLE
        -- =====================================================
        CREATE TABLE education (
            id SERIAL PRIMARY KEY,
            profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
            degree_qualification VARCHAR(100),
            institution VARCHAR(200),
            field_of_study VARCHAR(100),
            start_year INTEGER,
            end_year INTEGER,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );

        -- =====================================================
        -- 6. PROJECTS TABLE
        -- =====================================================
        CREATE TABLE projects (
            id SERIAL PRIMARY KEY,
            profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
            project_title VARCHAR(200),
            live_github_link TEXT,
            description TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );

        -- =====================================================
        -- 7. JOBS TABLE
        -- =====================================================
        CREATE TABLE jobs (
            id SERIAL PRIMARY KEY,
            posted_by INTEGER REFERENCES users(id) ON DELETE CASCADE,
            job_title VARCHAR(200) NOT NULL,
            company_name VARCHAR(200) NOT NULL,
            industry VARCHAR(100),
            employment_type VARCHAR(50) CHECK (employment_type IN ('full-time', 'part-time', 'contract', 'internship')),
            work_mode VARCHAR(50) CHECK (work_mode IN ('on-site', 'remote', 'hybrid')),
            city VARCHAR(100),
            state VARCHAR(100),
            country VARCHAR(100),
            experience_required VARCHAR(100),
            education_required VARCHAR(200),
            skills_required TEXT, -- Comma-separated skills
            salary_type VARCHAR(20) CHECK (salary_type IN ('monthly', 'yearly', 'hourly')),
            salary_min DECIMAL(12,2),
            salary_max DECIMAL(12,2),
            job_summary TEXT,
            roles_responsibilities TEXT, -- Comma-separated roles
            key_requirements TEXT, -- Comma-separated requirements
            application_deadline TIMESTAMP WITH TIME ZONE,
            how_to_apply VARCHAR(50) CHECK (how_to_apply IN ('quick_apply', 'email', 'website')),
            number_of_openings INTEGER DEFAULT 1,
            hiring_manager VARCHAR(100),
            recruiter_contact TEXT, -- JSON string for contact info
            job_status VARCHAR(20) DEFAULT 'active' CHECK (job_status IN ('active', 'inactive', 'draft', 'closed')),
            visibility VARCHAR(20) DEFAULT 'public' CHECK (visibility IN ('public', 'private', 'company_only')),
            tags TEXT, -- Comma-separated tags
            is_active BOOLEAN DEFAULT TRUE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );

        -- =====================================================
        -- 8. JOB APPLICATIONS TABLE
        -- =====================================================
        CREATE TABLE job_applications (
            id SERIAL PRIMARY KEY,
            job_id INTEGER REFERENCES jobs(id) ON DELETE CASCADE,
            candidate_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
            profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
            application_status VARCHAR(50) DEFAULT 'applied' CHECK (application_status IN ('applied', 'under_review', 'shortlisted', 'interviewed', 'rejected', 'hired')),
            cover_letter TEXT,
            resume_url TEXT,
            applied_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            notes TEXT,
            UNIQUE(job_id, candidate_id) -- Prevent duplicate applications
        );
        """
        
        try:
            cursor = self.connection.cursor()
            cursor.execute(create_tables_sql)
            cursor.close()
            print("✅ Database tables created successfully")
            return True
        except Exception as e:
            print(f"❌ Error creating tables: {e}")
            return False
    
    def create_indexes(self):
        """Create database indexes for performance"""
        print("📊 Creating database indexes...")
        
        indexes_sql = """
        -- Users table indexes
        CREATE INDEX idx_users_email ON users(email);
        CREATE INDEX idx_users_username ON users(username);
        CREATE INDEX idx_users_is_active ON users(is_active);

        -- Profiles table indexes
        CREATE INDEX idx_profiles_user_id ON profiles(user_id);
        CREATE INDEX idx_profiles_full_name ON profiles(full_name);
        CREATE INDEX idx_profiles_skills ON profiles USING GIN(skills);

        -- Jobs table indexes
        CREATE INDEX idx_jobs_posted_by ON jobs(posted_by);
        CREATE INDEX idx_jobs_job_title ON jobs(job_title);
        CREATE INDEX idx_jobs_company_name ON jobs(company_name);
        CREATE INDEX idx_jobs_city ON jobs(city);
        CREATE INDEX idx_jobs_state ON jobs(state);
        CREATE INDEX idx_jobs_country ON jobs(country);
        CREATE INDEX idx_jobs_employment_type ON jobs(employment_type);
        CREATE INDEX idx_jobs_work_mode ON jobs(work_mode);
        CREATE INDEX idx_jobs_job_status ON jobs(job_status);
        CREATE INDEX idx_jobs_is_active ON jobs(is_active);
        CREATE INDEX idx_jobs_created_at ON jobs(created_at);
        CREATE INDEX idx_jobs_salary_range ON jobs(salary_min, salary_max);

        -- Job applications table indexes
        CREATE INDEX idx_job_applications_job_id ON job_applications(job_id);
        CREATE INDEX idx_job_applications_candidate_id ON job_applications(candidate_id);
        CREATE INDEX idx_job_applications_status ON job_applications(application_status);
        CREATE INDEX idx_job_applications_applied_at ON job_applications(applied_at);

        -- Education table indexes
        CREATE INDEX idx_education_profile_id ON education(profile_id);

        -- Projects table indexes
        CREATE INDEX idx_projects_profile_id ON projects(profile_id);

        -- Job preferences table indexes
        CREATE INDEX idx_job_preferences_profile_id ON job_preferences(profile_id);
        """
        
        try:
            cursor = self.connection.cursor()
            cursor.execute(indexes_sql)
            cursor.close()
            print("✅ Database indexes created successfully")
            return True
        except Exception as e:
            print(f"❌ Error creating indexes: {e}")
            return False
    
    def create_triggers(self):
        """Create database triggers for automatic timestamp updates"""
        print("⚡ Creating database triggers...")
        
        triggers_sql = """
        -- Function to update updated_at timestamp
        CREATE OR REPLACE FUNCTION update_updated_at_column()
        RETURNS TRIGGER AS $$
        BEGIN
            NEW.updated_at = CURRENT_TIMESTAMP;
            RETURN NEW;
        END;
        $$ language 'plpgsql';

        -- Apply triggers to relevant tables
        CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

        CREATE TRIGGER update_jobs_updated_at BEFORE UPDATE ON jobs
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

        CREATE TRIGGER update_job_applications_updated_at BEFORE UPDATE ON job_applications
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

        CREATE TRIGGER update_job_preferences_updated_at BEFORE UPDATE ON job_preferences
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
        """
        
        try:
            cursor = self.connection.cursor()
            cursor.execute(triggers_sql)
            cursor.close()
            print("✅ Database triggers created successfully")
            return True
        except Exception as e:
            print(f"❌ Error creating triggers: {e}")
            return False
    
    def insert_sample_data(self):
        """Insert sample data into the database"""
        print("📝 Inserting sample data...")
        
        sample_data_sql = """
        -- Insert sample admin user
        INSERT INTO users (username, email, password_hash, first_name, last_name, is_active, is_staff, is_superuser, email_verified)
        VALUES ('admin', 'admin@jobportal.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/4.5.6.7.8.9.0', 'Admin', 'User', TRUE, TRUE, TRUE, TRUE);

        -- Insert sample employer user
        INSERT INTO users (username, email, password_hash, first_name, last_name, is_active, email_verified)
        VALUES ('employer1', 'employer@company.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/4.5.6.7.8.9.0', 'John', 'Employer', TRUE, TRUE);

        -- Insert sample candidate user
        INSERT INTO users (username, email, password_hash, first_name, last_name, is_active, email_verified)
        VALUES ('candidate1', 'candidate@example.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/4.5.6.7.8.9.0', 'Jane', 'Candidate', TRUE, TRUE);

        -- Insert user roles
        INSERT INTO user_roles (user_id, role) VALUES (1, 'admin');
        INSERT INTO user_roles (user_id, role) VALUES (2, 'employer');
        INSERT INTO user_roles (user_id, role) VALUES (3, 'candidate');

        -- Insert sample profile
        INSERT INTO profiles (user_id, full_name, mobile_number, location, skills, experience_years, education, bio)
        VALUES (3, 'Jane Candidate', '+1234567890', 'New York, NY', ARRAY['React', 'JavaScript', 'Node.js', 'Python'], 3, 'Bachelor of Computer Science', 'Passionate developer with 3 years of experience in web development.');

        -- Insert sample job preferences
        INSERT INTO job_preferences (profile_id, preferred_job_title, job_location_preferences, employment_type, expected_salary_ctc, notice_period)
        SELECT id, 'Frontend Developer', 'Remote, New York', 'full-time', '80000-100000', '2 weeks'
        FROM profiles WHERE user_id = 3;

        -- Insert sample education
        INSERT INTO education (profile_id, degree_qualification, institution, field_of_study, start_year, end_year)
        SELECT id, 'Bachelor of Science', 'University of Technology', 'Computer Science', 2018, 2022
        FROM profiles WHERE user_id = 3;

        -- Insert sample project
        INSERT INTO projects (profile_id, project_title, live_github_link, description)
        SELECT id, 'E-commerce Website', 'https://github.com/jane/ecommerce', 'Full-stack e-commerce application built with React and Node.js'
        FROM profiles WHERE user_id = 3;

        -- Insert sample jobs
        INSERT INTO jobs (posted_by, job_title, company_name, industry, employment_type, work_mode, city, state, country, experience_required, skills_required, salary_type, salary_min, salary_max, job_summary, number_of_openings)
        VALUES 
        (2, 'Senior Frontend Developer', 'Tech Solutions Inc', 'Technology', 'full-time', 'remote', 'San Francisco', 'California', 'USA', '3-5 years', 'React, JavaScript, TypeScript, HTML, CSS', 'yearly', 90000, 120000, 'We are looking for a skilled frontend developer to join our team...', 2),
        (2, 'Full Stack Developer', 'WebCorp', 'Technology', 'full-time', 'hybrid', 'New York', 'New York', 'USA', '2-4 years', 'React, Node.js, Python, PostgreSQL', 'yearly', 75000, 95000, 'Join our dynamic team as a full stack developer...', 1),
        (1, 'DevOps Engineer', 'CloudTech', 'Technology', 'full-time', 'on-site', 'Austin', 'Texas', 'USA', '2-3 years', 'AWS, Docker, Kubernetes, CI/CD', 'yearly', 85000, 110000, 'We need a DevOps engineer to help us scale our infrastructure...', 1);
        """
        
        try:
            cursor = self.connection.cursor()
            cursor.execute(sample_data_sql)
            cursor.close()
            print("✅ Sample data inserted successfully")
            return True
        except Exception as e:
            print(f"❌ Error inserting sample data: {e}")
            return False
    
    def get_database_status(self):
        """Get current database status"""
        print("📊 Checking database status...")
        
        status_queries = [
            ("Users", "SELECT COUNT(*) FROM users"),
            ("User Roles", "SELECT COUNT(*) FROM user_roles"),
            ("Profiles", "SELECT COUNT(*) FROM profiles"),
            ("Jobs", "SELECT COUNT(*) FROM jobs"),
            ("Job Applications", "SELECT COUNT(*) FROM job_applications"),
            ("Education", "SELECT COUNT(*) FROM education"),
            ("Projects", "SELECT COUNT(*) FROM projects"),
            ("Job Preferences", "SELECT COUNT(*) FROM job_preferences")
        ]
        
        try:
            cursor = self.connection.cursor()
            print("\n📋 Database Status:")
            print("-" * 40)
            
            for table_name, query in status_queries:
                cursor.execute(query)
                count = cursor.fetchone()[0]
                print(f"{table_name:20} | {count:>6} records")
            
            cursor.close()
            print("-" * 40)
            return True
        except Exception as e:
            print(f"❌ Error checking database status: {e}")
            return False

def main():
    parser = argparse.ArgumentParser(description='Database Manager for Job Portal')
    parser.add_argument('--reset', action='store_true', help='Reset the database (drop all tables)')
    parser.add_argument('--setup', action='store_true', help='Setup the database (create tables, indexes, triggers)')
    parser.add_argument('--sample-data', action='store_true', help='Insert sample data')
    parser.add_argument('--status', action='store_true', help='Show database status')
    parser.add_argument('--reset-only', action='store_true', help='Only reset the database')
    parser.add_argument('--setup-only', action='store_true', help='Only setup the database')
    
    args = parser.parse_args()
    
    if not any([args.reset, args.setup, args.sample_data, args.status, args.reset_only, args.setup_only]):
        parser.print_help()
        return
    
    # Initialize database manager
    db_manager = DatabaseManager(DB_CONFIG)
    
    if not db_manager.connect():
        sys.exit(1)
    
    try:
        success = True
        
        # Reset database
        if args.reset or args.reset_only:
            success &= db_manager.reset_database()
        
        # Setup database
        if args.setup or args.setup_only:
            success &= db_manager.create_tables()
            success &= db_manager.create_indexes()
            success &= db_manager.create_triggers()
        
        # Insert sample data
        if args.sample_data or (args.reset and args.setup):
            success &= db_manager.insert_sample_data()
        
        # Show status
        if args.status or success:
            db_manager.get_database_status()
        
        if success:
            print("\n🎉 Database operations completed successfully!")
        else:
            print("\n❌ Some database operations failed!")
            sys.exit(1)
            
    except KeyboardInterrupt:
        print("\n⚠️  Operation cancelled by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ Unexpected error: {e}")
        sys.exit(1)
    finally:
        db_manager.disconnect()

if __name__ == "__main__":
    main()
