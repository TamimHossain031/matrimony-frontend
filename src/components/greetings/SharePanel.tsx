'use client';

import React, { useState } from 'react';
import {
  Copy,
  Check,
  Share2,
  ExternalLink,
  MessageCircle,
  Send,
  QrCode,
} from 'lucide-react';

interface SharePanelProps {
  shareUrl: string;
  recipientName: string;
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

export function SharePanel({
  shareUrl,
  recipientName,
  onShareClick,
  onCopyClick,
  className = '',
}: SharePanelProps) {
  const [copied, setCopied] = useState(false);
  const [showQr, setShowQr] = useState(false);

  const shareText = `I made a special greeting card for you 💌 Open it here:`;

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
    if (typeof navigator !== 'undefined' && navigator.share) {
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

  const socialLinks = [
    {
      name: 'WhatsApp',
      icon: <MessageCircle size={18} />,
      color: '#25D366',
      url: `https://api.whatsapp.com/send?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`,
      platform: 'whatsapp',
    },
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
      name: 'X (Twitter)',
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

  // High-contrast clean QR Code SVG URL via QR server standard API or scannable block
  const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(shareUrl)}`;

  return (
    <div className={`share-panel-card card card-pad ${className}`}>
      <div className="share-head">
        <h3 style={{ margin: 0, fontSize: '1.2rem' }}>🎉 Your Greeting Card is Live!</h3>
        <p className="muted small" style={{ margin: '4px 0 16px' }}>
          Anyone with this private link can view the card worldwide. No email or account required.
        </p>
      </div>

      {/* Copy Link Input Bar */}
      <div className="share-link-box">
        <input
          type="text"
          readOnly
          value={shareUrl}
          className="share-input"
          onClick={(e) => (e.target as HTMLInputElement).select()}
        />
        <button
          type="button"
          onClick={handleCopy}
          className={`btn btn-primary share-copy-btn ${copied ? 'copied' : ''}`}
        >
          {copied ? <Check size={16} /> : <Copy size={16} />}
          <span>{copied ? 'Copied!' : 'Copy Link'}</span>
        </button>
      </div>

      {/* Primary Action Buttons */}
      <div className="share-actions-row">
        {typeof navigator !== 'undefined' && typeof navigator.share === 'function' && (
          <button
            type="button"
            onClick={handleNativeShare}
            className="btn btn-rose btn-block"
            style={{ flex: 1 }}
          >
            <Share2 size={16} /> Share via Phone Menu
          </button>
        )}

        <button
          type="button"
          onClick={() => setShowQr(!showQr)}
          className="btn btn-ghost"
          style={{ flex: 1 }}
        >
          <QrCode size={16} /> {showQr ? 'Hide QR' : 'Show QR Code'}
        </button>

        <a
          href={shareUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-ghost"
          style={{ flex: 1 }}
        >
          <ExternalLink size={16} /> Open Card
        </a>
      </div>

      {/* QR Code Reveal */}
      {showQr && (
        <div className="share-qr-section animate-card-appear">
          <div className="qr-box">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={qrApiUrl} alt="Scan QR Code to open greeting card" width={180} height={180} />
          </div>
          <p className="tiny muted text-center mt-2">
            Scan with any smartphone camera to open the card directly.
          </p>
        </div>
      )}

      {/* Quick 1-Click Social Sharing */}
      <div className="share-social-grid mt-4">
        <div className="section-title">Instant 1-Click Sharing</div>
        <div className="row wrap gap-2">
          {socialLinks.map((s) => (
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
        </div>
      </div>
    </div>
  );
}
