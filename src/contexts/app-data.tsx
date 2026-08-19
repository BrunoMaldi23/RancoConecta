import type { ReactNode } from 'react';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';

import { useAuth } from './auth';
import { isFirebaseConfigured } from '../lib/firebase';

export type ServiceRequestStatus = 'Enviada' | 'Respondida' | 'Agendada' | 'Cerrada';

export type ProviderPlan = 'Base' | 'Destacado';

export type ProviderPublicationStatus = 'Publicado' | 'Pendiente' | 'Pausado';

export type Provider = {
  id: string;
  name: string;
  service: string;
  categoryId: string;
  subcategoryId: string;
  locationId: string;
  locationName: string;
  rating: number;
  reviews: number;
  distance: string;
  verified: boolean;
  available: boolean;
  phone: string;
  whatsapp: string;
  description: string;
  coverage: string[];
  images: string[];
  ownerId?: string;
};

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
  userId?: string;
  createdAt: string;
};

export type CreateServiceRequestPayload = Omit<
  ServiceRequest,
  'id' | 'status' | 'createdAt' | 'userId'
>;

export type CategorySubcategory = {
  id: string;
  name: string;
  description: string;
  icon: string;
};

export type AppCategory = {
  id: string;
  name: string;
  description: string;
  icon: string;
  iconColor: string;
  iconBackground: string;
  subcategories: CategorySubcategory[];
};

export type UpdateProviderPayload = {
  name?: string;
  service?: string;
  phone?: string;
  image?: string;
  images?: string[];
  categoryId?: string;
  subcategoryId?: string;
  coverage?: string[];
};

export type CreatePendingProviderPayload = {
  name: string;
  service: string;
  phone: string;
  image?: string;
  images?: string[];
  categoryId?: string;
  subcategoryId?: string;
  coverage?: string[];
  ownerId?: string;
};

export type SaveCategoryPayload = Omit<AppCategory, 'id'>;

type ProvidersStatus = 'loading' | 'ready' | 'error';

type RequestsStatus = 'idle' | 'loading' | 'ready' | 'error';

type CategoriesStatus = 'loading' | 'ready' | 'error';

type AppDataContextValue = {
  providers: DirectoryProvider[];
  featuredProviders: DirectoryProvider[];
  requests: ServiceRequest[];
  categories: AppCategory[];
  favoriteIds: string[];
  providersStatus: ProvidersStatus;
  requestsStatus: RequestsStatus;
  categoriesStatus: CategoriesStatus;
  getProvider: (id?: string) => DirectoryProvider | undefined;
  getCategory: (id?: string) => AppCategory | undefined;
  createRequest: (payload: CreateServiceRequestPayload) => Promise<ServiceRequest>;
  createPendingProvider: (payload: CreatePendingProviderPayload) => Promise<DirectoryProvider>;
  updateRequestStatus: (requestId: string, status: ServiceRequestStatus) => Promise<void>;
  updateProvider: (providerId: string, payload: UpdateProviderPayload) => Promise<void>;
  toggleProviderPublication: (providerId: string) => Promise<void>;
  toggleProviderPlan: (providerId: string) => Promise<void>;
  rateProvider: (providerId: string, rating: number) => Promise<void>;
  toggleFavorite: (providerId: string) => void;
  isFavorite: (providerId: string) => boolean;
  saveCategory: (categoryId: string | null, payload: SaveCategoryPayload) => Promise<void>;
  deleteCategory: (categoryId: string) => Promise<void>;
};

const AppDataContext = createContext<AppDataContextValue | null>(null);

export function AppDataProvider({ children }: { children: ReactNode }) {
  const { user, profile } = useAuth();
  const [providers, setProviders] = useState<DirectoryProvider[]>([]);
  const [providersStatus, setProvidersStatus] = useState<ProvidersStatus>(() =>
    isFirebaseConfigured ? 'loading' : 'error',
  );
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [requestsStatus, setRequestsStatus] = useState<RequestsStatus>('idle');
  const [categories, setCategories] = useState<AppCategory[]>([]);
  const [categoriesStatus, setCategoriesStatus] = useState<CategoriesStatus>(() =>
    isFirebaseConfigured ? 'loading' : 'error',
  );
  const [localFavorites, setLocalFavorites] = useState<string[] | null>(null);

  useEffect(() => {
    if (!isFirebaseConfigured) {
      return;
    }

    let active = true;

    const unsubscribe = (
      import('../services/firebase-categories').then(({ observeCategories }) =>
        observeCategories(
          (items) => {
            if (active) {
              setCategories(items);
              setCategoriesStatus('ready');
            }
          },
          () => {
            if (active) {
              setCategoriesStatus('error');
            }
          },
        ),
      ) as Promise<() => void>
    ).catch(() => () => undefined);

    return () => {
      active = false;
      unsubscribe.then((cleanup) => cleanup());
    };
  }, []);

  useEffect(() => {
    if (!isFirebaseConfigured) {
      return;
    }

    let active = true;

    const unsubscribe = (
      import('../services/firebase-directory').then(({ observeProviders }) =>
        observeProviders(
          (items) => {
            if (active) {
              setProviders(items);
              setProvidersStatus('ready');
            }
          },
          () => {
            if (active) {
              setProvidersStatus('error');
            }
          },
        ),
      ) as Promise<() => void>
    ).catch(() => () => undefined);

    return () => {
      active = false;
      unsubscribe.then((cleanup) => cleanup());
    };
  }, []);

  const favoriteIds = useMemo(
    () => localFavorites ?? profile?.favoriteIds ?? [],
    [localFavorites, profile?.favoriteIds],
  );

  useEffect(() => {
    if (!isFirebaseConfigured || !user) {
      return;
    }

    let active = true;

    const unsubscribe = (
      import('../services/firebase-directory').then(({ observeRequests }) => {
        if (active) {
          setRequestsStatus('loading');
        }

        return observeRequests(
          user.id,
          user.role === 'municipal_admin',
          (items) => {
            if (active) {
              setRequests(items);
              setRequestsStatus('ready');
            }
          },
          () => {
            if (active) {
              setRequestsStatus('error');
            }
          },
        );
      }) as Promise<() => void>
    ).catch(() => () => undefined);

    return () => {
      active = false;
      setRequests([]);
      setRequestsStatus('idle');
      unsubscribe.then((cleanup) => cleanup());
    };
  }, [user]);

  const value = useMemo<AppDataContextValue>(
    () => ({
      providers,
      featuredProviders: providers.filter(
        (provider) =>
          provider.publicationStatus === 'Publicado' && provider.plan === 'Destacado',
      ),
      requests,
      favoriteIds,
      providersStatus,
      requestsStatus,
      categories,
      categoriesStatus,
      getProvider: (id) => providers.find((provider) => provider.id === id),
      getCategory: (id) => categories.find((category) => category.id === id),
      createRequest: async (payload) => {
        if (!user) {
          throw new Error('Debes iniciar sesión para enviar una solicitud de servicio.');
        }

        const { createRequest: persistRequest } = await import('../services/firebase-directory');
        return persistRequest({ ...payload, userId: user.id });
      },
      createPendingProvider: async ({ name, service, phone, image, images, categoryId, subcategoryId, coverage, ownerId }) => {
        const normalizedPhone = phone.trim();
        const nextImages = [...(image ? [image.trim()] : []), ...(images ?? [])].slice(0, 6);
        const provider: DirectoryProvider = {
          id: `provider-${Date.now()}-${Math.round(Math.random() * 1e6)}`,
          name: name.trim(),
          service: service.trim(),
          categoryId: categoryId || 'hogar',
          subcategoryId: subcategoryId || 'electricidad',
          locationId: 'lago-ranco',
          locationName: 'Lago Ranco',
          rating: 0,
          reviews: 0,
          distance: 'Por definir',
          verified: false,
          available: false,
          phone: normalizedPhone,
          whatsapp: normalizedPhone.replace(/\D/g, ''),
          description: 'Perfil pendiente de completar y activar por administración.',
          coverage: coverage?.length ? coverage : ['Lago Ranco'],
          images: nextImages,
          plan: 'Base',
          publicationStatus: 'Pendiente',
          ownerId,
        };

        const { saveProvider } = await import('../services/firebase-directory');
        await saveProvider(provider);
        return provider;
      },
      updateRequestStatus: async (requestId, status) => {
        const { updateRequestStatus } = await import('../services/firebase-directory');
        await updateRequestStatus(requestId, status);
      },
      updateProvider: async (providerId, payload) => {
        const current = providers.find((provider) => provider.id === providerId);
        const changes: Partial<DirectoryProvider> = {};

        if (payload.name?.trim()) {
          changes.name = payload.name.trim();
        }

        if (payload.service?.trim()) {
          changes.service = payload.service.trim();
        }

        if (payload.phone?.trim()) {
          const phone = payload.phone.trim();
          changes.phone = phone;
          changes.whatsapp = phone.replace(/\D/g, '');
        }

        if (payload.categoryId) {
          changes.categoryId = payload.categoryId;
        }

        if (payload.subcategoryId) {
          changes.subcategoryId = payload.subcategoryId;
        }

        if (payload.coverage?.length) {
          changes.coverage = payload.coverage;
        }

        if (payload.image?.trim()) {
          changes.images = [payload.image.trim(), ...(current?.images?.slice(1) ?? [])];
        }

        if (payload.images?.length) {
          changes.images = payload.images.slice(0, 6);
        }

        const { updateProviderFields } = await import('../services/firebase-directory');
        await updateProviderFields(providerId, changes);
      },
      toggleProviderPublication: async (providerId) => {
        const current = providers.find((provider) => provider.id === providerId);
        const nextStatus =
          current?.publicationStatus === 'Publicado' ? 'Pausado' : 'Publicado';

        const { updateProviderPublication } = await import('../services/firebase-directory');
        await updateProviderPublication(providerId, nextStatus);
      },
      toggleProviderPlan: async (providerId) => {
        const current = providers.find((provider) => provider.id === providerId);
        const nextPlan: ProviderPlan = current?.plan === 'Destacado' ? 'Base' : 'Destacado';

        const { updateProviderPlan } = await import('../services/firebase-directory');
        await updateProviderPlan(providerId, nextPlan);
      },
      rateProvider: async (providerId, rating) => {
        if (!user) {
          throw new Error('Debes iniciar sesión para valorar un servicio.');
        }

        const { saveRating } = await import('../services/firebase-directory');
        await saveRating(providerId, rating, user.id);
      },
      toggleFavorite: (providerId) => {
        const next = favoriteIds.includes(providerId)
          ? favoriteIds.filter((item) => item !== providerId)
          : [...favoriteIds, providerId];

        setLocalFavorites(next);

        if (user && isFirebaseConfigured) {
          import('../services/firebase-users')
            .then(({ updateUserById }) => updateUserById(user.id, { favoriteIds: next }))
            .then(() => setLocalFavorites(null))
            .catch(() => setLocalFavorites(null));
        }
      },
      isFavorite: (providerId) => favoriteIds.includes(providerId),
      saveCategory: async (categoryId, payload) => {
        if (categoryId) {
          const { updateCategory } = await import('../services/firebase-categories');
          await updateCategory(categoryId, payload);
          return;
        }

        const { createCategory } = await import('../services/firebase-categories');
        await createCategory(payload);
      },
      deleteCategory: async (categoryId) => {
        const { deleteCategory: removeCategory } = await import(
          '../services/firebase-categories'
        );
        await removeCategory(categoryId);
      },
    }),
    [
      favoriteIds,
      providers,
      providersStatus,
      requests,
      requestsStatus,
      categories,
      categoriesStatus,
      user,
    ],
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
