'use client';
import { useMutation, useQuery } from '@tanstack/react-query';
import * as React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/field';
import { Input, Textarea } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ApiError, api } from '@/lib/api/client';
import type { ContactRequest } from '@/lib/api/types';
import { useAuth } from '@/lib/auth/auth-provider';
import { formatDate } from '@/lib/utils';

export const METHOD_LABEL = { email: 'Email', chat: 'Conversa', callback: 'Que me liguem' } as const;
export const REQ_STATUS: Record<string, { label: string; variant: 'warning' | 'secondary' | 'success' }> = { pending: { label: 'Recebido', variant: 'warning' }, in_progress: { label: 'Em tratamento', variant: 'secondary' }, resolved: { label: 'Resolvido', variant: 'success' } };
const EMPTY = { name: '', email: '', method: 'email', subject: '', message: '', phone: '', preferredTime: '' };

export function ContactForm() {
  const { user, status } = useAuth();
  const [f, setF] = React.useState(EMPTY); const [errs, setErrs] = React.useState<Record<string, string>>({}); const [sent, setSent] = React.useState(false);
  React.useEffect(() => { if (user) setF((s) => ({ ...s, name: s.name || user.fullName || user.username, email: s.email || user.email })); }, [user]);
  const callback = f.method === 'callback';
  const mine = useQuery({ queryKey: ['contact-mine', sent], enabled: status === 'authenticated', queryFn: () => api.page<ContactRequest>('/contact/mine', { limit: 5 }) });
  const send = useMutation({
    mutationFn: () => api.post('/contact', { name: f.name.trim(), email: f.email.trim(), contactMethod: f.method, subject: f.subject.trim() || undefined, message: f.message.trim() || undefined, phone: f.phone.trim() || undefined, preferredTime: callback && f.preferredTime ? new Date(f.preferredTime).toISOString() : undefined }),
    onSuccess: () => { setSent(true); setF({ ...EMPTY, name: f.name, email: f.email }); },
    onError: (e) => { if (e instanceof ApiError && e.fieldErrors) setErrs(e.fieldErrors); else setErrs({ form: e instanceof ApiError ? e.message : 'Sem ligação ao servidor.' }); },
  });
  const set = (k: keyof typeof EMPTY) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => { setF({ ...f, [k]: e.target.value }); setErrs({ ...errs, [k]: '', form: '' }); setSent(false); };
  const submit = (e: React.FormEvent) => {
    e.preventDefault(); const er: Record<string, string> = {};
    if (f.name.trim().length < 2) er.name = 'Indique o seu nome';
    if (!/^\S+@\S+\.\S+$/.test(f.email.trim())) er.email = 'Indique um email válido';
    if (callback) { if (!/^\+?[0-9 ()-]{7,20}$/.test(f.phone.trim())) er.phone = 'Indique um telefone válido'; if (f.message.trim() && f.message.trim().length < 10) er.message = 'Escreva pelo menos 10 caracteres'; }
    else if (f.message.trim().length < 10) er.message = 'Escreva pelo menos 10 caracteres';
    setErrs(er); if (!Object.keys(er).length) send.mutate();
  };
  return (
    <div className="grid gap-8">
      {sent && <div role="status" className="flex items-start gap-3 rounded-2xl border border-primary/30 bg-primary/5 p-4 text-sm"><CheckCircle2 className="mt-0.5 size-5 shrink-0 text-primary" /><div><p className="font-semibold">Pedido enviado</p><p className="text-muted-foreground">Vamos responder para o email indicado.</p></div></div>}
      <form noValidate onSubmit={submit} className="grid gap-4 rounded-2xl border bg-card p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Nome" htmlFor="c-name" error={errs.name}><Input id="c-name" autoComplete="name" value={f.name} onChange={set('name')} aria-invalid={!!errs.name} /></Field>
          <Field label="Email" htmlFor="c-email" error={errs.email}><Input id="c-email" type="email" autoComplete="email" value={f.email} onChange={set('email')} aria-invalid={!!errs.email} /></Field>
        </div>
        <Field label="Como prefere ser contactado?" htmlFor="c-method"><Select value={f.method} onValueChange={(v) => { setF({ ...f, method: v }); setErrs({}); }}><SelectTrigger id="c-method"><SelectValue /></SelectTrigger><SelectContent>{Object.entries(METHOD_LABEL).map(([k, l]) => <SelectItem key={k} value={k}>{l}</SelectItem>)}</SelectContent></Select></Field>
        {callback && <div className="grid gap-4 sm:grid-cols-2"><Field label="Telefone" htmlFor="c-phone" error={errs.phone}><Input id="c-phone" type="tel" autoComplete="tel" value={f.phone} onChange={set('phone')} aria-invalid={!!errs.phone} /></Field><Field label="Melhor hora (opcional)" htmlFor="c-time" error={errs.preferredTime}><Input id="c-time" type="datetime-local" value={f.preferredTime} onChange={set('preferredTime')} /></Field></div>}
        <Field label="Assunto (opcional)" htmlFor="c-subject" error={errs.subject}><Input id="c-subject" maxLength={150} value={f.subject} onChange={set('subject')} /></Field>
        <Field label={callback ? 'Mensagem (opcional)' : 'Mensagem'} htmlFor="c-msg" error={errs.message}><Textarea id="c-msg" rows={5} maxLength={5000} value={f.message} onChange={set('message')} aria-invalid={!!errs.message} /></Field>
        {errs.form && <p role="alert" className="text-sm text-destructive">{errs.form}</p>}
        <Button type="submit" loading={send.isPending} className="justify-self-start">Enviar pedido</Button>
      </form>
      {status === 'authenticated' && !!mine.data?.data.length && (
        <section aria-labelledby="mine-h"><h2 id="mine-h" className="mb-3 font-semibold">Os seus pedidos</h2>
          <ul className="grid gap-2">{mine.data.data.map((r) => <li key={r.requestId} className="flex items-center gap-3 rounded-xl border bg-card p-3 text-sm"><div className="min-w-0 flex-1"><p className="truncate font-medium">{r.subject || r.message?.slice(0, 60) || METHOD_LABEL[r.contactMethod]}</p><p className="text-xs text-muted-foreground">{formatDate(r.createdAt)} · {METHOD_LABEL[r.contactMethod]}</p></div><Badge variant={REQ_STATUS[r.status].variant}>{REQ_STATUS[r.status].label}</Badge></li>)}</ul></section>)}
    </div>
  );
}
