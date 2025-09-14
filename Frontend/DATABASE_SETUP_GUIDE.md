# Database Setup Guide for Job Portal

This guide will help you clear your existing database and recreate all tables with the proper structure for the Job Portal application.

## Prerequisites

- PostgreSQL database server running
- Database user with appropriate permissions
- Access to the database where you want to create the tables

## Method 1: Using PostgreSQL Command Line

### Step 1: Connect to PostgreSQL
```bash
psql -U your_username -d your_database_name
```

### Step 2: Run the Database Reset Script
```bash
\i database_reset_and_setup.sql
```

### Step 3: Verify the Setup
```sql
-- Check if all tables were created
\dt

-- Check sample data
SELECT 'Users' as table_name, COUNT(*) as record_count FROM users
UNION ALL
SELECT 'Jobs', COUNT(*) FROM jobs
UNION ALL
SELECT 'Profiles', COUNT(*) FROM profiles;
```

## Method 2: Using pgAdmin

1. Open pgAdmin and connect to your database
2. Right-click on your database → Query Tool
3. Open the `database_reset_and_setup.sql` file
4. Execute the script (F5 or click Execute)

## Method 3: Using Python Script (Recommended for FastAPI Backend)

If you're using this with a FastAPI backend, you can use the provided Python script:

```bash
python database_manager.py --reset --setup
```

## Database Schema Overview

### Core Tables Created:

1. **users** - User authentication and basic info
2. **user_roles** - Role-based access control (candidate, employer, admin)
3. **profiles** - Candidate profile information
4. **job_preferences** - Candidate job preferences
5. **education** - Education records for candidates
6. **projects** - Project portfolio for candidates
7. **jobs** - Job postings by employers
8. **job_applications** - Job application tracking

### Key Features:

- **Foreign Key Constraints** - Proper relationships between tables
- **Indexes** - Optimized for common queries
- **Triggers** - Automatic timestamp updates
- **Data Validation** - Check constraints for data integrity
- **Sample Data** - Pre-populated with test data

## Sample Data Included

The script creates sample data including:

- **Admin User**: admin@jobportal.com
- **Employer User**: employer@company.com  
- **Candidate User**: candidate@example.com
- **Sample Jobs**: 3 job postings with different requirements
- **Sample Profile**: Complete candidate profile with skills, education, and projects

## API Endpoints Supported

This database structure supports all the API endpoints documented in:

- `JOB_POSTING_API_DOCUMENTATION.md`
- `PROFILE_API_DOCUMENTATION.md`
- `PROFILE_API_README.md`

## Troubleshooting

### Common Issues:

1. **Permission Denied**: Ensure your database user has CREATE, DROP, and INSERT permissions
2. **Foreign Key Errors**: The script drops tables in the correct order, but if you have custom constraints, you may need to drop them first
3. **UUID Extension**: If you get UUID errors, run: `CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`

### Reset Individual Tables:

If you need to reset specific tables:

```sql
-- Reset only jobs table
DELETE FROM job_applications;
DELETE FROM jobs;
-- Then re-insert your data

-- Reset only profiles
DELETE FROM job_applications WHERE profile_id IS NOT NULL;
DELETE FROM projects;
DELETE FROM education;
DELETE FROM job_preferences;
DELETE FROM profiles;
-- Then re-insert your data
```

## Next Steps

After running the database setup:

1. **Start your FastAPI backend** (if using one)
2. **Run migrations** (if using Alembic): `alembic upgrade head`
3. **Test the API endpoints** using the provided documentation
4. **Customize the sample data** as needed for your testing

## Security Notes

- Change default passwords in production
- Use environment variables for database credentials
- Implement proper backup strategies
- Consider using database roles for different access levels

## Support

If you encounter any issues:

1. Check the PostgreSQL logs for detailed error messages
2. Verify all prerequisites are met
3. Ensure your database user has sufficient permissions
4. Check for any existing constraints that might conflict

The database is now ready for your Job Portal application! 🚀
