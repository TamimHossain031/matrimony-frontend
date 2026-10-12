'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import { Heart, ArrowLeft } from 'lucide-react';
import { GreetingCreator } from '@/components/greetings/GreetingCreator';

export default function GreetingCreatePage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--paper)' }}>
      {/* Top Header */}
      <header className="topbar">
        <div className="container row between gap-2" style={{ width: '100%' }}>
          <Link href="/greetings" className="brand" style={{ minWidth: 0 }}>
            <Heart size={18} fill="currentColor" strokeWidth={0} style={{ flexShrink: 0 }} />
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
              Greeting Card Studio
            </span>
          </Link>

          <div className="row gap-2" style={{ flexShrink: 0 }}>
            <Link href="/greetings" className="btn btn-ghost btn-sm">
              <ArrowLeft size={16} />{' '}
              <span className="hide-on-mobile">Explore All Designs</span>
            </Link>
            <Link href="/" className="btn btn-subtle btn-sm">
              Homepage
            </Link>
          </div>
        </div>
      </header>

      <main className="container" style={{ paddingBlock: '28px 60px' }}>
        <div className="mb-4">
          <h1 style={{ fontSize: '1.75rem', margin: '0 0 6px' }}>
            Create &amp; Share a Greeting Card
          </h1>
          <p className="muted" style={{ margin: 0 }}>
            Personalize your card with an occasion design, recipient name, and heartfelt words.
            You will receive a unique share link to send anywhere worldwide — no email required.
          </p>
        </div>

        <Suspense
          fallback={
            <div className="state">
              <div className="spinner" />
              <p className="small muted">Loading Studio...</p>
            </div>
          }
        >
          <GreetingCreator />
        </Suspense>
      </main>
    </div>
  );
}
