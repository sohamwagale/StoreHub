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
}
