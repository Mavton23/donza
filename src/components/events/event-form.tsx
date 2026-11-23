'use client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import * as React from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Field } from '@/components/ui/field';
import { Input, Textarea } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ApiError, api } from '@/lib/api/client';
import type { DonzaEvent } from '@/lib/api/types';

const toLocal = (iso?: string | null) => { if (!iso) return ''; const d = new Date(iso); return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16); };
export const CURRENCY = process.env.NEXT_PUBLIC_DEFAULT_CURRENCY ?? 'MZN';

/** Criar (sem `event`) ou editar um evento. */
export function EventForm({ event, onDone, onCancel }: { event?: DonzaEvent; onDone: (id: string) => void; onCancel?: () => void }) {
  const qc = useQueryClient();
  const [title, setTitle] = React.useState(event?.title ?? ''); const [desc, setDesc] = React.useState(event?.description ?? '');
  const [start, setStart] = React.useState(toLocal(event?.startDate)); const [end, setEnd] = React.useState(toLocal(event?.endDate));
  const [online, setOnline] = React.useState(event?.isOnline ?? false); const [location, setLocation] = React.useState(event?.location ?? ''); const [url, setUrl] = React.useState(event?.meetingUrl ?? '');
  const [max, setMax] = React.useState(event?.maxParticipants ? String(event.maxParticipants) : ''); const [price, setPrice] = React.useState(event ? String(Number(event.price)) : '0');
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const save = useMutation({
    mutationFn: () => {
      const e: Record<string, string> = {};
      if (title.trim().length < 3) e.title = 'Mínimo de 3 caracteres';
      if (!start) e.startDate = 'Indique o início';
      if (start && end && new Date(end) <= new Date(start)) e.endDate = 'O fim tem de ser depois do início';
      if (online && url && !/^https?:\/\//.test(url)) e.meetingUrl = 'Comece por http:// ou https://';
      if (max && (!/^\d+$/.test(max) || +max < 1)) e.maxParticipants = 'Número inteiro positivo';
      if (!/^\d+(\.\d{1,2})?$/.test(price || '0')) e.price = 'Valor inválido';
      if (Object.keys(e).length) { setErrors(e); throw new Error('v'); }
      const body = { title: title.trim(), description: desc.trim() || undefined, startDate: new Date(start).toISOString(), endDate: end ? new Date(end).toISOString() : undefined, isOnline: online, location: location.trim() || undefined, meetingUrl: online && url.trim() ? url.trim() : undefined, maxParticipants: max ? +max : undefined, price: Number(price || 0) };
      return event ? api.patch<DonzaEvent>(`/events/${event.eventId}`, body) : api.post<DonzaEvent>('/events', body);
    },
    onSuccess: (r) => { qc.invalidateQueries({ queryKey: ['events'] }); qc.invalidateQueries({ queryKey: ['event'] }); toast.success(event ? 'Evento actualizado' : 'Evento criado'); onDone(r.eventId ?? event!.eventId); },
    onError: (e) => { if (e instanceof ApiError) { if (Object.keys(e.fieldErrors).length) setErrors(e.fieldErrors); else toast.error(e.message); } },
  });
  return (
    <form className="grid gap-5" noValidate onSubmit={(e) => { e.preventDefault(); save.mutate(); }}>
      <Field label="Título" htmlFor="e-title" error={errors.title}><Input id="e-title" autoFocus value={title} onChange={(e) => setTitle(e.target.value)} /></Field>
      <Field label="Descrição" htmlFor="e-desc" error={errors.description}><Textarea id="e-desc" rows={4} value={desc} onChange={(e) => setDesc(e.target.value)} /></Field>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Início" htmlFor="e-start" error={errors.startDate}><Input id="e-start" type="datetime-local" value={start} onChange={(e) => setStart(e.target.value)} /></Field>
        <Field label="Fim (opcional)" htmlFor="e-end" error={errors.endDate}><Input id="e-end" type="datetime-local" value={end} onChange={(e) => setEnd(e.target.value)} /></Field>
      </div>
      <div className="flex items-start gap-3 rounded-xl bg-muted/50 p-3.5"><Checkbox id="e-online" checked={online} onCheckedChange={(v) => setOnline(v === true)} className="mt-0.5" /><div><Label htmlFor="e-online">Evento online</Label><p className="text-xs text-muted-foreground">A ligação só é mostrada a quem se inscrever.</p></div></div>
      {online ? <Field label="Ligação da sessão" htmlFor="e-url" error={errors.meetingUrl}><Input id="e-url" inputMode="url" placeholder="https://…" value={url} onChange={(e) => setUrl(e.target.value)} /></Field>
        : <Field label="Local" htmlFor="e-loc" error={errors.location}><Input id="e-loc" value={location} onChange={(e) => setLocation(e.target.value)} /></Field>}
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Vagas (vazio = sem limite)" htmlFor="e-max" error={errors.maxParticipants}><Input id="e-max" inputMode="numeric" value={max} onChange={(e) => setMax(e.target.value)} /></Field>
        <Field label={`Preço (${CURRENCY}, 0 = gratuito)`} htmlFor="e-price" error={errors.price}><Input id="e-price" inputMode="decimal" value={price} onChange={(e) => setPrice(e.target.value)} /></Field>
      </div>
      <div className="flex gap-2"><Button type="submit" loading={save.isPending}>{event ? 'Guardar' : 'Criar evento'}</Button>{onCancel && <Button type="button" variant="ghost" onClick={onCancel}>Cancelar</Button>}</div>
    </form>
  );
}
