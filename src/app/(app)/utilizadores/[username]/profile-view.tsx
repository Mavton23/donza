'use client';
import * as React from 'react';
import Link from 'next/link';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Clock, Lock, MessageCircle, Settings, UserCheck, UserPlus, UserX } from 'lucide-react';
import { toast } from 'sonner';
import { ComposeDialog } from '@/components/messages/compose';
import { CourseCard } from '@/components/courses/course-card';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import { ApiError, api } from '@/lib/api/client';
import type { Course, Profile } from '@/lib/api/types';
import { formatDate, ROLE_LABEL } from '@/lib/utils';

export function ProfileView({ username }: { username: string }) {
  const qc = useQueryClient();
  const key = ['profile', username];
  const [msgOpen, setMsg] = React.useState(false);
  const q = useQuery({ queryKey: key, queryFn: () => api.get<Profile>(`/users/by-username/${encodeURIComponent(username)}`), retry: false });
  const p = q.data;
  const teaches = p?.role === 'instructor' || p?.role === 'institution';
  const visible = !!p && !!p.memberSince; // o perfil mínimo de um privado não traz memberSince
  const courses = useQuery({ queryKey: ['profile-courses', p?.userId], enabled: !!p && teaches && visible, queryFn: async () => (await api.get<{ courses: Course[] }>(`/courses/users/${p!.userId}`, { status: 'published' })).courses });

  const follow = useMutation({
    mutationFn: () => api.post<{ isFollowing: boolean; hasRequested: boolean }>(`/users/${p!.userId}/follow`),
    onSuccess: (r) => { toast.success(r.isFollowing ? 'A seguir' : 'Pedido enviado'); qc.invalidateQueries({ queryKey: key }); },
    onError: (e) => toast.error(e instanceof ApiError ? e.message : 'Não foi possível concluir.'),
  });
  const unfollow = useMutation({
    mutationFn: () => api.del(`/users/${p!.userId}/follow`),
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
    onError: (e) => toast.error(e instanceof ApiError ? e.message : 'Não foi possível concluir.'),
  });

  if (q.isLoading) return <div className="grid gap-6"><Skeleton className="h-44" /><Skeleton className="h-32" /></div>;
  if (q.isError || !p) return <EmptyState icon={<UserX />} title="Utilizador não encontrado" description="O perfil não existe ou não está disponível." action={<Button asChild variant="outline"><Link href="/painel">Voltar ao painel</Link></Button>} />;

  const v = p.viewer;
  return (
    <div className="grid gap-8">
      <section className="overflow-hidden rounded-2xl border bg-card shadow-[var(--shadow-soft)]">
        <div className="h-28 bg-gradient-to-r from-primary/80 via-primary/50 to-accent/60" />
        <div className="relative px-6 pb-6">
          <Avatar src={p.avatarUrl} name={p.name} size={96} className="-mt-12 border-4 border-card" />
          <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold">{p.name}</h1>
              <p className="mt-0.5 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">@{p.username}<Badge variant="secondary">{ROLE_LABEL[p.role]}</Badge>{p.isPrivate && <Badge variant="outline"><Lock />Privado</Badge>}{v.followsYou && !v.isSelf && <Badge variant="outline">Segue-o</Badge>}</p>
            </div>
            {v.isSelf ? <Button asChild variant="outline"><Link href="/definicoes"><Settings />Editar perfil</Link></Button>
              : <div className="flex gap-2"><Button variant="outline" onClick={() => setMsg(true)}><MessageCircle />Mensagem</Button>{v.isFollowing ? <Button variant="secondary" loading={unfollow.isPending} onClick={() => unfollow.mutate()}><UserCheck />A seguir</Button>
              : v.hasRequested ? <Button variant="secondary" loading={unfollow.isPending} onClick={() => unfollow.mutate()}><Clock />Pedido enviado</Button>
              : <Button loading={follow.isPending} onClick={() => follow.mutate()}><UserPlus />{p.isPrivate ? 'Pedir para seguir' : 'Seguir'}</Button>}</div>}
          </div>
          {visible && p.bio && <p className="mt-4 max-w-2xl whitespace-pre-line text-[15px] text-muted-foreground">{p.bio}</p>}
          <dl className="mt-5 flex flex-wrap gap-x-8 gap-y-3 text-sm">
            <div><dt className="text-muted-foreground">Seguidores</dt><dd className="text-lg font-bold tabular-nums">{p.followersCount}</dd></div>
            <div><dt className="text-muted-foreground">A seguir</dt><dd className="text-lg font-bold tabular-nums">{p.followingCount}</dd></div>
            {teaches && p.coursesCount !== undefined && <div><dt className="text-muted-foreground">Cursos</dt><dd className="text-lg font-bold tabular-nums">{p.coursesCount}</dd></div>}
            {teaches && p.studentsCount !== undefined && <div><dt className="text-muted-foreground">Alunos</dt><dd className="text-lg font-bold tabular-nums">{p.studentsCount}</dd></div>}
            {p.memberSince && <div><dt className="text-muted-foreground">Membro desde</dt><dd className="text-lg font-bold">{formatDate(p.memberSince, { month: 'short', year: 'numeric' })}</dd></div>}
          </dl>
          {visible && !!(p.expertise?.length || p.interests?.length) && <div className="mt-5 flex flex-wrap gap-2">{[...(p.expertise ?? []), ...(p.interests ?? [])].map((t) => <Badge key={t} variant="default">{t}</Badge>)}</div>}
        </div>
      </section>

      {!visible && <EmptyState icon={<Lock />} title="Este perfil é privado" description={v.hasRequested ? 'O seu pedido está a aguardar aprovação.' : 'Peça para seguir para ver mais informações.'} />}
      {visible && teaches && (courses.data?.length ? <section><h2 className="mb-4 text-lg font-bold">Cursos</h2><div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{courses.data.map((c) => <CourseCard key={c.courseId} course={c} />)}</div></section> : null)}
      {msgOpen && <ComposeDialog userId={p.userId} username={p.username} onClose={() => setMsg(false)} />}
    </div>
  );
}
