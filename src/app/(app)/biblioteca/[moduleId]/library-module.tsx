'use client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import * as React from 'react';
import { ArrowLeft, Eye, EyeOff, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { LessonIcon } from '@/components/courses/lesson-icon';
import { PageHeader } from '@/components/layout/page-header';
import { LessonDialog } from '@/components/manage/lesson-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import { ApiError, api } from '@/lib/api/client';
import type { ManagedLesson } from '@/lib/api/types';
import { formatDuration } from '@/lib/utils';

interface Mod { moduleId: string; title: string; description: string | null; isPublished: boolean; courseId: string | null; lessons: ManagedLesson[] }
const msg = (e: unknown) => (e instanceof ApiError ? e.message : 'Sem ligação ao servidor.');

export function LibraryModule({ moduleId }: { moduleId: string }) {
  const qc = useQueryClient();
  const key = ['library-module', moduleId];
  const q = useQuery({ queryKey: key, queryFn: () => api.get<Mod>(`/library/modules/${moduleId}`) });
  const [del, setDel] = React.useState<ManagedLesson | null>(null);
  const [dlg, setDlg] = React.useState<{ lesson?: ManagedLesson } | null>(null);
  const run = useMutation({ mutationFn: (fn: () => Promise<unknown>) => fn(), onSuccess: () => { qc.invalidateQueries({ queryKey: key }); qc.invalidateQueries({ queryKey: ['library-modules'] }); }, onError: (e) => toast.error(msg(e)) });
  if (q.isLoading) return <Skeleton className="h-64 w-full" />;
  if (q.isError || !q.data) return <EmptyState title="Módulo não encontrado" action={<Button asChild><Link href="/biblioteca">Voltar</Link></Button>} />;
  const m = q.data;
  const lessons = [...m.lessons].sort((a, b) => a.order - b.order);
  const base = `/library/modules/${moduleId}/lessons`;
  return (
    <>
      <Button asChild variant="ghost" size="sm" className="mb-3 -ml-2"><Link href="/biblioteca"><ArrowLeft /> Biblioteca</Link></Button>
      <PageHeader title={m.title} description={m.description ?? undefined} actions={<div className="flex items-center gap-2"><Badge variant={m.isPublished ? 'success' : 'outline'}>{m.isPublished ? 'Publicado' : 'Rascunho'}</Badge><Button variant="outline" size="sm" loading={run.isPending} onClick={() => run.mutate(() => api.patch(`/library/modules/${moduleId}`, { isPublished: !m.isPublished }))}>{m.isPublished ? 'Passar a rascunho' : 'Publicar módulo'}</Button></div>} />
      <div className="mb-4 flex justify-end"><Button onClick={() => setDlg({})}><Plus /> Nova aula</Button></div>
      {!lessons.length ? <EmptyState title="Sem aulas" description="Adicione a primeira aula deste módulo." /> : (
        <ul className="divide-y rounded-2xl border bg-card">{lessons.map((l) => (
          <li key={l.lessonId} className="flex flex-wrap items-center gap-2 px-4 py-2.5">
            <LessonIcon type={l.lessonType} className="size-4 text-muted-foreground" />
            <button type="button" className="min-w-0 flex-1 truncate text-left text-sm font-medium hover:underline" onClick={() => setDlg({ lesson: l })}>{l.title}</button>
            {l.duration ? <span className="text-xs text-muted-foreground">{formatDuration(l.duration)}</span> : null}
            {!l.isPublished && <Badge variant="outline">Rascunho</Badge>}
            <Button variant="ghost" size="icon-sm" aria-label={l.isPublished ? 'Passar aula a rascunho' : 'Publicar aula'} onClick={() => run.mutate(() => api.patch(`${base}/${l.lessonId}`, { isPublished: !l.isPublished }))}>{l.isPublished ? <Eye /> : <EyeOff />}</Button>
            <Button variant="ghost" size="icon-sm" aria-label="Eliminar aula" onClick={() => setDel(l)}><Trash2 /></Button>
          </li>))}</ul>)}
      <Dialog open={!!del} onOpenChange={(o) => !o && setDel(null)}><DialogContent><DialogHeader><DialogTitle>Eliminar “{del?.title}”?</DialogTitle><DialogDescription>Esta acção não pode ser anulada.</DialogDescription></DialogHeader><DialogFooter><Button variant="ghost" onClick={() => setDel(null)}>Cancelar</Button><Button variant="destructive" loading={run.isPending} onClick={() => run.mutate(() => api.del(`${base}/${del!.lessonId}`), { onSuccess: () => setDel(null) })}>Eliminar</Button></DialogFooter></DialogContent></Dialog>
      {dlg && <LessonDialog library moduleId={moduleId} lesson={dlg.lesson} open onOpenChange={(o) => !o && setDlg(null)} />}
    </>
  );
}
