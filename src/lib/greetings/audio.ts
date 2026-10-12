/**
 * Web Audio API synthesizer for greeting cards.
 * Zero external audio files — instant worldwide playback, zero latency, zero bandwidth.
 */

let audioCtx: AudioContext | null = null;
let isAudioMuted = true;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function isSoundMuted(): boolean {
  return isAudioMuted;
}

export function setSoundMuted(muted: boolean): void {
  isAudioMuted = muted;
}

export function toggleSound(): boolean {
  isAudioMuted = !isAudioMuted;
  if (!isAudioMuted) {
    playChime();
  }
  return isAudioMuted;
}

/**
 * Plays a bell chime sound (useful for unsealing or testing audio).
 */
export function playChime(): void {
  if (isAudioMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(587.33, now); // D5
  osc.frequency.exponentialRampToValueAtTime(880.0, now + 0.1); // A5

  gain.gain.setValueAtTime(0.3, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 1.2);
}

/**
 * Plays an envelope unsealing / paper rustle effect.
 */
export function playUnsealSound(): void {
  if (isAudioMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;

  // Paper friction / snap
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'triangle';
  osc.frequency.setValueAtTime(320, now);
  osc.frequency.exponentialRampToValueAtTime(960, now + 0.15);

  gain.gain.setValueAtTime(0.25, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.6);

  // Followed by harmonious celebration chime
  setTimeout(() => {
    playReactionSound();
  }, 180);
}

/**
 * Plays sweet reaction heart chime.
 */
export function playReactionSound(): void {
  if (isAudioMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6 arpeggio

  notes.forEach((freq, idx) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const startTime = now + idx * 0.08;

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, startTime);

    gain.gain.setValueAtTime(0.18, startTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.8);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(startTime);
    osc.stop(startTime + 0.8);
  });
}

/**
 * Plays musical theme melody.
 */
export function playGreetingTheme(theme?: string): void {
  if (isAudioMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;

  let chordNotes: number[] = [];
  switch (theme) {
    case 'romantic_harp':
      // Romantic key (F major / D minor romantic harp: F4, A4, C5, E5, F5, A5)
      chordNotes = [349.23, 440.0, 523.25, 659.25, 698.46, 880.0];
      break;
    case 'festive_bells':
      // Festive bright bells (E5, G#5, B5, E6)
      chordNotes = [659.25, 830.61, 987.77, 1318.51];
      break;
    case 'gentle_piano':
      // Warm pentatonic (G4, B4, D5, G5)
      chordNotes = [392.0, 493.88, 587.33, 783.99];
      break;
    case 'celebration':
    default:
      // Golden celebration fanfare (C5, G5, C6, E6)
      chordNotes = [523.25, 783.99, 1046.5, 1318.51];
      break;
  }

  chordNotes.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const t = now + i * 0.12;

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, t);

    gain.gain.setValueAtTime(0.15, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 1.4);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(t);
    osc.stop(t + 1.4);
  });
}
