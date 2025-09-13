import { api } from '../lib/api';
import type {
  Report,
  ReportGeneration,
  ReportTemplate,
  ReportGenerationRequest,
  ReportsResponse,
  ReportGenerationsResponse,
  ReportResponse,
  ReportGenerationResponse,
  ReportStatisticsResponse,
  ReportTypesResponse,
} from '../types/report';

export const reportApi = {
  // Report Templates
  async getReports(params?: {
    page?: number;
    type?: string;
    search?: string;
  }): Promise<ReportsResponse> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.type) searchParams.append('type', params.type);
    if (params?.search) searchParams.append('search', params.search);

    const response = await api.get(`/reports?${searchParams.toString()}`);
    return response.data;
  },

  async getReport(id: number): Promise<ReportResponse> {
    const response = await api.get(`/reports/${id}`);
    return response.data;
  },

  async createReport(data: ReportTemplate): Promise<ReportResponse> {
    const response = await api.post('/reports', data);
    return response.data;
  },

  async updateReport(id: number, data: Partial<ReportTemplate>): Promise<ReportResponse> {
    const response = await api.put(`/reports/${id}`, data);
    return response.data;
  },

  async deleteReport(id: number): Promise<{ success: boolean; message: string }> {
    const response = await api.delete(`/reports/${id}`);
    return response.data;
  },

  // Report Generation
  async generatePDF(data: ReportGenerationRequest): Promise<ReportGenerationResponse> {
    const response = await api.post('/reports/generate/pdf', data);
    return response.data;
  },

  async generateExcel(data: ReportGenerationRequest): Promise<ReportGenerationResponse> {
    const response = await api.post('/reports/generate/excel', data);
    return response.data;
  },

  // Report Generations Management
  async getGenerations(params?: {
    page?: number;
    status?: string;
    type?: string;
    report_id?: number;
  }): Promise<ReportGenerationsResponse> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.status) searchParams.append('status', params.status);
    if (params?.type) searchParams.append('type', params.type);
    if (params?.report_id) searchParams.append('report_id', params.report_id.toString());

    const response = await api.get(`/reports/generations/list?${searchParams.toString()}`);
    return response.data;
  },

  async getRecentGenerations(): Promise<{ success: boolean; data: ReportGeneration[] }> {
    const response = await api.get('/reports/generations/recent');
    return response.data;
  },

  async getGeneration(id: number): Promise<{ success: boolean; data: ReportGeneration }> {
    const response = await api.get(`/reports/generations/${id}`);
    return response.data;
  },

  async downloadGeneration(id: number): Promise<Blob> {
    const response = await api.get(`/reports/generations/${id}/download`, {
      responseType: 'blob',
    });
    return response.data;
  },

  async deleteGeneration(id: number): Promise<{ success: boolean; message: string }> {
    const response = await api.delete(`/reports/generations/${id}`);
    return response.data;
  },

  // Report Utilities
  async getReportTypes(): Promise<ReportTypesResponse> {
    const response = await api.get('/reports/types/available');
    return response.data;
  },

  async getStatistics(): Promise<ReportStatisticsResponse> {
    const response = await api.get('/reports/statistics/dashboard');
    return response.data;
  },

  // Helper methods for common report generation
  async generatePDLStatusReport(parameters: {
    status?: string[];
    legal_status?: string[];
    gender?: string;
    date_range?: {
      start: string;
      end: string;
    };
  }): Promise<ReportGenerationResponse> {
    return this.generatePDF({
      type: 'pdl_status',
      parameters,
    });
  },

  async generatePDLDetailReport(pdlId: number): Promise<ReportGenerationResponse> {
    return this.generatePDF({
      type: 'pdl_detail',
      pdl_id: pdlId,
    });
  },

  async exportPDLsToExcel(parameters: {
    status?: string[];
    legal_status?: string[];
    gender?: string;
    date_range?: {
      start: string;
      end: string;
    };
    fields?: string[];
  }): Promise<ReportGenerationResponse> {
    return this.generateExcel({
      type: 'pdl_export',
      parameters,
    });
  },

  async exportStatisticsToExcel(parameters: {
    date_range?: {
      start: string;
      end: string;
    };
    include_charts?: boolean;
  }): Promise<ReportGenerationResponse> {
    return this.generateExcel({
      type: 'statistics_export',
      parameters,
    });
  },

  // File download helper
  downloadFile(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },

  // Status helpers
  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'completed':
        return 'bg-success';
      case 'failed':
        return 'bg-danger';
      case 'processing':
        return 'bg-warning';
      case 'pending':
        return 'bg-secondary';
      default:
        return 'bg-secondary';
    }
  },

  getStatusIcon(status: string): string {
    switch (status) {
      case 'completed':
        return 'bi-check-circle';
      case 'failed':
        return 'bi-x-circle';
      case 'processing':
        return 'bi-arrow-clockwise';
      case 'pending':
        return 'bi-clock';
      default:
        return 'bi-question-circle';
    }
  },

  formatFileSize(bytes?: number): string {
    if (!bytes) return 'Unknown';

    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;

    while (size > 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    return `${Math.round(size * 100) / 100} ${units[unitIndex]}`;
  },

  formatDuration(startTime?: string, endTime?: string): string {
    if (!startTime || !endTime) return 'N/A';

    const start = new Date(startTime);
    const end = new Date(endTime);
    const diffMs = end.getTime() - start.getTime();
    const diffSeconds = Math.floor(diffMs / 1000);

    if (diffSeconds < 60) {
      return `${diffSeconds}s`;
    } else if (diffSeconds < 3600) {
      const minutes = Math.floor(diffSeconds / 60);
      const seconds = diffSeconds % 60;
      return `${minutes}m ${seconds}s`;
    } else {
      const hours = Math.floor(diffSeconds / 3600);
      const minutes = Math.floor((diffSeconds % 3600) / 60);
      return `${hours}h ${minutes}m`;
    }
  },
};

export default reportApi;
