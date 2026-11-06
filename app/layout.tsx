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

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: { default: 'Sathwik Naag: Design × Tech', template: '%s · Sathwik Naag' },
  description:
    'Two worlds, one person. Graphic & brand design for clubs, fests, sports and weddings, plus agentic AI, RAG and full-stack engineering.',
  openGraph: { type: 'website', title: 'Sathwik Naag: Design × Tech', images: ['/me/photo.webp'] },
  icons: { icon: '/favicon.svg' },
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
