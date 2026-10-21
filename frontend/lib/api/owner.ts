import { BaseApiClient } from './client';
import { OwnerDashboardResponse } from '@/types';

export class OwnerApi {
  constructor(private client: BaseApiClient) {}

  getDashboard = (): Promise<OwnerDashboardResponse> => {
    return this.client.request<OwnerDashboardResponse>('/owner/dashboard');
  };
}
