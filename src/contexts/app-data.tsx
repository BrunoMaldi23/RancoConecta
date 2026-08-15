import type { ReactNode } from 'react';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { usePathname } from 'expo-router';

import { PROVIDERS, type Provider } from '../data/providers';
import { isFirebaseConfigured } from '../lib/firebase-config';

export type ServiceRequestStatus = 'Enviada' | 'Respondida' | 'Agendada' | 'Cerrada';

export type ProviderPlan = 'Base' | 'Destacado';

export type ProviderPublicationStatus = 'Publicado' | 'Pendiente' | 'Pausado';

export type DirectoryProvider = Provider & {
  plan: ProviderPlan;
  publicationStatus: ProviderPublicationStatus;
};

export type ServiceRequest = {
  id: string;
  providerId: string;
  providerName: string;
  serviceName: string;
  address: string;
  detail: string;
  dateOption: string;
  photos: string[];
  status: ServiceRequestStatus;
  createdAt: string;
};

type CreateServiceRequestPayload = Omit<ServiceRequest, 'id' | 'status' | 'createdAt'>;

type UpdateProviderPayload = {
  name?: string;
  service?: string;
  phone?: string;
  image?: string;
};

type CreatePendingProviderPayload = {
  name: string;
  service: string;
  phone: string;
  image?: string;
};

type AppDataContextValue = {
  providers: DirectoryProvider[];
  featuredProviders: DirectoryProvider[];
  requests: ServiceRequest[];
  favoriteIds: string[];
  backendReady: boolean;
  getProvider: (id?: string) => DirectoryProvider;
  createRequest: (payload: CreateServiceRequestPayload) => ServiceRequest;
  createPendingProvider: (payload: CreatePendingProviderPayload) => DirectoryProvider;
  updateRequestStatus: (requestId: string, status: ServiceRequestStatus) => void;
  updateProvider: (providerId: string, payload: UpdateProviderPayload) => void;
  toggleProviderPublication: (providerId: string) => void;
  toggleProviderPlan: (providerId: string) => void;
  rateProvider: (providerId: string, rating: number) => void;
  recommendProvider: (providerId: string) => void;
  toggleFavorite: (providerId: string) => void;
  isFavorite: (providerId: string) => boolean;
};

const AppDataContext = createContext<AppDataContextValue | null>(null);

const INITIAL_FEATURED_IDS = ['servicios-ranco', 'soluciones-rios'];

const INITIAL_PROVIDERS: DirectoryProvider[] = PROVIDERS.map((provider) => ({
  ...provider,
  plan: INITIAL_FEATURED_IDS.includes(provider.id) ? 'Destacado' : 'Base',
  publicationStatus: provider.available ? 'Publicado' : 'Pausado',
}));

export function AppDataProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [providers, setProviders] = useState(INITIAL_PROVIDERS);
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [recommendedIds, setRecommendedIds] = useState<string[]>([]);
  const [backendReady, setBackendReady] = useState(false);

  useEffect(() => {
    if (!isFirebaseConfigured || pathname === '/') {
      return;
    }

    let mounted = true;

    import('../services/firebase-directory')
      .then(({ fetchProviders, fetchRequests }) => Promise.all([fetchProviders(), fetchRequests()]))
      .then(([remoteProviders, remoteRequests]) => {
        if (!mounted) {
          return;
        }

        if (remoteProviders.length > 0) {
          setProviders(remoteProviders);
        }

        setRequests(remoteRequests);
        setBackendReady(true);
      })
      .catch(() => {
        if (mounted) {
          setBackendReady(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, [pathname]);

  const value = useMemo<AppDataContextValue>(
    () => ({
      providers,
      featuredProviders: providers.filter(
        (provider) =>
          provider.publicationStatus === 'Publicado' &&
          (INITIAL_FEATURED_IDS.includes(provider.id) || recommendedIds.includes(provider.id)),
      ),
      requests,
      favoriteIds,
      backendReady,
      getProvider: (id) => providers.find((provider) => provider.id === id) ?? providers[0],
      createRequest: (payload) => {
        const request: ServiceRequest = {
          ...payload,
          id: `request-${Date.now()}`,
          status: 'Enviada',
          createdAt: new Date().toISOString(),
        };

        setRequests((current) => [request, ...current]);
        if (isFirebaseConfigured) {
          import('../services/firebase-directory')
            .then(({ saveRequest }) => saveRequest(request))
            .catch(() => undefined);
        }
        return request;
      },
      createPendingProvider: ({ name, service, phone, image }) => {
        const normalizedPhone = phone.trim();
        const provider: DirectoryProvider = {
          id: `provider-${Date.now()}`,
          name: name.trim(),
          service: service.trim(),
          categoryId: 'hogar',
          subcategoryId: 'electricidad',
          locationId: 'lago-ranco',
          locationName: 'Lago Ranco',
          rating: 0,
          reviews: 0,
          distance: 'Por definir',
          verified: false,
          available: false,
          phone: normalizedPhone,
          whatsapp: normalizedPhone.replace(/\D/g, ''),
          description: 'Perfil pendiente de completar y validar por administración municipal.',
          coverage: ['Lago Ranco'],
          images: [
            image?.trim() ||
              'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1200&q=80',
          ],
          plan: 'Base',
          publicationStatus: 'Pendiente',
        };

        setProviders((current) => [provider, ...current]);
        if (isFirebaseConfigured) {
          import('../services/firebase-directory')
            .then(({ saveProvider }) => saveProvider(provider))
            .catch(() => undefined);
        }
        return provider;
      },
      updateRequestStatus: (requestId, status) => {
        setRequests((current) =>
          current.map((request) => (request.id === requestId ? { ...request, status } : request)),
        );
        if (isFirebaseConfigured) {
          import('../services/firebase-directory')
            .then(({ updateRequestStatus }) => updateRequestStatus(requestId, status))
            .catch(() => undefined);
        }
      },
      updateProvider: (providerId, payload) => {
        let updatedProvider: DirectoryProvider | null = null;

        setProviders((current) =>
          current.map((provider) => {
            if (provider.id !== providerId) {
              return provider;
            }

            const phone = payload.phone?.trim() || provider.phone;

            updatedProvider = {
              ...provider,
              name: payload.name?.trim() || provider.name,
              service: payload.service?.trim() || provider.service,
              phone,
              whatsapp: phone.replace(/\D/g, ''),
              images: payload.image?.trim() ? [payload.image.trim(), ...provider.images.slice(1)] : provider.images,
            };

            return updatedProvider;
          }),
        );

        if (isFirebaseConfigured && updatedProvider) {
          import('../services/firebase-directory')
            .then(({ updateProviderFields }) => updateProviderFields(providerId, updatedProvider))
            .catch(() => undefined);
        }
      },
      toggleProviderPublication: (providerId) => {
        let nextPublicationStatus: ProviderPublicationStatus | null = null;

        setProviders((current) =>
          current.map((provider) => {
            if (provider.id !== providerId) {
              return provider;
            }

            const nextStatus = provider.publicationStatus === 'Publicado' ? 'Pausado' : 'Publicado';
            nextPublicationStatus = nextStatus;

            return {
              ...provider,
              publicationStatus: nextStatus,
              available: nextStatus === 'Publicado',
            };
          }),
        );

        if (isFirebaseConfigured && nextPublicationStatus) {
          import('../services/firebase-directory')
            .then(({ updateProviderPublication }) =>
              updateProviderPublication(providerId, nextPublicationStatus),
            )
            .catch(() => undefined);
        }
      },
      toggleProviderPlan: (providerId) => {
        let nextPlan: ProviderPlan | null = null;

        setProviders((current) =>
          current.map((provider) => {
            if (provider.id !== providerId) {
              return provider;
            }

            nextPlan = provider.plan === 'Destacado' ? 'Base' : 'Destacado';
            return { ...provider, plan: nextPlan };
          }),
        );

        if (isFirebaseConfigured && nextPlan) {
          import('../services/firebase-directory')
            .then(({ updateProviderPlan }) => updateProviderPlan(providerId, nextPlan))
            .catch(() => undefined);
        }
      },
      rateProvider: (providerId, rating) => {
        setProviders((current) =>
          current.map((provider) => {
            if (provider.id !== providerId) {
              return provider;
            }

            const nextReviews = provider.reviews + 1;
            const nextRating = (provider.rating * provider.reviews + rating) / nextReviews;

            return {
              ...provider,
              rating: Math.round(nextRating * 10) / 10,
              reviews: nextReviews,
            };
          }),
        );
        if (isFirebaseConfigured) {
          import('../services/firebase-directory')
            .then(({ saveRating }) => saveRating(providerId, rating))
            .catch(() => undefined);
        }
      },
      recommendProvider: (providerId) => {
        setRecommendedIds((current) => (current.includes(providerId) ? current : [providerId, ...current]));
        setProviders((current) =>
          current.map((provider) =>
            provider.id === providerId && provider.plan !== 'Destacado'
              ? { ...provider, plan: 'Destacado' }
              : provider,
          ),
        );
        if (isFirebaseConfigured) {
          import('../services/firebase-directory')
            .then(({ saveRecommendation }) => saveRecommendation(providerId))
            .catch(() => undefined);
        }
      },
      toggleFavorite: (providerId) => {
        setFavoriteIds((current) =>
          current.includes(providerId)
            ? current.filter((item) => item !== providerId)
            : [providerId, ...current],
        );
      },
      isFavorite: (providerId) => favoriteIds.includes(providerId),
    }),
    [backendReady, favoriteIds, providers, recommendedIds, requests],
  );

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData() {
  const value = useContext(AppDataContext);

  if (!value) {
    throw new Error('useAppData must be used inside AppDataProvider');
  }

  return value;
}
