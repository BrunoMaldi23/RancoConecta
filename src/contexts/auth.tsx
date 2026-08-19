import type { ReactNode } from 'react';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';

import { firebaseAuth, isFirebaseConfigured } from '../lib/firebase';

export type UserRole = 'guest' | 'commerce' | 'municipal_admin';

export type UserStatus = 'ACTIVE_COMMERCE' | 'PENDING_MUNICIPAL_APPROVAL' | 'MUNICIPAL_ADMIN';

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
};

export type ManagedUser = AuthUser & {
  status: UserStatus;
  businessName?: string;
  serviceName?: string;
  phone?: string;
  favoriteIds?: string[];
};

type LoginPayload = {
  email: string;
  password: string;
  role: Exclude<UserRole, 'guest'>;
};

type CreateCommerceUserPayload = {
  name: string;
  email: string;
  password: string;
  businessName: string;
  serviceName: string;
  phone: string;
};

type UpdateOwnProfilePayload = {
  businessName?: string;
  serviceName?: string;
  phone?: string;
};

type AuthContextValue = {
  user: AuthUser | null;
  profile: ManagedUser | null;
  managedUsers: ManagedUser[];
  authReady: boolean;
  login: (payload: LoginPayload) => Promise<{ ok: true } | { ok: false; message: string }>;
  createCommerceUser: (
    payload: CreateCommerceUserPayload,
  ) => Promise<{ ok: true; user: ManagedUser } | { ok: false; message: string }>;
  updateOwnProfile: (payload: UpdateOwnProfilePayload) => Promise<void>;
  refreshProfile: () => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<ManagedUser | null>(null);
  const [managedUsers, setManagedUsers] = useState<ManagedUser[]>([]);
  const [authReady, setAuthReady] = useState(() => !firebaseAuth);

  useEffect(() => {
    if (!firebaseAuth) {
      return;
    }

    let mounted = true;

    const unsubscribe = onAuthStateChanged(firebaseAuth, async (firebaseUser) => {
      if (!mounted) {
        return;
      }

      if (!firebaseUser) {
        setUser(null);
        setProfile(null);
        setAuthReady(true);
        return;
      }

      try {
        const { fetchUserById } = await import('../services/firebase-users');
        const documentUser = await fetchUserById(firebaseUser.uid);

        if (!mounted) {
          return;
        }

        if (documentUser) {
          setUser({
            id: firebaseUser.uid,
            name: documentUser.name,
            email: documentUser.email,
            role: documentUser.role,
          });
          setProfile(documentUser);
        } else {
          setUser(null);
          setProfile(null);
        }
      } catch {
        if (mounted) {
          setUser(null);
          setProfile(null);
        }
      } finally {
        if (mounted) {
          setAuthReady(true);
        }
      }
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!isFirebaseConfigured || user?.role !== 'municipal_admin') {
      return;
    }

    let mounted = true;
    let unsubscribe: (() => void) | undefined;

    import('../services/firebase-users')
      .then(({ observeUsers }) => {
        if (!mounted) {
          return;
        }

        unsubscribe = observeUsers(
          (users) => {
            if (mounted) {
              setManagedUsers(users);
            }
          },
          () => undefined,
        );
      })
      .catch(() => undefined);

    return () => {
      mounted = false;
      setManagedUsers([]);
      unsubscribe?.();
    };
  }, [user]);

  useEffect(() => {
    if (!isFirebaseConfigured || !user) {
      return;
    }

    let mounted = true;
    let unsubscribe: (() => void) | undefined;

    import('../services/firebase-users')
      .then(({ observeUserDoc }) => {
        if (!mounted) {
          return;
        }

        unsubscribe = observeUserDoc(
          user.id,
          (documentUser) => {
            if (mounted && documentUser) {
              setProfile(documentUser);
            }
          },
          () => undefined,
        );
      })
      .catch(() => undefined);

    return () => {
      mounted = false;
      unsubscribe?.();
    };
  }, [user]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      profile,
      managedUsers,
      authReady,
      login: async ({ email, password, role }) => {
        const normalizedEmail = email.trim().toLowerCase();

        if (!normalizedEmail || !password.trim()) {
          return { ok: false, message: 'Ingresa tu correo y contraseña para continuar.' };
        }

        if (!isFirebaseConfigured) {
          return {
            ok: false,
            message: 'Firebase no está configurado. Revisa las variables de entorno.',
          };
        }

        try {
          const { signInUser } = await import('../services/firebase-users');
          const firebaseUser = await signInUser(normalizedEmail, password);

          if (firebaseUser.role !== role) {
            return { ok: false, message: 'Este usuario no tiene acceso a ese perfil.' };
          }

          setUser(firebaseUser);
          return { ok: true };
        } catch (error) {
          return {
            ok: false,
            message: error instanceof Error ? error.message : 'No se pudo iniciar sesión.',
          };
        }
      },
      createCommerceUser: async ({
        name,
        email,
        password,
        businessName,
        serviceName,
        phone,
      }) => {
        const normalizedEmail = email.trim().toLowerCase();

        if (
          !name.trim() ||
          !normalizedEmail ||
          !password.trim() ||
          !businessName.trim() ||
          !serviceName.trim() ||
          !phone.trim()
        ) {
          return { ok: false, message: 'Completa todos los datos del usuario.' };
        }

        if (!isFirebaseConfigured) {
          return {
            ok: false,
            message: 'Firebase no está configurado. Revisa las variables de entorno.',
          };
        }

        try {
          const { createCommerceAccount } = await import('../services/firebase-users');
          const nextUser = await createCommerceAccount({
            name: name.trim(),
            email: normalizedEmail,
            password: password.trim(),
            businessName: businessName.trim(),
            serviceName: serviceName.trim(),
            phone: phone.trim(),
          });

          return { ok: true, user: nextUser };
        } catch (error) {
          return {
            ok: false,
            message: error instanceof Error ? error.message : 'No se pudo crear el usuario.',
          };
        }
      },
      updateOwnProfile: async ({ businessName, serviceName, phone }) => {
        if (!user || !isFirebaseConfigured) {
          return;
        }

        const { updateUserById } = await import('../services/firebase-users');
        await updateUserById(user.id, {
          businessName,
          serviceName,
          phone,
        });
      },
      refreshProfile: async () => {
        if (!firebaseAuth?.currentUser) {
          return;
        }

        const { fetchUserById } = await import('../services/firebase-users');
        const documentUser = await fetchUserById(firebaseAuth.currentUser.uid);

        if (documentUser) {
          setUser({
            id: firebaseAuth.currentUser.uid,
            name: documentUser.name,
            email: documentUser.email,
            role: documentUser.role,
          });
          setProfile(documentUser);
        }
      },
      logout: async () => {
        if (isFirebaseConfigured) {
          const { signOutUser } = await import('../services/firebase-users');
          await signOutUser().catch(() => undefined);
        }

        setUser(null);
        setProfile(null);
        setManagedUsers([]);
      },
    }),
    [authReady, managedUsers, profile, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);

  if (!value) {
    throw new Error('useAuth must be used inside AuthProvider');
  }

  return value;
}