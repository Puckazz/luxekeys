import type { AuthResponse, AuthSession, AuthUser } from '@/features/auth/types';
import { AUTH_SESSION_STORAGE_KEY } from '@/lib/auth-constants';

export { AUTH_SESSION_STORAGE_KEY };

const isClient = () => typeof window !== 'undefined';

let accessTokenMemory: string | null = null;
let accessTokenExpiresAtMemory = 0;
const authSessionListeners = new Set<(user: AuthUser | null) => void>();

const notifyAuthSessionChange = (user: AuthUser | null): void => {
  authSessionListeners.forEach((listener) => {
    listener(user);
  });
};

export const subscribeAuthSession = (
  listener: (user: AuthUser | null) => void
): (() => void) => {
  authSessionListeners.add(listener);
  return () => {
    authSessionListeners.delete(listener);
  };
};

export const persistAuthSession = (response: AuthResponse): void => {
  if (!isClient()) {
    return;
  }

  accessTokenMemory = response.accessToken;
  accessTokenExpiresAtMemory = Date.now() + response.expiresIn * 1000;

  const session: AuthSession = {
    user: response.user,
    tokenType: response.tokenType,
    expiresAt: accessTokenExpiresAtMemory,
  };

  window.localStorage.setItem(AUTH_SESSION_STORAGE_KEY, JSON.stringify(session));

  notifyAuthSessionChange(response.user);
};

export const updateAuthSessionUser = (user: AuthUser): void => {
  if (!isClient()) {
    return;
  }

  const currentSession = getStoredAuthSession();

  if (!currentSession) {
    notifyAuthSessionChange(user);
    return;
  }

  const nextSession: AuthSession = {
    ...currentSession,
    user,
  };

  window.localStorage.setItem(
    AUTH_SESSION_STORAGE_KEY,
    JSON.stringify(nextSession)
  );

  notifyAuthSessionChange(user);
};

export const clearAuthSession = (): void => {
  accessTokenMemory = null;
  accessTokenExpiresAtMemory = 0;

  if (!isClient()) {
    return;
  }

  window.localStorage.removeItem(AUTH_SESSION_STORAGE_KEY);
  notifyAuthSessionChange(null);
};

export const getStoredAuthSession = (): AuthSession | null => {
  if (!isClient()) {
    return null;
  }

  const raw = window.localStorage.getItem(AUTH_SESSION_STORAGE_KEY);

  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<AuthSession>;

    if (
      !parsed.user ||
      parsed.tokenType !== 'Bearer' ||
      typeof parsed.expiresAt !== 'number'
    ) {
      return null;
    }

    return parsed as AuthSession;
  } catch {
    return null;
  }
};

export const getAuthSession = (): AuthUser | null => {
  return getStoredAuthSession()?.user ?? null;
};

export const getAuthAccessToken = (): string | null => {
  if (!accessTokenMemory || accessTokenExpiresAtMemory <= Date.now()) {
    return null;
  }

  return accessTokenMemory;
};
