'use client';
import { useQuery } from '@tanstack/react-query';
import * as React from 'react';
import { Pager } from '@/components/admin/common';
import { PageHeader } from '@/components/layout/page-header';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { api } from '@/lib/api/client';
import { formatDate } from '@/lib/utils';

interface Audit { auditId?: string; id?: string; action: string; entityType?: string | null; entityId?: string | null; userId?: string | null; statusCode?: number | null; ip?: string | null; createdAt: string; user?: { username: string } | null; metadata?: unknown }
interface Act { activityId: string; type: string; entityType: string | null; createdAt: string; user: { username: string; fullName: string | null; role: string } | null }
const when = (iso: string) => formatDate(iso, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

export function Logs() {
  return (
    <div>
      <PageHeader title="Registos" description="Auditoria das acções de administração e actividade da plataforma." />
      <Tabs defaultValue="audit"><TabsList><TabsTrigger value="audit">Auditoria</TabsTrigger><TabsTrigger value="activity">Actividade</TabsTrigger></TabsList>
        <TabsContent value="audit"><AuditLog /></TabsContent><TabsContent value="activity"><Activity /></TabsContent></Tabs>
    </div>
  );
}

function AuditLog() {
  const [page, setPage] = React.useState(1); const [action, setAction] = React.useState(''); const [term, setTerm] = React.useState('');
  React.useEffect(() => { const t = setTimeout(() => { setTerm(action.trim()); setPage(1); }, 300); return () => clearTimeout(t); }, [action]);
  const q = useQuery({ queryKey: ['admin-audit', term, page], queryFn: () => api.page<Audit>('/admin/audit-logs', { limit: 20, page, action: term || undefined }) });
  return (
    <div className="mt-4">
      <input value={action} onChange={(e) => setAction(e.target.value)} placeholder="Filtrar por acção (ex.: payout.run)" aria-label="Filtrar por acção" className="h-10 w-full max-w-sm rounded-xl border bg-background px-3 text-sm focus-visible:ring-[3px] focus-visible:ring-ring/40 focus-visible:outline-none" />
      <div className="mt-4 overflow-x-auto rounded-2xl border bg-card">
        {q.isLoading ? <Skeleton className="h-40" /> : !q.data?.data.length ? <EmptyState title="Sem registos" description="As acções de administração ficam aqui." /> : (
          <table className="w-full text-sm"><caption className="sr-only">Registo de auditoria</caption><thead className="border-b text-left text-xs text-muted-foreground"><tr><th scope="col" className="p-3 font-medium">Quando</th><th scope="col" className="p-3 font-medium">Acção</th><th scope="col" className="p-3 font-medium">Quem</th><th scope="col" className="p-3 font-medium">Alvo</th><th scope="col" className="p-3 font-medium">Resultado</th></tr></thead>
            <tbody className="divide-y">{q.data.data.map((a, i) => <tr key={a.auditId ?? a.id ?? i}><td className="whitespace-nowrap p-3 text-muted-foreground">{when(a.createdAt)}</td><td className="p-3 font-mono text-xs">{a.action}</td><td className="p-3">{a.user?.username ?? a.userId?.slice(0, 8) ?? '—'}</td><td className="p-3 text-xs text-muted-foreground">{a.entityType ?? ''} {a.entityId?.slice(0, 8) ?? ''}</td><td className="p-3">{a.statusCode ?? '—'}</td></tr>)}</tbody></table>)}
      </div>
      <Pager page={page} total={q.data?.meta.totalPages ?? 1} onPage={setPage} />
    </div>
  );
}

function Activity() {
  const [page, setPage] = React.useState(1);
  const q = useQuery({ queryKey: ['admin-activity', page], queryFn: () => api.page<Act>('/admin/activities', { limit: 20, page }) });
  return (
    <div className="mt-4">
      <div className="overflow-x-auto rounded-2xl border bg-card">
        {q.isLoading ? <Skeleton className="h-40" /> : !q.data?.data.length ? <EmptyState title="Sem actividade" /> : (
          <table className="w-full text-sm"><caption className="sr-only">Actividade</caption><thead className="border-b text-left text-xs text-muted-foreground"><tr><th scope="col" className="p-3 font-medium">Quando</th><th scope="col" className="p-3 font-medium">Utilizador</th><th scope="col" className="p-3 font-medium">Tipo</th></tr></thead>
            <tbody className="divide-y">{q.data.data.map((a) => <tr key={a.activityId}><td className="whitespace-nowrap p-3 text-muted-foreground">{when(a.createdAt)}</td><td className="p-3">{a.user?.fullName ?? a.user?.username ?? '—'}</td><td className="p-3 font-mono text-xs">{a.type}</td></tr>)}</tbody></table>)}
      </div>
      <Pager page={page} total={q.data?.meta.totalPages ?? 1} onPage={setPage} />
    </div>
  );
}
