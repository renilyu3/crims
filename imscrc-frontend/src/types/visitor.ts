export interface Address {
  street: string;
  barangay?: string;
  city: string;
  province: string;
  postal_code?: string;
}

export interface ContactInfo {
  phone: string;
  email?: string;
}

export interface EmergencyContact {
  name: string;
  phone: string;
  relationship: string;
}

export interface Visitor {
  id: number;
  visitor_number: string;
  first_name: string;
  middle_name?: string;
  last_name: string;
  full_name: string;
  id_type: string;
  id_number: string;
  date_of_birth: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  address: Address;
  contact_information: ContactInfo;
  emergency_contact?: EmergencyContact;
  photo_path?: string;
  background_check_status: 'pending' | 'cleared' | 'flagged' | 'denied';
  background_check_date?: string;
  background_check_expiry?: string;
  is_background_check_expired: boolean;
  risk_level: 'low' | 'medium' | 'high';
  is_restricted: boolean;
  restriction_reason?: string;
  notes?: string;
  visit_count: number;
  created_at: string;
  updated_at: string;
  created_by?: {
    id: number;
    name: string;
  };
  updated_by?: {
    id: number;
    name: string;
  };
}

export interface Visit {
  id: number;
  visit_number: string;
  visitor_id: number;
  pdl_id: number;
  visitor?: Visitor;
  pdl?: {
    id: number;
    pdl_number: string;
    first_name: string;
    last_name: string;
  };
  visit_type: 'family' | 'legal' | 'official' | 'emergency';
  visit_purpose: string;
  scheduled_date: string;
  scheduled_time: string;
  scheduled_datetime: string;
  actual_start_time?: string;
  actual_end_time?: string;
  status: 'scheduled' | 'approved' | 'denied' | 'in_progress' | 'completed' | 'cancelled';
  approval_status: 'pending' | 'approved' | 'denied';
  approved_by?: {
    id: number;
    name: string;
  };
  approval_date?: string;
  approval_notes?: string;
  check_in_time?: string;
  check_out_time?: string;
  visitor_badge_number?: string;
  checked_in_by?: {
    id: number;
    name: string;
  };
  checked_out_by?: {
    id: number;
    name: string;
  };
  items_brought?: string[];
  security_screening?: {
    metal_detector: boolean;
    bag_search: boolean;
    pat_down: boolean;
    notes?: string;
  };
  visit_notes?: string;
  incident_notes?: string;
  duration_minutes?: number;
  is_overdue: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by?: {
    id: number;
    name: string;
  };
}

export interface VisitSchedule {
  id: number;
  date: string;
  start_time: string;
  end_time: string;
  time_slot_label: string;
  max_capacity: number;
  current_bookings: number;
  available_slots: number;
  is_available: boolean;
  is_full: boolean;
  allowed_visit_types?: string[];
  is_holiday: boolean;
  is_maintenance: boolean;
  special_notes?: string;
  duration_minutes: number;
  created_at: string;
  updated_at: string;
}

export interface BackgroundCheck {
  id: number;
  visitor_id: number;
  check_type: 'initial' | 'renewal' | 'update' | 'appeal';
  check_date: string;
  expiry_date?: string;
  check_result?: {
    criminal_history: boolean;
    watchlist_match: boolean;
    previous_incidents: boolean;
    verification_status: string;
  };
  status: 'pending' | 'in_progress' | 'cleared' | 'flagged' | 'denied';
  risk_assessment?: 'low' | 'medium' | 'high';
  criminal_history: boolean;
  watchlist_match: boolean;
  previous_incidents: boolean;
  flags?: string[];
  checked_by?: {
    id: number;
    name: string;
  };
  approved_by?: {
    id: number;
    name: string;
  };
  completed_date?: string;
  notes?: string;
  recommendations?: string;
  external_reference_number?: string;
  external_data?: any;
  is_expired: boolean;
  days_until_expiry?: number;
  is_pending: boolean;
  is_cleared: boolean;
  created_at: string;
  updated_at: string;
}

export interface VisitorStatistics {
  total_visitors: number;
  active_visitors: number;
  restricted_visitors: number;
  pending_background_checks: number;
  cleared_visitors: number;
  flagged_visitors: number;
  expired_background_checks: number;
  recent_registrations: number;
  by_risk_level: {
    low: number;
    medium: number;
    high: number;
  };
  by_background_status: {
    [key: string]: number;
  };
}

export interface VisitStatistics {
  total_visits: number;
  today_visits: number;
  active_visits: number;
  pending_approval: number;
  completed_today: number;
  overdue_visits: number;
  by_status: {
    [key: string]: number;
  };
  by_visit_type: {
    [key: string]: number;
  };
  by_approval_status: {
    [key: string]: number;
  };
}

export interface VisitorFormData {
  first_name: string;
  middle_name?: string;
  last_name: string;
  id_type: string;
  id_number: string;
  date_of_birth: string;
  gender: 'male' | 'female' | 'other';
  address: Address;
  contact_information: ContactInfo;
  emergency_contact?: EmergencyContact;
  notes?: string;
}

export interface VisitFormData {
  visitor_id: number;
  pdl_id: number;
  visit_type: 'family' | 'legal' | 'official' | 'emergency';
  visit_purpose: string;
  scheduled_date: string;
  scheduled_time: string;
  items_brought?: string[];
  visit_notes?: string;
}

export interface CheckInData {
  security_screening?: {
    metal_detector: boolean;
    bag_search: boolean;
    pat_down: boolean;
    notes?: string;
  };
  items_brought?: string[];
  notes?: string;
}

export interface CheckOutData {
  visit_notes?: string;
  incident_notes?: string;
}
