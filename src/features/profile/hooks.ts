'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { queryKeys } from '@/lib/query-keys';
import type { ApiResource, ProfileInput } from '@/types/api';
import type { Profile, DashboardSummary, MatchBreakdown } from '@/types/models';
import type { AccountStatus } from '@/types/enums';

// Own profile (404 when not yet created).
export function useMyProfile() {
  return useQuery({
    queryKey: queryKeys.profile.me,
    queryFn: () => apiClient.get<ApiResource<Profile>>('/profile'),
    staleTime: 5 * 60 * 1000,
    select: (r) => r.data,
    retry: false,
  });
}

interface ProfileDetailResponse {
  data: Profile;
  match?: MatchBreakdown;
}

export function useProfileDetail(publicId: string) {
  return useQuery({
    queryKey: queryKeys.profile.detail(publicId),
    queryFn: () => apiClient.get<ProfileDetailResponse>(`/profiles/${publicId}`),
    enabled: !!publicId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: ProfileInput) =>
      apiClient.post<ApiResource<Profile>>('/profile', input),
    onSuccess: (res) => {
      qc.setQueryData<ApiResource<Profile>>(queryKeys.profile.me, res);
      qc.invalidateQueries({ queryKey: queryKeys.auth.me });
      qc.invalidateQueries({ queryKey: queryKeys.dashboard });
    },
  });
}

export function useUpdateProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: ProfileInput) =>
      apiClient.patch<ApiResource<Profile>>('/profile', input),
    onSuccess: (res) => {
      qc.setQueryData<ApiResource<Profile>>(queryKeys.profile.me, res);
      qc.invalidateQueries({ queryKey: queryKeys.dashboard });
    },
  });
}

export function useUpdateAccountStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (status: Extract<AccountStatus, 'active' | 'hidden' | 'deactivated'>) =>
      apiClient.patch<{ message: string; status: string }>('/profile/status', { status }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.auth.me });
      qc.invalidateQueries({ queryKey: queryKeys.profile.me });
    },
  });
}

export function useDeleteProfile() {
  return useMutation({
    mutationFn: () => apiClient.delete<{ message: string }>('/profile'),
  });
}

export function useDashboard() {
  return useQuery({
    queryKey: queryKeys.dashboard,
    queryFn: () => apiClient.get<ApiResource<DashboardSummary>>('/dashboard'),
    staleTime: 60 * 1000,
    select: (r) => r.data,
  });
}
