'use client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as React from 'react';
import { Download, ExternalLink, FileText, Library, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Pager, msg } from '@/components/groups/manage';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { EmptyState } from '@/components/ui/empty-state';
import { Field } from '@/components/ui/field';
import { Input, Textarea } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { ApiError, api } from '@/lib/api/client';
import type { GroupContent, GroupContentType } from '@/lib/api/types';
import { useAuth } from '@/lib/auth/auth-provider';
import { formatDate } from '@/lib/utils';

const TYPE: Record<GroupContentType, string> = { pdf: 'PDF', slide: 'Slides', image: 'Imagem', video: 'Vídeo', code: 'Código', link: 'Link' };
const ACCEPT: Record<string, string> = { pdf: 'application/pdf', slide: '.ppt,.pptx,application/pdf', image: 'image/jpeg,image/png,image/webp', video: 'video/mp4,video/webm,video/quicktime', code: '.txt,.zip' };

/** Biblioteca de recursos partilhados no grupo. */
export function Contents({ groupId, canModerate, canWrite }: { groupId: string; canModerate: boolean; canWrite: boolean }) {
  const { user } = useAuth(); const qc = useQueryClient();
  const [q, setQ] = React.useState(''); const [term, setTerm] = React.useState(''); const [type, setType] = React.useState('all'); const [sort, setSort] = React.useState('recent'); const [page, setPage] = React.useState(1);
  React.useEffect(() => { const t = setTimeout(() => { setTerm(q.trim()); setPage(1); }, 300); return () => clearTimeout(t); }, [q]);
  const list = useQuery({ queryKey: ['group-contents', groupId, term, type, sort, page], queryFn: () => api.page<GroupContent>(`/study-groups/${groupId}/contents`, { limit: 12, page, search: term || undefined, fileType: type === 'all' ? undefined : type, sort }) });
  const refresh = () => qc.invalidateQueries({ queryKey: ['group-contents', groupId] });
  const [form, setForm] = React.useState<GroupContent | 'new' | null>(null); const [del, setDel] = React.useState<GroupContent | null>(null);
  const download = useMutation({ mutationFn: (id: string) => api.post<{ url: string | null }>(`/study-groups/${groupId}/contents/${id}/download`, {}), onSuccess: (r) => { refresh(); if (r?.url) window.open(r.url, '_blank', 'noopener,noreferrer'); else toast.error('Sem ligação disponível'); }, onError: (e) => toast.error(msg(e)) });
  const rm = useMutation({ mutationFn: (id: string) => api.del(`/study-groups/${groupId}/contents/${id}`), onSuccess: () => { toast.success('Conteúdo apagado'); setDel(null); refresh(); }, onError: (e) => { setDel(null); toast.error(msg(e)); } });
  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-48 max-w-xs flex-1"><Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input className="pl-9" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Pesquisar recursos" aria-label="Pesquisar recursos" /></div>
        <Select value={type} onValueChange={(v) => { setType(v); setPage(1); }}><SelectTrigger className="w-36" aria-label="Tipo"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Todos os tipos</SelectItem>{Object.entries(TYPE).map(([k, l]) => <SelectItem key={k} value={k}>{l}</SelectItem>)}</SelectContent></Select>
        <Select value={sort} onValueChange={(v) => { setSort(v); setPage(1); }}><SelectTrigger className="w-40" aria-label="Ordenar"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="recent">Mais recentes</SelectItem><SelectItem value="downloads">Mais descarregados</SelectItem></SelectContent></Select>
        {canWrite && <Button className="ml-auto" onClick={() => setForm('new')}><Plus /> Partilhar recurso</Button>}
      </div>
      {list.isLoading ? <Skeleton className="h-28 rounded-2xl" /> : !list.data?.data.length ? <EmptyState icon={<Library />} title="Sem recursos" description="Partilhe ficheiros ou links úteis com o grupo." />
        : <ul className="grid gap-3 sm:grid-cols-2">{list.data.data.map((c) => { const mine = c.uploader.userId === user?.userId; return (
          <li key={c.contentId} className="flex flex-col gap-2 rounded-2xl border bg-card p-4">
            <div className="flex items-start gap-3"><span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary"><FileText className="size-5" /></span>
              <div className="min-w-0 flex-1"><p className="truncate font-medium">{c.title}</p><p className="text-xs text-muted-foreground">@{c.uploader.username} · {formatDate(c.createdAt)}</p></div><Badge variant="secondary">{TYPE[c.fileType]}</Badge></div>
            {c.description && <p className="line-clamp-3 whitespace-pre-wrap text-sm text-muted-foreground">{c.description}</p>}
            <div className="mt-auto flex items-center gap-1 pt-1"><span className="text-xs text-muted-foreground">{c.downloadCount} {c.downloadCount === 1 ? 'abertura' : 'aberturas'}</span>
              <span className="ml-auto flex gap-1">
                {(mine || canModerate) && <><Button size="sm" variant="ghost" aria-label={`Editar ${c.title}`} onClick={() => setForm(c)}><Pencil /></Button><Button size="sm" variant="ghost" aria-label={`Apagar ${c.title}`} onClick={() => setDel(c)}><Trash2 /></Button></>}
                <Button size="sm" variant="outline" loading={download.isPending && download.variables === c.contentId} onClick={() => download.mutate(c.contentId)}>{c.fileType === 'link' ? <ExternalLink /> : <Download />}{c.fileType === 'link' ? 'Abrir' : 'Descarregar'}</Button></span></div>
          </li>); })}</ul>}
      <Pager page={page} total={list.data?.meta.totalPages ?? 1} onPage={setPage} />
      {form && <ContentDialog groupId={groupId} content={form === 'new' ? null : form} onClose={() => setForm(null)} onDone={refresh} />}
      <ConfirmDialog open={!!del} onOpenChange={(o) => !o && setDel(null)} title="Apagar recurso?" description={`“${del?.title}” deixa de estar disponível para o grupo.`} confirmLabel="Apagar" destructive pending={rm.isPending} onConfirm={() => del && rm.mutate(del.contentId)} />
    </div>
  );
}

function ContentDialog({ groupId, content, onClose, onDone }: { groupId: string; content: GroupContent | null; onClose: () => void; onDone: () => void }) {
  const [title, setTitle] = React.useState(content?.title ?? ''); const [desc, setDesc] = React.useState(content?.description ?? ''); const [type, setType] = React.useState<string>(content?.fileType ?? 'link');
  const [url, setUrl] = React.useState(content?.externalUrl ?? ''); const [file, setFile] = React.useState<File | null>(null); const [errors, setErrors] = React.useState<Record<string, string>>({});
  const editing = !!content;
  const save = useMutation({
    mutationFn: () => {
      const e: Record<string, string> = {};
      if (title.trim().length < 3) e.title = 'Mínimo de 3 caracteres';
      if (!editing) { if (type === 'link' && !url.trim()) e.externalUrl = 'Indique o endereço do link'; if (type !== 'link' && !file && !url.trim()) e.file = 'Escolha um ficheiro ou indique um endereço'; if (file && url.trim()) e.file = 'Ficheiro ou endereço, não ambos'; }
      if (Object.keys(e).length) { setErrors(e); throw new Error('v'); }
      if (editing) return api.patch(`/study-groups/${groupId}/contents/${content!.contentId}`, { title: title.trim(), description: desc.trim() || undefined, ...(content!.externalUrl && url.trim() && { externalUrl: url.trim() }) });
      const f = new FormData(); f.set('title', title.trim()); if (desc.trim()) f.set('description', desc.trim()); f.set('fileType', type); if (url.trim()) f.set('externalUrl', url.trim()); if (file) f.set('file', file);
      return api.upload(`/study-groups/${groupId}/contents`, f);
    },
    onSuccess: () => { toast.success(editing ? 'Recurso actualizado' : 'Recurso partilhado'); onDone(); onClose(); },
    onError: (e) => { if (e instanceof ApiError) { if (Object.keys(e.fieldErrors).length) setErrors(e.fieldErrors); else toast.error(e.message); } },
  });
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}><DialogContent className="max-w-lg">
      <DialogHeader><DialogTitle>{editing ? 'Editar recurso' : 'Partilhar recurso'}</DialogTitle><DialogDescription>{editing ? 'Altere o título, a descrição ou o link.' : 'Envie um ficheiro ou partilhe um endereço.'}</DialogDescription></DialogHeader>
      <form className="grid gap-4" noValidate onSubmit={(e) => { e.preventDefault(); save.mutate(); }}>
        <Field label="Título" htmlFor="c-title" error={errors.title}><Input id="c-title" value={title} onChange={(e) => setTitle(e.target.value)} /></Field>
        <Field label="Descrição (opcional)" htmlFor="c-desc" error={errors.description}><Textarea id="c-desc" rows={3} maxLength={2000} value={desc} onChange={(e) => setDesc(e.target.value)} /></Field>
        {!editing && <Field label="Tipo"><Select value={type} onValueChange={(v) => { setType(v); setFile(null); }}><SelectTrigger aria-label="Tipo de recurso"><SelectValue /></SelectTrigger><SelectContent>{Object.entries(TYPE).map(([k, l]) => <SelectItem key={k} value={k}>{l}</SelectItem>)}</SelectContent></Select></Field>}
        {(type === 'link' || !editing || content?.externalUrl) && <Field label={type === 'link' ? 'Endereço do link' : 'Endereço (em alternativa ao ficheiro)'} htmlFor="c-url" error={errors.externalUrl}><Input id="c-url" inputMode="url" placeholder="https://" value={url} onChange={(e) => setUrl(e.target.value)} /></Field>}
        {!editing && type !== 'link' && <Field label="Ficheiro" htmlFor="c-file" error={errors.file}><Input id="c-file" type="file" accept={ACCEPT[type]} onChange={(e) => setFile(e.target.files?.[0] ?? null)} /></Field>}
        <DialogFooter><Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button><Button type="submit" loading={save.isPending}>{editing ? 'Guardar' : 'Partilhar'}</Button></DialogFooter>
      </form>
    </DialogContent></Dialog>
  );
}
