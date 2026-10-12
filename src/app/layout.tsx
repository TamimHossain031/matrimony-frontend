import type { Metadata } from 'next';
import {
  Tiro_Bangla,
  Hind_Siliguri,
  Inter,
  Alex_Brush,
  Caveat,
  Cinzel,
  Cinzel_Decorative,
  Cormorant_Garamond,
  Dancing_Script,
  Great_Vibes,
  Montserrat,
  Playfair_Display,
} from 'next/font/google';
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

const alexBrush = Alex_Brush({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-alex-brush',
  display: 'swap',
});

const caveat = Caveat({
  weight: ['500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-caveat',
  display: 'swap',
});

const cinzel = Cinzel({
  weight: ['600', '700', '800'],
  subsets: ['latin'],
  variable: '--font-cinzel',
  display: 'swap',
});

const cinzelDecorative = Cinzel_Decorative({
  weight: '700',
  subsets: ['latin'],
  variable: '--font-cinzel-decorative',
  display: 'swap',
});

const cormorantGaramond = Cormorant_Garamond({
  weight: ['500', '600', '700'],
  style: ['normal', 'italic'],
  subsets: ['latin'],
  variable: '--font-cormorant-garamond',
  display: 'swap',
});

const dancingScript = Dancing_Script({
  weight: ['600', '700'],
  subsets: ['latin'],
  variable: '--font-dancing-script',
  display: 'swap',
});

const greatVibes = Great_Vibes({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-great-vibes',
  display: 'swap',
});

const montserrat = Montserrat({
  weight: ['500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-montserrat',
  display: 'swap',
});

const playfairDisplay = Playfair_Display({
  weight: ['600', '700'],
  style: ['normal', 'italic'],
  subsets: ['latin'],
  variable: '--font-playfair-display',
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
      <body
        className={[
          tiroBangla.variable,
          hindSiliguri.variable,
          inter.variable,
          alexBrush.variable,
          caveat.variable,
          cinzel.variable,
          cinzelDecorative.variable,
          cormorantGaramond.variable,
          dancingScript.variable,
          greatVibes.variable,
          montserrat.variable,
          playfairDisplay.variable,
        ].join(' ')}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
