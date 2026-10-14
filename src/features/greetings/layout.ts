import type { CardLayout, CoverTextKey, TextElementLayout } from '@/types/greetings';

/** Ordered list of overlay text elements. */
export const COVER_TEXT_KEYS: CoverTextKey[] = ['recipient', 'title', 'message', 'sender'];

/** Human labels for the toolbar / element chips. */
export const COVER_TEXT_LABELS: Record<CoverTextKey, string> = {
  recipient: 'Recipient',
  title: 'Headline',
  message: 'Message',
  sender: 'Sender',
};

/** Placeholder text shown in the editor when a field is empty (so it stays draggable). */
export const COVER_TEXT_PLACEHOLDERS: Record<CoverTextKey, string> = {
  recipient: 'Recipient name',
  title: 'Your headline',
  message: 'Your personal message…',
  sender: 'From you',
};

/**
 * Sensible starting layout: recipient high, headline below it, message in the
 * middle band, sender toward the lower area. Positions are percentages so the
 * same layout scales across preview, published, and public renders.
 */
export const DEFAULT_CARD_LAYOUT: Required<Pick<CardLayout, CoverTextKey>> & { scrim: NonNullable<CardLayout['scrim']> } = {
  recipient: { xPct: 50, yPct: 24, widthPct: 84, fontSizeCqw: 8.5, align: 'center' },
  title: { xPct: 50, yPct: 40, widthPct: 80, fontSizeCqw: 5, align: 'center' },
  message: { xPct: 50, yPct: 62, widthPct: 82, fontSizeCqw: 3.6, align: 'center' },
  sender: { xPct: 50, yPct: 86, widthPct: 70, fontSizeCqw: 4, align: 'center' },
  scrim: 'bottom',
};

/** Per-element font-size bounds for the slider (in cqw). */
export const FONT_SIZE_CQW_MIN = 2;
export const FONT_SIZE_CQW_MAX = 16;

function clampNumber(value: number, min: number, max: number): number {
  if (Number.isNaN(value)) return min;
  return Math.min(max, Math.max(min, value));
}

/** Keep an element's center within the canvas bounds. */
export function clampElement(el: TextElementLayout): TextElementLayout {
  return {
    ...el,
    xPct: clampNumber(el.xPct, 0, 100),
    yPct: clampNumber(el.yPct, 0, 100),
    widthPct: el.widthPct != null ? clampNumber(el.widthPct, 20, 100) : el.widthPct,
    fontSizeCqw:
      el.fontSizeCqw != null
        ? clampNumber(el.fontSizeCqw, FONT_SIZE_CQW_MIN, FONT_SIZE_CQW_MAX)
        : el.fontSizeCqw,
  };
}

/** Merge a (possibly partial) saved layout over the defaults. */
export function withLayoutDefaults(layout?: CardLayout | null): CardLayout {
  return {
    recipient: { ...DEFAULT_CARD_LAYOUT.recipient, ...layout?.recipient },
    title: { ...DEFAULT_CARD_LAYOUT.title, ...layout?.title },
    message: { ...DEFAULT_CARD_LAYOUT.message, ...layout?.message },
    sender: { ...DEFAULT_CARD_LAYOUT.sender, ...layout?.sender },
    scrim: layout?.scrim ?? DEFAULT_CARD_LAYOUT.scrim,
  };
}

/** CSS gradient for each scrim mode, drawn over the image behind the text. */
export function scrimBackground(scrim: CardLayout['scrim']): string | undefined {
  switch (scrim) {
    case 'bottom':
      return 'linear-gradient(to top, rgba(0,0,0,0.62) 0%, rgba(0,0,0,0.28) 38%, rgba(0,0,0,0) 72%)';
    case 'top':
      return 'linear-gradient(to bottom, rgba(0,0,0,0.62) 0%, rgba(0,0,0,0.28) 38%, rgba(0,0,0,0) 72%)';
    case 'full':
      return 'radial-gradient(130% 110% at 50% 50%, rgba(0,0,0,0) 30%, rgba(0,0,0,0.5) 100%), linear-gradient(to top, rgba(0,0,0,0.45), rgba(0,0,0,0.1))';
    case 'none':
    default:
      return undefined;
  }
}
