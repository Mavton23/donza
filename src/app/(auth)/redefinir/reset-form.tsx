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
import { ApiError, api } from '@/lib/api/client';

const schema = z.object({ password: z.string().min(8, 'Mínimo de 8 caracteres').max(72), confirm: z.string() }).refine((v) => v.password === v.confirm, { path: ['confirm'], message: 'As palavras-passe não coincidem' });

export function ResetForm() {
  const router = useRouter();
  const token = useSearchParams().get('token');
  const [error, setError] = React.useState('');
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<z.infer<typeof schema>>({ resolver: zodResolver(schema) });
  if (!token) return <div className="grid gap-4 text-center"><h1 className="text-2xl font-bold">Ligação inválida</h1><Button asChild><Link href="/recuperar">Pedir nova ligação</Link></Button></div>;
  async function onSubmit(v: z.infer<typeof schema>) {
    setError('');
    try { await api.post('/auth/reset-password', { token, password: v.password }); router.replace('/entrar?reset=1'); }
    catch (e) { setError(e instanceof ApiError ? e.message : 'Sem ligação ao servidor.'); }
  }
  return (
    <div className="grid gap-8">
      <div><h1 className="text-3xl font-bold">Nova palavra-passe</h1><p className="mt-2 text-muted-foreground">Escolha uma palavra-passe forte que não use noutros sites.</p></div>
      <form onSubmit={handleSubmit(onSubmit)} className="grid gap-5" noValidate>
        {error && <p role="alert" className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">{error} <Link href="/recuperar" className="font-medium underline">Pedir nova ligação</Link></p>}
        <Field label="Nova palavra-passe" htmlFor="password" error={errors.password?.message}><PasswordInput id="password" autoComplete="new-password" autoFocus aria-invalid={!!errors.password} {...register('password')} /></Field>
        <Field label="Confirmar" htmlFor="confirm" error={errors.confirm?.message}><PasswordInput id="confirm" autoComplete="new-password" aria-invalid={!!errors.confirm} {...register('confirm')} /></Field>
        <Button type="submit" size="lg" loading={isSubmitting}>Guardar palavra-passe</Button>
      </form>
    </div>
  );
}
