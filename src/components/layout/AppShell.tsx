'use client';

import React, { ReactNode, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Search,
  Heart,
  Bookmark,
  MessageCircle,
  Bell,
  User as UserIcon,
  Settings,
  LogOut,
  Languages,
} from 'lucide-react';
import { useAuth } from '@/components/providers/AuthProvider';
import { useI18n } from '@/lib/i18n';
import { useDashboard } from '@/features/profile/hooks';
import { Avatar } from '@/components/ui/Avatar';
import { CenterSpinner } from '@/components/ui/feedback';
import type { TranslationKey } from '@/lib/i18n/dictionary';

interface NavItem {
  href: string;
  labelKey: TranslationKey;
  icon: ReactNode;
  badge?: number;
  bottom?: boolean;
}

export function AppShell({ children }: { children: ReactNode }) {
  const { isReady, isAuthenticated, user, signOut } = useAuth();
  const { t, locale, setLocale } = useI18n();
  const pathname = usePathname();
  const router = useRouter();
  const { data: dash } = useDashboard();
  const [menuOpen, setMenuOpen] = useState(false);

  // Client-side guard. Middleware/server guards would need the token in a
  // cookie; this app stores it in localStorage, so the gate is here.
  if (!isReady) return <ShellFrame><CenterSpinner /></ShellFrame>;
  if (!isAuthenticated) {
    if (typeof window !== 'undefined') router.replace('/login');
    return <ShellFrame><CenterSpinner label={'Loading…'} /></ShellFrame>;
  }

  const items: NavItem[] = [
    { href: '/dashboard', labelKey: 'nav_dashboard', icon: <LayoutDashboard size={20} />, bottom: true },
    { href: '/discover', labelKey: 'nav_discover', icon: <Search size={20} />, bottom: true },
    { href: '/interests', labelKey: 'nav_interests', icon: <Heart size={20} />, badge: dash?.new_interests, bottom: true },
    { href: '/messages', labelKey: 'nav_messages', icon: <MessageCircle size={20} />, bottom: true },
    { href: '/shortlist', labelKey: 'nav_shortlist', icon: <Bookmark size={20} /> },
    { href: '/notifications', labelKey: 'nav_notifications', icon: <Bell size={20} />, badge: dash?.unread_notifications },
    { href: '/me', labelKey: 'nav_profile', icon: <UserIcon size={20} />, bottom: true },
    { href: '/settings', labelKey: 'nav_settings', icon: <Settings size={20} /> },
  ];

  const isActive = (href: string) =>
    href === '/me' ? pathname === '/me' || pathname.startsWith('/me/') : pathname.startsWith(href);

  return (
    <ShellFrame
      topbarRight={
        <div className="row gap-2">
          <button
            className="btn btn-subtle btn-sm"
            onClick={() => setLocale(locale === 'bn' ? 'en' : 'bn')}
            title="Switch language"
          >
            <Languages size={16} /> {locale === 'bn' ? 'EN' : 'বাং'}
          </button>
          <Link href="/notifications" className="btn btn-icon btn-subtle" aria-label={t('nav_notifications')} style={{ position: 'relative' }}>
            <Bell size={18} />
            {!!dash?.unread_notifications && <span className="bottom-dot" style={{ top: 6, right: 6, marginRight: 0 }} />}
          </Link>
          <div style={{ position: 'relative' }}>
            <button onClick={() => setMenuOpen((v) => !v)} className="btn btn-icon btn-subtle" aria-label="Account">
              <Avatar name={user?.name} size={30} />
            </button>
            {menuOpen && (
              <>
                <div style={{ position: 'fixed', inset: 0, zIndex: 20 }} onClick={() => setMenuOpen(false)} />
                <div className="card" style={{ position: 'absolute', right: 0, top: 42, minWidth: 190, zIndex: 30, padding: 6 }}>
                  <div className="card-pad" style={{ padding: '10px 12px' }}>
                    <div className="strong" style={{ fontSize: '0.9rem' }}>{user?.name}</div>
                    <div className="tiny faint">{user?.email}</div>
                  </div>
                  <hr className="hairline" style={{ margin: '4px 0' }} />
                  <Link href="/me" className="nav-link" onClick={() => setMenuOpen(false)}><UserIcon size={16} /> {t('nav_profile')}</Link>
                  <Link href="/settings" className="nav-link" onClick={() => setMenuOpen(false)}><Settings size={16} /> {t('nav_settings')}</Link>
                  <button className="nav-link" style={{ width: '100%', background: 'none', border: 0, cursor: 'pointer', textAlign: 'left' }} onClick={() => signOut()}>
                    <LogOut size={16} /> {t('nav_logout')}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      }
    >
      <div className="container app-main">
        <div className="with-sidebar">
          <aside className="sidebar">
            <nav className="stack gap-1">
              {items.map((it) => (
                <Link key={it.href} href={it.href} className={`nav-link ${isActive(it.href) ? 'active' : ''}`}>
                  {it.icon}
                  <span>{t(it.labelKey)}</span>
                  {!!it.badge && <span className="nav-count">{it.badge}</span>}
                </Link>
              ))}
            </nav>
          </aside>
          <div className="grow" style={{ minWidth: 0 }}>{children}</div>
        </div>
      </div>

      {/* Mobile bottom nav */}
      <nav className="bottom-nav">
        {items
          .filter((it) => it.bottom)
          .map((it) => (
            <Link key={it.href} href={it.href} className={`bottom-link ${isActive(it.href) ? 'active' : ''}`}>
              {it.icon}
              <span>{t(it.labelKey)}</span>
              {!!it.badge && <span className="bottom-dot" />}
            </Link>
          ))}
      </nav>
    </ShellFrame>
  );
}

function ShellFrame({
  children,
  topbarRight,
}: {
  children: ReactNode;
  topbarRight?: ReactNode;
}) {
  const { t } = useI18n();
  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="container row between" style={{ width: '100%' }}>
          <Link href="/dashboard" className="brand">
            {t('brand_name', 'Shondhan')}
          </Link>
          {topbarRight}
        </div>
      </header>
      <div className="app-body">{children}</div>
    </div>
  );
}
