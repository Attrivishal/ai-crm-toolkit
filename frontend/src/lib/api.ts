import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

// Types
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'SDR' | 'AE' | 'Manager' | 'Admin';
  company?: string;
  avatar?: string;
  phone?: string;
  createdAt: string;
  lastLogin?: string;
  preferences?: {
    theme?: 'light' | 'dark' | 'system';
    notifications?: boolean;
    emailNotifications?: boolean;
  };
}

export interface Lead {
  _id: string;
  userId: string;
  name: string;
  company: string;
  email: string;
  phone?: string;
  industry: string;
  status: 'New Lead' | 'Contacted' | 'Qualified' | 'Demo Scheduled' | 'Proposal Sent' | 'Closed Won' | 'Closed Lost';
  leadScore: number;
  value: number;
  notes?: string;
  source?: string;
  priority?: 'Low' | 'Medium' | 'High' | 'Critical';
  expectedCloseDate?: string;
  aiAnalysis?: any;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
  interactionCount?: number;
  lastInteraction?: string;
}

export interface Task {
  _id: string;
  leadId?: string;
  userId: string;
  title: string;
  description?: string;
  dueDate: string;
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled' | 'overdue';
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  source: 'AI-Generated' | 'Manual' | 'System';
  category?: string;
  completedAt?: string;
  reminder?: string;
  lead?: Lead;
  createdAt: string;
  updatedAt: string;
  isOverdue?: boolean;
  daysUntilDue?: number;
}

export interface Interaction {
  _id: string;
  leadId: string;
  userId: string;
  type: 'Email' | 'Call' | 'Meeting' | 'Note' | 'Demo' | 'Task' | 'Status Change' | 'Proposal Sent';
  title?: string;
  notes?: string;
  aiSummary?: string;
  sentiment?: 'Positive' | 'Neutral' | 'Negative';
  duration?: number;
  outcome?: string;
  nextSteps?: string;
  lead?: Lead;
  createdAt: string;
  updatedAt: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  role?: string;
  company?: string;
}

export interface AuthResponse {
  success: boolean;
  token: string;
  refreshToken: string;
  user: User;
}

export interface PaginatedResponse<T> {
  success: boolean;
  count: number;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  data: T[];
}

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) throw new Error('No refresh token');

        const response = await axios.post(`${API_URL}/auth/refresh`, { refreshToken });
        
        const { token, refreshToken: newRefreshToken } = response.data;
        
        localStorage.setItem('accessToken', token);
        localStorage.setItem('refreshToken', newRefreshToken);
        
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return api(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    // Handle other errors
    if (error.response?.data?.message) {
      toast.error(error.response.data.message);
    } else if (error.message === 'Network Error') {
      toast.error('Network error. Please check your connection.');
    } else {
      toast.error('An unexpected error occurred.');
    }

    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  login: (credentials: LoginCredentials) => 
    api.post<AuthResponse>('/auth/login', credentials),
  
  register: (data: RegisterData) => 
    api.post<AuthResponse>('/auth/register', data),
  
  logout: () => 
    api.post('/auth/logout'),
  
  logoutAll: () => 
    api.post('/auth/logout-all'),
  
  getMe: () => 
    api.get<{ success: boolean; user: User }>('/auth/me'),
  
  updateProfile: (data: Partial<User>) => 
    api.put<{ success: boolean; user: User }>('/auth/me', data),
};

// Leads API
export const leadsApi = {
  getLeads: (params?: any) => 
    api.get('/leads', { params }),
  
  getLead: (id: string) => 
    api.get<{ success: boolean; lead: Lead }>(`/leads/${id}`),
  
  createLead: (data: Partial<Lead>) => 
    api.post<{ success: boolean; lead: Lead }>('/leads', data),
  
  updateLead: (id: string, data: Partial<Lead>) => 
    api.put<{ success: boolean; lead: Lead }>(`/leads/${id}`, data),
  
  deleteLead: (id: string) => 
    api.delete<{ success: boolean; message: string }>(`/leads/${id}`),
  
  updateStatus: (id: string, status: string) => 
    api.patch<{ success: boolean; lead: Lead }>(`/leads/${id}/status`, { status }),
  
  analyzeLead: (id: string) => 
    api.post(`/leads/${id}/analyze`),
};

// Tasks API
export const tasksApi = {
  getTasks: (params?: any) => 
    api.get('/tasks', { params }),
  
  getTask: (id: string) => 
    api.get<{ success: boolean; task: Task }>(`/tasks/${id}`),
  
  createTask: (data: Partial<Task>) => 
    api.post<{ success: boolean; task: Task }>('/tasks', data),
  
  updateTask: (id: string, data: Partial<Task>) => 
    api.put<{ success: boolean; task: Task }>(`/tasks/${id}`, data),
  
  deleteTask: (id: string) => 
    api.delete<{ success: boolean; message: string }>(`/tasks/${id}`),
  
  updateStatus: (id: string, status: string) => 
    api.patch<{ success: boolean; task: Task }>(`/tasks/${id}/status`, { status }),
  
  getOverdue: () => 
    api.get('/tasks/overdue'),
  
  getToday: () => 
    api.get('/tasks/today'),
  
  getUpcoming: (days?: number) => 
    api.get('/tasks/upcoming', { params: { days } }),
  
  duplicateTask: (id: string) => 
    api.post<{ success: boolean; task: Task }>(`/tasks/${id}/duplicate`),
  
  clearCompleted: () => 
    api.delete('/tasks/completed/clear'),
};

// Interactions API
export const interactionsApi = {
  getInteractions: (params?: any) => 
    api.get('/interactions', { params }),
  
  getLeadInteractions: (leadId: string, params?: any) => 
    api.get(`/interactions/lead/${leadId}`, { params }),
  
  getInteraction: (id: string) => 
    api.get<{ success: boolean; interaction: Interaction }>(`/interactions/${id}`),
  
  createInteraction: (data: Partial<Interaction>) => 
    api.post<{ success: boolean; interaction: Interaction }>('/interactions', data),
  
  updateInteraction: (id: string, data: Partial<Interaction>) => 
    api.put<{ success: boolean; interaction: Interaction }>(`/interactions/${id}`, data),
  
  deleteInteraction: (id: string) => 
    api.delete<{ success: boolean; message: string }>(`/interactions/${id}`),
  
  getTimeline: (leadId: string) => 
    api.get(`/interactions/timeline/lead/${leadId}`),
  
  getStats: (days?: number) => 
    api.get('/interactions/stats/summary', { params: { days } }),
};

// AI API
export const aiApi = {
  analyzeLead: (data: { leadId?: string; industry: string; notes: string; company: string }) => 
    api.post('/ai/analyze-lead', data),
  
  generateEmail: (data: {
    leadName: string;
    company: string;
    product?: string;
    tone?: string;
    industry?: string;
    senderName?: string;
    leadId?: string;
  }) => api.post('/ai/generate-email', data),
  
  summarizeMeeting: (data: { notes: string; leadName?: string; company?: string; leadId?: string }) => 
    api.post('/ai/summarize-meeting', data),
  
  predictDealRisk: (leadId: string) => 
    api.post('/ai/deal-risk', { leadId }),
  
  generateProposal: (data: { leadId: string; template?: string; focusPoints?: string[] }) => 
    api.post('/ai/generate-proposal', data),
};

export default api;