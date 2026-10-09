'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { AuthCard } from '@/components/layout/AuthCard';
import { Field, Input } from '@/components/ui/form';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/feedback';
import { MailCheck } from 'lucide-react';
import { useForgotPassword } from '@/features/auth/hooks';
import { forgotPasswordSchema } from '@/features/auth/schemas';
import { errorMessage } from '@/lib/errors';
import { useI18n } from '@/lib/i18n';

export default function ForgotPasswordPage() {
  const { t } = useI18n();
  const forgot = useForgotPassword();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string>();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = forgotPasswordSchema.safeParse({ email });
    if (!parsed.success) {
      setError(parsed.error.issues[0].message);
      return;
    }
    setError(undefined);
    forgot.mutate(email);
  };

  return (
    <AuthCard
      title={t('forgot_password')}
      subtitle="We'll email you a secure link to set a new password."
      footer={<Link href="/login" className="link">{t('back')} {t('btn_login').toLowerCase()}</Link>}
    >
      {forgot.isSuccess ? (
        <EmptyState
          icon={<MailCheck size={24} />}
          title="Check your inbox"
          message={forgot.data?.message ?? 'If that email is registered, a reset link has been sent.'}
        />
      ) : (
        <form onSubmit={submit} noValidate>
          {forgot.isError && <p className="field-error mb-4">{errorMessage(forgot.error)}</p>}
          <Field label="Email address" error={error} required>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} invalid={!!error} placeholder="name@example.com" />
          </Field>
          <Button type="submit" variant="primary" block loading={forgot.isPending}>
            Send reset link
          </Button>
        </form>
      )}
    </AuthCard>
  );
}
