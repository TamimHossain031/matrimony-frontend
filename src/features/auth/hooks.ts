'use client';

import { useMutation } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { useAuth } from '@/components/providers/AuthProvider';
import type {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  ChangePasswordRequest,
} from '@/types/api';
import type { LoginValues, RegisterValues } from './schemas';

export function useLogin() {
  const { signIn } = useAuth();
  return useMutation({
    mutationFn: (values: LoginValues) => {
      const payload: LoginRequest = {
        login: values.login,
        password: values.password,
        device_name: 'web',
      };
      return apiClient.post<AuthResponse>('/auth/login', payload);
    },
    onSuccess: (res) => signIn(res.token, res.user),
  });
}

export function useRegister() {
  const { signIn } = useAuth();
  return useMutation({
    mutationFn: (values: RegisterValues) => {
      const payload: RegisterRequest = { ...values, device_name: 'web' };
      return apiClient.post<AuthResponse>('/auth/register', payload);
    },
    onSuccess: (res) => signIn(res.token, res.user),
  });
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: (email: string) =>
      apiClient.post<{ message: string }>('/auth/forgot-password', { email }),
  });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: (payload: {
      token: string;
      email: string;
      password: string;
      password_confirmation: string;
    }) => apiClient.post<{ message: string }>('/auth/reset-password', payload),
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (payload: ChangePasswordRequest) =>
      apiClient.post<{ message: string }>('/auth/change-password', payload),
  });
}
