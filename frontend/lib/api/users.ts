import { BaseApiClient } from './client';
import { Store, DashboardStats } from '@/types';

export class UsersApi {
  constructor(private client: BaseApiClient) {}

  getDashboardStats = (): Promise<DashboardStats> => {
    return this.client.request<DashboardStats>('/users/dashboard-stats');
  };

  getBookmarks = (): Promise<Store[]> => {
    return this.client.request<Store[]>('/users/bookmarks');
  };

  toggleBookmark = (
    storeId: string,
  ): Promise<{ isBookmarked: boolean; bookmarks: string[]; storeId: string }> => {
    return this.client.request<{ isBookmarked: boolean; bookmarks: string[]; storeId: string }>(
      `/users/bookmarks/${storeId}`,
      { method: 'POST' },
    );
  };

  updateProfile = (payload: {
    name?: string;
    address?: string;
    bio?: string;
    phone?: string;
    city?: string;
    avatarUrl?: string;
  }) => {
    return this.client.request('/users/profile', {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  };

  changePassword = (payload: { currentPassword: string; newPassword: string }) => {
    return this.client.request<{ success: boolean; message: string }>('/users/change-password', {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  };

  deleteAccount = () => {
    return this.client.request<{ success: boolean; message: string }>('/users/me', {
      method: 'DELETE',
    });
  };
}
