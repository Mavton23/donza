'use client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as React from 'react';
import { Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/input';
import { ApiError, api } from '@/lib/api/client';
import type { Review, ReviewEligibility, ReviewSummary } from '@/lib/api/types';
import { useAuth } from '@/lib/auth/auth-provider';
import { timeAgo } from '@/lib/utils';
import { StarInput, Stars } from './stars';

const msg = (e: unknown) => (e instanceof ApiError ? e.message : 'Sem ligação ao servidor.');
const REASON: Record<string, string> = { COURSE_NOT_COMPLETED: 'Conclua o curso para o poder avaliar.', NOT_ENROLLED: 'Só quem está matriculado pode avaliar.', EVENT_NOT_ATTENDED: 'Só quem participou no evento pode avaliar.', OWN_ENTITY: 'Não pode avaliar o seu próprio conteúdo.' };

/** Avaliações públicas de um curso ou evento, com formulário para quem é elegível. */
export function EntityReviews({ kind, id, idOrSlug }: { kind: 'course' | 'event'; id: string; idOrSlug?: string }) {
  const { status, user } = useAuth(); const qc = useQueryClient();
  const base = kind === 'course' ? `/courses/${idOrSlug ?? id}/reviews` : `/events/${id}/reviews`;
  const postBase = kind === 'course' ? `/courses/${id}/reviews` : `/events/${id}/reviews`;
  const [rating, setRating] = React.useState(''); const [sort, setSort] = React.useState('recent'); const [page, setPage] = React.useState(1);
  const summary = useQuery({ queryKey: ['reviews-summary', kind, id], queryFn: () => api.get<ReviewSummary>(`${base}/summary`) });
  const list = useQuery({ queryKey: ['reviews', kind, id, rating, sort, page], queryFn: () => api.page<Review>(base, { limit: 5, page, sort, rating: rating || undefined }) });
  const elig = useQuery({ queryKey: ['reviews-eligibility', kind, id, user?.userId], enabled: status === 'authenticated', queryFn: () => api.get<ReviewEligibility>(`${postBase}/eligibility`) });
  const refresh = () => { ['reviews', 'reviews-summary', 'reviews-eligibility', 'reviews-mine'].forEach((k) => qc.invalidateQueries({ queryKey: [k] })); qc.invalidateQueries({ queryKey: ['course'] }); };
  const s = summary.data; const total = list.data?.meta.totalPages ?? 1;
  return (
    <section aria-labelledby={`rev-${kind}`} className="grid gap-5">
      <h2 id={`rev-${kind}`} className="text-xl font-bold">Avaliações</h2>
      {summary.isLoading ? <Skeleton className="h-28 rounded-2xl" /> : s && (
        <div className="grid gap-5 rounded-2xl border bg-card p-5 sm:grid-cols-[10rem_1fr]">
          <div className="text-center sm:text-left"><p className="text-4xl font-bold tabular-nums">{s.count ? s.average.toFixed(1) : '–'}</p><Stars value={s.average} size={18} /><p className="mt-1 text-sm text-muted-foreground">{s.count} avaliaç{s.count === 1 ? 'ão' : 'ões'}</p></div>
          <ul className="grid gap-1.5 self-center" aria-label="Distribuição das notas">{([5, 4, 3, 2, 1] as const).map((n) => { const c = s.distribution[String(n) as '1']; const pct = s.count ? (c / s.count) * 100 : 0; return (
            <li key={n} className="flex items-center gap-2 text-sm"><button type="button" onClick={() => { setRating(rating === String(n) ? '' : String(n)); setPage(1); }} aria-pressed={rating === String(n)} className="w-12 text-left tabular-nums hover:underline aria-pressed:font-bold">{n} ★</button><span className="h-2 flex-1 overflow-hidden rounded-full bg-muted"><span className="block h-full rounded-full bg-amber-400" style={{ width: `${pct}%` }} /></span><span className="w-8 text-right tabular-nums text-muted-foreground">{c}</span></li>); })}</ul>
        </div>)}
      {status === 'authenticated' && elig.data && (elig.data.canReview || elig.data.reason === 'ALREADY_REVIEWED' ? <ReviewForm kind={kind} base={postBase} reviewId={elig.data.reviewId} onDone={refresh} /> : elig.data.reason && <p className="rounded-xl bg-muted/50 p-3 text-sm text-muted-foreground">{REASON[elig.data.reason] ?? 'Ainda não pode avaliar.'}</p>)}
      <div className="flex flex-wrap items-center gap-3"><Select value={sort} onValueChange={(v) => { setSort(v); setPage(1); }}><SelectTrigger className="w-44" aria-label="Ordenar"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="recent">Mais recentes</SelectItem><SelectItem value="highest">Melhor nota</SelectItem><SelectItem value="lowest">Pior nota</SelectItem></SelectContent></Select>{rating && <Button variant="ghost" size="sm" onClick={() => setRating('')}>Limpar filtro ({rating} ★)</Button>}</div>
      {list.isLoading ? <Skeleton className="h-24 rounded-2xl" /> : !list.data?.data.length ? <p className="text-sm text-muted-foreground">Ainda sem avaliações.</p> : (
        <ul className="grid gap-3">{list.data.data.map((r) => (
          <li key={r.reviewId} className="rounded-2xl border bg-card p-4">
            <div className="flex items-center gap-2 text-sm"><Avatar src={r.user.avatarUrl} name={r.user.fullName ?? r.user.username} size={28} /><span className="font-medium">{r.user.fullName ?? r.user.username}</span><Stars value={r.rating} /><span className="ml-auto text-xs text-muted-foreground">{timeAgo(r.createdAt)}</span></div>
            {r.comment && <p className="mt-2 whitespace-pre-wrap break-words text-sm">{r.comment}</p>}
            {r.instructorReply && <div className="mt-3 rounded-xl bg-muted/50 p-3 text-sm"><p className="mb-1 text-xs font-semibold text-muted-foreground">Resposta do instrutor</p><p className="whitespace-pre-wrap break-words">{r.instructorReply}</p></div>}
          </li>))}</ul>)}
      {total > 1 && <div className="flex items-center justify-center gap-2"><Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>Anterior</Button><span className="text-sm text-muted-foreground">{page} / {total}</span><Button variant="outline" size="sm" disabled={page >= total} onClick={() => setPage(page + 1)}>Seguinte</Button></div>}
    </section>
  );
}

function ReviewForm({ kind, base, reviewId, onDone }: { kind: 'course' | 'event'; base: string; reviewId?: string; onDone: () => void }) {
  const { user } = useAuth();
  const mine = useQuery({ queryKey: ['reviews-mine', reviewId], enabled: !!reviewId, queryFn: async () => { const r = await api.page<Review>(base.replace(/^\/(courses|events)\/([^/]+)\/reviews$/, (_, t, i) => `/${t}/${i}/reviews`), { limit: 50, sort: 'recent' }); return r.data.find((x) => x.reviewId === reviewId) ?? null; } });
  const [rating, setRating] = React.useState(0); const [comment, setComment] = React.useState(''); const [err, setErr] = React.useState('');
  React.useEffect(() => { if (mine.data) { setRating(mine.data.rating); setComment(mine.data.comment ?? ''); } }, [mine.data]);
  const save = useMutation({
    mutationFn: () => { if (!rating) { setErr('Escolha uma classificação'); throw new Error('v'); } return reviewId ? api.patch(`/reviews/${reviewId}`, { rating, comment: comment.trim() }) : api.post(base, { rating, comment: comment.trim() || undefined }); },
    onSuccess: () => { toast.success(reviewId ? 'Avaliação actualizada' : 'Obrigado pela sua avaliação!'); onDone(); }, onError: (e) => { if (e instanceof ApiError) toast.error(e.message); },
  });
  const remove = useMutation({ mutationFn: () => api.del(`/reviews/${reviewId}`), onSuccess: () => { setRating(0); setComment(''); toast.success('Avaliação eliminada'); onDone(); }, onError: (e) => toast.error(msg(e)) });
  void user; void kind;
  return (
    <form className="grid gap-3 rounded-2xl border bg-card p-5" noValidate onSubmit={(e) => { e.preventDefault(); save.mutate(); }}>
      <h3 className="font-semibold">{reviewId ? 'A sua avaliação' : 'Deixe a sua avaliação'}</h3>
      <StarInput value={rating} onChange={(v) => { setRating(v); setErr(''); }} />{err && <p role="alert" className="text-xs text-destructive">{err}</p>}
      <Textarea rows={3} maxLength={2000} value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Conte como foi (opcional)" aria-label="Comentário" />
      <div className="flex gap-2"><Button type="submit" loading={save.isPending}>{reviewId ? 'Guardar' : 'Publicar avaliação'}</Button>{reviewId && <Button type="button" variant="ghost" loading={remove.isPending} onClick={() => remove.mutate()}><Trash2 /> Eliminar</Button>}</div>
    </form>
  );
}
