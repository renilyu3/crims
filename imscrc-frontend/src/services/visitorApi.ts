import { api } from '../lib/api';
import type { 
  Visitor, 
  Visit, 
  VisitorStatistics, 
  VisitStatistics, 
  VisitorFormData, 
  VisitFormData,
  CheckInData,
  CheckOutData
} from '../types/visitor';

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

// Visitor API functions
export const visitorApi = {
  // Get all visitors with pagination and filters
  getVisitors: async (params?: {
    page?: number;
    per_page?: number;
    search?: string;
    background_status?: string;
    is_restricted?: string;
    risk_level?: string;
    registration_date_from?: string;
    registration_date_to?: string;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
  }): Promise<ApiResponse<PaginatedResponse<Visitor>>> => {
    const response = await api.get('/visitors', { params });
    return response.data;
  },

  // Get single visitor
  getVisitor: async (id: number): Promise<ApiResponse<Visitor>> => {
    const response = await api.get(`/visitors/${id}`);
    return response.data;
  },

  // Create new visitor
  createVisitor: async (data: VisitorFormData): Promise<ApiResponse<Visitor>> => {
    const response = await api.post('/visitors', data);
    return response.data;
  },

  // Update visitor
  updateVisitor: async (id: number, data: Partial<VisitorFormData>): Promise<ApiResponse<Visitor>> => {
    const response = await api.put(`/visitors/${id}`, data);
    return response.data;
  },

  // Delete/restrict visitor
  deleteVisitor: async (id: number): Promise<ApiResponse<void>> => {
    const response = await api.delete(`/visitors/${id}`);
    return response.data;
  },

  // Search visitors
  searchVisitors: async (query: string): Promise<ApiResponse<Visitor[]>> => {
    const response = await api.get('/visitors-search', { params: { q: query } });
    return response.data;
  },

  // Get visitor statistics
  getVisitorStatistics: async (): Promise<ApiResponse<VisitorStatistics>> => {
    const response = await api.get('/visitors-statistics');
    return response.data;
  },

  // Get eligible visitors (for visits)
  getEligibleVisitors: async (): Promise<ApiResponse<Visitor[]>> => {
    const response = await api.get('/visitors-eligible');
    return response.data;
  },

  // Upload visitor photo
  uploadVisitorPhoto: async (id: number, photo: File): Promise<ApiResponse<{ photo_path: string; photo_url: string }>> => {
    const formData = new FormData();
    formData.append('photo', photo);
    const response = await api.post(`/visitors/${id}/photo`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Delete visitor photo
  deleteVisitorPhoto: async (id: number): Promise<ApiResponse<void>> => {
    const response = await api.delete(`/visitors/${id}/photo`);
    return response.data;
  },
};

// Visit API functions
export const visitApi = {
  // Get all visits with pagination and filters
  getVisits: async (params?: {
    page?: number;
    per_page?: number;
    status?: string;
    approval_status?: string;
    visit_type?: string;
    date_from?: string;
    date_to?: string;
    visitor_id?: number;
    pdl_id?: number;
    today?: boolean;
    active?: boolean;
    pending_approval?: boolean;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
  }): Promise<ApiResponse<PaginatedResponse<Visit>>> => {
    const response = await api.get('/visits', { params });
    return response.data;
  },

  // Get single visit
  getVisit: async (id: number): Promise<ApiResponse<Visit>> => {
    const response = await api.get(`/visits/${id}`);
    return response.data;
  },

  // Create new visit
  createVisit: async (data: VisitFormData): Promise<ApiResponse<Visit>> => {
    const response = await api.post('/visits', data);
    return response.data;
  },

  // Update visit
  updateVisit: async (id: number, data: Partial<VisitFormData>): Promise<ApiResponse<Visit>> => {
    const response = await api.put(`/visits/${id}`, data);
    return response.data;
  },

  // Cancel visit
  cancelVisit: async (id: number): Promise<ApiResponse<void>> => {
    const response = await api.delete(`/visits/${id}`);
    return response.data;
  },

  // Check in visitor
  checkInVisitor: async (id: number, data: CheckInData): Promise<ApiResponse<Visit>> => {
    const response = await api.post(`/visits/${id}/check-in`, data);
    return response.data;
  },

  // Check out visitor
  checkOutVisitor: async (id: number, data: CheckOutData): Promise<ApiResponse<Visit>> => {
    const response = await api.post(`/visits/${id}/check-out`, data);
    return response.data;
  },

  // Approve visit
  approveVisit: async (id: number, notes?: string): Promise<ApiResponse<Visit>> => {
    const response = await api.post(`/visits/${id}/approve`, { notes });
    return response.data;
  },

  // Deny visit
  denyVisit: async (id: number, reason: string): Promise<ApiResponse<Visit>> => {
    const response = await api.post(`/visits/${id}/deny`, { reason });
    return response.data;
  },

  // Get visit statistics
  getVisitStatistics: async (): Promise<ApiResponse<VisitStatistics>> => {
    const response = await api.get('/visits-statistics');
    return response.data;
  },

  // Get active visits
  getActiveVisits: async (): Promise<ApiResponse<Visit[]>> => {
    const response = await api.get('/visits-active');
    return response.data;
  },
};

// Helper functions
export const visitorHelpers = {
  // Format visitor name
  formatVisitorName: (visitor: Visitor): string => {
    return visitor.full_name || `${visitor.first_name} ${visitor.middle_name ? visitor.middle_name + ' ' : ''}${visitor.last_name}`;
  },

  // Get background check status badge class
  getBackgroundStatusClass: (status: string): string => {
    switch (status) {
      case 'cleared':
        return 'bg-success';
      case 'flagged':
        return 'bg-warning';
      case 'denied':
        return 'bg-danger';
      case 'pending':
        return 'bg-secondary';
      default:
        return 'bg-secondary';
    }
  },

  // Get risk level badge class
  getRiskLevelClass: (level: string): string => {
    switch (level) {
      case 'low':
        return 'bg-success';
      case 'medium':
        return 'bg-warning';
      case 'high':
        return 'bg-danger';
      default:
        return 'bg-secondary';
    }
  },

  // Get visit status badge class
  getVisitStatusClass: (status: string): string => {
    switch (status) {
      case 'completed':
        return 'bg-success';
      case 'in_progress':
        return 'bg-primary';
      case 'approved':
        return 'bg-info';
      case 'scheduled':
        return 'bg-secondary';
      case 'denied':
        return 'bg-danger';
      case 'cancelled':
        return 'bg-dark';
      default:
        return 'bg-secondary';
    }
  },

  // Get approval status badge class
  getApprovalStatusClass: (status: string): string => {
    switch (status) {
      case 'approved':
        return 'bg-success';
      case 'denied':
        return 'bg-danger';
      case 'pending':
        return 'bg-warning';
      default:
        return 'bg-secondary';
    }
  },

  // Format visit type
  formatVisitType: (type: string): string => {
    switch (type) {
      case 'family':
        return 'Family Visit';
      case 'legal':
        return 'Legal Consultation';
      case 'official':
        return 'Official Visit';
      case 'emergency':
        return 'Emergency Visit';
      default:
        return type;
    }
  },

  // Check if visitor can visit
  canVisitorVisit: (visitor: Visitor): boolean => {
    return !visitor.is_restricted && 
           visitor.background_check_status === 'cleared' && 
           !visitor.is_background_check_expired;
  },

  // Format duration
  formatDuration: (minutes?: number): string => {
    if (!minutes) return 'N/A';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  },

  // Format date and time
  formatDateTime: (dateTime: string): string => {
    return new Date(dateTime).toLocaleString();
  },

  // Format date only
  formatDate: (date: string): string => {
    return new Date(date).toLocaleDateString();
  },

  // Format time only
  formatTime: (time: string): string => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  },
};
