import { ApiErrorShape } from '@/types/api';

export class ApiError extends Error {
  public status: number;
  public errors?: Record<string, string[]>;
  public code?: string;

  constructor(status: number, data: ApiErrorShape) {
    super(data.message || `Request failed with status ${status}`);
    this.name = 'ApiError';
    this.status = status;
    this.errors = data.errors;
    this.code = data.code;
  }
}

// Local storage key for auth token
export const AUTH_TOKEN_KEY = 'shondhan_auth_token';
export const AUTH_USER_KEY = 'shondhan_auth_user';

export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

export function setAuthToken(token: string | null): void {
  if (typeof window === 'undefined') return;
  if (token) {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
  } else {
    localStorage.removeItem(AUTH_TOKEN_KEY);
  }
}

export interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | null | undefined>;
}

class ApiClient {
  private getBaseUrl(): string {
    return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';
  }

  public async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { params, headers = {}, ...customConfig } = options;
    const baseUrl = this.getBaseUrl();
    
    // Normalize endpoint slashes
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    let url = `${baseUrl}${cleanEndpoint}`;

    // Append query params if provided
    if (params) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          searchParams.append(key, String(value));
        }
      });
      const queryString = searchParams.toString();
      if (queryString) {
        url += (url.includes('?') ? '&' : '?') + queryString;
      }
    }

    const token = getAuthToken();
    const defaultHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    if (token) {
      defaultHeaders['Authorization'] = `Bearer ${token}`;
    }

    const mergedHeaders: Record<string, string> = {
      ...defaultHeaders,
      ...(headers as Record<string, string>),
    };
    // An empty header value is the signal to drop it (e.g. multipart uploads
    // must let the browser set Content-Type with its boundary).
    Object.keys(mergedHeaders).forEach((k) => {
      if (mergedHeaders[k] === '') delete mergedHeaders[k];
    });

    const config: RequestInit = {
      ...customConfig,
      headers: mergedHeaders,
    };

    try {
      const response = await fetch(url, config);

      if (response.status === 204) {
        return {} as T;
      }

      let data: any;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        data = { message: text };
      }

      if (!response.ok) {
        // Handle 401 Unauthorized: token expired or invalid
        if (response.status === 401) {
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('auth:unauthorized'));
          }
        }
        
        throw new ApiError(response.status, {
          message: data.message || `HTTP ${response.status}: An error occurred`,
          errors: data.errors,
          code: data.code,
        });
      }

      return data as T;
    } catch (err: any) {
      if (err instanceof ApiError) {
        throw err;
      }
      throw new ApiError(500, {
        message: err.message || 'Network error occurred. Please check your connection.',
      });
    }
  }

  public get<T>(endpoint: string, params?: RequestOptions['params'], options?: Omit<RequestOptions, 'params'>): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET', params });
  }

  public post<T>(endpoint: string, body?: any, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  public put<T>(endpoint: string, body?: any, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  public patch<T>(endpoint: string, body?: any, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  public delete<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }

  // Multipart upload (photos). The browser sets the multipart boundary, so we
  // must NOT send a JSON Content-Type here.
  public upload<T>(endpoint: string, formData: FormData): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: formData,
      headers: { 'Content-Type': '' },
    });
  }
}

export const apiClient = new ApiClient();
