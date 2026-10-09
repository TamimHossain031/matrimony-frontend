'use client';

import React, { ReactNode } from 'react';

export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="row between gap-3 wrap mb-4">
      <div>
        <h1 style={{ marginBottom: subtitle ? 2 : 0 }}>{title}</h1>
        {subtitle && <p className="muted" style={{ margin: 0 }}>{subtitle}</p>}
      </div>
      {actions && <div className="row gap-2 wrap">{actions}</div>}
    </div>
  );
}
