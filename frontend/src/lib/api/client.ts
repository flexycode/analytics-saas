import axios, { AxiosInstance, AxiosError } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

class ApiClient {
    private client: AxiosInstance;
    private accessToken: string | null = null;
    private refreshToken: string | null = null;

    constructor() {
        this.client = axios.create({
            baseURL: `${API_URL}/api/v1`,
            headers: {
                'Content-Type': 'application/json',
            },
        });

        // Request interceptor
        this.client.interceptors.request.use(
            (config) => {
                if (this.accessToken) {
                    config.headers.Authorization = `Bearer ${this.accessToken}`;
                }
                return config;
            },
            (error) => Promise.reject(error)
        );

        // Response interceptor for token refresh
        this.client.interceptors.response.use(
            (response) => response,
            async (error: AxiosError) => {
                const originalRequest = error.config as any;

                if (error.response?.status === 401 && !originalRequest._retry && this.refreshToken) {
                    originalRequest._retry = true;
                    try {
                        const { data } = await axios.post(`${API_URL}/api/v1/auth/refresh`, {
                            refreshToken: this.refreshToken,
                        });
                        this.setTokens(data.accessToken, data.refreshToken);
                        originalRequest.headers.Authorization = `Bearer ${this.accessToken}`;
                        return this.client(originalRequest);
                    } catch (refreshError) {
                        this.clearTokens();
                        window.location.href = '/login';
                        return Promise.reject(refreshError);
                    }
                }
                return Promise.reject(error);
            }
        );

        // Load tokens from localStorage
        if (typeof window !== 'undefined') {
            this.accessToken = localStorage.getItem('accessToken');
            this.refreshToken = localStorage.getItem('refreshToken');
        }
    }

    setTokens(accessToken: string, refreshToken: string) {
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
        if (typeof window !== 'undefined') {
            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem('refreshToken', refreshToken);
        }
    }

    clearTokens() {
        this.accessToken = null;
        this.refreshToken = null;
        if (typeof window !== 'undefined') {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
        }
    }

    // Auth endpoints
    async login(email: string, password: string) {
        const { data } = await this.client.post('/auth/login', { email, password });
        this.setTokens(data.accessToken, data.refreshToken);
        return data;
    }

    async register(email: string, password: string, firstName: string, lastName: string) {
        const { data } = await this.client.post('/auth/register', {
            email, password, firstName, lastName,
        });
        this.setTokens(data.accessToken, data.refreshToken);
        return data;
    }

    async logout() {
        try {
            await this.client.post('/auth/logout');
        } finally {
            this.clearTokens();
        }
    }

    async getMe() {
        const { data } = await this.client.post('/auth/me');
        return data;
    }

    // Analytics endpoints
    async getOverview(days?: number) {
        const { data } = await this.client.get('/analytics/overview', { params: { days } });
        return data;
    }

    async trackEvent(event: { eventType: string; properties?: Record<string, any> }) {
        const { data } = await this.client.post('/analytics/track', event);
        return data;
    }

    async queryEvents(params: { startDate?: string; endDate?: string; eventType?: string }) {
        const { data } = await this.client.get('/analytics/events', { params });
        return data;
    }

    // Dashboard endpoints
    async getDashboards() {
        const { data } = await this.client.get('/dashboards');
        return data;
    }

    async getDashboard(id: string) {
        const { data } = await this.client.get(`/dashboards/${id}`);
        return data;
    }

    async createDashboard(dashboard: { name: string; description?: string }) {
        const { data } = await this.client.post('/dashboards', dashboard);
        return data;
    }

    // Reports endpoints
    async getReportTemplates() {
        const { data } = await this.client.get('/reports/templates');
        return data;
    }

    async generateReport(templateId: string, format: string = 'pdf') {
        const { data } = await this.client.post('/reports/generate', { templateId, format });
        return data;
    }

    async getReportHistory(limit?: number) {
        const { data } = await this.client.get('/reports/history', { params: { limit } });
        return data;
    }

    // Predictions endpoints
    async getForecast(metricName: string, historicalData: any[], periods: number = 7) {
        const { data } = await this.client.post('/predictions/forecast', {
            metricName, historicalData, periods,
        });
        return data;
    }

    async getInsights(analyticsData: any[], question: string) {
        const { data } = await this.client.post('/predictions/insights', {
            data: analyticsData, question,
        });
        return data;
    }
}

export const api = new ApiClient();
