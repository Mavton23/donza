'use client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as React from 'react';
import { Plus, Star } from 'lucide-react';
import { toast } from 'sonner';
import { Pager, errMsg } from '@/components/admin/common';
import { PageHeader } from '@/components/layout/page-header';
import { StarInput, Stars } from '@/components/reviews/stars';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { EmptyState } from '@/components/ui/empty-state';
import { Field } from '@/components/ui/field';
import { Input, Textarea } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { ApiError, api } from '@/lib/api/client';
import { formatDate } from '@/lib/utils';

interface Row { testimonialId: string; content: string; rating: number; featured: boolean; status: 'pending' | 'approved' | 'rejected'; source: 'platform' | 'external'; createdAt: string; externalAuthor: string | null; externalRole: string | null; author: { username: string; fullName: string | null; email?: string } | null }
const ST = { pending: { label: 'Por rever', variant: 'warning' }, approved: { label: 'Publicado', variant: 'success' }, rejected: { label: 'Recusado', variant: 'destructive' } } as const;

export function TestimonialsAdmin() {
  const qc = useQueryClient(); const [status, setStatus] = React.useState('pending'); const [page, setPage] = React.useState(1); const [ext, setExt] = React.useState(false);
  const list = useQuery({ queryKey: ['admin-testimonials', status, page], queryFn: () => api.page<Row>('/testimonials/admin', { limit: 10, page, status: status === 'all' ? undefined : status }) });
  const refresh = () => { qc.invalidateQueries({ queryKey: ['admin-testimonials'] }); qc.invalidateQueries({ queryKey: ['admin-stats'] }); };
  const mod = useMutation({ mutationFn: (v: { id: string; status: 'approved' | 'rejected'; featured?: boolean }) => api.patch(`/testimonials/${v.id}/moderation`, { status: v.status, featured: v.featured }), onSuccess: (_, v) => { toast.success(v.status === 'approved' ? 'Testemunho publicado' : 'Testemunho recusado'); refresh(); }, onError: (e) => toast.error(errMsg(e)) });
  return (
    <div>
      <PageHeader title="Testemunhos" description="Reveja o que os utilizadores enviam e destaque os melhores na página inicial." actions={<Button onClick={() => setExt(true)}><Plus /> Testemunho externo</Button>} />
      <Select value={status} onValueChange={(v) => { setStatus(v); setPage(1); }}><SelectTrigger className="w-44" aria-label="Estado"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Todos</SelectItem>{Object.entries(ST).map(([k, s]) => <SelectItem key={k} value={k}>{s.label}</SelectItem>)}</SelectContent></Select>
      <div className="mt-4 grid gap-3">
        {list.isLoading ? <Skeleton className="h-28 rounded-2xl" /> : !list.data?.data.length ? <EmptyState title="Sem testemunhos" description="Nada neste estado." /> : list.data.data.map((t) => (
          <article key={t.testimonialId} className="rounded-2xl border bg-card p-4">
            <div className="flex flex-wrap items-center gap-2 text-sm"><span className="font-medium">{t.source === 'external' ? t.externalAuthor : (t.author?.fullName ?? t.author?.username ?? '—')}</span>{t.source === 'external' && <Badge variant="outline">Externo</Badge>}{t.author?.email && <span className="text-muted-foreground">{t.author.email}</span>}<Stars value={t.rating} /><Badge variant={ST[t.status].variant}>{ST[t.status].label}</Badge>{t.featured && <Badge variant="secondary"><Star className="size-3" /> Destaque</Badge>}<span className="ml-auto text-xs text-muted-foreground">{formatDate(t.createdAt)}</span></div>
            <p className="mt-2 whitespace-pre-wrap break-words text-sm">{t.content}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {t.status !== 'approved' && <Button size="sm" loading={mod.isPending && mod.variables?.id === t.testimonialId && mod.variables.status === 'approved' && mod.variables.featured === undefined} onClick={() => mod.mutate({ id: t.testimonialId, status: 'approved' })}>Publicar</Button>}
              {t.status !== 'approved' && <Button size="sm" variant="outline" onClick={() => mod.mutate({ id: t.testimonialId, status: 'approved', featured: true })}>Publicar em destaque</Button>}
              {t.status === 'approved' && <Button size="sm" variant="outline" onClick={() => mod.mutate({ id: t.testimonialId, status: 'approved', featured: !t.featured })}>{t.featured ? 'Remover destaque' : 'Destacar'}</Button>}
              {t.status !== 'rejected' && <Button size="sm" variant="ghost" onClick={() => mod.mutate({ id: t.testimonialId, status: 'rejected' })}>Recusar</Button>}
            </div>
          </article>))}
      </div>
      <Pager page={page} total={list.data?.meta.totalPages ?? 1} onPage={setPage} />
      <External open={ext} onOpenChange={setExt} onDone={refresh} />
    </div>
  );
}

function External({ open, onOpenChange, onDone }: { open: boolean; onOpenChange: (o: boolean) => void; onDone: () => void }) {
  const E = { author: '', role: '', content: '', rating: 0, featured: false };
  const [f, setF] = React.useState(E); const [errs, setErrs] = React.useState<Record<string, string>>({});
  React.useEffect(() => { if (open) { setF(E); setErrs({}); } }, [open]); // eslint-disable-line react-hooks/exhaustive-deps
  const m = useMutation({
    mutationFn: () => api.post('/testimonials/admin/external', { externalAuthor: f.author.trim(), externalRole: f.role.trim() || undefined, content: f.content.trim(), rating: f.rating, featured: f.featured }),
    onSuccess: () => { toast.success('Testemunho criado'); onOpenChange(false); onDone(); },
    onError: (e) => { if (e instanceof ApiError && e.fieldErrors) setErrs(e.fieldErrors); else toast.error(errMsg(e)); },
  });
  const submit = (e: React.FormEvent) => { e.preventDefault(); const er: Record<string, string> = {}; if (f.author.trim().length < 2) er.externalAuthor = 'Indique o autor'; if (!f.rating) er.rating = 'Escolha uma classificação'; if (f.content.trim().length < 10) er.content = 'Escreva pelo menos 10 caracteres'; setErrs(er); if (!Object.keys(er).length) m.mutate(); };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <form noValidate onSubmit={submit} className="grid gap-4">
          <DialogHeader><DialogTitle>Testemunho externo</DialogTitle><DialogDescription>De um cliente ou parceiro sem conta. Fica publicado de imediato.</DialogDescription></DialogHeader>
          <Field label="Autor" htmlFor="ex-a" error={errs.externalAuthor}><Input id="ex-a" value={f.author} onChange={(e) => setF({ ...f, author: e.target.value })} aria-invalid={!!errs.externalAuthor} /></Field>
          <Field label="Cargo / organização (opcional)" htmlFor="ex-r"><Input id="ex-r" value={f.role} onChange={(e) => setF({ ...f, role: e.target.value })} /></Field>
          <div><StarInput value={f.rating} onChange={(v) => setF({ ...f, rating: v })} />{errs.rating && <p role="alert" className="mt-1 text-xs text-destructive">{errs.rating}</p>}</div>
          <Field label="Testemunho" htmlFor="ex-c" error={errs.content}><Textarea id="ex-c" rows={4} maxLength={1000} value={f.content} onChange={(e) => setF({ ...f, content: e.target.value })} aria-invalid={!!errs.content} /></Field>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={f.featured} onChange={(e) => setF({ ...f, featured: e.target.checked })} className="size-4 accent-[var(--color-primary)]" /> Mostrar em destaque na página inicial</label>
          <DialogFooter><Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button><Button type="submit" loading={m.isPending}>Criar</Button></DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
