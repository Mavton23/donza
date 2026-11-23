'use client';
import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { useAuth } from '@/lib/auth/auth-provider';
import { cn } from '@/lib/utils';
import { Logo } from './logo';
import { ThemeToggle } from './theme-toggle';
import { UserMenu } from './user-menu';

const NAV = [{ href: '/cursos', label: 'Cursos' }, { href: '/#como-funciona', label: 'Como funciona' }, { href: '/#ensinar', label: 'Ensine na Donza' }, { href: '/ajuda', label: 'Ajuda' }];

export function SiteHeader() {
  const { status } = useAuth();
  const path = usePathname();
  const [open, setOpen] = React.useState(false);
  React.useEffect(() => setOpen(false), [path]);
  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/70">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-4 sm:px-6">
        <Logo />
        <nav className="hidden items-center gap-1 md:flex" aria-label="Principal">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} className={cn('rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground', path === n.href && 'text-foreground')}>{n.label}</Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle />
          {status === 'loading' ? <div className="h-9 w-28 animate-pulse rounded-lg bg-muted" /> : status === 'authenticated' ? (
            <>
              <Button asChild variant="secondary" size="sm" className="hidden sm:inline-flex"><Link href="/painel">Ir para o painel</Link></Button>
              <UserMenu />
            </>
          ) : (
            <div className="hidden items-center gap-2 sm:flex">
              <Button asChild variant="ghost" size="sm"><Link href="/entrar">Entrar</Link></Button>
              <Button asChild size="sm"><Link href="/registar">Criar conta</Link></Button>
            </div>
          )}
          <Button variant="ghost" size="icon-sm" className="md:hidden" aria-label="Abrir menu" onClick={() => setOpen(true)}><Menu /></Button>
        </div>
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="top-0 translate-y-0 rounded-t-none sm:max-w-sm" style={{ top: 0, transform: 'translate(-50%, 0)' }}>
          <DialogTitle className="sr-only">Menu</DialogTitle>
          <nav className="grid gap-1 pt-4" aria-label="Móvel">
            {NAV.map((n) => <Link key={n.href} href={n.href} className="rounded-lg px-3 py-3 text-base font-medium hover:bg-muted">{n.label}</Link>)}
            {status === 'anonymous' && <div className="mt-3 grid gap-2"><Button asChild variant="outline"><Link href="/entrar">Entrar</Link></Button><Button asChild><Link href="/registar">Criar conta</Link></Button></div>}
          </nav>
        </DialogContent>
      </Dialog>
    </header>
  );
}
