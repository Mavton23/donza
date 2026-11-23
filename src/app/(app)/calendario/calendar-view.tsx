'use client';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import * as React from 'react';
import { ChevronLeft, ChevronRight, Copy, Download, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ApiError, api, downloadBlob } from '@/lib/api/client';
import type { CalendarItem } from '@/lib/api/types';
import { cn, formatDate } from '@/lib/utils';

const DOT = { event: 'bg-primary', assignment: 'bg-destructive', task: 'bg-accent' } as const;
const KIND = { event: 'Evento', assignment: 'Trabalho', task: 'Tarefa' } as const;
const WEEK = ['seg', 'ter', 'qua', 'qui', 'sex', 'sáb', 'dom'];
const key = (d: Date) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
/** Os itens do calendário trazem URLs absolutas do frontend; reduzir a caminho interno e mapear para as rotas em português. */
function internal(url?: string) {
  if (!url) return null;
  try { const p = new URL(url).pathname.replace(/^\/events\//, '/eventos/').replace(/^\/courses\//, '/cursos/'); return p; } catch { return null; }
}

export function CalendarView() {
  const [cursor, setCursor] = React.useState(() => { const d = new Date(); d.setDate(1); d.setHours(0, 0, 0, 0); return d; });
  const [selected, setSelected] = React.useState<Date>(() => new Date());
  const [subOpen, setSubOpen] = React.useState(false);
  const from = new Date(cursor); const to = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1);
  const q = useQuery({ queryKey: ['calendar', cursor.getFullYear(), cursor.getMonth()], queryFn: () => api.get<CalendarItem[]>('/calendar/items', { from: from.toISOString(), to: to.toISOString() }) });
  const byDay = React.useMemo(() => { const m = new Map<string, CalendarItem[]>(); (q.data ?? []).forEach((i) => { const k = key(new Date(i.start)); m.set(k, [...(m.get(k) ?? []), i]); }); return m; }, [q.data]);
  const lead = (cursor.getDay() + 6) % 7; const days = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0).getDate();
  const cells = Array.from({ length: Math.ceil((lead + days) / 7) * 7 }, (_, i) => { const n = i - lead + 1; return n >= 1 && n <= days ? new Date(cursor.getFullYear(), cursor.getMonth(), n) : null; });
  const todayK = key(new Date()); const selItems = (byDay.get(key(selected)) ?? []).sort((a, b) => a.start.localeCompare(b.start));
  const move = (n: number) => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + n, 1));
  async function exportIcs() {
    try { const url = URL.createObjectURL(await downloadBlob('/calendar/export.ics')); const a = document.createElement('a'); a.href = url; a.download = 'donza.ics'; a.click(); setTimeout(() => URL.revokeObjectURL(url), 5000); } catch (e) { toast.error(e instanceof ApiError ? e.message : 'Não foi possível exportar.'); }
  }
  return (
    <>
      <PageHeader title="Calendário" description="Eventos, prazos de trabalhos e tarefas dos seus grupos." actions={<div className="flex gap-2"><Button variant="outline" onClick={exportIcs}><Download />Exportar .ics</Button><Button variant="outline" onClick={() => setSubOpen(true)}>Subscrever</Button></div>} />
      <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
        <section className="rounded-2xl border bg-card p-4" aria-label="Mês">
          <div className="mb-3 flex items-center justify-between"><h2 className="text-lg font-semibold first-letter:uppercase">{formatDate(cursor.toISOString(), { month: 'long', year: 'numeric' })}</h2><div className="flex gap-1"><Button variant="ghost" size="icon-sm" aria-label="Mês anterior" onClick={() => move(-1)}><ChevronLeft /></Button><Button variant="ghost" size="sm" onClick={() => { const d = new Date(); setCursor(new Date(d.getFullYear(), d.getMonth(), 1)); setSelected(d); }}>Hoje</Button><Button variant="ghost" size="icon-sm" aria-label="Mês seguinte" onClick={() => move(1)}><ChevronRight /></Button></div></div>
          <div className="grid grid-cols-7 text-center text-xs font-medium text-muted-foreground">{WEEK.map((w) => <div key={w} className="py-1.5">{w}</div>)}</div>
          <div className="grid grid-cols-7 gap-1">{cells.map((d, i) => { if (!d) return <div key={i} />; const items = byDay.get(key(d)) ?? []; const sel = key(d) === key(selected);
            return <button key={i} type="button" onClick={() => setSelected(d)} aria-pressed={sel} aria-label={`${d.getDate()}${items.length ? `, ${items.length} item(s)` : ''}`}
              className={cn('flex h-16 flex-col items-center justify-start gap-1 rounded-xl border p-1.5 text-sm transition hover:bg-muted focus-visible:ring-[3px] focus-visible:ring-ring/40 focus-visible:outline-none', sel && 'border-primary bg-primary/5', key(d) === todayK && 'font-bold text-primary')}>
              {d.getDate()}<span className="flex gap-0.5">{[...new Set(items.map((x) => x.kind))].map((k) => <span key={k} className={cn('size-1.5 rounded-full', DOT[k])} />)}</span></button>; })}</div>
          <p className="mt-3 flex flex-wrap gap-4 text-xs text-muted-foreground">{(Object.keys(KIND) as (keyof typeof KIND)[]).map((k) => <span key={k} className="inline-flex items-center gap-1.5"><span className={cn('size-2 rounded-full', DOT[k])} />{KIND[k]}</span>)}</p>
        </section>
        <aside className="rounded-2xl border bg-card p-5 h-fit" aria-live="polite"><h2 className="mb-3 font-semibold first-letter:uppercase">{formatDate(selected.toISOString(), { weekday: 'long', day: 'numeric', month: 'long' })}</h2>
          {!selItems.length ? <p className="text-sm text-muted-foreground">Nada neste dia.</p> : <ul className="grid gap-3">{selItems.map((i) => { const href = internal(i.url); const inner = (<><span className={cn('mt-1.5 size-2 shrink-0 rounded-full', DOT[i.kind])} /><span className="min-w-0"><span className="block truncate text-sm font-medium">{i.summary}</span><span className="block text-xs text-muted-foreground">{KIND[i.kind]} · {formatDate(i.start, { hour: '2-digit', minute: '2-digit' })}</span></span></>);
            return <li key={i.uid}>{href && i.kind === 'event' ? <Link href={href} className="flex gap-2 rounded-lg p-1 hover:bg-muted">{inner}</Link> : <div className="flex gap-2 p-1">{inner}</div>}</li>; })}</ul>}
        </aside>
      </div>
      {subOpen && <Subscribe onClose={() => setSubOpen(false)} />}
    </>
  );
}

function Subscribe({ onClose }: { onClose: () => void }) {
  const t = useQuery({ queryKey: ['feed-token'], queryFn: () => api.get<{ url: string }>('/calendar/feed-token') });
  const [rotating, setRotating] = React.useState(false);
  const url = t.data?.url ? t.data.url.replace(/^https?:\/\/[^/]+/, location.origin) : '';
  async function rotate() { setRotating(true); try { await api.post('/calendar/feed-token/rotate'); await t.refetch(); toast.success('Nova ligação gerada. A anterior deixou de funcionar.'); } catch (e) { toast.error(e instanceof ApiError ? e.message : 'Falhou.'); } finally { setRotating(false); } }
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}><DialogContent>
      <DialogHeader><DialogTitle>Subscrever no seu calendário</DialogTitle><DialogDescription>Cole esta ligação no Google Calendar, Outlook ou Apple Calendar (“Adicionar por URL”). Quem tiver a ligação vê os seus eventos: não a partilhe.</DialogDescription></DialogHeader>
      <div className="flex gap-2"><Input readOnly value={url} aria-label="Ligação de subscrição" onFocus={(e) => e.currentTarget.select()} className="font-mono text-xs" /><Button variant="outline" size="icon" aria-label="Copiar ligação" disabled={!url} onClick={() => navigator.clipboard.writeText(url).then(() => toast.success('Copiada'), () => toast.error('Não foi possível copiar.'))}><Copy /></Button></div>
      <Button variant="ghost" size="sm" className="justify-self-start" loading={rotating} onClick={rotate}><RefreshCw />Gerar nova ligação</Button>
    </DialogContent></Dialog>
  );
}
