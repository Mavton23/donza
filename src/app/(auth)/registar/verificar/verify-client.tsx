'use client';
import * as React from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, MailX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ApiError, api } from '@/lib/api/client';

export function VerifyClient() {
  const router = useRouter();
  const token = useSearchParams().get('token');
  const [error, setError] = React.useState('');
  const ran = React.useRef(false);

  React.useEffect(() => {
    if (ran.current) return; ran.current = true; // StrictMode: um só pedido
    if (!token) { setError('A ligação está incompleta.'); return; }
    api.get('/auth/register/verify', { token }).then(() => router.replace(`/registar/completar?token=${encodeURIComponent(token)}`))
      .catch((e) => setError(e instanceof ApiError ? e.message : 'Não foi possível verificar o email.'));
  }, [token, router]);

  if (error) {
    return (
      <div className="grid gap-5 text-center">
        <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-destructive/10 text-destructive"><MailX className="size-8" /></div>
        <h1 className="text-2xl font-bold">Ligação inválida ou expirada</h1>
        <p className="text-muted-foreground">{error} Pode pedir uma nova ligação a partir do registo.</p>
        <Button asChild><Link href="/registar">Voltar ao registo</Link></Button>
      </div>
    );
  }
  return <div className="flex flex-col items-center gap-4 py-10 text-center" role="status"><Loader2 className="size-9 animate-spin text-primary" /><p className="text-muted-foreground">A verificar o seu email…</p></div>;
}
