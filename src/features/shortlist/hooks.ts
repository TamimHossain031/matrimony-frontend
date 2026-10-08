'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { queryKeys } from '@/lib/query-keys';
import type { ApiResource, ShortlistRequest } from '@/types/api';
import type { ShortlistItem } from '@/types/models';

export function useShortlists() {
  return useQuery({
    queryKey: queryKeys.shortlists,
    queryFn: () => apiClient.get<ApiResource<ShortlistItem[]>>('/shortlists'),
    staleTime: 60 * 1000,
    select: (r) => r.data,
  });
}

// Convenience: is a given public_id already shortlisted?
export function useIsShortlisted(publicId: string | undefined) {
  const { data } = useShortlists();
  return !!publicId && !!data?.some((s) => s.profile.public_id === publicId);
}

export function useAddShortlist() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: ShortlistRequest) =>
      apiClient.post<{ message: string }>('/shortlists', payload),
    onSettled: () => {
      qc.invalidateQueries({ queryKey: queryKeys.shortlists });
      qc.invalidateQueries({ queryKey: queryKeys.dashboard });
    },
  });
}

export function useRemoveShortlist() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (publicId: string) =>
      apiClient.delete<{ message: string }>(`/shortlists/${publicId}`),
    // Optimistically drop it from the list.
    onMutate: async (publicId) => {
      await qc.cancelQueries({ queryKey: queryKeys.shortlists });
      const prev = qc.getQueryData<ApiResource<ShortlistItem[]>>(queryKeys.shortlists);
      if (prev) {
        qc.setQueryData<ApiResource<ShortlistItem[]>>(queryKeys.shortlists, {
          data: prev.data.filter((s) => s.profile.public_id !== publicId),
        });
      }
      return { prev };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.prev) qc.setQueryData(queryKeys.shortlists, ctx.prev);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: queryKeys.shortlists });
      qc.invalidateQueries({ queryKey: queryKeys.dashboard });
    },
  });
}
