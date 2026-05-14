import { ApiError } from '@/features/auth/types';
import {
  clearAuthSession,
  getAuthAccessToken,
  persistAuthSession,
} from '@/lib/auth-session';
import type { AuthResponse } from '@/features/auth/types';

const DEFAULT_API_BASE_URL = 'http://localhost:5000/api';

type BackendSuccessResponse<T> = {
  success: true;
  statusCode: number;
  message: string;
  data: T;
  meta?: unknown;
};

export type ApiResponseWithMeta<T, TMeta = unknown> = {
  data: T;
  meta?: TMeta;
};

type BackendErrorResponse = {
  statusCode?: number;
  message?: string | string[];
  error?: string;
};

type ApiRequestOptions = RequestInit & {
  authToken?: string;
};

type RefreshAuthSession = () => Promise<AuthResponse>;

let refreshAuthSession: RefreshAuthSession | null = null;

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? DEFAULT_API_BASE_URL;

const buildApiUrl = (path: string): string => {
  return `${API_BASE_URL.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
};

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null;
};

const isBackendErrorResponse = (
  value: unknown
): value is BackendErrorResponse => {
  return isRecord(value);
};

const getErrorMessage = (payload: unknown, fallback: string): string => {
  if (!isBackendErrorResponse(payload)) {
    return fallback;
  }

  if (Array.isArray(payload.message)) {
    return payload.message[0] ?? fallback;
  }

  return payload.message ?? fallback;
};

const getFieldErrors = (payload: unknown): Record<string, string> | undefined => {
  if (!isBackendErrorResponse(payload) || !Array.isArray(payload.message)) {
    return undefined;
  }

  const entries = payload.message
    .map((message) => {
      const field = message.split(' ')[0];
      return field ? ([field, message] as const) : undefined;
    })
    .filter((entry): entry is readonly [string, string] => Boolean(entry));

  return entries.length > 0 ? Object.fromEntries(entries) : undefined;
};

const parseJson = async (response: Response): Promise<unknown> => {
  const text = await response.text();

  if (!text) {
    return undefined;
  }

  try {
    return JSON.parse(text) as unknown;
  } catch {
    return undefined;
  }
};

const createHeaders = (options: ApiRequestOptions): Headers => {
  const headers = new Headers(options.headers);
  const isFormDataBody =
    typeof FormData !== 'undefined' && options.body instanceof FormData;

  if (!headers.has('Content-Type') && options.body && !isFormDataBody) {
    headers.set('Content-Type', 'application/json');
  }

  if (options.authToken) {
    headers.set('Authorization', `Bearer ${options.authToken}`);
  }

  return headers;
};

const createFetchOptions = (options: ApiRequestOptions): RequestInit => {
  const fetchOptions = { ...options };
  delete fetchOptions.authToken;
  return fetchOptions;
};

export const apiRequest = async <T>(
  path: string,
  options: ApiRequestOptions = {}
): Promise<T> => {
  const response = await fetch(buildApiUrl(path), {
    ...createFetchOptions(options),
    headers: createHeaders(options),
    credentials: 'include',
  });
  const payload = await parseJson(response);

  if (!response.ok) {
    throw new ApiError(
      getErrorMessage(payload, response.statusText),
      getFieldErrors(payload),
      response.status
    );
  }

  if (!isRecord(payload) || !('data' in payload)) {
    throw new ApiError('Unexpected API response', undefined, response.status);
  }

  return (payload as BackendSuccessResponse<T>).data;
};

export const apiRequestWithMeta = async <T, TMeta = unknown>(
  path: string,
  options: ApiRequestOptions = {}
): Promise<ApiResponseWithMeta<T, TMeta>> => {
  const response = await fetch(buildApiUrl(path), {
    ...createFetchOptions(options),
    headers: createHeaders(options),
    credentials: 'include',
  });
  const payload = await parseJson(response);

  if (!response.ok) {
    throw new ApiError(
      getErrorMessage(payload, response.statusText),
      getFieldErrors(payload),
      response.status
    );
  }

  if (!isRecord(payload) || !('data' in payload)) {
    throw new ApiError('Unexpected API response', undefined, response.status);
  }

  const successPayload = payload as BackendSuccessResponse<T>;

  return {
    data: successPayload.data,
    meta: successPayload.meta as TMeta | undefined,
  };
};

export const configureAuthRefresh = (
  refreshSession: RefreshAuthSession
): void => {
  refreshAuthSession = refreshSession;
};

export const authFetch = async <T>(
  path: string,
  options: RequestInit = {}
): Promise<T> => {
  const requestWithToken = (token: string | null) => {
    return apiRequest<T>(path, {
      ...options,
      ...(token && { authToken: token }),
    });
  };

  try {
    return await requestWithToken(getAuthAccessToken());
  } catch (error) {
    if (
      !(error instanceof ApiError) ||
      error.statusCode !== 401 ||
      !refreshAuthSession
    ) {
      throw error;
    }

    try {
      const refreshedSession = await refreshAuthSession();
      persistAuthSession(refreshedSession);
      return await requestWithToken(refreshedSession.accessToken);
    } catch (refreshError) {
      clearAuthSession();
      throw refreshError;
    }
  }
};

export const authFetchWithMeta = async <T, TMeta = unknown>(
  path: string,
  options: RequestInit = {}
): Promise<ApiResponseWithMeta<T, TMeta>> => {
  const requestWithToken = (token: string | null) => {
    return apiRequestWithMeta<T, TMeta>(path, {
      ...options,
      ...(token && { authToken: token }),
    });
  };

  try {
    return await requestWithToken(getAuthAccessToken());
  } catch (error) {
    if (
      !(error instanceof ApiError) ||
      error.statusCode !== 401 ||
      !refreshAuthSession
    ) {
      throw error;
    }

    try {
      const refreshedSession = await refreshAuthSession();
      persistAuthSession(refreshedSession);
      return await requestWithToken(refreshedSession.accessToken);
    } catch (refreshError) {
      clearAuthSession();
      throw refreshError;
    }
  }
};
