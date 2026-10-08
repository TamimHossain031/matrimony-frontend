'use client';

import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { queryKeys } from '@/lib/query-keys';
import type { AppNotification } from '@/types/models';

interface NotificationsPage {
  data: AppNotification[];
  unread_count: number;
  next_cursor: string | null;
  has_more: boolean;
}

export function useNotifications() {
  return useInfiniteQuery({
    queryKey: queryKeys.notifications,
    queryFn: ({ pageParam }) =>
      apiClient.get<NotificationsPage>('/notifications', {
        cursor: pageParam as string | undefined,
      }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) => (last.has_more ? last.next_cursor : undefined),
    staleTime: 30 * 1000,
  });
}

// Unread count without consuming the infinite list.
export function useUnreadNotificationCount() {
  return useQuery({
    queryKey: [...queryKeys.notifications, 'unread'],
    queryFn: () => apiClient.get<NotificationsPage>('/notifications'),
    staleTime: 30 * 1000,
    refetchInterval: 60 * 1000,
    select: (r) => r.unread_count,
  });
}

export function useMarkNotificationRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      apiClient.patch<{ message: string }>(`/notifications/${id}/read`),
    onSettled: () => {
      qc.invalidateQueries({ queryKey: queryKeys.notifications });
      qc.invalidateQueries({ queryKey: queryKeys.dashboard });
    },
  });
}

export function useMarkAllNotificationsRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => apiClient.post<{ message: string }>('/notifications/read-all'),
    onSettled: () => {
      qc.invalidateQueries({ queryKey: queryKeys.notifications });
      qc.invalidateQueries({ queryKey: queryKeys.dashboard });
    },
  });
}
