'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { apiClient, getAuthToken, setAuthToken } from '@/lib/api-client';
import { queryKeys } from '@/lib/query-keys';
import type { ApiResource } from '@/types/api';
import type { User } from '@/types/models';

interface AuthContextValue {
  user: User | null;
  token: string | null;
  isReady: boolean; // token hydration finished
  isLoading: boolean; // fetching /auth/me
  isAuthenticated: boolean;
  signIn: (token: string, user: User) => void;
  signOut: (redirect?: boolean) => Promise<void>;
  refresh: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const queryClient = useQueryClient();
  const router = useRouter();

  // Hydrate the token from storage once on mount.
  useEffect(() => {
    setToken(getAuthToken());
    setIsReady(true);
  }, []);

  const meQuery = useQuery({
    queryKey: queryKeys.auth.me,
    queryFn: () => apiClient.get<ApiResource<User>>('/auth/me'),
    enabled: isReady && !!token,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  const signIn = useCallback(
    (newToken: string, user: User) => {
      setAuthToken(newToken);
      setToken(newToken);
      queryClient.setQueryData<ApiResource<User>>(queryKeys.auth.me, { data: user });
    },
    [queryClient],
  );

  const signOut = useCallback(
    async (redirect = true) => {
      try {
        if (getAuthToken()) await apiClient.post('/auth/logout');
      } catch {
        // ignore — clearing locally is what matters
      }
      setAuthToken(null);
      setToken(null);
      queryClient.clear();
      if (redirect) router.replace('/login');
    },
    [queryClient, router],
  );

  // The api-client dispatches this on any 401.
  useEffect(() => {
    const handler = () => {
      setAuthToken(null);
      setToken(null);
      queryClient.clear();
      const path = window.location.pathname;
      if (!path.startsWith('/login') && !path.startsWith('/register')) {
        router.replace('/login');
      }
    };
    window.addEventListener('auth:unauthorized', handler);
    return () => window.removeEventListener('auth:unauthorized', handler);
  }, [queryClient, router]);

  const value: AuthContextValue = {
    user: meQuery.data?.data ?? null,
    token,
    isReady,
    isLoading: meQuery.isLoading && !!token,
    isAuthenticated: isReady && !!token,
    signIn,
    signOut,
    refresh: () => queryClient.invalidateQueries({ queryKey: queryKeys.auth.me }),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
