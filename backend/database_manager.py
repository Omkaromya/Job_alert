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
import pymysql
import json
from datetime import datetime, timezone
import uuid

# Database configuration
DB_CONFIG = {
    'host': os.getenv('DB_HOST', 'localhost'),
    'port': int(os.getenv('DB_PORT', '3306')),
    'database': os.getenv('DB_NAME', 'job_alert_db'),
    'user': os.getenv('DB_USER', 'root'),
    'password': os.getenv('DB_PASSWORD', 'root'),
    'charset': 'utf8mb4',
    'autocommit': True
}

class DatabaseManager:
    def __init__(self, config):
        self.config = config
        self.connection = None
        
    def connect(self):
        """Establish database connection"""
        try:
            self.connection = pymysql.connect(**self.config)
            print("✅ Connected to database successfully")
            return True
        except pymysql.Error as e:
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
    
    def execute_multiple_sql(self, sql_statements):
        """Execute multiple SQL statements separately"""
        try:
            cursor = self.connection.cursor()
            for statement in sql_statements:
                if statement.strip():
                    cursor.execute(statement)
            cursor.close()
            return True
        except Exception as e:
            print(f"❌ Error executing SQL statements: {e}")
            return False
    
    def reset_database(self):
        """Reset the database by dropping and recreating all tables"""
        print("🔄 Resetting database...")
        
        reset_statements = [
            "DROP TABLE IF EXISTS job_applications",
            "DROP TABLE IF EXISTS jobs",
            "DROP TABLE IF EXISTS profiles",
            "DROP TABLE IF EXISTS users",
            "DROP TABLE IF EXISTS user_roles",
            "DROP TABLE IF EXISTS education",
            "DROP TABLE IF EXISTS projects",
            "DROP TABLE IF EXISTS job_preferences"
        ]
        
        if self.execute_multiple_sql(reset_statements):
            print("✅ Database reset completed")
            return True
        else:
            print("❌ Error resetting database")
            return False
    
    def create_tables(self):
        """Create all database tables"""
        print("🏗️  Creating database tables...")
        
        create_statements = [
            """CREATE TABLE users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(150) UNIQUE NOT NULL,
                email VARCHAR(254) UNIQUE NOT NULL,
                password_hash VARCHAR(128) NOT NULL,
                first_name VARCHAR(150),
                last_name VARCHAR(150),
                is_active BOOLEAN DEFAULT TRUE,
                is_staff BOOLEAN DEFAULT FALSE,
                is_superuser BOOLEAN DEFAULT FALSE,
                date_joined TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                last_login TIMESTAMP NULL,
                email_verified BOOLEAN DEFAULT FALSE,
                verification_token VARCHAR(255),
                reset_token VARCHAR(255),
                reset_token_expires TIMESTAMP NULL
            )""",
            
            """CREATE TABLE user_roles (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT,
                role VARCHAR(50) NOT NULL CHECK (role IN ('candidate', 'employer', 'admin')),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(user_id, role),
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )""",
            
            """CREATE TABLE profiles (
                id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
                user_id INT,
                full_name VARCHAR(100) NOT NULL,
                mobile_number VARCHAR(15),
                location VARCHAR(100),
                skills JSON,
                experience_years INT CHECK (experience_years >= 0 AND experience_years <= 50),
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
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )""",
            
            """CREATE TABLE job_preferences (
                id INT AUTO_INCREMENT PRIMARY KEY,
                profile_id VARCHAR(36),
                preferred_job_title VARCHAR(100),
                job_location_preferences VARCHAR(200),
                employment_type VARCHAR(50) CHECK (employment_type IN ('full-time', 'part-time', 'contract', 'internship')),
                expected_salary_ctc VARCHAR(50),
                notice_period VARCHAR(50),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE
            )""",
            
            """CREATE TABLE education (
                id INT AUTO_INCREMENT PRIMARY KEY,
                profile_id VARCHAR(36),
                degree_qualification VARCHAR(100),
                institution VARCHAR(200),
                field_of_study VARCHAR(100),
                start_year INT,
                end_year INT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE
            )""",
            
            """CREATE TABLE projects (
                id INT AUTO_INCREMENT PRIMARY KEY,
                profile_id VARCHAR(36),
                project_title VARCHAR(200),
                live_github_link TEXT,
                description TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE
            )""",
            
            """CREATE TABLE jobs (
                id INT AUTO_INCREMENT PRIMARY KEY,
                posted_by INT,
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
                skills_required TEXT,
                salary_type VARCHAR(20) CHECK (salary_type IN ('monthly', 'yearly', 'hourly')),
                salary_min DECIMAL(12,2),
                salary_max DECIMAL(12,2),
                job_summary TEXT,
                roles_responsibilities TEXT,
                key_requirements TEXT,
                application_deadline TIMESTAMP NULL,
                how_to_apply VARCHAR(50) CHECK (how_to_apply IN ('quick_apply', 'email', 'website')),
                number_of_openings INT DEFAULT 1,
                hiring_manager VARCHAR(100),
                recruiter_contact JSON,
                job_status VARCHAR(20) DEFAULT 'active' CHECK (job_status IN ('active', 'inactive', 'draft', 'closed')),
                visibility VARCHAR(20) DEFAULT 'public' CHECK (visibility IN ('public', 'private', 'company_only')),
                tags TEXT,
                is_active BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (posted_by) REFERENCES users(id) ON DELETE CASCADE
            )""",
            
            """CREATE TABLE job_applications (
                id INT AUTO_INCREMENT PRIMARY KEY,
                job_id INT,
                candidate_id INT,
                profile_id VARCHAR(36),
                application_status VARCHAR(50) DEFAULT 'applied' CHECK (application_status IN ('applied', 'under_review', 'shortlisted', 'interviewed', 'rejected', 'hired')),
                cover_letter TEXT,
                resume_url TEXT,
                applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                notes TEXT,
                UNIQUE(job_id, candidate_id),
                FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
                FOREIGN KEY (candidate_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE
            )"""
        ]
        
        if self.execute_multiple_sql(create_statements):
            print("✅ Database tables created successfully")
            return True
        else:
            print("❌ Error creating tables")
            return False
    
    def create_indexes(self):
        """Create database indexes for performance"""
        print("📊 Creating database indexes...")
        
        index_statements = [
            "CREATE INDEX idx_users_email ON users(email)",
            "CREATE INDEX idx_users_username ON users(username)",
            "CREATE INDEX idx_users_is_active ON users(is_active)",
            "CREATE INDEX idx_profiles_user_id ON profiles(user_id)",
            "CREATE INDEX idx_profiles_full_name ON profiles(full_name)",
            "CREATE INDEX idx_jobs_posted_by ON jobs(posted_by)",
            "CREATE INDEX idx_jobs_job_title ON jobs(job_title)",
            "CREATE INDEX idx_jobs_company_name ON jobs(company_name)",
            "CREATE INDEX idx_jobs_city ON jobs(city)",
            "CREATE INDEX idx_jobs_state ON jobs(state)",
            "CREATE INDEX idx_jobs_country ON jobs(country)",
            "CREATE INDEX idx_jobs_employment_type ON jobs(employment_type)",
            "CREATE INDEX idx_jobs_work_mode ON jobs(work_mode)",
            "CREATE INDEX idx_jobs_job_status ON jobs(job_status)",
            "CREATE INDEX idx_jobs_is_active ON jobs(is_active)",
            "CREATE INDEX idx_jobs_created_at ON jobs(created_at)",
            "CREATE INDEX idx_jobs_salary_range ON jobs(salary_min, salary_max)",
            "CREATE INDEX idx_job_applications_job_id ON job_applications(job_id)",
            "CREATE INDEX idx_job_applications_candidate_id ON job_applications(candidate_id)",
            "CREATE INDEX idx_job_applications_status ON job_applications(application_status)",
            "CREATE INDEX idx_job_applications_applied_at ON job_applications(applied_at)",
            "CREATE INDEX idx_education_profile_id ON education(profile_id)",
            "CREATE INDEX idx_projects_profile_id ON projects(profile_id)",
            "CREATE INDEX idx_job_preferences_profile_id ON job_preferences(profile_id)"
        ]
        
        if self.execute_multiple_sql(index_statements):
            print("✅ Database indexes created successfully")
            return True
        else:
            print("❌ Error creating indexes")
            return False
    
    def create_triggers(self):
        """Create database triggers for automatic timestamp updates"""
        print("⚡ Creating database triggers...")
        
        # MySQL triggers need to be created one by one
        trigger_statements = [
            """CREATE TRIGGER update_profiles_updated_at 
            BEFORE UPDATE ON profiles
            FOR EACH ROW 
            BEGIN
                SET NEW.updated_at = CURRENT_TIMESTAMP;
            END""",
            
            """CREATE TRIGGER update_jobs_updated_at 
            BEFORE UPDATE ON jobs
            FOR EACH ROW 
            BEGIN
                SET NEW.updated_at = CURRENT_TIMESTAMP;
            END""",
            
            """CREATE TRIGGER update_job_applications_updated_at 
            BEFORE UPDATE ON job_applications
            FOR EACH ROW 
            BEGIN
                SET NEW.updated_at = CURRENT_TIMESTAMP;
            END""",
            
            """CREATE TRIGGER update_job_preferences_updated_at 
            BEFORE UPDATE ON job_preferences
            FOR EACH ROW 
            BEGIN
                SET NEW.updated_at = CURRENT_TIMESTAMP;
            END"""
        ]
        
        if self.execute_multiple_sql(trigger_statements):
            print("✅ Database triggers created successfully")
            return True
        else:
            print("❌ Error creating triggers")
            return False
    
    def insert_sample_data(self):
        """Insert sample data into the database"""
        print("📝 Inserting sample data...")
        
        sample_statements = [
            """INSERT INTO users (username, email, password_hash, first_name, last_name, is_active, is_staff, is_superuser, email_verified)
            VALUES ('admin', 'admin@jobportal.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/4.5.6.7.8.9.0', 'Admin', 'User', TRUE, TRUE, TRUE, TRUE)""",
            
            """INSERT INTO users (username, email, password_hash, first_name, last_name, is_active, email_verified)
            VALUES ('employer1', 'employer@company.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/4.5.6.7.8.9.0', 'John', 'Employer', TRUE, TRUE)""",
            
            """INSERT INTO users (username, email, password_hash, first_name, last_name, is_active, email_verified)
            VALUES ('candidate1', 'candidate@example.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/4.5.6.7.8.9.0', 'Jane', 'Candidate', TRUE, TRUE)""",
            
            "INSERT INTO user_roles (user_id, role) VALUES (1, 'admin')",
            "INSERT INTO user_roles (user_id, role) VALUES (2, 'employer')",
            "INSERT INTO user_roles (user_id, role) VALUES (3, 'candidate')",
            
            """INSERT INTO profiles (user_id, full_name, mobile_number, location, skills, experience_years, education, bio)
            VALUES (3, 'Jane Candidate', '+1234567890', 'New York, NY', JSON_ARRAY('React', 'JavaScript', 'Node.js', 'Python'), 3, 'Bachelor of Computer Science', 'Passionate developer with 3 years of experience in web development.')""",
            
            """INSERT INTO job_preferences (profile_id, preferred_job_title, job_location_preferences, employment_type, expected_salary_ctc, notice_period)
            SELECT id, 'Frontend Developer', 'Remote, New York', 'full-time', '80000-100000', '2 weeks'
            FROM profiles WHERE user_id = 3""",
            
            """INSERT INTO education (profile_id, degree_qualification, institution, field_of_study, start_year, end_year)
            SELECT id, 'Bachelor of Science', 'University of Technology', 'Computer Science', 2018, 2022
            FROM profiles WHERE user_id = 3""",
            
            """INSERT INTO projects (profile_id, project_title, live_github_link, description)
            SELECT id, 'E-commerce Website', 'https://github.com/jane/ecommerce', 'Full-stack e-commerce application built with React and Node.js'
            FROM profiles WHERE user_id = 3""",
            
            """INSERT INTO jobs (posted_by, job_title, company_name, industry, employment_type, work_mode, city, state, country, experience_required, skills_required, salary_type, salary_min, salary_max, job_summary, number_of_openings)
            VALUES (2, 'Senior Frontend Developer', 'Tech Solutions Inc', 'Technology', 'full-time', 'remote', 'San Francisco', 'California', 'USA', '3-5 years', 'React, JavaScript, TypeScript, HTML, CSS', 'yearly', 90000, 120000, 'We are looking for a skilled frontend developer to join our team...', 2)""",
            
            """INSERT INTO jobs (posted_by, job_title, company_name, industry, employment_type, work_mode, city, state, country, experience_required, skills_required, salary_type, salary_min, salary_max, job_summary, number_of_openings)
            VALUES (2, 'Full Stack Developer', 'WebCorp', 'Technology', 'full-time', 'hybrid', 'New York', 'New York', 'USA', '2-4 years', 'React, Node.js, Python, PostgreSQL', 'yearly', 75000, 95000, 'Join our dynamic team as a full stack developer...', 1)""",
            
            """INSERT INTO jobs (posted_by, job_title, company_name, industry, employment_type, work_mode, city, state, country, experience_required, skills_required, salary_type, salary_min, salary_max, job_summary, number_of_openings)
            VALUES (1, 'DevOps Engineer', 'CloudTech', 'Technology', 'full-time', 'on-site', 'Austin', 'Texas', 'USA', '2-3 years', 'AWS, Docker, Kubernetes, CI/CD', 'yearly', 85000, 110000, 'We need a DevOps engineer to help us scale our infrastructure...', 1)"""
        ]
        
        if self.execute_multiple_sql(sample_statements):
            print("✅ Sample data inserted successfully")
            return True
        else:
            print("❌ Error inserting sample data")
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
