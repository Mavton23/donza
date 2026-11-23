'use client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import * as React from 'react';
import { BadgeCheck, Clock, Landmark, Wallet } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '@/components/layout/page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { Field } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { StatCard } from '@/components/ui/stat-card';
import { ApiError, api } from '@/lib/api/client';
import { useAuth } from '@/lib/auth/auth-provider';
import { formatDate, formatPrice } from '@/lib/utils';

interface Payout { payoutId: string; amount: number; currency: string; status: 'pending' | 'processing' | 'paid' | 'failed' | string; payoutMethod: string | null; holdUntil: string | null; paidAt: string | null; createdAt: string; payment?: { course?: { title: string } | null; event?: { title: string } | null } }
interface Dest { destination: ({ type: 'mobile_money'; provider: string; number: string } | { type: 'bank_transfer'; bankName: string; account: string }) | null; kyc: { status: 'pending' | 'verified' | 'rejected' | null; taxIdentification: string | null; verifiedAt: string | null } }
const STATUS: Record<string, { label: string; variant: 'success' | 'secondary' | 'outline' | 'destructive' }> = { pending: { label: 'Pendente', variant: 'secondary' }, processing: { label: 'Em processamento', variant: 'secondary' }, paid: { label: 'Pago', variant: 'success' }, failed: { label: 'Falhou', variant: 'destructive' } };
const KYC: Record<string, string> = { pending: 'Em análise', verified: 'Verificado', rejected: 'Recusado' };
const msg = (e: unknown) => (e instanceof ApiError ? e.message : 'Sem ligação ao servidor.');

export function Earnings() {
  const { user } = useAuth();
  const router = useRouter();
  const allowed = !!user && ['instructor', 'institution'].includes(user.role);
  React.useEffect(() => { if (user && !allowed) router.replace('/painel'); }, [user, allowed, router]);
  const q = useQuery({ queryKey: ['payouts-me'], enabled: allowed, queryFn: () => api.page<Payout>('/payouts/me', { limit: 50 }) });
  const dest = useQuery({ queryKey: ['payout-dest'], enabled: allowed, queryFn: () => api.get<Dest>('/payouts/payout-methods') });
  if (!allowed) return null;
  const raw = q.data;
  const summary = raw?.summary ?? {};
  const currencies = Object.keys(summary);
  return (
    <>
      <PageHeader title="Ganhos" description="O que já recebeu, o que está por receber e para onde enviamos o dinheiro." />
      <div className="grid gap-6">
        {q.isLoading ? <Skeleton className="h-28" /> : currencies.length === 0 ? null : currencies.map((cur) => (
          <div key={cur} className="grid gap-4 sm:grid-cols-3">
            <StatCard label={`Disponível (${cur})`} value={formatPrice(summary[cur]!.availableNow ?? 0, cur)} icon={<Wallet />} />
            <StatCard label="Em espera / processamento" value={formatPrice((summary[cur]!.pending ?? 0) + (summary[cur]!.processing ?? 0), cur)} icon={<Clock />} />
            <StatCard label="Já recebido" value={formatPrice(summary[cur]!.paid ?? 0, cur)} icon={<BadgeCheck />} />
          </div>))}
        <DestinationCard data={dest.data} loading={dest.isLoading} />
        <section aria-labelledby="hist"><h2 id="hist" className="mb-3 text-lg font-semibold">Histórico</h2>
          {q.isLoading ? <Skeleton className="h-40" /> : q.isError ? <EmptyState title="Não foi possível carregar os pagamentos" action={<Button onClick={() => q.refetch()}>Tentar de novo</Button>} />
            : !raw?.data.length ? <EmptyState icon={<Wallet />} title="Ainda sem ganhos" description="Quando alguém comprar um dos seus cursos, o valor aparece aqui." />
            : <div className="overflow-x-auto rounded-2xl border bg-card"><table className="w-full text-sm"><thead className="border-b text-left text-xs text-muted-foreground"><tr><th className="p-3 font-medium">Origem</th><th className="p-3 font-medium">Data</th><th className="p-3 font-medium">Estado</th><th className="p-3 text-right font-medium">Valor</th></tr></thead><tbody className="divide-y">{raw.data.map((p) => { const s = STATUS[p.status] ?? { label: p.status, variant: 'outline' as const }; return (
              <tr key={p.payoutId}><td className="p-3">{p.payment?.course?.title ?? p.payment?.event?.title ?? '—'}</td><td className="p-3 whitespace-nowrap text-muted-foreground">{formatDate(p.paidAt ?? p.createdAt)}{p.status === 'pending' && p.holdUntil && new Date(p.holdUntil) > new Date() ? ` · liberta ${formatDate(p.holdUntil)}` : ''}</td><td className="p-3"><Badge variant={s.variant}>{s.label}</Badge></td><td className="p-3 text-right font-medium tabular-nums">{formatPrice(p.amount, p.currency)}</td></tr>); })}</tbody></table></div>}
        </section>
      </div>
    </>
  );
}

function DestinationCard({ data, loading }: { data?: Dest; loading: boolean }) {
  const qc = useQueryClient();
  const [edit, setEdit] = React.useState(false);
  const [type, setType] = React.useState<'mobile_money' | 'bank_transfer'>('mobile_money');
  const [provider, setProvider] = React.useState('mpesa');
  const [number, setNumber] = React.useState(''); const [bank, setBank] = React.useState(''); const [account, setAccount] = React.useState('');
  const [nuit, setNuit] = React.useState('');
  const save = useMutation({
    mutationFn: () => api.put<{ reverificationRequired: boolean }>('/payouts/payout-methods', type === 'mobile_money' ? { type, provider, number } : { type, bankName: bank, accountNumber: account }),
    onSuccess: (r) => { qc.invalidateQueries({ queryKey: ['payout-dest'] }); toast.success(r?.reverificationRequired ? 'Guardado. A conta terá de ser verificada de novo.' : 'Destino guardado'); setEdit(false); },
    onError: (e) => toast.error(msg(e)),
  });
  const kyc = useMutation({
    mutationFn: () => api.post('/payouts/kyc', { taxIdentification: nuit.trim() }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['payout-dest'] }); toast.success('Dados submetidos para verificação'); setNuit(''); },
    onError: (e) => toast.error(msg(e)),
  });
  if (loading || !data) return <Skeleton className="h-40" />;
  const d = data.destination; const k = data.kyc;
  return (
    <section className="grid gap-5 rounded-2xl border bg-card p-5 md:grid-cols-2" aria-label="Destino dos pagamentos">
      <div>
        <h2 className="flex items-center gap-2 font-semibold"><Landmark className="size-4" /> Onde recebe</h2>
        {!edit ? (<>
          <p className="mt-2 text-sm">{d ? (d.type === 'mobile_money' ? `${d.provider.toUpperCase()} · ${d.number}` : `${d.bankName} · ${d.account}`) : <span className="text-muted-foreground">Ainda não definido. Sem destino não conseguimos pagar.</span>}</p>
          <Button variant="outline" size="sm" className="mt-3" onClick={() => setEdit(true)}>{d ? 'Alterar' : 'Definir destino'}</Button>
        </>) : (
          <form className="mt-3 grid gap-3" onSubmit={(e) => { e.preventDefault(); save.mutate(); }}>
            <Select value={type} onValueChange={(v) => setType(v as typeof type)}><SelectTrigger aria-label="Tipo de destino"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="mobile_money">Dinheiro móvel</SelectItem><SelectItem value="bank_transfer">Transferência bancária</SelectItem></SelectContent></Select>
            {type === 'mobile_money' ? (<>
              <Select value={provider} onValueChange={setProvider}><SelectTrigger aria-label="Operadora"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="mpesa">M-Pesa</SelectItem><SelectItem value="emola">e-Mola</SelectItem><SelectItem value="outro">Outro</SelectItem></SelectContent></Select>
              <Field label="Número" htmlFor="g-num"><Input id="g-num" inputMode="tel" placeholder="84 123 4567" value={number} onChange={(e) => setNumber(e.target.value)} /></Field>
            </>) : (<>
              <Field label="Banco" htmlFor="g-bank"><Input id="g-bank" value={bank} onChange={(e) => setBank(e.target.value)} /></Field>
              <Field label="NIB / IBAN" htmlFor="g-acc"><Input id="g-acc" value={account} onChange={(e) => setAccount(e.target.value)} /></Field>
            </>)}
            <div className="flex gap-2"><Button type="submit" loading={save.isPending}>Guardar</Button><Button type="button" variant="ghost" onClick={() => setEdit(false)}>Cancelar</Button></div>
          </form>)}
      </div>
      <div>
        <h2 className="flex items-center gap-2 font-semibold"><BadgeCheck className="size-4" /> Verificação fiscal {k.status && <Badge variant={k.status === 'verified' ? 'success' : k.status === 'rejected' ? 'destructive' : 'secondary'}>{KYC[k.status]}</Badge>}</h2>
        {k.status === 'verified' ? <p className="mt-2 text-sm text-muted-foreground">NUIT {k.taxIdentification}. Pode receber pagamentos.</p> : (
          <form className="mt-2 grid gap-3" onSubmit={(e) => { e.preventDefault(); kyc.mutate(); }}>
            <p className="text-sm text-muted-foreground">{k.status === 'pending' ? 'Os seus dados estão em análise.' : 'Indique o NUIT para podermos pagar-lhe.'}</p>
            <Field label="NUIT" htmlFor="g-nuit"><Input id="g-nuit" inputMode="numeric" value={nuit} onChange={(e) => setNuit(e.target.value)} /></Field>
            <Button type="submit" className="justify-self-start" disabled={nuit.trim().length < 5} loading={kyc.isPending}>Submeter</Button>
          </form>)}
      </div>
    </section>
  );
}
