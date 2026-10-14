'use client';

import React, { useRef } from 'react';
import type { CoverTextKey, TextElementLayout } from '@/types/greetings';
import { clampElement } from '@/features/greetings/layout';

interface DraggableTextLayerProps {
  textKey: CoverTextKey;
  /** Final text to render (already resolved to placeholder in edit mode). */
  text: string;
  isPlaceholder?: boolean;
  layout: TextElementLayout;
  fontClass: string;
  /** Default text color when the element has no explicit color. */
  defaultColor: string;
  editable?: boolean;
  selected?: boolean;
  /** The canvas element, used to convert pixel drags into percentages. */
  containerRef: React.RefObject<HTMLDivElement | null>;
  onSelect?: (key: CoverTextKey) => void;
  onChange?: (key: CoverTextKey, next: TextElementLayout) => void;
}

type DragState = {
  mode: 'move' | 'resize';
  startX: number;
  startY: number;
  startLayout: TextElementLayout;
} | null;

export function DraggableTextLayer({
  textKey,
  text,
  isPlaceholder = false,
  layout,
  fontClass,
  defaultColor,
  editable = false,
  selected = false,
  containerRef,
  onSelect,
  onChange,
}: DraggableTextLayerProps) {
  const dragRef = useRef<DragState>(null);

  const rectPct = (clientX: number, clientY: number) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect || rect.width === 0 || rect.height === 0) return { dxPct: 0, dyPct: 0 };
    return {
      dxPct: ((clientX - (dragRef.current?.startX ?? clientX)) / rect.width) * 100,
      dyPct: ((clientY - (dragRef.current?.startY ?? clientY)) / rect.height) * 100,
    };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    const drag = dragRef.current;
    if (!drag || !onChange) return;
    const { dxPct, dyPct } = rectPct(e.clientX, e.clientY);

    if (drag.mode === 'move') {
      onChange(
        textKey,
        clampElement({
          ...drag.startLayout,
          xPct: drag.startLayout.xPct + dxPct,
          yPct: drag.startLayout.yPct + dyPct,
        })
      );
    } else {
      // Center-anchored: dragging the corner by dxPct widens each side, so the
      // full width grows by 2×.
      const baseWidth = drag.startLayout.widthPct ?? 80;
      onChange(
        textKey,
        clampElement({
          ...drag.startLayout,
          widthPct: baseWidth + dxPct * 2,
        })
      );
    }
  };

  const startDrag = (mode: 'move' | 'resize', e: React.PointerEvent) => {
    if (!editable) return;
    e.preventDefault();
    e.stopPropagation();
    onSelect?.(textKey);
    dragRef.current = { mode, startX: e.clientX, startY: e.clientY, startLayout: layout };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handleMoveDown = (e: React.PointerEvent) => startDrag('move', e);
  const handleResizeDown = (e: React.PointerEvent) => startDrag('resize', e);

  const endDrag = (e: React.PointerEvent) => {
    if (dragRef.current) {
      try {
        (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {
        /* capture may already be released */
      }
    }
    dragRef.current = null;
  };

  const style: React.CSSProperties = {
    left: `${layout.xPct}%`,
    top: `${layout.yPct}%`,
    width: `${layout.widthPct ?? 80}%`,
    fontSize: `${layout.fontSizeCqw ?? 4}cqw`,
    textAlign: layout.align ?? 'center',
    color: layout.color || defaultColor,
  };

  return (
    <div
      className={[
        'cover-text-layer',
        `cover-text-${textKey}`,
        fontClass,
        editable ? 'is-editable' : '',
        selected ? 'is-selected' : '',
        isPlaceholder ? 'is-placeholder' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      style={style}
      onPointerDown={handleMoveDown}
      onPointerMove={handlePointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      role={editable ? 'button' : undefined}
      tabIndex={editable ? 0 : undefined}
      aria-label={editable ? `Move ${textKey} text` : undefined}
    >
      <span className="cover-text-content">{text}</span>
      {editable && selected && (
        <span
          className="cover-resize-handle"
          onPointerDown={handleResizeDown}
          onPointerMove={handlePointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          aria-hidden="true"
        />
      )}
    </div>
  );
}
