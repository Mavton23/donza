'use client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as React from 'react';
import { Check, ChevronUp, MessageSquarePlus, MessagesSquare } from 'lucide-react';
import { toast } from 'sonner';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { EmptyState } from '@/components/ui/empty-state';
import { Field } from '@/components/ui/field';
import { Input, Textarea } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { ApiError, api } from '@/lib/api/client';
import type { GroupTopic, TopicReply } from '@/lib/api/types';
import { useAuth } from '@/lib/auth/auth-provider';
import { timeAgo } from '@/lib/utils';

const msg = (e: unknown) => (e instanceof ApiError ? e.message : 'Sem ligação ao servidor.');

export function Topics({ groupId, canModerate }: { groupId: string; canModerate: boolean }) {
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ['group-topics', groupId], queryFn: () => api.page<GroupTopic>(`/study-groups/${groupId}/topics`, { limit: 30, sort: 'activity' }) });
  const [create, setCreate] = React.useState(false); const [open, setOpen] = React.useState<GroupTopic | null>(null);
  const refresh = () => qc.invalidateQueries({ queryKey: ['group-topics', groupId] });
  const items = q.data?.data ?? [];
  return (
    <div className="grid gap-4">
      <div className="flex justify-end"><Button onClick={() => setCreate(true)}><MessageSquarePlus /> Novo tópico</Button></div>
      {q.isLoading ? <Skeleton className="h-28 rounded-2xl" /> : !items.length ? <EmptyState icon={<MessagesSquare />} title="Sem discussões" description="Faça a primeira pergunta ao grupo." />
        : <ul className="grid gap-3">{items.map((t) => (
          <li key={t.topicId}><button type="button" onClick={() => setOpen(t)} className="flex w-full flex-wrap items-center gap-3 rounded-2xl border bg-card p-4 text-left transition hover:shadow-sm focus-visible:ring-[3px] focus-visible:ring-ring/40 focus-visible:outline-none">
            <Avatar src={t.author.avatarUrl} name={t.author.username} size={32} />
            <div className="min-w-0 flex-1"><p className="truncate font-medium">{t.title}</p><p className="text-sm text-muted-foreground">@{t.author.username} · {timeAgo(t.createdAt)} · {t.repliesCount} resposta(s)</p></div>
            {t.solved && <Badge variant="success"><Check className="mr-1 size-3" />Resolvido</Badge>}{t.isClosed && <Badge variant="outline">Fechado</Badge>}
          </button></li>))}</ul>}
      {create && <CreateTopic groupId={groupId} onClose={() => setCreate(false)} onDone={refresh} />}
      {open && <TopicDialog groupId={groupId} topic={open} canModerate={canModerate} onClose={() => setOpen(null)} onChange={refresh} />}
    </div>
  );
}

function CreateTopic({ groupId, onClose, onDone }: { groupId: string; onClose: () => void; onDone: () => void }) {
  const [title, setTitle] = React.useState(''); const [content, setContent] = React.useState(''); const [errors, setErrors] = React.useState<Record<string, string>>({});
  const save = useMutation({
    mutationFn: () => { const e: Record<string, string> = {}; if (title.trim().length < 3) e.title = 'Mínimo de 3 caracteres'; if (!content.trim()) e.content = 'Escreva o conteúdo'; if (Object.keys(e).length) { setErrors(e); throw new Error('v'); } return api.post(`/study-groups/${groupId}/topics`, { title: title.trim(), content: content.trim() }); },
    onSuccess: () => { onDone(); toast.success('Tópico criado'); onClose(); },
    onError: (e) => { if (e instanceof ApiError) { if (Object.keys(e.fieldErrors).length) setErrors(e.fieldErrors); else toast.error(e.message); } },
  });
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}><DialogContent>
      <DialogHeader><DialogTitle>Novo tópico</DialogTitle><DialogDescription>Visível só para os membros do grupo.</DialogDescription></DialogHeader>
      <form className="grid gap-4" noValidate onSubmit={(e) => { e.preventDefault(); save.mutate(); }}>
        <Field label="Título" htmlFor="tp-title" error={errors.title}><Input id="tp-title" autoFocus value={title} onChange={(e) => setTitle(e.target.value)} /></Field>
        <Field label="Conteúdo" htmlFor="tp-content" error={errors.content}><Textarea id="tp-content" rows={6} value={content} onChange={(e) => setContent(e.target.value)} /></Field>
        <DialogFooter><Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button><Button type="submit" loading={save.isPending}>Publicar</Button></DialogFooter>
      </form>
    </DialogContent></Dialog>
  );
}

function TopicDialog({ groupId, topic, canModerate, onClose, onChange }: { groupId: string; topic: GroupTopic; canModerate: boolean; onClose: () => void; onChange: () => void }) {
  const { user } = useAuth(); const qc = useQueryClient();
  const detail = useQuery({ queryKey: ['group-topic', topic.topicId], queryFn: () => api.get<GroupTopic>(`/study-groups/${groupId}/topics/${topic.topicId}`) });
  const replies = useQuery({ queryKey: ['group-replies', topic.topicId], queryFn: () => api.page<TopicReply>(`/study-groups/${groupId}/topics/${topic.topicId}/replies`, { limit: 50, sort: 'top' }) });
  const [text, setText] = React.useState('');
  const refresh = () => { qc.invalidateQueries({ queryKey: ['group-replies', topic.topicId] }); qc.invalidateQueries({ queryKey: ['group-topic', topic.topicId] }); onChange(); };
  const reply = useMutation({ mutationFn: () => api.post(`/study-groups/${groupId}/topics/${topic.topicId}/replies`, { content: text.trim() }), onSuccess: () => { setText(''); refresh(); }, onError: (e) => toast.error(msg(e)) });
  const vote = useMutation({ mutationFn: (r: TopicReply) => (r.myVote === 'up' ? api.del(`/study-groups/${groupId}/topics/${topic.topicId}/replies/${r.replyId}/vote`) : api.put(`/study-groups/${groupId}/topics/${topic.topicId}/replies/${r.replyId}/vote`, { voteType: 'up' })), onSuccess: refresh, onError: (e) => toast.error(msg(e)) });
  const solve = useMutation({ mutationFn: (r: TopicReply) => (r.isSolution ? api.del(`/study-groups/${groupId}/topics/${topic.topicId}/replies/${r.replyId}/solution`) : api.put(`/study-groups/${groupId}/topics/${topic.topicId}/replies/${r.replyId}/solution`)), onSuccess: refresh, onError: (e) => toast.error(msg(e)) });
  const t = detail.data ?? topic; const canSolve = canModerate || user?.userId === topic.author.userId;
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}><DialogContent className="max-h-[90dvh] max-w-2xl overflow-y-auto">
      <DialogHeader><DialogTitle>{t.title}</DialogTitle><DialogDescription>@{t.author.username} · {timeAgo(t.createdAt)}</DialogDescription></DialogHeader>
      <p className="whitespace-pre-wrap break-words text-sm">{t.content}</p>
      <h3 className="mt-2 text-sm font-semibold">{replies.data?.meta.total ?? 0} resposta(s)</h3>
      <ul className="grid gap-2">{replies.data?.data.map((r) => (
        <li key={r.replyId} className={`rounded-xl border p-3 ${r.isSolution ? 'border-success/50 bg-success/5' : ''}`}>
          <div className="mb-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground"><span className="font-medium text-foreground">@{r.author.username}</span><span>· {timeAgo(r.createdAt)}</span>{r.isSolution && <Badge variant="success">Solução</Badge>}</div>
          <p className="whitespace-pre-wrap break-words text-sm">{r.content}</p>
          <div className="mt-2 flex gap-1"><Button variant={r.myVote === 'up' ? 'secondary' : 'ghost'} size="sm" aria-pressed={r.myVote === 'up'} onClick={() => vote.mutate(r)}><ChevronUp /> {r.upvotes}</Button>{canSolve && <Button variant="ghost" size="sm" onClick={() => solve.mutate(r)}><Check /> {r.isSolution ? 'Desmarcar solução' : 'Marcar solução'}</Button>}</div>
        </li>))}</ul>
      {t.isClosed ? <p className="text-sm text-muted-foreground">Tópico fechado.</p> : (
        <form className="grid gap-2" onSubmit={(e) => { e.preventDefault(); if (text.trim()) reply.mutate(); }}>
          <Textarea rows={3} value={text} onChange={(e) => setText(e.target.value)} placeholder="Escreva uma resposta…" aria-label="Resposta" />
          <div><Button type="submit" size="sm" disabled={!text.trim()} loading={reply.isPending}>Responder</Button></div>
        </form>)}
    </DialogContent></Dialog>
  );
}
