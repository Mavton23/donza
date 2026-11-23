'use client';
import * as React from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { PasswordInput } from '@/components/auth/password-input';
import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { ApiError } from '@/lib/api/client';
import { useAuth } from '@/lib/auth/auth-provider';
import { safeNext } from '@/lib/safe-next';

const schema = z.object({ email: z.string().trim().min(1, 'Indique o seu email').email('Email inválido'), password: z.string().min(1, 'Indique a palavra-passe') });
type Values = z.infer<typeof schema>;

export function LoginForm() {
  const router = useRouter();
  const sp = useSearchParams();
  const { login, status } = useAuth();
  const [error, setError] = React.useState('');
  const next = safeNext(sp.get('next'));
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<Values>({ resolver: zodResolver(schema) });

  React.useEffect(() => { if (status === 'authenticated') router.replace(next); }, [status, next, router]);

  async function onSubmit(v: Values) {
    setError('');
    try { await login(v.email, v.password); router.replace(next); }
    catch (e) { setError(e instanceof ApiError ? (e.status === 429 ? 'Demasiadas tentativas. Aguarde um minuto.' : e.message) : 'Sem ligação ao servidor.'); }
  }

  return (
    <div className="grid gap-8">
      <div><h1 className="text-3xl font-bold">Bem-vindo de volta</h1><p className="mt-2 text-muted-foreground">Entre para continuar a aprender.</p></div>
      {sp.get('reset') && <p role="status" className="rounded-xl bg-success/10 p-3 text-sm text-success">Palavra-passe alterada. Já pode entrar.</p>}
      <form onSubmit={handleSubmit(onSubmit)} className="grid gap-5" noValidate>
        {error && <p role="alert" className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}
        <Field label="Email" htmlFor="email" error={errors.email?.message}>
          <Input id="email" type="email" autoComplete="email" inputMode="email" autoFocus placeholder="nome@exemplo.com" aria-invalid={!!errors.email} {...register('email')} />
        </Field>
        <Field label="Palavra-passe" htmlFor="password" error={errors.password?.message}>
          <PasswordInput id="password" autoComplete="current-password" aria-invalid={!!errors.password} {...register('password')} />
        </Field>
        <div className="-mt-2 text-right"><Link href="/recuperar" className="text-sm font-medium text-primary hover:underline">Esqueceu-se da palavra-passe?</Link></div>
        <Button type="submit" size="lg" loading={isSubmitting}>Entrar</Button>
      </form>
      <p className="text-center text-sm text-muted-foreground">Novo na Donza? <Link href={`/registar${sp.get('next') ? `?next=${encodeURIComponent(sp.get('next')!)}` : ''}`} className="font-semibold text-primary hover:underline">Criar conta</Link></p>
    </div>
  );
}
