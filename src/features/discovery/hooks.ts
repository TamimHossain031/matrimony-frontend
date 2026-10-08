'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { queryKeys } from '@/lib/query-keys';
import type { ApiCollection } from '@/types/api';
import type { ProfileCard, DiscoveryFilters } from '@/types/models';

export function useDiscovery(filters: DiscoveryFilters) {
  return useInfiniteQuery({
    queryKey: queryKeys.discovery.list(filters),
    queryFn: ({ pageParam }) =>
      apiClient.get<ApiCollection<ProfileCard>>('/profiles', {
        ...filters,
        cursor: pageParam as string | undefined,
      }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) => (last.has_more ? last.next_cursor : undefined),
    staleTime: 60 * 1000,
  });
}
