import type { UserRole } from '@/lib/rbac';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  confirmpassword: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ForgotPasswordResponse {
  message: string;
}

export interface ResetPasswordRequest {
  email: string;
  code: string;
  password: string;
}

export interface ResetPasswordResponse {
  passwordReset: boolean;
}

export interface AuthResponse {
  success: boolean;
  user: AuthUser;
  message?: string;
  accessToken: string;
  tokenType: 'Bearer';
  expiresIn: number;
}

export interface AuthSession {
  user: AuthUser;
  tokenType: 'Bearer';
  expiresAt: number;
}

export class ApiError extends Error {
  statusCode?: number;
  fieldErrors?: Record<string, string>;

  constructor(
    message: string,
    fieldErrors?: Record<string, string>,
    statusCode?: number
  ) {
    super(message);
    this.name = 'ApiError';
    this.fieldErrors = fieldErrors;
    this.statusCode = statusCode;
  }
}
