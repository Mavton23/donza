'use client';
import * as React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { AlertTriangle, Award, ClipboardList, Bell, BookOpen, CalendarDays, CalendarRange, Compass, GraduationCap, LayoutDashboard, LifeBuoy, Library, LogOut, Menu, MessageCircle, Settings, ShieldCheck, Star, UsersRound, Wallet } from 'lucide-react';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { api } from '@/lib/api/client';
import { useLiveInterval } from '@/lib/realtime/realtime-provider';
import { useAuth } from '@/lib/auth/auth-provider';
import { displayName } from '@/lib/format';
import { cn, ROLE_LABEL } from '@/lib/utils';
import { Logo } from './logo';
import { ThemeToggle } from './theme-toggle';
import { UserMenu } from './user-menu';

function useNav() {
  const { user } = useAuth();
  const teaches = user?.role === 'instructor' || user?.role === 'institution';
  return [
    { href: '/painel', label: 'Painel', icon: LayoutDashboard },
    ...(user?.role === 'admin' ? [{ href: '/admin', label: 'Administração', icon: ShieldCheck }] : []),
    ...(user?.role === 'admin' ? [] : [{ href: '/meus-cursos', label: teaches ? 'Os meus cursos' : 'Meus cursos', icon: BookOpen }]),
    ...(user?.role === 'student' ? [{ href: '/trabalhos', label: 'Trabalhos', icon: ClipboardList }, { href: '/certificados', label: 'Certificados', icon: Award }] : []),
    ...(teaches ? [{ href: '/biblioteca', label: 'Biblioteca', icon: Library }, { href: '/avaliacoes', label: 'Avaliações', icon: Star }, { href: '/ganhos', label: 'Ganhos', icon: Wallet }] : []),
    { href: '/cursos', label: 'Explorar cursos', icon: Compass },
    { href: '/eventos', label: 'Eventos', icon: CalendarDays },
    { href: '/calendario', label: 'Calendário', icon: CalendarRange },
    { href: '/comunidades', label: 'Comunidades', icon: UsersRound },
    { href: '/grupos', label: 'Grupos de estudo', icon: GraduationCap },
    { href: '/mensagens', label: 'Mensagens', icon: MessageCircle, badge: 'msg' as const },
    { href: '/notificacoes', label: 'Notificações', icon: Bell, badge: 'notif' as const },
    { href: '/definicoes', label: 'Definições', icon: Settings },
    { href: '/ajuda', label: 'Ajuda', icon: LifeBuoy },
  ];
}

export function useUnread() {
  const { status } = useAuth(); const liveNotif = useLiveInterval(60_000);
  return useQuery({ queryKey: ['unread'], enabled: status === 'authenticated', refetchInterval: liveNotif, queryFn: () => api.get<{ count: number }>('/notifications/unread-count') });
}

function NavList({ onNavigate }: { onNavigate?: () => void }) {
  const path = usePathname();
  const items = useNav();
  const unread = useUnread().data?.count ?? 0;
  const { status } = useAuth(); const liveMsg = useLiveInterval(15_000);
  const msgUnread = useQuery({ queryKey: ['msg-unread'], enabled: status === 'authenticated', refetchInterval: liveMsg, queryFn: () => api.get<{ unread: number }>('/messages/unread-count') }).data?.unread ?? 0;
  return (
    <nav aria-label="Navegação principal" className="grid gap-1">
      {items.map((i) => {
        const active = path === i.href || (i.href !== '/painel' && i.href !== '/cursos' && path.startsWith(i.href));
        return (
          <Link key={i.href} href={i.href} onClick={onNavigate} aria-current={active ? 'page' : undefined}
            className={cn('flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition', active ? 'bg-sidebar-accent text-white' : 'text-sidebar-muted hover:bg-sidebar-accent/60 hover:text-sidebar-foreground')}>
            <i.icon className="size-[18px]" />{i.label}
            {'badge' in i && i.badge && (i.badge === 'msg' ? msgUnread : unread) > 0 && <span className="ml-auto rounded-full bg-accent px-1.5 py-0.5 text-[11px] leading-none font-bold text-accent-foreground">{(i.badge === 'msg' ? msgUnread : unread) > 99 ? '99+' : i.badge === 'msg' ? msgUnread : unread}</span>}
          </Link>
        );
      })}
    </nav>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const path = usePathname();
  const [open, setOpen] = React.useState(false);
  const unread = useUnread().data?.count ?? 0;
  const { status } = useAuth(); const liveMsg = useLiveInterval(15_000);
  const msgUnread = useQuery({ queryKey: ['msg-unread'], enabled: status === 'authenticated', refetchInterval: liveMsg, queryFn: () => api.get<{ unread: number }>('/messages/unread-count') }).data?.unread ?? 0;
  React.useEffect(() => setOpen(false), [path]);
  if (!user) return null;
  const name = displayName(user);

  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[264px_1fr]">
      <aside className="sticky top-0 hidden h-dvh flex-col bg-sidebar p-4 text-sidebar-foreground lg:flex">
        <div className="px-2 pt-1 pb-6"><Logo href="/painel" light /></div>
        <NavList />
        <div className="mt-auto grid gap-2 border-t border-white/10 pt-4">
          <Link href={`/utilizadores/${user.username}`} className="flex items-center gap-3 rounded-lg p-2 transition hover:bg-sidebar-accent/60">
            <Avatar src={user.avatarUrl} name={name} size={38} />
            <span className="min-w-0"><span className="block truncate text-sm font-semibold text-white">{name}</span><span className="block text-xs text-sidebar-muted">{ROLE_LABEL[user.role]}</span></span>
          </Link>
          <button onClick={async () => { await logout(); router.push('/'); }} className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-sidebar-muted transition hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"><LogOut className="size-[18px]" />Terminar sessão</button>
        </div>
      </aside>

      <div className="min-w-0">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b bg-background/80 px-4 backdrop-blur-xl sm:px-6">
          <Button variant="ghost" size="icon-sm" className="lg:hidden" aria-label="Abrir menu" onClick={() => setOpen(true)}><Menu /></Button>
          <div className="lg:hidden"><Logo href="/painel" /></div>
          <div className="ml-auto flex items-center gap-1.5">
            <Button asChild variant="ghost" size="icon-sm" className="relative" aria-label={`Notificações${unread ? `, ${unread} por ler` : ''}`}>
              <Link href="/notificacoes"><Bell />{unread > 0 && <span className="absolute top-1 right-1 size-2 rounded-full bg-accent ring-2 ring-background" />}</Link>
            </Button>
            <ThemeToggle /><UserMenu />
          </div>
        </header>
        {user.status !== 'approved' && <PendingBanner status={user.status} />}
        <main id="conteudo" className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">{children}</main>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="top-0 left-0 h-dvh max-w-72 translate-x-0 translate-y-0 rounded-none border-0 bg-sidebar p-4 text-sidebar-foreground data-[state=open]:slide-in-from-left" style={{ top: 0, left: 0, transform: 'none' }}>
          <DialogTitle className="sr-only">Menu</DialogTitle>
          <div className="px-2 pt-1 pb-4"><Logo href="/painel" light /></div>
          <NavList onNavigate={() => setOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}

function PendingBanner({ status }: { status: string }) {
  const msg = status === 'pending' ? 'A sua conta está em análise. Receberá um email assim que for aprovada; até lá algumas funções estão limitadas.' : status === 'rejected' ? 'O registo não foi aprovado. Contacte o suporte para mais informações.' : 'A sua conta está suspensa.';
  return <div role="status" className="flex items-start gap-3 border-b border-warning/40 bg-warning/15 px-4 py-3 text-sm sm:px-6"><AlertTriangle className="mt-0.5 size-4 shrink-0 text-accent-foreground dark:text-warning" /><p>{msg}</p></div>;
}
