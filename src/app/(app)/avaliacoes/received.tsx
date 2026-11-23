'use client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import * as React from 'react';
import { MessageSquareReply, Star, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '@/components/layout/page-header';
import { Stars } from '@/components/reviews/stars';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { Textarea } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { StatCard } from '@/components/ui/stat-card';
import { ApiError, api } from '@/lib/api/client';
import type { Review } from '@/lib/api/types';
import { useAuth } from '@/lib/auth/auth-provider';
import { timeAgo } from '@/lib/utils';

interface Analytics { count: number; average: number; distribution: Record<string, number>; unanswered: number; byCourse: { courseId: string; title: string; count: number; average: number }[]; monthly: { month: string; count: number; average: number }[] }
const msg = (e: unknown) => (e instanceof ApiError ? e.message : 'Sem ligação ao servidor.');

export function ReceivedReviews() {
  const { user } = useAuth(); const router = useRouter(); const qc = useQueryClient();
  const allowed = !!user && ['instructor', 'institution'].includes(user.role);
  React.useEffect(() => { if (user && !allowed) router.replace('/painel'); }, [user, allowed, router]);
  const [replied, setReplied] = React.useState('all'); const [rating, setRating] = React.useState('all'); const [page, setPage] = React.useState(1);
  const an = useQuery({ queryKey: ['reviews-analytics'], enabled: allowed, queryFn: () => api.get<Analytics>('/reviews/analytics') });
  const list = useQuery({ queryKey: ['reviews-received', replied, rating, page], enabled: allowed, queryFn: () => api.page<Review>('/reviews/received', { limit: 10, page, replied: replied === 'all' ? undefined : replied, rating: rating === 'all' ? undefined : rating }) });
  const refresh = () => { qc.invalidateQueries({ queryKey: ['reviews-received'] }); qc.invalidateQueries({ queryKey: ['reviews-analytics'] }); };
  if (!allowed) return null;
  const a = an.data; const total = list.data?.meta.totalPages ?? 1;
  return (
    <div>
      <PageHeader title="Avaliações" description="O que os alunos dizem dos seus cursos e eventos." />
      {an.isLoading ? <Skeleton className="h-24 rounded-2xl" /> : a && (
        <>
          <div className="grid gap-3 sm:grid-cols-3">
            <StatCard label="Nota média" value={a.count ? a.average.toFixed(1) : '–'} icon={<Star />} />
            <StatCard label="Avaliações" value={String(a.count)} icon={<Star />} />
            <StatCard label="Por responder" value={String(a.unanswered)} icon={<MessageSquareReply />} />
          </div>
          {a.byCourse.length > 0 && (
            <section aria-labelledby="by-course" className="mt-6 rounded-2xl border bg-card p-5">
              <h2 id="by-course" className="font-semibold">Por curso</h2>
              <ul className="mt-3 divide-y">{a.byCourse.map((c) => <li key={c.courseId} className="flex items-center gap-3 py-2 text-sm"><span className="min-w-0 flex-1 truncate">{c.title}</span><Stars value={c.average} /><span className="w-10 text-right tabular-nums">{c.average.toFixed(1)}</span><span className="w-20 text-right text-muted-foreground">{c.count} aval.</span></li>)}</ul>
            </section>)}
        </>)}
      <div className="mt-6 flex flex-wrap gap-3">
        <Select value={replied} onValueChange={(v) => { setReplied(v); setPage(1); }}><SelectTrigger className="w-48" aria-label="Estado da resposta"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Todas</SelectItem><SelectItem value="false">Por responder</SelectItem><SelectItem value="true">Respondidas</SelectItem></SelectContent></Select>
        <Select value={rating} onValueChange={(v) => { setRating(v); setPage(1); }}><SelectTrigger className="w-40" aria-label="Nota"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Todas as notas</SelectItem>{[5, 4, 3, 2, 1].map((n) => <SelectItem key={n} value={String(n)}>{n} estrelas</SelectItem>)}</SelectContent></Select>
      </div>
      <div className="mt-4 grid gap-3">
        {list.isLoading ? <Skeleton className="h-28 rounded-2xl" /> : !list.data?.data.length ? <EmptyState title="Sem avaliações" description="Quando os alunos avaliarem, aparecem aqui." /> : list.data.data.map((r) => <ReviewRow key={r.reviewId} r={r} onChange={refresh} />)}
      </div>
      {total > 1 && <div className="mt-4 flex items-center justify-center gap-2"><Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>Anterior</Button><span className="text-sm text-muted-foreground">{page} / {total}</span><Button variant="outline" size="sm" disabled={page >= total} onClick={() => setPage(page + 1)}>Seguinte</Button></div>}
    </div>
  );
}

function ReviewRow({ r, onChange }: { r: Review; onChange: () => void }) {
  const [editing, setEditing] = React.useState(false); const [text, setText] = React.useState(r.instructorReply ?? ''); const [err, setErr] = React.useState('');
  const save = useMutation({ mutationFn: () => api.put(`/reviews/${r.reviewId}/reply`, { reply: text.trim() }), onSuccess: () => { toast.success('Resposta guardada'); setEditing(false); onChange(); }, onError: (e) => { if (e instanceof ApiError && e.fieldErrors?.reply) setErr(e.fieldErrors.reply); else toast.error(msg(e)); } });
  const del = useMutation({ mutationFn: () => api.del(`/reviews/${r.reviewId}/reply`), onSuccess: () => { setText(''); toast.success('Resposta eliminada'); onChange(); }, onError: (e) => toast.error(msg(e)) });
  const target = r.course ? <Link href={`/cursos/${r.course.slug}`} className="hover:underline">{r.course.title}</Link> : r.event ? <Link href={`/eventos/${r.event.eventId}`} className="hover:underline">{r.event.title}</Link> : null;
  return (
    <article className="rounded-2xl border bg-card p-4">
      <div className="flex flex-wrap items-center gap-2 text-sm"><Avatar src={r.user.avatarUrl} name={r.user.fullName ?? r.user.username} size={28} /><span className="font-medium">{r.user.fullName ?? r.user.username}</span><Stars value={r.rating} /><span className="ml-auto text-xs text-muted-foreground">{timeAgo(r.createdAt)}</span></div>
      {target && <p className="mt-1 text-xs text-muted-foreground">em {target}</p>}
      {r.comment && <p className="mt-2 whitespace-pre-wrap break-words text-sm">{r.comment}</p>}
      {editing ? (
        <form className="mt-3 grid gap-2" noValidate onSubmit={(e) => { e.preventDefault(); if (!text.trim()) { setErr('Escreva uma resposta'); return; } setErr(''); save.mutate(); }}>
          <Textarea rows={3} maxLength={1000} value={text} onChange={(e) => setText(e.target.value)} aria-label="Resposta" aria-invalid={!!err} />{err && <p role="alert" className="text-xs text-destructive">{err}</p>}
          <div className="flex gap-2"><Button type="submit" size="sm" loading={save.isPending}>Guardar resposta</Button><Button type="button" size="sm" variant="ghost" onClick={() => setEditing(false)}>Cancelar</Button></div>
        </form>
      ) : r.instructorReply ? (
        <div className="mt-3 rounded-xl bg-muted/50 p-3 text-sm"><p className="mb-1 text-xs font-semibold text-muted-foreground">A sua resposta</p><p className="whitespace-pre-wrap break-words">{r.instructorReply}</p>
          <div className="mt-2 flex gap-1"><Button size="sm" variant="ghost" onClick={() => setEditing(true)}>Editar</Button><Button size="sm" variant="ghost" loading={del.isPending} onClick={() => del.mutate()}><Trash2 /> Eliminar</Button></div></div>
      ) : <Button size="sm" variant="outline" className="mt-3" onClick={() => setEditing(true)}><MessageSquareReply /> Responder</Button>}
    </article>
  );
}
