import type { Metadata } from 'next';
import { Tiro_Bangla, Hind_Siliguri, Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers/Providers';

const tiroBangla = Tiro_Bangla({
  weight: '400',
  subsets: ['bengali'],
  variable: '--font-bn-head-family',
  display: 'swap',
});

const hindSiliguri = Hind_Siliguri({
  weight: ['400', '500', '600', '700'],
  subsets: ['bengali'],
  variable: '--font-bn-body-family',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-latin-family',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Shondhan Matrimony',
  description:
    'A careful, private matrimony registry for Bangladesh — built on trust, verification and family respect.',
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="bn" suppressHydrationWarning>
      <body className={`${tiroBangla.variable} ${hindSiliguri.variable} ${inter.variable}`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
