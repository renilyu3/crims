# Visitors Log Module - Development Plan (Option B)

## Overview

Building Option B: Visitors Log Module for the IMSCRC system. This module will transform the manual, paper-based visitor log into a secure, efficient, and legally compliant digital system essential for day-to-day operations and safety of the correctional facility.

## Current State Analysis

✅ **Completed (Phase 1 - PDL Management):**

- Complete PDL Management Module with registration, search, and statistics
- Authentication system with role-based access control
- Database infrastructure and API foundation

## Visitors Log Module Features

### 1. Visitor Registration System

- **Personal Information**
  - Full name, ID number, contact details
  - Address and emergency contact
  - Relationship to PDL
  - Photo capture/upload
- **Background Information**
  - Previous visit history
  - Background check status
  - Restricted visitor flags
  - Special notes/restrictions
- **Visit Purpose**
  - Legal consultation
  - Family visit
  - Official business
  - Medical/emergency

### 2. Visit Scheduling and Approval

- **Scheduling System**
  - Available time slots management
  - PDL availability checking
  - Visitor capacity limits
  - Conflict detection
- **Approval Workflow**
  - Automatic approval for cleared visitors
  - Manual approval for flagged visitors
  - Administrator override capabilities
  - Notification system for approvals/rejections
- **Visit Types**
  - Regular family visits
  - Legal consultations
  - Official visits
  - Emergency visits

### 3. Entry/Exit Tracking

- **Check-in Process**
  - Visitor identification verification
  - Security screening documentation
  - Visit start time logging
  - Visitor badge generation
- **Check-out Process**
  - Visit end time logging
  - Exit verification
  - Badge return tracking
  - Visit summary generation
- **Real-time Monitoring**
  - Current visitors dashboard
  - Overstay alerts
  - Security notifications
  - Capacity monitoring

### 4. Background Check Integration

- **Background Verification**
  - Criminal history checks
  - Watchlist screening
  - Previous incident reports
  - Risk assessment scoring
- **Status Management**
  - Approved/Denied/Pending status
  - Expiration date tracking
  - Re-verification scheduling
  - Appeal process handling

## Technical Implementation Plan

### Backend Development (Laravel)

#### 1. Database Schema

```sql
-- Visitors table
visitors:
- id (primary key)
- visitor_number (unique identifier)
- first_name, middle_name, last_name
- id_type, id_number
- date_of_birth, gender
- address (JSON)
- contact_information (JSON)
- emergency_contact (JSON)
- photo_path
- background_check_status
- background_check_date
- background_check_expiry
- risk_level (low, medium, high)
- is_restricted (boolean)
- restriction_reason
- notes
- created_by, updated_by
- timestamps

-- Visits table
visits:
- id (primary key)
- visit_number (unique identifier)
- visitor_id (foreign key)
- pdl_id (foreign key)
- visit_type (family, legal, official, emergency)
- visit_purpose
- scheduled_date, scheduled_time
- actual_start_time, actual_end_time
- status (scheduled, approved, denied, in_progress, completed, cancelled)
- approval_status (pending, approved, denied)
- approved_by (foreign key to users)
- approval_date
- check_in_time, check_out_time
- visitor_badge_number
- notes
- created_by, updated_by
- timestamps

-- Visit schedules table
visit_schedules:
- id (primary key)
- date
- time_slot
- max_capacity
- current_bookings
- is_available
- created_by, updated_by
- timestamps

-- Background checks table
background_checks:
- id (primary key)
- visitor_id (foreign key)
- check_type
- check_date
- check_result (JSON)
- status (pending, cleared, flagged, denied)
- expiry_date
- checked_by
- notes
- created_by, updated_by
- timestamps
```

#### 2. Models Development

- **Visitor Model** - Visitor information and relationships
- **Visit Model** - Visit records and status management
- **VisitSchedule Model** - Time slot management
- **BackgroundCheck Model** - Background verification tracking

#### 3. API Controllers

- **VisitorController** - Visitor CRUD operations
- **VisitController** - Visit management and scheduling
- **VisitScheduleController** - Schedule management
- **BackgroundCheckController** - Background verification
- **VisitorReportController** - Reporting and analytics

#### 4. API Routes

```php
// Visitor Management Routes
Route::middleware('auth:sanctum')->group(function () {
    // Visitors
    Route::apiResource('visitors', VisitorController::class);
    Route::get('visitors-search', [VisitorController::class, 'search']);
    Route::post('visitors/{visitor}/photo', [VisitorController::class, 'uploadPhoto']);

    // Visits
    Route::apiResource('visits', VisitController::class);
    Route::post('visits/{visit}/check-in', [VisitController::class, 'checkIn']);
    Route::post('visits/{visit}/check-out', [VisitController::class, 'checkOut']);
    Route::post('visits/{visit}/approve', [VisitController::class, 'approve']);
    Route::post('visits/{visit}/deny', [VisitController::class, 'deny']);

    // Schedules
    Route::apiResource('visit-schedules', VisitScheduleController::class);
    Route::get('available-slots', [VisitScheduleController::class, 'availableSlots']);

    // Background Checks
    Route::apiResource('background-checks', BackgroundCheckController::class);
    Route::post('visitors/{visitor}/background-check', [BackgroundCheckController::class, 'initiate']);

    // Reports
    Route::get('visitor-statistics', [VisitorReportController::class, 'statistics']);
    Route::get('visit-reports', [VisitorReportController::class, 'visitReports']);
});
```

### Frontend Development (React + TypeScript)

#### 1. Type Definitions

```typescript
// Visitor Types
interface Visitor {
  id: number;
  visitor_number: string;
  first_name: string;
  middle_name?: string;
  last_name: string;
  id_type: string;
  id_number: string;
  date_of_birth: string;
  gender: "male" | "female" | "other";
  address: Address;
  contact_information: ContactInfo;
  emergency_contact?: EmergencyContact;
  photo_path?: string;
  background_check_status: "pending" | "cleared" | "flagged" | "denied";
  risk_level: "low" | "medium" | "high";
  is_restricted: boolean;
  // ... other fields
}

interface Visit {
  id: number;
  visit_number: string;
  visitor: Visitor;
  pdl: PDL;
  visit_type: "family" | "legal" | "official" | "emergency";
  visit_purpose: string;
  scheduled_date: string;
  scheduled_time: string;
  status:
    | "scheduled"
    | "approved"
    | "denied"
    | "in_progress"
    | "completed"
    | "cancelled";
  approval_status: "pending" | "approved" | "denied";
  // ... other fields
}
```

#### 2. Components Structure

```
src/components/visitors/
├── VisitorRegistrationForm.tsx
├── VisitorProfileView.tsx
├── VisitorSearchBar.tsx
├── VisitSchedulingForm.tsx
├── VisitApprovalPanel.tsx
├── CheckInForm.tsx
├── CheckOutForm.tsx
├── VisitorBadge.tsx
├── BackgroundCheckPanel.tsx
└── VisitorStatistics.tsx
```

#### 3. Pages Structure

```
src/pages/visitors/
├── VisitorsDashboard.tsx
├── VisitorRegistration.tsx
├── VisitorsList.tsx
├── VisitScheduling.tsx
├── VisitApproval.tsx
├── ActiveVisits.tsx
└── VisitorReports.tsx
```

## Development Phases

### Phase 1: Database and Models (Week 1)

1. ✅ Create visitor and visit-related migrations
2. ✅ Develop Visitor, Visit, and related models
3. ✅ Set up relationships and validation
4. ✅ Create sample data seeders

### Phase 2: Backend API Development (Week 1-2)

1. ✅ Visitor management controller
2. ✅ Visit scheduling and management
3. ✅ Check-in/check-out functionality
4. ✅ Background check integration
5. ✅ Approval workflow system

### Phase 3: Frontend Core Components (Week 2-3)

1. ✅ Visitor registration form
2. ✅ Visit scheduling interface
3. ✅ Check-in/check-out system
4. ✅ Approval dashboard

### Phase 4: Advanced Features (Week 3-4)

1. ✅ Background check integration
2. ✅ Real-time visitor tracking
3. ✅ Reporting and analytics
4. ✅ Security features

## Security Considerations

- Visitor photo security and privacy
- Background check data protection
- Access control for sensitive information
- Audit trail for all visitor activities
- Data retention policies

## Integration Points

- **PDL Management Module**: Link visitors to specific PDLs
- **Scheduling System**: Coordinate with court dates and activities
- **Reporting Module**: Generate visitor statistics and reports
- **User Management**: Role-based access for different staff levels

## Success Metrics

- Visitor registration time < 3 minutes
- Check-in/check-out process < 1 minute
- Background check processing < 24 hours
- 100% visitor tracking accuracy
- Zero security incidents

## File Structure After Implementation

```
imscrc-backend/
├── app/Models/Visitor.php
├── app/Models/Visit.php
├── app/Models/VisitSchedule.php
├── app/Models/BackgroundCheck.php
├── app/Http/Controllers/Api/VisitorController.php
├── app/Http/Controllers/Api/VisitController.php
├── database/migrations/[visitor_tables].php
└── database/seeders/VisitorSeeder.php

imscrc-frontend/
├── src/types/visitor.ts
├── src/services/visitorApi.ts
├── src/components/visitors/
├── src/pages/visitors/
└── src/hooks/useVisitor.ts
```
