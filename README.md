# Nautilus Trader Daily Reporting System

A comprehensive web-based daily reporting system designed for programmers to track work activities, document issues, and record solutions. Built with Next.js, TypeScript, and MySQL.

## Features

### For Programmers
- ✅ Create and manage daily work reports
- 📝 Document issues and bugs encountered
- 💡 Record solutions to problems
- 📊 Track hours worked and tasks completed
- 🔒 Secure authentication with JWT
- 📱 Clean, responsive interface

### For Managers/Admins
- 👥 Manage user accounts
- 📈 View all team reports
- ✔️ Review and approve reports
- 📊 Monitor team progress
- 🔍 Filter and search reports
- 📉 Access to analytics

### API Integration
- 🔌 RESTful API for automation
- 🤖 Integration with Cursor/Git workflows
- 📡 Support for automated reporting
- 🔐 Token-based authentication

## Technology Stack

- **Frontend**: Next.js 14, React, TypeScript
- **Backend**: Next.js API Routes
- **Database**: MySQL 8.0+
- **Authentication**: JWT with httpOnly cookies
- **Security**: bcrypt password hashing

## Prerequisites

- Node.js 18+ 
- MySQL 8.0+
- npm or yarn

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/nataraj-marvel/Data-reporting.git
cd Data-reporting
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Database

Create a MySQL database:

```bash
mysql -u root -p
```

```sql
CREATE DATABASE nautilus_reporting CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Import the schema:

```bash
mysql -u root -p nautilus_reporting < database/schema.sql
```

### 4. Configure Environment Variables

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=nautilus_reporting

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Application Configuration
NODE_ENV=development
```

**⚠️ IMPORTANT**: Change the `JWT_SECRET` to a strong, random value in production!

### 5. Run the Application

Development mode:

```bash
npm run dev
```

Production build:

```bash
npm run build
npm start
```

The application will be available at `http://localhost:3000`

## Default Credentials

After database setup, you can login with:

- **Username**: `admin`
- **Password**: `admin123`

**⚠️ IMPORTANT**: Change the default password immediately after first login!

## Usage

### Creating a Daily Report

1. Login to the system
2. Navigate to "Reports" → "New Report"
3. Fill in the report details:
   - Report date
   - Work description
   - Hours worked
   - Tasks completed
   - Blockers (if any)
   - Notes
4. Save as draft or submit for review

### Documenting Issues

1. Open a report
2. Click "Add Issue"
3. Fill in issue details:
   - Title
   - Description
   - Severity (low/medium/high/critical)
   - Category
4. Submit the issue

### Recording Solutions

1. Open a report
2. Click "Add Solution"
3. Document:
   - Problem description
   - Solution description
   - Time spent
   - Related issue (optional)
4. Save the solution

### API Usage

#### Authentication

Get an authentication token:

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

The token will be returned in the response and set as an httpOnly cookie.

#### Create a Report via API

```bash
curl -X POST http://localhost:3000/api/reports \
  -H "Content-Type: application/json" \
  -H "Cookie: auth_token=YOUR_JWT_TOKEN" \
  -d '{
    "report_date": "2024-01-15",
    "work_description": "Implemented feature X and fixed bug Y",
    "hours_worked": 8.0,
    "tasks_completed": "- Feature X completed\n- Bug Y fixed\n- Tests written",
    "status": "submitted"
  }'
```

#### List Reports

```bash
curl -X GET "http://localhost:3000/api/reports?start_date=2024-01-01&end_date=2024-01-31" \
  -H "Cookie: auth_token=YOUR_JWT_TOKEN"
```

### Git Hook Integration

Automate solution logging with a post-commit hook:

```bash
#!/bin/bash
# .git/hooks/post-commit

COMMIT_MSG=$(git log -1 --pretty=%B)
REPORT_ID=123  # Your current report ID
TOKEN="your_jwt_token"

curl -s -X POST http://localhost:3000/api/solutions \
  -H "Content-Type: application/json" \
  -H "Cookie: auth_token=$TOKEN" \
  -d "{
    \"report_id\": $REPORT_ID,
    \"title\": \"Git Commit: $(git log -1 --pretty=%h)\",
    \"problem_description\": \"Code changes\",
    \"solution_description\": \"$COMMIT_MSG\"
  }" > /dev/null
```

Make it executable:

```bash
chmod +x .git/hooks/post-commit
```

## Project Structure

```
Data-reporting/
├── database/
│   └── schema.sql           # Database schema
├── docs/
│   └── NAUTILUS_REPORTING_ARCHITECTURE.md  # Architecture documentation
├── lib/
│   ├── auth.ts              # Authentication utilities
│   └── db.ts                # Database connection
├── pages/
│   ├── api/
│   │   ├── auth/            # Authentication endpoints
│   │   ├── reports/         # Reports endpoints
│   │   ├── issues/          # Issues endpoints
│   │   ├── solutions/       # Solutions endpoints
│   │   ├── uploads/         # Uploads endpoints
│   │   └── users/           # User management endpoints
│   ├── _app.tsx             # Next.js app wrapper
│   ├── index.tsx            # Home page (redirects to login)
│   └── login.tsx            # Login page
├── styles/
│   └── globals.css          # Global styles
├── types/
│   └── index.ts             # TypeScript type definitions
├── .env.example             # Example environment variables
├── .gitignore               # Git ignore rules
├── next.config.js           # Next.js configuration
├── package.json             # Dependencies
├── tsconfig.json            # TypeScript configuration
└── README.md                # This file
```

## API Documentation

### Authentication Endpoints

- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Report Endpoints

- `GET /api/reports` - List reports (with filtering)
- `POST /api/reports` - Create report
- `GET /api/reports/[id]` - Get report details
- `PUT /api/reports/[id]` - Update report
- `DELETE /api/reports/[id]` - Delete report

### Issue Endpoints

- `GET /api/issues` - List issues
- `POST /api/issues` - Create issue
- `GET /api/issues/[id]` - Get issue details
- `PUT /api/issues/[id]` - Update issue
- `DELETE /api/issues/[id]` - Delete issue

### Solution Endpoints

- `GET /api/solutions` - List solutions
- `POST /api/solutions` - Create solution
- `GET /api/solutions/[id]` - Get solution details
- `PUT /api/solutions/[id]` - Update solution
- `DELETE /api/solutions/[id]` - Delete solution

### Upload Endpoints

- `GET /api/uploads` - List uploads
- `POST /api/uploads` - Create upload record
- `GET /api/uploads/[id]` - Get upload details
- `DELETE /api/uploads/[id]` - Delete upload

### User Management Endpoints (Admin Only)

- `GET /api/users` - List users
- `POST /api/users` - Create user
- `GET /api/users/[id]` - Get user details
- `PUT /api/users/[id]` - Update user
- `DELETE /api/users/[id]` - Delete user

For detailed API documentation, see [docs/NAUTILUS_REPORTING_ARCHITECTURE.md](docs/NAUTILUS_REPORTING_ARCHITECTURE.md)

## Security

### Authentication
- JWT tokens with 7-day expiration
- httpOnly cookies prevent XSS attacks
- Secure flag in production (HTTPS only)
- bcrypt password hashing (10 rounds)

### Authorization
- Role-based access control (Admin/Programmer)
- Resource ownership validation
- Protected API routes

### Best Practices
- Change default credentials immediately
- Use strong JWT_SECRET in production
- Enable HTTPS in production
- Regular security updates
- Database connection pooling
- Input validation and sanitization

## Development

### Running Tests

```bash
npm test
```

### Linting

```bash
npm run lint
```

### Building for Production

```bash
npm run build
```

## Troubleshooting

### Database Connection Issues

If you encounter database connection errors:

1. Verify MySQL is running: `mysql -u root -p`
2. Check database exists: `SHOW DATABASES;`
3. Verify credentials in `.env`
4. Check MySQL port (default: 3306)

### Authentication Issues

If login fails:

1. Verify default user exists in database
2. Check JWT_SECRET is set in `.env`
3. Clear browser cookies
4. Check browser console for errors

### TypeScript Errors

If you see TypeScript errors after installation:

```bash
npm install
npm run build
```

This will install all dependencies and resolve type definitions.

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Support

For issues, questions, or contributions, please open an issue on GitHub.

## Roadmap

- [ ] Email notifications
- [ ] Report analytics and charts
- [ ] Export to PDF/Excel
- [ ] Mobile application
- [ ] Real-time updates
- [ ] Advanced search and filtering
- [ ] Team collaboration features
- [ ] Integration with project management tools

## Acknowledgments

Built for the Nautilus Trader team to streamline daily reporting and progress tracking.