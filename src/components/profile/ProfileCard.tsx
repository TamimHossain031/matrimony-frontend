'use client';

import React from 'react';
import Link from 'next/link';
import { MapPin, Briefcase, GraduationCap, ImageOff, Lock } from 'lucide-react';
import type { ProfileCard as ProfileCardModel } from '@/types/models';
import { VerificationBadge } from '@/components/ui/Badge';
import { MatchRing } from './MatchRing';
import { useI18n } from '@/lib/i18n';

// Discovery card: leads with the match explanation and the facts that matter,
// not the photo (blueprint §9). The card resource never carries a photo URL —
// only whether one exists — so we show a trust-first placeholder.
export function ProfileCard({ profile }: { profile: ProfileCardModel }) {
  const { t } = useI18n();
  const facts = [
    profile.age != null && { icon: null, text: `${profile.age} ${t('years')}` },
    profile.district && { icon: <MapPin size={14} />, text: profile.district },
    profile.profession && { icon: <Briefcase size={14} />, text: profile.profession },
    profile.education && { icon: <GraduationCap size={14} />, text: profile.education },
  ].filter(Boolean) as { icon: React.ReactNode; text: string }[];

  return (
    <Link href={`/profiles/${profile.public_id}`} className="card pcard" style={{ textDecoration: 'none', color: 'inherit' }}>
      <div className="pcard-top">
        <div className="photo-frame pcard-photo" aria-hidden>
          {profile.has_photo ? (
            <div className="photo-lock" style={{ position: 'static', background: 'none' }}>
              <Lock size={18} />
              <span className="tiny">{t('photo_blurred_notice', 'Photo on request')}</span>
            </div>
          ) : (
            <div className="photo-lock" style={{ position: 'static', background: 'none' }}>
              <ImageOff size={18} />
              <span className="tiny faint">No photo</span>
            </div>
          )}
        </div>

        <div className="pcard-body">
          <div className="row between gap-2">
            <div className="row gap-2 wrap">
              <span className="strong">{profile.name}</span>
              <span className="tiny faint">{profile.public_id}</span>
            </div>
            {profile.match && <MatchRing score={profile.match.score} />}
          </div>

          {profile.headline && <p className="small muted" style={{ margin: '4px 0 0' }}>{profile.headline}</p>}

          <div className="pcard-facts">
            {facts.map((f, i) => (
              <span key={i} className="row gap-1">
                {f.icon}
                {f.text}
              </span>
            ))}
          </div>

          <div className="mt-2">
            <VerificationBadge level={profile.verification_level} showUnverified />
          </div>
        </div>
      </div>

      {profile.match && profile.match.must_haves_total > 0 && (
        <div className="pcard-foot">
          <span className="small muted">
            {t('match_criteria_met', 'Must-haves met')}: {profile.match.must_haves_met} / {profile.match.must_haves_total}
          </span>
        </div>
      )}
    </Link>
  );
}
