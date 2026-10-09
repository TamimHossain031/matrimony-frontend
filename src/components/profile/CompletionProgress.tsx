'use client';

import React from 'react';

export function CompletionProgress({
  percent,
  label,
}: {
  percent: number;
  label?: string;
}) {
  return (
    <div className="stack gap-2">
      <div className="row between small">
        <span className="muted">{label ?? 'Profile completion'}</span>
        <span className="strong">{percent}%</span>
      </div>
      <div className="progress">
        <span style={{ width: `${Math.min(100, Math.max(0, percent))}%` }} />
      </div>
    </div>
  );
}
