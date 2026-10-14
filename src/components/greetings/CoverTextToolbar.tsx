'use client';

import React from 'react';
import { AlignLeft, AlignCenter, AlignRight, Eye, EyeOff, RotateCcw } from 'lucide-react';
import { MuiSelect, MenuItem } from '@/components/ui/MuiSelect';
import {
  COVER_TEXT_KEYS,
  COVER_TEXT_LABELS,
  FONT_SIZE_CQW_MAX,
  FONT_SIZE_CQW_MIN,
} from '@/features/greetings/layout';
import type { CardLayout, CoverTextKey, TextElementLayout } from '@/types/greetings';

interface FontOption {
  id: string;
  name: string;
}

interface CoverTextToolbarProps {
  layout: CardLayout;
  selectedKey: CoverTextKey | null;
  fontOptions: FontOption[];
  onSelectKey: (key: CoverTextKey) => void;
  onChange: (key: CoverTextKey, next: TextElementLayout) => void;
  onResetElement: (key: CoverTextKey) => void;
  onScrimChange: (scrim: NonNullable<CardLayout['scrim']>) => void;
}

const DEFAULT_FONT_VALUE = '__default__';

export function CoverTextToolbar({
  layout,
  selectedKey,
  fontOptions,
  onSelectKey,
  onChange,
  onResetElement,
  onScrimChange,
}: CoverTextToolbarProps) {
  const selected = selectedKey ? (layout[selectedKey] as TextElementLayout | undefined) : undefined;

  const update = (partial: Partial<TextElementLayout>) => {
    if (!selectedKey || !selected) return;
    onChange(selectedKey, { ...selected, ...partial });
  };

  return (
    <div className="cover-toolbar">
      {/* Element chips */}
      <div className="cover-toolbar-chips">
        {COVER_TEXT_KEYS.map((key) => {
          const el = layout[key] as TextElementLayout | undefined;
          const isActive = selectedKey === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => onSelectKey(key)}
              className={`cover-chip ${isActive ? 'active' : ''} ${el?.hidden ? 'hidden-elem' : ''}`}
            >
              {COVER_TEXT_LABELS[key]}
              {el?.hidden ? ' (hidden)' : ''}
            </button>
          );
        })}
      </div>

      {selected && selectedKey ? (
        <>
          <div className="cover-toolbar-row">
            <label className="cover-toolbar-label">Size</label>
            <input
              type="range"
              min={FONT_SIZE_CQW_MIN}
              max={FONT_SIZE_CQW_MAX}
              step={0.2}
              value={selected.fontSizeCqw ?? 4}
              onChange={(e) => update({ fontSizeCqw: Number(e.target.value) })}
              className="cover-range"
              aria-label="Text size"
            />

            <div className="cover-align-group" role="group" aria-label="Text alignment">
              {([
                ['left', AlignLeft],
                ['center', AlignCenter],
                ['right', AlignRight],
              ] as const).map(([align, Icon]) => (
                <button
                  key={align}
                  type="button"
                  className={`cover-align-btn ${(selected.align ?? 'center') === align ? 'active' : ''}`}
                  onClick={() => update({ align })}
                  aria-label={`Align ${align}`}
                  aria-pressed={(selected.align ?? 'center') === align}
                >
                  <Icon size={15} />
                </button>
              ))}
            </div>

            <label className="cover-color-swatch" title="Text color">
              <input
                type="color"
                value={selected.color || '#ffffff'}
                onChange={(e) => update({ color: e.target.value })}
                aria-label="Text color"
              />
            </label>
          </div>

          <div className="cover-toolbar-row">
            <div className="cover-font-select">
              <MuiSelect
                value={selected.fontFamily || DEFAULT_FONT_VALUE}
                onChange={(e) => {
                  const val = String(e.target.value);
                  update({ fontFamily: val === DEFAULT_FONT_VALUE ? undefined : val });
                }}
                size="small"
                aria-label="Font for this text"
              >
                <MenuItem value={DEFAULT_FONT_VALUE}>Card default font</MenuItem>
                {fontOptions.map((f) => (
                  <MenuItem key={f.id} value={f.id}>
                    {f.name}
                  </MenuItem>
                ))}
              </MuiSelect>
            </div>

            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => update({ hidden: !selected.hidden })}
            >
              {selected.hidden ? <Eye size={14} /> : <EyeOff size={14} />}
              {selected.hidden ? 'Show' : 'Hide'}
            </button>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => onResetElement(selectedKey)}
              title="Reset this text to its default position"
            >
              <RotateCcw size={14} /> Reset
            </button>
          </div>
        </>
      ) : (
        <p className="cover-toolbar-empty">
          Tap a text block in the preview (or a chip above) to move and style it.
        </p>
      )}

      {/* Canvas-level backdrop control */}
      <div className="cover-toolbar-row cover-toolbar-scrim">
        <label className="cover-toolbar-label">Backdrop shade</label>
        <div className="cover-scrim-select">
          <MuiSelect
            value={layout.scrim ?? 'bottom'}
            onChange={(e) => onScrimChange(e.target.value as NonNullable<CardLayout['scrim']>)}
            size="small"
            aria-label="Backdrop shade for legibility"
          >
            <MenuItem value="none">None</MenuItem>
            <MenuItem value="bottom">Bottom fade</MenuItem>
            <MenuItem value="top">Top fade</MenuItem>
            <MenuItem value="full">Full vignette</MenuItem>
          </MuiSelect>
        </div>
      </div>
    </div>
  );
}
