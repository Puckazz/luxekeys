import {
  ApiError,
  AuthResponse,
  AuthUser,
  LoginRequest,
  RegisterRequest,
} from '@/features/auth/types';
import { USER_ROLES, type UserRole } from '@/lib/rbac';
import {
  apiRequest,
  authFetch,
  configureAuthRefresh,
} from '@/shared/api/http-client';

type BackendAuthUser = {
  id: string;
  email: string;
  fullName: string;
  role: string;
};

type BackendAuthResponse = {
  user: BackendAuthUser;
  accessToken: string;
  tokenType: 'Bearer';
  expiresIn: number;
};

const mapBackendRole = (role: string): UserRole => {
  const normalizedRole = role.toLowerCase();
  return USER_ROLES.includes(normalizedRole as UserRole)
    ? (normalizedRole as UserRole)
    : 'customer';
};

const mapBackendUser = (user: BackendAuthUser): AuthUser => {
  return {
    id: user.id,
    email: user.email,
    name: user.fullName,
    role: mapBackendRole(user.role),
  };
};

const toAuthResponse = (
  response: BackendAuthResponse,
  message?: string
): AuthResponse => {
  return {
    success: true,
    user: mapBackendUser(response.user),
    accessToken: response.accessToken,
    tokenType: response.tokenType,
    expiresIn: response.expiresIn,
    message,
  };
};

const withAuthFieldErrors = (
  error: unknown,
  fieldErrors: Record<string, string>
): never => {
  if (!(error instanceof ApiError)) {
    throw error;
  }

  throw new ApiError(
    error.message,
    { ...fieldErrors, ...error.fieldErrors },
    error.statusCode
  );
};

const requestAuth = async (
  path: string,
  body?: unknown,
  authToken?: string
): Promise<AuthResponse> => {
  const response = await apiRequest<BackendAuthResponse>(path, {
    method: 'POST',
    ...(body !== undefined && { body: JSON.stringify(body) }),
    ...(authToken && { authToken }),
  });

  return toAuthResponse(response);
};

export const authApi = {
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    try {
      return await requestAuth('/auth/login', data);
    } catch (error) {
      return withAuthFieldErrors(error, {
        password: 'Invalid email or password',
      });
    }
  },

  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    try {
      return await requestAuth('/auth/register', {
        fullName: data.name,
        email: data.email,
        password: data.password,
      });
    } catch (error) {
      return withAuthFieldErrors(error, {
        email: 'Email is already registered',
      });
    }
  },

  refresh: (): Promise<AuthResponse> => {
    return requestAuth('/auth/refresh');
  },

  logout: (): Promise<{ loggedOut: boolean }> => {
    return authFetch<{ loggedOut: boolean }>('/auth/logout', {
      method: 'POST',
    });
  },
};

configureAuthRefresh(authApi.refresh);
