'use client';

import React, { ReactNode } from 'react';
import Link from 'next/link';
import { Languages } from 'lucide-react';
import { useI18n } from '@/lib/i18n';

export function AuthCard({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  const { t, locale, setLocale } = useI18n();
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header className="container row between" style={{ height: 56 }}>
        <Link href="/" className="brand">{t('brand_name', 'Shondhan')}</Link>
        <button className="btn btn-subtle btn-sm" onClick={() => setLocale(locale === 'bn' ? 'en' : 'bn')}>
          <Languages size={16} /> {t('lang_toggle')}
        </button>
      </header>
      <main className="grow row center" style={{ padding: '24px 16px' }}>
        <div style={{ width: '100%', maxWidth: 420 }}>
          <div className="card card-pad">
            <h1 style={{ fontSize: '1.4rem' }}>{title}</h1>
            {subtitle && <p className="muted" style={{ marginTop: -4 }}>{subtitle}</p>}
            <div className="mt-4">{children}</div>
          </div>
          {footer && <div className="text-center mt-4 small muted">{footer}</div>}
        </div>
      </main>
    </div>
  );
}
