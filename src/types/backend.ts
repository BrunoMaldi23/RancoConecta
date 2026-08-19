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
  favoriteIds?: string[];
  createdAt: string;
  updatedAt: string;
};

export type ProviderDocument = DirectoryProvider & {
  createdAt: string;
  updatedAt: string;
};

export type ServiceRequestDocument = Omit<ServiceRequest, 'createdAt' | 'id'> & {
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

export type CategorySubcategory = {
  id: string;
  name: string;
  description: string;
  icon: string;
};

export type CategoryDocument = {
  name: string;
  description: string;
  icon: string;
  iconColor: string;
  iconBackground: string;
  subcategories: CategorySubcategory[];
  createdAt: string;
  updatedAt: string;
};

export type PaymentStatus = 'pending' | 'authorized' | 'failed' | 'cancelled';

export type MembershipStatus = Membership['status'];

export type Payment = {
  id: string;
  userId: string;
  email: string;
  name: string;
  provider: 'webpay';
  purpose: 'membership';
  amount: number;
  currency: 'CLP';
  status: PaymentStatus;
  buyOrder: string;
  sessionId: string;
  createdAt: string;
  updatedAt: string;
};

export type Membership = {
  userId: string;
  status: 'active' | 'expired' | 'cancelled';
  amount: number;
  currency: 'CLP';
  paymentProvider: 'webpay';
  paymentId: string;
  startedAt: string;
  expiresAt: string;
};

export type CreateWebpayPaymentResponse = {
  paymentId: string;
  token: string;
  url: string;
  amount: number;
  currency: 'CLP';
};
