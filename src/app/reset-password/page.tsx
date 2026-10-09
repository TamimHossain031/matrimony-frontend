'use client';

import React, { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { AuthCard } from '@/components/layout/AuthCard';
import { Field, Input } from '@/components/ui/form';
import { Button } from '@/components/ui/Button';
import { useResetPassword } from '@/features/auth/hooks';
import { resetPasswordSchema } from '@/features/auth/schemas';
import { apiFieldErrors, errorMessage } from '@/lib/errors';
import { useToast } from '@/components/providers/ToastProvider';

function ResetForm() {
  const router = useRouter();
  const params = useSearchParams();
  const { toast } = useToast();
  const reset = useResetPassword();
  const [values, setValues] = useState({
    token: params.get('token') ?? '',
    email: params.get('email') ?? '',
    password: '',
    password_confirmation: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = resetPasswordSchema.safeParse(values);
    if (!parsed.success) {
      setErrors(Object.fromEntries(parsed.error.issues.map((i) => [String(i.path[0]), i.message])));
      return;
    }
    setErrors({});
    reset.mutate(parsed.data, {
      onSuccess: () => {
        toast('Password reset. Please sign in.', 'success');
        router.replace('/login');
      },
      onError: (err) => setErrors(apiFieldErrors(err)),
    });
  };

  return (
    <form onSubmit={submit} noValidate>
      {reset.isError && Object.keys(apiFieldErrors(reset.error)).length === 0 && (
        <p className="field-error mb-4">{errorMessage(reset.error)}</p>
      )}
      <Field label="Email address" error={errors.email} required>
        <Input type="email" value={values.email} onChange={(e) => setValues({ ...values, email: e.target.value })} invalid={!!errors.email} />
      </Field>
      <Field label="New password" error={errors.password} required>
        <Input type="password" value={values.password} onChange={(e) => setValues({ ...values, password: e.target.value })} invalid={!!errors.password} autoComplete="new-password" />
      </Field>
      <Field label="Confirm new password" error={errors.password_confirmation} required>
        <Input type="password" value={values.password_confirmation} onChange={(e) => setValues({ ...values, password_confirmation: e.target.value })} invalid={!!errors.password_confirmation} autoComplete="new-password" />
      </Field>
      <Button type="submit" variant="primary" block loading={reset.isPending}>
        Set new password
      </Button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <AuthCard title="Reset password" footer={<Link href="/login" className="link">Back to sign in</Link>}>
      <Suspense fallback={null}>
        <ResetForm />
      </Suspense>
    </AuthCard>
  );
}
