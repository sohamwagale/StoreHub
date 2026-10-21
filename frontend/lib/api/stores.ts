import { BaseApiClient } from './client';
import { Store, StoreReview, StoreGallery } from '@/types';

export class StoresApi {
  constructor(private client: BaseApiClient) {}

  getAll = (search?: string, category?: string): Promise<Store[]> => {
    const params = new URLSearchParams();
    if (search && search.trim()) params.append('search', search.trim());
    if (category && category.trim() && category.toLowerCase() !== 'all') {
      params.append('category', category.trim());
    }
    const query = params.toString() ? `?${params.toString()}` : '';
    return this.client.request<Store[]>(`/stores${query}`);
  };

  getById = (id: string): Promise<Store> => {
    return this.client.request<Store>(`/stores/${id}`);
  };

  getReviews = (storeId: string): Promise<StoreReview[]> => {
    return this.client.request<StoreReview[]>(`/stores/${storeId}/reviews`);
  };

  getGallery = (storeId: string): Promise<StoreGallery> => {
    return this.client.request<StoreGallery>(`/stores/${storeId}/gallery`);
  };

  addPhotos = (storeId: string, photos: string[]): Promise<any> => {
    return this.client.request(`/stores/${storeId}/photos`, {
      method: 'POST',
      body: JSON.stringify({ photos }),
    });
  };

  deletePhoto = (storeId: string, photoUrl: string): Promise<any> => {
    return this.client.request(`/stores/${storeId}/photos`, {
      method: 'DELETE',
      body: JSON.stringify({ photoUrl }),
    });
  };

  create = (payload: Partial<Store> & {
    name: string;
    address: string;
    category?: string;
  }): Promise<Store> => {
    return this.client.request<Store>('/stores', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  };

  update = (id: string, payload: Partial<Store>): Promise<Store> => {
    return this.client.request<Store>(`/stores/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  };
}
