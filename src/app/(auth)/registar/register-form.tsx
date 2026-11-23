'use client';
import * as React from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { MailCheck } from 'lucide-react';
import { toast } from 'sonner';
import { z } from 'zod';
import { PasswordInput } from '@/components/auth/password-input';
import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { ApiError, api } from '@/lib/api/client';

const schema = z.object({
  email: z.string().trim().min(1, 'Indique o seu email').email('Email inválido'),
  password: z.string().min(8, 'Mínimo de 8 caracteres').max(72, 'Máximo de 72 caracteres'),
  confirm: z.string(),
}).refine((v) => v.password === v.confirm, { path: ['confirm'], message: 'As palavras-passe não coincidem' });
type Values = z.infer<typeof schema>;

function strength(p: string) {
  let s = 0;
  if (p.length >= 8) s++; if (p.length >= 12) s++; if (/[A-Z]/.test(p) && /[a-z]/.test(p)) s++; if (/\d/.test(p)) s++; if (/[^A-Za-z0-9]/.test(p)) s++;
  return Math.min(4, s);
}
const STRENGTH = ['Muito fraca', 'Fraca', 'Razoável', 'Boa', 'Forte'];

export function RegisterForm() {
  const sp = useSearchParams();
  const [sent, setSent] = React.useState<string | null>(null);
  const [error, setError] = React.useState('');
  const [cooldown, setCooldown] = React.useState(0);
  const { register, handleSubmit, watch, setError: setFieldError, formState: { errors, isSubmitting } } = useForm<Values>({ resolver: zodResolver(schema) });
  const pw = watch('password') ?? '';
  const level = strength(pw);

  React.useEffect(() => { if (cooldown <= 0) return; const t = setTimeout(() => setCooldown((c) => c - 1), 1000); return () => clearTimeout(t); }, [cooldown]);

  async function onSubmit(v: Values) {
    setError('');
    try {
      await api.post('/auth/register/start', { email: v.email, password: v.password });
      // guarda a intenção (papel/destino) para o passo 2, que abre noutro separador a partir do email
      try { localStorage.setItem('donza:reg', JSON.stringify({ papel: sp.get('papel'), next: sp.get('next') })); } catch { /* sem storage */ }
      setSent(v.email); setCooldown(60);
    } catch (e) {
      if (e instanceof ApiError && e.fieldErrors.password) setFieldError('password', { message: e.fieldErrors.password });
      else setError(e instanceof ApiError ? e.message : 'Sem ligação ao servidor.');
    }
  }
  async function resend() {
    if (!sent) return;
    try { await api.post('/auth/register/resend', { email: sent }); toast.success('Email reenviado'); setCooldown(60); }
    catch (e) { toast.error(e instanceof ApiError ? e.message : 'Não foi possível reenviar.'); }
  }

  if (sent) {
    return (
      <div className="grid gap-6 text-center">
        <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary"><MailCheck className="size-8" /></div>
        <div><h1 className="text-3xl font-bold">Verifique o seu email</h1><p className="mt-3 text-muted-foreground">Enviámos uma ligação de confirmação para <strong className="text-foreground">{sent}</strong>. Abra-a para continuar o registo.</p></div>
        <Button variant="outline" onClick={resend} disabled={cooldown > 0}>{cooldown > 0 ? `Reenviar em ${cooldown}s` : 'Reenviar email'}</Button>
        <button className="text-sm text-muted-foreground hover:text-foreground" onClick={() => setSent(null)}>Usar outro email</button>
      </div>
    );
  }

  return (
    <div className="grid gap-8">
      <div><h1 className="text-3xl font-bold">Criar a sua conta</h1><p className="mt-2 text-muted-foreground">Passo 1 de 2 · Comece com o seu email.</p></div>
      <form onSubmit={handleSubmit(onSubmit)} className="grid gap-5" noValidate>
        {error && <p role="alert" className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}
        <Field label="Email" htmlFor="email" error={errors.email?.message}><Input id="email" type="email" autoComplete="email" inputMode="email" autoFocus placeholder="nome@exemplo.com" aria-invalid={!!errors.email} {...register('email')} /></Field>
        <Field label="Palavra-passe" htmlFor="password" error={errors.password?.message}>
          <PasswordInput id="password" autoComplete="new-password" aria-invalid={!!errors.password} {...register('password')} />
          {pw && <div className="mt-1 flex items-center gap-2" aria-live="polite"><div className="flex flex-1 gap-1">{[0, 1, 2, 3].map((i) => <span key={i} className={`h-1.5 flex-1 rounded-full ${i < level ? (level < 2 ? 'bg-destructive' : level < 3 ? 'bg-warning' : 'bg-success') : 'bg-muted'}`} />)}</div><span className="text-xs text-muted-foreground">{STRENGTH[level]}</span></div>}
        </Field>
        <Field label="Confirmar palavra-passe" htmlFor="confirm" error={errors.confirm?.message}><PasswordInput id="confirm" autoComplete="new-password" aria-invalid={!!errors.confirm} {...register('confirm')} /></Field>
        <Button type="submit" size="lg" loading={isSubmitting}>Continuar</Button>
        <p className="text-center text-xs text-muted-foreground">Ao continuar, aceita os Termos de Utilização e a Política de Privacidade.</p>
      </form>
      <p className="text-center text-sm text-muted-foreground">Já tem conta? <Link href="/entrar" className="font-semibold text-primary hover:underline">Entrar</Link></p>
    </div>
  );
}
