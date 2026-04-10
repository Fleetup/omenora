import apiClient from './client';

// Types
export interface GenerateReportRequest {
  firstName: string;
  dateOfBirth: string;
  timeOfBirth?: string;
  city: string;
  answers: Record<string, string>;
  region?: string;
}

export interface GenerateReportResponse {
  id: string;
  destinyArchetype: string;
  lifePathNumber: number;
  report: {
    identity: string;
    personality: string;
    forecast2026: string;
    love: string;
    career: string;
    hiddenGift: string;
    affirmation: string;
  };
}

export interface CreatePaymentRequest {
  reportId: string;
  productType: 'birth-chart' | 'compatibility' | 'calendar' | 'bundle';
  amount: number;
  currency?: string;
}

export interface CreatePaymentResponse {
  clientSecret: string;
  paymentIntentId: string;
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

  subscribeToDailyInsights: async (data: DailyInsightRequest & { paymentIntentId?: string }) => {
    const response = await apiClient.post('/api/create-subscription', data);
    return response.data;
  },

  // Payments
  createPayment: async (data: CreatePaymentRequest): Promise<CreatePaymentResponse> => {
    const response = await apiClient.post('/api/create-payment', data);
    return response.data;
  },

  verifyPayment: async (paymentIntentId: string): Promise<{ success: boolean; status: string }> => {
    const response = await apiClient.post('/api/verify-payment', { paymentIntentId });
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
