import { baseClient } from './api/client';
import { AuthApi } from './api/auth';
import { StoresApi } from './api/stores';
import { RatingsApi } from './api/ratings';
import { UsersApi } from './api/users';
import { UploadsApi } from './api/uploads';
import { OwnerApi } from './api/owner';

export class ApiService {
  public auth = new AuthApi(baseClient);
  public stores = new StoresApi(baseClient);
  public ratings = new RatingsApi(baseClient);
  public users = new UsersApi(baseClient);
  public uploads = new UploadsApi(baseClient);
  public owner = new OwnerApi(baseClient);
}

export const api = new ApiService();

export { baseClient };
export * from './api/auth';
export * from './api/stores';
export * from './api/ratings';
export * from './api/users';
export * from './api/uploads';
export * from './api/owner';
