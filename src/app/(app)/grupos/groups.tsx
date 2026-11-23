'use client';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import * as React from 'react';
import { Lock, Plus, Search, Users } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { api } from '@/lib/api/client';
import type { StudyGroup } from '@/lib/api/types';

const PRIV = { public: 'Pública', private: 'Privada', invite_only: 'Só por convite' } as const;

export function Groups() {
  const [tab, setTab] = React.useState<'all' | 'mine'>('mine');
  const [search, setSearch] = React.useState(''); const [q, setQ] = React.useState('');
  React.useEffect(() => { const t = setTimeout(() => setQ(search.trim()), 300); return () => clearTimeout(t); }, [search]);
  const res = useQuery({ queryKey: ['groups', tab, q], queryFn: () => api.page<StudyGroup>('/study-groups', { limit: 30, mine: tab === 'mine' ? true : undefined, search: q || undefined, sort: tab === 'all' ? 'popular' : undefined }) });
  const items = res.data?.data ?? [];
  return (
    <>
      <PageHeader title="Grupos de estudo" description="Estude em equipa: reuniões, tarefas e discussões." actions={<Button asChild><Link href="/grupos/nova"><Plus /> Novo grupo</Link></Button>} />
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}><TabsList><TabsTrigger value="mine">Os meus</TabsTrigger><TabsTrigger value="all">Descobrir</TabsTrigger></TabsList></Tabs>
        <div className="relative w-full max-w-64"><Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" /><Input className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Procurar…" aria-label="Procurar grupos" /></div>
      </div>
      {res.isLoading ? <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-40 rounded-2xl" />)}</div>
        : res.isError ? <EmptyState title="Não foi possível carregar os grupos" action={<Button onClick={() => res.refetch()}>Tentar de novo</Button>} />
        : !items.length ? <EmptyState icon={<Users />} title={tab === 'mine' ? 'Ainda não está em nenhum grupo' : 'Nenhum grupo encontrado'} description="Crie um grupo ou descubra um que lhe interesse." action={<Button asChild><Link href="/grupos/nova">Criar grupo</Link></Button>} />
        : <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{items.map((g) => (
          <Link key={g.groupId} href={`/grupos/${g.groupId}`} className="group flex flex-col gap-3 rounded-2xl border bg-card p-5 transition hover:-translate-y-0.5 hover:shadow-md focus-visible:ring-[3px] focus-visible:ring-ring/40 focus-visible:outline-none">
            <div className="flex items-start justify-between gap-2"><h3 className="font-semibold leading-snug group-hover:underline">{g.name}</h3>{g.privacy !== 'public' && <Lock className="size-4 shrink-0 text-muted-foreground" aria-label={PRIV[g.privacy]} />}</div>
            <p className="line-clamp-2 min-h-10 text-sm text-muted-foreground">{g.description ?? g.goals}</p>
            <div className="mt-auto flex flex-wrap items-center gap-2 text-xs text-muted-foreground"><span className="inline-flex items-center gap-1"><Users className="size-3.5" />{g.membersCount}/{g.maxMembers}</span>{g.community && <span>· {g.community.name}</span>}{g.viewer?.isMember && <Badge variant="success" className="ml-auto">Membro</Badge>}</div>
          </Link>))}</div>}
    </>
  );
}
