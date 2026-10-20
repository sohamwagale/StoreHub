export type UserRole = 'USER' | 'OWNER';

export interface User {
  id: string;
  _id?: string;
  name: string;
  email: string;
  address: string;
  role: UserRole;
  createdAt?: string;
  updatedAt?: string;
}

export interface Store {
  id: string;
  _id?: string;
  name: string;
  address: string;
  category?: string;
  latitude?: number;
  longitude?: number;
  photos?: string[];
  ownerId: string;
  averageRating: number | null;
  totalRatings: number;
  userRating?: number | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface Rating {
  id: string;
  _id?: string;
  storeId: string;
  userId: string;
  rating: number;
  review?: string;
  photos?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface MyRating {
  id: string;
  _id?: string;
  rating: number;
  review?: string;
  photos?: string[];
  createdAt: string;
  updatedAt: string;
  store: {
    id: string;
    name: string;
    address: string;
    category?: string;
    photos?: string[];
  } | null;
}

export interface StoreReview {
  id: string;
  _id?: string;
  rating: number;
  review: string;
  photos?: string[];
  createdAt: string;
  updatedAt?: string;
  user: {
    id: string;
    name: string;
  };
}

export interface OwnerRatingEntry {
  id: string;
  rating: number;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

export interface CustomerPhoto {
  url: string;
  userName: string;
  rating: number;
  review: string;
  createdAt: string;
}

export interface StoreGallery {
  storeId: string;
  storeName: string;
  ownerPhotos: string[];
  customerPhotos: CustomerPhoto[];
  totalPhotos: number;
}

export interface OwnerStoreData {
  id: string;
  _id?: string;
  name: string;
  address: string;
  category?: string;
  latitude?: number;
  longitude?: number;
  photos?: string[];
  averageRating: number | null;
  totalRatings: number;
  ratings: OwnerRatingEntry[];
  createdAt?: string;
  updatedAt?: string;
}

export interface OwnerDashboardResponse {
  stores: OwnerStoreData[];
  primaryStore?: OwnerStoreData | null;
  message?: string;
}

export interface AuthResponse {
  access_token: string;
  user: User;
}

export interface ApiError {
  statusCode: number;
  message: string | string[];
  error?: string;
}
