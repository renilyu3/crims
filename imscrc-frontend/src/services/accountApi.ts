import api from '../lib/api';
import type { User } from '../types/auth';
import type { 
  CreateUserRequest, 
  UpdateUserRequest, 
  ChangePasswordRequest, 
  AccountFilters, 
  PaginatedUsers 
} from '../types/account';

export const accountApi = {
  // Get all users with pagination and filters
  getUsers: async (page = 1, filters: AccountFilters = {}): Promise<PaginatedUsers> => {
    const params = new URLSearchParams({
      page: page.toString(),
      per_page: '15',
      ...Object.fromEntries(
        Object.entries(filters).filter(([_, value]) => value !== undefined && value !== '')
      )
    });
    
    const response = await api.get(`/users?${params}`);
    return response.data.data;
  },

  // Get single user by ID
  getUser: async (id: number): Promise<User> => {
    const response = await api.get(`/users/${id}`);
    return response.data.data;
  },

  // Create new user
  createUser: async (userData: CreateUserRequest): Promise<User> => {
    const response = await api.post('/users', userData);
    return response.data.data;
  },

  // Update user
  updateUser: async (id: number, userData: UpdateUserRequest): Promise<User> => {
    const response = await api.put(`/users/${id}`, userData);
    return response.data.data;
  },

  // Delete user
  deleteUser: async (id: number): Promise<void> => {
    await api.delete(`/users/${id}`);
  },

  // Toggle user active status
  toggleUserStatus: async (id: number): Promise<User> => {
    const response = await api.post(`/users/${id}/toggle-status`);
    return response.data.data;
  },

  // Get user statistics
  getStatistics: async () => {
    const response = await api.get('/users-statistics');
    return response.data.data;
  },

  // Search users
  searchUsers: async (query: string): Promise<User[]> => {
    const response = await api.get(`/users-search?q=${encodeURIComponent(query)}`);
    return response.data.data;
  },

  // Change user password (placeholder - not implemented in backend yet)
  changePassword: async (id: number, passwordData: ChangePasswordRequest): Promise<void> => {
    // This endpoint would need to be implemented in the backend
    await api.patch(`/users/${id}/change-password`, passwordData);
  },

  // Get departments list (placeholder - could be extracted from existing users)
  getDepartments: async (): Promise<string[]> => {
    // For now, return common departments
    return [
      'IT Department',
      'Operations',
      'Administration',
      'Security',
      'Medical',
      'Legal',
      'Finance',
      'Human Resources'
    ];
  },

  // Get positions list (placeholder - could be extracted from existing users)
  getPositions: async (): Promise<string[]> => {
    // For now, return common positions
    return [
      'System Administrator',
      'Rehabilitation Officer',
      'Security Officer',
      'Medical Officer',
      'Legal Officer',
      'Finance Officer',
      'HR Officer',
      'Operations Manager',
      'Supervisor',
      'Staff'
    ];
  }
};

export default accountApi;
