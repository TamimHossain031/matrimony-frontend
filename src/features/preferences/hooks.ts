'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { queryKeys } from '@/lib/query-keys';
import type { ApiResource, PreferenceInput } from '@/types/api';
import type { PartnerPreference } from '@/types/models';

export function usePreferences() {
  return useQuery({
    queryKey: queryKeys.profile.preferences,
    queryFn: () => apiClient.get<ApiResource<PartnerPreference | null>>('/preferences'),
    staleTime: 5 * 60 * 1000,
    select: (r) => r.data,
    retry: false,
  });
}

export function useUpdatePreferences() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: PreferenceInput) =>
      apiClient.patch<ApiResource<PartnerPreference>>('/preferences', input),
    onSuccess: (res) => {
      qc.setQueryData<ApiResource<PartnerPreference>>(queryKeys.profile.preferences, res);
      // Match scores depend on preferences — refresh discovery.
      qc.invalidateQueries({ queryKey: ['discovery'] });
    },
  });
}
