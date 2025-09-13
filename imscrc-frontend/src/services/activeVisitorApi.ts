import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export interface ActiveVisitor {
  id: number;
  first_name: string;
  last_name: string;
  middle_name?: string;
  phone_number: string;
  email?: string;
  address: string;
  id_type?: string;
  id_number?: string;
  date_of_birth?: string;
  gender?: 'male' | 'female' | 'other';
  pdl_id: number;
  visit_purpose?: string;
  visit_type: 'family' | 'legal' | 'official' | 'emergency';
  check_in_time: string;
  visitor_badge_number?: string;
  checked_in_by: number;
  items_brought?: string[];
  security_screening?: Record<string, any>;
  notes?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  emergency_contact_relationship?: string;
  photo_path?: string;
  created_at: string;
  updated_at: string;
  full_name: string;
  duration_minutes: number;
  is_overdue: boolean;
  pdl?: {
    id: number;
    pdl_number: string;
    first_name: string;
    last_name: string;
  };
  checked_in_by_user?: {
    id: number;
    name: string;
  };
}

export interface ActiveVisitorFormData {
  first_name: string;
  last_name: string;
  middle_name?: string;
  phone_number: string;
  email?: string;
  address: string;
  id_type?: string;
  id_number?: string;
  date_of_birth?: string;
  gender?: 'male' | 'female' | 'other';
  pdl_id: number;
  visit_purpose?: string;
  visit_type: 'family' | 'legal' | 'official' | 'emergency';
  items_brought?: string[];
  security_screening?: Record<string, any>;
  notes?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  emergency_contact_relationship?: string;
}

export interface ActiveVisitorFilters {
  search?: string;
  pdl_id?: number;
  visit_type?: string;
  overdue?: boolean;
  today?: boolean;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  per_page?: number;
  page?: number;
}

export interface ActiveVisitorStatistics {
  total_active: number;
  today_checkins: number;
  overdue_visits: number;
  by_visit_type: Record<string, number>;
  average_duration: number;
}

export const activeVisitorApi = {
  // Get all active visitors with filters
  getActiveVisitors: async (filters?: ActiveVisitorFilters) => {
    const params = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });
    }

    const response = await api.get(`/active-visitors?${params.toString()}`);
    return response.data;
  },

  // Get single active visitor
  getActiveVisitor: async (id: number) => {
    const response = await api.get(`/active-visitors/${id}`);
    return response.data;
  },

  // Check in a visitor (create active visitor)
  checkInVisitor: async (data: ActiveVisitorFormData) => {
    const response = await api.post('/active-visitors', data);
    return response.data;
  },

  // Update active visitor
  updateActiveVisitor: async (id: number, data: Partial<ActiveVisitorFormData>) => {
    const response = await api.put(`/active-visitors/${id}`, data);
    return response.data;
  },

  // Check out visitor (move to history)
  checkOutVisitor: async (id: number, notes?: string) => {
    const response = await api.post(`/active-visitors/${id}/check-out`, {
      notes: notes || ''
    });
    return response.data;
  },

  // Get statistics
  getStatistics: async (): Promise<{ data: ActiveVisitorStatistics }> => {
    const response = await api.get('/active-visitors-statistics');
    return response.data;
  },

  // Upload photo
  uploadPhoto: async (id: number, photo: File) => {
    const formData = new FormData();
    formData.append('photo', photo);
    
    const response = await api.post(`/active-visitors/${id}/photo`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Delete photo
  deletePhoto: async (id: number) => {
    const response = await api.delete(`/active-visitors/${id}/photo`);
    return response.data;
  },
};

export default activeVisitorApi;
