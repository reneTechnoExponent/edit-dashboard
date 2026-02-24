import axios, { AxiosRequestConfig } from 'axios';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

// Helper to get auth headers
const getAuthHeaders = (): Record<string, string> => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('adminToken');
    if (token) {
      return {
        Authorization: `Bearer ${token}`,
      };
    }
  }
  return {};
};

// Helper to create axios config with auth headers
const createConfig = (config?: AxiosRequestConfig): AxiosRequestConfig => ({
  ...config,
  headers: {
    ...getAuthHeaders(),
    ...config?.headers,
  },
});

// Types for API responses
export interface PaginatedResponse<T> {
  success: boolean;
  message: string;
  data: {
    items: T[];
    total: number;
    page: number;
    pages: number;
  };
}

export interface SingleResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface Cms {
  _id: string;
  content: string;
  type: 'terms' | 'privacy';
  createdAt: string;
  updatedAt: string;
}

export interface EmailTemplate {
  _id: string;
  purpose: string;
  subject: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

// Query parameters for list endpoints
export interface QueryParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc' | 'ASC' | 'DESC';
  [key: string]: any;
}

// ============================================================================
// CMS API
// ============================================================================

export const getCms = async (params?: QueryParams) => {
  const response = await axios.get<PaginatedResponse<Cms>>(
    `${API_BASE}/api/admin/content/cms`,
    createConfig({ params })
  );
  return response.data;
};

export const getCmsById = async (id: string) => {
  const response = await axios.get<SingleResponse<Cms>>(
    `${API_BASE}/api/admin/content/cms/${id}`,
    createConfig()
  );
  return response.data;
};

export const createCms = async (data: Partial<Cms>) => {
  const response = await axios.post<SingleResponse<Cms>>(
    `${API_BASE}/api/admin/content/cms`,
    data,
    createConfig()
  );
  return response.data;
};

export const updateCms = async (id: string, data: Partial<Cms>) => {
  const response = await axios.put<SingleResponse<Cms>>(
    `${API_BASE}/api/admin/content/cms/${id}`,
    data,
    createConfig()
  );
  return response.data;
};

export const deleteCms = async (id: string) => {
  const response = await axios.delete<SingleResponse<null>>(
    `${API_BASE}/api/admin/content/cms/${id}`,
    createConfig()
  );
  return response.data;
};

// ============================================================================
// Email Templates API
// ============================================================================

export const getEmailTemplates = async (params?: QueryParams) => {
  const response = await axios.get<PaginatedResponse<EmailTemplate>>(
    `${API_BASE}/api/admin/content/email-templates`,
    createConfig({ params })
  );
  return response.data;
};

export const getEmailTemplateById = async (id: string) => {
  const response = await axios.get<SingleResponse<EmailTemplate>>(
    `${API_BASE}/api/admin/content/email-templates/${id}`,
    createConfig()
  );
  return response.data;
};

export const createEmailTemplate = async (data: Partial<EmailTemplate>) => {
  const response = await axios.post<SingleResponse<EmailTemplate>>(
    `${API_BASE}/api/admin/content/email-templates`,
    data,
    createConfig()
  );
  return response.data;
};

export const updateEmailTemplate = async (id: string, data: Partial<EmailTemplate>) => {
  const response = await axios.put<SingleResponse<EmailTemplate>>(
    `${API_BASE}/api/admin/content/email-templates/${id}`,
    data,
    createConfig()
  );
  return response.data;
};

export const deleteEmailTemplate = async (id: string) => {
  const response = await axios.delete<SingleResponse<null>>(
    `${API_BASE}/api/admin/content/email-templates/${id}`,
    createConfig()
  );
  return response.data;
};
