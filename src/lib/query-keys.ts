import type { DiscoveryFilters } from '@/types/models';

export const queryKeys = {
  auth: {
    me: ['auth', 'me'] as const,
  },
  lookups: {
    divisions: ['lookups', 'divisions'] as const,
    districts: (divisionId?: number) => ['lookups', 'districts', divisionId ?? 'all'] as const,
    upazilas: (districtId?: number) => ['lookups', 'upazilas', districtId ?? 'all'] as const,
    religions: ['lookups', 'religions'] as const,
    professions: ['lookups', 'professions'] as const,
    educationLevels: ['lookups', 'education-levels'] as const,
  },
  dashboard: ['dashboard'] as const,
  profile: {
    me: ['profile', 'me'] as const,
    detail: (publicId: string) => ['profile', 'detail', publicId] as const,
    photos: ['profile', 'me', 'photos'] as const,
    preferences: ['profile', 'me', 'preferences'] as const,
  },
  discovery: {
    list: (filters: DiscoveryFilters) => ['discovery', filters] as const,
  },
  interests: {
    box: (box: 'received' | 'sent') => ['interests', box] as const,
  },
  shortlists: ['shortlists'] as const,
  conversations: {
    list: ['conversations'] as const,
    messages: (conversationId: number | string) =>
      ['conversations', String(conversationId), 'messages'] as const,
  },
  notifications: ['notifications'] as const,
  safety: {
    blocks: ['safety', 'blocks'] as const,
    contactBlocks: ['safety', 'contact-blocks'] as const,
  },
};
