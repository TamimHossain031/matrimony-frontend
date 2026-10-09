'use client';

import React from 'react';
import Link from 'next/link';
import { Bookmark, X } from 'lucide-react';
import { useShortlists, useRemoveShortlist } from '@/features/shortlist/hooks';
import { ProfileCard } from '@/components/profile/ProfileCard';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { QueryBoundary, EmptyState } from '@/components/ui/feedback';
import { useToast } from '@/components/providers/ToastProvider';
import { errorMessage } from '@/lib/errors';
import { useI18n } from '@/lib/i18n';

export default function ShortlistPage() {
  const { t } = useI18n();
  const query = useShortlists();
  const remove = useRemoveShortlist();
  const { toast } = useToast();

  return (
    <div>
      <PageHeader title={t('nav_shortlist')} subtitle="Profiles you've saved to revisit." />
      <QueryBoundary
        query={query}
        isEmpty={(d) => d.length === 0}
        empty={
          <EmptyState
            icon={<Bookmark size={24} />}
            title={t('empty_shortlist', 'Your shortlist is empty')}
            message="Save profiles you want to come back to."
            action={<Link href="/discover" className="btn btn-primary btn-sm">{t('discover_title')}</Link>}
          />
        }
      >
        {(items) => (
          <div className="grid-cards">
            {items.map((s) => (
              <div key={s.profile.public_id} className="stack gap-2">
                <ProfileCard profile={s.profile} />
                <div className="row between gap-2">
                  {s.note ? <span className="tiny muted grow">Note: {s.note}</span> : <span className="grow" />}
                  <Button
                    size="sm"
                    variant="subtle"
                    onClick={() =>
                      remove.mutate(s.profile.public_id, { onError: (e) => toast(errorMessage(e), 'error') })
                    }
                  >
                    <X size={14} /> {t('remove')}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </QueryBoundary>
    </div>
  );
}
