import { ApiError } from './api-client';

// Flatten Laravel validation errors into a { field: firstMessage } map for
// inline form display.
export function apiFieldErrors(error: unknown): Record<string, string> {
  if (error instanceof ApiError && error.errors) {
    const out: Record<string, string> = {};
    for (const [field, messages] of Object.entries(error.errors)) {
      if (messages?.length) out[field] = messages[0];
    }
    return out;
  }
  return {};
}

export function errorMessage(error: unknown, fallback = 'Something went wrong.'): string {
  if (error instanceof ApiError) return error.message || fallback;
  if (error instanceof Error) return error.message || fallback;
  return fallback;
}
