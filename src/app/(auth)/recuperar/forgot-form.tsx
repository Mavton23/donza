'use client';
import * as React from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, MailCheck } from 'lucide-react';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { ApiError, api } from '@/lib/api/client';

const schema = z.object({ email: z.string().trim().min(1, 'Indique o seu email').email('Email inválido') });

export function ForgotForm() {
  const [sent, setSent] = React.useState('');
  const [error, setError] = React.useState('');
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<z.infer<typeof schema>>({ resolver: zodResolver(schema) });
  async function onSubmit(v: z.infer<typeof schema>) {
    setError('');
    try { await api.post('/auth/forgot-password', v); setSent(v.email); } catch (e) { setError(e instanceof ApiError ? e.message : 'Sem ligação ao servidor.'); }
  }
  if (sent) return (
    <div className="grid gap-6 text-center">
      <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary"><MailCheck className="size-8" /></div>
      <div><h1 className="text-3xl font-bold">Verifique o seu email</h1><p className="mt-3 text-muted-foreground">Se existir uma conta com <strong className="text-foreground">{sent}</strong>, enviámos instruções para definir uma nova palavra-passe.</p></div>
      <Button asChild variant="outline"><Link href="/entrar">Voltar a entrar</Link></Button>
    </div>
  );
  return (
    <div className="grid gap-8">
      <div><h1 className="text-3xl font-bold">Recuperar palavra-passe</h1><p className="mt-2 text-muted-foreground">Indique o seu email e enviamos uma ligação para a redefinir.</p></div>
      <form onSubmit={handleSubmit(onSubmit)} className="grid gap-5" noValidate>
        {error && <p role="alert" className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}
        <Field label="Email" htmlFor="email" error={errors.email?.message}><Input id="email" type="email" autoComplete="email" autoFocus aria-invalid={!!errors.email} {...register('email')} /></Field>
        <Button type="submit" size="lg" loading={isSubmitting}>Enviar ligação</Button>
      </form>
      <Link href="/entrar" className="inline-flex items-center justify-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="size-4" />Voltar a entrar</Link>
    </div>
  );
}
