'use client';

import React, { useState } from 'react';
import { Languages, LogOut, KeyRound, PauseCircle, Trash2 } from 'lucide-react';
import { useChangePassword } from '@/features/auth/hooks';
import { useUpdateAccountStatus, useDeleteProfile } from '@/features/profile/hooks';
import { useAuth } from '@/components/providers/AuthProvider';
import { PageHeader } from '@/components/layout/PageHeader';
import { Field, Input } from '@/components/ui/form';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/Modal';
import { useToast } from '@/components/providers/ToastProvider';
import { useI18n } from '@/lib/i18n';
import { changePasswordSchema } from '@/features/auth/schemas';
import { apiFieldErrors, errorMessage } from '@/lib/errors';

export default function SettingsPage() {
  const { t, locale, setLocale } = useI18n();
  const { user, signOut } = useAuth();
  const { toast } = useToast();

  const changePassword = useChangePassword();
  const updateStatus = useUpdateAccountStatus();
  const deleteProfile = useDeleteProfile();

  const [pwd, setPwd] = useState({ current_password: '', password: '', password_confirmation: '' });
  const [pwdErrors, setPwdErrors] = useState<Record<string, string>>({});
  const [deactivateOpen, setDeactivateOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const submitPassword = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = changePasswordSchema.safeParse(pwd);
    if (!parsed.success) {
      setPwdErrors(Object.fromEntries(parsed.error.issues.map((i) => [String(i.path[0]), i.message])));
      return;
    }
    setPwdErrors({});
    changePassword.mutate(parsed.data, {
      onSuccess: () => { toast('Password updated.', 'success'); setPwd({ current_password: '', password: '', password_confirmation: '' }); },
      onError: (err) => { setPwdErrors(apiFieldErrors(err)); toast(errorMessage(err), 'error'); },
    });
  };

  return (
    <div style={{ maxWidth: 640, margin: '0 auto' }} className="stack gap-4">
      <PageHeader title={t('nav_settings')} subtitle={user?.email} />

      {/* Language */}
      <div className="card card-pad">
        <div className="section-title">Language</div>
        <div className="row between gap-2">
          <span className="small muted">Interface language — English and বাংলা.</span>
          <Button variant="ghost" onClick={() => setLocale(locale === 'bn' ? 'en' : 'bn')}>
            <Languages size={16} /> {locale === 'bn' ? 'Switch to English' : 'বাংলায় দেখুন'}
          </Button>
        </div>
      </div>

      {/* Change password */}
      <div className="card card-pad">
        <div className="section-title"><KeyRound size={13} style={{ verticalAlign: '-2px', marginRight: 6 }} />Change password</div>
        <form onSubmit={submitPassword}>
          <Field label="Current password" error={pwdErrors.current_password} required>
            <Input type="password" value={pwd.current_password} onChange={(e) => setPwd({ ...pwd, current_password: e.target.value })} invalid={!!pwdErrors.current_password} autoComplete="current-password" />
          </Field>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label="New password" error={pwdErrors.password} required>
              <Input type="password" value={pwd.password} onChange={(e) => setPwd({ ...pwd, password: e.target.value })} invalid={!!pwdErrors.password} autoComplete="new-password" />
            </Field>
            <Field label="Confirm" error={pwdErrors.password_confirmation} required>
              <Input type="password" value={pwd.password_confirmation} onChange={(e) => setPwd({ ...pwd, password_confirmation: e.target.value })} invalid={!!pwdErrors.password_confirmation} autoComplete="new-password" />
            </Field>
          </div>
          <Button type="submit" variant="primary" loading={changePassword.isPending}>{t('save')}</Button>
        </form>
      </div>

      {/* Account */}
      <div className="card card-pad">
        <div className="section-title">Account</div>
        <div className="stack gap-3">
          <div className="row between gap-2 wrap">
            <div>
              <div className="small strong">Log out</div>
              <div className="tiny faint">Sign out on this device.</div>
            </div>
            <Button variant="ghost" onClick={() => signOut()}><LogOut size={16} /> {t('logout')}</Button>
          </div>
          <hr className="hairline" style={{ margin: 0 }} />
          <div className="row between gap-2 wrap">
            <div>
              <div className="small strong">Deactivate</div>
              <div className="tiny faint">Pause your account. You can sign back in to reactivate.</div>
            </div>
            <Button variant="ghost" onClick={() => setDeactivateOpen(true)}><PauseCircle size={16} /> Deactivate</Button>
          </div>
          <hr className="hairline" style={{ margin: 0 }} />
          <div className="row between gap-2 wrap">
            <div>
              <div className="small strong txt-danger">Delete account</div>
              <div className="tiny faint">Permanently close your profile. This cannot be undone.</div>
            </div>
            <Button variant="danger" onClick={() => setDeleteOpen(true)}><Trash2 size={16} /> Delete</Button>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={deactivateOpen}
        onClose={() => setDeactivateOpen(false)}
        onConfirm={() =>
          updateStatus.mutate('deactivated', {
            onSuccess: () => { setDeactivateOpen(false); toast('Account deactivated.', 'success'); signOut(); },
            onError: (e) => toast(errorMessage(e), 'error'),
          })
        }
        title="Deactivate your account?"
        message="Your profile will be paused and hidden. Sign in again any time to reactivate."
        confirmLabel="Deactivate"
        loading={updateStatus.isPending}
      />

      <ConfirmDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={() =>
          deleteProfile.mutate(undefined, {
            onSuccess: () => { toast('Your profile has been closed.', 'success'); signOut(); },
            onError: (e) => toast(errorMessage(e), 'error'),
          })
        }
        title="Delete your account?"
        message="This permanently closes your profile and signs you out. This cannot be undone."
        confirmLabel="Delete permanently"
        danger
        loading={deleteProfile.isPending}
      />
    </div>
  );
}
