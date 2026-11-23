import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Check, ChevronRight, Star } from 'lucide-react';
import { CourseCover } from '@/components/courses/course-cover';
import { EnrollPanel } from '@/components/courses/enroll-panel';
import { LessonIcon } from '@/components/courses/lesson-icon';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { EntityReviews } from '@/components/reviews/entity-reviews';
import { serverGet } from '@/lib/api/server';
import type { CourseDetail } from '@/lib/api/types';
import { displayName } from '@/lib/format';
import { formatDuration, LEVEL_LABEL } from '@/lib/utils';

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const res = await serverGet<CourseDetail>(`/courses/${slug}`);
  if (!res) return { title: 'Curso' };
  const c = res.data;
  return { title: c.title, description: c.shortDescription ?? undefined, openGraph: { title: c.title, description: c.shortDescription ?? undefined, images: c.coverImageUrl ? [c.coverImageUrl] : undefined } };
}

export default async function CoursePage({ params }: Props) {
  const { slug } = await params;
  const res = await serverGet<CourseDetail>(`/courses/${slug}`);
  if (!res) notFound();
  const c = res.data;
  const rating = Number(c.ratingAverage);
  const lessonsTotal = c.modules.reduce((n, m) => n + m.lessons.length, 0);
  const author = c.organizer ?? c.instructor;

  return (
    <div>
      <section className="border-b bg-secondary/40">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
          <nav aria-label="Localização" className="mb-5 flex items-center gap-1.5 text-sm text-muted-foreground">
            <Link href="/cursos" className="hover:text-foreground">Cursos</Link><ChevronRight className="size-3.5" />{c.category && <><Link href={`/cursos?category=${encodeURIComponent(c.category)}`} className="hover:text-foreground">{c.category}</Link><ChevronRight className="size-3.5" /></>}<span className="truncate text-foreground">{c.title}</span>
          </nav>
          <div className="max-w-3xl">
            <div className="flex flex-wrap items-center gap-2"><Badge variant="secondary">{LEVEL_LABEL[c.level]}</Badge>{c.category && <Badge variant="outline">{c.category}</Badge>}</div>
            <h1 className="mt-3 text-3xl leading-tight font-bold sm:text-4xl">{c.title}</h1>
            {c.shortDescription && <p className="mt-3 text-lg text-muted-foreground">{c.shortDescription}</p>}
            <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
              {rating > 0 && <span className="inline-flex items-center gap-1.5 font-medium"><Star className="size-4 fill-accent text-accent" />{rating.toFixed(1)} <span className="font-normal text-muted-foreground">({c.ratingCount} avaliações)</span></span>}
              <Link href={`/utilizadores/${author.username}`} className="inline-flex items-center gap-2 hover:text-primary"><Avatar src={author.avatarUrl} name={displayName(author)} size={26} />{displayName(author)}</Link>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[1fr_360px]">
        <div className="grid min-w-0 content-start gap-12">
          {c.learningOutcomes.length > 0 && (
            <section aria-labelledby="h-learn" className="rounded-2xl border bg-card p-6">
              <h2 id="h-learn" className="text-xl font-bold">O que vai aprender</h2>
              <ul className="mt-4 grid gap-3 sm:grid-cols-2">{c.learningOutcomes.map((o) => <li key={o} className="flex items-start gap-2.5 text-sm"><Check className="mt-0.5 size-4 shrink-0 text-success" />{o}</li>)}</ul>
            </section>
          )}
          {c.description && <section aria-labelledby="h-desc"><h2 id="h-desc" className="text-xl font-bold">Sobre o curso</h2><div className="prose-lesson mt-3 whitespace-pre-line text-muted-foreground">{c.description}</div></section>}

          <section aria-labelledby="h-curr">
            <div className="flex flex-wrap items-baseline justify-between gap-2"><h2 id="h-curr" className="text-xl font-bold">Conteúdo do curso</h2><p className="text-sm text-muted-foreground">{c.modules.length} módulos · {lessonsTotal} aulas</p></div>
            <Accordion type="multiple" defaultValue={c.modules.slice(0, 1).map((m) => m.moduleId)} className="mt-4 grid gap-3">
              {c.modules.map((m) => (
                <AccordionItem key={m.moduleId} value={m.moduleId}>
                  <AccordionTrigger><span>{m.title}<span className="ml-2 text-xs font-normal text-muted-foreground">{m.lessons.length} aulas</span></span></AccordionTrigger>
                  <AccordionContent>
                    <ul className="divide-y">{m.lessons.map((l) => (
                      <li key={l.lessonId} className="flex items-center gap-3 px-4 py-3 text-sm"><LessonIcon type={l.lessonType} locked={l.locked} className="size-4 shrink-0 text-muted-foreground" /><span className="min-w-0 flex-1 truncate">{l.title}</span>{l.isFree && <Badge variant="success">Pré-visualização</Badge>}{l.duration ? <span className="text-xs text-muted-foreground">{formatDuration(l.duration)}</span> : null}</li>
                    ))}</ul>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </section>

          {c.requirements.length > 0 && <section aria-labelledby="h-req"><h2 id="h-req" className="text-xl font-bold">Requisitos</h2><ul className="mt-3 grid list-disc gap-1.5 pl-5 text-sm text-muted-foreground">{c.requirements.map((r) => <li key={r}>{r}</li>)}</ul></section>}

          <section aria-labelledby="h-inst" className="rounded-2xl border bg-card p-6">
            <h2 id="h-inst" className="text-xl font-bold">{c.organizer ? 'Organização' : 'Instrutor'}</h2>
            <Link href={`/utilizadores/${author.username}`} className="mt-4 flex items-start gap-4 hover:opacity-90">
              <Avatar src={author.avatarUrl} name={displayName(author)} size={56} />
              <div><p className="font-semibold">{displayName(author)}</p>{author.bio && <p className="mt-1 text-sm text-muted-foreground">{author.bio}</p>}</div>
            </Link>
          </section>

          <EntityReviews kind="course" id={c.courseId} idOrSlug={c.slug} />
        </div>

        <aside className="lg:-mt-48">
          <div className="grid gap-5 lg:sticky lg:top-24">
            <div className="overflow-hidden rounded-2xl border shadow-[var(--shadow-soft)]"><CourseCover title={c.title} category={c.category} src={c.coverImageUrl} priority /></div>
            <EnrollPanel course={c} />
          </div>
        </aside>
      </div>
    </div>
  );
}
