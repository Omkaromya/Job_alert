# Job Alert Backend API

A FastAPI-based backend for a job alert system with user authentication, job management, and alert functionality.

## Features

- **User Authentication**: JWT-based authentication with user registration and login
- **Job Management**: CRUD operations for jobs with company associations
- **Job Alerts**: Create and manage personalized job alerts
- **Job Applications**: Track job applications and their status
- **Company Management**: Manage company information
- **Database**: PostgreSQL with SQLAlchemy ORM
- **API Documentation**: Automatic OpenAPI/Swagger documentation

## Project Structure

```
backend_job_alert/
├── app/
│   ├── __init__.py
│   ├── api/
│   │   ├── __init__.py
│   │   ├── deps.py
│   │   └── v1/
│   │       ├── __init__.py
│   │       ├── api.py
│   │       └── endpoints/
│   │           ├── __init__.py
│   │           └── auth.py
│   ├── core/
│   │   ├── __init__.py
│   │   └── security.py
│   ├── crud/
│   │   ├── __init__.py
│   │   └── user.py
│   ├── database.py
│   ├── models/
│   │   ├── __init__.py
│   │   ├── user.py
│   │   ├── company.py
│   │   ├── job.py
│   │   └── job_alert.py
│   └── schemas/
│       ├── __init__.py
│       ├── user.py
│       ├── job.py
│       ├── company.py
│       ├── job_alert.py
│       └── job_application.py
├── main.py
├── requirements.txt
├── alembic.ini
├── env.example
└── README.md
```

## Setup Instructions

### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

### 2. Environment Configuration

Copy the example environment file and configure your settings:

```bash
cp env.example .env
```

Edit `.env` with your database credentials and other settings:

```env
DATABASE_URL=postgresql://username:password@localhost/job_alert_db
SECRET_KEY=your-secret-key-here
```

### 3. Database Setup

Create a PostgreSQL database and update the `DATABASE_URL` in your `.env` file.

### 4. Run the Application

```bash
uvicorn main:app --reload
```

The API will be available at `http://localhost:8000`

## API Documentation

Once the server is running, you can access:

- **Interactive API docs (Swagger UI)**: `http://localhost:8000/docs`
- **Alternative API docs (ReDoc)**: `http://localhost:8000/redoc`
- **OpenAPI schema**: `http://localhost:8000/api/v1/openapi.json`

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register a new user
- `POST /api/v1/auth/login` - Login and get access token
- `GET /api/v1/auth/me` - Get current user info

### Health Check
- `GET /` - Welcome message
- `GET /health` - Health check endpoint

## Database Models

### User
- Basic user information with authentication
- Relationships with job alerts and applications

### Company
- Company information and details
- Relationships with jobs

### Job
- Job postings with requirements and salary information
- Relationships with companies and applications

### JobAlert
- User-defined job search criteria
- Configurable frequency and filters

### JobApplication
- Track user applications to jobs
- Status tracking and application details

## Development

### Adding New Endpoints

1. Create new endpoint files in `app/api/v1/endpoints/`
2. Add the router to `app/api/v1/api.py`
3. Create corresponding CRUD operations in `app/crud/`
4. Add schemas in `app/schemas/`

### Database Migrations

The project uses Alembic for database migrations. To set up:

```bash
# Initialize alembic (if not already done)
alembic init alembic

# Create a new migration
alembic revision --autogenerate -m "Description of changes"

# Apply migrations
alembic upgrade head
```

## Security Features

- Password hashing with bcrypt
- JWT token authentication
- CORS middleware configuration
- Input validation with Pydantic schemas

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.
