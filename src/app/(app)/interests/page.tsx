'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Heart, MessageCircle } from 'lucide-react';
import { useInterests, useRespondInterest } from '@/features/interests/hooks';
import { PageHeader } from '@/components/layout/PageHeader';
import { Tabs } from '@/components/ui/Tabs';
import { Button } from '@/components/ui/Button';
import { Badge, VerificationBadge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { CenterSpinner, EmptyState, ErrorState } from '@/components/ui/feedback';
import { useToast } from '@/components/providers/ToastProvider';
import { INTEREST_STATUS_LABELS, relativeTime } from '@/lib/format';
import { errorMessage } from '@/lib/errors';
import { useI18n } from '@/lib/i18n';
import type { Interest } from '@/types/models';
import type { InterestAction } from '@/types/enums';

type Box = 'received' | 'sent';

function InterestsInner() {
  const { t } = useI18n();
  const router = useRouter();
  const params = useSearchParams();
  const box: Box = params.get('box') === 'sent' ? 'sent' : 'received';

  const query = useInterests(box);
  const items = query.data?.pages.flatMap((p) => p.data) ?? [];

  return (
    <div>
      <PageHeader title={t('nav_interests')} />
      <Tabs<Box>
        tabs={[
          { key: 'received', label: t('tab_received') },
          { key: 'sent', label: t('tab_sent') },
        ]}
        active={box}
        onChange={(b) => router.push(`/interests?box=${b}`)}
      />

      <div className="mt-4">
        {query.isLoading ? (
          <CenterSpinner />
        ) : query.isError ? (
          <ErrorState error={query.error} onRetry={query.refetch} />
        ) : items.length === 0 ? (
          <EmptyState
            icon={<Heart size={24} />}
            title={t('empty_interests', 'No interests yet')}
            message={box === 'received' ? 'When someone sends you an interest, it appears here.' : 'Interests you send will appear here.'}
            action={<Link href="/discover" className="btn btn-primary btn-sm">{t('discover_title')}</Link>}
          />
        ) : (
          <div className="stack gap-3">
            {items.map((i) => (
              <InterestRow key={i.id} interest={i} box={box} />
            ))}
            {query.hasNextPage && (
              <div className="row center mt-2">
                <Button variant="ghost" onClick={() => query.fetchNextPage()} loading={query.isFetchingNextPage}>
                  Load more
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function InterestRow({ interest, box }: { interest: Interest; box: Box }) {
  const { t } = useI18n();
  const respond = useRespondInterest(box);
  const { toast } = useToast();
  const cp = interest.counterpart;

  const act = (action: InterestAction) => {
    respond.mutate(
      { id: interest.id, action },
      { onError: (e) => toast(errorMessage(e), 'error') },
    );
  };

  const statusTone =
    interest.status === 'accepted' ? 'leaf' : interest.status === 'pending' ? 'rose' : 'muted';

  return (
    <div className="card card-pad">
      <div className="row between gap-3 wrap">
        <div className="row gap-3 grow" style={{ minWidth: 0 }}>
          <Avatar name={cp?.name} size={44} />
          <div className="grow" style={{ minWidth: 0 }}>
            <div className="row gap-2 wrap" style={{ alignItems: 'baseline' }}>
              <span className="strong">{cp?.name ?? 'Member'}</span>
              {cp && <span className="faint tiny">{cp.public_id}</span>}
            </div>
            <div className="small muted">
              {cp?.age ? `${cp.age} ${t('years')}` : ''} {cp?.district ? `· ${cp.district}` : ''}
            </div>
            {cp && <div className="mt-1"><VerificationBadge level={cp.verification_level} /></div>}
            {interest.message && <p className="small mt-2" style={{ margin: '6px 0 0' }}>“{interest.message}”</p>}
          </div>
        </div>

        <div className="stack gap-2" style={{ alignItems: 'flex-end' }}>
          <Badge tone={statusTone as 'leaf' | 'rose' | 'muted'}>{INTEREST_STATUS_LABELS[interest.status]}</Badge>
          <span className="tiny faint">{relativeTime(interest.created_at)}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="row gap-2 wrap mt-3">
        {cp && (
          <Link href={`/profiles/${cp.public_id}`} className="btn btn-subtle btn-sm">{t('view_profile')}</Link>
        )}
        {box === 'received' && interest.status === 'pending' && (
          <>
            <Button size="sm" variant="rose" onClick={() => act('accept')} loading={respond.isPending}>{t('act_accept')}</Button>
            <Button size="sm" variant="ghost" onClick={() => act('reject')} loading={respond.isPending}>{t('act_decline')}</Button>
          </>
        )}
        {box === 'sent' && interest.status === 'pending' && (
          <Button size="sm" variant="ghost" onClick={() => act('withdraw')} loading={respond.isPending}>{t('act_withdraw')}</Button>
        )}
        {interest.status === 'accepted' && (
          <>
            <Link href="/messages" className="btn btn-primary btn-sm"><MessageCircle size={15} /> {t('btn_chat', 'Message')}</Link>
            <Button size="sm" variant="subtle" onClick={() => act('disconnect')} loading={respond.isPending}>{t('act_disconnect')}</Button>
          </>
        )}
      </div>
    </div>
  );
}

export default function InterestsPage() {
  return (
    <Suspense fallback={<CenterSpinner />}>
      <InterestsInner />
    </Suspense>
  );
}
