'use client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import * as React from 'react';
import { AlertTriangle, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { CourseForm } from '@/components/courses/course-form';
import { PageHeader } from '@/components/layout/page-header';
import { Assignments } from '@/components/manage/assignments';
import { Curriculum } from '@/components/manage/curriculum';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ApiError, api } from '@/lib/api/client';
import type { ManagedCourse, PublicationStatus } from '@/lib/api/types';

const STATUS: Record<PublicationStatus, { label: string; variant: 'success' | 'secondary' | 'outline' }> = { published: { label: 'Publicado', variant: 'success' }, draft: { label: 'Rascunho', variant: 'secondary' }, archived: { label: 'Arquivado', variant: 'outline' } };

export function CourseEditor({ courseId }: { courseId: string }) {
  const params = useSearchParams();
  const router = useRouter();
  const tab = ['detalhes', 'curriculo', 'trabalhos', 'publicacao'].includes(params.get('tab') ?? '') ? params.get('tab')! : 'detalhes';
  const q = useQuery({ queryKey: ['manage', courseId], queryFn: () => api.get<ManagedCourse>(`/courses/${courseId}`) });
  const setTab = (t: string) => router.replace(`/gestao/${courseId}?tab=${t}`, { scroll: false });

  if (q.isLoading) return <div className="grid gap-4"><Skeleton className="h-10 w-1/2" /><Skeleton className="h-64 w-full" /></div>;
  if (q.isError || !q.data) return <EmptyState title="Não foi possível abrir o curso" description={q.error instanceof ApiError ? q.error.message : undefined} action={<Button asChild><Link href="/meus-cursos">Voltar</Link></Button>} />;
  const c = q.data;
  if (c.viewer && c.viewer.canManage === false) return <EmptyState title="Sem permissão" description="Não pode gerir este curso." action={<Button asChild><Link href="/meus-cursos">Voltar</Link></Button>} />;
  const s = STATUS[c.status];

  return (
    <>
      <PageHeader title={c.title} description="Edite os detalhes, organize o currículo e publique." actions={<div className="flex items-center gap-2"><Badge variant={s.variant}>{s.label}</Badge>{c.status === 'published' && <Button asChild variant="outline" size="sm"><Link href={`/cursos/${c.slug}`}><ExternalLink /> Ver página</Link></Button>}</div>} />
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="mb-6"><TabsTrigger value="detalhes">Detalhes</TabsTrigger><TabsTrigger value="curriculo">Currículo</TabsTrigger><TabsTrigger value="trabalhos">Trabalhos</TabsTrigger><TabsTrigger value="publicacao">Publicação</TabsTrigger></TabsList>
        <TabsContent value="detalhes"><CourseForm course={c} /></TabsContent>
        <TabsContent value="curriculo"><Curriculum course={c} /></TabsContent>
        <TabsContent value="trabalhos"><Assignments courseId={courseId} /></TabsContent>
        <TabsContent value="publicacao"><Publication course={c} /></TabsContent>
      </Tabs>
    </>
  );
}

function Publication({ course }: { course: ManagedCourse }) {
  const qc = useQueryClient();
  const router = useRouter();
  const [del, setDel] = React.useState(false);
  const published = course.modules.reduce((n, m) => n + (m.isPublished ? m.lessons.filter((l) => l.isPublished).length : 0), 0);
  const setStatus = useMutation({
    mutationFn: (status: PublicationStatus) => api.patch(`/courses/${course.courseId}`, { status }),
    onSuccess: (_, status) => { qc.invalidateQueries({ queryKey: ['manage', course.courseId] }); qc.invalidateQueries({ queryKey: ['authored'] }); qc.invalidateQueries({ queryKey: ['course-counts'] }); toast.success(status === 'published' ? 'Curso publicado' : status === 'archived' ? 'Curso arquivado' : 'Curso passou a rascunho'); },
    onError: (e) => toast.error(e instanceof ApiError ? e.message : 'Sem ligação ao servidor.'),
  });
  const remove = useMutation({
    mutationFn: () => api.del(`/courses/${course.courseId}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['authored'] }); qc.invalidateQueries({ queryKey: ['course-counts'] }); toast.success('Curso eliminado'); router.replace('/meus-cursos'); },
    onError: (e) => { setDel(false); toast.error(e instanceof ApiError && e.status === 409 ? 'Este curso tem alunos matriculados. Arquive-o em vez de eliminar.' : e instanceof ApiError ? e.message : 'Sem ligação ao servidor.'); },
  });

  return (
    <div className="grid max-w-2xl gap-4">
      <div className="rounded-2xl border bg-card p-5">
        <h3 className="font-semibold">Estado: {STATUS[course.status].label}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{course.status === 'published' ? 'O curso está visível no catálogo.' : course.status === 'archived' ? 'O curso está arquivado e não aparece no catálogo.' : 'Só você vê este curso. Publique quando estiver pronto.'}</p>
        {course.status !== 'published' && published === 0 && <p className="mt-3 flex items-start gap-2 rounded-lg bg-warning/10 p-3 text-sm"><AlertTriangle className="mt-0.5 size-4 shrink-0 text-warning" /> Ainda não tem aulas publicadas. Os alunos verão um curso vazio.</p>}
        <div className="mt-4 flex flex-wrap gap-2">
          {course.status !== 'published' && <Button loading={setStatus.isPending} onClick={() => setStatus.mutate('published')}>Publicar curso</Button>}
          {course.status === 'published' && <Button variant="outline" loading={setStatus.isPending} onClick={() => setStatus.mutate('draft')}>Passar a rascunho</Button>}
          {course.status !== 'archived' && <Button variant="outline" disabled={setStatus.isPending} onClick={() => setStatus.mutate('archived')}>Arquivar</Button>}
        </div>
      </div>
      <div className="rounded-2xl border border-destructive/30 p-5">
        <h3 className="font-semibold">Zona de perigo</h3>
        <p className="mt-1 text-sm text-muted-foreground">Eliminar apaga o curso e o seu currículo. Cursos com alunos matriculados só podem ser arquivados.</p>
        <Button variant="destructive" className="mt-4" onClick={() => setDel(true)}>Eliminar curso</Button>
      </div>
      <Dialog open={del} onOpenChange={setDel}>
        <DialogContent><DialogHeader><DialogTitle>Eliminar “{course.title}”?</DialogTitle><DialogDescription>Esta acção não pode ser anulada.</DialogDescription></DialogHeader><DialogFooter><Button variant="ghost" onClick={() => setDel(false)}>Cancelar</Button><Button variant="destructive" loading={remove.isPending} onClick={() => remove.mutate()}>Eliminar</Button></DialogFooter></DialogContent>
      </Dialog>
    </div>
  );
}
