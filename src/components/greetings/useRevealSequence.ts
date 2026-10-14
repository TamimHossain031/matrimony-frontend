'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Stages of the envelope → card reveal, in order.
 *
 *  sealed  → envelope closed, card tucked inside (idle)
 *  flap    → wax seal lifts, flap unfolds in 3D
 *  rise    → card slides up out of the envelope and comes to the front
 *  settle  → card scales/rotates to rest at centre while the envelope drops away
 *  done    → card at rest, replay available
 */
export type RevealStage = 'sealed' | 'flap' | 'rise' | 'settle' | 'done';

/** Per-step durations (ms). Kept in sync with the CSS transition timings. */
const STEP_MS = {
  flap: 480,
  rise: 520,
  settle: 500,
} as const;

/** Total choreography ≈ 1.5s, matching the ~2s "premium reveal" target. */
export const REVEAL_TOTAL_MS = STEP_MS.flap + STEP_MS.rise + STEP_MS.settle;

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export interface UseRevealSequenceOptions {
  /** Start already revealed (e.g. the published-card confirmation screen). */
  initialOpen?: boolean;
  /** Fired once the card has fully arrived (end of `settle`). */
  onReveal?: () => void;
}

export interface RevealController {
  stage: RevealStage;
  /** True from the moment the reveal starts until it is folded back. */
  isOpen: boolean;
  /** True only while the choreography is mid-flight. */
  isRevealing: boolean;
  /** Begin the reveal from `sealed`. No-op if already open/animating. */
  play: () => void;
  /** Fold straight back to the sealed envelope. */
  reset: () => void;
  /** Fold back, then re-run the full reveal (for the replay control). */
  replay: () => void;
}

/**
 * Drives the envelope reveal as an explicit, timer-chained state machine so the
 * component stays declarative and every step maps cleanly onto a CSS stage.
 * Honours `prefers-reduced-motion` by jumping straight to `done`.
 */
export function useRevealSequence({
  initialOpen = false,
  onReveal,
}: UseRevealSequenceOptions = {}): RevealController {
  const [stage, setStage] = useState<RevealStage>(initialOpen ? 'done' : 'sealed');
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  // Keep the latest callback without restarting the sequence when it changes.
  const onRevealRef = useRef(onReveal);
  onRevealRef.current = onReveal;

  const clearTimers = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  }, []);

  const runSequence = useCallback(() => {
    if (prefersReducedMotion()) {
      setStage('done');
      onRevealRef.current?.();
      return;
    }
    setStage('flap');
    timers.current.push(
      setTimeout(() => setStage('rise'), STEP_MS.flap),
      setTimeout(() => setStage('settle'), STEP_MS.flap + STEP_MS.rise),
      setTimeout(() => {
        setStage('done');
        onRevealRef.current?.();
      }, REVEAL_TOTAL_MS),
    );
  }, []);

  const play = useCallback(() => {
    // Only playable from a sealed, idle envelope.
    setStage((current) => {
      if (current !== 'sealed') return current;
      clearTimers();
      // Defer the chain so React commits the `flap` stage first.
      timers.current.push(setTimeout(runSequence, 0));
      return 'sealed';
    });
  }, [clearTimers, runSequence]);

  const reset = useCallback(() => {
    clearTimers();
    setStage('sealed');
  }, [clearTimers]);

  const replay = useCallback(() => {
    clearTimers();
    setStage('sealed');
    if (prefersReducedMotion()) {
      runSequence();
      return;
    }
    // Let the envelope visibly fold shut before re-opening.
    timers.current.push(setTimeout(runSequence, 640));
  }, [clearTimers, runSequence]);

  useEffect(() => clearTimers, [clearTimers]);

  return {
    stage,
    isOpen: stage !== 'sealed',
    isRevealing: stage !== 'sealed' && stage !== 'done',
    play,
    reset,
    replay,
  };
}
