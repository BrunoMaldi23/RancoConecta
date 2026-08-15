import type { DirectoryProvider, ServiceRequest, ServiceRequestStatus } from '../contexts/app-data';
import type { ManagedUser, UserRole } from '../contexts/auth';

export type UserDocument = {
  name: string;
  email: string;
  role: UserRole;
  status: ManagedUser['status'];
  businessName?: string;
  serviceName?: string;
  phone?: string;
  createdAt: string;
  updatedAt: string;
};

export type ProviderDocument = DirectoryProvider & {
  createdAt: string;
  updatedAt: string;
};

export type ServiceRequestDocument = Omit<ServiceRequest, 'createdAt'> & {
  createdAt: string;
  updatedAt: string;
};

export type RatingDocument = {
  providerId: string;
  rating: number;
  createdAt: string;
};

export type RecommendationDocument = {
  providerId: string;
  createdAt: string;
};

export type BackendRequestStatus = ServiceRequestStatus;
