'use client';

import React from 'react';

// Compact circular match score. Marigold is the only bright colour (§9).
export function MatchRing({ score, size = 46 }: { score: number; size?: number }) {
  return (
    <div
      className="match-ring"
      style={{ ['--p' as string]: String(score), width: size, height: size }}
      title={`Match ${score}%`}
      aria-label={`Match ${score} percent`}
    >
      <span>{score}%</span>
    </div>
  );
}
