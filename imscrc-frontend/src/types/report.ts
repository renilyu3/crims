export interface Report {
  id: number;
  name: string;
  description?: string;
  type: 'pdf' | 'excel' | 'dashboard';
  template_data: {
    fields: string[];
    title?: string;
    layout?: 'default' | 'detailed' | 'summary';
  };
  filters?: Record<string, any>;
  created_by: number;
  is_public: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by_user?: {
    id: number;
    name: string;
  };
  recent_generations?: ReportGeneration[];
}

export interface ReportGeneration {
  id: number;
  report_id?: number;
  report_name: string;
  generated_by: number;
  file_path?: string;
  file_name?: string;
  file_type: 'pdf' | 'xlsx' | 'csv';
  parameters?: Record<string, any>;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  error_message?: string;
  file_size?: number;
  started_at?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
  report?: Report;
  generated_by_user?: {
    id: number;
    name: string;
  };
}

export interface ReportFilters {
  date_range?: {
    start: string;
    end: string;
  };
  status?: string[];
  legal_status?: string[];
  gender?: string;
  custom_fields?: Record<string, any>;
}

export interface ReportTemplate {
  id?: number;
  name: string;
  description?: string;
  type: 'pdf' | 'excel' | 'dashboard';
  template_data: {
    fields: string[];
    title?: string;
    layout?: 'default' | 'detailed' | 'summary';
  };
  filters?: ReportFilters;
  is_public?: boolean;
}

export interface ReportGenerationRequest {
  type: 'pdl_status' | 'pdl_detail' | 'custom' | 'pdl_export' | 'statistics_export';
  report_id?: number;
  pdl_id?: number;
  parameters?: Record<string, any>;
}

export interface ReportStatistics {
  total_reports: number;
  my_reports: number;
  total_generations: number;
  recent_generations: number;
  completed_generations: number;
  failed_generations: number;
  by_type: Record<string, number>;
}

export interface ReportType {
  name: string;
  description: string;
  parameters: Record<string, string>;
}

export interface AvailableReportTypes {
  pdf: Record<string, ReportType>;
  excel: Record<string, ReportType>;
}

// Form interfaces
export interface ReportFormData {
  name: string;
  description: string;
  type: 'pdf' | 'excel' | 'dashboard';
  fields: string[];
  title: string;
  layout: 'default' | 'detailed' | 'summary';
  is_public: boolean;
  filters: ReportFilters;
}

export interface GenerateReportFormData {
  type: 'pdl_status' | 'pdl_detail' | 'custom';
  format: 'pdf' | 'excel';
  report_id?: number;
  pdl_id?: number;
  filters: {
    status: string[];
    legal_status: string[];
    gender: string;
    date_range: {
      start: string;
      end: string;
    };
  };
  fields: string[];
}

// API Response interfaces
export interface ReportsResponse {
  success: boolean;
  data: {
    data: Report[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export interface ReportGenerationsResponse {
  success: boolean;
  data: {
    data: ReportGeneration[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export interface ReportResponse {
  success: boolean;
  data: Report;
  message?: string;
}

export interface ReportGenerationResponse {
  success: boolean;
  data: ReportGeneration;
  message?: string;
}

export interface ReportStatisticsResponse {
  success: boolean;
  data: ReportStatistics;
}

export interface ReportTypesResponse {
  success: boolean;
  data: AvailableReportTypes;
}

// Field options for report builder
export const AVAILABLE_FIELDS = [
  { value: 'pdl_number', label: 'PDL Number' },
  { value: 'name', label: 'Full Name' },
  { value: 'age', label: 'Age' },
  { value: 'gender', label: 'Gender' },
  { value: 'status', label: 'Status' },
  { value: 'legal_status', label: 'Legal Status' },
  { value: 'admission_date', label: 'Admission Date' },
  { value: 'case_number', label: 'Case Number' },
  { value: 'charges', label: 'Charges' },
  { value: 'address', label: 'Address' },
  { value: 'emergency_contact', label: 'Emergency Contact' },
  { value: 'medical_conditions', label: 'Medical Conditions' },
] as const;

export const STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'transferred', label: 'Transferred' },
  { value: 'released', label: 'Released' },
] as const;

export const LEGAL_STATUS_OPTIONS = [
  { value: 'detained', label: 'Detained' },
  { value: 'convicted', label: 'Convicted' },
  { value: 'acquitted', label: 'Acquitted' },
] as const;

export const GENDER_OPTIONS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
] as const;

export const LAYOUT_OPTIONS = [
  { value: 'default', label: 'Default Layout' },
  { value: 'detailed', label: 'Detailed Layout' },
  { value: 'summary', label: 'Summary Layout' },
] as const;
