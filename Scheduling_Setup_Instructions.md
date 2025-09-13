# IMSCRC Scheduling System Setup Instructions

## Overview

This document provides step-by-step instructions to set up and run the Scheduling System module for the IMSCRC project.

## Prerequisites

- XAMPP running with Apache and MySQL
- Composer installed
- Node.js and npm installed
- Laravel backend already set up from previous modules
- React frontend already set up from previous modules

## Backend Setup

### 1. Run Database Migrations

Navigate to the backend directory and run the new migrations:

```bash
cd imsrc/imscrc-backend
php artisan migrate
```

This will create the following tables:

- `schedule_types` - Types of schedules (court, visit, program, etc.)
- `facilities` - Available facilities and rooms
- `programs` - Rehabilitation and educational programs
- `schedules` - Main scheduling table
- `schedule_conflicts` - Conflict detection and resolution

### 2. Seed the Database

Run the scheduling seeder to populate initial data:

```bash
php artisan db:seed --class=SchedulingSeeder
```

This will create:

- **Schedule Types**: Court Appearance, Family Visit, Rehabilitation Program, Medical Appointment, Transfer
- **Facilities**: Main Courtroom, Visiting Rooms, Education Center, Workshop Room, Medical Clinic, Counseling Room
- **Programs**: Anger Management, Drug Rehabilitation, Basic Education, Vocational Training, Life Skills, Group Counseling, Religious Services

### 3. Update DatabaseSeeder (Optional)

If you want the scheduling data to be seeded automatically, add to `database/seeders/DatabaseSeeder.php`:

```php
public function run(): void
{
    $this->call([
        UserSeeder::class,
        VisitorSeeder::class,
        SchedulingSeeder::class, // Add this line
    ]);
}
```

### 4. Register Service Provider (If needed)

The ConflictDetectionService should be automatically available through dependency injection. If you encounter issues, you can bind it in `app/Providers/AppServiceProvider.php`:

```php
public function register(): void
{
    $this->app->singleton(ConflictDetectionService::class);
}
```

## Frontend Setup

### 1. Install Additional Dependencies (If needed)

The scheduling system uses existing dependencies. If you need a calendar component later, you might want to install:

```bash
cd imsrc/imscrc-frontend
npm install react-big-calendar date-fns
```

### 2. Update App.tsx Routes

Add the scheduling routes to your main App.tsx file:

```tsx
import SchedulingDashboard from "./pages/scheduling/SchedulingDashboard";

// Add these routes in your routing configuration
<Route
  path="/scheduling"
  element={
    <ProtectedRoute>
      <Layout>
        <SchedulingDashboard />
      </Layout>
    </ProtectedRoute>
  }
/>;
```

### 3. Update Navigation

Add scheduling navigation to your main navigation component:

```tsx
<li className="nav-item">
  <Link className="nav-link" to="/scheduling">
    <i className="bi bi-calendar3 me-2"></i>
    Scheduling
  </Link>
</li>
```

## Testing the Setup

### 1. Start the Backend Server

```bash
cd imsrc/imscrc-backend
php artisan serve
```

### 2. Start the Frontend Development Server

```bash
cd imsrc/imscrc-frontend
npm run dev
```

### 3. Test API Endpoints

You can test the API endpoints using tools like Postman or curl:

```bash
# Get all schedules
curl -H "Authorization: Bearer YOUR_TOKEN" http://127.0.0.1:8000/api/schedules

# Get facilities
curl -H "Authorization: Bearer YOUR_TOKEN" http://127.0.0.1:8000/api/facilities

# Get programs
curl -H "Authorization: Bearer YOUR_TOKEN" http://127.0.0.1:8000/api/programs

# Get conflicts
curl -H "Authorization: Bearer YOUR_TOKEN" http://127.0.0.1:8000/api/conflicts
```

### 4. Access the Scheduling Dashboard

Navigate to `http://localhost:5173/scheduling` (or your frontend URL) to access the scheduling dashboard.

## Features Available

### ✅ Completed Backend Features:

1. **Database Schema** - All tables created with proper relationships
2. **Models** - Schedule, ScheduleType, Facility, Program, ScheduleConflict
3. **API Controllers** - Full CRUD operations for all entities
4. **Conflict Detection Service** - Automatic conflict detection and resolution
5. **Data Seeding** - Sample data for testing

### ✅ Completed Frontend Features:

1. **TypeScript Types** - Complete type definitions
2. **API Service** - Full API integration with proper error handling
3. **Scheduling Dashboard** - Overview with today's schedules and conflicts

### 🚧 Next Development Steps:

1. **Calendar View Component** - Interactive calendar interface
2. **Schedule Creation Forms** - Forms for different schedule types
3. **Conflict Resolution Interface** - UI for managing conflicts
4. **Court Scheduling** - Specialized court appearance management
5. **Visit Scheduling** - Family visit management
6. **Program Scheduling** - Rehabilitation program scheduling

## API Endpoints Reference

### Schedules

- `GET /api/schedules` - List schedules with filters
- `POST /api/schedules` - Create new schedule
- `GET /api/schedules/{id}` - Get schedule details
- `PUT /api/schedules/{id}` - Update schedule
- `DELETE /api/schedules/{id}` - Delete schedule
- `GET /api/schedules-calendar` - Calendar view data
- `GET /api/schedules-today` - Today's schedules
- `GET /api/schedules-upcoming` - Upcoming schedules

### Facilities

- `GET /api/facilities` - List facilities
- `POST /api/facilities` - Create facility
- `GET /api/facilities/{id}` - Get facility details
- `PUT /api/facilities/{id}` - Update facility
- `DELETE /api/facilities/{id}` - Delete facility
- `GET /api/facilities-types` - Get facility types
- `POST /api/facilities/{id}/check-availability` - Check availability

### Programs

- `GET /api/programs` - List programs
- `POST /api/programs` - Create program
- `GET /api/programs/{id}` - Get program details
- `PUT /api/programs/{id}` - Update program
- `DELETE /api/programs/{id}` - Delete program
- `GET /api/programs-types` - Get program types
- `GET /api/programs/{id}/enrollment` - Get enrollment data

### Conflicts

- `GET /api/conflicts` - List conflicts
- `GET /api/conflicts/{id}` - Get conflict details
- `POST /api/conflicts/{id}/resolve` - Resolve conflict
- `POST /api/conflicts/{id}/acknowledge` - Acknowledge conflict
- `POST /api/conflicts/{id}/ignore` - Ignore conflict
- `GET /api/conflicts-unresolved` - Get unresolved conflicts
- `POST /api/conflicts-check` - Check for conflicts
- `GET /api/conflicts-statistics` - Get conflict statistics

## Troubleshooting

### Common Issues:

1. **Migration Errors**

   - Ensure all previous migrations have run successfully
   - Check that foreign key constraints are properly set up

2. **Seeder Errors**

   - Make sure the PDL and Visitor tables exist and have data
   - Check that the User table has at least one user for foreign keys

3. **API Errors**

   - Verify that all controllers are properly imported in routes
   - Check that the ConflictDetectionService is properly injected

4. **Frontend Errors**
   - Ensure all TypeScript types are properly imported
   - Check that the API base URL is correct in the api service

### Database Reset (If needed):

```bash
php artisan migrate:fresh --seed
```

This will drop all tables and recreate them with fresh data.

## Next Steps

Once the basic setup is complete, you can proceed to implement:

1. Calendar view component
2. Schedule creation and editing forms
3. Conflict resolution interface
4. Advanced scheduling features
5. Reporting and analytics

The foundation is now in place for a comprehensive scheduling system!
