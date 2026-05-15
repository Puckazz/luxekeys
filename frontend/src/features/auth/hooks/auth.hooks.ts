import { authApi } from '@/features/auth/api/auth.api';
import {
  ApiError,
  AuthResponse,
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  LoginRequest,
  RegisterRequest,
  ResetPasswordRequest,
  ResetPasswordResponse,
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

export const useForgotPassword = () => {
  return useMutation<ForgotPasswordResponse, ApiError, ForgotPasswordRequest>({
    mutationFn: authApi.forgotPassword,
  });
};

export const useResetPassword = () => {
  return useMutation<ResetPasswordResponse, ApiError, ResetPasswordRequest>({
    mutationFn: authApi.resetPassword,
  });
};
