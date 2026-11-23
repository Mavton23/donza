'use client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import * as React from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Field } from '@/components/ui/field';
import { Input, Textarea } from '@/components/ui/input';
import { ApiError, api } from '@/lib/api/client';

/** Envia mensagem directa; se o destinatário exigir pedido, passa para o formulário de pedido. */
export function ComposeDialog({ userId, username, onClose }: { userId: string; username: string; onClose: () => void }) {
  const router = useRouter(); const qc = useQueryClient();
  const [mode, setMode] = React.useState<'direct' | 'request'>('direct');
  const [text, setText] = React.useState(''); const [subject, setSubject] = React.useState(''); const [err, setErr] = React.useState('');
  const send = useMutation({
    mutationFn: async () => {
      if (!text.trim()) { setErr('Escreva a mensagem'); throw new Error('v'); }
      if (mode === 'request') {
        if (subject.trim().length < 3) { setErr('O assunto precisa de pelo menos 3 caracteres'); throw new Error('v'); }
        await api.post('/messages/requests', { receiverId: userId, subject: subject.trim(), message: text.trim() }); return { request: true as const };
      }
      return api.post<{ conversationId: string }>('/messages/conversations', { userId, content: text.trim() });
    },
    onSuccess: (r) => {
      qc.invalidateQueries({ queryKey: ['conversations'] }); qc.invalidateQueries({ queryKey: ['message-requests'] }); onClose();
      if ('request' in r) toast.success(`Pedido enviado a @${username}. Poderá conversar quando for aceite.`);
      else router.push(`/mensagens?c=${r.conversationId}`);
    },
    onError: (e) => { if (e instanceof ApiError && e.code === 'MESSAGE_REQUEST_REQUIRED') { setMode('request'); setErr(''); } else if (e instanceof ApiError) toast.error(e.message); },
  });
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}><DialogContent>
      <DialogHeader><DialogTitle>Mensagem para @{username}</DialogTitle><DialogDescription>{mode === 'request' ? '@' + username + ' só recebe mensagens de quem tem pedido aceite. Envie um pedido com assunto.' : 'A conversa fica na sua caixa de mensagens.'}</DialogDescription></DialogHeader>
      <form className="grid gap-4" noValidate onSubmit={(e) => { e.preventDefault(); send.mutate(); }}>
        {mode === 'request' && <Field label="Assunto" htmlFor="mr-subject"><Input id="mr-subject" autoFocus value={subject} onChange={(e) => { setSubject(e.target.value); setErr(''); }} maxLength={150} /></Field>}
        <Field label="Mensagem" htmlFor="mr-text" error={err}><Textarea id="mr-text" rows={4} autoFocus={mode === 'direct'} value={text} onChange={(e) => { setText(e.target.value); setErr(''); }} maxLength={mode === 'request' ? 2000 : 5000} /></Field>
        <DialogFooter><Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button><Button type="submit" loading={send.isPending}>{mode === 'request' ? 'Enviar pedido' : 'Enviar'}</Button></DialogFooter>
      </form>
    </DialogContent></Dialog>
  );
}
