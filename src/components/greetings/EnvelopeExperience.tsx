'use client';

import React, { useState } from 'react';
import { Sparkles, Volume2, VolumeX, RotateCcw } from 'lucide-react';
import { CardThemeRenderer } from './CardThemeRenderer';
import { ParticleCanvas, ParticleKind } from './ParticleCanvas';
import { playUnsealSound, playGreetingTheme, toggleSound, isSoundMuted } from '@/lib/greetings/audio';
import type { GreetingTemplate, ThemeSettings } from '@/types/greetings';

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
  const [isOpen, setIsOpen] = useState(initialOpen);
  const [burstCount, setBurstCount] = useState(initialOpen ? 1 : 0);
  const [muted, setMuted] = useState(isSoundMuted());

  const config = template.design_config;
  const particleType: ParticleKind = (themeSettings?.particleType || config.particleType || 'golden_stars') as ParticleKind;
  const soundTheme = themeSettings?.soundTheme || 'celebration';
  const sealColor = config.sealColor || '#c29b38';
  const primaryColor = config.primaryColor || '#c29b38';

  const handleOpen = () => {
    if (isOpen) return;
    setIsOpen(true);
    setBurstCount((prev) => prev + 1);
    playUnsealSound();
    playGreetingTheme(soundTheme);
    if (onOpenCard) onOpenCard();
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
    setIsOpen(false);
  };

  const initialLetter = recipientName.trim().charAt(0).toUpperCase() || '♥';

  return (
    <div
      className="envelope-experience-root"
      style={{
        background: config.bgGradient || 'linear-gradient(135deg, #1f1b14 0%, #16120d 100%)',
      }}
    >
      {/* Particle Canvas for ambient + celebratory bursts */}
      <ParticleCanvas type={particleType} burstTrigger={burstCount} ambient={isOpen} />

      {/* Top Floating Controls (Sound & Replay) */}
      <div className="experience-top-bar">
        <button
          type="button"
          onClick={handleSoundToggle}
          className="btn-glass-icon"
          title={muted ? 'Turn Sound On' : 'Mute Sound'}
          aria-label={muted ? 'Turn Sound On' : 'Mute Sound'}
        >
          {muted ? <VolumeX size={18} /> : <Volume2 size={18} className="txt-gold" />}
          <span className="small">{muted ? 'Sound Off' : 'Sound On'}</span>
        </button>

        {isOpen && (
          <button
            type="button"
            onClick={handleReplay}
            className="btn-glass-icon"
            title="Fold Back into Envelope"
            aria-label="Fold back into envelope"
          >
            <RotateCcw size={16} />
            <span className="small">Fold Card</span>
          </button>
        )}
      </div>

      <div className="envelope-center-stage">
        {!isOpen ? (
          /* CLOSED ENVELOPE STATE */
          <div className="envelope-wrapper" onClick={handleOpen} role="button" tabIndex={0}>
            <div className="envelope-box">
              {/* Envelope Flap */}
              <div
                className="envelope-flap"
                style={{
                  borderTopColor: primaryColor,
                }}
              />

              {/* Envelope Back & Pocket */}
              <div className="envelope-body">
                {/* Addressed To on Front */}
                <div className="envelope-label">
                  <div className="envelope-label-caption">Personal & Confidential</div>
                  <div className="envelope-label-name">For: {recipientName || 'Someone Special'}</div>
                  {senderName && (
                    <div className="envelope-label-sender">From: {senderName}</div>
                  )}
                </div>

                {/* Wax Seal Stamp */}
                <div
                  className="wax-seal"
                  style={{
                    backgroundColor: sealColor,
                    boxShadow: `0 4px 20px ${sealColor}88, inset 0 2px 4px rgba(255,255,255,0.4), inset 0 -2px 4px rgba(0,0,0,0.5)`,
                  }}
                >
                  <div className="wax-seal-inner">
                    <span className="wax-seal-monogram">{initialLetter}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Prompt beneath envelope */}
            <div className="envelope-open-prompt">
              <span className="prompt-pill">
                <Sparkles size={15} className="sparkle-pulse" />
                Tap seal or envelope to open
              </span>
            </div>
          </div>
        ) : (
          /* UNFOLDED / EXPANDED CARD STATE */
          <div className="unfolded-card-container animate-card-appear">
            <CardThemeRenderer
              template={template}
              recipientName={recipientName}
              senderName={senderName}
              title={title}
              message={message}
              themeSettings={themeSettings}
            />
          </div>
        )}
      </div>
    </div>
  );
}
