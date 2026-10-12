'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Sparkles, Heart, ArrowRight, ArrowLeft } from 'lucide-react';
import { useGreetingTemplates } from '@/features/greetings/hooks';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import type { OccasionKey } from '@/types/greetings';

const OCCASIONS: { key: OccasionKey; label: string; icon: string }[] = [
  { key: 'all', label: 'All Designs', icon: '✨' },
  { key: 'wedding', label: 'Wedding & Nikkah', icon: '💍' },
  { key: 'anniversary', label: 'Anniversary', icon: '🥂' },
  { key: 'birthday', label: 'Birthday', icon: '🎂' },
  { key: 'eid', label: 'Eid & Festive', icon: '🌙' },
  { key: 'congratulations', label: 'Congratulations', icon: '🏆' },
  { key: 'thankyou', label: 'Thank You', icon: '🌿' },
  { key: 'love', label: 'Love & Romance', icon: '💖' },
];

export default function GreetingsGalleryPage() {
  const [selectedOccasion, setSelectedOccasion] = useState<OccasionKey>('all');
  const { data: templates = [], isLoading } = useGreetingTemplates(
    selectedOccasion === 'all' ? undefined : selectedOccasion
  );

  return (
    <div style={{ minHeight: '100vh', background: 'var(--paper)' }}>
      {/* Top Header */}
      <header className="topbar">
        <div className="container row between" style={{ width: '100%' }}>
          <Link href="/" className="brand">
            <Heart size={18} fill="currentColor" strokeWidth={0} />
            Shondhan Greetings
          </Link>

          <div className="row gap-2">
            <Link href="/" className="btn btn-subtle btn-sm">
              <ArrowLeft size={16} /> Back to Matrimony
            </Link>
            <Link href="/greetings/create" className="btn btn-primary btn-sm">
              <Sparkles size={16} /> Create a Card
            </Link>
          </div>
        </div>
      </header>

      <main className="container" style={{ paddingBlock: '36px 64px' }}>
        {/* Hero Banner */}
        <ScrollReveal animation="fade-up">
          <div className="greetings-hub-hero">
            <span className="lp-eyebrow mb-2">
              <Sparkles size={14} className="animate-badge-shimmer" /> Luxury Digital Greetings
            </span>
            <h1>Celebrate Life&apos;s Most Beautiful Moments</h1>
            <p className="muted" style={{ maxWidth: '60ch', margin: '0 auto 24px' }}>
              Choose an artisanal greeting design, personalize with heartfelt words, and share one
              enchanted link with anyone in the world.
            </p>

            <Link href="/greetings/create" className="btn btn-primary btn-lg">
              <Sparkles size={18} /> Start Creating Your Card <ArrowRight size={18} />
            </Link>
          </div>
        </ScrollReveal>

        {/* Occasion Filter Scroller */}
        <ScrollReveal animation="fade-up" delay={80}>
          <div className="occasion-filter-bar mt-6">
            <div className="occasion-pill-scroller" data-lenis-prevent>
              {OCCASIONS.map((occ) => (
                <button
                  key={occ.key}
                  type="button"
                  onClick={() => setSelectedOccasion(occ.key)}
                  className={`occasion-pill ${selectedOccasion === occ.key ? 'selected' : ''}`}
                >
                  <span>{occ.icon}</span>
                  <span>{occ.label}</span>
                </button>
              ))}
            </div>
          </div>
        </ScrollReveal>

        {/* Template Showcase Grid */}
        <div className="mt-6">
          <ScrollReveal animation="fade-up" delay={120}>
            <div className="row between mb-4">
              <h2 style={{ fontSize: '1.25rem', margin: 0 }}>Available Designs</h2>
              <span className="small faint">{templates.length} templates ready</span>
            </div>
          </ScrollReveal>

          {isLoading ? (
            <div className="state">
              <div className="spinner" />
              <p className="muted">Loading template gallery...</p>
            </div>
          ) : (
            <div className="greetings-gallery-grid">
              {templates.map((tpl, index) => {
                const cfg = tpl.design_config;
                return (
                  <ScrollReveal
                    key={tpl.id}
                    animation="fade-up"
                    delay={Math.min(index * 60, 480)}
                    className="gallery-card-item card"
                  >
                    <div
                      className="gallery-card-cover"
                      style={{ background: cfg.bgGradient }}
                    >
                      <div
                        className="gallery-mini-paper"
                        style={{
                          backgroundColor: cfg.cardBg,
                          borderColor: cfg.accentColor,
                          color: cfg.textColor,
                        }}
                      >
                        <span className="mini-badge" style={{ color: cfg.primaryColor }}>
                          {cfg.badge}
                        </span>
                        <div
                          className="mini-title font-greeting-serif"
                          style={{ color: cfg.primaryColor }}
                        >
                          {tpl.name}
                        </div>
                        <div
                          className="mini-divider"
                          style={{ backgroundColor: cfg.accentColor }}
                        />
                        <p className="mini-sample">
                          &ldquo;Wishing you joy, grace & love...&rdquo;
                        </p>
                      </div>
                    </div>

                    <div className="gallery-card-details">
                      <div className="row between">
                        <strong>{tpl.name}</strong>
                        <span className="tiny faint" style={{ textTransform: 'capitalize' }}>
                          {tpl.occasion}
                        </span>
                      </div>
                      <p className="small muted mt-1" style={{ margin: '4px 0 14px' }}>
                        {tpl.description}
                      </p>
                      <Link
                        href={`/greetings/create?template=${tpl.slug}`}
                        className="btn btn-primary btn-block btn-sm"
                      >
                        Personalize This Design
                      </Link>
                    </div>
                  </ScrollReveal>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
