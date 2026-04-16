const API_BASE_URL = 'http://localhost:3001';

interface ApiResponse<T = any> {
  success: boolean;
  data: T;
}

export interface Page {
  id: string;
  name: string;
  description?: string;
  content: any;
  thumbnail?: string;
  isTemplate?: boolean;
  status?: string;
  created_at: string;
  updated_at: string;
}

export interface Template {
  id: string;
  name: string;
  description?: string;
  category?: string;
  content: any;
  thumbnail?: string;
  tags?: string[];
  isPublic?: boolean;
  created_at: string;
  updated_at: string;
}

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

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  // 页面相关 API
  async createPage(page: Omit<Page, 'created_at' | 'updated_at'>) {
    return this.request<{ id: string }>('/pages', {
      method: 'POST',
      body: JSON.stringify(page),
    });
  }

  async getPages(): Promise<ApiResponse<Page[]>> {
    return this.request<Page[]>('/pages');
  }

  async getPage(id: string): Promise<ApiResponse<Page>> {
    return this.request<Page>(`/pages/${id}`);
  }

  async updatePage(
    id: string,
    updates: Partial<Page>
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
  async createTemplate(template: Omit<Template, 'created_at' | 'updated_at'>) {
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

  async updateTemplate(
    id: string,
    updates: Partial<Template>
  ): Promise<ApiResponse<{ id: string }>> {
    return this.request<{ id: string }>(`/templates/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteTemplate(id: string): Promise<ApiResponse<{ id: string }>> {
    return this.request<{ id: string }>(`/templates/${id}`, {
      method: 'DELETE',
    });
  }
}

export const apiService = new ApiService();
