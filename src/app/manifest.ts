import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Donza',
    short_name: 'Donza',
    description: 'Aprenda, ensine, cresça. Cursos, comunidades, eventos e certificados verificáveis.',
    lang: 'pt-PT',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    background_color: '#FAF8F3',
    theme_color: '#0E6B63',
    categories: ['education'],
    icons: [
      { src: '/brand/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/brand/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/brand/icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
}
