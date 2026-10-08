'use client';

import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
  type InfiniteData,
} from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { queryKeys } from '@/lib/query-keys';
import type { ApiCollection, ApiResource, SendInterestRequest } from '@/types/api';
import type { Interest } from '@/types/models';
import type { InterestAction, InterestStatus } from '@/types/enums';

type Box = 'received' | 'sent';

export function useInterests(box: Box) {
  return useInfiniteQuery({
    queryKey: queryKeys.interests.box(box),
    queryFn: ({ pageParam }) =>
      apiClient.get<ApiCollection<Interest>>(`/interests/${box}`, {
        cursor: pageParam as string | undefined,
      }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) => (last.has_more ? last.next_cursor : undefined),
    staleTime: 30 * 1000,
  });
}

export function useSendInterest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: SendInterestRequest) =>
      apiClient.post<ApiResource<Interest>>('/interests', payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.interests.box('sent') });
      qc.invalidateQueries({ queryKey: queryKeys.dashboard });
    },
  });
}

const ACTION_TO_STATUS: Record<InterestAction, InterestStatus> = {
  accept: 'accepted',
  reject: 'rejected',
  withdraw: 'withdrawn',
  disconnect: 'disconnected',
};

export function useRespondInterest(box: Box) {
  const qc = useQueryClient();
  const key = queryKeys.interests.box(box);

  return useMutation({
    mutationFn: ({ id, action }: { id: number; action: InterestAction }) =>
      apiClient.patch<ApiResource<Interest>>(`/interests/${id}`, { action }),

    // Optimistic status change with rollback on error (blueprint §3).
    onMutate: async ({ id, action }) => {
      await qc.cancelQueries({ queryKey: key });
      const prev = qc.getQueryData<InfiniteData<ApiCollection<Interest>>>(key);
      if (prev) {
        qc.setQueryData<InfiniteData<ApiCollection<Interest>>>(key, {
          ...prev,
          pages: prev.pages.map((p) => ({
            ...p,
            data: p.data.map((i) =>
              i.id === id ? { ...i, status: ACTION_TO_STATUS[action] } : i,
            ),
          })),
        });
      }
      return { prev };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.prev) qc.setQueryData(key, ctx.prev);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: queryKeys.interests.box('received') });
      qc.invalidateQueries({ queryKey: queryKeys.interests.box('sent') });
      qc.invalidateQueries({ queryKey: queryKeys.conversations.list });
      qc.invalidateQueries({ queryKey: queryKeys.dashboard });
    },
  });
}
