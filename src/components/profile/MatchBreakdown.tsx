'use client';

import React from 'react';
import { Check, X, AlertCircle } from 'lucide-react';
import type { MatchBreakdown as MatchBreakdownModel, MatchCriterion } from '@/types/models';
import { PREFERENCE_KEY_LABELS } from '@/lib/format';
import { MatchRing } from './MatchRing';
import { useI18n } from '@/lib/i18n';

// The differentiator (D3, blueprint §6): a transparent breakdown, never a
// mystery percentage.
export function MatchBreakdown({ match }: { match: MatchBreakdownModel }) {
  const { t } = useI18n();
  const rows = [...match.met, ...match.missed];

  return (
    <div className="card card-pad">
      <div className="row gap-4 between">
        <div>
          <div className="section-title" style={{ marginBottom: 2 }}>
            {t('match_breakdown_title', 'Why you might match')}
          </div>
          <div className="small muted">
            {t('match_compatibility', 'Compatibility')} ·{' '}
            {match.must_haves_met} / {match.must_haves_total} {t('match_criteria_met', 'must-haves met')}
          </div>
        </div>
        <MatchRing score={match.score} size={60} />
      </div>

      <hr className="hairline" />

      <ul className="list-reset stack gap-2">
        {rows.map((c, i) => (
          <CriterionRow key={`${c.key}-${i}`} c={c} met={match.met.includes(c)} />
        ))}
        {rows.length === 0 && (
          <li className="small muted">Set your partner preferences to see a match breakdown.</li>
        )}
      </ul>
    </div>
  );
}

function CriterionRow({ c, met }: { c: MatchCriterion; met: boolean }) {
  const isDealbreaker = c.importance === 'deal_breaker';
  return (
    <li className="row gap-3" style={{ alignItems: 'flex-start' }}>
      <span
        style={{
          flexShrink: 0,
          width: 22,
          height: 22,
          borderRadius: '50%',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: met ? 'var(--leaf-soft)' : isDealbreaker ? 'var(--rose-soft)' : 'var(--rule-soft)',
          color: met ? 'var(--leaf)' : isDealbreaker ? 'var(--rose)' : 'var(--ink-soft)',
        }}
      >
        {met ? <Check size={14} /> : isDealbreaker ? <AlertCircle size={14} /> : <X size={14} />}
      </span>
      <div className="grow">
        <div className="row between gap-2 wrap">
          <span className="strong small">{PREFERENCE_KEY_LABELS[c.key] ?? c.label}</span>
          {isDealbreaker && (
            <span className="tiny" style={{ color: met ? 'var(--leaf)' : 'var(--rose)', fontWeight: 700 }}>
              must-have
            </span>
          )}
        </div>
        {(c.preferred || c.candidate_value) && (
          <div className="tiny faint">
            {c.candidate_value ?? '—'}
            {c.preferred ? ` · you wanted ${c.preferred}` : ''}
          </div>
        )}
      </div>
    </li>
  );
}
