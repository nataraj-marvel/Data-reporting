# Nautilus Trader Daily Reporting System - Architecture Documentation

## Overview

The Nautilus Trader Daily Reporting System is a web-based application designed to help programmers track their daily work activities, document issues, and record solutions. The system provides role-based access control with two user types: Administrators and Programmers.

## Technology Stack

### Backend
- **Framework**: Next.js 14 (API Routes)
- **Database**: MySQL 8.0+
- **Authentication**: JWT (JSON Web Tokens) with httpOnly cookies
- **Password Hashing**: bcrypt
- **Language**: TypeScript

### Frontend
- **Framework**: Next.js 14 (React)
- **Styling**: CSS (Custom global styles)
- **State Management**: React Hooks
- **Language**: TypeScript

## System Architecture

### High-Level Architecture

```
┌─────────────┐
│   Browser   │
└──────┬──────┘
       │
       │ HTTP/HTTPS
       │
┌──────▼──────────────────────┐
│   Next.js Application       │
│  ┌────────────────────────┐ │
│  │  Frontend (React)      │ │
│  │  - Pages               │ │
│  │  - Components          │ │
│  └────────────────────────┘ │
│  ┌────────────────────────┐ │
│  │  API Routes            │ │
│  │  - Authentication      │ │
│  │  - Reports             │ │
│  │  - Issues              │ │
│  │  - Solutions           │ │
│  │  - Uploads             │ │
│  │  - Users               │ │
│  └────────────────────────┘ │
└──────┬──────────────────────┘
       │
       │ MySQL Protocol
       │
┌──────▼──────┐
│   MySQL DB  │
└─────────────┘
```

## Database Schema

### Tables

#### 1. users
Stores user account information with role-based access control.

```sql
- id (INT, PRIMARY KEY, AUTO_INCREMENT)
- username (VARCHAR(50), UNIQUE, NOT NULL)
- password_hash (VARCHAR(255), NOT NULL)
- role (ENUM: 'admin', 'programmer', DEFAULT 'programmer')
- full_name (VARCHAR(100), NOT NULL)
- email (VARCHAR(100), UNIQUE, NOT NULL)
- created_at (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP)
- updated_at (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP ON UPDATE)
- last_login (TIMESTAMP, NULL)
- is_active (BOOLEAN, DEFAULT TRUE)
```

#### 2. sessions
Manages JWT authentication sessions.

```sql
- id (INT, PRIMARY KEY, AUTO_INCREMENT)
- user_id (INT, FOREIGN KEY → users.id)
- token (VARCHAR(500), NOT NULL)
- expires_at (TIMESTAMP, NOT NULL)
- created_at (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP)
- ip_address (VARCHAR(45))
- user_agent (TEXT)
```

#### 3. daily_reports
Core table for daily activity reports.

```sql
- id (INT, PRIMARY KEY, AUTO_INCREMENT)
- user_id (INT, FOREIGN KEY → users.id)
- report_date (DATE, NOT NULL)
- work_description (TEXT, NOT NULL)
- hours_worked (DECIMAL(4,2), NOT NULL)
- tasks_completed (TEXT)
- blockers (TEXT)
- notes (TEXT)
- status (ENUM: 'draft', 'submitted', 'reviewed', DEFAULT 'draft')
- created_at (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP)
- updated_at (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP ON UPDATE)
- submitted_at (TIMESTAMP, NULL)
- reviewed_at (TIMESTAMP, NULL)
- reviewed_by (INT, FOREIGN KEY → users.id)
- UNIQUE(user_id, report_date)
```

#### 4. issues
Tracks problems and bugs encountered.

```sql
- id (INT, PRIMARY KEY, AUTO_INCREMENT)
- report_id (INT, FOREIGN KEY → daily_reports.id)
- user_id (INT, FOREIGN KEY → users.id)
- title (VARCHAR(200), NOT NULL)
- description (TEXT, NOT NULL)
- severity (ENUM: 'low', 'medium', 'high', 'critical', DEFAULT 'medium')
- status (ENUM: 'open', 'in_progress', 'resolved', 'closed', DEFAULT 'open')
- category (VARCHAR(50))
- created_at (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP)
- updated_at (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP ON UPDATE)
- resolved_at (TIMESTAMP, NULL)
```

#### 5. problems_solved
Documents solutions to problems.

```sql
- id (INT, PRIMARY KEY, AUTO_INCREMENT)
- report_id (INT, FOREIGN KEY → daily_reports.id)
- user_id (INT, FOREIGN KEY → users.id)
- issue_id (INT, FOREIGN KEY → issues.id, NULL)
- title (VARCHAR(200), NOT NULL)
- problem_description (TEXT, NOT NULL)
- solution_description (TEXT, NOT NULL)
- time_spent (DECIMAL(4,2))
- tags (VARCHAR(255))
- created_at (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP)
- updated_at (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP ON UPDATE)
```

#### 6. data_uploads
Tracks file uploads and data submissions.

```sql
- id (INT, PRIMARY KEY, AUTO_INCREMENT)
- report_id (INT, FOREIGN KEY → daily_reports.id)
- user_id (INT, FOREIGN KEY → users.id)
- file_name (VARCHAR(255), NOT NULL)
- file_type (VARCHAR(50))
- file_size (INT)
- upload_path (VARCHAR(500))
- description (TEXT)
- metadata (JSON)
- created_at (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP)
```

## Authentication & Authorization

### Authentication Flow

1. User submits credentials to `/api/auth/login`
2. System validates credentials against database (bcrypt password verification)
3. On success, generates JWT token containing user info
4. Token stored in httpOnly cookie for security
5. Session record created in database with expiration
6. Subsequent requests include cookie automatically
7. API routes verify token and check session validity

### Authorization Levels

#### Admin Role
- Full access to all features
- Can view and manage all users' reports
- Can create, update, and delete users
- Can review and approve reports
- Access to admin dashboard
- User management capabilities

#### Programmer Role
- Can create and manage own reports
- Can view own reports only
- Can create issues and solutions
- Can upload data
- Cannot access other users' data
- Cannot manage users

### Security Features

1. **Password Security**
   - Passwords hashed using bcrypt (10 rounds)
   - Never stored or transmitted in plain text

2. **Session Management**
   - JWT tokens with 7-day expiration
   - httpOnly cookies prevent XSS attacks
   - Secure flag in production (HTTPS only)
   - SameSite=strict prevents CSRF

3. **API Protection**
   - All API routes (except login) require authentication
   - Role-based middleware (`requireAuth`, `requireAdmin`)
   - User ownership validation on resources

## API Endpoints

### Authentication

#### POST /api/auth/login
- **Purpose**: User login
- **Access**: Public
- **Request**: `{ username, password }`
- **Response**: `{ success, data: { user, token } }`

#### POST /api/auth/logout
- **Purpose**: User logout
- **Access**: Authenticated
- **Response**: `{ success, message }`

#### GET /api/auth/me
- **Purpose**: Get current user info
- **Access**: Authenticated
- **Response**: `{ success, data: user }`

### Reports

#### GET /api/reports
- **Purpose**: List reports with filtering
- **Access**: Authenticated (programmers see own, admins see all)
- **Query Params**: `user_id`, `start_date`, `end_date`, `status`, `page`, `limit`
- **Response**: `{ success, data: reports[], pagination }`

#### POST /api/reports
- **Purpose**: Create new report
- **Access**: Authenticated
- **Request**: `{ report_date, work_description, hours_worked, ... }`
- **Response**: `{ success, data: report }`

#### GET /api/reports/[id]
- **Purpose**: Get single report with related data
- **Access**: Authenticated (owner or admin)
- **Response**: `{ success, data: { report, issues, solutions, uploads } }`

#### PUT /api/reports/[id]
- **Purpose**: Update report
- **Access**: Authenticated (owner or admin)
- **Request**: `{ work_description?, hours_worked?, status?, ... }`
- **Response**: `{ success, data: report }`

#### DELETE /api/reports/[id]
- **Purpose**: Delete report
- **Access**: Authenticated (owner or admin, draft only for programmers)
- **Response**: `{ success, message }`

### Issues

#### GET /api/issues
- **Purpose**: List issues
- **Access**: Authenticated
- **Query Params**: `report_id`, `status`, `severity`
- **Response**: `{ success, data: issues[] }`

#### POST /api/issues
- **Purpose**: Create issue
- **Access**: Authenticated
- **Request**: `{ report_id, title, description, severity?, category? }`
- **Response**: `{ success, data: issue }`

#### GET /api/issues/[id]
- **Purpose**: Get single issue
- **Access**: Authenticated (owner or admin)
- **Response**: `{ success, data: issue }`

#### PUT /api/issues/[id]
- **Purpose**: Update issue
- **Access**: Authenticated (owner or admin)
- **Request**: `{ title?, description?, severity?, status?, category? }`
- **Response**: `{ success, data: issue }`

#### DELETE /api/issues/[id]
- **Purpose**: Delete issue
- **Access**: Authenticated (owner or admin)
- **Response**: `{ success, message }`

### Solutions

#### GET /api/solutions
- **Purpose**: List solutions
- **Access**: Authenticated
- **Query Params**: `report_id`, `issue_id`
- **Response**: `{ success, data: solutions[] }`

#### POST /api/solutions
- **Purpose**: Create solution
- **Access**: Authenticated
- **Request**: `{ report_id, title, problem_description, solution_description, ... }`
- **Response**: `{ success, data: solution }`

#### GET /api/solutions/[id]
- **Purpose**: Get single solution
- **Access**: Authenticated (owner or admin)
- **Response**: `{ success, data: solution }`

#### PUT /api/solutions/[id]
- **Purpose**: Update solution
- **Access**: Authenticated (owner or admin)
- **Request**: `{ title?, problem_description?, solution_description?, ... }`
- **Response**: `{ success, data: solution }`

#### DELETE /api/solutions/[id]
- **Purpose**: Delete solution
- **Access**: Authenticated (owner or admin)
- **Response**: `{ success, message }`

### Uploads

#### GET /api/uploads
- **Purpose**: List uploads
- **Access**: Authenticated
- **Query Params**: `report_id`
- **Response**: `{ success, data: uploads[] }`

#### POST /api/uploads
- **Purpose**: Create upload record
- **Access**: Authenticated
- **Request**: `{ report_id, file_name, file_type?, file_size?, ... }`
- **Response**: `{ success, data: upload }`

#### GET /api/uploads/[id]
- **Purpose**: Get single upload
- **Access**: Authenticated (owner or admin)
- **Response**: `{ success, data: upload }`

#### DELETE /api/uploads/[id]
- **Purpose**: Delete upload
- **Access**: Authenticated (owner or admin)
- **Response**: `{ success, message }`

### Users (Admin Only)

#### GET /api/users
- **Purpose**: List all users
- **Access**: Admin only
- **Query Params**: `role`, `is_active`
- **Response**: `{ success, data: users[] }`

#### POST /api/users
- **Purpose**: Create new user
- **Access**: Admin only
- **Request**: `{ username, password, full_name, email, role? }`
- **Response**: `{ success, data: user }`

#### GET /api/users/[id]
- **Purpose**: Get single user
- **Access**: Admin only
- **Response**: `{ success, data: user }`

#### PUT /api/users/[id]
- **Purpose**: Update user
- **Access**: Admin only
- **Request**: `{ full_name?, email?, role?, is_active?, password? }`
- **Response**: `{ success, data: user }`

#### DELETE /api/users/[id]
- **Purpose**: Delete user
- **Access**: Admin only
- **Response**: `{ success, message }`

## Frontend Pages

### /login
- **Purpose**: User authentication
- **Access**: Public
- **Features**: 
  - Username/password form
  - Error handling
  - Redirect to /reports on success

### /reports
- **Purpose**: Reports dashboard
- **Access**: Authenticated
- **Features**:
  - List of reports with filtering
  - Date range filter
  - Status filter
  - User filter (admin only)
  - Pagination
  - Create new report button

### /reports/new
- **Purpose**: Create new daily report
- **Access**: Authenticated
- **Features**:
  - Report form with all fields
  - Date picker
  - Hours worked input
  - Text areas for descriptions
  - Draft/Submit options

### /reports/[id]
- **Purpose**: View/edit single report
- **Access**: Authenticated (owner or admin)
- **Features**:
  - Full report details
  - Edit capability
  - Related issues list
  - Related solutions list
  - Related uploads list
  - Status management

### /admin
- **Purpose**: Admin dashboard
- **Access**: Admin only
- **Features**:
  - System overview
  - Recent activity
  - User statistics
  - Report statistics
  - Quick actions

### /admin/users
- **Purpose**: User management
- **Access**: Admin only
- **Features**:
  - User list
  - Create new user
  - Edit user details
  - Activate/deactivate users
  - Reset passwords

## API Integration for Cursor/Git

The system is designed to support automated report updates through API calls, making it easy to integrate with development tools like Cursor or Git hooks.

### Example: Create Report via API

```bash
curl -X POST http://localhost:3000/api/reports \
  -H "Content-Type: application/json" \
  -H "Cookie: auth_token=YOUR_JWT_TOKEN" \
  -d '{
    "report_date": "2024-01-15",
    "work_description": "Implemented new feature X",
    "hours_worked": 8.0,
    "tasks_completed": "- Feature X completed\n- Tests written",
    "status": "submitted"
  }'
```

### Example: Add Issue via API

```bash
curl -X POST http://localhost:3000/api/issues \
  -H "Content-Type: application/json" \
  -H "Cookie: auth_token=YOUR_JWT_TOKEN" \
  -d '{
    "report_id": 123,
    "title": "Bug in feature Y",
    "description": "Detailed description of the bug",
    "severity": "high"
  }'
```

### Git Hook Integration

Create a post-commit hook to automatically log work:

```bash
#!/bin/bash
# .git/hooks/post-commit

COMMIT_MSG=$(git log -1 --pretty=%B)
TOKEN="your_jwt_token_here"

curl -X POST http://localhost:3000/api/solutions \
  -H "Content-Type: application/json" \
  -H "Cookie: auth_token=$TOKEN" \
  -d "{
    \"report_id\": $REPORT_ID,
    \"title\": \"Git Commit\",
    \"problem_description\": \"Code changes\",
    \"solution_description\": \"$COMMIT_MSG\"
  }"
```

## Deployment Considerations

### Environment Variables

Required environment variables:
- `DB_HOST`: MySQL host (default: localhost)
- `DB_PORT`: MySQL port (default: 3306)
- `DB_USER`: MySQL username
- `DB_PASSWORD`: MySQL password
- `DB_NAME`: Database name (default: nautilus_reporting)
- `JWT_SECRET`: Secret key for JWT signing (MUST be changed in production)
- `NODE_ENV`: Environment (development/production)

### Production Checklist

1. **Security**
   - Change default admin password
   - Set strong JWT_SECRET
   - Enable HTTPS
   - Configure CORS if needed
   - Set up rate limiting

2. **Database**
   - Regular backups
   - Connection pooling configured
   - Indexes optimized
   - Query performance monitored

3. **Application**
   - Error logging configured
   - Session cleanup scheduled
   - File upload limits set
   - API rate limiting enabled

4. **Monitoring**
   - Application logs
   - Database performance
   - API response times
   - User activity tracking

## Future Enhancements

1. **Features**
   - Email notifications
   - Report analytics and charts
   - Export to PDF/Excel
   - Team collaboration features
   - Real-time updates (WebSockets)

2. **Technical**
   - Redis for session storage
   - File upload to S3/cloud storage
   - Full-text search
   - API versioning
   - GraphQL endpoint

3. **UI/UX**
   - Dark mode
   - Mobile app
   - Rich text editor
   - Drag-and-drop file uploads
   - Advanced filtering and search

## Support and Maintenance

### Database Maintenance

```sql
-- Clean up expired sessions (run daily)
DELETE FROM sessions WHERE expires_at < NOW();

-- Archive old reports (optional, run monthly)
CREATE TABLE daily_reports_archive LIKE daily_reports;
INSERT INTO daily_reports_archive 
SELECT * FROM daily_reports 
WHERE report_date < DATE_SUB(CURDATE(), INTERVAL 1 YEAR);
```

### Backup Strategy

1. Daily automated MySQL dumps
2. Weekly full database backup
3. Monthly archive to cold storage
4. Test restore procedures quarterly

## Conclusion

The Nautilus Trader Daily Reporting System provides a comprehensive solution for tracking programmer activities, managing issues, and documenting solutions. The architecture is scalable, secure, and designed for easy integration with development workflows.