import { BaseApiClient } from './client';
import { Rating, MyRating } from '@/types';

export class RatingsApi {
  constructor(private client: BaseApiClient) {}

  submit = (
    storeId: string,
    rating: number,
    review?: string,
    photos?: string[],
  ): Promise<Rating> => {
    return this.client.request<Rating>(`/stores/${storeId}/ratings`, {
      method: 'POST',
      body: JSON.stringify({ rating, review, photos }),
    });
  };

  update = (
    storeId: string,
    rating: number,
    review?: string,
    photos?: string[],
  ): Promise<Rating> => {
    return this.client.request<Rating>(`/stores/${storeId}/ratings`, {
      method: 'PATCH',
      body: JSON.stringify({ rating, review, photos }),
    });
  };

  delete = (storeId: string): Promise<{ success: boolean; message: string }> => {
    return this.client.request<{ success: boolean; message: string }>(`/stores/${storeId}/ratings`, {
      method: 'DELETE',
    });
  };

  getMyRatingForStore = (
    storeId: string,
  ): Promise<{ rating: number | null; review?: string; photos?: string[] }> => {
    return this.client.request<{ rating: number | null; review?: string; photos?: string[] }>(
      `/stores/${storeId}/ratings/me`,
    );
  };

  getMyRatings = (): Promise<MyRating[]> => {
    return this.client.request<MyRating[]>('/ratings/my-ratings');
  };

  vote = (
    ratingId: string,
    type: 'LIKE' | 'DISLIKE',
  ): Promise<{
    ratingId: string;
    likesCount: number;
    dislikesCount: number;
    userVote: 'LIKE' | 'DISLIKE' | null;
  }> => {
    return this.client.request(`/ratings/${ratingId}/vote`, {
      method: 'POST',
      body: JSON.stringify({ type }),
    });
  };

  like = (ratingId: string): Promise<any> => {
    return this.client.request(`/ratings/${ratingId}/like`, { method: 'POST' });
  };

  dislike = (ratingId: string): Promise<any> => {
    return this.client.request(`/ratings/${ratingId}/dislike`, { method: 'POST' });
  };

  report = (
    ratingId: string,
    reason?: string,
  ): Promise<{ success: boolean; message: string; reported: boolean }> => {
    return this.client.request<{ success: boolean; message: string; reported: boolean }>(
      `/ratings/${ratingId}/report`,
      {
        method: 'POST',
        body: JSON.stringify({ reason }),
      },
    );
  };
}
