'use client';
import * as React from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { BookOpen, Compass, Plus } from 'lucide-react';
import { CourseCard, CourseCardSkeleton } from '@/components/courses/course-card';
import { PageHeader } from '@/components/layout/page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { api } from '@/lib/api/client';
import type { Course } from '@/lib/api/types';
import { useAuth } from '@/lib/auth/auth-provider';

type Enrolled = Course & { progress: number; enrollmentStatus: string };
const FILTERS = [['all', 'Todos'], ['active', 'Em curso'], ['completed', 'Concluídos']] as const;

export function MyCourses() {
  const { user } = useAuth();
  const teaches = user?.role === 'instructor' || user?.role === 'institution';
  return teaches ? <Authored /> : <Learning />;
}

function Learning() {
  const { user } = useAuth();
  const [filter, setFilter] = React.useState<(typeof FILTERS)[number][0]>('all');
  const [search, setSearch] = React.useState('');
  const q = useQuery({ queryKey: ['my-courses', user?.userId], enabled: !!user, queryFn: () => api.page<Enrolled>(`/courses/users/${user!.userId}/enrolled`, { limit: 50, sort: 'recent' }) });
  const items = (q.data?.data ?? []).filter((c) => (filter === 'all' || c.enrollmentStatus === filter) && (!search || c.title.toLowerCase().includes(search.toLowerCase())));
  return (
    <>
      <PageHeader title="Meus cursos" description="Os cursos em que está matriculado." actions={<Button asChild variant="outline"><Link href="/cursos"><Compass />Explorar mais</Link></Button>} />
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)}><TabsList>{FILTERS.map(([v, l]) => <TabsTrigger key={v} value={v}>{l}</TabsTrigger>)}</TabsList></Tabs>
        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Filtrar por título…" className="max-w-56" aria-label="Filtrar por título" />
      </div>
      {q.isLoading ? <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{[0, 1, 2].map((i) => <CourseCardSkeleton key={i} />)}</div>
        : q.isError ? <EmptyState title="Não foi possível carregar os seus cursos" action={<Button onClick={() => q.refetch()}>Tentar de novo</Button>} />
        : !items.length ? <EmptyState icon={<BookOpen />} title={q.data?.data.length ? 'Nenhum curso corresponde ao filtro' : 'Ainda não está matriculado'} description={q.data?.data.length ? undefined : 'Escolha um curso no catálogo para começar.'} action={q.data?.data.length ? undefined : <Button asChild><Link href="/cursos">Explorar cursos</Link></Button>} />
        : <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{items.map((c) => <CourseCard key={c.courseId} course={c} progress={c.progress} href={`/aprender/${c.slug}`} />)}</div>}
    </>
  );
}

function Authored() {
  const { user } = useAuth();
  const [status, setStatus] = React.useState<'published' | 'draft' | 'archived'>('published');
  const counts = useQuery({ queryKey: ['course-counts', user?.userId], enabled: !!user, queryFn: () => api.get<Record<string, number>>(`/courses/users/${user!.userId}/counts`) });
  const q = useQuery({ queryKey: ['authored', user?.userId, status], enabled: !!user, queryFn: async () => (await api.get<{ courses: Course[] }>(`/courses/users/${user!.userId}`, { status })).courses });
  const L = { published: 'Publicados', draft: 'Rascunhos', archived: 'Arquivados' } as const;
  return (
    <>
      <PageHeader title="Os meus cursos" description="Os cursos que criou." actions={<Button asChild><Link href="/gestao/novo"><Plus /> Novo curso</Link></Button>} />
      <Tabs value={status} onValueChange={(v) => setStatus(v as typeof status)} className="mb-6"><TabsList>{(Object.keys(L) as (keyof typeof L)[]).map((k) => <TabsTrigger key={k} value={k}>{L[k]}{counts.data && <Badge variant="secondary" className="ml-1 px-1.5">{counts.data[k] ?? 0}</Badge>}</TabsTrigger>)}</TabsList></Tabs>
      {q.isLoading ? <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{[0, 1, 2].map((i) => <CourseCardSkeleton key={i} />)}</div>
        : !q.data?.length ? <EmptyState icon={<BookOpen />} title={`Sem cursos ${L[status].toLowerCase()}`} action={<Button asChild><Link href="/gestao/novo"><Plus /> Criar curso</Link></Button>} />
        : <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{q.data.map((c) => <CourseCard key={c.courseId} course={c} href={`/gestao/${c.courseId}`} />)}</div>}
    </>
  );
}
