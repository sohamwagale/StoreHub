const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') || 'http://localhost:5000';

export class BaseApiClient {
  private getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('token');
  }

  public async request<T>(
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
}

export const baseClient = new BaseApiClient();
