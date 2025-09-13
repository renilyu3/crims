# Information Management System for Capiz Rehabilitation Center (IMSCRC)

## Comprehensive Development Plan

### Technology Stack

- **Backend**: PHP Laravel 10.x
- **Frontend**: Vite + React 18 + TypeScript
- **Database**: MySQL 8.0
- **Authentication**: Laravel Sanctum
- **Styling**: Bootstrap
- **Development Environment**: Local (XAMPP)

### System Architecture

```
Frontend (React + TypeScript)
    ↓ API Calls
Backend (Laravel API)
    ↓ Database Queries
MySQL Database
```

### Core Modules (Based on Document Requirements)

#### 1. Authentication & User Management

- **Staff Login/Logout**
- **Administrator Login/Logout**
- **Password Reset**
- **Session Management**
- **Role-based Access Control**

#### 2. Dashboard

- **Staff Dashboard**: PDL activities, schedules overview
- **Admin Dashboard**: Full operational overview, system usage, reports

#### 3. Profile Management

- **PDL Registration**
- **Personal Information Management**
- **Legal Records**
- **Admission Data**
- **Disciplinary Actions**
- **Rehabilitation Progress Tracking**

#### 4. Scheduling and Activity Management

- **Court Appearances Scheduling**
- **Family Visitations**
- **Rehabilitation Programs**
- **Conflict Detection**
- **Calendar View**

#### 5. Visitors Log Module

- **Visitor Registration**
- **Entry/Exit Tracking**
- **Visit History**
- **Visitor Background Checks**
- **Digital Records**

#### 6. Report Management

- **PDL Status Reports**
- **Parole Reports**
- **Transfer Reports**
- **Incident Reports**
- **Administrative Reports**
- **Export to PDF/Excel**

### Database Schema Design

#### Core Tables:

1. **users** (staff, administrators)
2. **pdls** (persons deprived of liberty)
3. **visitors**
4. **visits**
5. **schedules**
6. **activities**
7. **incidents**
8. **reports**
9. **rehabilitation_programs**
10. **legal_records**

### Development Phases (Agile Methodology)

#### Phase 1: Project Setup & Authentication

- Laravel project setup
- React + TypeScript frontend setup
- Database configuration
- Authentication system
- Basic user roles

#### Phase 2: Core Modules Development

- Profile Management
- Dashboard implementation
- Basic CRUD operations

#### Phase 3: Advanced Features

- Scheduling system
- Visitors log
- Report generation

#### Phase 4: Testing & Deployment

- Unit testing
- Integration testing
- Local deployment setup
- Documentation

### Security Features

- **Data Encryption**
- **SQL Injection Prevention**
- **XSS Protection**
- **CSRF Protection**
- **Role-based Permissions**
- **Audit Trails**

### File Structure

```
imscrc/
├── backend/ (Laravel)
│   ├── app/
│   ├── database/
│   ├── routes/
│   └── config/
├── frontend/ (React + TypeScript)
│   ├── src/
│   ├── components/
│   ├── pages/
│   └── types/
└── database/
    └── migrations/
```

### Next Steps

1. Set up development environment
2. Create Laravel backend project
3. Set up React frontend with TypeScript
4. Design and implement database schema
5. Build authentication system
6. Develop core modules iteratively
