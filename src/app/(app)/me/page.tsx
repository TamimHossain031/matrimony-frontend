'use client';

import React from 'react';
import Link from 'next/link';
import {
  Pencil,
  Images,
  SlidersHorizontal,
  ShieldCheck,
  UserPlus,
  ChevronRight,
} from 'lucide-react';
import { useMyProfile } from '@/features/profile/hooks';
import { PageHeader } from '@/components/layout/PageHeader';
import { CompletionProgress } from '@/components/profile/CompletionProgress';
import { VerificationBadge, Badge } from '@/components/ui/Badge';
import { CenterSpinner, EmptyState } from '@/components/ui/feedback';
import { ApiError } from '@/lib/api-client';
import { MARITAL_LABELS, heightWithCm } from '@/lib/format';
import { useI18n } from '@/lib/i18n';

export default function MyProfilePage() {
  const { t, getText } = useI18n();
  const query = useMyProfile();

  if (query.isLoading) return <CenterSpinner />;

  // 404 == profile not created yet.
  if (query.isError) {
    const notFound = query.error instanceof ApiError && query.error.status === 404;
    if (notFound) {
      return (
        <EmptyState
          icon={<UserPlus size={24} />}
          title={t('create_profile_title')}
          message="You haven't created your profile yet. It only takes a few minutes."
          action={<Link href="/me/edit" className="btn btn-primary">{t('create_profile_title')}</Link>}
        />
      );
    }
    return <EmptyState title={t('error_title')} message={t('error_desc')} action={<Link className="btn btn-ghost" href="/me">{t('btn_retry')}</Link>} />;
  }

  const p = query.data!;
  const name = getText(p.full_name_en, p.full_name_bn) || p.public_id;
  const location = [p.upazila && getText(p.upazila.name_en, p.upazila.name_bn), p.district && getText(p.district.name_en, p.district.name_bn)].filter(Boolean).join(', ');

  const links = [
    { href: '/me/edit', icon: <Pencil size={18} />, label: t('edit_profile') },
    { href: '/me/photos', icon: <Images size={18} />, label: t('my_photos') },
    { href: '/me/preferences', icon: <SlidersHorizontal size={18} />, label: t('preferences_title') },
    { href: '/me/privacy', icon: <ShieldCheck size={18} />, label: t('privacy_title') },
  ];

  return (
    <div className="stack gap-4">
      <PageHeader title={t('me_title')} actions={<Link href="/me/edit" className="btn btn-primary btn-sm"><Pencil size={15} /> {t('edit_profile')}</Link>} />

      <div className="card card-pad">
        <div className="row between gap-3 wrap">
          <div>
            <div className="row gap-2 wrap" style={{ alignItems: 'baseline' }}>
              <h2 style={{ margin: 0 }}>{name}</h2>
              <span className="faint small">{p.public_id}</span>
            </div>
            {p.headline && <p className="muted" style={{ margin: '4px 0 0' }}>{p.headline}</p>}
          </div>
          <VerificationBadge level={p.verification_level} showUnverified />
        </div>

        <div className="row wrap gap-2 mt-3">
          {p.age != null && <Badge tone="muted">{p.age} {t('years')}</Badge>}
          {location && <Badge tone="muted">{location}</Badge>}
          {p.marital_status && <Badge tone="muted">{MARITAL_LABELS[p.marital_status]}</Badge>}
          {p.height_cm != null && <Badge tone="muted">{heightWithCm(p.height_cm)}</Badge>}
          {p.religion && <Badge tone="leaf">{getText(p.religion.name_en, p.religion.name_bn)}</Badge>}
        </div>

        <hr className="hairline" />
        <CompletionProgress percent={p.completion_percent} label={t('stat_completion')} />
      </div>

      <div className="card" style={{ overflow: 'hidden' }}>
        {links.map((l) => (
          <Link key={l.href} href={l.href} className="notif-item" style={{ color: 'inherit', textDecoration: 'none' }}>
            <span className="state-icon" style={{ width: 36, height: 36 }}>{l.icon}</span>
            <span className="grow strong small" style={{ alignSelf: 'center' }}>{l.label}</span>
            <ChevronRight size={18} className="faint" style={{ alignSelf: 'center' }} />
          </Link>
        ))}
      </div>

      <div className="text-center">
        <Link href={`/profiles/${p.public_id}`} className="link small">See how others view your profile →</Link>
      </div>
    </div>
  );
}
