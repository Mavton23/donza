import { Check } from 'lucide-react';
import { BrandArcs } from '@/components/layout/brand-arcs';
import { Logo } from '@/components/layout/logo';
import { ThemeToggle } from '@/components/layout/theme-toggle';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-[minmax(420px,0.9fr)_1.1fr]">
      <div className="flex flex-col px-5 py-6 sm:px-10">
        <div className="flex items-center justify-between"><Logo /><ThemeToggle /></div>
        <main id="conteudo" className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-10">{children}</main>
        <p className="text-center text-xs text-muted-foreground">© {new Date().getFullYear()} Donza</p>
      </div>
      <aside className="relative hidden overflow-hidden bg-sidebar p-12 text-sidebar-foreground lg:flex lg:flex-col lg:justify-between" aria-hidden>
        <BrandArcs tone="light" className="absolute inset-x-0 bottom-0 translate-y-[2%]" rings={6} />
        <div className="relative"><Logo href="/" light /></div>
        <div className="relative z-10 max-w-md pb-40">
          <h2 className="text-4xl leading-tight font-bold text-white">O conhecimento que o leva mais longe.</h2>
          <ul className="mt-8 grid gap-4 text-[15px]">
            {['Milhares de aulas em vídeo, áudio e texto', 'Comunidades e grupos de estudo', 'Certificados com código de verificação público', 'Pagamento por M-Pesa, e-Mola ou cartão'].map((t) => (
              <li key={t} className="flex items-center gap-3"><span className="flex size-6 items-center justify-center rounded-full bg-accent/90 text-accent-foreground"><Check className="size-3.5" strokeWidth={3} /></span>{t}</li>
            ))}
          </ul>
        </div>
        <p className="relative z-10 font-display text-sm font-medium tracking-wide text-sidebar-muted">Aprenda. Ensine. Cresça.</p>
      </aside>
    </div>
  );
}
