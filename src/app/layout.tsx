import type { Metadata, Viewport } from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import localFont from 'next/font/local';
import { Providers } from '@/components/providers';
import './globals.css';

/** Outfit (OFL): fonte de títulos e do wordmark. Local, sem pedidos a terceiros. */
const outfit = localFont({ src: './fonts/outfit-latin-wght-normal.woff2', variable: '--font-outfit', weight: '100 900', display: 'swap' });

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: { default: 'Donza — Aprenda, ensine, cresça', template: '%s · Donza' },
  applicationName: 'Donza',
  description: 'Aprenda, ensine, cresça. Cursos, comunidades, eventos e certificados verificáveis, em português.',
  openGraph: { type: 'website', siteName: 'Donza', locale: 'pt_PT' },
  twitter: { card: 'summary_large_image' },
};
export const viewport: Viewport = { themeColor: [{ media: '(prefers-color-scheme: light)', color: '#FAF8F3' }, { media: '(prefers-color-scheme: dark)', color: '#0B1B1C' }] };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-PT" suppressHydrationWarning className={`${GeistSans.variable} ${GeistMono.variable} ${outfit.variable}`}>
      <body className="min-h-dvh font-sans">
        <a href="#conteudo" className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground">Saltar para o conteúdo</a>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
