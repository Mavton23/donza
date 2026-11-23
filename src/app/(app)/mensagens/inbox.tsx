'use client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import * as React from 'react';
import { ArrowLeft, Inbox as InboxIcon, MessageCircle } from 'lucide-react';
import { toast } from 'sonner';
import { ChatPanel } from '@/components/messages/chat-panel';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ApiError, api } from '@/lib/api/client';
import type { Conversation, MessageRequest } from '@/lib/api/types';
import { useLiveInterval } from '@/lib/realtime/realtime-provider';
import { cn, timeAgo } from '@/lib/utils';

const msg = (e: unknown) => (e instanceof ApiError ? e.message : 'Sem ligação ao servidor.');

export function Inbox() {
  const qc = useQueryClient(); const router = useRouter(); const params = useSearchParams();
  const active = params.get('c');
  const [tab, setTab] = React.useState<'chats' | 'requests'>('chats');
  const liveConv = useLiveInterval(15_000); const liveReq = useLiveInterval(30_000);
  const convs = useQuery({ queryKey: ['conversations'], refetchInterval: liveConv, queryFn: () => api.page<Conversation>('/messages/conversations', { limit: 50 }) });
  const reqs = useQuery({ queryKey: ['message-requests', 'received'], refetchInterval: liveReq, queryFn: () => api.page<MessageRequest>('/messages/requests', { box: 'received', status: 'pending', limit: 50 }) });
  const refreshUnread = () => { qc.invalidateQueries({ queryKey: ['conversations'] }); qc.invalidateQueries({ queryKey: ['msg-unread'] }); };
  const review = useMutation({
    mutationFn: (v: { id: string; approve: boolean }) => api.post<{ conversationId?: string }>(`/messages/requests/${v.id}/${v.approve ? 'approve' : 'reject'}`),
    onSuccess: (r, v) => { qc.invalidateQueries({ queryKey: ['message-requests'] }); refreshUnread(); if (v.approve && r?.conversationId) { setTab('chats'); router.replace(`/mensagens?c=${r.conversationId}`); } else toast.success('Pedido recusado'); },
    onError: (e) => toast.error(msg(e)),
  });
  const list = convs.data?.data ?? []; const pending = reqs.data?.data ?? [];
  const current = list.find((c) => c.conversationId === active);
  return (
    <div className="-mx-4 -my-6 flex h-[calc(100dvh-4rem)] overflow-hidden border-t bg-card sm:mx-0 sm:my-0 sm:rounded-2xl sm:border">
      <aside className={cn('flex w-full flex-col border-r sm:w-80 sm:shrink-0', active && 'hidden sm:flex')}>
        <div className="border-b p-3"><h1 className="mb-2 px-1 text-lg font-bold">Mensagens</h1>
          <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}><TabsList className="w-full"><TabsTrigger value="chats" className="flex-1">Conversas</TabsTrigger><TabsTrigger value="requests" className="flex-1">Pedidos{pending.length > 0 && <Badge className="ml-1 px-1.5">{pending.length}</Badge>}</TabsTrigger></TabsList></Tabs></div>
        <div className="min-h-0 flex-1 overflow-y-auto">
          {tab === 'chats' ? (convs.isLoading ? <div className="grid gap-2 p-3">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-14" />)}</div>
            : !list.length ? <EmptyState className="border-0" icon={<MessageCircle />} title="Sem conversas" description="Abra um perfil e use “Enviar mensagem”." />
            : <ul>{list.map((c) => (
              <li key={c.conversationId}><Link href={`/mensagens?c=${c.conversationId}`} className={cn('flex items-center gap-3 px-3 py-3 transition hover:bg-muted/60 focus-visible:bg-muted focus-visible:outline-none', c.conversationId === active && 'bg-muted')}>
                <Avatar src={c.participant.avatarUrl} name={c.participant.username} size={40} />
                <div className="min-w-0 flex-1"><p className="flex items-center justify-between gap-2"><span className="truncate font-medium">@{c.participant.username}</span>{c.lastMessage && <span className="shrink-0 text-[11px] text-muted-foreground">{timeAgo(c.lastMessage.createdAt)}</span>}</p><p className={cn('truncate text-sm', c.unreadCount ? 'font-medium text-foreground' : 'text-muted-foreground')}>{c.lastMessage?.content ?? 'Anexo'}</p></div>
                {c.unreadCount > 0 && <span className="rounded-full bg-accent px-1.5 py-0.5 text-[11px] leading-none font-bold text-accent-foreground" aria-label={`${c.unreadCount} por ler`}>{c.unreadCount}</span>}
              </Link></li>))}</ul>)
          : !pending.length ? <EmptyState className="border-0" icon={<InboxIcon />} title="Sem pedidos" description="Os pedidos de quem quer falar consigo aparecem aqui." />
            : <ul className="divide-y">{pending.map((r) => (
              <li key={r.requestId} className="grid gap-2 p-3"><div className="flex items-center gap-2"><Avatar src={r.sender.avatarUrl} name={r.sender.username} size={32} /><Link href={`/utilizadores/${r.sender.username}`} className="font-medium hover:underline">@{r.sender.username}</Link></div>
                <p className="text-sm font-medium">{r.subject}</p><p className="line-clamp-3 text-sm text-muted-foreground">{r.message}</p>
                <div className="flex gap-2"><Button size="sm" loading={review.isPending} onClick={() => review.mutate({ id: r.requestId, approve: true })}>Aceitar</Button><Button size="sm" variant="outline" disabled={review.isPending} onClick={() => review.mutate({ id: r.requestId, approve: false })}>Recusar</Button></div></li>))}</ul>}
        </div>
      </aside>
      <section className={cn('min-w-0 flex-1 flex-col', active ? 'flex' : 'hidden sm:flex')}>
        {active ? (<>
          <header className="flex items-center gap-3 border-b p-3"><Button asChild variant="ghost" size="icon-sm" className="sm:hidden"><Link href="/mensagens" aria-label="Voltar às conversas"><ArrowLeft /></Link></Button>
            {current ? <><Avatar src={current.participant.avatarUrl} name={current.participant.username} size={32} /><Link href={`/utilizadores/${current.participant.username}`} className="font-semibold hover:underline">@{current.participant.username}</Link></> : <span className="font-semibold">Conversa</span>}</header>
          <div className="min-h-0 flex-1"><ChatPanel key={active} basePath={`/messages/conversations/${active}/messages`} readPath={`/messages/conversations/${active}/read`} onActivity={refreshUnread} /></div>
        </>) : <div className="grid flex-1 place-items-center p-6"><EmptyState className="border-0" icon={<MessageCircle />} title="Escolha uma conversa" description="As mensagens aparecem aqui." /></div>}
      </section>
    </div>
  );
}
