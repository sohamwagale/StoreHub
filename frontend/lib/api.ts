import {
  AuthResponse,
  User,
  Store,
  Rating,
  MyRating,
  StoreReview,
  OwnerDashboardResponse,
  StoreGallery,
  DashboardStats,
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
      Accept: 'application/json',
      ...((options.headers as Record<string, string>) || {}),
    };

    // Only set application/json if body is not FormData
    if (!(options.body instanceof FormData) && !headers['Content-Type']) {
      headers['Content-Type'] = 'application/json';
    }

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
    getAll: (search?: string, category?: string): Promise<Store[]> => {
      const params = new URLSearchParams();
      if (search && search.trim()) params.append('search', search.trim());
      if (category && category.trim() && category.toLowerCase() !== 'all') {
        params.append('category', category.trim());
      }
      const query = params.toString() ? `?${params.toString()}` : '';
      return this.request<Store[]>(`/stores${query}`);
    },

    getById: (id: string): Promise<Store> => {
      return this.request<Store>(`/stores/${id}`);
    },

    getReviews: (storeId: string): Promise<StoreReview[]> => {
      return this.request<StoreReview[]>(`/stores/${storeId}/reviews`);
    },

    getGallery: (storeId: string): Promise<StoreGallery> => {
      return this.request<StoreGallery>(`/stores/${storeId}/gallery`);
    },

    addPhotos: (storeId: string, photos: string[]): Promise<any> => {
      return this.request(`/stores/${storeId}/photos`, {
        method: 'POST',
        body: JSON.stringify({ photos }),
      });
    },

    create: (payload: {
      name: string;
      address: string;
      category: string;
      latitude?: number;
      longitude?: number;
      photos?: string[];
    }): Promise<Store> => {
      return this.request<Store>('/stores', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },
  };

  // Rating Endpoints
  ratings = {
    submit: (
      storeId: string,
      rating: number,
      review?: string,
      photos?: string[],
    ): Promise<Rating> => {
      return this.request<Rating>(`/stores/${storeId}/ratings`, {
        method: 'POST',
        body: JSON.stringify({ rating, review, photos }),
      });
    },

    update: (
      storeId: string,
      rating: number,
      review?: string,
      photos?: string[],
    ): Promise<Rating> => {
      return this.request<Rating>(`/stores/${storeId}/ratings`, {
        method: 'PATCH',
        body: JSON.stringify({ rating, review, photos }),
      });
    },

    delete: (storeId: string): Promise<{ success: boolean; message: string }> => {
      return this.request<{ success: boolean; message: string }>(`/stores/${storeId}/ratings`, {
        method: 'DELETE',
      });
    },

    getMyRatingForStore: (
      storeId: string,
    ): Promise<{ rating: number | null; review?: string; photos?: string[] }> => {
      return this.request<{ rating: number | null; review?: string; photos?: string[] }>(
        `/stores/${storeId}/ratings/me`,
      );
    },

    getMyRatings: (): Promise<MyRating[]> => {
      return this.request<MyRating[]>('/ratings/my-ratings');
    },

    vote: (
      ratingId: string,
      type: 'LIKE' | 'DISLIKE',
    ): Promise<{
      ratingId: string;
      likesCount: number;
      dislikesCount: number;
      userVote: 'LIKE' | 'DISLIKE' | null;
    }> => {
      return this.request(`/ratings/${ratingId}/vote`, {
        method: 'POST',
        body: JSON.stringify({ type }),
      });
    },

    like: (ratingId: string): Promise<any> => {
      return this.request(`/ratings/${ratingId}/like`, { method: 'POST' });
    },

    dislike: (ratingId: string): Promise<any> => {
      return this.request(`/ratings/${ratingId}/dislike`, { method: 'POST' });
    },

    report: (
      ratingId: string,
      reason?: string,
    ): Promise<{ success: boolean; message: string; reported: boolean }> => {
      return this.request<{ success: boolean; message: string; reported: boolean }>(
        `/ratings/${ratingId}/report`,
        {
          method: 'POST',
          body: JSON.stringify({ reason }),
        },
      );
    },
  };

  // User & Bookmarks Endpoints
  users = {
    getDashboardStats: (): Promise<DashboardStats> => {
      return this.request<DashboardStats>('/users/dashboard-stats');
    },

    getBookmarks: (): Promise<Store[]> => {
      return this.request<Store[]>('/users/bookmarks');
    },

    toggleBookmark: (
      storeId: string,
    ): Promise<{ isBookmarked: boolean; bookmarks: string[]; storeId: string }> => {
      return this.request<{ isBookmarked: boolean; bookmarks: string[]; storeId: string }>(
        `/users/bookmarks/${storeId}`,
        { method: 'POST' },
      );
    },
  };

  // Upload Endpoints
  uploads = {
    uploadFiles: async (
      files: File[],
    ): Promise<{ urls: string[]; url: string; count: number }> => {
      const formData = new FormData();
      files.forEach((f) => formData.append('files', f));
      return this.request<{ urls: string[]; url: string; count: number }>('/uploads', {
        method: 'POST',
        body: formData,
      });
    },

    uploadSingle: async (file: File): Promise<{ url: string; urls: string[] }> => {
      const formData = new FormData();
      formData.append('file', file);
      return this.request<{ url: string; urls: string[] }>('/uploads/single', {
        method: 'POST',
        body: formData,
      });
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
