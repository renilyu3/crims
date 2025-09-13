import api from '../lib/api';
import type { 
  PDL, 
  PDLFormData, 
  PDLSearchParams, 
  PDLStatistics, 
  PDLPaginatedResponse, 
  ApiResponse 
} from '../types/pdl';

export const pdlApi = {
  // Get all PDLs with pagination and filtering
  getAll: async (params?: PDLSearchParams): Promise<ApiResponse<PDLPaginatedResponse>> => {
    const response = await api.get('/pdls', { params });
    return response.data;
  },

  // Get single PDL by ID
  getById: async (id: number): Promise<ApiResponse<PDL>> => {
    const response = await api.get(`/pdls/${id}`);
    return response.data;
  },

  // Create new PDL
  create: async (data: PDLFormData): Promise<ApiResponse<PDL>> => {
    const response = await api.post('/pdls', data);
    return response.data;
  },

  // Update existing PDL
  update: async (id: number, data: Partial<PDLFormData>): Promise<ApiResponse<PDL>> => {
    const response = await api.put(`/pdls/${id}`, data);
    return response.data;
  },

  // Delete PDL (soft delete)
  delete: async (id: number): Promise<ApiResponse<null>> => {
    const response = await api.delete(`/pdls/${id}`);
    return response.data;
  },

  // Search PDLs
  search: async (query: string): Promise<ApiResponse<PDL[]>> => {
    const response = await api.get('/pdls-search', { params: { q: query } });
    return response.data;
  },

  // Get PDL statistics
  getStatistics: async (): Promise<ApiResponse<PDLStatistics>> => {
    const response = await api.get('/pdls-statistics');
    return response.data;
  },

  // Upload photo for PDL
  uploadPhoto: async (id: number, file: File): Promise<ApiResponse<{ photo_path: string; photo_url: string }>> => {
    const formData = new FormData();
    formData.append('photo', file);
    
    const response = await api.post(`/pdls/${id}/photos`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Delete photo for PDL
  deletePhoto: async (id: number, photoPath: string): Promise<ApiResponse<null>> => {
    const response = await api.delete(`/pdls/${id}/photos`, {
      data: { photo_path: photoPath }
    });
    return response.data;
  },

  // Export PDLs data
  export: async (params?: PDLSearchParams): Promise<Blob> => {
    const response = await api.get('/pdls/export', { 
      params,
      responseType: 'blob'
    });
    return response.data;
  },
};

// Helper functions for form validation
export const validatePDLForm = (data: PDLFormData): Record<string, string> => {
  const errors: Record<string, string> = {};

  // Required fields validation
  if (!data.first_name?.trim()) {
    errors.first_name = 'First name is required';
  }

  if (!data.last_name?.trim()) {
    errors.last_name = 'Last name is required';
  }

  if (!data.date_of_birth) {
    errors.date_of_birth = 'Date of birth is required';
  } else {
    const birthDate = new Date(data.date_of_birth);
    const today = new Date();
    if (birthDate >= today) {
      errors.date_of_birth = 'Date of birth must be in the past';
    }
  }

  if (!data.place_of_birth?.trim()) {
    errors.place_of_birth = 'Place of birth is required';
  }

  if (!data.gender) {
    errors.gender = 'Gender is required';
  }

  if (!data.civil_status) {
    errors.civil_status = 'Civil status is required';
  }

  if (!data.nationality?.trim()) {
    errors.nationality = 'Nationality is required';
  }

  if (!data.address?.current?.trim()) {
    errors['address.current'] = 'Current address is required';
  }

  if (!data.case_number?.trim()) {
    errors.case_number = 'Case number is required';
  }

  if (!data.charges || data.charges.length === 0) {
    errors.charges = 'At least one charge is required';
  }

  if (!data.legal_status) {
    errors.legal_status = 'Legal status is required';
  }

  if (!data.admission_date) {
    errors.admission_date = 'Admission date is required';
  }

  if (!data.admission_time) {
    errors.admission_time = 'Admission time is required';
  }

  if (!data.status) {
    errors.status = 'Status is required';
  }

  // Email validation if provided
  if (data.contact_information?.email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.contact_information.email)) {
      errors['contact_information.email'] = 'Invalid email format';
    }
  }

  // Phone validation if provided
  if (data.contact_information?.phone) {
    const phoneRegex = /^[0-9+\-\s()]+$/;
    if (!phoneRegex.test(data.contact_information.phone)) {
      errors['contact_information.phone'] = 'Invalid phone number format';
    }
  }

  return errors;
};

// Helper function to format PDL data for display
export const formatPDLForDisplay = (pdl: PDL) => {
  return {
    ...pdl,
    formatted_admission_date: new Date(pdl.admission_date).toLocaleDateString(),
    formatted_date_of_birth: new Date(pdl.date_of_birth).toLocaleDateString(),
    aliases_string: pdl.aliases?.join(', ') || 'None',
    charges_string: pdl.charges.join(', '),
    emergency_contacts_count: pdl.emergency_contacts?.length || 0,
    photos_count: pdl.photos?.length || 0,
  };
};

// Helper function to get status badge color
export const getStatusBadgeColor = (status: string): string => {
  switch (status) {
    case 'active':
      return 'success';
    case 'transferred':
      return 'warning';
    case 'released':
      return 'info';
    case 'deceased':
      return 'dark';
    default:
      return 'secondary';
  }
};

// Helper function to get legal status badge color
export const getLegalStatusBadgeColor = (legalStatus: string): string => {
  switch (legalStatus) {
    case 'detained':
      return 'warning';
    case 'convicted':
      return 'danger';
    case 'acquitted':
      return 'success';
    case 'transferred':
      return 'info';
    case 'released':
      return 'primary';
    default:
      return 'secondary';
  }
};

export default pdlApi;
