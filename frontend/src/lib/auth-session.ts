import type { AuthUser } from '@/features/auth/types';
import {
  AUTH_ROLE_COOKIE_KEY,
  AUTH_SESSION_STORAGE_KEY,
  ROLE_COOKIE_MAX_AGE_SECONDS,
} from '@/lib/auth-constants';

export { AUTH_ROLE_COOKIE_KEY, AUTH_SESSION_STORAGE_KEY };

const isClient = () => typeof window !== 'undefined';

export const persistAuthSession = (user: AuthUser): void => {
  if (!isClient()) {
    return;
  }

  window.localStorage.setItem(AUTH_SESSION_STORAGE_KEY, JSON.stringify(user));

  document.cookie = `${AUTH_ROLE_COOKIE_KEY}=${user.role}; Path=/; Max-Age=${ROLE_COOKIE_MAX_AGE_SECONDS}; SameSite=Lax`;
};

export const clearAuthSession = (): void => {
  if (!isClient()) {
    return;
  }

  window.localStorage.removeItem(AUTH_SESSION_STORAGE_KEY);
  document.cookie = `${AUTH_ROLE_COOKIE_KEY}=; Path=/; Max-Age=0; SameSite=Lax`;
};

export const getAuthSession = (): AuthUser | null => {
  if (!isClient()) {
    return null;
  }

  const raw = window.localStorage.getItem(AUTH_SESSION_STORAGE_KEY);

  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
};
