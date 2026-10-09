'use client';

import React from 'react';
import Link from 'next/link';
import { MessageCircle, ChevronRight, Lock } from 'lucide-react';
import { useConversations } from '@/features/messages/hooks';
import { PageHeader } from '@/components/layout/PageHeader';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { QueryBoundary, EmptyState } from '@/components/ui/feedback';
import { relativeTime } from '@/lib/format';
import { useI18n } from '@/lib/i18n';

export default function MessagesPage() {
  const { t } = useI18n();
  const query = useConversations();

  return (
    <div>
      <PageHeader title={t('nav_messages')} subtitle="Available after an interest is accepted." />
      <QueryBoundary
        query={query}
        isEmpty={(d) => d.length === 0}
        empty={
          <EmptyState
            icon={<MessageCircle size={24} />}
            title={t('empty_messages', 'No conversations yet')}
            message="When an interest is accepted, a private conversation opens here."
            action={<Link href="/interests" className="btn btn-primary btn-sm">{t('nav_interests')}</Link>}
          />
        }
      >
        {(conversations) => (
          <div className="card" style={{ overflow: 'hidden' }}>
            {conversations.map((c) => (
              <Link
                key={c.id}
                href={`/messages/${c.id}`}
                className="notif-item"
                style={{ color: 'inherit', textDecoration: 'none' }}
              >
                <Avatar name={`#${c.id}`} size={44} />
                <div className="grow">
                  <div className="row between gap-2">
                    <span className="strong small">Private conversation</span>
                    <span className="tiny faint">{relativeTime(c.last_message_at)}</span>
                  </div>
                  <div className="row gap-2 mt-1">
                    {c.is_closed && <Badge tone="muted" icon={<Lock size={11} />}>Closed</Badge>}
                    <span className="tiny faint">Tap to open</span>
                  </div>
                </div>
                <ChevronRight size={18} className="faint" />
              </Link>
            ))}
          </div>
        )}
      </QueryBoundary>
    </div>
  );
}
