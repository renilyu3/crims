export interface PDL {
  id: number;
  pdl_number: string;
  first_name: string;
  middle_name?: string;
  last_name: string;
  aliases?: string[];
  date_of_birth: string;
  place_of_birth: string;
  gender: 'male' | 'female' | 'other';
  civil_status: 'single' | 'married' | 'divorced' | 'widowed' | 'separated';
  nationality: string;
  religion?: string;
  address: {
    current: string;
    permanent?: string;
  };
  contact_information?: {
    phone?: string;
    email?: string;
  };
  emergency_contacts?: EmergencyContact[];
  physical_characteristics?: {
    height?: string;
    weight?: string;
    identifying_marks?: string;
  };
  case_number: string;
  charges: string[];
  court_information?: {
    court_name?: string;
    judge?: string;
  };
  sentence_details?: {
    sentence?: string;
    date_sentenced?: string;
  };
  legal_status: 'detained' | 'convicted' | 'acquitted' | 'transferred' | 'released';
  admission_date: string;
  admission_time: string;
  arresting_officer?: string;
  arresting_agency?: string;
  property_inventory?: Record<string, string>;
  medical_screening?: {
    blood_pressure?: string;
    temperature?: string;
    medical_conditions?: string;
    medications?: string;
  };
  status: 'active' | 'transferred' | 'released' | 'deceased';
  photos?: string[];
  cell_assignment?: string;
  notes?: string;
  created_by: number;
  updated_by?: number;
  created_at: string;
  updated_at: string;
  // Computed attributes
  full_name: string;
  age: number;
  primary_photo?: string;
  // Relationships
  created_by_user?: {
    id: number;
    name: string;
  };
  updated_by_user?: {
    id: number;
    name: string;
  };
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
  address?: string;
}

export interface PDLFormData {
  first_name: string;
  middle_name?: string;
  last_name: string;
  aliases?: string[];
  date_of_birth: string;
  place_of_birth: string;
  gender: 'male' | 'female' | 'other';
  civil_status: 'single' | 'married' | 'divorced' | 'widowed' | 'separated';
  nationality: string;
  religion?: string;
  address: {
    current: string;
    permanent?: string;
  };
  contact_information?: {
    phone?: string;
    email?: string;
  };
  emergency_contacts?: EmergencyContact[];
  physical_characteristics?: {
    height?: string;
    weight?: string;
    identifying_marks?: string;
  };
  case_number: string;
  charges: string[];
  court_information?: {
    court_name?: string;
    judge?: string;
  };
  sentence_details?: {
    sentence?: string;
    date_sentenced?: string;
  };
  legal_status: 'detained' | 'convicted' | 'acquitted' | 'transferred' | 'released';
  admission_date: string;
  admission_time: string;
  arresting_officer?: string;
  arresting_agency?: string;
  property_inventory?: Record<string, string>;
  medical_screening?: {
    blood_pressure?: string;
    temperature?: string;
    medical_conditions?: string;
    medications?: string;
  };
  status: 'active' | 'transferred' | 'released' | 'deceased';
  cell_assignment?: string;
  notes?: string;
}

export interface PDLSearchParams {
  search?: string;
  status?: string;
  legal_status?: string;
  admission_date_from?: string;
  admission_date_to?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  per_page?: number;
  page?: number;
}

export interface PDLStatistics {
  total_pdls: number;
  active_pdls: number;
  detained: number;
  convicted: number;
  transferred: number;
  released: number;
  recent_admissions: number;
  by_gender: {
    male: number;
    female: number;
    other: number;
  };
  by_legal_status: Record<string, number>;
}

export interface PDLPaginatedResponse {
  data: PDL[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  errors?: Record<string, string[]>;
}
