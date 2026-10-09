'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, EyeOff, Eye, Plus, X, Ban } from 'lucide-react';
import { useUpdateAccountStatus } from '@/features/profile/hooks';
import {
  useContactBlocks,
  useAddContactBlocks,
  useRemoveContactBlock,
  useBlocks,
} from '@/features/safety/hooks';
import { useAuth } from '@/components/providers/AuthProvider';
import { PageHeader } from '@/components/layout/PageHeader';
import { Field, Input, Textarea } from '@/components/ui/form';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { CenterSpinner } from '@/components/ui/feedback';
import { useToast } from '@/components/providers/ToastProvider';
import { errorMessage } from '@/lib/errors';
import { relativeTime } from '@/lib/format';
import { useI18n } from '@/lib/i18n';

export default function PrivacyPage() {
  const { t } = useI18n();
  const { user, refresh } = useAuth();
  const updateStatus = useUpdateAccountStatus();
  const { toast } = useToast();

  const contactBlocks = useContactBlocks();
  const addBlocks = useAddContactBlocks();
  const removeBlock = useRemoveContactBlock();
  const blocks = useBlocks();

  const [phones, setPhones] = useState('');
  const [label, setLabel] = useState('');

  const hidden = user?.status === 'hidden';

  const toggleVisibility = () => {
    const next = hidden ? 'active' : 'hidden';
    updateStatus.mutate(next, {
      onSuccess: () => { toast(next === 'hidden' ? 'Your profile is now hidden.' : 'Your profile is visible again.', 'success'); refresh(); },
      onError: (e) => toast(errorMessage(e), 'error'),
    });
  };

  const submitBlocklist = () => {
    const list = phones.split(/[\n,]/).map((s) => s.trim()).filter(Boolean);
    if (list.length === 0) return;
    addBlocks.mutate(
      { phones: list, label: label || undefined },
      {
        onSuccess: (r) => {
          toast(r.message ?? 'Added to blocklist.', 'success');
          if (r.invalid?.length) toast(`Skipped invalid numbers: ${r.invalid.join(', ')}`, 'error');
          setPhones('');
          setLabel('');
        },
        onError: (e) => toast(errorMessage(e), 'error'),
      },
    );
  };

  return (
    <div style={{ maxWidth: 680, margin: '0 auto' }} className="stack gap-4">
      <div className="row gap-2">
        <Link href="/me" className="btn btn-icon btn-subtle" aria-label="Back"><ArrowLeft size={18} /></Link>
      </div>
      <PageHeader title={t('privacy_title')} />

      {/* Visibility */}
      <div className="card card-pad">
        <div className="section-title">Profile visibility</div>
        <div className="row between gap-3 wrap">
          <p className="small muted" style={{ margin: 0, maxWidth: '44ch' }}>
            {hidden
              ? 'Your profile is hidden from discovery. Existing connections can still reach you.'
              : 'Your profile is visible in discovery to eligible members.'}
          </p>
          <Button variant={hidden ? 'primary' : 'ghost'} onClick={toggleVisibility} loading={updateStatus.isPending}>
            {hidden ? <><Eye size={16} /> Make visible</> : <><EyeOff size={16} /> Hide my profile</>}
          </Button>
        </div>
      </div>

      {/* Relative blocklist (D2) */}
      <div className="card card-pad">
        <div className="section-title">Relative blocklist</div>
        <p className="small muted" style={{ marginTop: 0 }}>
          Add phone numbers of relatives or acquaintances who should never see your profile. Numbers are hashed and never shown back.
        </p>
        <Field label="Phone numbers" hint="One per line, or comma separated">
          <Textarea value={phones} onChange={(e) => setPhones(e.target.value)} placeholder={'01712345678\n01898765432'} />
        </Field>
        <div className="row gap-2 wrap" style={{ alignItems: 'flex-end' }}>
          <div className="grow"><Field label="Label (optional)"><Input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="e.g. Office colleagues" /></Field></div>
          <Button variant="primary" onClick={submitBlocklist} loading={addBlocks.isPending}><Plus size={16} /> Add</Button>
        </div>

        <div className="mt-2">
          {contactBlocks.isLoading ? (
            <CenterSpinner />
          ) : contactBlocks.data && contactBlocks.data.length > 0 ? (
            <ul className="list-reset stack gap-2">
              {contactBlocks.data.map((b) => (
                <li key={b.id} className="row between gap-2" style={{ padding: '8px 0', borderBottom: '1px solid var(--rule-soft)' }}>
                  <span className="small">{b.label || 'Blocked number'} <span className="tiny faint">· {relativeTime(b.created_at)}</span></span>
                  <button className="link small" onClick={() => removeBlock.mutate(b.id)}><X size={14} /></button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="tiny faint" style={{ margin: 0 }}>No numbers blocked yet.</p>
          )}
        </div>
      </div>

      {/* Blocked members */}
      <div className="card card-pad">
        <div className="section-title">Blocked members</div>
        {blocks.isLoading ? (
          <CenterSpinner />
        ) : blocks.data && blocks.data.length > 0 ? (
          <ul className="list-reset stack gap-2">
            {blocks.data.map((b) => (
              <li key={b.user_id} className="row gap-2" style={{ padding: '6px 0' }}>
                <Ban size={15} className="faint" />
                <span className="small grow">{b.name ?? `Member #${b.user_id}`}</span>
                <Badge tone="muted">Blocked</Badge>
              </li>
            ))}
          </ul>
        ) : (
          <p className="tiny faint" style={{ margin: 0 }}>{"You haven't blocked anyone. You can block a member from their profile."}</p>
        )}
      </div>
    </div>
  );
}
