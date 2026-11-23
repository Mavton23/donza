'use client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as React from 'react';
import { CheckCircle2, Circle, ListChecks, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { EmptyState } from '@/components/ui/empty-state';
import { Field } from '@/components/ui/field';
import { Input, Textarea } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ApiError, api } from '@/lib/api/client';
import type { GroupMember, GroupTask, GroupTaskStatus } from '@/lib/api/types';
import { formatDate } from '@/lib/utils';

const msg = (e: unknown) => (e instanceof ApiError ? e.message : 'Sem ligação ao servidor.');
const PRIO = { low: { label: 'Baixa', variant: 'outline' }, medium: { label: 'Média', variant: 'secondary' }, high: { label: 'Alta', variant: 'destructive' } } as const;
const STATUS: Record<GroupTaskStatus, string> = { pending: 'Por fazer', in_progress: 'Em curso', completed: 'Concluída', archived: 'Arquivada' };

export function Tasks({ groupId, canManage }: { groupId: string; canManage: boolean }) {
  const qc = useQueryClient();
  const [scope, setScope] = React.useState<'all' | 'mine'>('all');
  const [create, setCreate] = React.useState(false);
  const q = useQuery({ queryKey: ['group-tasks', groupId, scope], queryFn: () => api.page<GroupTask>(`/study-groups/${groupId}/tasks`, { limit: 50, assignedToMe: scope === 'mine' ? true : undefined, sort: 'deadline' }) });
  const refresh = () => qc.invalidateQueries({ queryKey: ['group-tasks', groupId] });
  const setMine = useMutation({ mutationFn: (v: { id: string; status: 'pending' | 'completed' }) => api.patch(`/study-groups/${groupId}/tasks/${v.id}/assignment/me`, { status: v.status }), onSuccess: refresh, onError: (e) => toast.error(msg(e)) });
  const setStatus = useMutation({ mutationFn: (v: { id: string; status: GroupTaskStatus }) => api.patch(`/study-groups/${groupId}/tasks/${v.id}`, { status: v.status }), onSuccess: refresh, onError: (e) => toast.error(msg(e)) });
  const remove = useMutation({ mutationFn: (id: string) => api.del(`/study-groups/${groupId}/tasks/${id}`), onSuccess: () => { refresh(); toast.success('Tarefa eliminada'); }, onError: (e) => toast.error(msg(e)) });
  const items = q.data?.data ?? [];
  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Tabs value={scope} onValueChange={(v) => setScope(v as typeof scope)}><TabsList><TabsTrigger value="all">Todas</TabsTrigger><TabsTrigger value="mine">As minhas</TabsTrigger></TabsList></Tabs>
        {canManage && <Button onClick={() => setCreate(true)}><Plus /> Nova tarefa</Button>}
      </div>
      {q.isLoading ? <Skeleton className="h-28 rounded-2xl" /> : !items.length ? <EmptyState icon={<ListChecks />} title="Sem tarefas" description={canManage ? 'Crie a primeira e atribua-a a membros.' : 'A liderança ainda não criou tarefas.'} />
        : <ul className="grid gap-3">{items.map((t) => { const mine = t.myAssignment; return (
          <li key={t.taskId} className="flex flex-wrap items-center gap-3 rounded-2xl border bg-card p-4">
            {mine ? <button type="button" aria-label={mine === 'completed' ? 'Marcar como por fazer' : 'Marcar como feita'} aria-pressed={mine === 'completed'} disabled={setMine.isPending} onClick={() => setMine.mutate({ id: t.taskId, status: mine === 'completed' ? 'pending' : 'completed' })} className="text-primary">{mine === 'completed' ? <CheckCircle2 className="size-6" /> : <Circle className="size-6" />}</button> : <span className="size-6" />}
            <div className="min-w-0 flex-1"><p className={`truncate font-medium ${t.status === 'completed' ? 'text-muted-foreground line-through' : ''}`}>{t.title}</p><p className="text-sm text-muted-foreground">{t.deadline ? `Prazo ${formatDate(t.deadline)}${t.overdue ? ' · em atraso' : ''}` : 'Sem prazo'}{t.progress.total ? ` · ${t.progress.done}/${t.progress.total} concluído` : ''}</p></div>
            {!!t.assignees.length && <div className="flex -space-x-2">{t.assignees.slice(0, 4).map((a) => <Avatar key={a.userId} name={a.username} size={24} className="ring-2 ring-card" />)}</div>}
            <Badge variant={PRIO[t.priority].variant}>{PRIO[t.priority].label}</Badge>
            {canManage ? <Select value={t.status} onValueChange={(v) => setStatus.mutate({ id: t.taskId, status: v as GroupTaskStatus })}><SelectTrigger className="w-32" aria-label="Estado da tarefa"><SelectValue /></SelectTrigger><SelectContent>{Object.entries(STATUS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent></Select> : <Badge variant="secondary">{STATUS[t.status]}</Badge>}
            {canManage && <Button variant="ghost" size="icon-sm" aria-label="Eliminar tarefa" onClick={() => remove.mutate(t.taskId)}><Trash2 /></Button>}
          </li>); })}</ul>}
      {create && <CreateTask groupId={groupId} onClose={() => setCreate(false)} onDone={refresh} />}
    </div>
  );
}

function CreateTask({ groupId, onClose, onDone }: { groupId: string; onClose: () => void; onDone: () => void }) {
  const members = useQuery({ queryKey: ['group-members', groupId], staleTime: 0, queryFn: () => api.page<GroupMember>(`/study-groups/${groupId}/members`, { limit: 50 }) });
  const [title, setTitle] = React.useState(''); const [desc, setDesc] = React.useState(''); const [deadline, setDeadline] = React.useState(''); const [prio, setPrio] = React.useState('medium'); const [who, setWho] = React.useState<string[]>([]);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const save = useMutation({
    mutationFn: () => {
      if (title.trim().length < 3) { setErrors({ title: 'Mínimo de 3 caracteres' }); throw new Error('v'); }
      return api.post(`/study-groups/${groupId}/tasks`, { title: title.trim(), description: desc.trim() || undefined, deadline: deadline ? new Date(deadline).toISOString() : undefined, priority: prio, assigneeIds: who.length ? who : undefined });
    },
    onSuccess: () => { onDone(); toast.success('Tarefa criada'); onClose(); },
    onError: (e) => { if (e instanceof ApiError) { if (Object.keys(e.fieldErrors).length) setErrors(e.fieldErrors); else toast.error(e.message); } },
  });
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}><DialogContent className="max-h-[90dvh] overflow-y-auto">
      <DialogHeader><DialogTitle>Nova tarefa</DialogTitle><DialogDescription>Atribua a um ou mais membros, ou deixe em aberto.</DialogDescription></DialogHeader>
      <form className="grid gap-4" noValidate onSubmit={(e) => { e.preventDefault(); save.mutate(); }}>
        <Field label="Título" htmlFor="t-title" error={errors.title}><Input id="t-title" autoFocus value={title} onChange={(e) => setTitle(e.target.value)} /></Field>
        <Field label="Descrição (opcional)" htmlFor="t-desc"><Textarea id="t-desc" rows={3} value={desc} onChange={(e) => setDesc(e.target.value)} /></Field>
        <div className="grid gap-4 sm:grid-cols-2"><Field label="Prazo (opcional)" htmlFor="t-dl" error={errors.deadline}><Input id="t-dl" type="datetime-local" value={deadline} onChange={(e) => setDeadline(e.target.value)} /></Field>
          <Field label="Prioridade"><Select value={prio} onValueChange={setPrio}><SelectTrigger aria-label="Prioridade"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="low">Baixa</SelectItem><SelectItem value="medium">Média</SelectItem><SelectItem value="high">Alta</SelectItem></SelectContent></Select></Field></div>
        <div className="grid gap-2"><Label>Atribuir a</Label><div className="grid max-h-36 gap-1.5 overflow-y-auto rounded-xl border p-2">{members.data?.data.map((m) => (
          <label key={m.userId} className="flex items-center gap-2 rounded-lg px-2 py-1 text-sm hover:bg-muted/60"><Checkbox checked={who.includes(m.userId)} onCheckedChange={(v) => setWho(v === true ? [...who, m.userId] : who.filter((x) => x !== m.userId))} />@{m.username}</label>))}</div></div>
        <DialogFooter><Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button><Button type="submit" loading={save.isPending}>Criar tarefa</Button></DialogFooter>
      </form>
    </DialogContent></Dialog>
  );
}
