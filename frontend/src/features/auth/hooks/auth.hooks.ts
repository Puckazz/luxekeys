import { authApi } from '@/api/auth.api';
import {
  ApiError,
  AuthResponse,
  LoginRequest,
  RegisterRequest,
} from '@/features/auth/types';
import { useMutation } from '@tanstack/react-query';

export const useLogin = () => {
  return useMutation<AuthResponse, ApiError, LoginRequest>({
    mutationFn: authApi.login,
  });
};

export const useRegister = () => {
  return useMutation<AuthResponse, ApiError, RegisterRequest>({
    mutationFn: authApi.register,
  });
};
