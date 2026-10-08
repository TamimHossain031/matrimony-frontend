'use client';

import React, { ReactNode } from 'react';
import { BadgeCheck, ShieldCheck, Shield } from 'lucide-react';
import type { VerificationLevel } from '@/types/enums';

type Tone = 'muted' | 'leaf' | 'rose' | 'verify';

export function Badge({
  children,
  tone = 'muted',
  icon,
}: {
  children: ReactNode;
  tone?: Tone;
  icon?: ReactNode;
}) {
  return (
    <span className={`badge badge-${tone}`}>
      {icon}
      {children}
    </span>
  );
}

export const VERIFICATION_LABELS: Record<VerificationLevel, string> = {
  0: 'Unverified',
  1: 'Phone & email verified',
  2: 'NID verified',
  3: 'Selfie verified',
  4: 'Fully reviewed',
};

// Verification is the trust currency — it earns the only bright colour (§9).
export function VerificationBadge({
  level,
  showUnverified = false,
}: {
  level: VerificationLevel;
  showUnverified?: boolean;
}) {
  if (level === 0) {
    if (!showUnverified) return null;
    return (
      <Badge tone="muted" icon={<Shield size={13} />}>
        {VERIFICATION_LABELS[0]}
      </Badge>
    );
  }
  const Icon = level >= 3 ? ShieldCheck : BadgeCheck;
  return (
    <Badge tone="verify" icon={<Icon size={13} />}>
      {VERIFICATION_LABELS[level]}
    </Badge>
  );
}
