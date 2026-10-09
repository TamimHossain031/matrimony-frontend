'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Eye, Users, Languages } from 'lucide-react';
import { useAuth } from '@/components/providers/AuthProvider';
import { useI18n } from '@/lib/i18n';
import { CenterSpinner } from '@/components/ui/feedback';

export default function LandingPage() {
  const { isReady, isAuthenticated } = useAuth();
  const { t, locale, setLocale } = useI18n();
  const router = useRouter();

  useEffect(() => {
    if (isReady && isAuthenticated) router.replace('/dashboard');
  }, [isReady, isAuthenticated, router]);

  if (!isReady) return <CenterSpinner />;
  if (isAuthenticated) return <CenterSpinner />;

  return (
    <div>
      <header className="topbar">
        <div className="container row between" style={{ width: '100%' }}>
          <span className="brand">{t('brand_name', 'Shondhan')}</span>
          <div className="row gap-2">
            <button className="btn btn-subtle btn-sm" onClick={() => setLocale(locale === 'bn' ? 'en' : 'bn')}>
              <Languages size={16} /> {t('lang_toggle')}
            </button>
            <Link href="/login" className="btn btn-ghost btn-sm">{t('nav_login')}</Link>
            <Link href="/register" className="btn btn-primary btn-sm">{t('nav_register')}</Link>
          </div>
        </div>
      </header>

      <main className="container">
        <section className="hero">
          <h1>{t('brand_tagline')}</h1>
          <p className="muted" style={{ maxWidth: '54ch', fontSize: '1.05rem' }}>
            {t('login_subtitle')}
          </p>
          <div className="row gap-3 mt-4 wrap">
            <Link href="/register" className="btn btn-primary btn-lg">{t('create_account')}</Link>
            <Link href="/login" className="btn btn-ghost btn-lg">{t('btn_login')}</Link>
          </div>
        </section>

        <section className="grid-cards" style={{ paddingBottom: 48 }}>
          <Feature icon={<ShieldCheck size={22} />} title="Verified members" body="NID and selfie verification earns a visible mark of trust — the loudest thing on every card." />
          <Feature icon={<Eye size={22} />} title="Private by default" body="Photos stay blurred until you choose to share. A relative blocklist keeps your search discreet." />
          <Feature icon={<Users size={22} />} title="Guardian-friendly" body="Profiles can be created and managed by a parent or sibling, the way families actually search." />
        </section>
      </main>
    </div>
  );
}

function Feature({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <div className="card card-pad">
      <span className="state-icon" style={{ width: 44, height: 44 }}>{icon}</span>
      <h3 className="mt-3">{title}</h3>
      <p className="muted small" style={{ margin: 0 }}>{body}</p>
    </div>
  );
}
