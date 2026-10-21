import { BaseApiClient } from './client';
import { AuthResponse, User } from '@/types';

export class AuthApi {
  constructor(private client: BaseApiClient) {}

  register = (payload: {
    name: string;
    email: string;
    address: string;
    password: string;
    role?: 'USER' | 'OWNER';
  }): Promise<AuthResponse> => {
    return this.client.request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  };

  login = (payload: { email: string; password: string }): Promise<AuthResponse> => {
    return this.client.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  };

  getMe = (): Promise<User> => {
    return this.client.request<User>('/auth/me');
  };

  logout = async (): Promise<void> => {
    try {
      await this.client.request('/auth/logout', { method: 'POST' });
    } catch {
      // ignore logout server error
    }
  };

  forgotPassword = (email: string): Promise<{ success: boolean; message: string; simulated?: boolean; previewUrl?: string }> => {
    return this.client.request('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  };

  resetPassword = (token: string, newPassword: string): Promise<{ success: boolean; message: string }> => {
    return this.client.request('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, newPassword }),
    });
  };
}
