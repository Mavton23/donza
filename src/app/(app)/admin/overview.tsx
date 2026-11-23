'use client';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import * as React from 'react';
import { Activity, BookOpen, Database, GraduationCap, ShieldCheck, Users } from 'lucide-react';
import { BarChart } from '@/components/admin/common';
import { PageHeader } from '@/components/layout/page-header';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { StatCard } from '@/components/ui/stat-card';
import { api } from '@/lib/api/client';
import { ROLE_LABEL } from '@/lib/utils';

const STATUS_LABEL: Record<string, string> = { pending: 'Pendentes', rejected: 'Recusados', suspended: 'Suspensos' };

interface Stats { users: { total: number; byRole: Record<string, number>; byStatus: Record<string, number>; newLast30Days: number }; courses: { total: number; byStatus: Record<string, number> }; enrollments: { total: number; active: number; completed: number; canceled: number }; events: { total: number }; communities: number; studyGroups: number; certificatesIssued: number; reviews: number; pending: { verifications: number; documents: number; contactRequests: number; testimonials: number } }
interface Chart { period: string; labels: string[]; series: Record<'users' | 'courses' | 'enrollments' | 'events', number[]> }
interface Sys { status: string; uptimeSeconds: number; version: string; environment: string; services: { database: { ok: boolean; latencyMs: number }; mail: { configured: boolean }; storage: { configured: boolean }; scheduler: { enabled: boolean } } }
interface Metrics { process: { rssMb: number; heapUsedMb: number }; eventLoop: { p99Ms: number }; host: { cpus: number; loadAverage: { m1: number } }; database: { sizeMb: number; connections: { total: number; active: number } } }
const SERIES = { users: 'Novos utilizadores', enrollments: 'Matrículas', courses: 'Novos cursos', events: 'Novos eventos' } as const;
const uptime = (s: number) => (s >= 86400 ? `${Math.floor(s / 86400)} d ${Math.floor((s % 86400) / 3600)} h` : s >= 3600 ? `${Math.floor(s / 3600)} h ${Math.floor((s % 3600) / 60)} min` : `${Math.floor(s / 60)} min`);

export function Overview() {
  const [period, setPeriod] = React.useState('30d');
  const stats = useQuery({ queryKey: ['admin-stats'], queryFn: () => api.get<Stats>('/admin/stats') });
  const chart = useQuery({ queryKey: ['admin-chart', period], queryFn: () => api.get<Chart>(`/admin/stats/chart?period=${period}`) });
  const sys = useQuery({ queryKey: ['admin-sys'], queryFn: () => api.get<Sys>('/admin/system-status'), refetchInterval: 30_000 });
  const met = useQuery({ queryKey: ['admin-metrics'], queryFn: () => api.get<Metrics>('/admin/system-metrics'), refetchInterval: 30_000 });
  const s = stats.data;
  const pend = s ? [{ href: '/admin/verificacoes', label: 'Verificações de contas', n: s.pending.verifications }, { href: '/admin/verificacoes', label: 'Documentos por rever', n: s.pending.documents }, { href: '/admin/contactos', label: 'Pedidos de contacto', n: s.pending.contactRequests }, { href: '/admin/testemunhos', label: 'Testemunhos', n: s.pending.testimonials }] : [];
  return (
    <div>
      <PageHeader title="Administração" description="Estado da plataforma num relance." />
      {stats.isLoading || !s ? <Skeleton className="h-24 rounded-2xl" /> : (
        <>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Utilizadores" value={s.users.total} icon={<Users />} hint={`+${s.users.newLast30Days} em 30 dias`} />
            <StatCard label="Cursos" value={s.courses.total} icon={<BookOpen />} hint={`${s.courses.byStatus.published ?? 0} publicados`} />
            <StatCard label="Matrículas" value={s.enrollments.total} icon={<GraduationCap />} hint={`${s.enrollments.completed} concluídas`} />
            <StatCard label="Certificados" value={s.certificatesIssued} icon={<ShieldCheck />} hint={`${s.reviews} avaliações`} />
          </div>
          <section aria-labelledby="pend-h" className="mt-6"><h2 id="pend-h" className="mb-2 font-semibold">Por tratar</h2>
            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{pend.map((p) => <li key={p.label} className="rounded-2xl border bg-card p-4"><p className="text-2xl font-bold tabular-nums">{p.n}</p><p className="text-sm text-muted-foreground">{p.href === '#' ? p.label : <Link href={p.href} className="hover:underline">{p.label}</Link>}</p></li>)}</ul></section>
          <section aria-labelledby="role-h" className="mt-6 rounded-2xl border bg-card p-5"><h2 id="role-h" className="font-semibold">Utilizadores por perfil</h2>
            <ul className="mt-3 flex flex-wrap gap-2">{Object.entries(s.users.byRole).map(([r, n]) => <li key={r}><Badge variant="secondary">{ROLE_LABEL[r] ?? r}: {n}</Badge></li>)}{Object.entries(s.users.byStatus).filter(([k]) => k !== 'approved').map(([k, n]) => <li key={k}><Badge variant="outline">{STATUS_LABEL[k] ?? k}: {n}</Badge></li>)}</ul></section>
        </>)}
      <section aria-labelledby="chart-h" className="mt-6 rounded-2xl border bg-card p-5">
        <div className="flex items-center justify-between"><h2 id="chart-h" className="font-semibold">Actividade</h2>
          <Select value={period} onValueChange={setPeriod}><SelectTrigger className="w-36" aria-label="Período"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="7d">7 dias</SelectItem><SelectItem value="30d">30 dias</SelectItem><SelectItem value="90d">90 dias</SelectItem><SelectItem value="12m">12 meses</SelectItem></SelectContent></Select></div>
        {chart.isLoading || !chart.data ? <Skeleton className="mt-4 h-32" /> : <div className="mt-4 grid gap-6 sm:grid-cols-2">{(Object.keys(SERIES) as (keyof typeof SERIES)[]).map((k) => <div key={k}><p className="mb-1 text-sm"><span className="font-medium">{SERIES[k]}</span> <span className="text-muted-foreground">· {chart.data!.series[k].reduce((a, b) => a + b, 0)}</span></p><BarChart labels={chart.data!.labels} values={chart.data!.series[k]} label={SERIES[k]} /></div>)}</div>}
      </section>
      <section aria-labelledby="sys-h" className="mt-6 rounded-2xl border bg-card p-5">
        <h2 id="sys-h" className="flex items-center gap-2 font-semibold"><Activity className="size-4" /> Sistema {sys.data && <Badge variant={sys.data.status === 'ok' ? 'success' : 'destructive'}>{sys.data.status === 'ok' ? 'Operacional' : sys.data.status}</Badge>}</h2>
        {sys.data && (
          <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
            <div><dt className="text-muted-foreground">Versão / ambiente</dt><dd className="font-medium">{sys.data.version} · {sys.data.environment}</dd></div>
            <div><dt className="text-muted-foreground">Em execução há</dt><dd className="font-medium">{uptime(sys.data.uptimeSeconds)}</dd></div>
            <div><dt className="text-muted-foreground">Base de dados</dt><dd className="font-medium"><span className="inline-flex items-center gap-1"><Database className="size-3.5" />{sys.data.services.database.ok ? `OK · ${sys.data.services.database.latencyMs.toFixed(0)} ms` : 'Indisponível'}</span></dd></div>
            <div><dt className="text-muted-foreground">Serviços</dt><dd className="flex flex-wrap gap-1"><Badge variant={sys.data.services.mail.configured ? 'success' : 'warning'}>Email {sys.data.services.mail.configured ? 'ligado' : 'só em log'}</Badge><Badge variant={sys.data.services.storage.configured ? 'success' : 'warning'}>Armazenamento</Badge><Badge variant={sys.data.services.scheduler.enabled ? 'success' : 'secondary'}>Tarefas {sys.data.services.scheduler.enabled ? 'activas' : 'desligadas'}</Badge></dd></div>
          </dl>)}
        {met.data && <p className="mt-3 text-xs text-muted-foreground">Memória {met.data.process.rssMb.toFixed(0)} MB (heap {met.data.process.heapUsedMb.toFixed(0)} MB) · event loop p99 {met.data.eventLoop.p99Ms.toFixed(0)} ms · carga {met.data.host.loadAverage.m1.toFixed(2)} ({met.data.host.cpus} CPU) · BD {met.data.database.sizeMb} MB, {met.data.database.connections.active}/{met.data.database.connections.total} ligações activas</p>}
      </section>
    </div>
  );
}
