'use client';
import * as React from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, ArrowRight, Check, CheckCircle2, Circle, ExternalLink, Lock, Menu, PartyPopper, X } from 'lucide-react';
import { toast } from 'sonner';
import { LessonIcon } from '@/components/courses/lesson-icon';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { ApiError, api } from '@/lib/api/client';
import type { CourseDetail, Lesson, Progress as ProgressT } from '@/lib/api/types';
import { cn, formatDuration, LESSON_TYPE_LABEL } from '@/lib/utils';

export function Player({ slug }: { slug: string }) {
  const router = useRouter();
  const qc = useQueryClient();
  const sp = useSearchParams();
  const [panel, setPanel] = React.useState(false);

  const course = useQuery({ queryKey: ['learn', slug], queryFn: () => api.get<CourseDetail>(`/courses/${slug}`) });
  const enrolled = !!course.data?.viewer?.isEnrolled;
  const canManage = !!course.data?.viewer?.canManage;
  const progress = useQuery({ queryKey: ['learn-progress', slug], enabled: enrolled, queryFn: () => api.get<ProgressT>(`/courses/${slug}/progress`) });

  const flat = React.useMemo(() => (course.data?.modules ?? []).flatMap((m) => m.lessons.map((l) => ({ ...l, moduleTitle: m.title }))), [course.data]);
  const done = React.useMemo(() => new Set(progress.data?.completedLessonIds ?? []), [progress.data]);

  React.useEffect(() => { if (course.data && !enrolled && !canManage) router.replace(`/cursos/${slug}`); }, [course.data, enrolled, canManage, router, slug]);

  const wanted = sp.get('aula');
  const current = flat.find((l) => l.lessonId === wanted) ?? (progress.isSuccess || !enrolled ? flat.find((l) => !done.has(l.lessonId) && !l.locked) ?? flat[0] : undefined);
  const idx = current ? flat.findIndex((l) => l.lessonId === current.lessonId) : -1;
  const next = idx >= 0 ? flat[idx + 1] : undefined;
  const prev = idx > 0 ? flat[idx - 1] : undefined;
  const go = (id: string) => { router.replace(`/aprender/${slug}?aula=${id}`, { scroll: false }); setPanel(false); window.scrollTo({ top: 0, behavior: 'smooth' }); };

  const toggle = useMutation({
    mutationFn: ({ lessonId, complete }: { lessonId: string; complete: boolean }) =>
      complete ? api.post(`/courses/${course.data!.courseId}/lessons/${lessonId}/complete`) : api.del(`/courses/${course.data!.courseId}/lessons/${lessonId}/complete`),
    onMutate: async ({ lessonId, complete }) => {
      await qc.cancelQueries({ queryKey: ['learn-progress', slug] });
      const before = qc.getQueryData<ProgressT>(['learn-progress', slug]);
      if (before) {
        const ids = complete ? [...new Set([...before.completedLessonIds, lessonId])] : before.completedLessonIds.filter((i) => i !== lessonId);
        qc.setQueryData<ProgressT>(['learn-progress', slug], { ...before, completedLessonIds: ids, completedLessons: ids.length, progress: before.totalLessons ? Math.round((ids.length / before.totalLessons) * 100) : 0 });
      }
      return { before };
    },
    onError: (e, _v, ctx) => { if (ctx?.before) qc.setQueryData(['learn-progress', slug], ctx.before); toast.error(e instanceof ApiError ? e.message : 'Não foi possível guardar o progresso.'); },
    onSettled: () => { qc.invalidateQueries({ queryKey: ['learn-progress', slug] }); qc.invalidateQueries({ queryKey: ['my-courses'] }); qc.invalidateQueries({ queryKey: ['dash-student'] }); },
  });

  if (course.isError) return <div className="grid gap-4 py-20 text-center"><p className="text-lg font-semibold">Não foi possível abrir o curso</p><div><Button asChild variant="outline"><Link href="/meus-cursos">Os meus cursos</Link></Button></div></div>;
  if (course.isLoading || !course.data) return <div className="grid gap-4"><Skeleton className="h-10 w-1/2" /><Skeleton className="aspect-video w-full" /></div>;

  const pct = progress.data?.progress ?? 0;
  const finished = enrolled && progress.data && progress.data.totalLessons > 0 && progress.data.completedLessons >= progress.data.totalLessons;
  const isDone = current ? done.has(current.lessonId) : false;

  const Sidebar = (
    <nav aria-label="Conteúdo do curso" className="grid gap-5">
      {course.data.modules.map((m) => (
        <section key={m.moduleId}>
          <h3 className="mb-1.5 px-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">{m.title}</h3>
          <ul className="grid gap-0.5">{m.lessons.map((l) => {
            const active = l.lessonId === current?.lessonId; const complete = done.has(l.lessonId);
            return (
              <li key={l.lessonId}>
                <button onClick={() => go(l.lessonId)} aria-current={active ? 'true' : undefined} className={cn('flex w-full items-start gap-2.5 rounded-lg px-2 py-2 text-left text-sm transition', active ? 'bg-primary/10 font-medium text-primary' : 'hover:bg-muted')}>
                  <span className="mt-0.5 shrink-0">{l.locked ? <Lock className="size-4 text-muted-foreground" /> : complete ? <CheckCircle2 className="size-4 text-success" /> : <Circle className="size-4 text-muted-foreground/60" />}</span>
                  <span className="min-w-0 flex-1"><span className="block">{l.title}</span><span className="mt-0.5 flex items-center gap-1.5 text-xs font-normal text-muted-foreground"><LessonIcon type={l.lessonType} className="size-3" />{LESSON_TYPE_LABEL[l.lessonType]}{l.duration ? ` · ${formatDuration(l.duration)}` : ''}</span></span>
                </button>
              </li>
            );
          })}</ul>
        </section>
      ))}
    </nav>
  );

  return (
    <div className="-mx-4 -my-8 sm:-mx-6">
      <div className="flex flex-wrap items-center gap-3 border-b bg-card px-4 py-3 sm:px-6">
        <Button asChild variant="ghost" size="icon-sm" aria-label="Voltar"><Link href={`/cursos/${slug}`}><ArrowLeft /></Link></Button>
        <div className="min-w-0 flex-1"><h1 className="truncate text-base font-semibold">{course.data.title}</h1>
          {enrolled ? <div className="mt-1 flex max-w-sm items-center gap-3"><Progress value={pct} className="h-1.5" /><span className="text-xs font-medium tabular-nums text-muted-foreground">{Math.round(pct)}%</span></div> : <p className="text-xs text-muted-foreground">Pré-visualização do curso</p>}</div>
        <Button variant="outline" size="sm" className="lg:hidden" onClick={() => setPanel(true)}><Menu />Conteúdo</Button>
      </div>

      <div className="grid lg:grid-cols-[1fr_340px]">
        <div className="min-w-0 px-4 py-6 sm:px-8">
          {finished && <div role="status" className="mb-6 flex items-center gap-3 rounded-2xl bg-success/10 p-4 text-sm"><PartyPopper className="size-5 text-success" /><p><strong>Parabéns!</strong> Concluiu todas as aulas deste curso.</p></div>}
          {!current ? <Skeleton className="aspect-video w-full" /> : (
            <article key={current.lessonId} className="mx-auto max-w-3xl">
              <p className="text-xs font-medium text-muted-foreground">{current.moduleTitle}</p>
              <h2 className="mt-1 text-2xl font-bold">{current.title}</h2>
              <div className="mt-5"><LessonBody lesson={current} /></div>
              {(current.externalResources?.length ?? 0) > 0 && (
                <div className="mt-8"><h3 className="mb-2 text-sm font-semibold">Recursos</h3><ul className="grid gap-1.5">{current.externalResources!.map((r) => <li key={r}><a href={r} target="_blank" rel="noopener noreferrer nofollow" className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"><ExternalLink className="size-3.5" />{r.replace(/^https?:\/\//, '')}</a></li>)}</ul></div>
              )}
              <div className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t pt-6">
                <Button variant="outline" disabled={!prev} onClick={() => prev && go(prev.lessonId)}><ArrowLeft />Anterior</Button>
                <div className="flex flex-wrap gap-2">
                  {enrolled && !current.locked && (
                    <Button variant={isDone ? 'secondary' : 'default'} loading={toggle.isPending} onClick={() => { toggle.mutate({ lessonId: current.lessonId, complete: !isDone }); if (!isDone && next) go(next.lessonId); }}>
                      {isDone ? <><Check />Concluída</> : next ? <>Concluir e continuar<ArrowRight /></> : <>Concluir aula<Check /></>}
                    </Button>
                  )}
                  {next && (isDone || !enrolled) && <Button variant="outline" onClick={() => go(next.lessonId)}>Seguinte<ArrowRight /></Button>}
                </div>
              </div>
            </article>
          )}
        </div>
        <aside className="hidden border-l bg-card/50 p-4 lg:block"><div className="sticky top-20 max-h-[calc(100dvh-6rem)] overflow-y-auto pr-1">{Sidebar}</div></aside>
      </div>

      {panel && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Conteúdo do curso">
          <button className="absolute inset-0 bg-black/50" aria-label="Fechar" onClick={() => setPanel(false)} />
          <div className="absolute inset-y-0 right-0 w-[min(22rem,90vw)] overflow-y-auto bg-card p-4 shadow-2xl"><div className="mb-3 flex items-center justify-between"><h2 className="font-semibold">Conteúdo</h2><Button variant="ghost" size="icon-sm" onClick={() => setPanel(false)} aria-label="Fechar"><X /></Button></div>{Sidebar}</div>
        </div>
      )}
    </div>
  );
}

function LessonBody({ lesson }: { lesson: Lesson }) {
  if (lesson.locked) return (
    <div className="grid place-items-center gap-3 rounded-2xl border border-dashed bg-muted/40 px-6 py-16 text-center"><Lock className="size-9 text-muted-foreground" /><p className="font-semibold">Esta aula está bloqueada</p><p className="max-w-sm text-sm text-muted-foreground">Matricule-se no curso para aceder ao conteúdo completo.</p></div>
  );
  const media = lesson.mediaUrl;
  return (
    <div className="grid gap-5">
      {lesson.lessonType === 'video' && media && <video key={media} src={media} controls preload="metadata" playsInline className="aspect-video w-full rounded-2xl bg-black" />}
      {lesson.lessonType === 'audio' && media && <audio key={media} src={media} controls preload="metadata" className="w-full" />}
      {lesson.lessonType === 'pdf' && media && (<><iframe key={media} src={media} title={lesson.title} className="h-[70vh] w-full rounded-2xl border bg-card" /><a href={media} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"><ExternalLink className="size-3.5" />Abrir PDF em nova janela</a></>)}
      {lesson.content && <div className="prose-lesson whitespace-pre-line">{lesson.content}</div>}
      {!media && !lesson.content && <p className="rounded-xl bg-muted p-4 text-sm text-muted-foreground">Esta aula ainda não tem conteúdo.</p>}
    </div>
  );
}
