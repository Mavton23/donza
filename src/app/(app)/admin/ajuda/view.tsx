'use client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as React from 'react';
import { Plus, ThumbsDown, ThumbsUp } from 'lucide-react';
import { toast } from 'sonner';
import { Pager, errMsg } from '@/components/admin/common';
import { PageHeader } from '@/components/layout/page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { EmptyState } from '@/components/ui/empty-state';
import { Field } from '@/components/ui/field';
import { Input, Textarea } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ApiError, api } from '@/lib/api/client';
import type { HelpArticle, HelpCategory } from '@/lib/api/types';
import { catLabel, formatDate } from '@/lib/utils';

const PUB = { draft: { label: 'Rascunho', variant: 'secondary' }, published: { label: 'Publicado', variant: 'success' }, archived: { label: 'Arquivado', variant: 'outline' } } as const;

export function HelpAdmin() {
  return (
    <div>
      <PageHeader title="Ajuda" description="Artigos e categorias do centro de ajuda." />
      <Tabs defaultValue="articles"><TabsList><TabsTrigger value="articles">Artigos</TabsTrigger><TabsTrigger value="cats">Categorias</TabsTrigger><TabsTrigger value="fb">Opiniões</TabsTrigger></TabsList>
        <TabsContent value="articles"><Articles /></TabsContent><TabsContent value="cats"><Categories /></TabsContent><TabsContent value="fb"><Feedback /></TabsContent></Tabs>
    </div>
  );
}

function useCats() { return useQuery({ queryKey: ['admin-help-cats'], queryFn: () => api.get<HelpCategory[]>('/help/admin/categories') }); }

function Articles() {
  const qc = useQueryClient(); const cats = useCats();
  const [status, setStatus] = React.useState('all'); const [cat, setCat] = React.useState('all'); const [page, setPage] = React.useState(1);
  const [edit, setEdit] = React.useState<HelpArticle | 'new' | null>(null); const [del, setDel] = React.useState<HelpArticle | null>(null);
  const list = useQuery({ queryKey: ['admin-articles', status, cat, page], queryFn: () => api.page<HelpArticle>('/help/admin/articles', { limit: 10, page, status: status === 'all' ? undefined : status, category: cat === 'all' ? undefined : cat }) });
  const refresh = () => { qc.invalidateQueries({ queryKey: ['admin-articles'] }); qc.invalidateQueries({ queryKey: ['admin-help-cats'] }); qc.invalidateQueries({ queryKey: ['help-cats'] }); };
  const rm = useMutation({ mutationFn: (id: string) => api.del(`/help/articles/${id}`), onSuccess: () => { toast.success('Artigo eliminado'); setDel(null); refresh(); }, onError: (e) => toast.error(errMsg(e)) });
  return (
    <div className="mt-4">
      <div className="flex flex-wrap items-center gap-3">
        <Select value={status} onValueChange={(v) => { setStatus(v); setPage(1); }}><SelectTrigger className="w-44" aria-label="Estado"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Todos os estados</SelectItem>{Object.entries(PUB).map(([k, s]) => <SelectItem key={k} value={k}>{s.label}</SelectItem>)}</SelectContent></Select>
        <Select value={cat} onValueChange={(v) => { setCat(v); setPage(1); }}><SelectTrigger className="w-48" aria-label="Categoria"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Todas as categorias</SelectItem>{cats.data?.map((c) => <SelectItem key={c.id} value={c.name}>{catLabel(c.name)}</SelectItem>)}</SelectContent></Select>
        <Button className="ml-auto" onClick={() => setEdit('new')} disabled={!cats.data?.length}><Plus /> Novo artigo</Button>
      </div>
      {cats.data && !cats.data.length && <p className="mt-3 text-sm text-muted-foreground">Crie primeiro uma categoria no separador «Categorias».</p>}
      <div className="mt-4 grid gap-2">
        {list.isLoading ? <Skeleton className="h-24 rounded-2xl" /> : !list.data?.data.length ? <EmptyState title="Sem artigos" description="Crie o primeiro artigo de ajuda." /> : list.data.data.map((a) => (
          <article key={a.articleId} className="flex flex-wrap items-center gap-3 rounded-2xl border bg-card p-4">
            <div className="min-w-0 flex-1"><p className="truncate font-medium">{a.title}</p><p className="text-xs text-muted-foreground">{catLabel(a.category)} · {a.viewCount} visitas · {a.feedbackCount ? `${a.helpfulCount}/${a.feedbackCount} úteis` : 'sem opiniões'} · {formatDate(a.updatedAt)}</p></div>
            <Badge variant={PUB[a.status].variant}>{PUB[a.status].label}</Badge>
            <div className="flex gap-1"><Button size="sm" variant="outline" onClick={() => setEdit(a)}>Editar</Button><Button size="sm" variant="ghost" onClick={() => setDel(a)}>Eliminar</Button></div>
          </article>))}
      </div>
      <Pager page={page} total={list.data?.meta.totalPages ?? 1} onPage={setPage} />
      <ArticleDialog target={edit} cats={cats.data ?? []} onClose={() => setEdit(null)} onDone={refresh} />
      <Dialog open={!!del} onOpenChange={(o) => !o && setDel(null)}><DialogContent className="max-w-sm"><DialogHeader><DialogTitle>Eliminar artigo?</DialogTitle><DialogDescription>«{del?.title}» e as opiniões recebidas serão apagados. Não pode ser desfeito.</DialogDescription></DialogHeader><DialogFooter><Button variant="ghost" onClick={() => setDel(null)}>Cancelar</Button><Button variant="destructive" loading={rm.isPending} onClick={() => del && rm.mutate(del.articleId)}>Eliminar</Button></DialogFooter></DialogContent></Dialog>
    </div>
  );
}

function ArticleDialog({ target, cats, onClose, onDone }: { target: HelpArticle | 'new' | null; cats: HelpCategory[]; onClose: () => void; onDone: () => void }) {
  const id = target && target !== 'new' ? target.articleId : null;
  const full = useQuery({ queryKey: ['admin-article', id], enabled: !!id, staleTime: 0, queryFn: () => api.get<HelpArticle>(`/help/admin/articles/${id}`) });
  const E = { title: '', category: '', excerpt: '', content: '', status: 'draft' };
  const [f, setF] = React.useState(E); const [errs, setErrs] = React.useState<Record<string, string>>({});
  React.useEffect(() => { if (target === 'new') { setF({ ...E, category: cats[0]?.name ?? '' }); setErrs({}); } }, [target]); // eslint-disable-line react-hooks/exhaustive-deps
  React.useEffect(() => { const a = full.data; if (a) setF({ title: a.title, category: a.category, excerpt: a.excerpt ?? '', content: a.content ?? '', status: a.status }); }, [full.data]);
  const m = useMutation({
    mutationFn: () => { const body = { title: f.title.trim(), category: f.category, excerpt: f.excerpt.trim() || undefined, content: f.content.trim(), status: f.status }; return id ? api.patch(`/help/articles/${id}`, body) : api.post('/help/articles', body); },
    onSuccess: () => { toast.success(id ? 'Artigo guardado' : 'Artigo criado'); onClose(); onDone(); },
    onError: (e) => { if (e instanceof ApiError && e.fieldErrors) setErrs(e.fieldErrors); else toast.error(errMsg(e)); },
  });
  const submit = (e: React.FormEvent) => { e.preventDefault(); const er: Record<string, string> = {}; if (f.title.trim().length < 3) er.title = 'Mínimo 3 caracteres'; if (!f.category) er.category = 'Escolha a categoria'; if (f.content.trim().length < 10) er.content = 'Mínimo 10 caracteres'; setErrs(er); if (!Object.keys(er).length) m.mutate(); };
  const set = (k: keyof typeof E) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => { setF({ ...f, [k]: e.target.value }); setErrs({ ...errs, [k]: '' }); };
  return (
    <Dialog open={!!target} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90dvh] max-w-2xl overflow-y-auto">
        <form noValidate onSubmit={submit} className="grid gap-4">
          <DialogHeader><DialogTitle>{id ? 'Editar artigo' : 'Novo artigo'}</DialogTitle><DialogDescription>Use «## Título», «- item» e linhas em branco para separar parágrafos.</DialogDescription></DialogHeader>
          {id && full.isLoading ? <Skeleton className="h-64" /> : (
            <>
              <Field label="Título" htmlFor="ar-t" error={errs.title}><Input id="ar-t" maxLength={100} value={f.title} onChange={set('title')} aria-invalid={!!errs.title} /></Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Categoria" htmlFor="ar-c" error={errs.category}><Select value={f.category} onValueChange={(v) => setF({ ...f, category: v })}><SelectTrigger id="ar-c"><SelectValue placeholder="Escolha" /></SelectTrigger><SelectContent>{cats.map((c) => <SelectItem key={c.id} value={c.name}>{catLabel(c.name)}</SelectItem>)}</SelectContent></Select></Field>
                <Field label="Estado" htmlFor="ar-s"><Select value={f.status} onValueChange={(v) => setF({ ...f, status: v })}><SelectTrigger id="ar-s"><SelectValue /></SelectTrigger><SelectContent>{Object.entries(PUB).map(([k, s]) => <SelectItem key={k} value={k}>{s.label}</SelectItem>)}</SelectContent></Select></Field>
              </div>
              <Field label="Resumo (opcional)" htmlFor="ar-e" error={errs.excerpt}><Input id="ar-e" maxLength={200} value={f.excerpt} onChange={set('excerpt')} /></Field>
              <Field label="Conteúdo" htmlFor="ar-b" error={errs.content}><Textarea id="ar-b" rows={10} value={f.content} onChange={set('content')} aria-invalid={!!errs.content} /></Field>
            </>)}
          <DialogFooter><Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button><Button type="submit" loading={m.isPending}>Guardar</Button></DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Categories() {
  const qc = useQueryClient(); const cats = useCats();
  const [edit, setEdit] = React.useState<HelpCategory | 'new' | null>(null); const [del, setDel] = React.useState<HelpCategory | null>(null);
  const refresh = () => { qc.invalidateQueries({ queryKey: ['admin-help-cats'] }); qc.invalidateQueries({ queryKey: ['help-cats'] }); };
  const rm = useMutation({ mutationFn: (id: string) => api.del(`/help/categories/${id}`), onSuccess: () => { toast.success('Categoria eliminada'); setDel(null); refresh(); }, onError: (e) => { setDel(null); toast.error(errMsg(e)); } });
  return (
    <div className="mt-4">
      <Button onClick={() => setEdit('new')}><Plus /> Nova categoria</Button>
      <div className="mt-4 grid gap-2">
        {cats.isLoading ? <Skeleton className="h-20 rounded-2xl" /> : !cats.data?.length ? <EmptyState title="Sem categorias" /> : cats.data.map((c) => (
          <article key={c.id} className="flex flex-wrap items-center gap-3 rounded-2xl border bg-card p-4">
            <div className="min-w-0 flex-1"><p className="font-medium">{catLabel(c.name)} <span className="font-mono text-xs font-normal text-muted-foreground">{c.name}</span></p>{c.description && <p className="text-sm text-muted-foreground">{c.description}</p>}<p className="text-xs text-muted-foreground">Ordem {c.displayOrder}</p></div>
            {c.isActive === false && <Badge variant="secondary">Inactiva</Badge>}
            <div className="flex gap-1"><Button size="sm" variant="outline" onClick={() => setEdit(c)}>Editar</Button><Button size="sm" variant="ghost" onClick={() => setDel(c)}>Eliminar</Button></div>
          </article>))}
      </div>
      <CategoryDialog target={edit} onClose={() => setEdit(null)} onDone={refresh} />
      <Dialog open={!!del} onOpenChange={(o) => !o && setDel(null)}><DialogContent className="max-w-sm"><DialogHeader><DialogTitle>Eliminar categoria?</DialogTitle><DialogDescription>«{del && catLabel(del.name)}» só pode ser eliminada se não tiver artigos.</DialogDescription></DialogHeader><DialogFooter><Button variant="ghost" onClick={() => setDel(null)}>Cancelar</Button><Button variant="destructive" loading={rm.isPending} onClick={() => del && rm.mutate(del.id)}>Eliminar</Button></DialogFooter></DialogContent></Dialog>
    </div>
  );
}

function CategoryDialog({ target, onClose, onDone }: { target: HelpCategory | 'new' | null; onClose: () => void; onDone: () => void }) {
  const cur = target && target !== 'new' ? target : null;
  const E = { name: '', description: '', displayOrder: '0', isActive: true };
  const [f, setF] = React.useState(E); const [errs, setErrs] = React.useState<Record<string, string>>({});
  React.useEffect(() => { if (target) { setErrs({}); setF(cur ? { name: cur.name, description: cur.description ?? '', displayOrder: String(cur.displayOrder), isActive: cur.isActive !== false } : E); } }, [target]); // eslint-disable-line react-hooks/exhaustive-deps
  const m = useMutation({
    mutationFn: () => { const body = { name: f.name.trim(), description: f.description.trim() || undefined, displayOrder: Number(f.displayOrder) || 0, isActive: f.isActive }; return cur ? api.patch(`/help/categories/${cur.id}`, body) : api.post('/help/categories', body); },
    onSuccess: () => { toast.success(cur ? 'Categoria guardada' : 'Categoria criada'); onClose(); onDone(); },
    onError: (e) => { if (e instanceof ApiError && e.fieldErrors) setErrs(e.fieldErrors); else toast.error(errMsg(e)); },
  });
  const submit = (e: React.FormEvent) => { e.preventDefault(); const er: Record<string, string> = {}; if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(f.name.trim()) || f.name.trim().length < 2) er.name = 'Use minúsculas, números e hífens (ex.: primeiros-passos)'; setErrs(er); if (!Object.keys(er).length) m.mutate(); };
  return (
    <Dialog open={!!target} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <form noValidate onSubmit={submit} className="grid gap-4">
          <DialogHeader><DialogTitle>{cur ? 'Editar categoria' : 'Nova categoria'}</DialogTitle></DialogHeader>
          <Field label="Identificador" htmlFor="ca-n" error={errs.name} hint="Aparece no endereço e como título."><Input id="ca-n" value={f.name} onChange={(e) => { setF({ ...f, name: e.target.value }); setErrs({}); }} aria-invalid={!!errs.name} /></Field>
          <Field label="Descrição (opcional)" htmlFor="ca-d" error={errs.description}><Input id="ca-d" maxLength={200} value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} /></Field>
          <Field label="Ordem" htmlFor="ca-o" error={errs.displayOrder}><Input id="ca-o" type="number" min={0} value={f.displayOrder} onChange={(e) => setF({ ...f, displayOrder: e.target.value })} /></Field>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={f.isActive} onChange={(e) => setF({ ...f, isActive: e.target.checked })} className="size-4 accent-[var(--color-primary)]" /> Visível no centro de ajuda</label>
          <DialogFooter><Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button><Button type="submit" loading={m.isPending}>Guardar</Button></DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

interface Fb { feedbackId: string; wasHelpful: boolean; comment: string | null; createdAt: string; user: { username: string; fullName: string | null }; article: { title: string; slug: string } }
function Feedback() {
  const [helpful, setHelpful] = React.useState('all'); const [page, setPage] = React.useState(1);
  const q = useQuery({ queryKey: ['admin-help-fb', helpful, page], queryFn: () => api.page<Fb>('/help/feedback', { limit: 15, page, wasHelpful: helpful === 'all' ? undefined : helpful }) });
  return (
    <div className="mt-4">
      <Select value={helpful} onValueChange={(v) => { setHelpful(v); setPage(1); }}><SelectTrigger className="w-44" aria-label="Opinião"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Todas</SelectItem><SelectItem value="true">Úteis</SelectItem><SelectItem value="false">Não úteis</SelectItem></SelectContent></Select>
      <div className="mt-4 grid gap-2">
        {q.isLoading ? <Skeleton className="h-20 rounded-2xl" /> : !q.data?.data.length ? <EmptyState title="Sem opiniões" /> : q.data.data.map((r) => (
          <article key={r.feedbackId} className="flex items-start gap-3 rounded-2xl border bg-card p-4 text-sm">
            {r.wasHelpful ? <ThumbsUp className="mt-0.5 size-4 shrink-0 text-primary" aria-label="Útil" /> : <ThumbsDown className="mt-0.5 size-4 shrink-0 text-destructive" aria-label="Não útil" />}
            <div className="min-w-0 flex-1"><p className="font-medium">{r.article.title}</p>{r.comment && <p className="mt-0.5 whitespace-pre-wrap break-words">{r.comment}</p>}<p className="mt-1 text-xs text-muted-foreground">{r.user.fullName ?? r.user.username} · {formatDate(r.createdAt)}</p></div>
          </article>))}
      </div>
      <Pager page={page} total={q.data?.meta.totalPages ?? 1} onPage={setPage} />
    </div>
  );
}
