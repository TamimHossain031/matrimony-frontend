'use client';

import React, { Suspense, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { useMyProfile, useCreateProfile, useUpdateProfile } from '@/features/profile/hooks';
import {
  useDistricts,
  useUpazilas,
  useReligions,
  useProfessions,
  useEducationLevels,
} from '@/features/lookups/hooks';
import { PageHeader } from '@/components/layout/PageHeader';
import { Field, Input, Select, Textarea } from '@/components/ui/form';
import { Button } from '@/components/ui/Button';
import { CenterSpinner } from '@/components/ui/feedback';
import { useToast } from '@/components/providers/ToastProvider';
import { useAuth } from '@/components/providers/AuthProvider';
import { ApiError } from '@/lib/api-client';
import { apiFieldErrors, errorMessage } from '@/lib/errors';
import { MARITAL_LABELS, DIET_LABELS, YESNO_LABELS, FAMILY_TYPE_LABELS } from '@/lib/format';
import { profileSchema } from '@/features/profile/schemas';
import type { ProfileInput } from '@/types/api';
import type { Profile } from '@/types/models';
import { useI18n } from '@/lib/i18n';

const STORAGE_PREFIX = 'shondhan_profile_draft_';

function profileToInput(p: Profile): ProfileInput {
  return {
    full_name_en: p.full_name_en ?? '',
    full_name_bn: p.full_name_bn ?? '',
    marital_status: p.marital_status ?? null,
    height_cm: p.height_cm ?? null,
    district_id: p.district?.id ?? null,
    upazila_id: p.upazila?.id ?? null,
    nationality: p.nationality ?? null,
    headline: p.headline ?? null,
    religion_id: p.religion?.id ?? null,
    education_level_id: p.education_level?.id ?? null,
    institution: p.education.institution,
    subject: p.education.subject,
    graduation_year: p.education.graduation_year,
    profession_id: p.profession?.id ?? null,
    job_title: p.career.job_title,
    organization: p.career.organization,
    income_min: p.career.income_range[0],
    income_max: p.career.income_range[1],
    work_location: p.career.work_location,
    father_occupation: p.family.father_occupation,
    mother_occupation: p.family.mother_occupation,
    siblings_count: p.family.siblings_count,
    family_type: p.family.family_type,
    family_location: p.family.family_location,
    family_description: p.family.description,
    lifestyle: p.lifestyle ?? {},
    about: p.about ?? null,
  };
}

const STEPS = ['Basics', 'Education & career', 'Family', 'Lifestyle', 'About'];

function EditInner() {
  const { t, getText } = useI18n();
  const router = useRouter();
  const params = useSearchParams();
  const welcome = params.get('welcome') === '1';
  const { user } = useAuth();
  const { toast } = useToast();

  const myProfile = useMyProfile();
  const create = useCreateProfile();
  const update = useUpdateProfile();

  const hasProfile = myProfile.isSuccess && !!myProfile.data;
  const notFound = myProfile.isError && myProfile.error instanceof ApiError && myProfile.error.status === 404;
  const ready = myProfile.isSuccess || notFound;

  const storageKey = useMemo(() => `${STORAGE_PREFIX}${user?.id ?? 'anon'}`, [user?.id]);

  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<ProfileInput>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [seeded, setSeeded] = useState(false);

  const districts = useDistricts();
  const upazilas = useUpazilas(draft.district_id ?? undefined);
  const religions = useReligions();
  const professions = useProfessions();
  const education = useEducationLevels();

  // Seed the draft once: from the saved draft, else from the existing profile.
  useEffect(() => {
    if (seeded || !ready) return;
    let initial: ProfileInput = {};
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) initial = JSON.parse(saved);
    } catch {
      /* ignore */
    }
    if (Object.keys(initial).length === 0 && hasProfile && myProfile.data) {
      initial = profileToInput(myProfile.data);
    }
    setDraft(initial);
    setSeeded(true);
  }, [seeded, ready, hasProfile, myProfile.data, storageKey]);

  // Persist the draft so a refresh never loses data (blueprint §6).
  useEffect(() => {
    if (!seeded) return;
    try {
      localStorage.setItem(storageKey, JSON.stringify(draft));
    } catch {
      /* ignore */
    }
  }, [draft, seeded, storageKey]);

  const set = (patch: Partial<ProfileInput>) => setDraft((d) => ({ ...d, ...patch }));
  const setLifestyle = (patch: Partial<NonNullable<ProfileInput['lifestyle']>>) =>
    setDraft((d) => ({ ...d, lifestyle: { ...(d.lifestyle ?? {}), ...patch } }));

  if (!ready || !seeded) return <CenterSpinner />;

  const lookupOptions = (items: { id: number; name_en: string; name_bn: string | null }[] | undefined) =>
    (items ?? []).map((i) => ({ value: i.id, label: getText(i.name_en, i.name_bn) }));

  const persist = (onDone?: () => void) => {
    // Validate the accumulated draft; the backend re-validates authoritatively.
    const parsed = profileSchema.safeParse(draft);
    if (!parsed.success) {
      setErrors(Object.fromEntries(parsed.error.issues.map((i) => [String(i.path[0]), i.message])));
      toast('Please fix the highlighted fields.', 'error');
      return;
    }
    setErrors({});
    const mutation = hasProfile ? update : create;
    mutation.mutate(draft, {
      onSuccess: () => {
        toast('Saved.', 'success');
        onDone?.();
      },
      onError: (err) => {
        setErrors(apiFieldErrors(err));
        toast(errorMessage(err), 'error');
      },
    });
  };

  const saving = create.isPending || update.isPending;
  const isLast = step === STEPS.length - 1;

  const goNext = () => {
    if (isLast) {
      persist(() => {
        try { localStorage.removeItem(storageKey); } catch { /* ignore */ }
        router.push('/me');
      });
    } else {
      // Save progress then advance (proves the round-trip each step).
      persist(() => setStep((s) => Math.min(STEPS.length - 1, s + 1)));
    }
  };

  return (
    <div style={{ maxWidth: 680, margin: '0 auto' }}>
      <PageHeader
        title={hasProfile ? t('edit_profile') : t('create_profile_title')}
        subtitle={welcome ? 'Welcome! Let’s build your profile — a complete one gets far more interest.' : undefined}
      />

      {/* Stepper */}
      <div className="row gap-2 wrap mb-4">
        {STEPS.map((label, i) => (
          <button
            key={label}
            onClick={() => setStep(i)}
            className={`chip ${i === step ? 'selected' : ''}`}
          >
            {i < step ? <Check size={13} /> : `${i + 1}.`} {label}
          </button>
        ))}
      </div>

      <div className="card card-pad">
        {step === 0 && (
          <>
            <div className="section-title">Basics</div>
            <Field label="Full name (English)" error={errors.full_name_en} required>
              <Input value={draft.full_name_en ?? ''} onChange={(e) => set({ full_name_en: e.target.value })} invalid={!!errors.full_name_en} />
            </Field>
            <Field label="Full name (Bangla)" error={errors.full_name_bn}>
              <Input value={draft.full_name_bn ?? ''} onChange={(e) => set({ full_name_bn: e.target.value })} />
            </Field>
            <Field label="Headline" hint="A short line that sums you up">
              <Input value={draft.headline ?? ''} onChange={(e) => set({ headline: e.target.value })} maxLength={255} />
            </Field>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Field label="Marital status" error={errors.marital_status}>
                <Select
                  value={draft.marital_status ?? ''}
                  onChange={(e) => set({ marital_status: (e.target.value || null) as ProfileInput['marital_status'] })}
                  placeholder="Select"
                  options={Object.entries(MARITAL_LABELS).map(([value, label]) => ({ value, label }))}
                />
              </Field>
              <Field label="Height (cm)" error={errors.height_cm}>
                <Input type="number" value={draft.height_cm ?? ''} onChange={(e) => set({ height_cm: e.target.value ? Number(e.target.value) : null })} invalid={!!errors.height_cm} min={120} max={230} />
              </Field>
            </div>
            <Field label="Religion" error={errors.religion_id}>
              <Select
                value={draft.religion_id ?? ''}
                onChange={(e) => set({ religion_id: e.target.value ? Number(e.target.value) : null })}
                placeholder="Select"
                options={lookupOptions(religions.data)}
              />
            </Field>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Field label="District" error={errors.district_id}>
                <Select
                  value={draft.district_id ?? ''}
                  onChange={(e) => set({ district_id: e.target.value ? Number(e.target.value) : null, upazila_id: null })}
                  placeholder="Select"
                  options={lookupOptions(districts.data)}
                />
              </Field>
              <Field label="Upazila" error={errors.upazila_id}>
                <Select
                  value={draft.upazila_id ?? ''}
                  onChange={(e) => set({ upazila_id: e.target.value ? Number(e.target.value) : null })}
                  placeholder={draft.district_id ? 'Select' : 'Pick a district first'}
                  options={lookupOptions(upazilas.data)}
                  disabled={!draft.district_id}
                />
              </Field>
            </div>
            <Field label="Nationality">
              <Input value={draft.nationality ?? ''} onChange={(e) => set({ nationality: e.target.value })} placeholder="Bangladeshi" />
            </Field>
          </>
        )}

        {step === 1 && (
          <>
            <div className="section-title">Education & career</div>
            <Field label="Highest education" error={errors.education_level_id}>
              <Select
                value={draft.education_level_id ?? ''}
                onChange={(e) => set({ education_level_id: e.target.value ? Number(e.target.value) : null })}
                placeholder="Select"
                options={lookupOptions(education.data)}
              />
            </Field>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Field label="Institution"><Input value={draft.institution ?? ''} onChange={(e) => set({ institution: e.target.value })} /></Field>
              <Field label="Subject"><Input value={draft.subject ?? ''} onChange={(e) => set({ subject: e.target.value })} /></Field>
            </div>
            <Field label="Graduation year" error={errors.graduation_year}>
              <Input type="number" value={draft.graduation_year ?? ''} onChange={(e) => set({ graduation_year: e.target.value ? Number(e.target.value) : null })} invalid={!!errors.graduation_year} />
            </Field>
            <Field label="Profession" error={errors.profession_id}>
              <Select
                value={draft.profession_id ?? ''}
                onChange={(e) => set({ profession_id: e.target.value ? Number(e.target.value) : null })}
                placeholder="Select"
                options={lookupOptions(professions.data)}
              />
            </Field>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Field label="Job title"><Input value={draft.job_title ?? ''} onChange={(e) => set({ job_title: e.target.value })} /></Field>
              <Field label="Organization"><Input value={draft.organization ?? ''} onChange={(e) => set({ organization: e.target.value })} /></Field>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Field label="Income from (৳/mo)" error={errors.income_min}><Input type="number" value={draft.income_min ?? ''} onChange={(e) => set({ income_min: e.target.value ? Number(e.target.value) : null })} /></Field>
              <Field label="Income to (৳/mo)" error={errors.income_max}><Input type="number" value={draft.income_max ?? ''} onChange={(e) => set({ income_max: e.target.value ? Number(e.target.value) : null })} /></Field>
            </div>
            <Field label="Work location"><Input value={draft.work_location ?? ''} onChange={(e) => set({ work_location: e.target.value })} /></Field>
          </>
        )}

        {step === 2 && (
          <>
            <div className="section-title">Family</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Field label="Father's occupation"><Input value={draft.father_occupation ?? ''} onChange={(e) => set({ father_occupation: e.target.value })} /></Field>
              <Field label="Mother's occupation"><Input value={draft.mother_occupation ?? ''} onChange={(e) => set({ mother_occupation: e.target.value })} /></Field>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Field label="Siblings" error={errors.siblings_count}><Input type="number" min={0} max={30} value={draft.siblings_count ?? ''} onChange={(e) => set({ siblings_count: e.target.value ? Number(e.target.value) : null })} /></Field>
              <Field label="Family type">
                <Select
                  value={draft.family_type ?? ''}
                  onChange={(e) => set({ family_type: (e.target.value || null) as ProfileInput['family_type'] })}
                  placeholder="Select"
                  options={Object.entries(FAMILY_TYPE_LABELS).map(([value, label]) => ({ value, label }))}
                />
              </Field>
            </div>
            <Field label="Family location"><Input value={draft.family_location ?? ''} onChange={(e) => set({ family_location: e.target.value })} /></Field>
            <Field label="About the family"><Textarea value={draft.family_description ?? ''} onChange={(e) => set({ family_description: e.target.value })} maxLength={2000} /></Field>
          </>
        )}

        {step === 3 && (
          <>
            <div className="section-title">Lifestyle</div>
            <Field label="Diet">
              <Select
                value={draft.lifestyle?.diet ?? ''}
                onChange={(e) => setLifestyle({ diet: (e.target.value || undefined) as never })}
                placeholder="Select"
                options={Object.entries(DIET_LABELS).map(([value, label]) => ({ value, label }))}
              />
            </Field>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Field label="Smoking">
                <Select value={draft.lifestyle?.smoking ?? ''} onChange={(e) => setLifestyle({ smoking: (e.target.value || undefined) as never })} placeholder="Select" options={Object.entries(YESNO_LABELS).map(([value, label]) => ({ value, label }))} />
              </Field>
              <Field label="Drinking">
                <Select value={draft.lifestyle?.drinking ?? ''} onChange={(e) => setLifestyle({ drinking: (e.target.value || undefined) as never })} placeholder="Select" options={Object.entries(YESNO_LABELS).map(([value, label]) => ({ value, label }))} />
              </Field>
            </div>
            <Field label="Languages" hint="Comma separated, e.g. Bangla, English">
              <Input
                value={(draft.lifestyle?.languages ?? []).join(', ')}
                onChange={(e) => setLifestyle({ languages: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) })}
              />
            </Field>
            <Field label="Hobbies" hint="Comma separated">
              <Input
                value={(draft.lifestyle?.hobbies ?? []).join(', ')}
                onChange={(e) => setLifestyle({ hobbies: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) })}
              />
            </Field>
          </>
        )}

        {step === 4 && (
          <>
            <div className="section-title">About you</div>
            <Field label="About" error={errors.about} hint={`${(draft.about ?? '').length}/5000`}>
              <Textarea value={draft.about ?? ''} onChange={(e) => set({ about: e.target.value })} maxLength={5000} style={{ minHeight: 160 }} />
            </Field>
          </>
        )}
      </div>

      <div className="row between mt-4">
        <Button variant="subtle" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}>
          <ArrowLeft size={16} /> {t('previous')}
        </Button>
        <Button variant="primary" onClick={goNext} loading={saving}>
          {isLast ? <><Check size={16} /> {t('save')}</> : <>{t('next')} <ArrowRight size={16} /></>}
        </Button>
      </div>
    </div>
  );
}

export default function EditProfilePage() {
  return (
    <Suspense fallback={<CenterSpinner />}>
      <EditInner />
    </Suspense>
  );
}
