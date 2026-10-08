'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { queryKeys } from '@/lib/query-keys';
import type { ApiResource } from '@/types/api';
import type { ProfilePhoto } from '@/types/models';
import type { Visibility } from '@/types/enums';

export function usePhotos() {
  return useQuery({
    queryKey: queryKeys.profile.photos,
    queryFn: () => apiClient.get<ApiResource<ProfilePhoto[]>>('/photos'),
    select: (r) => r.data,
  });
}

export function useUploadPhoto() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ file, visibility }: { file: File; visibility?: Visibility }) => {
      const form = new FormData();
      form.append('photo', file);
      if (visibility) form.append('visibility', visibility);
      return apiClient.upload<ApiResource<ProfilePhoto>>('/photos', form);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.profile.photos });
      qc.invalidateQueries({ queryKey: queryKeys.profile.me });
    },
  });
}

export function useSetPrimaryPhoto() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (photoId: number) =>
      apiClient.patch<{ message: string }>(`/photos/${photoId}/primary`),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.profile.photos }),
  });
}

export function useDeletePhoto() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (photoId: number) => apiClient.delete<{ message: string }>(`/photos/${photoId}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.profile.photos });
      qc.invalidateQueries({ queryKey: queryKeys.profile.me });
    },
  });
}

// Photo-request flow (§12): ask to see another profile's photos, or respond.
export function useRequestPhotos() {
  return useMutation({
    mutationFn: (publicId: string) =>
      apiClient.post<{ message: string }>('/photo-requests', { profile_id: publicId }),
  });
}

export function useRespondPhotoRequest() {
  return useMutation({
    mutationFn: ({ id, action }: { id: number; action: 'approve' | 'deny' }) =>
      apiClient.patch<{ message: string }>(`/photo-requests/${id}`, { action }),
  });
}
