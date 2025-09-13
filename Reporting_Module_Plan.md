# IMSCRC Reporting Module Development Plan

## Overview

The Reporting Module will provide comprehensive reporting capabilities for the IMSCRC system, including PDF generation, Excel exports, statistical reports, and a custom report builder.

## Features to Implement

### 1. PDF Report Generation

- **PDL Status Reports**: Individual and bulk PDL status reports
- **Incident Reports**: Detailed incident documentation
- **Transfer Reports**: PDL transfer documentation
- **Court Appearance Reports**: Legal proceeding summaries
- **Medical Reports**: Health screening and medical history
- **Disciplinary Reports**: Behavioral incidents and actions taken

### 2. Excel Export Functionality

- **PDL Database Export**: Complete or filtered PDL records
- **Statistical Data Export**: Aggregated data for analysis
- **Custom Query Export**: User-defined data exports
- **Scheduled Reports**: Automated periodic exports

### 3. Status Reports and Statistics

- **Dashboard Statistics**: Real-time system metrics
- **Population Reports**: Current facility population analysis
- **Legal Status Breakdown**: Detained vs convicted statistics
- **Admission/Release Trends**: Historical data analysis
- **Case Status Reports**: Legal proceeding progress
- **Facility Utilization**: Cell occupancy and capacity reports

### 4. Custom Report Builder

- **Drag-and-Drop Interface**: Visual report designer
- **Field Selection**: Choose specific data fields
- **Filter Options**: Date ranges, status filters, custom criteria
- **Template Management**: Save and reuse report templates
- **Scheduled Generation**: Automated report creation

## Technical Implementation

### Backend Components

#### 1. Database Structure

```sql
-- Reports table for saved report templates
CREATE TABLE reports (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    type ENUM('pdf', 'excel', 'dashboard') NOT NULL,
    template_data JSON NOT NULL,
    filters JSON,
    created_by BIGINT,
    is_public BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Report generations log
CREATE TABLE report_generations (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    report_id BIGINT,
    generated_by BIGINT,
    file_path VARCHAR(500),
    parameters JSON,
    status ENUM('pending', 'completed', 'failed') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 2. Laravel Packages Required

- **dompdf/dompdf**: PDF generation
- **maatwebsite/excel**: Excel export functionality
- **barryvdh/laravel-dompdf**: Laravel PDF wrapper

#### 3. Controllers and Services

- `ReportController`: Main reporting endpoints
- `PDFReportService`: PDF generation service
- `ExcelReportService`: Excel export service
- `StatisticsService`: Data aggregation service
- `ReportBuilderService`: Custom report creation

### Frontend Components

#### 1. React Components

- `ReportsPage`: Main reports dashboard
- `ReportBuilder`: Custom report creation interface
- `ReportViewer`: Display generated reports
- `StatisticsDashboard`: Real-time statistics
- `ExportModal`: Export configuration dialog

#### 2. Report Types Interface

```typescript
interface ReportTemplate {
  id: number;
  name: string;
  description: string;
  type: "pdf" | "excel" | "dashboard";
  template_data: any;
  filters: ReportFilters;
  is_public: boolean;
}

interface ReportFilters {
  date_range?: {
    start: string;
    end: string;
  };
  status?: string[];
  legal_status?: string[];
  custom_fields?: Record<string, any>;
}
```

## Implementation Phases

### Phase 1: Basic PDF Reports (Week 1)

1. Install and configure PDF generation packages
2. Create basic PDL status report template
3. Implement PDF generation service
4. Create report controller endpoints
5. Build basic frontend report viewer

### Phase 2: Excel Export System (Week 2)

1. Install Excel export packages
2. Create Excel export service
3. Implement data transformation utilities
4. Build export configuration interface
5. Add bulk export functionality

### Phase 3: Statistics Dashboard (Week 3)

1. Create statistics aggregation service
2. Build real-time dashboard components
3. Implement chart visualization
4. Add filtering and date range selection
5. Create automated refresh system

### Phase 4: Custom Report Builder (Week 4)

1. Design drag-and-drop interface
2. Implement field selection system
3. Create filter configuration
4. Build template save/load functionality
5. Add report scheduling system

## File Structure

```
Backend:
├── app/Http/Controllers/Api/ReportController.php
├── app/Services/
│   ├── PDFReportService.php
│   ├── ExcelReportService.php
│   ├── StatisticsService.php
│   └── ReportBuilderService.php
├── app/Models/
│   ├── Report.php
│   └── ReportGeneration.php
├── database/migrations/
│   ├── create_reports_table.php
│   └── create_report_generations_table.php
├── resources/views/reports/
│   ├── pdl_status.blade.php
│   ├── incident_report.blade.php
│   └── statistics_summary.blade.php
└── storage/app/reports/ (generated files)

Frontend:
├── src/pages/reports/
│   ├── ReportsPage.tsx
│   ├── ReportBuilder.tsx
│   ├── ReportViewer.tsx
│   └── StatisticsDashboard.tsx
├── src/components/reports/
│   ├── ReportCard.tsx
│   ├── ExportModal.tsx
│   ├── FilterPanel.tsx
│   └── ChartComponents.tsx
├── src/services/
│   └── reportApi.ts
└── src/types/
    └── report.ts
```

## Security Considerations

- Role-based access control for sensitive reports
- Audit trail for all report generations
- Secure file storage and access
- Data anonymization options
- Export limitations based on user permissions

## Performance Optimization

- Background job processing for large reports
- Caching for frequently accessed statistics
- Pagination for large datasets
- Optimized database queries
- File compression for exports

This comprehensive reporting module will provide powerful analytics and documentation capabilities for the IMSCRC system.
