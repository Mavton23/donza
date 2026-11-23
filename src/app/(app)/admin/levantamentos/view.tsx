'use client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as React from 'react';
import { Play } from 'lucide-react';
import { toast } from 'sonner';
import { Pager, ReasonDialog, errMsg } from '@/components/admin/common';
import { PageHeader } from '@/components/layout/page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { api } from '@/lib/api/client';
import { formatDate, formatMoney } from '@/lib/utils';

interface Payout { payoutId: string; amount: number; currency: string; status: string; payoutMethod: string; holdUntil: string | null; paidAt: string | null; failureMessage: string | null; createdAt: string; beneficiary: { userId: string; username: string; fullName: string | null; institutionName: string | null; kycStatus: string } }
interface Kyc { userId: string; username: string; fullName: string | null; institutionName: string | null; role: string; email: string; taxIdentification: string; kycStatus: string; bankName: string | null; bankAccountNumber: string | null; mobileMoneyNumber: string | null; mobileMoneyProvider: string | null }
const ST: Record<string, { label: string; variant: 'success' | 'warning' | 'destructive' | 'secondary' }> = { pending: { label: 'Pendente', variant: 'warning' }, processing: { label: 'A processar', variant: 'warning' }, paid: { label: 'Pago', variant: 'success' }, failed: { label: 'Falhou', variant: 'destructive' }, reversed: { label: 'Revertido', variant: 'secondary' } };
const METHOD: Record<string, string> = { bank_transfer: 'Transferência', mobile_money: 'Dinheiro móvel', digital_wallet: 'Carteira digital', internal_credit: 'Crédito interno' };
const SKIP: Record<string, string> = { KYC_NOT_VERIFIED: 'KYC por verificar', NO_DESTINATION: 'sem destino de pagamento', USER_NOT_APPROVED: 'conta não aprovada', NOT_ELIGIBLE: 'ainda não elegível (retenção em curso)', ALREADY_CLAIMED: 'já em tratamento' };
const KYC: Record<string, string> = { pending: 'Em análise', verified: 'Verificado', rejected: 'Recusado' };
const who = (u: { institutionName: string | null; fullName: string | null; username: string }) => u.institutionName ?? u.fullName ?? u.username;

export function Payouts() {
  return (
    <div>
      <PageHeader title="Levantamentos" description="Pagamentos aos instrutores e instituições, e verificação fiscal (KYC)." />
      <Tabs defaultValue="payouts"><TabsList><TabsTrigger value="payouts">Levantamentos</TabsTrigger><TabsTrigger value="kyc">KYC</TabsTrigger></TabsList>
        <TabsContent value="payouts"><PayoutList /></TabsContent><TabsContent value="kyc"><KycList /></TabsContent></Tabs>
    </div>
  );
}

function PayoutList() {
  const qc = useQueryClient(); const [status, setStatus] = React.useState('all'); const [page, setPage] = React.useState(1); const [fail, setFail] = React.useState<Payout | null>(null);
  const list = useQuery({ queryKey: ['admin-payouts', status, page], queryFn: () => api.page<Payout>('/payouts/admin', { limit: 15, page, status: status === 'all' ? undefined : status }) });
  const refresh = () => qc.invalidateQueries({ queryKey: ['admin-payouts'] });
  const run = useMutation({
    mutationFn: (ids?: string[]) => api.post<{ started: unknown[]; skipped: { reason: string }[] }>('/payouts/admin/run', ids ? { payoutIds: ids } : {}),
    onSuccess: (r) => { if (r.started.length) toast.success(`${r.started.length} levantamento(s) iniciado(s)${r.skipped.length ? `, ${r.skipped.length} ignorado(s)` : ''}`); else toast.error(r.skipped.length ? `Não iniciado: ${[...new Set(r.skipped.map((x) => SKIP[x.reason] ?? x.reason))].join(', ')}` : 'Nada elegível para executar'); refresh(); }, onError: (e) => toast.error(errMsg(e)),
  });
  const paid = useMutation({ mutationFn: (id: string) => api.post(`/payouts/admin/${id}/mark-paid`, {}), onSuccess: () => { toast.success('Marcado como pago'); refresh(); }, onError: (e) => toast.error(errMsg(e)) });
  const retry = useMutation({ mutationFn: (id: string) => api.post(`/payouts/admin/${id}/retry`, {}), onSuccess: () => { toast.success('Reposto como pendente'); refresh(); }, onError: (e) => toast.error(errMsg(e)) });
  const failed = useMutation({ mutationFn: (v: { id: string; reason: string }) => api.post(`/payouts/admin/${v.id}/mark-failed`, { reason: v.reason }), onSuccess: () => { toast.success('Marcado como falhado'); setFail(null); refresh(); }, onError: (e) => toast.error(errMsg(e)) });
  return (
    <div className="mt-4">
      <div className="flex flex-wrap items-center gap-3">
        <Select value={status} onValueChange={(v) => { setStatus(v); setPage(1); }}><SelectTrigger className="w-44" aria-label="Estado"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Todos os estados</SelectItem>{Object.entries(ST).map(([k, s]) => <SelectItem key={k} value={k}>{s.label}</SelectItem>)}</SelectContent></Select>
        <Button className="ml-auto" loading={run.isPending} onClick={() => run.mutate(undefined)}><Play /> Executar elegíveis</Button>
      </div>
      <div className="mt-4 overflow-x-auto rounded-2xl border bg-card">
        {list.isLoading ? <Skeleton className="h-40" /> : !list.data?.data.length ? <EmptyState title="Sem levantamentos" description="Aparecem quando há vendas elegíveis." /> : (
          <table className="w-full text-sm"><caption className="sr-only">Levantamentos</caption>
            <thead className="border-b text-left text-xs text-muted-foreground"><tr><th scope="col" className="p-3 font-medium">Beneficiário</th><th scope="col" className="p-3 font-medium">Valor</th><th scope="col" className="p-3 font-medium">Método</th><th scope="col" className="p-3 font-medium">Estado</th><th scope="col" className="p-3"><span className="sr-only">Acções</span></th></tr></thead>
            <tbody className="divide-y">{list.data.data.map((p) => { const st = ST[p.status] ?? { label: p.status, variant: 'secondary' as const }; return (
              <tr key={p.payoutId}>
                <td className="p-3"><p className="font-medium">{who(p.beneficiary)}</p><p className="text-xs text-muted-foreground">KYC: {KYC[p.beneficiary.kycStatus] ?? p.beneficiary.kycStatus}{p.holdUntil && p.status === 'pending' ? ` · retido até ${formatDate(p.holdUntil)}` : ''}</p></td>
                <td className="whitespace-nowrap p-3 tabular-nums">{formatMoney(p.amount, p.currency)}</td>
                <td className="p-3">{METHOD[p.payoutMethod] ?? p.payoutMethod}</td>
                <td className="p-3"><Badge variant={st.variant}>{st.label}</Badge>{p.failureMessage && <p className="mt-1 max-w-48 truncate text-xs text-destructive" title={p.failureMessage}>{p.failureMessage}</p>}</td>
                <td className="p-3"><div className="flex justify-end gap-1">
                  {p.status === 'pending' && <Button size="sm" variant="outline" loading={run.isPending && run.variables?.[0] === p.payoutId} onClick={() => run.mutate([p.payoutId])}>Executar</Button>}
                  {p.status === 'processing' && <Button size="sm" variant="outline" loading={paid.isPending && paid.variables === p.payoutId} onClick={() => paid.mutate(p.payoutId)}>Marcar pago</Button>}
                  {p.status === 'processing' && <Button size="sm" variant="ghost" onClick={() => setFail(p)}>Falhou</Button>}
                  {p.status === 'failed' && <Button size="sm" variant="outline" loading={retry.isPending && retry.variables === p.payoutId} onClick={() => retry.mutate(p.payoutId)}>Repetir</Button>}
                </div></td>
              </tr>); })}</tbody></table>)}
      </div>
      <Pager page={page} total={list.data?.meta.totalPages ?? 1} onPage={setPage} />
      <ReasonDialog open={!!fail} onOpenChange={(o) => !o && setFail(null)} title="Marcar como falhado" description="O motivo fica registado no levantamento." min={3} confirmLabel="Marcar falhado" destructive pending={failed.isPending} onConfirm={(reason) => fail && failed.mutate({ id: fail.payoutId, reason })} />
    </div>
  );
}

function KycList() {
  const qc = useQueryClient(); const [status, setStatus] = React.useState('pending'); const [page, setPage] = React.useState(1); const [rej, setRej] = React.useState<Kyc | null>(null);
  const list = useQuery({ queryKey: ['admin-kyc', status, page], queryFn: () => api.page<Kyc>('/payouts/admin/kyc', { limit: 15, page, status }) });
  const decide = useMutation({ mutationFn: (v: { id: string; status: 'verified' | 'rejected'; reason?: string }) => api.patch(`/payouts/admin/kyc/${v.id}`, { status: v.status, reason: v.reason }), onSuccess: (_, v) => { toast.success(v.status === 'verified' ? 'KYC verificado' : 'KYC recusado'); setRej(null); qc.invalidateQueries({ queryKey: ['admin-kyc'] }); }, onError: (e) => toast.error(errMsg(e)) });
  return (
    <div className="mt-4">
      <Select value={status} onValueChange={(v) => { setStatus(v); setPage(1); }}><SelectTrigger className="w-44" aria-label="Estado KYC"><SelectValue /></SelectTrigger><SelectContent>{Object.entries(KYC).map(([k, l]) => <SelectItem key={k} value={k}>{l}</SelectItem>)}</SelectContent></Select>
      <div className="mt-4 grid gap-2">
        {list.isLoading ? <Skeleton className="h-24 rounded-2xl" /> : !list.data?.data.length ? <EmptyState title="Sem pedidos" description="Não há dados fiscais neste estado." /> : list.data.data.map((k) => (
          <article key={k.userId} className="flex flex-wrap items-center gap-3 rounded-2xl border bg-card p-4 text-sm">
            <div className="min-w-0 flex-1"><p className="font-medium">{who(k)} <span className="font-normal text-muted-foreground">· {k.email}</span></p>
              <p className="text-muted-foreground">NUIT/ID fiscal: <span className="font-mono text-foreground">{k.taxIdentification}</span></p>
              <p className="text-xs text-muted-foreground">{k.bankName ? `${k.bankName} ${k.bankAccountNumber ?? ''}` : k.mobileMoneyNumber ? `${k.mobileMoneyProvider ?? 'Dinheiro móvel'} ${k.mobileMoneyNumber}` : 'Sem destino de pagamento'}</p></div>
            {k.kycStatus === 'pending' ? <div className="flex gap-1"><Button size="sm" variant="outline" onClick={() => setRej(k)}>Recusar</Button><Button size="sm" loading={decide.isPending && decide.variables?.id === k.userId && decide.variables.status === 'verified'} onClick={() => decide.mutate({ id: k.userId, status: 'verified' })}>Verificar</Button></div> : <Badge variant={k.kycStatus === 'verified' ? 'success' : 'destructive'}>{KYC[k.kycStatus]}</Badge>}
          </article>))}
      </div>
      <Pager page={page} total={list.data?.meta.totalPages ?? 1} onPage={setPage} />
      <ReasonDialog open={!!rej} onOpenChange={(o) => !o && setRej(null)} title="Recusar KYC" description="O motivo fica registado." min={3} confirmLabel="Recusar" destructive pending={decide.isPending} onConfirm={(reason) => rej && decide.mutate({ id: rej.userId, status: 'rejected', reason })} />
    </div>
  );
}
