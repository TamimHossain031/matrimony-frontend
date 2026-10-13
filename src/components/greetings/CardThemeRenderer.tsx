'use client';

import React from 'react';
import { Heart, Sparkles, Award } from 'lucide-react';
import { getTemplateImageUrl } from '@/features/greetings/utils';
import type { GreetingTemplate, ThemeSettings, GreetingFontFamily } from '@/types/greetings';

export function getFontClass(fontFamily?: GreetingFontFamily | string): string {
  switch (fontFamily) {
    case 'cinzel':
      return 'font-greeting-cinzel';
    case 'cinzel-dec':
      return 'font-greeting-cinzel-dec';
    case 'cormorant':
      return 'font-greeting-cormorant';
    case 'calligraphy':
      return 'font-greeting-calligraphy';
    case 'alex-brush':
      return 'font-greeting-alex';
    case 'handwriting':
      return 'font-greeting-handwriting';
    case 'montserrat':
      return 'font-greeting-montserrat';
    case 'traditional':
      return 'font-greeting-traditional';
    case 'sans':
      return 'font-greeting-sans';
    case 'script':
      return 'font-greeting-script';
    case 'serif':
    default:
      return 'font-greeting-serif';
  }
}

interface CardThemeRendererProps {
  template: GreetingTemplate;
  recipientName: string;
  senderName?: string | null;
  title?: string | null;
  message: string;
  themeSettings?: ThemeSettings | null;
  className?: string;
  isInteractivePreview?: boolean;
}

export function CardThemeRenderer({
  template,
  recipientName,
  senderName,
  title,
  message,
  themeSettings,
  className = '',
  isInteractivePreview = false,
}: CardThemeRendererProps) {
  const config = template.design_config;
  const fontFamily = themeSettings?.fontFamily || config.fontFamily || 'serif';
  const primaryColor = config.primaryColor || '#c29b38';
  const accentColor = themeSettings?.customAccentColor || config.accentColor || '#e5c06e';
  const cardBg = config.cardBg || '#fcfaf5';
  const textColor = config.textColor || '#2a241b';
  const borderStyle = config.borderStyle || 'double';

  const fontClass = getFontClass(fontFamily);
  const messageFontClass =
    fontFamily === 'handwriting'
      ? 'font-greeting-handwriting'
      : fontFamily === 'cormorant'
      ? 'font-greeting-cormorant'
      : '';

  const artworkUrl = getTemplateImageUrl(template);

  return (
    <div
      className={`greeting-card-frame ${borderStyle} ${isInteractivePreview ? 'interactive-preview' : ''} ${className}`}
      style={{
        backgroundColor: cardBg,
        color: textColor,
        borderColor: accentColor,
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.22), 0 0 0 1px rgba(255, 255, 255, 0.1) inset',
      }}
    >
      {/* Corner Ornaments */}
      <div className="corner-ornament top-left" style={{ borderColor: accentColor }} />
      <div className="corner-ornament top-right" style={{ borderColor: accentColor }} />
      <div className="corner-ornament bottom-left" style={{ borderColor: accentColor }} />
      <div className="corner-ornament bottom-right" style={{ borderColor: accentColor }} />

      {/* Subtle background filigree watermark */}
      <div
        className="card-watermark"
        style={{
          color: primaryColor,
          opacity: 0.04,
        }}
      />

      <div className="card-inner-pad">
        {/* Occasion Badge / Header */}
        <div className="card-top-badge">
          <span
            className="badge-ornate"
            style={{
              borderColor: accentColor,
              backgroundColor: `${accentColor}18`,
              color: primaryColor,
            }}
          >
            {config.badge || '✨ Special Greeting'}
          </span>
        </div>

        {/* Uploaded Card Artwork Banner */}
        {artworkUrl && (
          <div
            className="card-art-banner"
            style={{
              borderColor: `${accentColor}66`,
            }}
          >
            <img
              src={artworkUrl}
              alt={template.name}
              className="card-art-image"
              onError={(e) => {
                const target = e.target as HTMLElement;
                if (target.parentElement) {
                  target.parentElement.style.display = 'none';
                }
              }}
            />
          </div>
        )}

        {/* Recipient Name Header */}
        <div className="card-recipient-section">
          <div className="sub-caption" style={{ color: `${textColor}99` }}>
            Especially for
          </div>
          <h1
            className={`recipient-heading ${fontClass}`}
            style={{
              color: primaryColor,
              textShadow: '0 1px 2px rgba(0,0,0,0.06)',
            }}
          >
            {recipientName || 'Dear One'}
          </h1>
        </div>

        {/* Decorative Divider */}
        <div className="card-divider" style={{ color: accentColor }}>
          <span className="divider-line" style={{ background: `linear-gradient(90deg, transparent, ${accentColor})` }} />
          <span className="divider-icon">
            {config.icon === 'Heart' ? (
              <Heart size={16} fill="currentColor" strokeWidth={0} />
            ) : config.icon === 'Award' ? (
              <Award size={16} />
            ) : (
              <Sparkles size={16} />
            )}
          </span>
          <span className="divider-line" style={{ background: `linear-gradient(90deg, ${accentColor}, transparent)` }} />
        </div>

        {/* Card Title (if custom) */}
        {title && (
          <h2
            className={`card-custom-title ${fontClass}`}
            style={{
              color: primaryColor,
            }}
          >
            {title}
          </h2>
        )}

        {/* Personalized Message */}
        <div className="card-message-body">
          <p className={`card-message-text ${messageFontClass}`} style={{ color: textColor }}>
            {message || 'Wishing you endless joy, peace, and blessings on this momentous occasion.'}
          </p>
        </div>

        {/* Sender Attribution */}
        {senderName && (
          <div className="card-sender-block">
            <div className="sender-pre" style={{ color: `${textColor}88` }}>
              Warmest wishes from
            </div>
            <div
              className={`sender-name ${fontClass}`}
              style={{
                color: primaryColor,
              }}
            >
              {senderName}
            </div>
          </div>
        )}

        {/* Bottom Seal & Brand mark */}
        <div className="card-footer-stamp">
          <div className="stamp-seal" style={{ borderColor: `${accentColor}55` }}>
            <span style={{ color: primaryColor }}>♥</span>
            <span className="stamp-text">Shondhan Celebrations</span>
          </div>
        </div>
      </div>
    </div>
  );
}
