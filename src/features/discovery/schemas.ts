import { z } from 'zod';
import type { DiscoveryFilters } from '@/types/models';

// Discovery filters live in the URL. These helpers serialise to/from
// URLSearchParams so the back button and sharing work (blueprint §6).

const numberKeys = [
  'age_min',
  'age_max',
  'district_id',
  'religion_id',
  'profession_id',
  'education_level_id',
  'height_min',
  'height_max',
  'income_min',
  'min_verification_level',
  'active_within_days',
] as const;

export function filtersFromSearchParams(
  params: URLSearchParams | Record<string, string | undefined>,
): DiscoveryFilters {
  const get = (k: string) =>
    params instanceof URLSearchParams ? params.get(k) ?? undefined : params[k];
  const f: DiscoveryFilters = {};

  const gender = get('gender');
  if (gender === 'male' || gender === 'female') f.gender = gender;

  for (const key of numberKeys) {
    const raw = get(key);
    if (raw != null && raw !== '') {
      const n = Number(raw);
      if (!Number.isNaN(n)) (f as Record<string, unknown>)[key] = n;
    }
  }

  const marital = get('marital_status');
  if (
    marital === 'never_married' ||
    marital === 'divorced' ||
    marital === 'widowed' ||
    marital === 'separated'
  ) {
    f.marital_status = marital;
  }

  const hasPhoto = get('has_photo');
  if (hasPhoto === 'true' || hasPhoto === '1') f.has_photo = true;

  const sort = get('sort');
  if (sort === 'recent' || sort === 'newest' || sort === 'verification' || sort === 'relevant') {
    f.sort = sort;
  }

  return f;
}

export function filtersToSearchParams(filters: DiscoveryFilters): URLSearchParams {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '' || value === false) return;
    params.set(key, String(value));
  });
  return params;
}

export const discoveryFilterSchema = z.custom<DiscoveryFilters>();
