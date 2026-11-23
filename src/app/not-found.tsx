import Link from 'next/link';
import { BrandArcs } from '@/components/layout/brand-arcs';
import { Logo } from '@/components/layout/logo';
import { Button } from '@/components/ui/button';

/** 404 global (endereços que não existem em nenhum grupo de rotas): marca completa, sem depender do cabeçalho do site. */
export default function GlobalNotFound() {
  return (
    <main id="conteudo" className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-4 text-center">
      <div className="absolute top-6 left-6"><Logo /></div>
      <BrandArcs className="w-64" rings={4} />
      <p className="mt-2 font-display text-7xl font-bold text-primary">404</p>
      <h1 className="mt-2 text-2xl font-bold">Página não encontrada</h1>
      <p className="mt-2 max-w-sm text-muted-foreground">O endereço pode estar errado ou o conteúdo já não existe.</p>
      <div className="mt-6 flex gap-3">
        <Button asChild><Link href="/">Ir para o início</Link></Button>
        <Button asChild variant="outline"><Link href="/cursos">Explorar cursos</Link></Button>
      </div>
    </main>
  );
}
