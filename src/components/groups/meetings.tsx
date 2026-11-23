'use client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as React from 'react';
import { CalendarClock, ExternalLink, Plus, Trash2, Video } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { EmptyState } from '@/components/ui/empty-state';
import { Field } from '@/components/ui/field';
import { Input, Textarea } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ApiError, api } from '@/lib/api/client';
import type { GroupMeeting } from '@/lib/api/types';
import { formatDate } from '@/lib/utils';

const msg = (e: unknown) => (e instanceof ApiError ? e.message : 'Sem ligação ao servidor.');

export function Meetings({ groupId, canManage }: { groupId: string; canManage: boolean }) {
  const qc = useQueryClient();
  const [when, setWhen] = React.useState<'upcoming' | 'past'>('upcoming');
  const [create, setCreate] = React.useState(false);
  const q = useQuery({ queryKey: ['group-meetings', groupId, when], queryFn: () => api.page<GroupMeeting>(`/study-groups/${groupId}/meetings`, { when, limit: 30 }) });
  const refresh = () => qc.invalidateQueries({ queryKey: ['group-meetings', groupId] });
  const rsvp = useMutation({ mutationFn: (v: { id: string; status: 'confirmed' | 'declined' }) => api.post(`/study-groups/${groupId}/meetings/${v.id}/rsvp`, { status: v.status }), onSuccess: refresh, onError: (e) => toast.error(msg(e)) });
  const remove = useMutation({ mutationFn: (id: string) => api.del(`/study-groups/${groupId}/meetings/${id}`), onSuccess: () => { refresh(); toast.success('Reunião cancelada'); }, onError: (e) => toast.error(msg(e)) });
  const items = q.data?.data ?? [];
  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Tabs value={when} onValueChange={(v) => setWhen(v as typeof when)}><TabsList><TabsTrigger value="upcoming">Próximas</TabsTrigger><TabsTrigger value="past">Passadas</TabsTrigger></TabsList></Tabs>
        <Button onClick={() => setCreate(true)}><Plus /> Nova reunião</Button>
      </div>
      {q.isLoading ? <Skeleton className="h-28 rounded-2xl" /> : !items.length ? <EmptyState icon={<CalendarClock />} title={when === 'upcoming' ? 'Sem reuniões marcadas' : 'Sem reuniões passadas'} />
        : <ul className="grid gap-3">{items.map((m) => (
          <li key={m.meetingId} className="flex flex-wrap items-center gap-3 rounded-2xl border bg-card p-4">
            <div className="grid size-12 shrink-0 place-items-center rounded-xl bg-primary/10 text-center text-primary"><div><div className="text-[10px] font-semibold uppercase leading-none">{formatDate(m.startTime, { month: 'short' })}</div><div className="text-lg font-bold leading-tight">{new Date(m.startTime).getDate()}</div></div></div>
            <div className="min-w-0 flex-1"><p className="truncate font-medium">{m.title}</p><p className="text-sm text-muted-foreground">{formatDate(m.startTime, { weekday: 'short', hour: '2-digit', minute: '2-digit' })} · {m.confirmedCount} confirmado(s) · por @{m.organizer.username}</p></div>
            {m.status === 'cancelled' && <Badge variant="destructive">Cancelada</Badge>}
            {m.meetingUrl && <Button asChild variant="outline" size="sm"><a href={m.meetingUrl} target="_blank" rel="noreferrer noopener"><Video /> Entrar <ExternalLink className="size-3" /></a></Button>}
            {when === 'upcoming' && <div className="flex gap-1"><Button size="sm" variant={m.myRsvp === 'confirmed' ? 'default' : 'outline'} aria-pressed={m.myRsvp === 'confirmed'} disabled={rsvp.isPending} onClick={() => rsvp.mutate({ id: m.meetingId, status: 'confirmed' })}>Vou</Button><Button size="sm" variant={m.myRsvp === 'declined' ? 'default' : 'outline'} aria-pressed={m.myRsvp === 'declined'} disabled={rsvp.isPending} onClick={() => rsvp.mutate({ id: m.meetingId, status: 'declined' })}>Não vou</Button></div>}
            {canManage && <Button variant="ghost" size="icon-sm" aria-label="Cancelar reunião" onClick={() => remove.mutate(m.meetingId)}><Trash2 /></Button>}
          </li>))}</ul>}
      {create && <CreateMeeting groupId={groupId} onClose={() => setCreate(false)} onDone={refresh} />}
    </div>
  );
}

function CreateMeeting({ groupId, onClose, onDone }: { groupId: string; onClose: () => void; onDone: () => void }) {
  const [title, setTitle] = React.useState(''); const [start, setStart] = React.useState(''); const [end, setEnd] = React.useState(''); const [url, setUrl] = React.useState(''); const [desc, setDesc] = React.useState('');
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const save = useMutation({
    mutationFn: () => {
      const e: Record<string, string> = {};
      if (title.trim().length < 3) e.title = 'Mínimo de 3 caracteres';
      if (!start) e.startTime = 'Indique o início';
      if (start && end && new Date(end) <= new Date(start)) e.endTime = 'O fim tem de ser depois do início';
      if (url && !/^https?:\/\//.test(url)) e.meetingUrl = 'Comece por http:// ou https://';
      if (Object.keys(e).length) { setErrors(e); throw new Error('v'); }
      return api.post(`/study-groups/${groupId}/meetings`, { title: title.trim(), startTime: new Date(start).toISOString(), endTime: end ? new Date(end).toISOString() : undefined, meetingUrl: url.trim() || undefined, description: desc.trim() || undefined });
    },
    onSuccess: () => { onDone(); toast.success('Reunião marcada'); onClose(); },
    onError: (e) => { if (e instanceof ApiError) { if (Object.keys(e.fieldErrors).length) setErrors(e.fieldErrors); else toast.error(e.message); } },
  });
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}><DialogContent>
      <DialogHeader><DialogTitle>Nova reunião</DialogTitle><DialogDescription>Os membros recebem uma notificação.</DialogDescription></DialogHeader>
      <form className="grid gap-4" noValidate onSubmit={(e) => { e.preventDefault(); save.mutate(); }}>
        <Field label="Título" htmlFor="m-title" error={errors.title}><Input id="m-title" autoFocus value={title} onChange={(e) => setTitle(e.target.value)} /></Field>
        <div className="grid gap-4 sm:grid-cols-2"><Field label="Início" htmlFor="m-start" error={errors.startTime}><Input id="m-start" type="datetime-local" value={start} onChange={(e) => setStart(e.target.value)} /></Field><Field label="Fim (opcional)" htmlFor="m-end" error={errors.endTime}><Input id="m-end" type="datetime-local" value={end} onChange={(e) => setEnd(e.target.value)} /></Field></div>
        <Field label="Ligação da chamada (opcional)" htmlFor="m-url" error={errors.meetingUrl}><Input id="m-url" inputMode="url" placeholder="https://…" value={url} onChange={(e) => setUrl(e.target.value)} /></Field>
        <Field label="Descrição (opcional)" htmlFor="m-desc"><Textarea id="m-desc" rows={3} value={desc} onChange={(e) => setDesc(e.target.value)} /></Field>
        <DialogFooter><Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button><Button type="submit" loading={save.isPending}>Marcar</Button></DialogFooter>
      </form>
    </DialogContent></Dialog>
  );
}
