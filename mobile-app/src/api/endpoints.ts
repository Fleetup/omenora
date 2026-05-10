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

export interface GenerateBirthChartRequest {
  firstName:       string
  dateOfBirth:     string
  timeOfBirth?:    string
  city?:           string
  archetype?:      string
  lifePathNumber?: number
  language?:       string
}

export interface GenerateBirthChartResponse {
  success:      boolean
  noonFallback: boolean
  birthChart: {
    risingSign:     string
    sunSign:        string
    moonSign:       string
    dominantPlanet: string
    powerHouse:     string
    chartTitle:     string
    reading:        string
    forecast2026:   string
    archetype:      string
  }
}

export interface GetDailyCacheRequest {
  date:      string   // ISO YYYY-MM-DD
  language?: string   // 'en' | 'es' | 'pt' | 'hi' | 'ko' | 'zh'
}

export interface ArchetypeRow {
  theme:      string
  insight:    string
  reflection: string
  moon_phase: string
}

export interface ZodiacRow {
  horoscope:         string
  love:              string
  job:               string
  health:            string
  theme:             string
  moon_phase:        string
  sun_sign:          string
  moon_sign:         string
  planetary_weather: string
}

export interface GetDailyCacheResponse {
  success:     boolean
  date:        string
  isYesterday: boolean
  archetypes:  Record<string, ArchetypeRow>
  zodiac:      Record<string, ZodiacRow>
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
  generateBirthChart: async (data: GenerateBirthChartRequest): Promise<GenerateBirthChartResponse> => {
    const response = await apiClient.post<GenerateBirthChartResponse>('/api/generate-birth-chart', data);
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

  // Daily Cache
  getDailyCache: async (data: GetDailyCacheRequest): Promise<GetDailyCacheResponse> => {
    const response = await apiClient.post<GetDailyCacheResponse>('/api/get-daily-cache', data);
    return response.data;
  },
};

export default api;
