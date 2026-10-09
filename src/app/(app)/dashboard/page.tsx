'use client';

import React from 'react';
import Link from 'next/link';
import {
  Heart,
  Link2,
  Bookmark,
  Eye,
  Bell,
  ArrowRight,
  UserPlus,
} from 'lucide-react';
import { useDashboard } from '@/features/profile/hooks';
import { useAuth } from '@/components/providers/AuthProvider';
import { PageHeader } from '@/components/layout/PageHeader';
import { CompletionProgress } from '@/components/profile/CompletionProgress';
import { VerificationBadge } from '@/components/ui/Badge';
import { QueryBoundary, Skeleton } from '@/components/ui/feedback';
import { useI18n } from '@/lib/i18n';
import type { VerificationLevel } from '@/types/enums';

export default function DashboardPage() {
  const { t } = useI18n();
  const { user } = useAuth();
  const query = useDashboard();

  return (
    <div>
      <PageHeader title={`${t('dashboard_greeting')}, ${user?.name ?? ''}`.trim()} subtitle={t('brand_tagline')} />

      <QueryBoundary
        query={query}
        loading={
          <div className="grid-cards">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="card card-pad"><Skeleton height={48} /></div>
            ))}
          </div>
        }
      >
        {(dash) => (
          <div className="stack gap-4">
            {/* Completion + verification */}
            <div className="card card-pad">
              <div className="row between gap-3 wrap">
                <div className="grow" style={{ minWidth: 220 }}>
                  <CompletionProgress percent={dash.profile_completion} label={t('stat_completion')} />
                  {dash.missing_sections.length > 0 && (
                    <p className="small muted mt-2" style={{ margin: '8px 0 0' }}>
                      Still to add: {dash.missing_sections.join(', ')}
                    </p>
                  )}
                </div>
                <div className="stack gap-2" style={{ alignItems: 'flex-end' }}>
                  <VerificationBadge level={dash.verification_level as VerificationLevel} showUnverified />
                  <Link href="/me/edit" className="btn btn-primary btn-sm">
                    {dash.profile_completion < 100 ? t('complete_profile_cta') : t('edit_profile')}
                    <ArrowRight size={15} />
                  </Link>
                </div>
              </div>
            </div>

            {/* Stat grid */}
            <div className="grid-cards">
              <StatCard icon={<Heart size={18} />} label={t('stat_new_interests')} value={dash.new_interests} href="/interests" tone="rose" />
              <StatCard icon={<Link2 size={18} />} label={t('stat_connections')} value={dash.accepted_connections} href="/messages" tone="leaf" />
              <StatCard icon={<Bookmark size={18} />} label={t('stat_shortlist')} value={dash.shortlist_count} href="/shortlist" tone="leaf" />
              <StatCard icon={<Eye size={18} />} label={t('stat_viewers')} value={dash.recent_viewers} tone="muted" />
            </div>

            <div className="row gap-3 wrap">
              <Link href="/discover" className="btn btn-primary"><UserPlus size={16} /> {t('discover_title')}</Link>
              {dash.unread_notifications > 0 && (
                <Link href="/notifications" className="btn btn-ghost">
                  <Bell size={16} /> {dash.unread_notifications} new {t('nav_notifications').toLowerCase()}
                </Link>
              )}
            </div>
          </div>
        )}
      </QueryBoundary>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  href,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  href?: string;
  tone: 'rose' | 'leaf' | 'muted';
}) {
  const bg = tone === 'rose' ? 'var(--rose-soft)' : tone === 'leaf' ? 'var(--leaf-soft)' : 'var(--rule-soft)';
  const fg = tone === 'rose' ? 'var(--rose)' : tone === 'leaf' ? 'var(--leaf)' : 'var(--ink-soft)';
  const inner = (
    <div className="card card-pad" style={{ height: '100%' }}>
      <span className="state-icon" style={{ width: 38, height: 38, background: bg, color: fg }}>{icon}</span>
      <div style={{ fontSize: '1.8rem', fontWeight: 700, marginTop: 10, lineHeight: 1 }}>{value}</div>
      <div className="small muted">{label}</div>
    </div>
  );
  return href ? <Link href={href} style={{ color: 'inherit' }}>{inner}</Link> : inner;
}
