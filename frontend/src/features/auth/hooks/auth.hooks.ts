import { authApi } from '@/api/auth.api';
import {
  AuthApiError,
  AuthResponse,
  LoginRequest,
  RegisterRequest,
} from '@/features/auth/types';
import { useMutation } from '@tanstack/react-query';

export const useLogin = () => {
  return useMutation<AuthResponse, AuthApiError, LoginRequest>({
    mutationFn: authApi.login,
  });
};

export const useRegister = () => {
  return useMutation<AuthResponse, AuthApiError, RegisterRequest>({
    mutationFn: authApi.register,
  });
};
