'use client';

import React from 'react';

export function Avatar({
  name,
  size = 44,
  src,
}: {
  name?: string | null;
  size?: number;
  src?: string | null;
}) {
  const initials = (name ?? '')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('');

  return (
    <span className="avatar" style={{ width: size, height: size, fontSize: size * 0.4 }}>
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={name ?? ''} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      ) : (
        initials || '•'
      )}
    </span>
  );
}
