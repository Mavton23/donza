'use client';
import { useMutation } from '@tanstack/react-query';
import Link from 'next/link';
import * as React from 'react';
import { ThumbsDown, ThumbsUp } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { ApiError, api } from '@/lib/api/client';
import { useAuth } from '@/lib/auth/auth-provider';

export function ArticleFeedback({ articleId }: { articleId: string }) {
  const { status } = useAuth(); const [given, setGiven] = React.useState<boolean | null>(null);
  const send = useMutation({ mutationFn: (wasHelpful: boolean) => api.post(`/help/articles/${articleId}/feedback`, { wasHelpful }).then(() => wasHelpful), onSuccess: (v) => setGiven(v), onError: (e) => toast.error(e instanceof ApiError ? e.message : 'Sem ligação ao servidor.') });
  const clear = useMutation({ mutationFn: () => api.del(`/help/articles/${articleId}/feedback`), onSuccess: () => setGiven(null), onError: (e) => toast.error(e instanceof ApiError ? e.message : 'Sem ligação ao servidor.') });
  return (
    <section aria-labelledby="fb-h" className="mt-10 rounded-2xl border bg-card p-5 text-center">
      <h2 id="fb-h" className="font-semibold">Este artigo foi útil?</h2>
      {status !== 'authenticated' ? <p className="mt-1 text-sm text-muted-foreground"><Link href="/entrar" className="font-medium text-primary hover:underline">Entre</Link> para nos dizer.</p>
        : given === null ? <div className="mt-3 flex justify-center gap-2"><Button variant="outline" loading={send.isPending && send.variables === true} onClick={() => send.mutate(true)}><ThumbsUp /> Sim</Button><Button variant="outline" loading={send.isPending && send.variables === false} onClick={() => send.mutate(false)}><ThumbsDown /> Não</Button></div>
        : <p role="status" className="mt-2 text-sm">Obrigado pelo seu comentário! <button type="button" className="text-primary hover:underline" onClick={() => clear.mutate()}>Anular</button></p>}
    </section>
  );
}
