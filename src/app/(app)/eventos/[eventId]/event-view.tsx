'use client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import * as React from 'react';
import { ArrowLeft, Award, CalendarPlus, ExternalLink, MapPin, Pencil, Users, Video } from 'lucide-react';
import { toast } from 'sonner';
import { CheckoutDialog } from '@/components/courses/checkout-dialog';
import { CURRENCY, EventForm } from '@/components/events/event-form';
import { EntityReviews } from '@/components/reviews/entity-reviews';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import { ApiError, api } from '@/lib/api/client';
import type { DonzaEvent, EventParticipant, EventStatus } from '@/lib/api/types';
import { formatDate, formatPrice } from '@/lib/utils';
import { STATUS_LABEL } from '../events';

const msg = (e: unknown) => (e instanceof ApiError ? e.message : 'Sem ligação ao servidor.');

export function EventView({ eventId }: { eventId: string }) {
  const qc = useQueryClient(); const router = useRouter();
  const q = useQuery({ queryKey: ['event', eventId], queryFn: () => api.get<DonzaEvent>(`/events/${eventId}`) });
  const [checkout, setCheckout] = React.useState(false); const [edit, setEdit] = React.useState(false);
  const refresh = () => { qc.invalidateQueries({ queryKey: ['event', eventId] }); qc.invalidateQueries({ queryKey: ['events'] }); qc.invalidateQueries({ queryKey: ['calendar'] }); };
  const register = useMutation({
    mutationFn: () => api.post(`/events/${eventId}/register`),
    onSuccess: () => { refresh(); toast.success('Inscrição feita'); },
    onError: (e) => { if (e instanceof ApiError && e.code === 'PAYMENT_REQUIRED') setCheckout(true); else toast.error(msg(e)); },
  });
  const unregister = useMutation({ mutationFn: () => api.del(`/events/${eventId}/register`), onSuccess: () => { refresh(); toast.success('Inscrição cancelada'); }, onError: (e) => toast.error(msg(e)) });
  const setStatus = useMutation({ mutationFn: (status: EventStatus) => api.patch(`/events/${eventId}`, { status }), onSuccess: (_, s) => { refresh(); toast.success(s === 'canceled' ? 'Evento cancelado' : s === 'live' ? 'Evento iniciado' : 'Evento concluído'); }, onError: (e) => toast.error(msg(e)) });
  const issue = useMutation({ mutationFn: () => api.post<{ issued?: number }>(`/certificates/events/${eventId}/issue`), onSuccess: (r) => toast.success(r?.issued != null ? `${r.issued} certificado(s) emitido(s)` : 'Certificados emitidos'), onError: (e) => toast.error(msg(e)) });

  if (q.isLoading) return <div className="grid gap-4"><Skeleton className="h-40 rounded-2xl" /><Skeleton className="h-40 rounded-2xl" /></div>;
  if (q.isError || !q.data) return <EmptyState title="Evento não encontrado" description={q.error instanceof ApiError ? q.error.message : undefined} action={<Button asChild><Link href="/eventos">Voltar</Link></Button>} />;
  const e = q.data; const v = e.viewer; const free = Number(e.price) === 0; const open = e.status === 'scheduled' || e.status === 'live';
  const full = e.spotsLeft === 0;
  return (
    <div className="mx-auto max-w-3xl">
      <Button asChild variant="ghost" size="sm" className="mb-3 -ml-2"><Link href="/eventos"><ArrowLeft /> Eventos</Link></Button>
      <header className="rounded-2xl border bg-card p-6">
        <div className="flex flex-wrap items-center gap-2"><Badge variant={e.status === 'canceled' ? 'destructive' : e.status === 'live' ? 'success' : 'secondary'}>{STATUS_LABEL[e.status]}</Badge><Badge variant={free ? 'success' : 'default'}>{free ? 'Grátis' : formatPrice(e.price, CURRENCY)}</Badge></div>
        <h1 className="mt-3 text-2xl font-bold tracking-tight">{e.title}</h1>
        <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
          <div><dt className="text-muted-foreground">Quando</dt><dd className="font-medium">{formatDate(e.startDate, { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}{e.endDate && ` – ${formatDate(e.endDate, { hour: '2-digit', minute: '2-digit' })}`}</dd></div>
          <div><dt className="text-muted-foreground">Onde</dt><dd className="font-medium">{e.isOnline ? <span className="inline-flex items-center gap-1"><Video className="size-4" />Online</span> : <span className="inline-flex items-center gap-1"><MapPin className="size-4" />{e.location ?? 'A definir'}</span>}</dd></div>
          <div><dt className="text-muted-foreground">Inscritos</dt><dd className="font-medium"><span className="inline-flex items-center gap-1"><Users className="size-4" />{e.participantsCount}{e.maxParticipants ? ` / ${e.maxParticipants}` : ''}</span></dd></div>
          <div><dt className="text-muted-foreground">Organiza</dt><dd><Link href={`/utilizadores/${e.organizer.username}`} className="inline-flex items-center gap-2 font-medium hover:underline"><Avatar src={e.organizer.avatarUrl} name={e.organizer.name} size={22} />{e.organizer.name}</Link></dd></div>
        </dl>
        {e.description && <p className="mt-5 whitespace-pre-wrap text-[15px] leading-relaxed">{e.description}</p>}
        <div className="mt-6 flex flex-wrap items-center gap-2">
          {open && (v?.isRegistered ? <Button variant="outline" loading={unregister.isPending} onClick={() => unregister.mutate()}>Cancelar inscrição</Button>
            : <Button loading={register.isPending} disabled={full} onClick={() => (free ? register.mutate() : setCheckout(true))}>{full ? 'Esgotado' : free ? 'Inscrever-me' : `Inscrever-me · ${formatPrice(e.price, CURRENCY)}`}</Button>)}
          {v?.isRegistered && <Badge variant="success">Inscrito</Badge>}
          <Button asChild variant="ghost"><a href={`/api/calendar/events/${e.eventId}/ics`}><CalendarPlus />Adicionar ao calendário</a></Button>
        </div>
        {v?.isRegistered && e.meetingUrl && open && <div className="mt-4 rounded-xl bg-primary/5 p-4"><p className="text-sm font-medium">Ligação da sessão</p><a href={e.meetingUrl} target="_blank" rel="noreferrer noopener" className="mt-1 inline-flex items-center gap-1 break-all text-primary underline">{e.meetingUrl}<ExternalLink className="size-3.5" /></a></div>}
        {e.isOnline && e.meetingUrlLocked && !v?.isRegistered && <p className="mt-4 text-sm text-muted-foreground">A ligação da sessão aparece depois de se inscrever.</p>}
      </header>

      <div className="mt-8"><EntityReviews kind="event" id={e.eventId} /></div>

      {v?.canManage && <ManagePanel event={e} onEdit={() => setEdit(true)} setStatus={(s) => setStatus.mutate(s)} statusPending={setStatus.isPending} onIssue={() => issue.mutate()} issuing={issue.isPending} />}
      {!free && checkout && <CheckoutDialog event={{ eventId: e.eventId, title: e.title, price: e.price, currency: CURRENCY }} open={checkout} onOpenChange={setCheckout} />}
      <Dialog open={edit} onOpenChange={setEdit}><DialogContent className="max-h-[90dvh] max-w-xl overflow-y-auto"><DialogHeader><DialogTitle>Editar evento</DialogTitle><DialogDescription>Os inscritos são avisados de alterações de data, local ou ligação.</DialogDescription></DialogHeader><EventForm event={e} onDone={() => setEdit(false)} onCancel={() => setEdit(false)} /></DialogContent></Dialog>
    </div>
  );
}

function ManagePanel({ event, onEdit, setStatus, statusPending, onIssue, issuing }: { event: DonzaEvent; onEdit: () => void; setStatus: (s: EventStatus) => void; statusPending: boolean; onIssue: () => void; issuing: boolean }) {
  const qc = useQueryClient();
  const parts = useQuery({ queryKey: ['event-participants', event.eventId], queryFn: () => api.page<EventParticipant>(`/events/${event.eventId}/participants`, { limit: 100 }) });
  const attend = useMutation({ mutationFn: (v: { userId: string; attended: boolean }) => api.patch(`/events/${event.eventId}/participants/${v.userId}/attendance`, { attended: v.attended }), onSuccess: () => qc.invalidateQueries({ queryKey: ['event-participants', event.eventId] }), onError: (e) => toast.error(msg(e)) });
  const s = event.status; const canMark = s === 'live' || s === 'completed';
  return (
    <section className="mt-6 rounded-2xl border bg-card p-6" aria-labelledby="manage-h">
      <div className="flex flex-wrap items-center justify-between gap-2"><h2 id="manage-h" className="text-lg font-semibold">Gestão do evento</h2>
        <div className="flex flex-wrap gap-2">
          {(s === 'scheduled' || s === 'live') && <Button variant="outline" size="sm" onClick={onEdit}><Pencil /> Editar</Button>}
          {s === 'scheduled' && <Button size="sm" disabled={statusPending} onClick={() => setStatus('live')}>Iniciar</Button>}
          {(s === 'scheduled' || s === 'live') && <Button size="sm" variant="outline" disabled={statusPending} onClick={() => setStatus('completed')}>Concluir</Button>}
          {(s === 'scheduled' || s === 'live') && <Button size="sm" variant="destructive" disabled={statusPending} onClick={() => setStatus('canceled')}>Cancelar evento</Button>}
          {s === 'completed' && <Button size="sm" loading={issuing} onClick={onIssue}><Award /> Emitir certificados</Button>}
        </div></div>
      <h3 className="mt-5 mb-2 text-sm font-semibold">Participantes {parts.data ? `(${parts.data.meta.total})` : ''}</h3>
      {parts.isLoading ? <Skeleton className="h-16" /> : !parts.data?.data.length ? <p className="text-sm text-muted-foreground">Ainda sem inscritos.</p>
        : <ul className="divide-y rounded-xl border">{parts.data.data.map((p) => (
          <li key={p.userId} className="flex items-center gap-3 p-3"><Avatar src={p.user.avatarUrl} name={p.user.username} size={32} /><span className="min-w-0 flex-1 truncate text-sm font-medium">{p.user.fullName ?? p.user.username}</span>
            <label className="flex items-center gap-2 text-sm" title={canMark ? undefined : 'A presença só pode ser marcada com o evento a decorrer ou concluído'}><Checkbox disabled={!canMark} checked={p.attended} onCheckedChange={(c) => attend.mutate({ userId: p.userId, attended: c === true })} aria-label={`Presença de ${p.user.username}`} />Presente</label></li>))}</ul>}
    </section>
  );
}
