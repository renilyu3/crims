# PDL Management Module - Development Plan

## Overview

Building Option A: PDL Management Module for the IMSCRC system. This module will handle the complete lifecycle of Person Deprived of Liberty (PDL) records including registration, profile management, search/filtering, and photo uploads.

## Current State Analysis

✅ **Completed (Phase 1):**

- Laravel 10 backend with Sanctum authentication
- React 18 + TypeScript frontend with Bootstrap
- Basic database structure (empty pdls table)
- User authentication system
- Role-based access control
- API infrastructure setup

## PDL Management Module Features

### 1. PDL Registration Form

- **Personal Information**
  - Full name, aliases, date of birth
  - Address, contact information
  - Emergency contacts
  - Physical characteristics (height, weight, identifying marks)
- **Legal Information**
  - Case number, charges
  - Court information
  - Sentence details
  - Legal status (detained, convicted, etc.)
- **Admission Details**
  - Admission date and time
  - Arresting officer/agency
  - Property inventory
  - Medical screening results
- **Photo Upload**
  - Mugshot (front and side profile)
  - File validation and storage
  - Image resizing and optimization

### 2. PDL Profile Management

- **View PDL Details**
  - Complete profile display
  - Photo gallery
  - Legal history timeline
  - Current status indicators
- **Edit PDL Information**
  - Form validation
  - Audit trail for changes
  - Permission-based editing
  - Photo updates

### 3. Search and Filtering System

- **Search Capabilities**
  - Name search (full name, aliases)
  - Case number search
  - ID number search
  - Advanced search with multiple criteria
- **Filtering Options**
  - Legal status filter
  - Date range filters
  - Case type filters
  - Location/cell assignment filters
- **Results Display**
  - Paginated results
  - Sortable columns
  - Quick action buttons
  - Export functionality

### 4. Photo Management

- **Upload System**
  - Multiple file upload
  - Image validation (format, size)
  - Automatic resizing
  - Secure storage
- **Photo Gallery**
  - Thumbnail view
  - Full-size preview
  - Photo metadata
  - Delete/replace functionality

## Technical Implementation Plan

### Backend Development (Laravel)

#### 1. Database Schema Enhancement

```sql
-- Enhanced PDLs table structure
pdls:
- id (primary key)
- pdl_number (unique identifier)
- first_name, middle_name, last_name
- aliases (JSON)
- date_of_birth, place_of_birth
- gender, civil_status
- nationality, religion
- address (JSON - current, permanent)
- contact_information (JSON)
- emergency_contacts (JSON)
- physical_characteristics (JSON)
- case_number, charges (JSON)
- court_information (JSON)
- sentence_details (JSON)
- legal_status
- admission_date, admission_time
- arresting_officer, arresting_agency
- medical_screening (JSON)
- status (active, transferred, released)
- photos (JSON - file paths)
- created_by, updated_by
- timestamps
```

#### 2. Model Development

- **PDL Model** with relationships and validation
- **Photo Model** for image management
- **Audit Trail Model** for change tracking

#### 3. API Controllers

- **PDLController** - CRUD operations
- **PDLSearchController** - Search and filtering
- **PDLPhotoController** - Photo management
- **PDLReportController** - Data export

#### 4. API Routes

```php
// PDL Management Routes
Route::middleware('auth:sanctum')->group(function () {
    // PDL CRUD
    Route::apiResource('pdls', PDLController::class);

    // Search and filtering
    Route::get('pdls/search', [PDLSearchController::class, 'search']);
    Route::get('pdls/filter', [PDLSearchController::class, 'filter']);

    // Photo management
    Route::post('pdls/{pdl}/photos', [PDLPhotoController::class, 'upload']);
    Route::delete('pdls/{pdl}/photos/{photo}', [PDLPhotoController::class, 'delete']);

    // Reports and exports
    Route::get('pdls/export', [PDLReportController::class, 'export']);
});
```

#### 5. File Storage Configuration

- Configure storage for PDL photos
- Image processing and optimization
- Security measures for file access

### Frontend Development (React + TypeScript)

#### 1. Type Definitions

```typescript
// PDL Types
interface PDL {
  id: number;
  pdl_number: string;
  first_name: string;
  middle_name?: string;
  last_name: string;
  aliases?: string[];
  date_of_birth: string;
  // ... other fields
}

interface PDLFormData {
  // Form-specific interface
}

interface SearchFilters {
  // Search and filter interface
}
```

#### 2. Components Structure

```
src/components/pdl/
├── PDLRegistrationForm.tsx
├── PDLProfileView.tsx
├── PDLEditForm.tsx
├── PDLSearchBar.tsx
├── PDLFilterPanel.tsx
├── PDLList.tsx
├── PDLCard.tsx
├── PhotoUpload.tsx
├── PhotoGallery.tsx
└── PDLExport.tsx
```

#### 3. Pages Structure

```
src/pages/pdl/
├── PDLDashboard.tsx
├── PDLRegistration.tsx
├── PDLProfile.tsx
├── PDLSearch.tsx
└── PDLManagement.tsx
```

#### 4. API Services

```typescript
// PDL API Services
export const pdlApi = {
  create: (data: PDLFormData) => api.post("/pdls", data),
  getAll: (params?: SearchParams) => api.get("/pdls", { params }),
  getById: (id: number) => api.get(`/pdls/${id}`),
  update: (id: number, data: PDLFormData) => api.put(`/pdls/${id}`, data),
  delete: (id: number) => api.delete(`/pdls/${id}`),
  search: (query: string) => api.get(`/pdls/search?q=${query}`),
  uploadPhoto: (id: number, file: File) =>
    api.post(`/pdls/${id}/photos`, formData),
};
```

## Development Phases

### Phase 1: Database and Models (Week 1)

1. ✅ Enhance PDL migration with complete schema
2. ✅ Create PDL model with relationships
3. ✅ Create photo management system
4. ✅ Set up file storage configuration

### Phase 2: Backend API Development (Week 1-2)

1. ✅ PDL CRUD controller
2. ✅ Search and filtering functionality
3. ✅ Photo upload/management API
4. ✅ Validation and error handling
5. ✅ API testing

### Phase 3: Frontend Core Components (Week 2-3)

1. ✅ PDL registration form
2. ✅ PDL profile view/edit
3. ✅ Photo upload component
4. ✅ Basic search functionality

### Phase 4: Advanced Features (Week 3-4)

1. ✅ Advanced search and filtering
2. ✅ Photo gallery management
3. ✅ Data export functionality
4. ✅ Responsive design optimization

### Phase 5: Integration and Testing (Week 4)

1. ✅ End-to-end testing
2. ✅ Performance optimization
3. ✅ Security review
4. ✅ Documentation

## Security Considerations

- File upload validation and sanitization
- Image processing security
- Access control for PDL data
- Audit trail for all changes
- Data encryption for sensitive information

## Performance Optimizations

- Image optimization and caching
- Database indexing for search
- Pagination for large datasets
- Lazy loading for photos
- API response caching

## Success Metrics

- PDL registration time < 5 minutes
- Search results < 2 seconds
- Photo upload < 30 seconds
- 99.9% data accuracy
- Zero security vulnerabilities

## Next Steps After Completion

This module will integrate with:

- Visitors Log Module (Option B)
- Scheduling System (Option C)
- Reporting Module (Option D)
- Advanced Features (Option E)

## File Structure After Implementation

```
imscrc-backend/
├── app/Models/PDL.php
├── app/Http/Controllers/Api/PDLController.php
├── app/Http/Controllers/Api/PDLSearchController.php
├── app/Http/Controllers/Api/PDLPhotoController.php
├── database/migrations/[enhanced_pdls_table].php
└── storage/app/pdl-photos/

imscrc-frontend/
├── src/types/pdl.ts
├── src/services/pdlApi.ts
├── src/components/pdl/
├── src/pages/pdl/
└── src/hooks/usePDL.ts
```
