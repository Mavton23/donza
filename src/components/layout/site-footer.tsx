import Link from 'next/link';
import { Logo } from './logo';

const COLS = [
  { title: 'Aprender', links: [['Todos os cursos', '/cursos'], ['Criar conta', '/registar'], ['Entrar', '/entrar']] },
  { title: 'Ensinar', links: [['Seja instrutor', '/registar?papel=instructor'], ['Para instituições', '/registar?papel=institution']] },
  { title: 'Donza', links: [['Como funciona', '/#como-funciona'], ['Testemunhos', '/testemunhos']] },
  { title: 'Apoio', links: [['Centro de ajuda', '/ajuda'], ['Contacto', '/contacto']] },
] as const;

export function SiteFooter() {
  return (
    <footer className="border-t bg-card">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.4fr_2fr]">
        <div className="grid content-start gap-3">
          <Logo />
          <p className="max-w-xs text-sm text-muted-foreground">Ensino online com cursos, comunidades, eventos e certificados verificáveis.</p>
        </div>
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          {COLS.map((c) => (
            <div key={c.title} className="grid content-start gap-3">
              <h2 className="text-sm font-semibold">{c.title}</h2>
              <ul className="grid gap-2 text-sm text-muted-foreground">{c.links.map(([l, h]) => <li key={l}><Link href={h} className="transition hover:text-foreground">{l}</Link></li>)}</ul>
            </div>
          ))}
        </div>
      </div>
      <div className="border-t"><p className="mx-auto max-w-7xl px-4 py-5 text-xs text-muted-foreground sm:px-6">© {new Date().getFullYear()} Donza. Todos os direitos reservados.</p></div>
    </footer>
  );
}
