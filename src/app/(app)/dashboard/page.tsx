'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import {
  Heart,
  MessageCircle,
  Bookmark,
  Eye,
  Bell,
  ArrowRight,
  Search,
  Sparkles,
  SlidersHorizontal,
  Images,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Users,
  Compass,
  Check,
  ChevronRight,
  FileText,
} from 'lucide-react';
import { useDashboard, useMyProfile } from '@/features/profile/hooks';
import { useInterests, useRespondInterest } from '@/features/interests/hooks';
import { useDiscovery } from '@/features/discovery/hooks';
import { useAuth } from '@/components/providers/AuthProvider';
import { useToast } from '@/components/providers/ToastProvider';
import { VerificationBadge, Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { ProfileCard } from '@/components/profile/ProfileCard';
import { QueryBoundary, Skeleton } from '@/components/ui/feedback';
import { Button } from '@/components/ui/Button';
import { useI18n } from '@/lib/i18n';
import { relativeTime } from '@/lib/format';
import { errorMessage } from '@/lib/errors';
import type { VerificationLevel } from '@/types/enums';
import type { Interest } from '@/types/models';

export default function DashboardPage() {
  const { t, locale, formatNumber } = useI18n();
  const { user } = useAuth();
  const dashboardQuery = useDashboard();
  const myProfileQuery = useMyProfile();

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (locale === 'bn') {
      if (hour >= 5 && hour < 12) return 'শুভ সকাল';
      if (hour >= 12 && hour < 17) return 'শুভ দুপুর';
      if (hour >= 17 && hour < 21) return 'শুভ সন্ধ্যা';
      return 'শুভ রাত্রি';
    }
    if (hour >= 5 && hour < 12) return 'Good morning';
    if (hour >= 12 && hour < 17) return 'Good afternoon';
    if (hour >= 17 && hour < 21) return 'Good evening';
    return 'Good evening';
  }, [locale]);

  return (
    <div className="stack gap-6">
      <QueryBoundary
        query={dashboardQuery}
        loading={<DashboardSkeleton />}
      >
        {(dash) => (
          <div className="stack gap-6">
            {/* 1. Hero Welcome & Identity Banner */}
            <div className="dash-hero">
              <div className="row between gap-4 wrap" style={{ position: 'relative', zIndex: 1 }}>
                <div className="row gap-3 grow" style={{ minWidth: 260 }}>
                  <Avatar name={user?.name} size={64} />
                  <div>
                    <div className="row gap-2 wrap" style={{ alignItems: 'center' }}>
                      <h1 style={{ fontSize: '1.65rem', margin: 0, fontWeight: 750 }}>
                        {greeting}, {user?.name ?? ''}
                      </h1>
                      <VerificationBadge
                        level={dash.verification_level as VerificationLevel}
                        showUnverified
                      />
                    </div>
                    <p className="muted small mt-1" style={{ margin: '4px 0 0', maxWidth: '58ch' }}>
                      {t('dashboard_motto', 'A dignified, family-centered platform for lifelong union')}
                    </p>
                  </div>
                </div>

                <div className="row gap-2 wrap" style={{ alignItems: 'center' }}>
                  <Link href="/me" className="btn btn-ghost btn-sm">
                    <FileText size={15} />
                    {t('dash_view_public_profile', 'View My Biodata')}
                  </Link>
                  <Link href="/me/edit" className="btn btn-primary btn-sm">
                    {dash.profile_completion < 100 ? t('complete_profile_cta') : t('edit_profile')}
                    <ArrowRight size={15} />
                  </Link>
                  {dash.unread_notifications > 0 && (
                    <Link
                      href="/notifications"
                      className="btn btn-subtle btn-sm"
                      title={t('nav_notifications')}
                    >
                      <Bell size={16} />
                      <span className="nav-count" style={{ marginLeft: 2 }}>
                        {formatNumber(dash.unread_notifications)}
                      </span>
                    </Link>
                  )}
                </div>
              </div>
            </div>

            {/* 2. Profile Readiness & Health Card */}
            <ProfileReadinessCard
              completion={dash.profile_completion}
              missingSections={dash.missing_sections}
              verificationLevel={dash.verification_level as VerificationLevel}
            />

            {/* 3. Core Metrics 4-Stat Grid */}
            <div className="dash-stat-grid">
              <StatCard
                icon={<Heart size={20} />}
                label={t('stat_new_interests')}
                value={dash.new_interests}
                href="/interests?box=received"
                tone="rose"
                badgeText={dash.new_interests > 0 ? (locale === 'bn' ? 'সাড়া দিন' : 'New') : undefined}
                subtitle={locale === 'bn' ? 'প্রাপ্ত আগ্রহ পর্যালোচনা' : 'Review requests'}
                formatNumber={formatNumber}
              />
              <StatCard
                icon={<MessageCircle size={20} />}
                label={t('stat_connections')}
                value={dash.accepted_connections}
                href="/messages"
                tone="leaf"
                badgeText={dash.accepted_connections > 0 ? (locale === 'bn' ? 'সক্রিয়' : 'Active') : undefined}
                subtitle={locale === 'bn' ? 'কথোপকথন ও চ্যাট' : 'Direct conversations'}
                formatNumber={formatNumber}
              />
              <StatCard
                icon={<Bookmark size={20} />}
                label={t('stat_shortlist')}
                value={dash.shortlist_count}
                href="/shortlist"
                tone="marigold"
                subtitle={locale === 'bn' ? 'বিবেচনার জন্য সংরক্ষিত' : 'Saved for review'}
                formatNumber={formatNumber}
              />
              <StatCard
                icon={<Eye size={20} />}
                label={t('stat_viewers')}
                value={dash.recent_viewers}
                href="/discover"
                tone="muted"
                subtitle={locale === 'bn' ? 'গত ৭ দিনে পরিদর্শন' : 'Viewed in 7 days'}
                formatNumber={formatNumber}
              />
            </div>

            {/* 4. Priority Quick Actions Hub */}
            <div>
              <div className="dash-section-head">
                <h3 className="dash-section-title">
                  <Sparkles size={18} className="txt-leaf" />
                  {t('dash_quick_actions', 'Quick Actions')}
                </h3>
              </div>
              <div className="dash-quick-grid">
                <Link href="/discover" className="dash-action-tile">
                  <div className="dash-action-icon">
                    <Search size={20} />
                  </div>
                  <div>
                    <div className="strong" style={{ fontSize: '0.92rem' }}>
                      {t('dash_search_matches', 'Find Matches')}
                    </div>
                    <div className="tiny muted mt-1">
                      {t('dash_search_matches_desc', 'Search by age, district, and education')}
                    </div>
                  </div>
                </Link>

                <Link href="/me/preferences" className="dash-action-tile">
                  <div className="dash-action-icon">
                    <SlidersHorizontal size={20} />
                  </div>
                  <div>
                    <div className="strong" style={{ fontSize: '0.92rem' }}>
                      {t('dash_preferences', 'Partner Preferences')}
                    </div>
                    <div className="tiny muted mt-1">
                      {t('dash_preferences_desc', 'Set expectations and match criteria')}
                    </div>
                  </div>
                </Link>

                <Link href="/me/photos" className="dash-action-tile">
                  <div className="dash-action-icon">
                    <Images size={20} />
                  </div>
                  <div>
                    <div className="strong" style={{ fontSize: '0.92rem' }}>
                      {t('dash_photos', 'Photos & Privacy')}
                    </div>
                    <div className="tiny muted mt-1">
                      {t('dash_photos_desc', 'Manage gallery and privacy visibility')}
                    </div>
                  </div>
                </Link>

                <Link href="/me/edit" className="dash-action-tile">
                  <div className="dash-action-icon">
                    <ShieldCheck size={20} />
                  </div>
                  <div>
                    <div className="strong" style={{ fontSize: '0.92rem' }}>
                      {t('dash_verify_nid', 'Verify Identity (NID)')}
                    </div>
                    <div className="tiny muted mt-1">
                      {t('dash_verify_nid_desc', 'Earn verified badge and boost responses')}
                    </div>
                  </div>
                </Link>
              </div>
            </div>

            {/* 5. Incoming Interests Spotlight (if any) */}
            <IncomingInterestsFeed count={dash.new_interests} />

            {/* 6. Curated Matches Spotlight */}
            <CuratedMatchesFeed />

            {/* 7. Matrimonial Trust & Privacy Banner */}
            <div className="dash-trust-banner">
              <div className="dash-section-head" style={{ marginBottom: 14 }}>
                <div className="row gap-2">
                  <ShieldCheck size={20} className="txt-leaf" />
                  <span className="strong" style={{ fontSize: '0.96rem' }}>
                    {t('dash_safety_banner_title', 'Safe, Dignified & Family-Centered')}
                  </span>
                </div>
                <Link href="/me/privacy" className="small link row gap-1">
                  {t('privacy_title', 'Privacy & safety')}
                  <ChevronRight size={14} />
                </Link>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                  gap: 16,
                }}
              >
                <div className="row gap-2" style={{ alignItems: 'flex-start' }}>
                  <span
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: '50%',
                      background: 'var(--leaf-soft)',
                      color: 'var(--leaf)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      marginTop: 2,
                    }}
                  >
                    <Lock size={15} />
                  </span>
                  <div>
                    <div className="strong small">{t('dash_safety_p1_title', 'Privacy First')}</div>
                    <div className="tiny muted mt-1">
                      {t('dash_safety_p1_desc', 'Photos remain blurred until you accept requests')}
                    </div>
                  </div>
                </div>

                <div className="row gap-2" style={{ alignItems: 'flex-start' }}>
                  <span
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: '50%',
                      background: 'var(--marigold-soft)',
                      color: '#9a6a10',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      marginTop: 2,
                    }}
                  >
                    <ShieldCheck size={15} />
                  </span>
                  <div>
                    <div className="strong small">{t('dash_safety_p2_title', 'NID Verified')}</div>
                    <div className="tiny muted mt-1">
                      {t('dash_safety_p2_desc', 'Identity verified to prevent counterfeit biodatas')}
                    </div>
                  </div>
                </div>

                <div className="row gap-2" style={{ alignItems: 'flex-start' }}>
                  <span
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: '50%',
                      background: 'var(--leaf-soft)',
                      color: 'var(--leaf)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      marginTop: 2,
                    }}
                  >
                    <Users size={15} />
                  </span>
                  <div>
                    <div className="strong small">{t('dash_safety_p3_title', 'Guardian Friendly')}</div>
                    <div className="tiny muted mt-1">
                      {t('dash_safety_p3_desc', 'Family & guardian involvement supported throughout')}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </QueryBoundary>
    </div>
  );
}

// ---- Subcomponent: Profile Readiness Card -----------------------------------

const SECTION_CONFIG: Record<
  string,
  { labelKey: keyof typeof import('@/lib/i18n/dictionary').dictionary['en']; href: string }
> = {
  personal: { labelKey: 'dash_missing_personal', href: '/me/edit' },
  education: { labelKey: 'dash_missing_education', href: '/me/edit' },
  career: { labelKey: 'dash_missing_career', href: '/me/edit' },
  family: { labelKey: 'dash_missing_family', href: '/me/edit' },
  lifestyle: { labelKey: 'dash_missing_lifestyle', href: '/me/edit' },
  preferences: { labelKey: 'dash_missing_preferences', href: '/me/preferences' },
  partner_preferences: { labelKey: 'dash_missing_preferences', href: '/me/preferences' },
  photos: { labelKey: 'dash_missing_photos', href: '/me/photos' },
};

function ProfileReadinessCard({
  completion,
  missingSections,
  verificationLevel,
}: {
  completion: number;
  missingSections: string[];
  verificationLevel: VerificationLevel;
}) {
  const { t, formatNumber, locale } = useI18n();
  const clamped = Math.min(100, Math.max(0, completion));
  const isComplete = clamped >= 100;

  return (
    <div className="card card-pad dash-interactive-card">
      <div className="row between gap-4 wrap" style={{ alignItems: 'center' }}>
        <div className="row gap-4 grow" style={{ minWidth: 260 }}>
          {/* Circular Gauge */}
          <CircularGauge percent={clamped} />

          <div className="grow">
            <div className="row gap-2 wrap" style={{ alignItems: 'center' }}>
              <span className="strong" style={{ fontSize: '1.05rem' }}>
                {t('stat_completion', 'Profile completion')}
              </span>
              {isComplete ? (
                <Badge tone="leaf" icon={<CheckCircle2 size={13} />}>
                  {locale === 'bn' ? '১০০% সম্পূর্ণ' : 'Fully Complete'}
                </Badge>
              ) : clamped >= 75 ? (
                <Badge tone="leaf">
                  {locale === 'bn' ? 'উন্নত বায়োডাটা' : 'Good Progress'}
                </Badge>
              ) : (
                <Badge tone="rose">
                  {locale === 'bn' ? 'অসম্পূর্ণ বায়োডাটা' : 'Action Needed'}
                </Badge>
              )}
            </div>

            <p className="tiny muted mt-1" style={{ margin: '4px 0 0', maxWidth: '52ch' }}>
              {isComplete
                ? (locale === 'bn'
                  ? 'অভিনন্দন! আপনার প্রোফাইল সম্পূর্ণ ও প্রস্তাবের জন্য প্রস্তুত।'
                  : 'Congratulations! Your biodata is completely filled and ready for proposals.')
                : t('dash_completion_tip', 'Profiles with 80%+ completion receive 4x more interest requests')}
            </p>

            {/* Clickable Missing Tags */}
            {missingSections.length > 0 && (
              <div className="mt-3">
                <div className="tiny faint" style={{ marginBottom: 6, fontWeight: 650 }}>
                  {locale === 'bn' ? 'আরও যা যুক্ত করতে পারেন:' : 'Suggested sections to add:'}
                </div>
                <div className="row gap-2 wrap">
                  {missingSections.map((sec) => {
                    const cfg = SECTION_CONFIG[sec];
                    const label = cfg ? t(cfg.labelKey) : sec;
                    const href = cfg ? cfg.href : '/me/edit';
                    return (
                      <Link key={sec} href={href} className="dash-tag-missing">
                        <span>+ {label}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="stack gap-2" style={{ alignItems: 'flex-end', alignSelf: 'center' }}>
          <Link href="/me/edit" className="btn btn-primary btn-sm">
            {isComplete ? t('edit_profile') : t('complete_profile_cta')}
            <ArrowRight size={14} />
          </Link>
          {verificationLevel === 0 && (
            <Link href="/me/edit" className="tiny link txt-rose">
              {locale === 'bn' ? 'এনআইডি যাচাই করে ব্যাজ নিন' : 'Verify NID to earn trust badge'}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

// Circular SVG Gauge
function CircularGauge({
  percent,
  size = 80,
  strokeWidth = 7,
}: {
  percent: number;
  size?: number;
  strokeWidth?: number;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;
  const strokeColor =
    percent >= 80 ? 'var(--leaf)' : percent >= 50 ? 'var(--marigold)' : 'var(--rose)';

  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--rule-soft)"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.8s ease' }}
        />
      </svg>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
        }}
      >
        <span
          style={{
            fontSize: '1.15rem',
            fontWeight: 800,
            lineHeight: 1,
            letterSpacing: '-0.02em',
            color: 'var(--ink)',
          }}
        >
          {percent}%
        </span>
      </div>
    </div>
  );
}

// ---- Subcomponent: StatCard -------------------------------------------------

function StatCard({
  icon,
  label,
  value,
  href,
  tone,
  subtitle,
  badgeText,
  formatNumber,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  href?: string;
  tone: 'rose' | 'leaf' | 'marigold' | 'muted';
  subtitle?: string;
  badgeText?: string;
  formatNumber: (n: number) => string;
}) {
  const bg =
    tone === 'rose'
      ? 'var(--rose-soft)'
      : tone === 'leaf'
      ? 'var(--leaf-soft)'
      : tone === 'marigold'
      ? 'var(--marigold-soft)'
      : 'var(--rule-soft)';
  const fg =
    tone === 'rose'
      ? 'var(--rose)'
      : tone === 'leaf'
      ? 'var(--leaf)'
      : tone === 'marigold'
      ? '#9a6a10'
      : 'var(--ink-soft)';

  const cardContent = (
    <div className={`dash-stat-card tone-${tone}`}>
      <div>
        <div className="row between">
          <span
            className="state-icon"
            style={{
              width: 42,
              height: 42,
              borderRadius: 12,
              background: bg,
              color: fg,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {icon}
          </span>
          {badgeText && (
            <span
              style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                padding: '3px 8px',
                borderRadius: 999,
                background: bg,
                color: fg,
              }}
            >
              {badgeText}
            </span>
          )}
        </div>
        <div
          style={{
            fontSize: '2.1rem',
            fontWeight: 800,
            marginTop: 14,
            lineHeight: 1,
            letterSpacing: '-0.02em',
            color: 'var(--ink)',
          }}
        >
          {formatNumber(value)}
        </div>
        <div className="strong" style={{ fontSize: '0.9rem', marginTop: 6, color: 'var(--ink)' }}>
          {label}
        </div>
      </div>
      {subtitle && (
        <div
          className="small muted row between mt-2"
          style={{
            paddingTop: 8,
            borderTop: '1px solid var(--rule-soft)',
            fontSize: '0.78rem',
          }}
        >
          <span>{subtitle}</span>
          <ArrowRight size={13} style={{ opacity: 0.6 }} />
        </div>
      )}
    </div>
  );

  return href ? (
    <Link href={href} style={{ textDecoration: 'none', color: 'inherit' }}>
      {cardContent}
    </Link>
  ) : (
    cardContent
  );
}

// ---- Subcomponent: Incoming Interests Feed ----------------------------------

function IncomingInterestsFeed({ count }: { count: number }) {
  const { t, locale } = useI18n();
  const query = useInterests('received');
  const respond = useRespondInterest('received');
  const { toast } = useToast();

  const items = query.data?.pages.flatMap((p) => p.data) ?? [];
  const previewItems = items.slice(0, 2);

  const handleAccept = (interestId: number, name: string) => {
    respond.mutate(
      { id: interestId, action: 'accept' },
      {
        onSuccess: () => {
          toast(
            locale === 'bn'
              ? `${name}-এর আগ্রহ গ্রহণ করা হয়েছে! বার্তা পাঠাতে পারেন।`
              : `Accepted interest from ${name}! You can now exchange messages.`,
            'success',
          );
        },
        onError: (e) => toast(errorMessage(e), 'error'),
      },
    );
  };

  return (
    <div>
      <div className="dash-section-head">
        <div className="row gap-2">
          <Heart size={18} className="txt-rose" />
          <h3 className="dash-section-title">
            {t('dash_incoming_interests', 'Received Interests')}
          </h3>
          {count > 0 && (
            <span className="dash-pulse-badge">
              <span className="dash-pulse-dot" />
              {count}
            </span>
          )}
        </div>
        <Link href="/interests?box=received" className="small link row gap-1">
          {locale === 'bn' ? 'সবগুলো দেখুন' : 'View all'}
          <ArrowRight size={14} />
        </Link>
      </div>

      {query.isLoading ? (
        <div className="stack gap-3">
          <div className="card card-pad"><Skeleton height={56} /></div>
        </div>
      ) : previewItems.length === 0 ? (
        <div className="card card-pad text-center" style={{ padding: '28px 20px' }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: '50%',
              background: 'var(--leaf-soft)',
              color: 'var(--leaf)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 10,
            }}
          >
            <Compass size={22} />
          </div>
          <div className="strong" style={{ fontSize: '0.96rem' }}>
            {locale === 'bn' ? 'নতুন কোনো আগ্রহের অনুরোধ নেই' : 'No new interest requests'}
          </div>
          <p className="small muted mt-1" style={{ maxWidth: '46ch', margin: '6px auto 14px' }}>
            {locale === 'bn'
              ? 'যোগ্য পাত্র-পাত্রী খুঁজে আপনি নিজেই আগ্রহ প্রকাশ করতে পারেন।'
              : 'Explore verified biodatas and express interest to start meaningful conversations.'}
          </p>
          <Link href="/discover" className="btn btn-primary btn-sm">
            <Search size={15} />
            {t('discover_title', 'Find Verified Matches')}
          </Link>
        </div>
      ) : (
        <div className="stack gap-3">
          {previewItems.map((interest) => {
            const cp = interest.counterpart;
            const isPending = interest.status === 'pending';
            return (
              <div key={interest.id} className="card card-pad dash-interactive-card">
                <div className="row between gap-3 wrap">
                  <div className="row gap-3 grow" style={{ minWidth: 240 }}>
                    <Avatar name={cp?.name} size={48} />
                    <div className="grow" style={{ minWidth: 0 }}>
                      <div className="row gap-2 wrap" style={{ alignItems: 'baseline' }}>
                        <span className="strong">{cp?.name ?? 'Member'}</span>
                        {cp && <span className="tiny faint">{cp.public_id}</span>}
                        {interest.created_at && (
                          <span className="tiny faint">· {relativeTime(interest.created_at)}</span>
                        )}
                      </div>
                      <div className="small muted">
                        {cp?.age ? `${cp.age} ${t('years')}` : ''}
                        {cp?.district ? ` · ${cp.district}` : ''}
                        {cp?.profession ? ` · ${cp.profession}` : ''}
                      </div>
                      {cp && (
                        <div className="mt-1">
                          <VerificationBadge level={cp.verification_level} showUnverified />
                        </div>
                      )}
                      {interest.message && (
                        <div
                          className="small mt-2"
                          style={{
                            padding: '6px 12px',
                            background: 'var(--paper)',
                            borderRadius: 'var(--radius-sm)',
                            fontStyle: 'italic',
                          }}
                        >
                          “{interest.message}”
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="row gap-2 wrap" style={{ alignItems: 'center' }}>
                    {cp && (
                      <Link href={`/profiles/${cp.public_id}`} className="btn btn-ghost btn-sm">
                        {t('view_profile', 'View biodata')}
                      </Link>
                    )}
                    {isPending && cp && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleAccept(interest.id, cp.name)}
                        loading={respond.isPending}
                      >
                        <Check size={14} />
                        {t('act_accept', 'Accept')}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ---- Subcomponent: Curated Matches Feed --------------------------------------

function CuratedMatchesFeed() {
  const { t, locale } = useI18n();
  const discoveryQuery = useDiscovery({});
  const profiles = discoveryQuery.data?.pages.flatMap((p) => p.data).slice(0, 2) ?? [];

  return (
    <div>
      <div className="dash-section-head">
        <div className="row gap-2">
          <Compass size={18} className="txt-leaf" />
          <h3 className="dash-section-title">
            {t('dash_recommended_matches', 'Curated Matches For You')}
          </h3>
        </div>
        <Link href="/discover" className="small link row gap-1">
          {t('dash_view_all_matches', 'View All Matches')}
          <ArrowRight size={14} />
        </Link>
      </div>

      {discoveryQuery.isLoading ? (
        <div className="grid-cards">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="card card-pad"><Skeleton height={80} /></div>
          ))}
        </div>
      ) : profiles.length === 0 ? (
        <div className="card card-pad text-center" style={{ padding: '24px 20px' }}>
          <p className="small muted" style={{ margin: 0 }}>
            {locale === 'bn'
              ? 'আপনার পছন্দের ফিল্টার আপডেট করে প্রস্তাবিত পাত্র-পাত্রী দেখতে পারেন।'
              : 'Adjust your partner preferences to discover customized match suggestions.'}
          </p>
          <div className="mt-3">
            <Link href="/me/preferences" className="btn btn-ghost btn-sm">
              <SlidersHorizontal size={14} />
              {t('preferences_title', 'Partner preferences')}
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid-cards">
          {profiles.map((p) => (
            <ProfileCard key={p.public_id} profile={p} />
          ))}
        </div>
      )}
    </div>
  );
}

// ---- Loading Skeleton --------------------------------------------------------

function DashboardSkeleton() {
  return (
    <div className="stack gap-6">
      <div className="card card-pad" style={{ padding: '26px' }}>
        <div className="row gap-3">
          <Skeleton width={64} height={64} radius={32} />
          <div className="grow stack gap-2">
            <Skeleton width="45%" height={24} />
            <Skeleton width="70%" height={14} />
          </div>
        </div>
      </div>

      <div className="card card-pad">
        <div className="row gap-4">
          <Skeleton width={80} height={80} radius={40} />
          <div className="grow stack gap-2">
            <Skeleton width="40%" height={20} />
            <Skeleton width="60%" height={14} />
            <Skeleton width="80%" height={12} />
          </div>
        </div>
      </div>

      <div className="dash-stat-grid">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="card card-pad" style={{ height: 130 }}>
            <Skeleton width={40} height={40} radius={12} />
            <Skeleton width="50%" height={28} className="mt-3" />
            <Skeleton width="70%" height={14} className="mt-2" />
          </div>
        ))}
      </div>

      <div className="dash-quick-grid">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="card card-pad" style={{ height: 100 }}>
            <Skeleton width={36} height={36} radius={10} />
            <Skeleton width="60%" height={16} className="mt-2" />
          </div>
        ))}
      </div>
    </div>
  );
}
