'use client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as React from 'react';
import { toast } from 'sonner';
import { BarChart, Pager, ReasonDialog, errMsg } from '@/components/admin/common';
import { PageHeader } from '@/components/layout/page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { api } from '@/lib/api/client';
import { formatDate, formatMoney } from '@/lib/utils';

interface Payment { paymentId: string; itemType: 'course' | 'event'; amount: number; currency: string; provider: string; status: string; platformFee: number; externalId: string | null; failureMessage: string | null; paidAt: string | null; createdAt: string; course: { title: string } | null; event: { title: string } | null; user: { userId: string; username: string; email: string } }
interface Report { period: string; labels: string[]; totals: { currency: string; grossRevenue: number; platformFees: number; refunded: number; refundsCount: number; paymentsCount: number; netRevenue: number }[]; byProvider: { provider: string; currency: string; total: number; n: number }[]; paymentsByStatus: Record<string, number>; series: Record<string, number[]> }
export const PAY_STATUS: Record<string, { label: string; variant: 'success' | 'warning' | 'destructive' | 'secondary' | 'outline' }> = { pending: { label: 'Pendente', variant: 'warning' }, processing: { label: 'A processar', variant: 'warning' }, succeeded: { label: 'Concluído', variant: 'success' }, failed: { label: 'Falhou', variant: 'destructive' }, canceled: { label: 'Cancelado', variant: 'secondary' }, refunded: { label: 'Reembolsado', variant: 'outline' } };

export function Payments() {
  const qc = useQueryClient();
  const [period, setPeriod] = React.useState('30d'); const [status, setStatus] = React.useState('all'); const [type, setType] = React.useState('all'); const [page, setPage] = React.useState(1);
  const report = useQuery({ queryKey: ['admin-fin', period], queryFn: () => api.get<Report>(`/payments/reports/financial?period=${period}`) });
  const list = useQuery({ queryKey: ['admin-payments', status, type, page], queryFn: () => api.page<Payment>('/payments/admin', { limit: 15, page, status: status === 'all' ? undefined : status, itemType: type === 'all' ? undefined : type }) });
  const [refund, setRefund] = React.useState<Payment | null>(null);
  const refresh = () => { qc.invalidateQueries({ queryKey: ['admin-payments'] }); qc.invalidateQueries({ queryKey: ['admin-fin'] }); };
  const confirm = useMutation({ mutationFn: (id: string) => api.post(`/payments/${id}/confirm`, {}), onSuccess: () => { toast.success('Pagamento confirmado'); refresh(); }, onError: (e) => toast.error(errMsg(e)) });
  const doRefund = useMutation({ mutationFn: (v: { id: string; reason: string }) => api.post(`/payments/${v.id}/refund`, { reason: v.reason }), onSuccess: () => { toast.success('Pagamento reembolsado'); setRefund(null); refresh(); }, onError: (e) => toast.error(errMsg(e)) });
  const r = report.data;
  return (
    <div>
      <PageHeader title="Pagamentos" description="Receita, comissões e transacções." actions={<Select value={period} onValueChange={setPeriod}><SelectTrigger className="w-36" aria-label="Período"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="7d">7 dias</SelectItem><SelectItem value="30d">30 dias</SelectItem><SelectItem value="90d">90 dias</SelectItem><SelectItem value="12m">12 meses</SelectItem></SelectContent></Select>} />
      {report.isLoading ? <Skeleton className="h-28 rounded-2xl" /> : r && (!r.totals.length ? <p className="rounded-2xl border bg-card p-5 text-sm text-muted-foreground">Sem pagamentos concluídos neste período.</p> : (
        <div className="grid gap-4">{r.totals.map((t) => (
          <section key={t.currency} aria-label={`Resumo em ${t.currency}`} className="rounded-2xl border bg-card p-5">
            <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div><dt className="text-sm text-muted-foreground">Receita bruta</dt><dd className="text-xl font-bold tabular-nums">{formatMoney(t.grossRevenue, t.currency)}</dd></div>
              <div><dt className="text-sm text-muted-foreground">Comissões da plataforma</dt><dd className="text-xl font-bold tabular-nums">{formatMoney(t.platformFees, t.currency)}</dd></div>
              <div><dt className="text-sm text-muted-foreground">Reembolsos ({t.refundsCount})</dt><dd className="text-xl font-bold tabular-nums">{formatMoney(t.refunded, t.currency)}</dd></div>
              <div><dt className="text-sm text-muted-foreground">Receita líquida</dt><dd className="text-xl font-bold tabular-nums">{formatMoney(t.netRevenue, t.currency)}</dd></div>
            </dl>
            {r.series[t.currency] && <div className="mt-4"><BarChart labels={r.labels} values={r.series[t.currency]} label={`Receita diária em ${t.currency}`} /></div>}
          </section>))}</div>))}
      <div className="mt-6 flex flex-wrap gap-3">
        <Select value={status} onValueChange={(v) => { setStatus(v); setPage(1); }}><SelectTrigger className="w-44" aria-label="Estado"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Todos os estados</SelectItem>{Object.entries(PAY_STATUS).map(([k, s]) => <SelectItem key={k} value={k}>{s.label}</SelectItem>)}</SelectContent></Select>
        <Select value={type} onValueChange={(v) => { setType(v); setPage(1); }}><SelectTrigger className="w-40" aria-label="Tipo"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Cursos e eventos</SelectItem><SelectItem value="course">Cursos</SelectItem><SelectItem value="event">Eventos</SelectItem></SelectContent></Select>
      </div>
      <div className="mt-4 overflow-x-auto rounded-2xl border bg-card">
        {list.isLoading ? <Skeleton className="h-40" /> : !list.data?.data.length ? <EmptyState title="Sem pagamentos" description="Ainda não há transacções com estes filtros." /> : (
          <table className="w-full text-sm"><caption className="sr-only">Pagamentos</caption>
            <thead className="border-b text-left text-xs text-muted-foreground"><tr><th scope="col" className="p-3 font-medium">Data</th><th scope="col" className="p-3 font-medium">Item</th><th scope="col" className="p-3 font-medium">Utilizador</th><th scope="col" className="p-3 font-medium">Valor</th><th scope="col" className="p-3 font-medium">Estado</th><th scope="col" className="p-3"><span className="sr-only">Acções</span></th></tr></thead>
            <tbody className="divide-y">{list.data.data.map((p) => { const st = PAY_STATUS[p.status] ?? { label: p.status, variant: 'secondary' as const }; return (
              <tr key={p.paymentId}>
                <td className="whitespace-nowrap p-3 text-muted-foreground">{formatDate(p.createdAt)}</td>
                <td className="max-w-56 p-3"><p className="truncate font-medium">{p.course?.title ?? p.event?.title ?? '—'}</p><p className="text-xs text-muted-foreground">{p.itemType === 'course' ? 'Curso' : 'Evento'} · {p.provider}</p></td>
                <td className="p-3"><p>{p.user.username}</p><p className="text-xs text-muted-foreground">{p.user.email}</p></td>
                <td className="whitespace-nowrap p-3 tabular-nums">{formatMoney(p.amount, p.currency)}</td>
                <td className="p-3"><Badge variant={st.variant}>{st.label}</Badge>{p.failureMessage && <p className="mt-1 max-w-48 truncate text-xs text-destructive" title={p.failureMessage}>{p.failureMessage}</p>}</td>
                <td className="p-3"><div className="flex justify-end gap-1">
                  {(p.status === 'pending' || p.status === 'processing') && p.provider === 'bank_transfer' && <Button size="sm" variant="outline" loading={confirm.isPending && confirm.variables === p.paymentId} onClick={() => confirm.mutate(p.paymentId)}>Confirmar</Button>}
                  {p.status === 'succeeded' && <Button size="sm" variant="ghost" onClick={() => setRefund(p)}>Reembolsar</Button>}
                </div></td>
              </tr>); })}</tbody></table>)}
      </div>
      <Pager page={page} total={list.data?.meta.totalPages ?? 1} onPage={setPage} />
      <ReasonDialog open={!!refund} onOpenChange={(o) => !o && setRefund(null)} title="Reembolsar pagamento" description={refund ? `${formatMoney(refund.amount, refund.currency)} a ${refund.user.username}. O acesso ao conteúdo é revogado.` : undefined} min={3} confirmLabel="Reembolsar" destructive pending={doRefund.isPending} onConfirm={(reason) => refund && doRefund.mutate({ id: refund.paymentId, reason })} />
    </div>
  );
}
