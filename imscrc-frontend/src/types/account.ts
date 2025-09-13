export interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  role: 'staff' | 'admin';
  employee_id: string;
  position: string;
  department: string;
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
  role?: 'staff' | 'admin';
  employee_id?: string;
  position?: string;
  department?: string;
  is_active?: boolean;
}

export interface ChangePasswordRequest {
  current_password: string;
  password: string;
  password_confirmation: string;
}

export interface AccountFilters {
  role?: 'staff' | 'admin' | '';
  department?: string;
  is_active?: boolean;
  search?: string;
}

import type { User } from './auth';

export interface PaginatedUsers {
  data: User[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}
