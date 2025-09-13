export interface ScheduleType {
  id: number;
  name: string;
  display_name: string;
  color: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Facility {
  id: number;
  name: string;
  type: string;
  description?: string;
  capacity: number;
  available_hours?: Record<string, string[]>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Program {
  id: number;
  name: string;
  type: string;
  description?: string;
  duration_minutes: number;
  max_participants: number;
  instructor?: string;
  requirements?: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Schedule {
  id: number;
  schedule_type_id: number;
  pdl_id: number;
  facility_id?: number;
  program_id?: number;
  visitor_id?: number;
  title: string;
  description?: string;
  start_datetime: string;
  end_datetime: string;
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'rescheduled';
  location?: string;
  responsible_officer?: string;
  additional_data?: Record<string, any>;
  notes?: string;
  created_by: number;
  updated_by?: number;
  created_at: string;
  updated_at: string;
  
  // Relationships
  schedule_type?: ScheduleType;
  pdl?: {
    id: number;
    first_name: string;
    last_name: string;
    pdl_number: string;
  };
  facility?: Facility;
  program?: Program;
  visitor?: {
    id: number;
    first_name: string;
    last_name: string;
  };
  creator?: {
    id: number;
    name: string;
  };
  updater?: {
    id: number;
    name: string;
  };
  
  // Computed properties
  duration?: number;
  is_past?: boolean;
  is_active?: boolean;
  formatted_date_range?: string;
}

export interface ScheduleConflict {
  id: number;
  schedule_1_id: number;
  schedule_2_id: number;
  conflict_type: 'pdl_double_booking' | 'facility_double_booking' | 'officer_conflict' | 'resource_conflict';
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'detected' | 'acknowledged' | 'resolved' | 'ignored';
  resolution_notes?: string;
  resolved_by?: number;
  resolved_at?: string;
  created_at: string;
  updated_at: string;
  
  // Relationships
  schedule1?: Schedule;
  schedule2?: Schedule;
  resolver?: {
    id: number;
    name: string;
  };
  
  // Computed properties
  severity_color?: string;
  conflict_type_display?: string;
}

export interface ScheduleFormData {
  schedule_type_id: number;
  pdl_id: number;
  facility_id?: number;
  program_id?: number;
  visitor_id?: number;
  title: string;
  description?: string;
  start_datetime: string;
  end_datetime: string;
  location?: string;
  responsible_officer?: string;
  notes?: string;
  additional_data?: Record<string, any>;
}

export interface CalendarEvent {
  id: number;
  title: string;
  start: string;
  end: string;
  color: string;
  type: string;
  pdl: string;
  facility?: string;
  status: string;
  location?: string;
}

export interface ConflictCheckRequest {
  pdl_id: number;
  facility_id?: number;
  start_datetime: string;
  end_datetime: string;
  exclude_schedule_id?: number;
}

export interface ConflictCheckResponse {
  available: boolean;
  conflicts: string[];
}

export interface ScheduleStatistics {
  total_schedules: number;
  today_schedules: number;
  upcoming_schedules: number;
  completed_schedules: number;
  cancelled_schedules: number;
  schedules_by_type: Record<string, number>;
  schedules_by_status: Record<string, number>;
}

export interface ConflictStatistics {
  total_conflicts: number;
  unresolved_conflicts: number;
  critical_conflicts: number;
  conflicts_by_type: Record<string, number>;
  conflicts_by_severity: Record<string, number>;
}

export interface ScheduleFilters {
  start_date?: string;
  end_date?: string;
  pdl_id?: number;
  type_id?: number;
  status?: string;
  facility_id?: number;
}

export interface PaginatedSchedules {
  data: Schedule[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
}

export interface PaginatedConflicts {
  data: ScheduleConflict[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
}
