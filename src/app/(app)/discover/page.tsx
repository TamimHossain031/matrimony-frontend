'use client';

import React, { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { SlidersHorizontal, SearchX } from 'lucide-react';
import { useDiscovery } from '@/features/discovery/hooks';
import { filtersFromSearchParams, filtersToSearchParams } from '@/features/discovery/schemas';
import { FilterPanel } from '@/components/discover/FilterPanel';
import { ProfileCard } from '@/components/profile/ProfileCard';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { CenterSpinner, EmptyState, ErrorState, Skeleton } from '@/components/ui/feedback';
import type { DiscoveryFilters } from '@/types/models';
import { useI18n } from '@/lib/i18n';

function DiscoverInner() {
  const { t } = useI18n();
  const router = useRouter();
  const params = useSearchParams();
  const filters = filtersFromSearchParams(params);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const query = useDiscovery(filters);

  const applyFilters = (next: DiscoveryFilters) => {
    const qs = filtersToSearchParams(next).toString();
    router.push(qs ? `/discover?${qs}` : '/discover');
    setFiltersOpen(false);
  };

  const profiles = query.data?.pages.flatMap((p) => p.data) ?? [];
  const activeFilterCount = Object.keys(filters).length;

  return (
    <div>
      <PageHeader
        title={t('discover_title')}
        actions={
          <Button variant="ghost" onClick={() => setFiltersOpen(true)} className="discover-filter-btn">
            <SlidersHorizontal size={16} /> {t('btn_apply_filters', 'Filters')}
            {activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}
          </Button>
        }
      />

      <div className="discover-layout">
        <aside className="discover-aside">
          <FilterPanel value={filters} onApply={applyFilters} />
        </aside>

        <div className="grow" style={{ minWidth: 0 }}>
          {query.isLoading ? (
            <div className="grid-cards">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="card card-pad"><Skeleton height={76} /></div>
              ))}
            </div>
          ) : query.isError ? (
            <ErrorState error={query.error} onRetry={query.refetch} />
          ) : profiles.length === 0 ? (
            <EmptyState
              icon={<SearchX size={24} />}
              title={t('empty_discover', 'No profiles match these filters')}
              message="Try widening the age range or clearing a filter."
            />
          ) : (
            <>
              <div className="grid-cards">
                {profiles.map((p) => (
                  <ProfileCard key={p.public_id} profile={p} />
                ))}
              </div>
              <div className="row center mt-6">
                {query.hasNextPage ? (
                  <Button variant="ghost" onClick={() => query.fetchNextPage()} loading={query.isFetchingNextPage}>
                    Load more
                  </Button>
                ) : (
                  <span className="small faint">{"You've reached the end."}</span>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Mobile filter drawer */}
      <Modal open={filtersOpen} onClose={() => setFiltersOpen(false)} title={t('btn_apply_filters', 'Filters')}>
        <FilterPanel value={filters} onApply={applyFilters} />
      </Modal>
    </div>
  );
}

export default function DiscoverPage() {
  return (
    <Suspense fallback={<CenterSpinner />}>
      <DiscoverInner />
    </Suspense>
  );
}
