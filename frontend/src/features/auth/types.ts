export interface AuthUser {
  id: string;
  email: string;
  name: string;
  password: string;
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
export interface AuthResponse {
  success: boolean;
  user?: AuthUser;
  message?: string;
}

export class AuthApiError extends Error {
  fieldErrors?: Record<string, string>;

  constructor(message: string, fieldErrors?: Record<string, string>) {
    super(message);
    this.name = 'AuthApiError';
    this.fieldErrors = fieldErrors;
  }
}
