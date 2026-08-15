import type { ReactNode } from 'react';
import { createContext, useContext, useMemo, useState } from 'react';

import { isFirebaseConfigured } from '../lib/firebase-config';

export type UserRole = 'guest' | 'commerce' | 'municipal_admin';

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
};

export type ManagedUser = AuthUser & {
  password: string;
  status: 'ACTIVE_COMMERCE' | 'PENDING_MUNICIPAL_APPROVAL' | 'MUNICIPAL_ADMIN';
  businessName?: string;
  serviceName?: string;
  phone?: string;
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

type AuthContextValue = {
  user: AuthUser | null;
  managedUsers: ManagedUser[];
  login: (payload: LoginPayload) => Promise<{ ok: true } | { ok: false; message: string }>;
  createCommerceUser: (
    payload: CreateCommerceUserPayload,
  ) => Promise<{ ok: true; user: ManagedUser } | { ok: false; message: string }>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const INITIAL_USERS: ManagedUser[] = [
  {
    id: 'municipal_admin-admin@lagoranco.cl',
    name: 'Administrador municipal',
    email: 'admin@lagoranco.cl',
    password: 'ranco-admin',
    role: 'municipal_admin',
    status: 'MUNICIPAL_ADMIN',
  },
  {
    id: 'commerce-comercio@demo.cl',
    name: 'Comercio local',
    email: 'comercio@demo.cl',
    password: 'comercio-demo',
    role: 'commerce',
    status: 'PENDING_MUNICIPAL_APPROVAL',
    businessName: 'Comercio local',
    serviceName: 'Ficha de prueba',
    phone: '+56987654321',
  },
];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [managedUsers, setManagedUsers] = useState<ManagedUser[]>(INITIAL_USERS);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      managedUsers,
      login: async ({ email, password, role }) => {
        const normalizedEmail = email.trim().toLowerCase();

        if (!normalizedEmail) {
          return { ok: false, message: 'Ingresa un correo para continuar.' };
        }

        if (isFirebaseConfigured) {
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
              message: error instanceof Error ? error.message : 'No se pudo iniciar sesión con Firebase.',
            };
          }
        }

        const matchedUser = managedUsers.find(
          (item) => item.email === normalizedEmail && item.role === role,
        );

        if (!matchedUser || password.trim() !== matchedUser.password) {
          return { ok: false, message: 'Revisa la clave e intenta nuevamente.' };
        }

        setUser({
          id: matchedUser.id,
          name: matchedUser.name,
          email: matchedUser.email,
          role: matchedUser.role,
        });

        return { ok: true };
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

        if (managedUsers.some((item) => item.email === normalizedEmail)) {
          return { ok: false, message: 'Ya existe un usuario con ese correo.' };
        }

        const nextUser = isFirebaseConfigured
          ? await import('../services/firebase-users').then(({ createCommerceAccount }) =>
              createCommerceAccount({
                name: name.trim(),
                email: normalizedEmail,
                password: password.trim(),
                businessName: businessName.trim(),
                serviceName: serviceName.trim(),
                phone: phone.trim(),
              }),
            )
          : {
              id: `commerce-${normalizedEmail}`,
              name: name.trim(),
              email: normalizedEmail,
              password: password.trim(),
              role: 'commerce',
              status: 'PENDING_MUNICIPAL_APPROVAL',
              businessName: businessName.trim(),
              serviceName: serviceName.trim(),
              phone: phone.trim(),
            } satisfies ManagedUser;

        setManagedUsers((current) => [nextUser, ...current]);
        return { ok: true, user: nextUser };
      },
      logout: async () => {
        if (isFirebaseConfigured) {
          const { signOutUser } = await import('../services/firebase-users');
          await signOutUser().catch(() => undefined);
        }

        setUser(null);
      },
    }),
    [managedUsers, user],
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
