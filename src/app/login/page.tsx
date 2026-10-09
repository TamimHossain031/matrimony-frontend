'use client';

import React, { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { AuthCard } from '@/components/layout/AuthCard';
import { Field, Input, Checkbox } from '@/components/ui/form';
import { Button } from '@/components/ui/Button';
import { useLogin } from '@/features/auth/hooks';
import { useAuth } from '@/components/providers/AuthProvider';
import { loginSchema } from '@/features/auth/schemas';
import { apiFieldErrors, errorMessage } from '@/lib/errors';
import { useI18n } from '@/lib/i18n';

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginInner />
    </Suspense>
  );
}

function LoginInner() {
  const { t } = useI18n();
  const router = useRouter();
  const params = useSearchParams();
  const { isReady, isAuthenticated } = useAuth();
  const login = useLogin();
  const [values, setValues] = useState({ login: '', password: '', remember_me: false });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isReady && isAuthenticated) router.replace('/dashboard');
  }, [isReady, isAuthenticated, router]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = loginSchema.safeParse(values);
    if (!parsed.success) {
      setErrors(Object.fromEntries(parsed.error.issues.map((i) => [i.path[0], i.message])));
      return;
    }
    setErrors({});
    login.mutate(parsed.data, {
      onSuccess: () => router.replace(params.get('next') || '/dashboard'),
      onError: (err) => setErrors(apiFieldErrors(err)),
    });
  };

  return (
    <AuthCard
      title={t('login_title')}
      subtitle={t('login_subtitle')}
      footer={
        <>
          {t('no_account')}{' '}
          <Link href="/register" className="link">{t('nav_register')}</Link>
        </>
      }
    >
      <form onSubmit={submit} noValidate>
        {login.isError && Object.keys(apiFieldErrors(login.error)).length === 0 && (
          <p className="field-error mb-4">{errorMessage(login.error)}</p>
        )}
        <Field label={t('email_or_phone')} error={errors.login} required>
          <Input
            value={values.login}
            onChange={(e) => setValues({ ...values, login: e.target.value })}
            invalid={!!errors.login}
            autoComplete="username"
            placeholder="name@example.com / 01XXXXXXXXX"
          />
        </Field>
        <Field label={t('password')} error={errors.password} required>
          <Input
            type="password"
            value={values.password}
            onChange={(e) => setValues({ ...values, password: e.target.value })}
            invalid={!!errors.password}
            autoComplete="current-password"
          />
        </Field>
        <div className="row between mb-4">
          <Checkbox
            label={t('remember_me')}
            checked={values.remember_me}
            onChange={(e) => setValues({ ...values, remember_me: e.target.checked })}
          />
          <Link href="/forgot-password" className="link small">{t('forgot_password')}</Link>
        </div>
        <Button type="submit" variant="primary" block loading={login.isPending}>
          {t('btn_login')}
        </Button>
      </form>
    </AuthCard>
  );
}
