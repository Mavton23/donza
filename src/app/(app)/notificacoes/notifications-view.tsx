'use client';
import * as React from 'react';
import Link from 'next/link';
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Bell, BellOff, CheckCheck, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { api } from '@/lib/api/client';
import type { Notification } from '@/lib/api/types';
import { cn, timeAgo } from '@/lib/utils';

const LIMIT = 15;
const hrefFor = (n: Notification) => (n.type === 'FOLLOW_REQUEST' ? '/definicoes?tab=privacidade' : n.type === 'FOLLOW_REQUEST_ACCEPTED' || n.type === 'NEW_FOLLOWER' ? undefined : undefined);

export function NotificationsView() {
  const qc = useQueryClient();
  const [tab, setTab] = React.useState<'all' | 'unread'>('all');
  const q = useInfiniteQuery({
    queryKey: ['notifications', tab], initialPageParam: 1,
    queryFn: ({ pageParam }) => api.page<Notification>('/notifications', { unreadOnly: tab === 'unread', page: pageParam, limit: LIMIT }),
    getNextPageParam: (last) => (last.meta.page < last.meta.totalPages ? last.meta.page + 1 : undefined),
  });
  const items = q.data?.pages.flatMap((p) => p.data) ?? [];
  const refresh = () => { qc.invalidateQueries({ queryKey: ['notifications'] }); qc.invalidateQueries({ queryKey: ['unread'] }); };
  const read = useMutation({ mutationFn: (id: string) => api.patch(`/notifications/${id}/read`), onSuccess: refresh });
  const readAll = useMutation({ mutationFn: () => api.patch('/notifications/read-all'), onSuccess: () => { refresh(); toast.success('Todas marcadas como lidas'); } });
  const remove = useMutation({ mutationFn: (id: string) => api.del(`/notifications/${id}`), onSuccess: refresh });

  return (
    <>
      <PageHeader title="Notificações" actions={<Button variant="outline" size="sm" onClick={() => readAll.mutate()} loading={readAll.isPending}><CheckCheck />Marcar tudo como lido</Button>} />
      <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)} className="mb-5"><TabsList><TabsTrigger value="all">Todas</TabsTrigger><TabsTrigger value="unread">Por ler</TabsTrigger></TabsList></Tabs>
      {q.isLoading ? <div className="grid gap-3">{[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-20" />)}</div>
        : q.isError ? <EmptyState icon={<BellOff />} title="Não foi possível carregar" action={<Button onClick={() => q.refetch()}>Tentar de novo</Button>} />
        : !items.length ? <EmptyState icon={<Bell />} title={tab === 'unread' ? 'Está tudo em dia' : 'Sem notificações'} description="Quando houver novidades, aparecem aqui." />
        : (
          <ul className="grid gap-2.5">
            {items.map((n) => {
              const href = hrefFor(n);
              const body = (<><span className={cn('mt-1.5 size-2 shrink-0 rounded-full', n.isRead ? 'bg-transparent' : 'bg-accent')} aria-label={n.isRead ? undefined : 'Por ler'} /><span className="min-w-0 flex-1"><span className="block text-sm font-semibold">{n.title}</span><span className="mt-0.5 block text-sm text-muted-foreground">{n.message}</span><span className="mt-1.5 block text-xs text-muted-foreground/80">{timeAgo(n.createdAt)}</span></span></>);
              return (
                <li key={n.notificationId} className={cn('group flex items-start gap-2 rounded-xl border bg-card p-4 transition', !n.isRead && 'border-primary/25 bg-primary/[0.03]')}>
                  {href ? <Link href={href} onClick={() => !n.isRead && read.mutate(n.notificationId)} className="flex min-w-0 flex-1 items-start gap-3">{body}</Link> : <button className="flex min-w-0 flex-1 items-start gap-3 text-left" onClick={() => !n.isRead && read.mutate(n.notificationId)}>{body}</button>}
                  <Button variant="ghost" size="icon-sm" aria-label="Apagar notificação" className="shrink-0 opacity-0 transition group-focus-within:opacity-100 group-hover:opacity-100 max-sm:opacity-100" onClick={() => remove.mutate(n.notificationId)}><Trash2 /></Button>
                </li>
              );
            })}
          </ul>
        )}
      {q.hasNextPage && <div className="mt-6 text-center"><Button variant="outline" loading={q.isFetchingNextPage} onClick={() => q.fetchNextPage()}>Carregar mais</Button></div>}
    </>
  );
}
