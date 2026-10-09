'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AuthCard } from '@/components/layout/AuthCard';
import { Field, Input, Select, Checkbox } from '@/components/ui/form';
import { Button } from '@/components/ui/Button';
import { useRegister } from '@/features/auth/hooks';
import { useAuth } from '@/components/providers/AuthProvider';
import { registerSchema } from '@/features/auth/schemas';
import { apiFieldErrors, errorMessage } from '@/lib/errors';
import { useI18n } from '@/lib/i18n';
import type { Gender, ProfileCreatedBy } from '@/types/enums';

const initial = {
  name: '',
  email: '',
  phone: '',
  password: '',
  password_confirmation: '',
  date_of_birth: '',
  gender: 'male' as Gender,
  profile_created_by: 'self' as ProfileCreatedBy,
  terms_accepted: false,
};

export default function RegisterPage() {
  const { t } = useI18n();
  const router = useRouter();
  const { isReady, isAuthenticated } = useAuth();
  const register = useRegister();
  const [values, setValues] = useState(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isReady && isAuthenticated) router.replace('/dashboard');
  }, [isReady, isAuthenticated, router]);

  const set = (patch: Partial<typeof initial>) => setValues((v) => ({ ...v, ...patch }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = registerSchema.safeParse(values);
    if (!parsed.success) {
      setErrors(Object.fromEntries(parsed.error.issues.map((i) => [String(i.path[0]), i.message])));
      return;
    }
    setErrors({});
    register.mutate(parsed.data, {
      onSuccess: () => router.replace('/me/edit?welcome=1'),
      onError: (err) => setErrors(apiFieldErrors(err)),
    });
  };

  return (
    <AuthCard
      title={t('create_account')}
      subtitle={t('brand_tagline')}
      footer={
        <>
          {t('have_account')}{' '}
          <Link href="/login" className="link">{t('btn_login')}</Link>
        </>
      }
    >
      <form onSubmit={submit} noValidate>
        {register.isError && Object.keys(apiFieldErrors(register.error)).length === 0 && (
          <p className="field-error mb-4">{errorMessage(register.error)}</p>
        )}
        <Field label={t('full_name')} error={errors.name} required>
          <Input value={values.name} onChange={(e) => set({ name: e.target.value })} invalid={!!errors.name} />
        </Field>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Field label={t('gender')} error={errors.gender} required>
            <Select
              value={values.gender}
              onChange={(e) => set({ gender: e.target.value as Gender })}
              options={[
                { value: 'male', label: 'Male' },
                { value: 'female', label: 'Female' },
              ]}
            />
          </Field>
          <Field label={t('date_of_birth')} error={errors.date_of_birth} required>
            <Input type="date" value={values.date_of_birth} onChange={(e) => set({ date_of_birth: e.target.value })} invalid={!!errors.date_of_birth} />
          </Field>
        </div>
        <Field label="Creating this profile for" error={errors.profile_created_by} required>
          <Select
            value={values.profile_created_by}
            onChange={(e) => set({ profile_created_by: e.target.value as ProfileCreatedBy })}
            options={[
              { value: 'self', label: 'Myself' },
              { value: 'parent', label: 'My child (parent)' },
              { value: 'sibling', label: 'My sibling' },
              { value: 'relative', label: 'A relative' },
              { value: 'guardian', label: 'As a guardian' },
            ]}
          />
        </Field>
        <Field label="Email address" error={errors.email} required>
          <Input type="email" value={values.email} onChange={(e) => set({ email: e.target.value })} invalid={!!errors.email} autoComplete="email" placeholder="name@example.com" />
        </Field>
        <Field label="Mobile number" error={errors.phone} required hint="Bangladeshi mobile, e.g. 01712345678">
          <Input value={values.phone} onChange={(e) => set({ phone: e.target.value })} invalid={!!errors.phone} placeholder="01XXXXXXXXX" />
        </Field>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Field label={t('password')} error={errors.password} required>
            <Input type="password" value={values.password} onChange={(e) => set({ password: e.target.value })} invalid={!!errors.password} autoComplete="new-password" />
          </Field>
          <Field label="Confirm password" error={errors.password_confirmation} required>
            <Input type="password" value={values.password_confirmation} onChange={(e) => set({ password_confirmation: e.target.value })} invalid={!!errors.password_confirmation} autoComplete="new-password" />
          </Field>
        </div>
        <div className="mb-4">
          <Checkbox
            label={<span className="small">I accept the terms of use and privacy policy</span>}
            checked={values.terms_accepted}
            onChange={(e) => set({ terms_accepted: e.target.checked })}
          />
          {errors.terms_accepted && <div className="field-error">{errors.terms_accepted}</div>}
        </div>
        <Button type="submit" variant="primary" block loading={register.isPending}>
          {t('btn_register')}
        </Button>
      </form>
    </AuthCard>
  );
}
