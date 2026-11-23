'use client';
import { useMutation, useQueries, useQuery, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import * as React from 'react';
import { ClipboardList, FileUp } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '@/components/layout/page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { EmptyState } from '@/components/ui/empty-state';
import { Field } from '@/components/ui/field';
import { Textarea } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { ApiError, api } from '@/lib/api/client';
import type { StudentAssignment } from '@/lib/api/types';
import { useAuth } from '@/lib/auth/auth-provider';
import { formatDate } from '@/lib/utils';

interface Enrolled { courseId: string; title: string; slug: string }
type Row = StudentAssignment & { course: Enrolled };

export const STATE: Record<string, { label: string; variant: 'success' | 'secondary' | 'outline' | 'destructive' | 'warning' }> = {
  pending: { label: 'Por entregar', variant: 'outline' }, overdue: { label: 'Em atraso', variant: 'destructive' },
  draft: { label: 'Rascunho', variant: 'secondary' }, submitted: { label: 'Entregue', variant: 'secondary' }, late: { label: 'Entregue fora de prazo', variant: 'warning' }, graded: { label: 'Avaliado', variant: 'success' },
};
const msg = (e: unknown) => (e instanceof ApiError ? e.message : 'Sem ligação ao servidor.');

export function MyAssignments() {
  const { user } = useAuth();
  const courses = useQuery({ queryKey: ['my-courses', user?.userId], enabled: user?.role === 'student', queryFn: () => api.page<Enrolled>(`/courses/users/${user!.userId}/enrolled`, { limit: 50, sort: 'recent' }) });
  const list = courses.data?.data ?? [];
  const results = useQueries({ queries: list.map((c) => ({ queryKey: ['my-assignments', c.courseId], queryFn: () => api.get<StudentAssignment[]>(`/courses/${c.courseId}/my-assignments`) })) });
  const [open, setOpen] = React.useState<Row | null>(null);
  const loading = courses.isLoading || results.some((r) => r.isLoading);
  const rows: Row[] = list.flatMap((c, i) => (results[i]?.data ?? []).map((a) => ({ ...a, course: c })));
  const rank = (r: Row) => ({ overdue: 0, pending: 1, draft: 2, submitted: 3, late: 3, graded: 4 }[r.state] ?? 5);
  rows.sort((a, b) => rank(a) - rank(b) || (a.dueDate ?? '9').localeCompare(b.dueDate ?? '9'));
  return (
    <>
      <PageHeader title="Trabalhos" description="Os trabalhos dos seus cursos: o que falta entregar e as notas." />
      {loading ? <div className="grid gap-3">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-24 rounded-2xl" />)}</div>
        : !rows.length ? <EmptyState icon={<ClipboardList />} title="Sem trabalhos por agora" description="Quando um instrutor publicar um trabalho, aparece aqui." />
        : <ul className="grid gap-3">{rows.map((a) => { const s = STATE[a.state] ?? STATE.pending!; return (
          <li key={a.assignmentId} className="flex flex-wrap items-center gap-3 rounded-2xl border bg-card p-4">
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium">{a.title}</p>
              <p className="truncate text-sm text-muted-foreground"><Link href={`/aprender/${a.course.slug}`} className="hover:underline">{a.course.title}</Link>{a.dueDate ? ` · prazo ${formatDate(a.dueDate, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}` : ''}</p>
            </div>
            {a.submission?.grade != null && <span className="text-sm font-semibold tabular-nums">{a.submission.grade}/{a.maxScore}</span>}
            <Badge variant={s.variant}>{s.label}</Badge>
            <Button variant={a.canSubmit ? 'default' : 'outline'} size="sm" onClick={() => setOpen(a)}>{a.canSubmit ? (a.submission ? 'Reenviar' : 'Entregar') : 'Ver'}</Button>
          </li>); })}</ul>}
      {open && <SubmitDialog a={open} onClose={() => setOpen(null)} />}
    </>
  );
}

function SubmitDialog({ a, onClose }: { a: Row; onClose: () => void }) {
  const qc = useQueryClient();
  const [content, setContent] = React.useState(a.submission?.content ?? '');
  const [file, setFile] = React.useState<File | null>(null);
  const [err, setErr] = React.useState('');
  const wantsText = a.submissionFormat !== 'file'; const wantsFile = a.submissionFormat !== 'text';
  const send = useMutation({
    mutationFn: () => {
      if (wantsText && !wantsFile && !content.trim()) { setErr('Escreva a sua resposta'); throw new Error('v'); }
      if (!content.trim() && !file) { setErr('Escreva uma resposta ou anexe um ficheiro'); throw new Error('v'); }
      const f = new FormData(); if (content.trim()) f.set('content', content.trim()); if (file) f.set('file', file);
      return api.upload(`/assignments/${a.assignmentId}/submit`, f);
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['my-assignments', a.course.courseId] }); toast.success('Trabalho entregue'); onClose(); },
    onError: (e) => { if (e instanceof ApiError) toast.error(e.message); },
  });
  const s = a.submission;
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}><DialogContent className="max-h-[90dvh] max-w-xl overflow-y-auto">
      <DialogHeader><DialogTitle>{a.title}</DialogTitle><DialogDescription>{a.course.title} · nota máxima {a.maxScore}</DialogDescription></DialogHeader>
      <p className="whitespace-pre-wrap text-sm">{a.description}</p>
      {a.allowLateSubmissions && a.latePenalty > 0 && <p className="text-xs text-muted-foreground">Entregas fora de prazo perdem {a.latePenalty}% da nota.</p>}
      {s?.status === 'graded' && <div className="rounded-xl bg-success/10 p-3 text-sm"><p className="font-semibold">Nota: {s.grade}/{a.maxScore}</p>{s.feedback && <p className="mt-1 whitespace-pre-wrap">{s.feedback}</p>}</div>}
      {a.canSubmit ? (
        <form className="grid gap-4" noValidate onSubmit={(e) => { e.preventDefault(); send.mutate(); }}>
          {wantsText && <Field label="Resposta" htmlFor="s-content" error={err}><Textarea id="s-content" rows={6} value={content} onChange={(e) => { setContent(e.target.value); setErr(''); }} /></Field>}
          {wantsFile && <Field label="Ficheiro" hint={`Aceites: ${a.allowedFileTypes.join(', ')}`}>
            <label className="flex cursor-pointer items-center gap-2 rounded-xl border-2 border-dashed p-4 text-sm hover:bg-muted/50"><FileUp className="size-4" />{file ? file.name : 'Escolher ficheiro'}<input type="file" className="sr-only" accept={a.allowedFileTypes.map((t) => `.${t}`).join(',')} onChange={(e) => { setFile(e.target.files?.[0] ?? null); setErr(''); }} /></label></Field>}
          {s && <p className="text-xs text-muted-foreground">Já entregou em {formatDate(s.submittedAt)}. Reenviar substitui a entrega anterior.</p>}
          <DialogFooter><Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button><Button type="submit" loading={send.isPending}>Entregar</Button></DialogFooter>
        </form>
      ) : s ? <div className="text-sm"><p className="text-muted-foreground">Entregue em {formatDate(s.submittedAt)}.</p>{s.content && <p className="mt-2 whitespace-pre-wrap rounded-lg bg-muted/50 p-3">{s.content}</p>}{s.attachmentUrl && <a className="mt-2 inline-block text-primary underline" href={s.attachmentUrl} target="_blank" rel="noreferrer">Ver anexo</a>}</div>
        : <p className="text-sm text-muted-foreground">As entregas estão encerradas.</p>}
    </DialogContent></Dialog>
  );
}
