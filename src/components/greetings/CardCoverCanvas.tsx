'use client';

import React, { useRef, useState } from 'react';
import { getTemplateImageUrl } from '@/features/greetings/utils';
import { getFontClass } from './CardThemeRenderer';
import { DraggableTextLayer } from './DraggableTextLayer';
import {
  COVER_TEXT_KEYS,
  COVER_TEXT_PLACEHOLDERS,
  scrimBackground,
  withLayoutDefaults,
} from '@/features/greetings/layout';
import type {
  CardLayout,
  CoverTextKey,
  GreetingTemplate,
  TextElementLayout,
  ThemeSettings,
} from '@/types/greetings';

interface CardCoverCanvasProps {
  template: GreetingTemplate;
  recipientName: string;
  senderName?: string | null;
  title?: string | null;
  message: string;
  themeSettings?: ThemeSettings | null;
  /** Explicit layout (editor). Falls back to themeSettings.layout, then defaults. */
  layout?: CardLayout | null;
  editable?: boolean;
  selectedKey?: CoverTextKey | null;
  onSelect?: (key: CoverTextKey | null) => void;
  onLayoutChange?: (key: CoverTextKey, next: TextElementLayout) => void;
  className?: string;
}

const DEFAULT_TEXT_COLOR = '#ffffff';

export function CardCoverCanvas({
  template,
  recipientName,
  senderName,
  title,
  message,
  themeSettings,
  layout,
  editable = false,
  selectedKey = null,
  onSelect,
  onLayoutChange,
  className = '',
}: CardCoverCanvasProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [imageFailed, setImageFailed] = useState(false);

  const config = template.design_config;
  const coverUrl = getTemplateImageUrl(template);
  const hasImage = Boolean(coverUrl) && !imageFailed;

  const effectiveLayout = withLayoutDefaults(layout ?? themeSettings?.layout);
  const cardFont = themeSettings?.fontFamily || config.fontFamily || 'serif';

  // Resolve the content + visibility for each overlay element.
  const content: Record<CoverTextKey, string> = {
    recipient: recipientName,
    title: title ?? '',
    message,
    sender: senderName ?? '',
  };
  // Required fields keep a graceful fallback in read-only mode (matches the
  // legacy card renderer). Optional fields simply disappear when empty.
  const readOnlyFallback: Partial<Record<CoverTextKey, string>> = {
    recipient: 'Dear One',
    message: 'Wishing you endless joy, peace, and blessings on this momentous occasion.',
  };

  return (
    <div
      ref={containerRef}
      className={`card-cover-canvas ${className}`}
      style={
        hasImage
          ? undefined
          : { background: config.bgGradient || 'linear-gradient(135deg,#1f1b14,#16120d)' }
      }
      onPointerDown={editable ? () => onSelect?.(null) : undefined}
    >
      {hasImage && coverUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={coverUrl}
          alt={template.name}
          className="card-cover-img"
          onError={() => setImageFailed(true)}
          draggable={false}
        />
      )}

      {effectiveLayout.scrim && effectiveLayout.scrim !== 'none' && (
        <div
          className="card-cover-scrim"
          style={{ background: scrimBackground(effectiveLayout.scrim) }}
        />
      )}

      {COVER_TEXT_KEYS.map((key) => {
        const el = effectiveLayout[key] as TextElementLayout;
        if (el.hidden) return null;

        const raw = content[key]?.trim() ?? '';
        let display = raw;
        let isPlaceholder = false;

        if (!raw) {
          if (editable) {
            display = COVER_TEXT_PLACEHOLDERS[key];
            isPlaceholder = true;
          } else if (readOnlyFallback[key]) {
            display = readOnlyFallback[key]!;
          } else {
            return null; // optional + empty + read-only → omit
          }
        }

        const fontClass = getFontClass(el.fontFamily || cardFont);

        return (
          <DraggableTextLayer
            key={key}
            textKey={key}
            text={display}
            isPlaceholder={isPlaceholder}
            layout={el}
            fontClass={fontClass}
            defaultColor={DEFAULT_TEXT_COLOR}
            editable={editable}
            selected={selectedKey === key}
            containerRef={containerRef}
            onSelect={onSelect}
            onChange={onLayoutChange}
          />
        );
      })}

      {editable && (
        <div className="cover-canvas-hint" aria-hidden="true">
          Tap a text block, then drag to place it
        </div>
      )}
    </div>
  );
}
