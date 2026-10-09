'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { usePreferences, useUpdatePreferences } from '@/features/preferences/hooks';
import { useReligions, useProfessions, useEducationLevels, useDistricts } from '@/features/lookups/hooks';
import { PageHeader } from '@/components/layout/PageHeader';
import { Field, Select, ChipGroup, RangeField } from '@/components/ui/form';
import { Button } from '@/components/ui/Button';
import { CenterSpinner, ErrorState } from '@/components/ui/feedback';
import { useToast } from '@/components/providers/ToastProvider';
import { ApiError } from '@/lib/api-client';
import { errorMessage } from '@/lib/errors';
import { MARITAL_LABELS, PREFERENCE_KEY_LABELS, cmToFeet } from '@/lib/format';
import type { PreferenceInput } from '@/types/api';
import type { MaritalStatus, PreferenceKey, Importance } from '@/types/enums';
import { useI18n } from '@/lib/i18n';

const PREF_KEYS: PreferenceKey[] = [
  'age_range', 'height_range', 'religion', 'education', 'profession', 'income', 'district', 'marital_status',
];

export default function PreferencesPage() {
  const { t, getText } = useI18n();
  const query = usePreferences();
  const update = useUpdatePreferences();
  const { toast } = useToast();

  const religions = useReligions();
  const professions = useProfessions();
  const education = useEducationLevels();
  const districts = useDistricts();

  const [form, setForm] = useState<PreferenceInput>({ age_min: 22, age_max: 35, height_min_cm: 150, height_max_cm: 185 });
  const [weights, setWeights] = useState<Record<PreferenceKey, Importance>>(
    Object.fromEntries(PREF_KEYS.map((k) => [k, 'nice_to_have'])) as Record<PreferenceKey, Importance>,
  );
  const [seeded, setSeeded] = useState(false);

  const notFound = query.isError && query.error instanceof ApiError && query.error.status === 404;

  useEffect(() => {
    if (seeded) return;
    if (query.isSuccess && query.data) {
      const p = query.data;
      setForm({
        age_min: p.age_range[0] ?? 22,
        age_max: p.age_range[1] ?? 35,
        height_min_cm: p.height_range_cm[0] ?? 150,
        height_max_cm: p.height_range_cm[1] ?? 185,
        marital_statuses: p.marital_statuses ?? [],
        religion_id: p.religion_id ?? null,
        min_education_level_id: p.min_education_level_id ?? null,
        profession_ids: p.profession_ids ?? [],
        income_min: p.income_min ?? null,
        district_ids: p.district_ids ?? [],
        other_expectations: p.other_expectations ?? '',
      });
      if (p.weights?.length) {
        setWeights((w) => {
          const next = { ...w };
          p.weights.forEach((x) => { next[x.preference_key] = x.importance; });
          return next;
        });
      }
      setSeeded(true);
    } else if (query.isSuccess || notFound) {
      setSeeded(true);
    }
  }, [query.isSuccess, query.data, notFound, seeded]);

  if (query.isLoading) return <CenterSpinner />;
  if (query.isError && !notFound) return <ErrorState error={query.error} onRetry={query.refetch} />;

  const set = (patch: Partial<PreferenceInput>) => setForm((f) => ({ ...f, ...patch }));

  const save = () => {
    const payload: PreferenceInput = {
      ...form,
      weights: PREF_KEYS.map((k) => ({ preference_key: k, importance: weights[k] })),
    };
    update.mutate(payload, {
      onSuccess: () => toast('Preferences saved.', 'success'),
      onError: (e) => toast(errorMessage(e), 'error'),
    });
  };

  const lookupOpt = (items: { id: number; name_en: string; name_bn: string | null }[] | undefined) =>
    (items ?? []).map((i) => ({ value: i.id, label: getText(i.name_en, i.name_bn) }));

  return (
    <div style={{ maxWidth: 680, margin: '0 auto' }}>
      <div className="row gap-2 mb-2">
        <Link href="/me" className="btn btn-icon btn-subtle" aria-label="Back"><ArrowLeft size={18} /></Link>
      </div>
      <PageHeader title={t('preferences_title')} subtitle="These drive your match scores. Mark the ones you can't compromise on as must-haves." />

      <div className="card card-pad stack gap-2">
        <Field label={`Age: ${form.age_min}–${form.age_max}`}>
          <RangeField min={18} max={80} valueMin={form.age_min ?? 22} valueMax={form.age_max ?? 35} onChange={(lo, hi) => set({ age_min: lo, age_max: hi })} />
        </Field>
        <Field label={`Height: ${cmToFeet(form.height_min_cm ?? 150)} – ${cmToFeet(form.height_max_cm ?? 185)}`}>
          <RangeField min={120} max={230} valueMin={form.height_min_cm ?? 150} valueMax={form.height_max_cm ?? 185} onChange={(lo, hi) => set({ height_min_cm: lo, height_max_cm: hi })} format={cmToFeet} />
        </Field>

        <Field label="Marital status">
          <ChipGroup<MaritalStatus>
            options={Object.entries(MARITAL_LABELS).map(([value, label]) => ({ value: value as MaritalStatus, label }))}
            value={(form.marital_statuses ?? []) as MaritalStatus[]}
            onChange={(v) => set({ marital_statuses: v })}
          />
        </Field>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Field label="Religion">
            <Select value={form.religion_id ?? ''} onChange={(e) => set({ religion_id: e.target.value ? Number(e.target.value) : null })} placeholder="Any" options={lookupOpt(religions.data)} />
          </Field>
          <Field label="Minimum education">
            <Select value={form.min_education_level_id ?? ''} onChange={(e) => set({ min_education_level_id: e.target.value ? Number(e.target.value) : null })} placeholder="Any" options={lookupOpt(education.data)} />
          </Field>
        </div>

        <Field label="Minimum income (৳/mo)">
          <Select
            value={form.income_min ?? ''}
            onChange={(e) => set({ income_min: e.target.value ? Number(e.target.value) : null })}
            placeholder="No minimum"
            options={[20000, 30000, 50000, 75000, 100000, 150000].map((n) => ({ value: n, label: `৳${n.toLocaleString('en-BD')}+` }))}
          />
        </Field>

        <Field label="Preferred professions">
          <div style={{ maxHeight: 160, overflowY: 'auto' }}>
            <ChipGroup<number>
              options={lookupOpt(professions.data)}
              value={(form.profession_ids ?? []) as number[]}
              onChange={(v) => set({ profession_ids: v })}
            />
          </div>
        </Field>

        <Field label="Preferred districts">
          <div style={{ maxHeight: 180, overflowY: 'auto' }}>
            <ChipGroup<number>
              options={lookupOpt(districts.data)}
              value={(form.district_ids ?? []) as number[]}
              onChange={(v) => set({ district_ids: v })}
            />
          </div>
        </Field>
      </div>

      <div className="card card-pad mt-4">
        <div className="section-title">Deal-breakers</div>
        <p className="small muted" style={{ marginTop: 0 }}>A failed must-have heavily lowers the match score. Choose carefully.</p>
        <div className="stack gap-2">
          {PREF_KEYS.map((k) => (
            <div key={k} className="row between gap-2">
              <span className="small strong">{PREFERENCE_KEY_LABELS[k]}</span>
              <div className="row gap-1">
                <button
                  className={`chip ${weights[k] === 'nice_to_have' ? 'selected' : ''}`}
                  onClick={() => setWeights((w) => ({ ...w, [k]: 'nice_to_have' }))}
                >
                  Nice to have
                </button>
                <button
                  className={`chip ${weights[k] === 'deal_breaker' ? 'selected' : ''}`}
                  onClick={() => setWeights((w) => ({ ...w, [k]: 'deal_breaker' }))}
                >
                  Must-have
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="row center mt-4">
        <Button variant="primary" onClick={save} loading={update.isPending}>{t('save')}</Button>
      </div>
    </div>
  );
}
