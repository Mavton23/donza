'use client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import * as React from 'react';
import { Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { TestimonialCard } from '@/components/help/testimonial-card';
import { StarInput } from '@/components/reviews/stars';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { ApiError, api } from '@/lib/api/client';
import type { MyTestimonial, Testimonial } from '@/lib/api/types';
import { useAuth } from '@/lib/auth/auth-provider';

const msg = (e: unknown) => (e instanceof ApiError ? e.message : 'Sem ligação ao servidor.');
const ST = { pending: { label: 'Em análise', variant: 'warning' }, approved: { label: 'Publicado', variant: 'success' }, rejected: { label: 'Não publicado', variant: 'destructive' } } as const;

export function Testimonials() {
  const { status } = useAuth(); const [page, setPage] = React.useState(1);
  const list = useQuery({ queryKey: ['testimonials', page], queryFn: () => api.page<Testimonial>('/testimonials', { limit: 9, page }) });
  const total = list.data?.meta.totalPages ?? 1;
  return (
    <div className="grid gap-10">
      {list.isLoading ? <Skeleton className="h-40 rounded-2xl" /> : !list.data?.data.length ? <p className="text-center text-muted-foreground">Ainda sem testemunhos. Seja o primeiro!</p> : <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{list.data.data.map((t) => <li key={t.testimonialId}><TestimonialCard t={t} /></li>)}</ul>}
      {total > 1 && <div className="flex items-center justify-center gap-2"><Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>Anterior</Button><span className="text-sm text-muted-foreground">{page} / {total}</span><Button variant="outline" size="sm" disabled={page >= total} onClick={() => setPage(page + 1)}>Seguinte</Button></div>}
      {status === 'authenticated' ? <MyForm /> : status === 'anonymous' && <p className="text-center text-sm text-muted-foreground"><Link href="/entrar" className="font-medium text-primary hover:underline">Entre</Link> para partilhar a sua experiência.</p>}
    </div>
  );
}

function MyForm() {
  const qc = useQueryClient();
  const mine = useQuery({ queryKey: ['my-testimonial'], queryFn: () => api.get<MyTestimonial | null>('/testimonials/me') });
  const t = mine.data ?? null;
  const [rating, setRating] = React.useState(0); const [content, setContent] = React.useState(''); const [errs, setErrs] = React.useState<Record<string, string>>({});
  React.useEffect(() => { if (t) { setRating(t.rating); setContent(t.content); } }, [t]);
  const refresh = () => { qc.invalidateQueries({ queryKey: ['my-testimonial'] }); qc.invalidateQueries({ queryKey: ['testimonials'] }); };
  const save = useMutation({
    mutationFn: () => (t ? api.patch(`/testimonials/${t.testimonialId}`, { rating, content: content.trim() }) : api.post('/testimonials', { rating, content: content.trim() })),
    onSuccess: () => { toast.success(t ? 'Testemunho actualizado' : 'Obrigado! O seu testemunho será publicado depois de revisto.'); refresh(); },
    onError: (e) => { if (e instanceof ApiError && e.fieldErrors) setErrs(e.fieldErrors); else toast.error(msg(e)); },
  });
  const del = useMutation({ mutationFn: () => api.del(`/testimonials/${t!.testimonialId}`), onSuccess: () => { setRating(0); setContent(''); toast.success('Testemunho eliminado'); refresh(); }, onError: (e) => toast.error(msg(e)) });
  const submit = (e: React.FormEvent) => { e.preventDefault(); const er: Record<string, string> = {}; if (!rating) er.rating = 'Escolha uma classificação'; if (content.trim().length < 10) er.content = 'Escreva pelo menos 10 caracteres'; setErrs(er); if (!Object.keys(er).length) save.mutate(); };
  if (mine.isLoading) return <Skeleton className="h-40 rounded-2xl" />;
  return (
    <form noValidate onSubmit={submit} className="mx-auto grid w-full max-w-xl gap-3 rounded-2xl border bg-card p-6">
      <div className="flex items-center gap-2"><h2 className="font-semibold">{t ? 'O seu testemunho' : 'Partilhe a sua experiência'}</h2>{t && <Badge variant={ST[t.status].variant}>{ST[t.status].label}</Badge>}</div>
      <div><StarInput value={rating} onChange={(v) => { setRating(v); setErrs({ ...errs, rating: '' }); }} />{errs.rating && <p role="alert" className="mt-1 text-xs text-destructive">{errs.rating}</p>}</div>
      <div><Textarea rows={4} maxLength={1000} value={content} onChange={(e) => { setContent(e.target.value); setErrs({ ...errs, content: '' }); }} aria-label="Testemunho" aria-invalid={!!errs.content} placeholder="O que a Donza lhe trouxe?" />{errs.content && <p role="alert" className="mt-1 text-xs text-destructive">{errs.content}</p>}</div>
      <div className="flex gap-2"><Button type="submit" loading={save.isPending}>{t ? 'Guardar' : 'Enviar testemunho'}</Button>{t && <Button type="button" variant="ghost" loading={del.isPending} onClick={() => del.mutate()}><Trash2 /> Eliminar</Button>}</div>
    </form>
  );
}
