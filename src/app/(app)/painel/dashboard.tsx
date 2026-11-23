'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Award, BookOpen, CalendarDays, CheckCircle2, ClipboardList, Clock, PlayCircle, Star, Users, Compass } from 'lucide-react';
import { CourseCard, CourseCardSkeleton } from '@/components/courses/course-card';
import { CourseCover } from '@/components/courses/course-cover';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { StatCard } from '@/components/ui/stat-card';
import { api } from '@/lib/api/client';
import type { Course } from '@/lib/api/types';
import { useAuth } from '@/lib/auth/auth-provider';
import { displayName } from '@/lib/format';
import { formatDate } from '@/lib/utils';

interface StudentDash { inProgress: { enrollmentId: string; progress: number; lastAccessed: string | null; course: { courseId: string; title: string; slug: string; coverImageUrl: string | null } }[]; completedCourses: number; learningHours: number; upcomingEvents: { eventId: string; title: string; startDate: string; isOnline: boolean }[]; assignmentsDue: { assignmentId: string; title: string; dueDate: string; course: { title: string } }[]; certificates: number }
interface TeacherDash { courses: { total: number; byStatus: Record<string, number> }; students: number; completionRate: number; submissionsToGrade: number; rating: { average: number; count: number }; recentEnrollments: { enrollmentId: string; enrolledAt: string; user: { username: string; fullName: string | null }; course: { title: string } }[] }

export function Dashboard() {
  const { user } = useAuth();
  const greeting = new Date().getHours() < 12 ? 'Bom dia' : new Date().getHours() < 19 ? 'Boa tarde' : 'Boa noite';
  const first = user ? displayName(user).split(' ')[0] : '';
  const teaches = user?.role === 'instructor' || user?.role === 'institution';
  return (
    <>
      <PageHeader title={`${greeting}, ${first}`} description={teaches ? 'O resumo da sua actividade como docente.' : 'Continue de onde parou.'} />
      {user?.role === 'student' ? <StudentView /> : teaches ? <TeacherView /> : <AdminView />}
    </>
  );
}

function StudentView() {
  const { data, isLoading } = useQuery({ queryKey: ['dash-student'], queryFn: () => api.get<StudentDash>('/dashboard/student') });
  const rec = useQuery({ queryKey: ['recommended'], queryFn: () => api.page<Course>('/courses', { limit: 3, sort: 'popular' }) });
  if (isLoading || !data) return <div className="grid gap-4 sm:grid-cols-3">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-24" />)}</div>;
  const next = data.inProgress[0];
  return (
    <div className="grid gap-8">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Cursos em curso" value={data.inProgress.length} icon={<BookOpen />} />
        <StatCard label="Cursos concluídos" value={data.completedCourses} icon={<CheckCircle2 />} />
        <StatCard label="Horas de estudo" value={Math.round(data.learningHours)} icon={<Clock />} />
        <StatCard label="Certificados" value={data.certificates} icon={<Award />} />
      </div>

      {next ? (
        <Card className="overflow-hidden md:grid md:grid-cols-[280px_1fr]">
          <CourseCover title={next.course.title} src={next.course.coverImageUrl} className="h-full min-h-40 md:aspect-auto" />
          <div className="grid content-center gap-4 p-6">
            <p className="text-xs font-semibold tracking-wider text-primary uppercase">Continuar a aprender</p>
            <h2 className="text-xl font-bold">{next.course.title}</h2>
            <div className="grid max-w-md gap-1.5"><div className="flex justify-between text-sm"><span className="text-muted-foreground">Progresso</span><span className="font-semibold">{Math.round(next.progress)}%</span></div><Progress value={next.progress} /></div>
            <div><Button asChild size="lg"><Link href={`/aprender/${next.course.slug}`}><PlayCircle />Retomar curso</Link></Button></div>
          </div>
        </Card>
      ) : (
        <EmptyState icon={<Compass />} title="Ainda não tem cursos" description="Explore o catálogo e comece o seu primeiro curso hoje." action={<Button asChild><Link href="/cursos">Explorar cursos</Link></Button>} />
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card><CardHeader><CardTitle className="flex items-center gap-2"><ClipboardList className="size-4 text-primary" />Trabalhos por entregar</CardTitle></CardHeader><CardContent>
          {data.assignmentsDue.length ? <ul className="divide-y">{data.assignmentsDue.slice(0, 4).map((a) => <li key={a.assignmentId} className="flex items-center justify-between gap-3 py-3 text-sm"><span className="min-w-0"><span className="block truncate font-medium">{a.title}</span><span className="block truncate text-xs text-muted-foreground">{a.course.title}</span></span><span className="shrink-0 text-xs font-medium text-muted-foreground">{formatDate(a.dueDate, { day: 'numeric', month: 'short' })}</span></li>)}</ul> : <p className="py-4 text-sm text-muted-foreground">Sem prazos à vista. 🎉</p>}
        </CardContent></Card>
        <Card><CardHeader><CardTitle className="flex items-center gap-2"><CalendarDays className="size-4 text-primary" />Próximos eventos</CardTitle></CardHeader><CardContent>
          {data.upcomingEvents.length ? <ul className="divide-y">{data.upcomingEvents.slice(0, 4).map((e) => <li key={e.eventId} className="flex items-center justify-between gap-3 py-3 text-sm"><span className="truncate font-medium">{e.title}</span><span className="shrink-0 text-xs text-muted-foreground">{formatDate(e.startDate, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span></li>)}</ul> : <p className="py-4 text-sm text-muted-foreground">Nenhum evento agendado.</p>}
        </CardContent></Card>
      </div>

      {rec.data && rec.data.data.length > 0 && (
        <section><div className="mb-4 flex items-center justify-between"><h2 className="text-lg font-bold">Recomendados para si</h2><Button asChild variant="ghost" size="sm"><Link href="/cursos">Ver todos</Link></Button></div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{rec.isLoading ? [0, 1, 2].map((i) => <CourseCardSkeleton key={i} />) : rec.data.data.map((c) => <CourseCard key={c.courseId} course={c} />)}</div></section>
      )}
    </div>
  );
}

function TeacherView() {
  const { data, isLoading } = useQuery({ queryKey: ['dash-teacher'], queryFn: () => api.get<TeacherDash>('/dashboard/instructor') });
  if (isLoading || !data) return <div className="grid gap-4 sm:grid-cols-3">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-24" />)}</div>;
  return (
    <div className="grid gap-8">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Cursos" value={data.courses.total} icon={<BookOpen />} hint={`${data.courses.byStatus.published ?? 0} publicados`} />
        <StatCard label="Alunos" value={data.students} icon={<Users />} />
        <StatCard label="Taxa de conclusão" value={`${data.completionRate}%`} icon={<CheckCircle2 />} />
        <StatCard label="Avaliação média" value={data.rating.count ? data.rating.average.toFixed(1) : '—'} icon={<Star />} hint={`${data.rating.count} avaliações`} />
      </div>
      <Card><CardHeader><CardTitle>Matrículas recentes</CardTitle></CardHeader><CardContent>
        {data.recentEnrollments.length ? <ul className="divide-y">{data.recentEnrollments.map((e) => <li key={e.enrollmentId} className="flex items-center justify-between gap-3 py-3 text-sm"><span className="min-w-0"><span className="block truncate font-medium">{e.user.fullName ?? e.user.username}</span><span className="block truncate text-xs text-muted-foreground">{e.course.title}</span></span><span className="shrink-0 text-xs text-muted-foreground">{formatDate(e.enrolledAt)}</span></li>)}</ul> : <p className="py-4 text-sm text-muted-foreground">Ainda não há matrículas nos seus cursos.</p>}
      </CardContent></Card>
      {data.submissionsToGrade > 0 && <p className="rounded-xl bg-accent/20 p-4 text-sm font-medium">Tem {data.submissionsToGrade} entregas à espera de avaliação.</p>}
    </div>
  );
}

function AdminView() {
  const router = useRouter();
  React.useEffect(() => { router.replace('/admin'); }, [router]);
  return null;
}
