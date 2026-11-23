'use client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as React from 'react';
import { CheckCheck, Loader2, Paperclip, Pencil, Send, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/input';
import { ApiError, api, type Paged } from '@/lib/api/client';
import type { ChatMessage } from '@/lib/api/types';
import { useAuth } from '@/lib/auth/auth-provider';
import { useLiveInterval } from '@/lib/realtime/realtime-provider';
import { cn, formatDate } from '@/lib/utils';

interface CursorMeta { hasMore: boolean; nextBefore: string | null }
const msg = (e: unknown) => (e instanceof ApiError ? e.message : 'Sem ligação ao servidor.');

/** Chat genérico (conversa 1:1 ou grupo). Tempo real por WebSocket; sem ele, volta a consultar a cada 5 s. */
export function ChatPanel({ basePath, readPath, onActivity }: { basePath: string; readPath: string; onActivity?: () => void }) {
  const { user } = useAuth(); const qc = useQueryClient();
  const key = ['chat', basePath]; const interval = useLiveInterval(5000);
  const latest = useQuery({ queryKey: key, refetchInterval: interval, queryFn: async () => (await api.page<ChatMessage>(basePath, { limit: 30 })) as unknown as Paged<ChatMessage> & { meta: CursorMeta } });
  const [older, setOlder] = React.useState<ChatMessage[]>([]); const [cursor, setCursor] = React.useState<{ before: string | null; has: boolean } | null>(null);
  const [loadingOlder, setLoadingOlder] = React.useState(false);
  React.useEffect(() => { setOlder([]); setCursor(null); }, [basePath]);
  const meta = latest.data?.meta as unknown as CursorMeta | undefined;
  const hasMore = cursor ? cursor.has : !!meta?.hasMore;
  const nextBefore = cursor ? cursor.before : meta?.nextBefore ?? null;
  const all = React.useMemo(() => { const map = new Map<string, ChatMessage>(); [...older, ...(latest.data?.data ?? [])].forEach((m) => map.set(m.messageId, m)); return [...map.values()].sort((a, b) => a.createdAt.localeCompare(b.createdAt)); }, [older, latest.data]);

  async function loadOlder() {
    if (!nextBefore) return; setLoadingOlder(true);
    try { const r = (await api.page<ChatMessage>(basePath, { limit: 30, before: nextBefore })) as unknown as Paged<ChatMessage> & { meta: CursorMeta }; setOlder((o) => [...r.data, ...o]); setCursor({ before: r.meta.nextBefore, has: r.meta.hasMore }); } catch (e) { toast.error(msg(e)); } finally { setLoadingOlder(false); }
  }

  // Marca como lido quando chegam mensagens de outros.
  const lastOther = [...all].reverse().find((m) => m.senderId !== user?.userId)?.messageId;
  React.useEffect(() => { if (lastOther) api.post(readPath).then(() => onActivity?.()).catch(() => {}); }, [lastOther, readPath]); // eslint-disable-line react-hooks/exhaustive-deps

  // Fica no fundo quando chegam mensagens novas.
  const endRef = React.useRef<HTMLDivElement>(null); const lastId = all[all.length - 1]?.messageId;
  React.useEffect(() => { endRef.current?.scrollIntoView({ block: 'end' }); }, [lastId]);

  const [text, setText] = React.useState(''); const [file, setFile] = React.useState<File | null>(null); const [editing, setEditing] = React.useState<ChatMessage | null>(null);
  const refresh = () => { qc.invalidateQueries({ queryKey: key }); onActivity?.(); };
  const send = useMutation({
    mutationFn: () => {
      if (editing) return api.patch(`/messages/${editing.messageId}`, { content: text.trim() });
      if (file) { const f = new FormData(); if (text.trim()) f.set('content', text.trim()); f.set('attachment', file); return api.upload(basePath, f); }
      return api.post(basePath, { content: text.trim() });
    },
    onSuccess: () => { setText(''); setFile(null); setEditing(null); refresh(); }, onError: (e) => toast.error(msg(e)),
  });
  const remove = useMutation({ mutationFn: (id: string) => api.del(`/messages/${id}`), onSuccess: refresh, onError: (e) => toast.error(msg(e)) });
  const canSend = (text.trim() || file) && !send.isPending;

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4" role="log" aria-live="polite" aria-label="Mensagens">
        {latest.isLoading ? <div className="grid h-full place-items-center"><Loader2 className="size-6 animate-spin text-muted-foreground" /></div> : (
          <ul className="grid gap-2">
            {hasMore && <li className="text-center"><Button variant="ghost" size="sm" loading={loadingOlder} onClick={loadOlder}>Carregar mensagens anteriores</Button></li>}
            {!all.length && <li className="py-10 text-center text-sm text-muted-foreground">Ainda sem mensagens. Diga olá!</li>}
            {all.map((m, i) => { const mine = m.senderId === user?.userId; const prev = all[i - 1]; const newDay = !prev || new Date(prev.createdAt).toDateString() !== new Date(m.createdAt).toDateString();
              return (
                <React.Fragment key={m.messageId}>
                  {newDay && <li className="my-1 text-center text-xs text-muted-foreground">{formatDate(m.createdAt, { weekday: 'long', day: 'numeric', month: 'long' })}</li>}
                  <li className={cn('group flex flex-col', mine ? 'items-end' : 'items-start')}>
                    {!mine && prev?.senderId !== m.senderId && <span className="mb-0.5 ml-1 text-xs font-medium text-muted-foreground">@{m.sender.username}</span>}
                    <div className={cn('max-w-[80%] rounded-2xl px-3.5 py-2 text-sm', mine ? 'rounded-br-md bg-primary text-primary-foreground' : 'rounded-bl-md bg-muted')}>
                      {m.metadata?.subject && <p className="mb-1 text-xs font-semibold opacity-80">{m.metadata.subject}</p>}
                      {m.replyTo && <p className="mb-1 line-clamp-1 border-l-2 border-current/40 pl-2 text-xs opacity-70">{m.replyTo.content}</p>}
                      {m.content && <p className="whitespace-pre-wrap break-words">{m.content}</p>}
                      {m.metadata?.attachment?.url && <a href={m.metadata.attachment.url} target="_blank" rel="noreferrer noopener" className="mt-1 inline-flex items-center gap-1 underline"><Paperclip className="size-3.5" />{m.metadata.attachment.name ?? 'Anexo'}</a>}
                    </div>
                    <div className="mt-0.5 flex items-center gap-1.5 px-1 text-[11px] text-muted-foreground">
                      <time dateTime={m.createdAt}>{formatDate(m.createdAt, { hour: '2-digit', minute: '2-digit' })}</time>{m.edited && <span>· editada</span>}
                      {mine && m.readByOther && <CheckCheck className="size-3.5 text-primary" aria-label="Lida" />}
                      {mine && <span className="inline-flex gap-0.5 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100"><button type="button" aria-label="Editar mensagem" className="rounded p-0.5 hover:bg-muted" onClick={() => { setEditing(m); setText(m.content ?? ''); }}><Pencil className="size-3.5" /></button><button type="button" aria-label="Eliminar mensagem" className="rounded p-0.5 hover:bg-muted" onClick={() => remove.mutate(m.messageId)}><Trash2 className="size-3.5" /></button></span>}
                    </div>
                  </li>
                </React.Fragment>); })}
            <div ref={endRef} />
          </ul>)}
      </div>
      <form className="border-t bg-card p-3" onSubmit={(e) => { e.preventDefault(); if (canSend) send.mutate(); }}>
        {editing && <p className="mb-2 flex items-center gap-2 text-xs text-muted-foreground"><Pencil className="size-3" />A editar mensagem<button type="button" aria-label="Cancelar edição" className="ml-auto" onClick={() => { setEditing(null); setText(''); }}><X className="size-4" /></button></p>}
        {file && <p className="mb-2 flex items-center gap-2 text-xs"><Paperclip className="size-3" />{file.name}<button type="button" aria-label="Remover anexo" className="ml-auto" onClick={() => setFile(null)}><X className="size-4" /></button></p>}
        <div className="flex items-end gap-2">
          {!editing && <label className="grid size-10 shrink-0 cursor-pointer place-items-center rounded-lg hover:bg-muted focus-within:ring-[3px] focus-within:ring-ring/40"><Paperclip className="size-5 text-muted-foreground" /><span className="sr-only">Anexar ficheiro</span><input type="file" className="sr-only" onChange={(e) => { setFile(e.target.files?.[0] ?? null); e.target.value = ''; }} /></label>}
          <Textarea rows={1} value={text} maxLength={5000} onChange={(e) => setText(e.target.value)} aria-label="Mensagem" placeholder="Escreva uma mensagem…" className="max-h-32 min-h-10 py-2"
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); if (canSend) send.mutate(); } }} />
          <Button type="submit" size="icon" aria-label="Enviar" disabled={!canSend} loading={send.isPending}><Send /></Button>
        </div>
      </form>
    </div>
  );
}
