'use client';

import React, { Suspense } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { MapPin, Flag, CalendarDays } from 'lucide-react';
import { useProfileDetail } from '@/features/profile/hooks';
import { PhotoGallery } from '@/components/profile/PhotoGallery';
import { MatchBreakdown } from '@/components/profile/MatchBreakdown';
import { ProfileActions } from '@/components/profile/ProfileActions';
import { VerificationBadge, Badge } from '@/components/ui/Badge';
import { CenterSpinner, ErrorState } from '@/components/ui/feedback';
import {
  MARITAL_LABELS,
  heightWithCm,
  formatIncomeRange,
  DIET_LABELS,
  YESNO_LABELS,
  FAMILY_TYPE_LABELS,
} from '@/lib/format';
import { useI18n } from '@/lib/i18n';
import type { Profile } from '@/types/models';

export default function ProfileDetailPage() {
  return (
    <Suspense fallback={<CenterSpinner />}>
      <ProfileDetailInner />
    </Suspense>
  );
}

function ProfileDetailInner() {
  const params = useParams<{ publicId: string }>();
  const publicId = params.publicId;
  const query = useProfileDetail(publicId);
  const router = useRouter();

  if (query.isLoading) return <CenterSpinner />;
  if (query.isError) return <ErrorState error={query.error} onRetry={query.refetch} />;
  if (!query.data) return <ErrorState error={new Error('Not found')} />;

  const profile = query.data.data;
  const match = query.data.match;

  return (
    <div className="profile-detail">
      <div className="pd-main stack gap-4">
        <ProfileHeaderCard profile={profile} />

        {profile.about && (
          <Section title={<span>About</span>}>
            <p style={{ margin: 0, maxWidth: '68ch' }}>{profile.about}</p>
          </Section>
        )}

        <EducationCareer profile={profile} />
        <FamilySection profile={profile} />
        <LifestyleSection profile={profile} />
        <ReligionSection profile={profile} />
      </div>

      <aside className="pd-side stack gap-4">
        <PhotoGallery photos={profile.photos ?? []} publicId={profile.public_id} isOwner={profile.is_owner} />
        {!profile.is_owner && (
          <div className="card card-pad">
            <ProfileActions
              publicId={profile.public_id}
              name={profile.full_name_en || profile.public_id}
              onBlocked={() => router.push('/discover')}
            />
          </div>
        )}
        {match && <MatchBreakdown match={match} />}
      </aside>

      <style>{profileDetailCss}</style>
    </div>
  );
}

function ProfileHeaderCard({ profile }: { profile: Profile }) {
  const { getText, t } = useI18n();
  const name = getText(profile.full_name_en, profile.full_name_bn) || profile.public_id;
  const location = [profile.upazila && getText(profile.upazila.name_en, profile.upazila.name_bn), profile.district && getText(profile.district.name_en, profile.district.name_bn)]
    .filter(Boolean)
    .join(', ');

  return (
    <div className="card card-pad">
      <div className="row between gap-3 wrap">
        <div>
          <div className="row gap-2 wrap" style={{ alignItems: 'baseline' }}>
            <h1 style={{ margin: 0 }}>{name}</h1>
            <span className="faint small">{profile.public_id}</span>
          </div>
          {profile.headline && <p className="muted" style={{ margin: '4px 0 0' }}>{profile.headline}</p>}
        </div>
        <VerificationBadge level={profile.verification_level} showUnverified />
      </div>

      <div className="row wrap gap-3 mt-3 muted small">
        {profile.age != null && <span className="row gap-1"><CalendarDays size={14} /> {profile.age} {t('years')}</span>}
        {location && <span className="row gap-1"><MapPin size={14} /> {location}</span>}
        {profile.nationality && <span className="row gap-1"><Flag size={14} /> {profile.nationality}</span>}
      </div>

      <div className="row wrap gap-2 mt-3">
        {profile.marital_status && <Badge tone="muted">{MARITAL_LABELS[profile.marital_status]}</Badge>}
        {profile.height_cm != null && <Badge tone="muted">{heightWithCm(profile.height_cm)}</Badge>}
        {profile.religion && <Badge tone="leaf">{getText(profile.religion.name_en, profile.religion.name_bn)}</Badge>}
        {profile.managers && profile.managers.length > 0 && <Badge tone="muted">Guardian-managed</Badge>}
      </div>
    </div>
  );
}

function Section({ title, children }: { title: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="card card-pad">
      <div className="section-title">{title}</div>
      {children}
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  if (value == null || value === '' ) return null;
  return (
    <>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </>
  );
}

function EducationCareer({ profile }: { profile: Profile }) {
  const { getText } = useI18n();
  const e = profile.education;
  const c = profile.career;
  const hasAny =
    profile.education_level || e.institution || e.subject || e.graduation_year ||
    profile.profession || c.job_title || c.organization || c.work_location ||
    c.income_range[0] != null || c.income_range[1] != null;
  if (!hasAny) return null;
  return (
    <Section title="Education & career">
      <dl className="dl">
        <Row label="Highest education" value={profile.education_level && getText(profile.education_level.name_en, profile.education_level.name_bn)} />
        <Row label="Institution" value={e.institution} />
        <Row label="Subject" value={e.subject} />
        <Row label="Graduation year" value={e.graduation_year} />
        <Row label="Profession" value={profile.profession && getText(profile.profession.name_en, profile.profession.name_bn)} />
        <Row label="Job title" value={c.job_title} />
        <Row label="Organization" value={c.organization} />
        <Row label="Work location" value={c.work_location} />
        <Row label="Monthly income" value={formatIncomeRange(c.income_range)} />
      </dl>
    </Section>
  );
}

function FamilySection({ profile }: { profile: Profile }) {
  const f = profile.family;
  const hasAny = f.father_occupation || f.mother_occupation || f.siblings_count != null || f.family_type || f.family_location || f.description;
  if (!hasAny) return null;
  return (
    <Section title="Family">
      <dl className="dl">
        <Row label="Father's occupation" value={f.father_occupation} />
        <Row label="Mother's occupation" value={f.mother_occupation} />
        <Row label="Siblings" value={f.siblings_count} />
        <Row label="Family type" value={f.family_type && FAMILY_TYPE_LABELS[f.family_type]} />
        <Row label="Family location" value={f.family_location} />
      </dl>
      {f.description && <p className="muted small mt-2" style={{ marginBottom: 0 }}>{f.description}</p>}
    </Section>
  );
}

function LifestyleSection({ profile }: { profile: Profile }) {
  const l = profile.lifestyle;
  if (!l || (!l.smoking && !l.drinking && !l.diet && !l.hobbies?.length && !l.languages?.length)) return null;
  return (
    <Section title="Lifestyle">
      <dl className="dl">
        <Row label="Diet" value={l.diet && DIET_LABELS[l.diet]} />
        <Row label="Smoking" value={l.smoking && YESNO_LABELS[l.smoking]} />
        <Row label="Drinking" value={l.drinking && YESNO_LABELS[l.drinking]} />
        <Row label="Languages" value={l.languages?.length ? l.languages.join(', ') : null} />
        <Row label="Hobbies" value={l.hobbies?.length ? l.hobbies.join(', ') : null} />
      </dl>
    </Section>
  );
}

function ReligionSection({ profile }: { profile: Profile }) {
  const attrs = profile.religion_attributes ? Object.entries(profile.religion_attributes) : [];
  if (attrs.length === 0) return null;
  return (
    <Section title="Religious background">
      <dl className="dl">
        {attrs.map(([k, v]) => (
          <Row key={k} label={k.replace(/_/g, ' ')} value={v} />
        ))}
      </dl>
    </Section>
  );
}

const profileDetailCss = `
.profile-detail { display: flex; flex-direction: column-reverse; gap: 20px; }
.pd-side { order: -1; }
@media (min-width: 1024px) {
  .profile-detail { display: grid; grid-template-columns: 1fr 340px; gap: 24px; align-items: start; }
  .pd-side { position: sticky; top: 76px; }
}
`;
