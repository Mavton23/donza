'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/input';
import { useAuth } from '@/lib/auth/auth-provider';
import { ApiError } from '@/lib/api/client';
import { cn } from '@/lib/utils';

export const errMsg = (e: unknown) => (e instanceof ApiError ? e.message : 'Sem ligação ao servidor.');

const TABS = [
  { href: '/admin', label: 'Visão geral' }, { href: '/admin/utilizadores', label: 'Utilizadores' }, { href: '/admin/verificacoes', label: 'Verificações' },
  { href: '/admin/pagamentos', label: 'Pagamentos' }, { href: '/admin/levantamentos', label: 'Levantamentos' }, { href: '/admin/avaliacoes', label: 'Avaliações' }, { href: '/admin/testemunhos', label: 'Testemunhos' }, { href: '/admin/contactos', label: 'Contactos' }, { href: '/admin/ajuda', label: 'Ajuda' }, { href: '/admin/registos', label: 'Registos' },
];

/** Barra de secções + guarda de papel para toda a área de administração. */
export function AdminShell({ children }: { children: React.ReactNode }) {
  const { user } = useAuth(); const router = useRouter(); const path = usePathname();
  const allowed = user?.role === 'admin';
  React.useEffect(() => { if (user && !allowed) router.replace('/painel'); }, [user, allowed, router]);
  if (!allowed) return null;
  return (
    <div>
      <nav aria-label="Administração" className="-mx-1 mb-6 flex gap-1 overflow-x-auto border-b px-1">
        {TABS.map((t) => { const active = t.href === '/admin' ? path === '/admin' : path.startsWith(t.href); return (
          <Link key={t.href} href={t.href} aria-current={active ? 'page' : undefined} className={cn('whitespace-nowrap border-b-2 px-3 py-2.5 text-sm font-medium transition-colors', active ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground')}>{t.label}</Link>); })}
      </nav>
      {children}
    </div>
  );
}

export function Pager({ page, total, onPage }: { page: number; total: number; onPage: (p: number) => void }) {
  if (total <= 1) return null;
  return <div className="mt-4 flex items-center justify-center gap-2"><Button variant="outline" size="sm" disabled={page <= 1} onClick={() => onPage(page - 1)}>Anterior</Button><span className="text-sm text-muted-foreground">{page} / {total}</span><Button variant="outline" size="sm" disabled={page >= total} onClick={() => onPage(page + 1)}>Seguinte</Button></div>;
}

/** Diálogo para acções que exigem um motivo (enviado ao utilizador ou registado). */
export function ReasonDialog({ open, onOpenChange, title, description, confirmLabel, min = 5, optional, destructive, pending, onConfirm }: {
  open: boolean; onOpenChange: (o: boolean) => void; title: string; description?: string; confirmLabel: string; min?: number; optional?: boolean; destructive?: boolean; pending?: boolean; onConfirm: (reason: string) => void;
}) {
  const [text, setText] = React.useState(''); const [err, setErr] = React.useState('');
  React.useEffect(() => { if (open) { setText(''); setErr(''); } }, [open]);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <form noValidate onSubmit={(e) => { e.preventDefault(); const t = text.trim(); if (!optional && t.length < min) { setErr(`Escreva pelo menos ${min} caracteres`); return; } onConfirm(t); }} className="grid gap-4">
          <DialogHeader><DialogTitle>{title}</DialogTitle>{description && <DialogDescription>{description}</DialogDescription>}</DialogHeader>
          <div><Textarea rows={3} maxLength={500} value={text} onChange={(e) => { setText(e.target.value); setErr(''); }} aria-label="Motivo" aria-invalid={!!err} placeholder={optional ? 'Motivo (opcional)' : 'Motivo'} />{err && <p role="alert" className="mt-1 text-xs text-destructive">{err}</p>}</div>
          <DialogFooter><Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button><Button type="submit" variant={destructive ? 'destructive' : 'default'} loading={pending}>{confirmLabel}</Button></DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/** Gráfico de barras simples (SVG) para séries diárias/mensais. */
export function BarChart({ labels, values, label, height = 120 }: { labels: string[]; values: number[]; label: string; height?: number }) {
  const max = Math.max(1, ...values); const w = 100 / Math.max(1, values.length);
  return (
    <figure>
      <svg viewBox={`0 0 100 ${height}`} preserveAspectRatio="none" className="w-full" style={{ height }} role="img" aria-label={`${label}: total ${values.reduce((a, b) => a + b, 0)}`}>
        {values.map((v, i) => <rect key={i} x={i * w + w * 0.15} width={w * 0.7} y={height - (v / max) * (height - 4)} height={(v / max) * (height - 4)} rx={0.6} className="fill-primary/80"><title>{`${labels[i]}: ${v}`}</title></rect>)}
      </svg>
      <figcaption className="mt-1 flex justify-between text-[11px] text-muted-foreground"><span>{labels[0]}</span><span>{labels[labels.length - 1]}</span></figcaption>
    </figure>
  );
}
