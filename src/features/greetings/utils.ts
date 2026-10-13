import type { GreetingTemplate } from '@/types/greetings';

/**
 * Resolves an accessible image URL for a greeting template artwork or thumbnail.
 * Handles full URLs (http/https), relative storage paths (/storage/...), and local keys.
 */
export function getTemplateImageUrl(
  template?: Pick<GreetingTemplate, 'thumbnail_url' | 'thumbnail_path'> | null
): string | null {
  if (!template) return null;
  const raw = template.thumbnail_url || template.thumbnail_path;
  if (!raw) return null;

  if (raw.startsWith('http://') || raw.startsWith('https://')) {
    return raw;
  }

  const backendUrl = process.env.NEXT_PUBLIC_API_URL
    ? process.env.NEXT_PUBLIC_API_URL.replace(/\/api\/v1\/?$/, '')
    : 'http://localhost:8000';

  if (raw.startsWith('/')) {
    return `${backendUrl}${raw}`;
  }

  return `${backendUrl}/storage/${raw}`;
}
