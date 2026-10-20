import {
  AuthResponse,
  User,
  Store,
  Rating,
  MyRating,
  OwnerDashboardResponse,
  ApiError,
} from '@/types';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') || 'http://localhost:5000';

class ApiClient {
  private getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('token');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
    const token = this.getToken();

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...((options.headers as Record<string, string>) || {}),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        let errorMessage = 'An unexpected error occurred';
        if (data && data.message) {
          if (Array.isArray(data.message)) {
            errorMessage = data.message.join('. ');
          } else {
            errorMessage = data.message;
          }
        } else if (response.statusText) {
          errorMessage = response.statusText;
        }

        const error = new Error(errorMessage) as Error & {
          statusCode: number;
          data: any;
        };
        error.statusCode = response.status;
        error.data = data;
        throw error;
      }

      return data as T;
    } catch (err: any) {
      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        const networkError = new Error(
          'Unable to connect to the backend server. Please verify the backend is running.',
        ) as Error & { statusCode: number };
        networkError.statusCode = 503;
        throw networkError;
      }
      throw err;
    }
  }

  // Auth Endpoints
  auth = {
    register: (payload: {
      name: string;
      email: string;
      address: string;
      password: string;
      role?: 'USER' | 'OWNER';
    }): Promise<AuthResponse> => {
      return this.request<AuthResponse>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },

    login: (payload: { email: string; password: string }): Promise<AuthResponse> => {
      return this.request<AuthResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },

    getMe: (): Promise<User> => {
      return this.request<User>('/auth/me');
    },

    logout: async (): Promise<void> => {
      try {
        await this.request('/auth/logout', { method: 'POST' });
      } catch {
        // ignore logout server error
      }
    },
  };

  // Store Endpoints
  stores = {
    getAll: (search?: string): Promise<Store[]> => {
      const query = search ? `?search=${encodeURIComponent(search.trim())}` : '';
      return this.request<Store[]>(`/stores${query}`);
    },

    getById: (id: string): Promise<Store> => {
      return this.request<Store>(`/stores/${id}`);
    },
  };

  // Rating Endpoints
  ratings = {
    submit: (storeId: string, rating: number): Promise<Rating> => {
      return this.request<Rating>(`/stores/${storeId}/ratings`, {
        method: 'POST',
        body: JSON.stringify({ rating }),
      });
    },

    update: (storeId: string, rating: number): Promise<Rating> => {
      return this.request<Rating>(`/stores/${storeId}/ratings`, {
        method: 'PATCH',
        body: JSON.stringify({ rating }),
      });
    },

    getMyRatingForStore: (storeId: string): Promise<{ rating: number | null }> => {
      return this.request<{ rating: number | null }>(`/stores/${storeId}/ratings/me`);
    },

    getMyRatings: (): Promise<MyRating[]> => {
      return this.request<MyRating[]>('/ratings/my-ratings');
    },
  };

  // Owner Endpoints
  owner = {
    getDashboard: (): Promise<OwnerDashboardResponse> => {
      return this.request<OwnerDashboardResponse>('/owner/dashboard');
    },
  };
}

export const api = new ApiClient();
