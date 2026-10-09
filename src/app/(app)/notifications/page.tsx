'use client';

import React from 'react';
import {
  Bell,
  Heart,
  Check,
  Camera,
  ShieldCheck,
  MessageCircle,
  Bookmark,
} from 'lucide-react';
import {
  useNotifications,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
} from '@/features/notifications/hooks';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { CenterSpinner, EmptyState, ErrorState } from '@/components/ui/feedback';
import { relativeTime } from '@/lib/format';
import { useI18n } from '@/lib/i18n';
import type { AppNotification } from '@/types/models';

function iconFor(type: string) {
  if (type.includes('interest_accepted')) return <Check size={18} />;
  if (type.includes('interest')) return <Heart size={18} />;
  if (type.includes('photo')) return <Camera size={18} />;
  if (type.includes('verification')) return <ShieldCheck size={18} />;
  if (type.includes('message')) return <MessageCircle size={18} />;
  if (type.includes('shortlist')) return <Bookmark size={18} />;
  return <Bell size={18} />;
}

export default function NotificationsPage() {
  const { t } = useI18n();
  const query = useNotifications();
  const markRead = useMarkNotificationRead();
  const markAll = useMarkAllNotificationsRead();

  const items = query.data?.pages.flatMap((p) => p.data) ?? [];
  const unread = query.data?.pages[0]?.unread_count ?? 0;

  return (
    <div>
      <PageHeader
        title={t('nav_notifications')}
        actions={
          unread > 0 ? (
            <Button variant="ghost" size="sm" onClick={() => markAll.mutate()} loading={markAll.isPending}>
              Mark all read
            </Button>
          ) : undefined
        }
      />

      {query.isLoading ? (
        <CenterSpinner />
      ) : query.isError ? (
        <ErrorState error={query.error} onRetry={query.refetch} />
      ) : items.length === 0 ? (
        <EmptyState icon={<Bell size={24} />} title={t('empty_notifications', 'No notifications')} />
      ) : (
        <div className="card" style={{ overflow: 'hidden' }}>
          {items.map((n: AppNotification) => (
            <div
              key={n.id}
              className={`notif-item ${n.read ? '' : 'unread'}`}
              style={{ cursor: n.read ? 'default' : 'pointer' }}
              onClick={() => !n.read && markRead.mutate(n.id)}
            >
              <span className="state-icon" style={{ width: 36, height: 36, flexShrink: 0 }}>{iconFor(n.type)}</span>
              <div className="grow">
                <div className="row between gap-2">
                  <span className="strong small">{n.title}</span>
                  <span className="tiny faint">{relativeTime(n.created_at)}</span>
                </div>
                <p className="small muted" style={{ margin: '2px 0 0' }}>{n.message}</p>
              </div>
              {!n.read && <span className="bottom-dot" style={{ position: 'static', alignSelf: 'center' }} />}
            </div>
          ))}
          {query.hasNextPage && (
            <div className="row center" style={{ padding: 14 }}>
              <Button variant="ghost" size="sm" onClick={() => query.fetchNextPage()} loading={query.isFetchingNextPage}>
                Load more
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
