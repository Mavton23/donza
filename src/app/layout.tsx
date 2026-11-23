import type { Metadata, Viewport } from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import { Providers } from '@/components/providers';
import './globals.css';

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: { default: 'Donza — Aprenda, ensine, cresça', template: '%s · Donza' },
  description: 'Plataforma de ensino online com cursos, comunidades, eventos e certificados reconhecidos.',
  openGraph: { type: 'website', siteName: 'Donza', locale: 'pt_PT' },
};
export const viewport: Viewport = { themeColor: [{ media: '(prefers-color-scheme: light)', color: '#f9f8f4' }, { media: '(prefers-color-scheme: dark)', color: '#0e1a1c' }] };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-PT" suppressHydrationWarning className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className="min-h-dvh font-sans">
        <a href="#conteudo" className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground">Saltar para o conteúdo</a>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
