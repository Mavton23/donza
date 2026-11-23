'use client';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import * as React from 'react';
import { CalendarDays, MapPin, Plus, Search, Video } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { api } from '@/lib/api/client';
import type { DonzaEvent } from '@/lib/api/types';
import { useAuth } from '@/lib/auth/auth-provider';
import { formatDate, formatPrice } from '@/lib/utils';
import { CURRENCY } from '@/components/events/event-form';

type Tab = 'all' | 'mine' | 'organized';
export const STATUS_LABEL = { scheduled: 'Agendado', live: 'A decorrer', completed: 'Concluído', canceled: 'Cancelado' } as const;

export function EventCard({ e }: { e: DonzaEvent }) {
  const d = new Date(e.startDate); const free = Number(e.price) === 0;
  return (
    <Link href={`/eventos/${e.eventId}`} className="group flex gap-4 rounded-2xl border bg-card p-4 transition hover:-translate-y-0.5 hover:shadow-md focus-visible:ring-[3px] focus-visible:ring-ring/40 focus-visible:outline-none">
      <div className="grid size-16 shrink-0 place-items-center rounded-xl bg-primary/10 text-center text-primary"><div><div className="text-[11px] font-semibold uppercase leading-none">{formatDate(e.startDate, { month: 'short' })}</div><div className="text-2xl font-bold leading-tight">{d.getDate()}</div></div></div>
      <div className="min-w-0 flex-1">
        <h3 className="truncate font-semibold group-hover:underline">{e.title}</h3>
        <p className="mt-0.5 text-sm text-muted-foreground">{formatDate(e.startDate, { weekday: 'short', hour: '2-digit', minute: '2-digit' })}</p>
        <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">{e.isOnline ? <span className="inline-flex items-center gap-1"><Video className="size-3.5" />Online</span> : e.location && <span className="inline-flex items-center gap-1"><MapPin className="size-3.5" />{e.location}</span>}<span>{e.participantsCount} inscrito(s)</span>{e.status !== 'scheduled' && <Badge variant={e.status === 'canceled' ? 'destructive' : 'secondary'}>{STATUS_LABEL[e.status]}</Badge>}</p>
      </div>
      <Badge variant={free ? 'success' : 'default'} className="h-fit">{free ? 'Grátis' : formatPrice(e.price, CURRENCY)}</Badge>
    </Link>
  );
}

export function Events() {
  const { user } = useAuth(); const teaches = user?.role === 'instructor' || user?.role === 'institution' || user?.role === 'admin';
  const [tab, setTab] = React.useState<Tab>('all'); const [type, setType] = React.useState<'' | 'online' | 'in-person'>('');
  const [search, setSearch] = React.useState(''); const [q, setQ] = React.useState('');
  React.useEffect(() => { const t = setTimeout(() => setQ(search.trim()), 300); return () => clearTimeout(t); }, [search]);
  const res = useQuery({ queryKey: ['events', tab, type, q], queryFn: () => tab === 'all' ? api.page<DonzaEvent>('/events', { limit: 30, status: 'scheduled', sort: 'upcoming', type: type || undefined, search: q || undefined }) : api.page<DonzaEvent>(tab === 'mine' ? '/events/me/registrations' : '/events/me/organized', { limit: 30, when: 'upcoming' }) });
  const items = res.data?.data ?? [];
  return (
    <>
      <PageHeader title="Eventos" description="Workshops, aulas abertas e encontros." actions={<div className="flex gap-2"><Button asChild variant="outline"><Link href="/calendario"><CalendarDays />Calendário</Link></Button>{teaches && <Button asChild><Link href="/eventos/novo"><Plus />Novo evento</Link></Button>}</div>} />
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <Tabs value={tab} onValueChange={(v) => setTab(v as Tab)}><TabsList><TabsTrigger value="all">Próximos</TabsTrigger><TabsTrigger value="mine">As minhas inscrições</TabsTrigger>{teaches && <TabsTrigger value="organized">Organizados</TabsTrigger>}</TabsList></Tabs>
        {tab === 'all' && <div className="flex flex-wrap items-center gap-2">
          <Tabs value={type || 'any'} onValueChange={(v) => setType(v === 'any' ? '' : (v as typeof type))}><TabsList><TabsTrigger value="any">Todos</TabsTrigger><TabsTrigger value="online">Online</TabsTrigger><TabsTrigger value="in-person">Presencial</TabsTrigger></TabsList></Tabs>
          <div className="relative w-52"><Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" /><Input className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Procurar…" aria-label="Procurar eventos" /></div></div>}
      </div>
      {res.isLoading ? <div className="grid gap-4 lg:grid-cols-2">{[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-24 rounded-2xl" />)}</div>
        : res.isError ? <EmptyState title="Não foi possível carregar os eventos" action={<Button onClick={() => res.refetch()}>Tentar de novo</Button>} />
        : !items.length ? <EmptyState icon={<CalendarDays />} title={tab === 'mine' ? 'Sem inscrições' : tab === 'organized' ? 'Ainda não organizou eventos' : 'Sem eventos agendados'} description={tab === 'organized' ? 'Crie o seu primeiro evento.' : undefined} />
        : <div className="grid gap-4 lg:grid-cols-2">{items.map((e) => <EventCard key={e.eventId} e={e} />)}</div>}
    </>
  );
}
