'use client';

import React, { ReactNode } from 'react';
import { Inbox, AlertTriangle, SearchX, Lock, ShieldOff } from 'lucide-react';
import { ApiError } from '@/lib/api-client';
import { Button } from './Button';

export function Spinner({ size = 22 }: { size?: number }) {
  return <span className="spinner" style={{ width: size, height: size }} aria-label="Loading" />;
}

export function CenterSpinner({ label }: { label?: string }) {
  return (
    <div className="state">
      <Spinner size={28} />
      {label && <p className="muted">{label}</p>}
    </div>
  );
}

export function Skeleton({ width, height = 14, radius = 6, className = '' }: {
  width?: number | string;
  height?: number | string;
  radius?: number;
  className?: string;
}) {
  return (
    <span
      className={`skeleton ${className}`}
      style={{ display: 'block', width: width ?? '100%', height, borderRadius: radius }}
    />
  );
}

export function EmptyState({
  title,
  message,
  icon,
  action,
}: {
  title: string;
  message?: string;
  icon?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="state">
      <span className="state-icon">{icon ?? <Inbox size={24} />}</span>
      <h3>{title}</h3>
      {message && <p>{message}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

export function ErrorState({
  error,
  onRetry,
}: {
  error: unknown;
  onRetry?: () => void;
}) {
  const status = error instanceof ApiError ? error.status : undefined;

  if (status === 404) {
    return (
      <EmptyState
        icon={<SearchX size={24} />}
        title="Not found"
        message="We couldn’t find what you were looking for. It may have been removed or hidden."
      />
    );
  }
  if (status === 403) {
    return (
      <EmptyState
        icon={<ShieldOff size={24} />}
        title="Not allowed"
        message="You don’t have access to this. If you think this is a mistake, contact support."
      />
    );
  }
  if (status === 401) {
    return (
      <EmptyState
        icon={<Lock size={24} />}
        title="Please sign in"
        message="Your session has ended. Sign in again to continue."
      />
    );
  }

  const message =
    error instanceof Error ? error.message : 'Something went wrong. Please try again.';
  return (
    <div className="state">
      <span className="state-icon" style={{ background: 'var(--danger-soft)', color: 'var(--danger)' }}>
        <AlertTriangle size={24} />
      </span>
      <h3>Something went wrong</h3>
      <p>{message}</p>
      {onRetry && (
        <Button variant="ghost" onClick={onRetry} className="mt-2">
          Try again
        </Button>
      )}
    </div>
  );
}

/**
 * Renders the correct one of the seven required states (blueprint §7) for a
 * TanStack Query result: Loading · Success · Empty · Error · Unauthorized ·
 * Forbidden · Not found.
 */
export function QueryBoundary<T>({
  query,
  loading,
  isEmpty,
  empty,
  children,
}: {
  query: {
    isLoading: boolean;
    isError: boolean;
    error: unknown;
    data: T | undefined;
    refetch: () => void;
  };
  loading?: ReactNode;
  isEmpty?: (data: T) => boolean;
  empty?: ReactNode;
  children: (data: T) => ReactNode;
}) {
  if (query.isLoading) return <>{loading ?? <CenterSpinner />}</>;
  if (query.isError) return <ErrorState error={query.error} onRetry={query.refetch} />;
  if (query.data === undefined) return <ErrorState error={new Error('No data')} onRetry={query.refetch} />;
  if (isEmpty && isEmpty(query.data)) {
    return <>{empty ?? <EmptyState title="Nothing here yet" />}</>;
  }
  return <>{children(query.data)}</>;
}
