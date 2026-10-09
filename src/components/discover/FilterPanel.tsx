'use client';

import React, { useState } from 'react';
import { RotateCcw, SlidersHorizontal } from 'lucide-react';
import type { DiscoveryFilters } from '@/types/models';
import type { Gender, MaritalStatus, DiscoverySort } from '@/types/enums';
import { Field, Select, Checkbox, RangeField } from '@/components/ui/form';
import { Button } from '@/components/ui/Button';
import {
  useDistricts,
  useReligions,
  useProfessions,
  useEducationLevels,
} from '@/features/lookups/hooks';
import { MARITAL_LABELS } from '@/lib/format';
import { useI18n } from '@/lib/i18n';

const AGE_MIN = 18;
const AGE_MAX = 80;

export function FilterPanel({
  value,
  onApply,
}: {
  value: DiscoveryFilters;
  onApply: (filters: DiscoveryFilters) => void;
}) {
  const { t, getText } = useI18n();
  const [draft, setDraft] = useState<DiscoveryFilters>(value);

  const districts = useDistricts();
  const religions = useReligions();
  const professions = useProfessions();
  const education = useEducationLevels();

  const set = (patch: Partial<DiscoveryFilters>) => setDraft((d) => ({ ...d, ...patch }));

  const opt = (items: { id: number; name_en: string; name_bn: string | null }[] | undefined) =>
    (items ?? []).map((i) => ({ value: i.id, label: getText(i.name_en, i.name_bn) }));

  const reset = () => {
    setDraft({});
    onApply({});
  };

  return (
    <div className="card card-pad">
      <div className="row between mb-4">
        <span className="section-title" style={{ margin: 0 }}>
          <SlidersHorizontal size={14} style={{ verticalAlign: '-2px', marginRight: 6 }} />
          Filters
        </span>
        <button className="link small row gap-1" onClick={reset}>
          <RotateCcw size={13} /> {t('btn_reset_filters', 'Reset')}
        </button>
      </div>

      <Field label={t('sort_match', 'Sort by')}>
        <Select
          value={draft.sort ?? 'relevant'}
          onChange={(e) => set({ sort: e.target.value as DiscoverySort })}
          options={[
            { value: 'relevant', label: 'Best match' },
            { value: 'recent', label: 'Recently active' },
            { value: 'newest', label: 'Newest' },
            { value: 'verification', label: 'Most verified' },
          ]}
        />
      </Field>

      <Field label={t('gender')}>
        <Select
          value={draft.gender ?? ''}
          onChange={(e) => set({ gender: (e.target.value || undefined) as Gender | undefined })}
          placeholder="Any"
          options={[
            { value: 'male', label: 'Male' },
            { value: 'female', label: 'Female' },
          ]}
        />
      </Field>

      <Field label={`${t('filter_age', 'Age')}: ${draft.age_min ?? AGE_MIN}–${draft.age_max ?? AGE_MAX}`}>
        <RangeField
          min={AGE_MIN}
          max={AGE_MAX}
          valueMin={draft.age_min ?? AGE_MIN}
          valueMax={draft.age_max ?? AGE_MAX}
          onChange={(lo, hi) => set({ age_min: lo, age_max: hi })}
        />
      </Field>

      <Field label={t('filter_district', 'District')}>
        <Select
          value={draft.district_id ?? ''}
          onChange={(e) => set({ district_id: e.target.value ? Number(e.target.value) : undefined })}
          placeholder="Any district"
          options={opt(districts.data)}
        />
      </Field>

      <Field label={t('filter_religion', 'Religion')}>
        <Select
          value={draft.religion_id ?? ''}
          onChange={(e) => set({ religion_id: e.target.value ? Number(e.target.value) : undefined })}
          placeholder="Any"
          options={opt(religions.data)}
        />
      </Field>

      <Field label={t('filter_profession', 'Profession')}>
        <Select
          value={draft.profession_id ?? ''}
          onChange={(e) => set({ profession_id: e.target.value ? Number(e.target.value) : undefined })}
          placeholder="Any"
          options={opt(professions.data)}
        />
      </Field>

      <Field label={t('filter_education', 'Education')}>
        <Select
          value={draft.education_level_id ?? ''}
          onChange={(e) => set({ education_level_id: e.target.value ? Number(e.target.value) : undefined })}
          placeholder="Any"
          options={opt(education.data)}
        />
      </Field>

      <Field label={t('filter_marital_status', 'Marital status')}>
        <Select
          value={draft.marital_status ?? ''}
          onChange={(e) => set({ marital_status: (e.target.value || undefined) as MaritalStatus | undefined })}
          placeholder="Any"
          options={Object.entries(MARITAL_LABELS).map(([value, label]) => ({ value, label }))}
        />
      </Field>

      <div className="stack gap-2 mt-2 mb-4">
        <Checkbox
          label={t('filter_verified_only', 'Verified members only')}
          checked={(draft.min_verification_level ?? 0) >= 2}
          onChange={(e) => set({ min_verification_level: e.target.checked ? 2 : undefined })}
        />
        <Checkbox
          label={t('filter_photos_only', 'Has a photo')}
          checked={!!draft.has_photo}
          onChange={(e) => set({ has_photo: e.target.checked || undefined })}
        />
      </div>

      <Button variant="primary" block onClick={() => onApply(draft)}>
        {t('btn_apply_filters', 'Apply filters')}
      </Button>
    </div>
  );
}
