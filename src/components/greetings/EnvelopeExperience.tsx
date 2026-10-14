'use client';

import React, { memo, useEffect, useState } from 'react';
import { Sparkles, Volume2, VolumeX, RotateCcw } from 'lucide-react';
import { CardCoverCanvas } from './CardCoverCanvas';
import { ParticleCanvas, ParticleKind } from './ParticleCanvas';
import { getTemplateImageUrl } from '@/features/greetings/utils';
import { playUnsealSound, playGreetingTheme, toggleSound, isSoundMuted } from '@/lib/greetings/audio';
import { useRevealSequence } from './useRevealSequence';
import type { GreetingTemplate, ThemeSettings } from '@/types/greetings';

/** The card artwork never changes mid-reveal, so memoise it: text-field edits in
 *  the live preview re-render props, but identical props skip the subtree. */
const RevealCard = memo(CardCoverCanvas);

interface EnvelopeExperienceProps {
  template: GreetingTemplate;
  recipientName: string;
  senderName?: string | null;
  title?: string | null;
  message: string;
  themeSettings?: ThemeSettings | null;
  initialOpen?: boolean;
  onOpenCard?: () => void;
}

export function EnvelopeExperience({
  template,
  recipientName,
  senderName,
  title,
  message,
  themeSettings,
  initialOpen = false,
  onOpenCard,
}: EnvelopeExperienceProps) {
  const [burstCount, setBurstCount] = useState(initialOpen ? 1 : 0);
  const [muted, setMuted] = useState(isSoundMuted());

  const config = template.design_config;
  const particleType: ParticleKind = (themeSettings?.particleType || config.particleType || 'golden_stars') as ParticleKind;
  const soundTheme = themeSettings?.soundTheme || 'celebration';
  const sealColor = config.sealColor || '#c29b38';
  const primaryColor = config.primaryColor || '#c29b38';
  const accentColor = themeSettings?.customAccentColor || config.accentColor || '#e5c06e';

  const { stage, isOpen, play, replay } = useRevealSequence({
    initialOpen,
    onReveal: () => {
      // Celebratory burst the instant the card arrives at centre.
      setBurstCount((prev) => prev + 1);
      onOpenCard?.();
    },
  });

  // Warm the cover artwork + fonts on mount so the reveal never flashes an
  // undecoded image. The card is already mounted (tucked inside the envelope);
  // this just guarantees decode has finished before it rises into view.
  useEffect(() => {
    const coverUrl = getTemplateImageUrl(template);
    if (coverUrl && typeof window !== 'undefined') {
      const img = new window.Image();
      img.src = coverUrl;
      void img.decode?.().catch(() => {});
    }
    if (typeof document !== 'undefined' && 'fonts' in document) {
      void document.fonts.ready;
    }
  }, [template]);

  const handleOpen = () => {
    if (stage !== 'sealed') return;
    playUnsealSound();
    playGreetingTheme(soundTheme);
    play();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleOpen();
    }
  };

  const handleSoundToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newMuted = toggleSound();
    setMuted(newMuted);
    if (!newMuted) {
      playGreetingTheme(soundTheme);
    }
  };

  const handleReplay = (e: React.MouseEvent) => {
    e.stopPropagation();
    replay();
  };

  const initialLetter = recipientName.trim().charAt(0).toUpperCase() || '♥';

  return (
    <div
      className="envelope-experience-root"
      data-stage={stage}
      style={{
        background: config.bgGradient || 'linear-gradient(135deg, #1f1b14 0%, #16120d 100%)',
      }}
    >
      {/* Ambient Radial Spotlight Halo */}
      <div
        className="envelope-ambient-glow"
        style={{
          background: `radial-gradient(ellipse at 50% 48%, ${sealColor}35 0%, ${primaryColor}22 36%, transparent 70%)`,
        }}
      />

      {/* Particle Canvas for continuous ambient magic + celebratory unseal bursts */}
      <ParticleCanvas type={particleType} burstTrigger={burstCount} ambient={true} />

      {/* Top Floating Controls (Sound & Replay) */}
      <div className="experience-top-bar">
        <button
          type="button"
          onClick={handleSoundToggle}
          className="btn-glass-icon"
          title={muted ? 'Turn Sound On' : 'Mute Sound'}
          aria-label={muted ? 'Turn Sound On' : 'Mute Sound'}
        >
          {muted ? <VolumeX size={17} /> : <Volume2 size={17} className="txt-gold" />}
          <span>{muted ? 'Sound Off' : 'Sound On'}</span>
        </button>

        {isOpen && (
          <button
            type="button"
            onClick={handleReplay}
            className="btn-glass-icon"
            title="Replay the reveal"
            aria-label="Replay the reveal"
          >
            <RotateCcw size={15} />
            <span>Replay</span>
          </button>
        )}
      </div>

      {/* Shared reveal stage: the envelope and the card live together so the card
          can rise out continuously instead of the envelope hard-swapping away. */}
      <div className="envelope-center-stage">
        {/* ================================================================
            LUXURY 3D ENVELOPE (fades + drops away once the card is out)
            ================================================================ */}
        <div className="reveal-envelope-layer" aria-hidden={isOpen}>
          <div
            className={`envelope-wrapper ${stage !== 'sealed' ? 'is-opening' : ''}`}
            onClick={handleOpen}
            onKeyDown={handleKeyDown}
            role="button"
            tabIndex={isOpen ? -1 : 0}
            aria-label={`Open greeting card for ${recipientName}`}
          >
            {/* Ground Elevation Shadow */}
            <div className="envelope-ground-shadow" />

            {/* 3D Envelope Box */}
            <div className="envelope-box">
              {/* Interior Silk Pattern Lining */}
              <div
                className="envelope-interior-lining"
                style={{
                  backgroundColor: `${primaryColor}18`,
                  borderColor: `${accentColor}35`,
                }}
              >
                <div className="envelope-lining-pattern" />
              </div>

              {/* Letter Sheet Preview (Slides out smoothly when opening) */}
              <div className="envelope-letter-sheet">
                <div className="letter-sheet-gold-edge" style={{ backgroundColor: accentColor }} />
                <div className="letter-sheet-watermark" style={{ color: `${primaryColor}35` }}>
                  <Sparkles size={22} />
                </div>
              </div>

              {/* Front Pocket with folded origami creases */}
              <div className="envelope-pocket">
                <div className="envelope-pocket-left" />
                <div className="envelope-pocket-right" />
                <div className="envelope-pocket-bottom" />
              </div>

              {/* Lower Pocket Address Plaque (ZERO overlap with the wax seal!) */}
              <div className="envelope-address-plaque">
                <div className="plaque-filigree-card">
                  <div className="plaque-corner top-left" />
                  <div className="plaque-corner top-right" />
                  <div className="plaque-corner bottom-left" />
                  <div className="plaque-corner bottom-right" />

                  <div className="plaque-caption">
                    <span>✦</span> PERSONAL &amp; CONFIDENTIAL <span>✦</span>
                  </div>
                  <div className="plaque-recipient" title={recipientName}>
                    For: <span className="plaque-name">{recipientName || 'Someone Special'}</span>
                  </div>
                  {senderName && (
                    <div className="plaque-sender">
                      Warmest wishes from <span className="plaque-sender-name">{senderName}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* 3D Flap with Vector Gold Foil Trim */}
              <div className="envelope-flap-wrapper">
                <svg
                  className="envelope-flap-svg"
                  viewBox="0 0 480 150"
                  preserveAspectRatio="none"
                >
                  <defs>
                    <linearGradient id="flapPaperGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#faf6ef" />
                      <stop offset="55%" stopColor="#ede3d1" />
                      <stop offset="100%" stopColor="#e0d1b9" />
                    </linearGradient>
                    <linearGradient id="goldFoilGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#bfa14c" />
                      <stop offset="25%" stopColor="#f5e298" />
                      <stop offset="50%" stopColor="#d4af37" />
                      <stop offset="75%" stopColor="#fbf0b9" />
                      <stop offset="100%" stopColor="#b8860b" />
                    </linearGradient>
                    <filter id="flapDropShadow" x="-10%" y="0%" width="120%" height="160%">
                      <feDropShadow dx="0" dy="5" stdDeviation="5" floodColor="rgba(0,0,0,0.22)" />
                    </filter>
                  </defs>
                  {/* Flap Body */}
                  <path
                    d="M 0 0 L 210 134 Q 240 148 270 134 L 480 0 Z"
                    fill="url(#flapPaperGrad)"
                    filter="url(#flapDropShadow)"
                  />
                  {/* Flap Gold Foil Trim */}
                  <path
                    d="M 0 0 L 210 134 Q 240 148 270 134 L 480 0"
                    fill="none"
                    stroke="url(#goldFoilGrad)"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                </svg>
              </div>

              {/* 3D Wax Seal (Anchored at flap apex: left: 50%, top: 138px) */}
              <div
                className="wax-seal"
                style={{
                  '--seal-color': sealColor,
                  '--seal-glow': `${sealColor}88`,
                } as React.CSSProperties}
              >
                <div className="wax-seal-body">
                  <div className="wax-seal-die-center">
                    <span className="wax-seal-monogram">{initialLetter}</span>
                  </div>
                  <div className="wax-seal-shine" />
                </div>
              </div>
            </div>

            {/* Prompt beneath envelope */}
            <div className="envelope-open-prompt">
              <span className="prompt-pill">
                <Sparkles size={16} className="sparkle-pulse" />
                <span>Tap seal or envelope to open</span>
              </span>
            </div>
          </div>
        </div>

        {/* ================================================================
            THE CARD — tucked inside the envelope, rises out to centre
            ================================================================ */}
        <div className="reveal-card-layer" aria-hidden={!isOpen}>
          <div className="reveal-card">
            <RevealCard
              template={template}
              recipientName={recipientName}
              senderName={senderName}
              title={title}
              message={message}
              themeSettings={themeSettings}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
