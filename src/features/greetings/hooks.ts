'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import {
  fetchGreetingTemplates,
  fetchGreetingTemplate,
  createGreetingCard,
  fetchPublicGreetingCard,
  recordCardEngagement,
  reportGreetingCard,
  updateGreetingCard,
  deleteGreetingCard,
} from './api';
import type {
  CreateGreetingCardPayload,
  CreateGreetingCardResponse,
  GreetingCard,
} from '@/types/greetings';

export function useGreetingTemplates(occasion?: string) {
  return useQuery({
    queryKey: queryKeys.greetings.templates(occasion),
    queryFn: () => fetchGreetingTemplates(occasion),
    staleTime: 10 * 60 * 1000,
  });
}

export function useGreetingTemplate(slug: string) {
  return useQuery({
    queryKey: queryKeys.greetings.template(slug),
    queryFn: () => fetchGreetingTemplate(slug),
    enabled: !!slug,
    staleTime: 10 * 60 * 1000,
  });
}

export function usePublicGreetingCard(publicId: string) {
  return useQuery({
    queryKey: queryKeys.greetings.card(publicId),
    queryFn: () => fetchPublicGreetingCard(publicId),
    enabled: !!publicId,
    retry: 1,
  });
}

export function useCreateGreetingCard() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateGreetingCardPayload) => createGreetingCard(payload),
    onSuccess: (res: CreateGreetingCardResponse) => {
      queryClient.setQueryData(queryKeys.greetings.card(res.public_id), res.data);
    },
  });
}

export function useCardEngagement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      publicId,
      eventType,
      referrerCategory,
    }: {
      publicId: string;
      eventType: 'share_clicked' | 'copy_link' | 'create_another_clicked' | 'reaction_clicked';
      referrerCategory?: string;
    }) => recordCardEngagement(publicId, eventType, referrerCategory),
    onSuccess: (data, variables) => {
      queryClient.setQueryData(queryKeys.greetings.card(variables.publicId), (old: GreetingCard | undefined) => {
        if (!old) return old;
        return {
          ...old,
          shares_count: data.shares_count ?? old.shares_count,
          reactions_count: data.reactions_count ?? old.reactions_count,
          views_count: data.views_count ?? old.views_count,
        };
      });
    },
  });
}

export function useReportCard() {
  return useMutation({
    mutationFn: ({
      publicId,
      reason,
      details,
    }: {
      publicId: string;
      reason: string;
      details?: string;
    }) => reportGreetingCard(publicId, reason, details),
  });
}

export function useUpdateGreetingCard() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      publicId,
      payload,
      editToken,
    }: {
      publicId: string;
      payload: Partial<CreateGreetingCardPayload>;
      editToken?: string;
    }) => updateGreetingCard(publicId, payload, editToken),
    onSuccess: (res, variables) => {
      queryClient.setQueryData(queryKeys.greetings.card(variables.publicId), res.data);
    },
  });
}

export function useDeleteGreetingCard() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      publicId,
      editToken,
    }: {
      publicId: string;
      editToken?: string;
    }) => deleteGreetingCard(publicId, editToken),
    onSuccess: (_, variables) => {
      queryClient.removeQueries({ queryKey: queryKeys.greetings.card(variables.publicId) });
    },
  });
}
