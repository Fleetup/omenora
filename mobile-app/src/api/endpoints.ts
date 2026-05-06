import apiClient from './client';
import type { Report } from '../stores/profileStore';

// Types
export interface GenerateReportRequest {
  firstName: string;
  dateOfBirth: string;
  timeOfBirth?: string;
  city: string;
  answers: Record<string, string>;
  archetype?: string | null;
  lifePathNumber?: number;
  region?: string;
  language?: string;
}

export interface GenerateReportResponse {
  success: boolean;
  report: Report;
}

export interface CompatibilityRequest {
  partnerName: string;
  partnerDateOfBirth: string;
  userReportId: string;
}

export interface DailyInsightRequest {
  email: string;
  lifePathNumber: number;
  zodiacSign?: string;
}

// API Endpoints
export const api = {
  // Report Generation
  generateReport: async (data: GenerateReportRequest): Promise<GenerateReportResponse> => {
    const response = await apiClient.post('/api/generate-report', data);
    return response.data;
  },

  getReport: async (reportId: string): Promise<GenerateReportResponse> => {
    const response = await apiClient.post('/api/get-report', { reportId });
    return response.data;
  },

  checkReportExists: async (firstName: string, dateOfBirth: string): Promise<{ exists: boolean; reportId?: string }> => {
    const response = await apiClient.post('/api/check-report-exists', { firstName, dateOfBirth });
    return response.data;
  },

  // Birth Chart
  generateBirthChart: async (data: {
    firstName: string;
    dateOfBirth: string;
    timeOfBirth: string;
    city: string;
  }) => {
    const response = await apiClient.post('/api/generate-birth-chart', data);
    return response.data;
  },

  // Compatibility
  generateCompatibility: async (data: CompatibilityRequest) => {
    const response = await apiClient.post('/api/generate-compatibility', data);
    return response.data;
  },

  // Calendar
  generateCalendar: async (data: {
    firstName: string;
    dateOfBirth: string;
    year: number;
  }) => {
    const response = await apiClient.post('/api/generate-calendar', data);
    return response.data;
  },

  getCalendar: async (calendarId: string) => {
    const response = await apiClient.post('/api/get-calendar', { calendarId });
    return response.data;
  },

  // Daily Insights
  generateDailyInsight: async (data: DailyInsightRequest) => {
    const response = await apiClient.post('/api/generate-daily-insight', data);
    return response.data;
  },

  // Health Check
  healthCheck: async () => {
    const response = await apiClient.get('/api/health');
    return response.data;
  },

  // Region Detection
  detectRegion: async () => {
    const response = await apiClient.get('/api/detect-region');
    return response.data;
  },
};

export default api;
