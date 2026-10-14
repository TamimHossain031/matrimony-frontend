'use client';

import React, { useState } from 'react';
import {
  Copy,
  Check,
  Share2,
  ExternalLink,
  Send,
  QrCode,
} from 'lucide-react';

interface SharePanelProps {
  shareUrl: string;
  recipientName: string;
  senderName?: string | null;
  /** 'modal' = full panel inside the share dialog, 'inline' = compact prompt under the opened card. */
  variant?: 'modal' | 'inline';
  onShareClick?: (platform: string) => void;
  onCopyClick?: () => void;
  className?: string;
}

function FacebookIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function XTwitterIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function LinkedinIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
    </svg>
  );
}

function WhatsappIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

export function SharePanel({
  shareUrl,
  recipientName,
  senderName,
  variant = 'modal',
  onShareClick,
  onCopyClick,
  className = '',
}: SharePanelProps) {
  const [copied, setCopied] = useState(false);
  const [showQr, setShowQr] = useState(false);

  const fromLine = senderName ? ` from ${senderName}` : '';
  const shareText = `${recipientName ? `${recipientName}, a` : 'A'} little something special for you${fromLine} 💌 Tap to open your greeting:`;
  const canNativeShare =
    typeof navigator !== 'undefined' && typeof navigator.share === 'function';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2400);
      if (onCopyClick) onCopyClick();
    } catch {
      // Fallback
      const input = document.createElement('input');
      input.value = shareUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2400);
      if (onCopyClick) onCopyClick();
    }
  };

  const handleNativeShare = async () => {
    if (canNativeShare) {
      try {
        await navigator.share({
          title: `Special Greeting for ${recipientName || 'You'}`,
          text: `I made a special greeting card for you 💌`,
          url: shareUrl,
        });
        if (onShareClick) onShareClick('native');
      } catch (err: unknown) {
        if (!(err instanceof Error) || err.name !== 'AbortError') {
          handleCopy();
        }
      }
    } else {
      handleCopy();
    }
  };

  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`;

  const secondarySocials = [
    {
      name: 'Facebook',
      icon: <FacebookIcon />,
      color: '#1877F2',
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
      platform: 'facebook',
    },
    {
      name: 'Telegram',
      icon: <Send size={18} />,
      color: '#0088cc',
      url: `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`,
      platform: 'telegram',
    },
    {
      name: 'X',
      icon: <XTwitterIcon />,
      color: '#000000',
      url: `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`,
      platform: 'twitter',
    },
    {
      name: 'LinkedIn',
      icon: <LinkedinIcon />,
      color: '#0A66C2',
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
      platform: 'linkedin',
    },
  ];

  const handleSocialClick = (platform: string, url: string) => {
    if (onShareClick) onShareClick(platform);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(shareUrl)}`;

  return (
    <div className={`share-panel share-panel--${variant} ${className}`}>
      {variant === 'modal' && (
        <p className="muted small" style={{ margin: '0 0 16px' }}>
          Anyone with this private link can open the card. No email or account required.
        </p>
      )}

      {/* ---- Personal tier: lead with the channels you message close people on ---- */}
      <div className="share-personal">
        <button
          type="button"
          onClick={() => handleSocialClick('whatsapp', whatsappUrl)}
          className="share-hero-whatsapp"
        >
          <span className="share-hero-ico">
            <WhatsappIcon />
          </span>
          <span className="share-hero-text">
            <strong>Send on WhatsApp</strong>
            <small>The quickest way to reach your people</small>
          </span>
          <ExternalLink size={16} className="share-hero-arrow" />
        </button>

        <div className="share-personal-row">
          {canNativeShare && (
            <button
              type="button"
              onClick={handleNativeShare}
              className="btn btn-personal"
            >
              <Share2 size={16} /> Share
            </button>
          )}
          <button
            type="button"
            onClick={handleCopy}
            className={`btn btn-personal ${copied ? 'is-copied' : ''}`}
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
            <span>{copied ? 'Link copied!' : 'Copy link'}</span>
          </button>
        </div>
      </div>

      {/* ---- Secondary tier: broadcast / wider sharing, intentionally quieter ---- */}
      <div className="share-secondary">
        <div className="share-divider"><span>Or share anywhere</span></div>
        <div className="row wrap gap-2 share-secondary-pills">
          {secondarySocials.map((s) => (
            <button
              key={s.name}
              type="button"
              onClick={() => handleSocialClick(s.platform, s.url)}
              className="social-share-pill"
              style={{ '--brand-color': s.color } as React.CSSProperties}
            >
              <span className="social-icon" style={{ color: s.color }}>
                {s.icon}
              </span>
              <span>{s.name}</span>
            </button>
          ))}
          <button
            type="button"
            onClick={() => setShowQr(!showQr)}
            className="social-share-pill"
          >
            <span className="social-icon">
              <QrCode size={18} />
            </span>
            <span>{showQr ? 'Hide QR' : 'QR code'}</span>
          </button>
        </div>

        {showQr && (
          <div className="share-qr-section animate-card-appear">
            <div className="qr-box">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={qrApiUrl} alt="Scan QR Code to open greeting card" width={160} height={160} />
            </div>
            <p className="tiny muted text-center mt-2">
              Scan with any phone camera to open the card directly.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
