const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

interface ApiResponse<T = unknown> {
  success: boolean;
  data: T;
}

interface ApiErrorPayload {
  success: false;
  error: {
    code?: string;
    message?: string;
    details?: unknown;
    statusCode?: number;
    timestamp?: string;
    path?: string;
  };
}

export class ApiRequestError extends Error {
  status: number;
  code?: string;
  details?: unknown;

  constructor(message: string, status: number, code?: string, details?: unknown) {
    super(message);
    this.name = 'ApiRequestError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export type PageStatus = 'draft' | 'published';

export interface PageFlowRecord {
  action: 'published' | 'unpublished';
  note?: string;
  operator?: string;
  timestamp: string;
}

export interface Page {
  id: string;
  name: string;
  description?: string;
  content: unknown;
  thumbnail?: string;
  isTemplate?: boolean;
  status?: PageStatus;
  flowHistory?: PageFlowRecord[];
  created_at: string;
  updated_at: string;
}

export interface PageListQuery {
  page?: number;
  pageSize?: number;
  status?: PageStatus;
  keyword?: string;
  sortBy?: 'updated_at' | 'created_at' | 'name';
  sortOrder?: 'asc' | 'desc';
}

export interface PageListData {
  items: Page[];
  total: number;
  page: number;
  pageSize: number;
}

export interface Template {
  id: string;
  name: string;
  description?: string;
  category?: string;
  content: unknown;
  thumbnail?: string;
  tags?: string[];
  isPublic?: boolean;
  created_at: string;
  updated_at: string;
}

type CreatePagePayload = Omit<Page, 'id' | 'created_at' | 'updated_at'>;
type CreateTemplatePayload = Omit<Template, 'id' | 'created_at' | 'updated_at'>;

class ApiService {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    const payload = await this.parseResponseBody(response);

    if (!response.ok) {
      if (this.isApiErrorPayload(payload)) {
        const message = payload.error.message || `API Error: ${response.status}`;
        throw new ApiRequestError(
          message,
          response.status,
          payload.error.code,
          payload.error.details
        );
      }

      if (payload && typeof payload === 'object' && 'message' in payload) {
        const message =
          typeof (payload as { message?: unknown }).message === 'string'
            ? (payload as { message: string }).message
            : `API Error: ${response.status} ${response.statusText}`;
        throw new ApiRequestError(message, response.status);
      }

      throw new ApiRequestError(
        `API Error: ${response.status} ${response.statusText}`,
        response.status
      );
    }

    return payload as ApiResponse<T>;
  }

  private async parseResponseBody(response: Response): Promise<unknown> {
    const contentType = response.headers.get('content-type') || '';

    if (contentType.includes('application/json')) {
      return response.json();
    }

    const text = await response.text();
    return text ? { message: text } : null;
  }

  private isApiErrorPayload(payload: unknown): payload is ApiErrorPayload {
    if (!payload || typeof payload !== 'object') return false;
    if (!('success' in payload) || !('error' in payload)) return false;

    const success = (payload as { success?: unknown }).success;
    const error = (payload as { error?: unknown }).error;
    return success === false && typeof error === 'object' && error !== null;
  }

  // 页面相关 API
  async createPage(page: CreatePagePayload) {
    return this.request<{ id: string }>('/pages', {
      method: 'POST',
      body: JSON.stringify(page),
    });
  }

  async getPages(query?: PageListQuery): Promise<ApiResponse<Page[] | PageListData>> {
    const params = new URLSearchParams();
    if (query?.page !== undefined) params.set('page', String(query.page));
    if (query?.pageSize !== undefined) params.set('pageSize', String(query.pageSize));
    if (query?.status) params.set('status', query.status);
    if (query?.keyword) params.set('keyword', query.keyword);
    if (query?.sortBy) params.set('sortBy', query.sortBy);
    if (query?.sortOrder) params.set('sortOrder', query.sortOrder);

    const suffix = params.toString();
    const endpoint = suffix ? `/pages?${suffix}` : '/pages';
    return this.request<Page[] | PageListData>(endpoint);
  }

  async getPage(id: string): Promise<ApiResponse<Page>> {
    return this.request<Page>(`/pages/${id}`);
  }

  async updatePage(
    id: string,
    updates: Partial<Page> & {
      publishNote?: string;
      publishOperator?: string;
    }
  ): Promise<ApiResponse<{ id: string }>> {
    return this.request<{ id: string }>(`/pages/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deletePage(id: string): Promise<ApiResponse<{ id: string }>> {
    return this.request<{ id: string }>(`/pages/${id}`, {
      method: 'DELETE',
    });
  }

  // 模板相关 API
  async createTemplate(template: CreateTemplatePayload) {
    return this.request<{ id: string }>('/templates', {
      method: 'POST',
      body: JSON.stringify(template),
    });
  }

  async getTemplates(): Promise<ApiResponse<Template[]>> {
    return this.request<Template[]>('/templates');
  }

  async getTemplate(id: string): Promise<ApiResponse<Template>> {
    return this.request<Template>(`/templates/${id}`);
  }

  async deleteTemplate(id: string): Promise<ApiResponse<{ id: string }>> {
    return this.request<{ id: string }>(`/templates/${id}`, {
      method: 'DELETE',
    });
  }
}

export const apiService = new ApiService();
