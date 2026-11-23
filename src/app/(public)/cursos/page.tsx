import type { Metadata } from 'next';
import { Suspense } from 'react';
import { CatalogClient } from './catalog-client';

export const metadata: Metadata = { title: 'Cursos', description: 'Explore cursos online de instrutores e instituições verificadas.' };

export default function CatalogPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <header className="mb-8"><h1 className="text-3xl font-bold">Explorar cursos</h1><p className="mt-2 text-muted-foreground">Encontre o curso certo para o seu próximo passo.</p></header>
      <Suspense><CatalogClient /></Suspense>
    </div>
  );
}
