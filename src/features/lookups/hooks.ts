'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { queryKeys } from '@/lib/query-keys';
import type { ApiResource } from '@/types/api';
import type { LookupItem } from '@/types/models';

const LONG_STALE = 60 * 60 * 1000; // lookups barely change

export function useDivisions() {
  return useQuery({
    queryKey: queryKeys.lookups.divisions,
    queryFn: () => apiClient.get<ApiResource<LookupItem[]>>('/lookups/divisions'),
    staleTime: LONG_STALE,
    select: (r) => r.data,
  });
}

export function useDistricts(divisionId?: number) {
  return useQuery({
    queryKey: queryKeys.lookups.districts(divisionId),
    queryFn: () =>
      apiClient.get<ApiResource<LookupItem[]>>('/lookups/districts', {
        division_id: divisionId,
      }),
    staleTime: LONG_STALE,
    select: (r) => r.data,
  });
}

export function useUpazilas(districtId?: number) {
  return useQuery({
    queryKey: queryKeys.lookups.upazilas(districtId),
    queryFn: () =>
      apiClient.get<ApiResource<LookupItem[]>>('/lookups/upazilas', {
        district_id: districtId,
      }),
    enabled: !!districtId,
    staleTime: LONG_STALE,
    select: (r) => r.data,
  });
}

export function useReligions() {
  return useQuery({
    queryKey: queryKeys.lookups.religions,
    queryFn: () => apiClient.get<ApiResource<LookupItem[]>>('/lookups/religions'),
    staleTime: LONG_STALE,
    select: (r) => r.data,
  });
}

export function useProfessions() {
  return useQuery({
    queryKey: queryKeys.lookups.professions,
    queryFn: () => apiClient.get<ApiResource<LookupItem[]>>('/lookups/professions'),
    staleTime: LONG_STALE,
    select: (r) => r.data,
  });
}

export function useEducationLevels() {
  return useQuery({
    queryKey: queryKeys.lookups.educationLevels,
    queryFn: () => apiClient.get<ApiResource<LookupItem[]>>('/lookups/education-levels'),
    staleTime: LONG_STALE,
    select: (r) => r.data,
  });
}
