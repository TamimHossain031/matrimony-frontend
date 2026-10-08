'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { queryKeys } from '@/lib/query-keys';
import type { ApiResource, ReportRequest, ContactBlockRequest } from '@/types/api';
import type { Block, ContactBlock } from '@/types/models';

// ---- User blocks -----------------------------------------------------------

export function useBlocks() {
  return useQuery({
    queryKey: queryKeys.safety.blocks,
    queryFn: () => apiClient.get<ApiResource<Block[]>>('/blocks'),
    select: (r) => r.data,
  });
}

export function useBlockUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (publicId: string) =>
      apiClient.post<{ message: string }>('/blocks', { profile_id: publicId }),
    onSettled: () => {
      qc.invalidateQueries({ queryKey: queryKeys.safety.blocks });
      qc.invalidateQueries({ queryKey: ['discovery'] });
    },
  });
}

export function useUnblockUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (publicId: string) =>
      apiClient.delete<{ message: string }>(`/blocks/${publicId}`),
    onSettled: () => qc.invalidateQueries({ queryKey: queryKeys.safety.blocks }),
  });
}

// ---- Report ----------------------------------------------------------------

export function useReportProfile() {
  return useMutation({
    mutationFn: (payload: ReportRequest) =>
      apiClient.post<{ message: string }>('/reports', payload),
  });
}

// ---- Relative contact blocklist (D2) ---------------------------------------

export function useContactBlocks() {
  return useQuery({
    queryKey: queryKeys.safety.contactBlocks,
    queryFn: () => apiClient.get<ApiResource<ContactBlock[]>>('/contact-blocks'),
    select: (r) => r.data,
  });
}

export function useAddContactBlocks() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: ContactBlockRequest) =>
      apiClient.post<{ message: string; invalid: string[] }>('/contact-blocks', payload),
    onSettled: () => qc.invalidateQueries({ queryKey: queryKeys.safety.contactBlocks }),
  });
}

export function useRemoveContactBlock() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      apiClient.delete<{ message: string }>(`/contact-blocks/${id}`),
    onSettled: () => qc.invalidateQueries({ queryKey: queryKeys.safety.contactBlocks }),
  });
}
