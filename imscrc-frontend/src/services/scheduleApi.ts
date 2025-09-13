import { api } from '../lib/api';
import type {
  Schedule,
  ScheduleFormData,
  ScheduleFilters,
  PaginatedSchedules,
  CalendarEvent,
  ConflictCheckRequest,
  ConflictCheckResponse,
  ScheduleStatistics,
  Facility,
  Program,
  ScheduleType,
  ScheduleConflict,
  PaginatedConflicts,
  ConflictStatistics,
} from '../types/schedule';

export const scheduleApi = {
  // Schedule Management
  async getSchedules(filters?: ScheduleFilters & { page?: number; per_page?: number }) {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });
    }
    
    const response = await api.get(`/schedules?${params.toString()}`);
    return response.data as { success: boolean; data: PaginatedSchedules };
  },

  async getSchedule(id: number) {
    const response = await api.get(`/schedules/${id}`);
    return response.data as { success: boolean; data: Schedule };
  },

  async createSchedule(data: ScheduleFormData) {
    const response = await api.post('/schedules', data);
    return response.data as { 
      success: boolean; 
      data: Schedule; 
      conflicts?: ScheduleConflict[];
      message: string;
    };
  },

  async updateSchedule(id: number, data: Partial<ScheduleFormData>) {
    const response = await api.put(`/schedules/${id}`, data);
    return response.data as { 
      success: boolean; 
      data: Schedule; 
      conflicts?: ScheduleConflict[];
      message: string;
    };
  },

  async deleteSchedule(id: number) {
    const response = await api.delete(`/schedules/${id}`);
    return response.data as { success: boolean; message: string };
  },

  // Calendar Views
  async getCalendarEvents(startDate: string, endDate: string) {
    const response = await api.get('/schedules-calendar', {
      params: { start_date: startDate, end_date: endDate }
    });
    return response.data as { success: boolean; data: CalendarEvent[] };
  },

  async getTodaySchedules() {
    const response = await api.get('/schedules-today');
    return response.data as { success: boolean; data: Schedule[] };
  },

  async getUpcomingSchedules(limit?: number) {
    const params = limit ? { limit } : {};
    const response = await api.get('/schedules-upcoming', { params });
    return response.data as { success: boolean; data: Schedule[] };
  },

  // Facilities
  async getFacilities(filters?: { type?: string; active?: boolean }) {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });
    }
    
    const response = await api.get(`/facilities?${params.toString()}`);
    return response.data as { success: boolean; data: Facility[] };
  },

  async getFacility(id: number) {
    const response = await api.get(`/facilities/${id}`);
    return response.data as { success: boolean; data: Facility };
  },

  async createFacility(data: Omit<Facility, 'id' | 'created_at' | 'updated_at'>) {
    const response = await api.post('/facilities', data);
    return response.data as { success: boolean; data: Facility; message: string };
  },

  async updateFacility(id: number, data: Partial<Omit<Facility, 'id' | 'created_at' | 'updated_at'>>) {
    const response = await api.put(`/facilities/${id}`, data);
    return response.data as { success: boolean; data: Facility; message: string };
  },

  async deleteFacility(id: number) {
    const response = await api.delete(`/facilities/${id}`);
    return response.data as { success: boolean; message: string };
  },

  async getFacilityTypes() {
    const response = await api.get('/facilities-types');
    return response.data as { success: boolean; data: string[] };
  },

  async checkFacilityAvailability(
    facilityId: number, 
    startDateTime: string, 
    endDateTime: string, 
    excludeScheduleId?: number
  ) {
    const response = await api.post(`/facilities/${facilityId}/check-availability`, {
      start_datetime: startDateTime,
      end_datetime: endDateTime,
      exclude_schedule_id: excludeScheduleId,
    });
    return response.data as { 
      success: boolean; 
      data: { available: boolean; facility: Facility };
    };
  },

  // Programs
  async getPrograms(filters?: { type?: string; active?: boolean }) {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });
    }
    
    const response = await api.get(`/programs?${params.toString()}`);
    return response.data as { success: boolean; data: Program[] };
  },

  async getProgram(id: number) {
    const response = await api.get(`/programs/${id}`);
    return response.data as { success: boolean; data: Program };
  },

  async createProgram(data: Omit<Program, 'id' | 'created_at' | 'updated_at'>) {
    const response = await api.post('/programs', data);
    return response.data as { success: boolean; data: Program; message: string };
  },

  async updateProgram(id: number, data: Partial<Omit<Program, 'id' | 'created_at' | 'updated_at'>>) {
    const response = await api.put(`/programs/${id}`, data);
    return response.data as { success: boolean; data: Program; message: string };
  },

  async deleteProgram(id: number) {
    const response = await api.delete(`/programs/${id}`);
    return response.data as { success: boolean; message: string };
  },

  async getProgramTypes() {
    const response = await api.get('/programs-types');
    return response.data as { success: boolean; data: string[] };
  },

  async getProgramEnrollment(programId: number, scheduleId: number) {
    const response = await api.get(`/programs/${programId}/enrollment`, {
      params: { schedule_id: scheduleId }
    });
    return response.data as { 
      success: boolean; 
      data: {
        current_enrollment: number;
        max_participants: number;
        available_slots: number;
        has_available_slots: boolean;
      };
    };
  },

  // Conflicts
  async getConflicts(filters?: { 
    status?: string; 
    severity?: string; 
    type?: string;
    page?: number;
    per_page?: number;
  }) {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });
    }
    
    const response = await api.get(`/conflicts?${params.toString()}`);
    return response.data as { success: boolean; data: PaginatedConflicts };
  },

  async getConflict(id: number) {
    const response = await api.get(`/conflicts/${id}`);
    return response.data as { success: boolean; data: ScheduleConflict };
  },

  async resolveConflict(id: number, resolutionNotes?: string) {
    const response = await api.post(`/conflicts/${id}/resolve`, {
      resolution_notes: resolutionNotes
    });
    return response.data as { success: boolean; data: ScheduleConflict; message: string };
  },

  async acknowledgeConflict(id: number) {
    const response = await api.post(`/conflicts/${id}/acknowledge`);
    return response.data as { success: boolean; data: ScheduleConflict; message: string };
  },

  async ignoreConflict(id: number) {
    const response = await api.post(`/conflicts/${id}/ignore`);
    return response.data as { success: boolean; data: ScheduleConflict; message: string };
  },

  async getUnresolvedConflicts() {
    const response = await api.get('/conflicts-unresolved');
    return response.data as { success: boolean; data: ScheduleConflict[] };
  },

  async checkConflicts(data: ConflictCheckRequest) {
    const response = await api.post('/conflicts-check', data);
    return response.data as { success: boolean; data: ConflictCheckResponse };
  },

  async getConflictStatistics() {
    const response = await api.get('/conflicts-statistics');
    return response.data as { success: boolean; data: ConflictStatistics };
  },

  // Utility functions
  formatDateTime(dateTime: string): string {
    return new Date(dateTime).toLocaleString();
  },

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString();
  },

  formatTime(dateTime: string): string {
    return new Date(dateTime).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  },

  getStatusColor(status: string): string {
    switch (status) {
      case 'scheduled': return '#6c757d';
      case 'confirmed': return '#007bff';
      case 'completed': return '#28a745';
      case 'cancelled': return '#dc3545';
      case 'rescheduled': return '#ffc107';
      default: return '#6c757d';
    }
  },

  getSeverityColor(severity: string): string {
    switch (severity) {
      case 'low': return '#28a745';
      case 'medium': return '#ffc107';
      case 'high': return '#fd7e14';
      case 'critical': return '#dc3545';
      default: return '#6c757d';
    }
  },
};
