'use client';

import React, { useEffect, useRef, useState } from 'react';
import { X, Smartphone, Monitor, Wand2, Heart } from 'lucide-react';
import { EnvelopeExperience } from './EnvelopeExperience';
import type { GreetingTemplate, ThemeSettings } from '@/types/greetings';

type DeviceMode = 'desktop' | 'mobile';

interface LivePreviewModalProps {
  open: boolean;
  onClose: () => void;
  template: GreetingTemplate;
  recipientName: string;
  senderName?: string | null;
  title?: string | null;
  message: string;
  themeSettings?: ThemeSettings | null;
  /** Fired by the footer CTA — returns the user to the editor controls. */
  onCustomize?: () => void;
}

/** Muted placeholder shown when a field is still empty. */
function Field({ value, placeholder, className }: { value?: string | null; placeholder: string; className?: string }) {
  const text = value?.trim();
  return (
    <span className={`${className ?? ''} ${text ? '' : 'lp-placeholder'}`.trim()}>
      {text || placeholder}
    </span>
  );
}

/**
 * Full-screen "live preview" of a greeting card, modelled on a premium card
 * preview: dimmed overlay, an envelope → card reveal stage, a scrollable
 * details page reflecting the current customisation, a mobile/desktop device
 * toggle, and a sticky footer. Everything reads straight from the editor's
 * live state, so typing updates the preview within a frame.
 */
export function LivePreviewModal({
  open,
  onClose,
  template,
  recipientName,
  senderName,
  title,
  message,
  themeSettings,
  onCustomize,
}: LivePreviewModalProps) {
  const [device, setDevice] = useState<DeviceMode>('desktop');
  const panelRef = useRef<HTMLDivElement | null>(null);
  const closeRef = useRef<HTMLButtonElement | null>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);

  // Esc to close, body-scroll lock, focus handling.
  useEffect(() => {
    if (!open) return;
    restoreFocusRef.current = (document.activeElement as HTMLElement) ?? null;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'Tab') trapFocus(e);
    };
    const trapFocus = (e: KeyboardEvent) => {
      const panel = panelRef.current;
      if (!panel) return;
      const focusables = panel.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      if (!focusables.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    window.addEventListener('keydown', onKey);
    // Focus the close button after the open transition settles.
    const focusTimer = window.setTimeout(() => closeRef.current?.focus(), 60);

    return () => {
      window.removeEventListener('keydown', onKey);
      window.clearTimeout(focusTimer);
      document.body.style.overflow = prevOverflow;
      restoreFocusRef.current?.focus?.();
    };
  }, [open, onClose]);

  if (!open) return null;

  const occasion = template.occasion?.replace(/[-_]/g, ' ') ?? '';

  return (
    <div
      className="lp-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Live card preview"
      onClick={onClose}
      data-lenis-prevent
    >
      <div
        ref={panelRef}
        className="lp-panel"
        data-device={device}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header: close (left) + device toggle (centre) */}
        <div className="lp-header">
          <button ref={closeRef} type="button" className="lp-icon-btn" onClick={onClose} aria-label="Close preview">
            <X size={18} />
          </button>

          <div className="lp-device-toggle" role="group" aria-label="Preview device">
            <button
              type="button"
              className={`lp-device-btn ${device === 'mobile' ? 'is-active' : ''}`}
              onClick={() => setDevice('mobile')}
              aria-pressed={device === 'mobile'}
              title="Mobile preview"
            >
              <Smartphone size={16} />
              <span>Mobile</span>
            </button>
            <button
              type="button"
              className={`lp-device-btn ${device === 'desktop' ? 'is-active' : ''}`}
              onClick={() => setDevice('desktop')}
              aria-pressed={device === 'desktop'}
              title="Desktop preview"
            >
              <Monitor size={16} />
              <span>Desktop</span>
            </button>
          </div>

          <span className="lp-live-dot" aria-hidden="true" />
        </div>

        {/* Scrollable body: envelope stage + details page */}
        <div className="lp-scroll" data-lenis-prevent>
          <div className="lp-frame">
            <div className="lp-stage">
              <EnvelopeExperience
                key={device /* re-run reveal when the frame reflows */}
                template={template}
                recipientName={recipientName}
                senderName={senderName}
                title={title}
                message={message}
                themeSettings={themeSettings}
                initialOpen={false}
                autoplay
              />
            </div>

            <div className="lp-details">
              {occasion && <div className="lp-occasion">{occasion}</div>}

              <h2 className="lp-details-title">
                <Field value={title} placeholder="Your Title" />
              </h2>

              <p className="lp-details-to">
                To: <Field value={recipientName} placeholder="Guest Name" className="lp-details-to-name" />
              </p>

              <p className="lp-details-message">
                <Field value={message} placeholder="Your heartfelt message will appear here for your guest to read." />
              </p>

              <div className="lp-details-host">
                <span className="lp-details-host-label">With love from</span>
                <Field value={senderName} placeholder="Your Name" className="lp-details-host-name" />
              </div>
            </div>
          </div>
        </div>

        {/* Sticky footer */}
        <div className="lp-footer">
          <span className="lp-footer-note">
            <Heart size={13} /> This is a live preview
          </span>
          <button
            type="button"
            className="btn btn-primary lp-customize-btn"
            onClick={() => {
              onCustomize?.();
              onClose();
            }}
          >
            <Wand2 size={15} /> Customize
          </button>
        </div>
      </div>
    </div>
  );
}
