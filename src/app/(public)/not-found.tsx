import Link from 'next/link';
import { BrandArcs } from '@/components/layout/brand-arcs';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-4 px-4 py-24 text-center">
      <BrandArcs className="w-56" rings={4} />
      <p className="font-display text-6xl font-bold text-primary">404</p>
      <h1 className="text-2xl font-bold">Página não encontrada</h1>
      <p className="text-muted-foreground">O endereço pode estar errado ou o conteúdo já não existe.</p>
      <Button asChild><Link href="/cursos">Explorar cursos</Link></Button>
    </div>
  );
}
