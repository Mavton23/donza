'use client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import * as React from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { Pager, errMsg } from '@/components/admin/common';
import { PageHeader } from '@/components/layout/page-header';
import { Stars } from '@/components/reviews/stars';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { api } from '@/lib/api/client';
import type { Review } from '@/lib/api/types';
import { timeAgo } from '@/lib/utils';

type Row = Review & { isPublic: boolean };

export function ReviewModeration() {
  const qc = useQueryClient(); const [vis, setVis] = React.useState('all'); const [entity, setEntity] = React.useState('all'); const [rating, setRating] = React.useState('all'); const [page, setPage] = React.useState(1);
  const list = useQuery({ queryKey: ['admin-reviews', vis, entity, rating, page], queryFn: () => api.page<Row>('/admin/reviews', { limit: 10, page, isPublic: vis === 'all' ? undefined : vis, entity: entity === 'all' ? undefined : entity, rating: rating === 'all' ? undefined : rating }) });
  const toggle = useMutation({ mutationFn: (r: Row) => api.patch(`/reviews/${r.reviewId}/visibility`, { isPublic: !r.isPublic }), onSuccess: (_, r) => { toast.success(r.isPublic ? 'Avaliação ocultada' : 'Avaliação visível'); qc.invalidateQueries({ queryKey: ['admin-reviews'] }); }, onError: (e) => toast.error(errMsg(e)) });
  const reset = (set: (v: string) => void) => (v: string) => { set(v); setPage(1); };
  return (
    <div>
      <PageHeader title="Moderação de avaliações" description="Oculte avaliações impróprias sem as apagar." />
      <div className="flex flex-wrap gap-3">
        <Select value={vis} onValueChange={reset(setVis)}><SelectTrigger className="w-44" aria-label="Visibilidade"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Todas</SelectItem><SelectItem value="true">Visíveis</SelectItem><SelectItem value="false">Ocultas</SelectItem></SelectContent></Select>
        <Select value={entity} onValueChange={reset(setEntity)}><SelectTrigger className="w-40" aria-label="Tipo"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Cursos e eventos</SelectItem><SelectItem value="course">Cursos</SelectItem><SelectItem value="event">Eventos</SelectItem></SelectContent></Select>
        <Select value={rating} onValueChange={reset(setRating)}><SelectTrigger className="w-40" aria-label="Nota"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Todas as notas</SelectItem>{[5, 4, 3, 2, 1].map((n) => <SelectItem key={n} value={String(n)}>{n} estrelas</SelectItem>)}</SelectContent></Select>
      </div>
      <div className="mt-4 grid gap-3">
        {list.isLoading ? <Skeleton className="h-28 rounded-2xl" /> : !list.data?.data.length ? <EmptyState title="Sem avaliações" description="Nada corresponde a estes filtros." /> : list.data.data.map((r) => (
          <article key={r.reviewId} className={`rounded-2xl border bg-card p-4 ${r.isPublic ? '' : 'opacity-70'}`}>
            <div className="flex flex-wrap items-center gap-2 text-sm"><Avatar src={r.user.avatarUrl} name={r.user.fullName ?? r.user.username} size={28} /><span className="font-medium">{r.user.fullName ?? r.user.username}</span><Stars value={r.rating} />{!r.isPublic && <Badge variant="secondary">Oculta</Badge>}<span className="ml-auto text-xs text-muted-foreground">{timeAgo(r.createdAt)}</span></div>
            <p className="mt-1 text-xs text-muted-foreground">em {r.course ? <Link href={`/cursos/${r.course.slug}`} className="hover:underline">{r.course.title}</Link> : r.event ? <Link href={`/eventos/${r.event.eventId}`} className="hover:underline">{r.event.title}</Link> : '—'}</p>
            {r.comment && <p className="mt-2 whitespace-pre-wrap break-words text-sm">{r.comment}</p>}
            <Button size="sm" variant="outline" className="mt-3" loading={toggle.isPending && toggle.variables?.reviewId === r.reviewId} onClick={() => toggle.mutate(r)}>{r.isPublic ? <><EyeOff /> Ocultar</> : <><Eye /> Tornar visível</>}</Button>
          </article>))}
      </div>
      <Pager page={page} total={list.data?.meta.totalPages ?? 1} onPage={setPage} />
    </div>
  );
}
