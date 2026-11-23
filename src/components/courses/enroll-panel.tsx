'use client';
import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Award, BookOpen, Clock, Globe, PlayCircle, Signal } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ApiError, api } from '@/lib/api/client';
import { useAuth } from '@/lib/auth/auth-provider';
import type { Course, CourseDetail } from '@/lib/api/types';
import { formatPrice, LEVEL_LABEL } from '@/lib/utils';
import { CheckoutDialog } from './checkout-dialog';

type Viewer = NonNullable<CourseDetail['viewer']> & { enrollment?: { progress: number } | null };

export function useCourseViewer(slug: string) {
  const { status } = useAuth();
  return useQuery({ queryKey: ['course-viewer', slug], enabled: status === 'authenticated', queryFn: async () => (await api.get<CourseDetail>(`/courses/${slug}`)).viewer as Viewer | null });
}

export function EnrollPanel({ course }: { course: Course & { modules?: { lessons: unknown[] }[] } }) {
  const router = useRouter();
  const qc = useQueryClient();
  const { status, user } = useAuth();
  const viewer = useCourseViewer(course.slug);
  const [checkout, setCheckout] = React.useState(false);
  const price = Number(course.price);
  const enrolled = !!viewer.data?.isEnrolled;
  const canManage = !!viewer.data?.canManage;

  const enroll = useMutation({
    mutationFn: () => api.post(`/courses/${course.courseId}/enroll`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['course-viewer', course.slug] }); qc.invalidateQueries({ queryKey: ['my-courses'] }); toast.success('Matrícula concluída!'); router.push(`/aprender/${course.slug}`); },
    onError: (e) => {
      if (e instanceof ApiError && e.code === 'PAYMENT_REQUIRED') setCheckout(true);
      else toast.error(e instanceof ApiError ? e.message : 'Não foi possível concluir a matrícula.');
    },
  });

  const next = encodeURIComponent(`/cursos/${course.slug}`);
  const lessons = course.metrics?.lessonsCount;

  return (
    <div className="grid gap-5 rounded-2xl border bg-card p-6 shadow-[var(--shadow-soft)]">
      <div className="flex items-baseline gap-2"><span className="text-3xl font-bold">{formatPrice(course.price, course.currency)}</span></div>

      {status === 'loading' || (status === 'authenticated' && viewer.isLoading) ? (
        <div className="h-12 animate-pulse rounded-xl bg-muted" />
      ) : status === 'anonymous' ? (
        <>
          <Button asChild size="lg"><Link href={`/entrar?next=${next}`}>{price ? 'Entrar para comprar' : 'Entrar para se matricular'}</Link></Button>
          <p className="text-center text-xs text-muted-foreground">Ainda sem conta? <Link href={`/registar?next=${next}`} className="font-medium text-primary hover:underline">Crie uma grátis</Link></p>
        </>
      ) : enrolled ? (
        <>
          {typeof viewer.data?.enrollment?.progress === 'number' && <div className="grid gap-1.5"><div className="flex justify-between text-sm"><span className="text-muted-foreground">O seu progresso</span><span className="font-semibold">{Math.round(viewer.data.enrollment.progress)}%</span></div><Progress value={viewer.data.enrollment.progress} /></div>}
          <Button asChild size="lg"><Link href={`/aprender/${course.slug}`}><PlayCircle />Continuar a aprender</Link></Button>
        </>
      ) : canManage ? (
        <Button asChild size="lg" variant="secondary"><Link href={`/aprender/${course.slug}`}><BookOpen />Pré-visualizar como aluno</Link></Button>
      ) : user && user.role !== 'student' ? (
        <p className="rounded-xl bg-muted p-3 text-sm text-muted-foreground">Contas de {user.role === 'admin' ? 'administrador' : 'instrutor'} não se matriculam em cursos.</p>
      ) : (
        <Button size="lg" variant={price ? 'accent' : 'default'} loading={enroll.isPending} onClick={() => (price ? setCheckout(true) : enroll.mutate())}>{price ? 'Comprar curso' : 'Matricular-me grátis'}</Button>
      )}

      <ul className="grid gap-3 border-t pt-5 text-sm">
        {[
          [Signal, LEVEL_LABEL[course.level] ?? course.level], [Globe, course.language === 'Portuguese' ? 'Português' : course.language],
          course.duration ? [Clock, `${course.duration} horas de conteúdo`] : null, lessons ? [BookOpen, `${lessons} aulas`] : null, [Award, 'Certificado de conclusão'],
        ].filter(Boolean).map((row) => { const [I, t] = row as [typeof Clock, string]; return <li key={t} className="flex items-center gap-3"><I className="size-4 text-muted-foreground" />{t}</li>; })}
      </ul>
      {price > 0 && <CheckoutDialog course={course} open={checkout} onOpenChange={setCheckout} />}
    </div>
  );
}
