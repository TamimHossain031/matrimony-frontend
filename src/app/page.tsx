'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShieldCheck,
  Eye,
  Users,
  Languages,
  Heart,
  UserPlus,
  BadgeCheck,
  Search,
  MessageCircle,
  Lock,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  Quote,
  ScanFace,
} from 'lucide-react';
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
      {/* ---- Top navigation ---- */}
      <header className="topbar">
        <div className="container row between" style={{ width: '100%' }}>
          <span className="brand">
            <Heart size={18} fill="currentColor" strokeWidth={0} />
            {t('brand_name', 'Shondhan')}
          </span>

          <nav className="lp-nav-links" aria-label="Primary">
            <a href="#how" className="lp-nav-link">{t('land_nav_how')}</a>
            <a href="#why" className="lp-nav-link">{t('land_nav_why')}</a>
            <a href="#safety" className="lp-nav-link">{t('land_nav_safety')}</a>
          </nav>

          <div className="row gap-2">
            <button className="btn btn-subtle btn-sm" onClick={() => setLocale(locale === 'bn' ? 'en' : 'bn')}>
              <Languages size={16} /> {t('lang_toggle')}
            </button>
            <Link href="/login" className="btn btn-ghost btn-sm">{t('nav_login')}</Link>
            <Link href="/register" className="btn btn-primary btn-sm">{t('nav_register')}</Link>
          </div>
        </div>
      </header>

      <main>
        {/* ---- Hero ---- */}
        <section className="container lp-hero">
          <div>
            <span className="lp-eyebrow">
              <Sparkles size={14} /> {t('land_hero_eyebrow')}
            </span>
            <h1>{t('land_hero_title')}</h1>
            <p className="lp-hero-sub">{t('land_hero_sub')}</p>

            <div className="lp-hero-cta">
              <Link href="/register" className="btn btn-primary btn-lg">
                {t('land_cta_primary')} <ArrowRight size={18} />
              </Link>
              <a href="#how" className="btn btn-ghost btn-lg">{t('land_cta_secondary')}</a>
            </div>

            <p className="lp-hero-note">
              <CheckCircle2 size={15} className="txt-leaf" /> {t('land_hero_note')}
            </p>

            <div className="lp-hero-trust">
              <span className="lp-trust-chip"><BadgeCheck size={17} /> {t('land_trust_verified')}</span>
              <span className="lp-trust-chip"><Lock size={17} /> {t('land_trust_private')}</span>
              <span className="lp-trust-chip"><Users size={17} /> {t('land_trust_guardian')}</span>
            </div>
          </div>

          {/* Product mock — shows verification + privacy at a glance */}
          <div className="lp-hero-visual" aria-hidden="true">
            <div className="lp-mock">
              <div className="card">
                <div className="lp-mock-photo">
                  <span className="badge badge-verify lp-mock-verify">
                    <BadgeCheck size={13} /> {t('badge_verified')}
                  </span>
                  <span className="lp-mock-ring"><b>92%</b><i>{t('land_mock_match')}</i></span>
                  <div className="lp-mock-lock">
                    <Lock size={22} />
                    <span className="small">{t('land_mock_lock')}</span>
                  </div>
                </div>
                <div className="lp-mock-body">
                  <div className="row between">
                    <strong>{t('land_mock_name')}</strong>
                    <Heart size={18} className="txt-rose" />
                  </div>
                  <p className="muted small" style={{ margin: '4px 0 0' }}>{t('land_mock_fact')}</p>
                  <div className="lp-mock-bars">
                    <span style={{ width: '88%' }} /><span style={{ width: '64%' }} /><span style={{ width: '76%' }} />
                  </div>
                </div>
              </div>
              <div className="lp-float">
                <span className="lp-float-ico"><ScanFace size={18} /></span>
                <div>
                  <div className="tiny faint">NID</div>
                  <strong className="small">{t('land_float_text')}</strong>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ---- Trust stats ---- */}
        <section className="container" style={{ paddingTop: 8 }}>
          <div className="lp-stats">
            <Stat num={t('land_stat_verified_num')} label={t('land_stat_verified_label')} />
            <Stat num={t('land_stat_matches_num')} label={t('land_stat_matches_label')} />
            <Stat num={t('land_stat_districts_num')} label={t('land_stat_districts_label')} />
            <Stat num={t('land_stat_privacy_num')} label={t('land_stat_privacy_label')} />
          </div>
        </section>

        {/* ---- How it works ---- */}
        <section id="how" className="container lp-section">
          <div className="lp-section-head">
            <span className="lp-eyebrow"><Sparkles size={14} /> {t('land_nav_how')}</span>
            <h2 className="lp-h2">{t('land_how_title')}</h2>
            <p className="muted">{t('land_how_sub')}</p>
          </div>

          <div className="lp-steps">
            <Step n="1" icon={<UserPlus size={18} />} title={t('land_step1_title')} desc={t('land_step1_desc')} />
            <Step n="2" icon={<ScanFace size={18} />} title={t('land_step2_title')} desc={t('land_step2_desc')} />
            <Step n="3" icon={<Search size={18} />} title={t('land_step3_title')} desc={t('land_step3_desc')} />
            <Step n="4" icon={<MessageCircle size={18} />} title={t('land_step4_title')} desc={t('land_step4_desc')} />
          </div>
        </section>

        {/* ---- Why Shondhan ---- */}
        <section id="why" className="container lp-section" style={{ paddingTop: 0 }}>
          <div className="lp-section-head">
            <span className="lp-eyebrow"><Heart size={14} /> {t('land_nav_why')}</span>
            <h2 className="lp-h2">{t('land_why_title')}</h2>
            <p className="muted">{t('land_why_sub')}</p>
          </div>

          <div className="lp-grid-3">
            <Feature icon={<BadgeCheck size={22} />} title={t('land_f1_title')} body={t('land_f1_desc')} />
            <Feature icon={<Eye size={22} />} title={t('land_f2_title')} body={t('land_f2_desc')} />
            <Feature icon={<Users size={22} />} title={t('land_f3_title')} body={t('land_f3_desc')} />
            <Feature icon={<Sparkles size={22} />} title={t('land_f4_title')} body={t('land_f4_desc')} />
            <Feature icon={<Languages size={22} />} title={t('land_f5_title')} body={t('land_f5_desc')} />
            <Feature icon={<ShieldCheck size={22} />} title={t('land_f6_title')} body={t('land_f6_desc')} />
          </div>
        </section>

        {/* ---- Safety band ---- */}
        <section id="safety" className="container lp-section" style={{ paddingTop: 0 }}>
          <div className="lp-band">
            <div className="lp-band-text">
              <span className="lp-eyebrow"><Lock size={14} /> {t('land_nav_safety')}</span>
              <h2 className="lp-h2">{t('land_safety_title')}</h2>
              <p className="muted">{t('land_safety_sub')}</p>
            </div>
            <ul className="lp-safety-list list-reset">
              <SafetyItem icon={<Eye size={18} />} title={t('land_safety1_title')} desc={t('land_safety1_desc')} />
              <SafetyItem icon={<BadgeCheck size={18} />} title={t('land_safety2_title')} desc={t('land_safety2_desc')} />
              <SafetyItem icon={<ShieldCheck size={18} />} title={t('land_safety3_title')} desc={t('land_safety3_desc')} />
            </ul>
          </div>
        </section>

        {/* ---- Stories ---- */}
        <section className="container lp-section" style={{ paddingTop: 0 }}>
          <div className="lp-section-head">
            <h2 className="lp-h2">{t('land_stories_title')}</h2>
            <p className="muted">{t('land_stories_sub')}</p>
          </div>

          <div className="lp-grid-3">
            <Story quote={t('land_t1_quote')} name={t('land_t1_name')} meta={t('land_t1_meta')} />
            <Story quote={t('land_t2_quote')} name={t('land_t2_name')} meta={t('land_t2_meta')} />
            <Story quote={t('land_t3_quote')} name={t('land_t3_name')} meta={t('land_t3_meta')} />
          </div>
        </section>

        {/* ---- Final CTA ---- */}
        <section className="container" style={{ paddingBottom: 56 }}>
          <div className="lp-final">
            <h2>{t('land_final_title')}</h2>
            <p>{t('land_final_sub')}</p>
            <div className="row center gap-3 wrap">
              <Link href="/register" className="btn btn-lg">
                {t('land_cta_primary')} <ArrowRight size={18} />
              </Link>
              <Link href="/login" className="btn btn-ghost btn-lg lp-final-ghost">{t('btn_login')}</Link>
            </div>
          </div>
        </section>
      </main>

      {/* ---- Footer ---- */}
      <footer className="lp-footer">
        <div className="container lp-footer-row">
          <div style={{ maxWidth: '42ch' }}>
            <span className="brand">
              <Heart size={16} fill="currentColor" strokeWidth={0} />
              {t('brand_name', 'Shondhan')}
            </span>
            <p className="muted small mt-2" style={{ margin: '8px 0 0' }}>{t('land_footer_tagline')}</p>
          </div>
          <div className="lp-footer-links">
            <a href="#how" className="link">{t('land_nav_how')}</a>
            <a href="#why" className="link">{t('land_nav_why')}</a>
            <a href="#safety" className="link">{t('land_nav_safety')}</a>
            <Link href="/login" className="link">{t('nav_login')}</Link>
            <Link href="/register" className="link">{t('nav_register')}</Link>
          </div>
        </div>
        <div className="container">
          <p className="tiny faint" style={{ margin: '18px 0 0' }}>
            © {new Date().getFullYear()} {t('brand_name', 'Shondhan')}. {t('land_footer_rights')}
          </p>
        </div>
      </footer>
    </div>
  );
}

function Stat({ num, label }: { num: string; label: string }) {
  return (
    <div className="lp-stat">
      <div className="lp-stat-num">{num}</div>
      <div className="lp-stat-label">{label}</div>
    </div>
  );
}

function Step({ n, icon, title, desc }: { n: string; icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="lp-step">
      <div className="lp-step-head">
        <span className="lp-step-num">{n}</span>
        <span className="lp-step-ico">{icon}</span>
      </div>
      <h3 className="mt-3">{title}</h3>
      <p className="muted small" style={{ margin: 0 }}>{desc}</p>
    </div>
  );
}

function Feature({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <div className="card card-pad dash-interactive-card">
      <span className="state-icon" style={{ width: 44, height: 44 }}>{icon}</span>
      <h3 className="mt-3">{title}</h3>
      <p className="muted small" style={{ margin: 0 }}>{body}</p>
    </div>
  );
}

function SafetyItem({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <li className="lp-safety-item">
      <span className="lp-safety-ico">{icon}</span>
      <div>
        <strong>{title}</strong>
        <p className="muted small" style={{ margin: '2px 0 0' }}>{desc}</p>
      </div>
    </li>
  );
}

function Story({ quote, name, meta }: { quote: string; name: string; meta: string }) {
  const initial = name.trim().charAt(0);
  return (
    <div className="card card-pad lp-quote">
      <Quote size={22} className="lp-quote-mark" />
      <p className="lp-quote-text">{quote}</p>
      <div className="lp-quote-by">
        <span className="avatar" style={{ width: 38, height: 38 }}>{initial}</span>
        <div>
          <strong className="small">{name}</strong>
          <div className="tiny faint">{meta}</div>
        </div>
      </div>
    </div>
  );
}
