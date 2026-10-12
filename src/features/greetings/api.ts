import { apiClient } from '@/lib/api-client';
import {
  GreetingTemplate,
  GreetingCard,
  CreateGreetingCardPayload,
  CreateGreetingCardResponse,
  EngagementResponse,
} from '@/types/greetings';

export async function fetchGreetingTemplates(occasion?: string): Promise<GreetingTemplate[]> {
  const params = occasion && occasion !== 'all' ? { occasion } : undefined;
  const res = await apiClient.get<{ data: GreetingTemplate[] }>('/greeting-templates', params);
  return res.data;
}

export async function fetchGreetingTemplate(slug: string): Promise<GreetingTemplate> {
  const res = await apiClient.get<{ data: GreetingTemplate }>(`/greeting-templates/${slug}`);
  return res.data;
}

export async function createGreetingCard(
  payload: CreateGreetingCardPayload
): Promise<CreateGreetingCardResponse> {
  return apiClient.post<CreateGreetingCardResponse>('/greeting-cards', payload);
}

export async function fetchPublicGreetingCard(publicId: string): Promise<GreetingCard> {
  const res = await apiClient.get<{ data: GreetingCard }>(`/public/greeting-cards/${publicId}`);
  return res.data;
}

export async function recordCardEngagement(
  publicId: string,
  eventType: 'share_clicked' | 'copy_link' | 'create_another_clicked' | 'reaction_clicked',
  referrerCategory?: string
): Promise<EngagementResponse> {
  return apiClient.post<EngagementResponse>(`/public/greeting-cards/${publicId}/events`, {
    event_type: eventType,
    referrer_category: referrerCategory,
  });
}

export async function reportGreetingCard(
  publicId: string,
  reason: string,
  details?: string
): Promise<{ message: string }> {
  return apiClient.post<{ message: string }>(`/public/greeting-cards/${publicId}/report`, {
    reason,
    details,
  });
}

export async function updateGreetingCard(
  publicId: string,
  payload: Partial<CreateGreetingCardPayload>,
  editToken?: string
): Promise<{ message: string; data: GreetingCard }> {
  return apiClient.patch<{ message: string; data: GreetingCard }>(
    `/greeting-cards/${publicId}`,
    payload,
    {
      headers: editToken ? { 'X-Edit-Token': editToken } : undefined,
    }
  );
}

export async function deleteGreetingCard(
  publicId: string,
  editToken?: string
): Promise<{ message: string }> {
  return apiClient.delete<{ message: string }>(`/greeting-cards/${publicId}`, {
    headers: editToken ? { 'X-Edit-Token': editToken } : undefined,
  });
}
