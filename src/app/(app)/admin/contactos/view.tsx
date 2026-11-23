'use client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as React from 'react';
import { Mail, MessageCircle, Phone } from 'lucide-react';
import { toast } from 'sonner';
import { Pager, errMsg } from '@/components/admin/common';
import { PageHeader } from '@/components/layout/page-header';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { api } from '@/lib/api/client';
import type { ContactRequest } from '@/lib/api/types';
import { formatDate } from '@/lib/utils';
import { METHOD_LABEL, REQ_STATUS } from '@/app/(public)/contacto/contact-form';

const ICON = { email: Mail, chat: MessageCircle, callback: Phone } as const;

export function Contacts() {
  const qc = useQueryClient();
  const [status, setStatus] = React.useState('pending'); const [method, setMethod] = React.useState('all'); const [q, setQ] = React.useState(''); const [term, setTerm] = React.useState(''); const [page, setPage] = React.useState(1);
  React.useEffect(() => { const t = setTimeout(() => { setTerm(q.trim()); setPage(1); }, 300); return () => clearTimeout(t); }, [q]);
  const list = useQuery({ queryKey: ['admin-contacts', status, method, term, page], queryFn: () => api.page<ContactRequest>('/contact', { limit: 10, page, status: status === 'all' ? undefined : status, contactMethod: method === 'all' ? undefined : method, q: term || undefined }) });
  const set = useMutation({ mutationFn: (v: { id: string; status: string }) => api.patch(`/contact/${v.id}/status`, { status: v.status }), onSuccess: () => { toast.success('Estado actualizado'); qc.invalidateQueries({ queryKey: ['admin-contacts'] }); qc.invalidateQueries({ queryKey: ['admin-stats'] }); }, onError: (e) => toast.error(errMsg(e)) });
  return (
    <div>
      <PageHeader title="Pedidos de contacto" description="Mensagens e pedidos de chamada enviados pelo formulário." />
      <div className="flex flex-wrap gap-3">
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Nome, email ou assunto" aria-label="Pesquisar pedidos" className="max-w-xs" />
        <Select value={status} onValueChange={(v) => { setStatus(v); setPage(1); }}><SelectTrigger className="w-44" aria-label="Estado"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Todos os estados</SelectItem>{Object.entries(REQ_STATUS).map(([k, s]) => <SelectItem key={k} value={k}>{s.label}</SelectItem>)}</SelectContent></Select>
        <Select value={method} onValueChange={(v) => { setMethod(v); setPage(1); }}><SelectTrigger className="w-44" aria-label="Via"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Todas as vias</SelectItem>{Object.entries(METHOD_LABEL).map(([k, l]) => <SelectItem key={k} value={k}>{l}</SelectItem>)}</SelectContent></Select>
      </div>
      <div className="mt-4 grid gap-3">
        {list.isLoading ? <Skeleton className="h-28 rounded-2xl" /> : !list.data?.data.length ? <EmptyState title="Sem pedidos" description="Nada corresponde a estes filtros." /> : list.data.data.map((r) => { const Icon = ICON[r.contactMethod]; return (
          <article key={r.requestId} className="rounded-2xl border bg-card p-4">
            <div className="flex flex-wrap items-center gap-2 text-sm"><Icon className="size-4 text-muted-foreground" aria-label={METHOD_LABEL[r.contactMethod]} /><span className="font-medium">{r.name}</span><a href={`mailto:${r.email}`} className="text-muted-foreground hover:underline">{r.email}</a>{r.phone && <a href={`tel:${r.phone}`} className="text-muted-foreground hover:underline">{r.phone}</a>}<span className="ml-auto text-xs text-muted-foreground">{formatDate(r.createdAt, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span></div>
            {r.subject && <p className="mt-2 font-medium">{r.subject}</p>}
            {r.message && <p className="mt-1 whitespace-pre-wrap break-words text-sm">{r.message}</p>}
            {r.preferredTime && <p className="mt-1 text-xs text-muted-foreground">Melhor hora: {formatDate(r.preferredTime, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>}
            <div className="mt-3 flex items-center gap-2"><Badge variant={REQ_STATUS[r.status].variant}>{REQ_STATUS[r.status].label}</Badge>
              <Select value={r.status} onValueChange={(v) => set.mutate({ id: r.requestId, status: v })}><SelectTrigger className="h-8 w-44 text-xs" aria-label={`Alterar estado do pedido de ${r.name}`}><SelectValue /></SelectTrigger><SelectContent>{Object.entries(REQ_STATUS).map(([k, s]) => <SelectItem key={k} value={k}>{s.label}</SelectItem>)}</SelectContent></Select></div>
          </article>); })}
      </div>
      <Pager page={page} total={list.data?.meta.totalPages ?? 1} onPage={setPage} />
    </div>
  );
}
