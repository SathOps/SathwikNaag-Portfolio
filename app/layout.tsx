import type { Metadata, Viewport } from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import '@fontsource/bangers';
import '@fontsource-variable/space-grotesk';
import '@fontsource/instrument-serif';
import '@fontsource/instrument-serif/400-italic.css';
import './globals.css';
import { TransitionProvider } from '@/components/ui/Transition';
import SmoothScroll from '@/components/ui/SmoothScroll';

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : undefined) ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined) ||
  'https://www.sathwiknaag.in';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: 'Sathwik Naag: Two Worlds, One Mind', template: '%s · Sathwik Naag' },
  description:
    'Two worlds, one person. Graphic & brand design for clubs, fests, sports and weddings, plus agentic AI, RAG and full-stack engineering.',
  openGraph: {
    type: 'website',
    url: siteUrl,
    title: 'Sathwik Naag: Two Worlds, One Mind',
    description:
      'Two worlds, one person. Graphic & brand design for clubs, fests, sports and weddings, plus agentic AI, RAG and full-stack engineering.',
    images: [
      {
        url: '/og-image.png',
        width: 800,
        height: 800,
        alt: 'Sathwik Naag Logo',
      },
      {
        url: '/icon.png',
        width: 512,
        height: 512,
        alt: 'Sathwik Naag Logo',
      },
    ],
  },
  twitter: {
    card: 'summary',
    title: 'Sathwik Naag: Two Worlds, One Mind',
    description:
      'Two worlds, one person. Graphic & brand design for clubs, fests, sports and weddings, plus agentic AI, RAG and full-stack engineering.',
    images: ['/og-image.png'],
  },
  icons: {
    icon: [
      { url: '/icon.png', type: 'image/png' },
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
    apple: '/apple-icon.png',
  },
};

export const viewport: Viewport = { themeColor: '#0b0b0b', width: 'device-width', initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`} suppressHydrationWarning>
      <body suppressHydrationWarning>
        <TransitionProvider>
          <SmoothScroll />
          {children}
        </TransitionProvider>
      </body>
    </html>
  );
}
