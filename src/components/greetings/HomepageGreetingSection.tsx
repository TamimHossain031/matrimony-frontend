'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Sparkles, Heart, ArrowRight, Share2, Shield, Globe } from 'lucide-react';
import { useGreetingTemplates } from '@/features/greetings/hooks';

const OCCASION_TILES = [
  { key: 'wedding', title: 'Wedding & Nikkah', icon: '💍', count: '4 luxury designs' },
  { key: 'anniversary', title: 'Anniversary', icon: '🥂', count: '4 milestone designs' },
  { key: 'birthday', title: 'Birthday', icon: '🎂', count: '3 vibrant designs' },
  { key: 'eid', title: 'Eid & Festive', icon: '🌙', count: '2 celebration designs' },
  { key: 'congratulations', title: 'Congratulations', icon: '🏆', count: 'Success & milestones' },
  { key: 'thankyou', title: 'Thank You', icon: '🌿', count: 'Botanical gratitude' },
  { key: 'love', title: 'Love & Romance', icon: '💖', count: 'Romantic devotion' },
];

export function HomepageGreetingSection() {
  const [activeOccasion, setActiveOccasion] = useState('wedding');
  const { data: templates = [] } = useGreetingTemplates(activeOccasion);

  const previewTemplate = templates[0];

  return (
    <section className="container lp-section" id="greetings" style={{ paddingTop: 20 }}>
      {/* Section Header */}
      <div className="lp-section-head">
        <span className="lp-eyebrow">
          <Sparkles size={14} /> Global Greeting Cards
        </span>
        <h2 className="lp-h2">Make Every Special Moment More Memorable</h2>
        <p className="muted" style={{ maxWidth: '58ch', margin: '0 auto' }}>
          Create a personalized, luxury greeting card and share it with someone special worldwide —
          no email, no app download, and no password required. Instantly shareable via WhatsApp,
          Messenger, or any link.
        </p>
      </div>

      {/* Main Grid: Occasions + Interactive Featured Showcase */}
      <div className="greeting-home-grid">
        {/* Left: Occasion Cards */}
        <div className="greeting-home-occasions">
          <div className="section-title mb-2">Explore Occasions</div>
          <div className="occasion-card-list">
            {OCCASION_TILES.map((tile) => {
              const isSelected = activeOccasion === tile.key;
              return (
                <button
                  key={tile.key}
                  type="button"
                  onClick={() => setActiveOccasion(tile.key)}
                  className={`occasion-tile-item ${isSelected ? 'active' : ''}`}
                >
                  <span className="tile-icon">{tile.icon}</span>
                  <div className="tile-text">
                    <strong>{tile.title}</strong>
                    <span className="tiny faint">{tile.count}</span>
                  </div>
                  <ArrowRight size={15} className="tile-arrow" />
                </button>
              );
            })}
          </div>

          <div className="greeting-home-guarantees mt-4">
            <div className="guarantee-chip">
              <Globe size={16} className="txt-leaf" />
              <span>Worldwide access via unique private URL</span>
            </div>
            <div className="guarantee-chip">
              <Share2 size={16} className="txt-rose" />
              <span>1-tap sharing on WhatsApp, Telegram & Facebook</span>
            </div>
            <div className="guarantee-chip">
              <Shield size={16} className="txt-marigold" />
              <span>No spam, no tracking, complete privacy</span>
            </div>
          </div>
        </div>

        {/* Right: Live Interactive Card Teaser */}
        <div className="greeting-home-visual">
          <div className="teaser-card-wrapper">
            {previewTemplate ? (
              <div
                className="teaser-card-preview"
                style={{
                  background: previewTemplate.design_config.bgGradient,
                }}
              >
                <div
                  className="teaser-inner-card"
                  style={{
                    backgroundColor: previewTemplate.design_config.cardBg,
                    borderColor: previewTemplate.design_config.accentColor,
                    color: previewTemplate.design_config.textColor,
                  }}
                >
                  <div className="teaser-badge">
                    {previewTemplate.design_config.badge}
                  </div>
                  <h3
                    className="teaser-name"
                    style={{ color: previewTemplate.design_config.primaryColor }}
                  >
                    A Special Greeting for You
                  </h3>
                  <div
                    className="card-divider"
                    style={{ color: previewTemplate.design_config.accentColor, margin: '10px auto' }}
                  >
                    <span className="divider-icon">
                      <Heart size={14} fill="currentColor" strokeWidth={0} />
                    </span>
                  </div>
                  <p className="teaser-quote">
                    &ldquo;May your days be filled with peace, unshakeable joy, and radiant blessings together.&rdquo;
                  </p>
                  <div
                    className="teaser-sender"
                    style={{ color: previewTemplate.design_config.primaryColor }}
                  >
                    With all my love & best wishes
                  </div>
                </div>

                {/* Floating Action Badge */}
                <div className="teaser-floating-pill">
                  <Sparkles size={14} className="txt-marigold" />
                  <span>Interactive 3D Envelope & Particle Magic</span>
                </div>
              </div>
            ) : null}

            {/* CTA Button Band */}
            <div className="teaser-actions-band">
              <Link href="/greetings/create" className="btn btn-primary btn-lg grow">
                <Sparkles size={18} /> Create a Greeting Card
              </Link>
              <Link href="/greetings" className="btn btn-ghost btn-lg">
                Explore All Designs
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
