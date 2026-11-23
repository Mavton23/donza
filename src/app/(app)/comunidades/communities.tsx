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
import type { Community } from '@/lib/api/types';

export function CommunityCard({ c }: { c: Community }) {
  return (
    <Link href={`/comunidades/${c.slug}`} className="group flex flex-col gap-3 rounded-2xl border bg-card p-5 transition hover:-translate-y-0.5 hover:shadow-md focus-visible:ring-[3px] focus-visible:ring-ring/40 focus-visible:outline-none">
      <div className="flex items-start gap-3">
        <div className="grid size-11 shrink-0 place-items-center overflow-hidden rounded-xl bg-gradient-to-br from-primary/20 to-accent/30 text-lg font-bold text-primary">{c.thumbnailImage ? <img src={c.thumbnailImage} alt="" className="size-full object-cover" /> : c.name.slice(0, 1).toUpperCase()}</div>
        <div className="min-w-0"><h3 className="truncate font-semibold group-hover:underline">{c.name}</h3><p className="text-xs text-muted-foreground">por @{c.creator.username}</p></div>
        {!c.isPublic && <Lock className="ml-auto size-4 shrink-0 text-muted-foreground" aria-label="Privada" />}
      </div>
      <p className="line-clamp-2 min-h-10 text-sm text-muted-foreground">{c.shortDescription ?? c.description}</p>
      <div className="mt-auto flex flex-wrap items-center gap-2 text-xs text-muted-foreground"><span className="inline-flex items-center gap-1"><Users className="size-3.5" />{c.stats.members}</span><span>· {c.stats.posts} tópicos</span>{c.viewer.isMember && <Badge variant="success" className="ml-auto">Membro</Badge>}{c.viewer.status === 'pending' && <Badge variant="secondary" className="ml-auto">Pedido enviado</Badge>}</div>
    </Link>
  );
}

export function Communities() {
  const [tab, setTab] = React.useState<'all' | 'mine'>('all');
  const [search, setSearch] = React.useState('');
  const [debounced, setDebounced] = React.useState('');
  React.useEffect(() => { const t = setTimeout(() => setDebounced(search.trim()), 300); return () => clearTimeout(t); }, [search]);
  const q = useQuery({ queryKey: ['communities', tab, debounced], queryFn: () => api.page<Community>(tab === 'mine' ? '/communities/me' : '/communities', { limit: 30, search: debounced || undefined, sort: tab === 'all' ? 'popular' : undefined }) });
  const items = q.data?.data ?? [];
  return (
    <>
      <PageHeader title="Comunidades" description="Perguntas, recursos e conversa com quem estuda o mesmo que você." actions={<Button asChild><Link href="/comunidades/nova"><Plus /> Nova comunidade</Link></Button>} />
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}><TabsList><TabsTrigger value="all">Descobrir</TabsTrigger><TabsTrigger value="mine">As minhas</TabsTrigger></TabsList></Tabs>
        <div className="relative w-full max-w-64"><Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" /><Input className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Procurar…" aria-label="Procurar comunidades" /></div>
      </div>
      {q.isLoading ? <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-40 rounded-2xl" />)}</div>
        : q.isError ? <EmptyState title="Não foi possível carregar as comunidades" action={<Button onClick={() => q.refetch()}>Tentar de novo</Button>} />
        : !items.length ? <EmptyState icon={<Users />} title={tab === 'mine' ? 'Ainda não pertence a nenhuma comunidade' : 'Nenhuma comunidade encontrada'} description={tab === 'mine' ? 'Descubra uma que lhe interesse ou crie a sua.' : undefined} action={<Button asChild><Link href="/comunidades/nova">Criar comunidade</Link></Button>} />
        : <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{items.map((c) => <CommunityCard key={c.communityId} c={c} />)}</div>}
    </>
  );
}
