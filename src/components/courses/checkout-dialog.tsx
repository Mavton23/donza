'use client';
import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { CheckCircle2, CreditCard, Landmark, Loader2, Smartphone, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Field } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { ApiError, api, request } from '@/lib/api/client';
import type { Course } from '@/lib/api/types';
import { cn, formatPrice } from '@/lib/utils';

interface Provider { id: string; name: string; currencies: '*' | string[]; requiresPhone: boolean; manualConfirmation: boolean }
interface Payment { paymentId: string; status: 'pending' | 'processing' | 'succeeded' | 'failed' | 'canceled' | 'refunded'; checkoutUrl: string | null; instructions: { reference?: string; details?: string; message: string; amount?: string; currency?: string } | null; failureMessage: string | null }

const ICON: Record<string, typeof CreditCard> = { stripe: CreditCard, mpesa: Smartphone, emola: Smartphone, bank_transfer: Landmark };

type Target = { kind: 'course' | 'event'; id: string; title: string; price: string | number; currency: string; href: string };
/** Cobra um curso ou um evento pago. `course` mantém-se por compatibilidade; para eventos passa `event`. */
export function CheckoutDialog({ course: c, event: ev, open, onOpenChange }: { course?: Pick<Course, 'courseId' | 'title' | 'slug' | 'price' | 'currency'>; event?: { eventId: string; title: string; price: string | number; currency: string }; open: boolean; onOpenChange: (o: boolean) => void }) {
  const course: Target = ev ? { kind: 'event', id: ev.eventId, title: ev.title, price: ev.price, currency: ev.currency, href: `/eventos/${ev.eventId}` } : { kind: 'course', id: c!.courseId, title: c!.title, price: c!.price, currency: c!.currency, href: `/aprender/${c!.slug}` };
  const router = useRouter();
  const qc = useQueryClient();
  const providers = useQuery({ queryKey: ['payment-providers'], queryFn: () => api.get<Provider[]>('/payments/providers'), enabled: open, staleTime: 300_000 });
  const [provider, setProvider] = React.useState<string | null>(null);
  const [phone, setPhone] = React.useState('');
  const [error, setError] = React.useState('');
  const [payment, setPayment] = React.useState<Payment | null>(null);
  const [busy, setBusy] = React.useState(false);
  const idem = React.useRef<string>(crypto.randomUUID());

  const usable = (p: Provider) => p.currencies === '*' || p.currencies.includes(course.currency);
  const selected = providers.data?.find((p) => p.id === provider);

  // Estado final por polling (o webhook do fornecedor é que confirma o dinheiro).
  const status = useQuery({
    queryKey: ['payment', payment?.paymentId], enabled: !!payment && !payment.checkoutUrl,
    queryFn: () => api.get<Payment>(`/payments/${payment!.paymentId}`),
    refetchInterval: (q) => (['succeeded', 'failed', 'canceled'].includes(q.state.data?.status ?? '') ? false : 3000),
  });
  const final = status.data ?? payment;

  React.useEffect(() => {
    if (final?.status === 'succeeded') {
      qc.invalidateQueries({ queryKey: ['course-viewer'] }); qc.invalidateQueries({ queryKey: ['my-courses'] }); qc.invalidateQueries({ queryKey: ['event'] }); qc.invalidateQueries({ queryKey: ['events'] });
      toast.success(course.kind === 'event' ? 'Pagamento confirmado. Inscrição feita!' : 'Pagamento confirmado. Bom estudo!');
      const t = setTimeout(() => { onOpenChange(false); router.push(course.href); }, 1200);
      return () => clearTimeout(t);
    }
  }, [final?.status]); // eslint-disable-line react-hooks/exhaustive-deps

  const [cancelling, setCancelling] = React.useState(false);
  async function cancelPayment() {
    if (!payment) return;
    setCancelling(true);
    try { await api.post(`/payments/${payment.paymentId}/cancel`); setPayment(null); setProvider(null); idem.current = crypto.randomUUID(); toast.success('Pagamento cancelado'); }
    catch (e) { toast.error(e instanceof ApiError ? e.message : 'Não foi possível cancelar.'); }
    finally { setCancelling(false); }
  }

  async function pay() {
    if (!selected) return;
    if (selected.requiresPhone && !/^(\+?258)?8[2-7]\d{7}$/.test(phone.replace(/\s/g, ''))) { setError('Indique um número moçambicano válido (ex.: 84 123 4567)'); return; }
    setError(''); setBusy(true);
    try {
      const p = await request<Payment>('/payments/process', {
        method: 'POST', headers: { 'Idempotency-Key': idem.current },
        body: { itemType: course.kind, itemId: course.id, provider: selected.id, phone: selected.requiresPhone ? phone.replace(/\s/g, '') : undefined, returnUrl: `${location.origin}${course.href}` },
      });
      setPayment(p);
      if (p.checkoutUrl) location.href = p.checkoutUrl;
    } catch (e) {
      idem.current = crypto.randomUUID(); // um novo pedido precisa de nova chave
      if (e instanceof ApiError && e.code === 'PAYMENT_PENDING') {
        // Já há um pagamento em curso para este curso: retomá-lo em vez de falhar.
        try {
          const list = await api.get<(Payment & { courseId: string | null; eventId?: string | null })[]>('/payments/history', { status: 'pending', itemType: course.kind });
          const existing = list.find((x) => (course.kind === 'event' ? x.eventId : x.courseId) === course.id);
          if (existing) { setPayment(existing); setError(''); return; }
        } catch { /* cai na mensagem de erro */ }
      }
      setError(e instanceof ApiError ? e.message : 'Não foi possível iniciar o pagamento.');
    } finally { setBusy(false); }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!busy) onOpenChange(o); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Finalizar compra</DialogTitle>
          <DialogDescription>{course.title} · <strong className="text-foreground">{formatPrice(course.price, course.currency)}</strong></DialogDescription>
        </DialogHeader>

        {!payment ? (
          <>
            <fieldset className="grid gap-2.5" disabled={busy}>
              <legend className="sr-only">Método de pagamento</legend>
              {providers.isLoading && <div className="h-16 animate-pulse rounded-xl bg-muted" />}
              {providers.isError && <p className="text-sm text-destructive">Não foi possível carregar os métodos de pagamento.</p>}
              {providers.data?.length === 0 && <p className="text-sm text-muted-foreground">Nenhum método de pagamento está disponível de momento.</p>}
              {providers.data?.map((p) => {
                const Icon = ICON[p.id] ?? CreditCard; const ok = usable(p);
                return (
                  <label key={p.id} className={cn('flex cursor-pointer items-center gap-3 rounded-xl border p-3.5 transition has-[:focus-visible]:ring-[3px] has-[:focus-visible]:ring-ring/40', provider === p.id ? 'border-primary bg-primary/5' : 'hover:bg-muted/60', !ok && 'cursor-not-allowed opacity-50')}>
                    <input type="radio" name="provider" className="sr-only" disabled={!ok} checked={provider === p.id} onChange={() => { setProvider(p.id); setError(''); }} />
                    <span className="flex size-10 items-center justify-center rounded-lg bg-secondary text-secondary-foreground"><Icon className="size-5" /></span>
                    <span className="flex-1"><span className="block text-sm font-medium">{p.name}</span><span className="block text-xs text-muted-foreground">{!ok ? `Não aceita ${course.currency}` : p.manualConfirmation ? 'Confirmação manual' : p.requiresPhone ? 'Confirme no telemóvel' : 'Pagamento imediato'}</span></span>
                    <span className={cn('size-4 rounded-full border-2', provider === p.id ? 'border-primary bg-primary shadow-[inset_0_0_0_3px_var(--card)]' : 'border-input')} />
                  </label>
                );
              })}
            </fieldset>
            {selected?.requiresPhone && (
              <Field label={`Número ${selected.name}`} htmlFor="pay-phone" error={error}>
                <Input id="pay-phone" inputMode="tel" autoComplete="tel" placeholder="84 123 4567" value={phone} onChange={(e) => setPhone(e.target.value)} aria-invalid={!!error} />
              </Field>
            )}
            {error && !selected?.requiresPhone && <p role="alert" className="text-sm text-destructive">{error}</p>}
            <DialogFooter><Button onClick={pay} disabled={!selected} loading={busy} size="lg">Pagar {formatPrice(course.price, course.currency)}</Button></DialogFooter>
          </>
        ) : final?.status === 'succeeded' ? (
          <div className="flex flex-col items-center gap-2 py-6 text-center"><CheckCircle2 className="size-12 text-success" /><p className="font-semibold">Pagamento confirmado</p><p className="text-sm text-muted-foreground">A abrir o seu curso…</p></div>
        ) : final?.status === 'failed' || final?.status === 'canceled' ? (
          <div className="grid gap-3 py-2 text-center"><XCircle className="mx-auto size-12 text-destructive" /><p className="font-semibold">O pagamento não foi concluído</p><p className="text-sm text-muted-foreground">{final.failureMessage ?? 'Pode tentar novamente.'}</p><Button onClick={() => { setPayment(null); idem.current = crypto.randomUUID(); }}>Tentar de novo</Button></div>
        ) : final?.instructions ? (
          <div className="grid gap-3 rounded-xl bg-secondary/60 p-4 text-sm">
            <p>{final.instructions.message}</p>
            {final.instructions.reference && (
              <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5">
                <dt className="text-muted-foreground">Valor</dt><dd className="font-semibold">{final.instructions.amount} {final.instructions.currency}</dd>
                <dt className="text-muted-foreground">Referência</dt><dd className="font-mono font-semibold">{final.instructions.reference}</dd>
                {final.instructions.details && <><dt className="text-muted-foreground">Dados</dt><dd>{final.instructions.details}</dd></>}
              </dl>
            )}
            {!final.instructions.reference && <p className="flex items-center gap-2 text-xs text-muted-foreground"><Loader2 className="size-3.5 animate-spin" />A aguardar confirmação — esta janela actualiza-se sozinha.</p>}
            <div className="flex flex-wrap gap-2"><Button variant="outline" onClick={() => onOpenChange(false)}>Fechar</Button><Button variant="ghost" loading={cancelling} onClick={cancelPayment}>Cancelar este pagamento</Button></div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 py-6 text-center"><Loader2 className="size-10 animate-spin text-primary" /><p className="font-semibold">A aguardar confirmação…</p><p className="max-w-xs text-sm text-muted-foreground">{selected?.requiresPhone ? 'Aprove o pagamento no seu telemóvel. Esta janela actualiza-se sozinha.' : 'A processar o pagamento.'}</p></div>
        )}
      </DialogContent>
    </Dialog>
  );
}
