'use client';

import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { queryKeys } from '@/lib/query-keys';
import type { ApiCollection, ApiResource } from '@/types/api';
import type { Conversation, Message } from '@/types/models';

export function useConversations() {
  return useQuery({
    queryKey: queryKeys.conversations.list,
    queryFn: () => apiClient.get<ApiResource<Conversation[]>>('/conversations'),
    staleTime: 0, // conversation list is always fresh (§3)
    select: (r) => r.data,
  });
}

export function useMessages(conversationId: number | string) {
  return useInfiniteQuery({
    queryKey: queryKeys.conversations.messages(conversationId),
    queryFn: ({ pageParam }) =>
      apiClient.get<ApiCollection<Message>>(`/conversations/${conversationId}/messages`, {
        cursor: pageParam as string | undefined,
      }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) => (last.has_more ? last.next_cursor : undefined),
    enabled: !!conversationId,
    staleTime: 10 * 1000,
  });
}

export function useSendMessage(conversationId: number | string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: string) =>
      apiClient.post<ApiResource<Partial<Message>>>(
        `/conversations/${conversationId}/messages`,
        { body },
      ),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.conversations.messages(conversationId) });
      qc.invalidateQueries({ queryKey: queryKeys.conversations.list });
    },
  });
}
