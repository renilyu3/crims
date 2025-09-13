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

export interface VisitorCheckin {
  id: number;
  first_name: string;
  last_name: string;
  phone_number: string;
  address: string;
  check_in_time: string;
  check_out_time?: string;
  status: 'active' | 'completed';
  duration_minutes?: number;
  notes?: string;
  checked_in_by: number;
  checked_out_by?: number;
  created_at: string;
  updated_at: string;
  full_name: string;
  is_active: boolean;
  formatted_duration?: string;
  checked_in_by_user?: {
    id: number;
    name: string;
  };
  checked_out_by_user?: {
    id: number;
    name: string;
  };
}

export interface CheckinFormData {
  first_name: string;
  last_name: string;
  phone_number: string;
  address: string;
  notes?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
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
}

export interface VisitorCheckinStatistics {
  total_checkins: number;
  active_visitors: number;
  today_checkins: number;
  completed_today: number;
  by_status: {
    active?: number;
    completed?: number;
  };
}

export const visitorCheckinApi = {
  // Get all visitor check-ins with pagination and filtering
  async getCheckins(params?: {
    page?: number;
    per_page?: number;
    status?: 'active' | 'completed';
    search?: string;
    date_from?: string;
    date_to?: string;
    today?: boolean;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
  }): Promise<ApiResponse<PaginatedResponse<VisitorCheckin>>> {
    const response = await api.get('/visitor-checkins', { params });
    return response.data;
  },

  // Check in a new visitor
  async checkIn(data: CheckinFormData): Promise<ApiResponse<VisitorCheckin>> {
    const response = await api.post('/visitor-checkins/check-in', data);
    return response.data;
  },

  // Check out a visitor
  async checkOut(id: number, notes?: string): Promise<ApiResponse<VisitorCheckin>> {
    const response = await api.post(`/visitor-checkins/${id}/check-out`, { notes });
    return response.data;
  },

  // Get active visitors (currently checked in)
  async getActiveVisitors(): Promise<ApiResponse<VisitorCheckin[]>> {
    const response = await api.get('/visitor-checkins/active');
    return response.data;
  },

  // Get visitor check-in statistics
  async getStatistics(): Promise<ApiResponse<VisitorCheckinStatistics>> {
    const response = await api.get('/visitor-checkins/statistics');
    return response.data;
  },

  // Get a specific visitor check-in record
  async getCheckin(id: number): Promise<ApiResponse<VisitorCheckin>> {
    const response = await api.get(`/visitor-checkins/${id}`);
    return response.data;
  },

  // Delete a visitor check-in record
  async deleteCheckin(id: number): Promise<ApiResponse<null>> {
    const response = await api.delete(`/visitor-checkins/${id}`);
    return response.data;
  },
};

export default visitorCheckinApi;
