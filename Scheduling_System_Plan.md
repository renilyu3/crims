# IMSCRC Scheduling System Module Plan

## Overview

The Scheduling System module will manage court appearances, family visitations, rehabilitation programs, and provide conflict detection with calendar views for the IMSCRC system.

## Core Features

### 1. Court Appearance Scheduling

- Schedule court hearings for PDLs
- Track court dates, times, and locations
- Assign responsible officers
- Generate court appearance reports
- Automatic reminders and notifications

### 2. Family Visitation Management

- Schedule family visits for PDLs
- Visitor registration and approval workflow
- Time slot management with capacity limits
- Visit history tracking
- Security clearance integration

### 3. Rehabilitation Program Scheduling

- Schedule various rehabilitation programs
- Program enrollment management
- Instructor/facilitator assignment
- Progress tracking
- Attendance monitoring

### 4. Conflict Detection

- Automatic conflict detection for overlapping schedules
- Resource availability checking
- PDL availability validation
- Staff assignment conflicts
- Room/facility booking conflicts

### 5. Calendar View

- Monthly, weekly, and daily calendar views
- Color-coded event types
- Drag-and-drop rescheduling
- Multi-view support (PDL-specific, facility-wide)
- Export calendar functionality

## Database Schema

### Tables to Create:

1. **schedules** - Main scheduling table
2. **schedule_types** - Types of schedules (court, visit, program)
3. **court_schedules** - Court-specific scheduling details
4. **visit_schedules** - Family visit scheduling details
5. **program_schedules** - Rehabilitation program scheduling
6. **schedule_conflicts** - Detected conflicts log
7. **schedule_notifications** - Notification system
8. **facilities** - Available rooms/facilities
9. **programs** - Available rehabilitation programs

## API Endpoints

### Schedule Management:

- `GET /api/schedules` - List all schedules
- `POST /api/schedules` - Create new schedule
- `GET /api/schedules/{id}` - Get schedule details
- `PUT /api/schedules/{id}` - Update schedule
- `DELETE /api/schedules/{id}` - Delete schedule

### Court Schedules:

- `GET /api/court-schedules` - List court schedules
- `POST /api/court-schedules` - Create court schedule
- `GET /api/court-schedules/pdl/{pdl_id}` - Get PDL court schedules

### Visit Schedules:

- `GET /api/visit-schedules` - List visit schedules
- `POST /api/visit-schedules` - Create visit schedule
- `GET /api/visit-schedules/pdl/{pdl_id}` - Get PDL visit schedules

### Program Schedules:

- `GET /api/program-schedules` - List program schedules
- `POST /api/program-schedules` - Create program schedule
- `GET /api/program-schedules/pdl/{pdl_id}` - Get PDL program schedules

### Calendar & Conflicts:

- `GET /api/calendar/{date}` - Get calendar view for date
- `GET /api/conflicts` - Get schedule conflicts
- `POST /api/conflicts/check` - Check for conflicts

## Frontend Components

### Pages:

1. **SchedulingDashboard** - Main scheduling overview
2. **CalendarView** - Interactive calendar interface
3. **CourtScheduling** - Court appearance management
4. **VisitScheduling** - Family visit management
5. **ProgramScheduling** - Rehabilitation program management
6. **ConflictResolution** - Conflict detection and resolution

### Components:

1. **Calendar** - Reusable calendar component
2. **ScheduleForm** - Generic schedule creation form
3. **ConflictAlert** - Conflict notification component
4. **TimeSlotPicker** - Time selection component
5. **ResourceSelector** - Facility/resource selection
6. **ScheduleCard** - Individual schedule display

## Implementation Priority

### Phase 1: Core Infrastructure

1. Database migrations for scheduling tables
2. Basic Schedule model and API endpoints
3. Simple calendar view component

### Phase 2: Court Scheduling

1. Court schedule management
2. Court-specific forms and validation
3. Integration with PDL records

### Phase 3: Visit Scheduling

1. Family visit scheduling
2. Visitor integration
3. Time slot management

### Phase 4: Program Scheduling

1. Rehabilitation program scheduling
2. Program enrollment system
3. Attendance tracking

### Phase 5: Advanced Features

1. Conflict detection system
2. Advanced calendar features
3. Notifications and reminders
4. Reporting and analytics

## Technical Considerations

### Backend (Laravel):

- Use Carbon for date/time handling
- Implement proper timezone support
- Create scheduling service classes
- Add validation for schedule conflicts
- Implement notification queues

### Frontend (React + TypeScript):

- Use date-fns or moment.js for date handling
- Implement calendar library (react-big-calendar)
- Create reusable scheduling components
- Add drag-and-drop functionality
- Implement real-time updates

### Security:

- Role-based access for scheduling
- Audit trail for schedule changes
- Data validation and sanitization
- Secure API endpoints

## Next Steps

1. Create database migrations
2. Implement basic Schedule model
3. Create scheduling API endpoints
4. Build calendar view component
5. Implement court scheduling first
6. Add conflict detection
7. Expand to visits and programs
