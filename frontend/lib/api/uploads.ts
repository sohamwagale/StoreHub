import { BaseApiClient } from './client';

export class UploadsApi {
  constructor(private client: BaseApiClient) {}

  uploadFiles = async (
    files: File[],
  ): Promise<{ urls: string[]; url: string; count: number }> => {
    const formData = new FormData();
    files.forEach((f) => formData.append('files', f));
    return this.client.request<{ urls: string[]; url: string; count: number }>('/uploads', {
      method: 'POST',
      body: formData,
    });
  };

  uploadSingle = async (file: File): Promise<{ url: string; urls: string[] }> => {
    const formData = new FormData();
    formData.append('file', file);
    return this.client.request<{ url: string; urls: string[] }>('/uploads/single', {
      method: 'POST',
      body: formData,
    });
  };
}
