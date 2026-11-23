'use client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import * as React from 'react';
import { Layers, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '@/components/layout/page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { EmptyState } from '@/components/ui/empty-state';
import { Field } from '@/components/ui/field';
import { Input, Textarea } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { ApiError, api, requestPage } from '@/lib/api/client';
import type { Course } from '@/lib/api/types';
import { useAuth } from '@/lib/auth/auth-provider';

export interface LibModule { moduleId: string; title: string; description: string | null; isPublished: boolean; lessonsCount: number }
const msg = (e: unknown) => (e instanceof ApiError ? e.message : 'Sem ligação ao servidor.');

export function LibraryList() {
  const { user } = useAuth();
  const router = useRouter();
  const qc = useQueryClient();
  const allowed = !!user && ['instructor', 'institution', 'admin'].includes(user.role);
  React.useEffect(() => { if (user && !allowed) router.replace('/painel'); }, [user, allowed, router]);
  const q = useQuery({ queryKey: ['library-modules'], enabled: allowed, queryFn: () => requestPage<LibModule>('/library/modules', { query: { limit: 50 } }) });
  const [create, setCreate] = React.useState(false);
  const [attach, setAttach] = React.useState<LibModule | null>(null);
  const [del, setDel] = React.useState<LibModule | null>(null);
  const remove = useMutation({
    mutationFn: (id: string) => api.del(`/library/modules/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['library-modules'] }); toast.success('Módulo eliminado'); setDel(null); },
    onError: (e) => { toast.error(msg(e)); setDel(null); },
  });
  if (!allowed) return null;
  const items = q.data?.data ?? [];
  return (
    <>
      <PageHeader title="Biblioteca" description="Módulos reutilizáveis, ainda sem curso. Prepare-os aqui e junte-os a qualquer curso seu." actions={<Button onClick={() => setCreate(true)}><Plus /> Novo módulo</Button>} />
      {q.isLoading ? <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-36 rounded-2xl" />)}</div>
        : q.isError ? <EmptyState title="Não foi possível carregar a biblioteca" action={<Button onClick={() => q.refetch()}>Tentar de novo</Button>} />
        : !items.length ? <EmptyState icon={<Layers />} title="A biblioteca está vazia" description="Módulos ligados a um curso aparecem no curso, não aqui." action={<Button onClick={() => setCreate(true)}><Plus /> Criar módulo</Button>} />
        : <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{items.map((m) => (
          <article key={m.moduleId} className="flex flex-col gap-3 rounded-2xl border bg-card p-5">
            <div className="flex items-start justify-between gap-2"><h3 className="font-semibold leading-snug"><Link href={`/biblioteca/${m.moduleId}`} className="hover:underline">{m.title}</Link></h3><Badge variant={m.isPublished ? 'success' : 'outline'}>{m.isPublished ? 'Publicado' : 'Rascunho'}</Badge></div>
            {m.description && <p className="line-clamp-2 text-sm text-muted-foreground">{m.description}</p>}
            <p className="text-xs text-muted-foreground">{m.lessonsCount} aula(s)</p>
            <div className="mt-auto flex gap-2"><Button asChild variant="outline" size="sm"><Link href={`/biblioteca/${m.moduleId}`}>Editar</Link></Button><Button variant="secondary" size="sm" onClick={() => setAttach(m)}>Juntar a curso</Button><Button variant="ghost" size="icon-sm" className="ml-auto" aria-label="Eliminar módulo" onClick={() => setDel(m)}><Trash2 /></Button></div>
          </article>))}</div>}
      {create && <CreateDialog onClose={() => setCreate(false)} />}
      {attach && <AttachDialog module={attach} onClose={() => setAttach(null)} />}
      <Dialog open={!!del} onOpenChange={(o) => !o && setDel(null)}><DialogContent><DialogHeader><DialogTitle>Eliminar “{del?.title}”?</DialogTitle><DialogDescription>As aulas do módulo também são eliminadas.</DialogDescription></DialogHeader><DialogFooter><Button variant="ghost" onClick={() => setDel(null)}>Cancelar</Button><Button variant="destructive" loading={remove.isPending} onClick={() => remove.mutate(del!.moduleId)}>Eliminar</Button></DialogFooter></DialogContent></Dialog>
    </>
  );
}

function CreateDialog({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const qc = useQueryClient();
  const [title, setTitle] = React.useState(''); const [description, setDescription] = React.useState(''); const [err, setErr] = React.useState('');
  const save = useMutation({
    mutationFn: () => { if (title.trim().length < 3) { setErr('Mínimo de 3 caracteres'); throw new Error('v'); } return api.post<{ moduleId: string }>('/library/modules', { title: title.trim(), description: description.trim() || undefined }); },
    onSuccess: (m) => { qc.invalidateQueries({ queryKey: ['library-modules'] }); router.push(`/biblioteca/${m.moduleId}`); },
    onError: (e) => { if (e instanceof ApiError) toast.error(e.message); },
  });
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}><DialogContent>
      <DialogHeader><DialogTitle>Novo módulo</DialogTitle><DialogDescription>Depois de criado, adicione as aulas.</DialogDescription></DialogHeader>
      <form className="grid gap-4" noValidate onSubmit={(e) => { e.preventDefault(); save.mutate(); }}>
        <Field label="Título" htmlFor="lm-title" error={err}><Input id="lm-title" autoFocus value={title} onChange={(e) => { setTitle(e.target.value); setErr(''); }} /></Field>
        <Field label="Descrição (opcional)" htmlFor="lm-desc"><Textarea id="lm-desc" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} /></Field>
        <DialogFooter><Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button><Button type="submit" loading={save.isPending}>Criar módulo</Button></DialogFooter>
      </form>
    </DialogContent></Dialog>
  );
}

function AttachDialog({ module, onClose }: { module: LibModule; onClose: () => void }) {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [courseId, setCourseId] = React.useState('');
  const courses = useQuery({
    queryKey: ['authored-all', user?.userId],
    queryFn: async () => { const out: Course[] = []; for (const s of ['draft', 'published']) out.push(...(await api.get<{ courses: Course[] }>(`/courses/users/${user!.userId}`, { status: s })).courses); return out; },
  });
  const save = useMutation({
    mutationFn: () => api.post(`/library/modules/${module.moduleId}/attach`, { courseId }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['library-modules'] }); qc.invalidateQueries({ queryKey: ['manage', courseId] }); toast.success('Módulo adicionado ao curso'); onClose(); },
    onError: (e) => toast.error(msg(e)),
  });
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}><DialogContent>
      <DialogHeader><DialogTitle>Juntar “{module.title}” a um curso</DialogTitle><DialogDescription>O módulo passa a fazer parte do curso e sai da biblioteca.</DialogDescription></DialogHeader>
      {courses.isLoading ? <Skeleton className="h-10" /> : !courses.data?.length ? <p className="text-sm text-muted-foreground">Ainda não tem cursos. Crie um primeiro.</p> : (
        <Select value={courseId} onValueChange={setCourseId}><SelectTrigger aria-label="Curso"><SelectValue placeholder="Escolher curso" /></SelectTrigger><SelectContent>{courses.data.map((c) => <SelectItem key={c.courseId} value={c.courseId}>{c.title}</SelectItem>)}</SelectContent></Select>)}
      <DialogFooter><Button variant="ghost" onClick={onClose}>Cancelar</Button><Button disabled={!courseId} loading={save.isPending} onClick={() => save.mutate()}>Juntar</Button></DialogFooter>
    </DialogContent></Dialog>
  );
}
