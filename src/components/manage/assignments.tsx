'use client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as React from 'react';
import { ClipboardList, Pencil, Plus, Trash2, Users } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { EmptyState } from '@/components/ui/empty-state';
import { Field } from '@/components/ui/field';
import { Input, Textarea } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { ApiError, api, requestPage } from '@/lib/api/client';
import type { ManagedAssignment, Submission } from '@/lib/api/types';
import { formatDate } from '@/lib/utils';

const EXT = ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'zip', 'rar', 'txt', 'png', 'jpg', 'jpeg'];
const ST = { draft: { label: 'Rascunho', variant: 'outline' }, published: { label: 'Publicado', variant: 'success' }, closed: { label: 'Encerrado', variant: 'secondary' } } as const;
const msg = (e: unknown) => (e instanceof ApiError ? e.message : 'Sem ligação ao servidor.');
const toLocal = (iso?: string | null) => { if (!iso) return ''; const d = new Date(iso); return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16); };

export function Assignments({ courseId }: { courseId: string }) {
  const qc = useQueryClient();
  const key = ['course-assignments', courseId];
  const q = useQuery({ queryKey: key, queryFn: () => requestPage<ManagedAssignment>(`/courses/${courseId}/assignments`, { query: { limit: 50 } }) });
  const [edit, setEdit] = React.useState<{ a?: ManagedAssignment } | null>(null);
  const [subs, setSubs] = React.useState<ManagedAssignment | null>(null);
  const [del, setDel] = React.useState<ManagedAssignment | null>(null);
  const remove = useMutation({ mutationFn: (id: string) => api.del(`/assignments/${id}`), onSuccess: () => { qc.invalidateQueries({ queryKey: key }); toast.success('Trabalho eliminado'); setDel(null); }, onError: (e) => { toast.error(msg(e)); setDel(null); } });
  const items = q.data?.data ?? [];
  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3"><p className="text-sm text-muted-foreground">{items.length} trabalho(s)</p><Button onClick={() => setEdit({})}><Plus /> Novo trabalho</Button></div>
      {q.isLoading ? <Skeleton className="h-32 rounded-2xl" /> : !items.length ? <EmptyState icon={<ClipboardList />} title="Sem trabalhos" description="Crie um trabalho para os alunos entregarem e para avaliar." action={<Button onClick={() => setEdit({})}><Plus /> Criar trabalho</Button>} />
        : <ul className="grid gap-3">{items.map((a) => (
          <li key={a.assignmentId} className="flex flex-wrap items-center gap-3 rounded-2xl border bg-card p-4">
            <div className="min-w-0 flex-1"><p className="truncate font-medium">{a.title}</p><p className="text-sm text-muted-foreground">{a.dueDate ? `Prazo ${formatDate(a.dueDate, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}` : 'Sem prazo'} · {a.maxScore} pts · {a.submissionsCount ?? 0} entrega(s), {a.gradedCount ?? 0} avaliada(s)</p></div>
            <Badge variant={ST[a.status].variant}>{ST[a.status].label}</Badge>
            <Button variant="outline" size="sm" onClick={() => setSubs(a)}><Users /> Entregas</Button>
            <Button variant="ghost" size="icon-sm" aria-label="Editar trabalho" onClick={() => setEdit({ a })}><Pencil /></Button>
            <Button variant="ghost" size="icon-sm" aria-label="Eliminar trabalho" onClick={() => setDel(a)}><Trash2 /></Button>
          </li>))}</ul>}
      {edit && <EditDialog courseId={courseId} a={edit.a} onClose={() => setEdit(null)} />}
      {subs && <SubmissionsDialog a={subs} onClose={() => setSubs(null)} />}
      <Dialog open={!!del} onOpenChange={(o) => !o && setDel(null)}><DialogContent><DialogHeader><DialogTitle>Eliminar “{del?.title}”?</DialogTitle><DialogDescription>As entregas dos alunos também são eliminadas.</DialogDescription></DialogHeader><DialogFooter><Button variant="ghost" onClick={() => setDel(null)}>Cancelar</Button><Button variant="destructive" loading={remove.isPending} onClick={() => remove.mutate(del!.assignmentId)}>Eliminar</Button></DialogFooter></DialogContent></Dialog>
    </div>
  );
}

function EditDialog({ courseId, a, onClose }: { courseId: string; a?: ManagedAssignment; onClose: () => void }) {
  const qc = useQueryClient();
  const [title, setTitle] = React.useState(a?.title ?? ''); const [description, setDescription] = React.useState(a?.description ?? '');
  const [due, setDue] = React.useState(toLocal(a?.dueDate)); const [max, setMax] = React.useState(String(a?.maxScore ?? 20));
  const [status, setStatus] = React.useState<string>(a?.status ?? 'draft'); const [format, setFormat] = React.useState<string>(a?.submissionFormat ?? 'both');
  const [late, setLate] = React.useState(a?.allowLateSubmissions ?? false); const [penalty, setPenalty] = React.useState(String(a?.latePenalty ?? 0));
  const [types, setTypes] = React.useState<string[]>(a?.allowedFileTypes ?? ['pdf', 'docx', 'zip']);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const save = useMutation({
    mutationFn: () => {
      const e: Record<string, string> = {};
      if (title.trim().length < 3) e.title = 'Mínimo de 3 caracteres';
      if (description.trim().length < 10) e.description = 'Mínimo de 10 caracteres';
      if (!/^\d+$/.test(max) || +max < 1 || +max > 1000) e.maxScore = '1 a 1000';
      if (Object.keys(e).length) { setErrors(e); throw new Error('v'); }
      const body = { title: title.trim(), description: description.trim(), dueDate: due ? new Date(due).toISOString() : a ? null : undefined, maxScore: +max, status, submissionFormat: format, allowLateSubmissions: late, latePenalty: late ? Number(penalty || 0) : 0, allowedFileTypes: format === 'text' ? [] : types };
      return a ? api.patch(`/assignments/${a.assignmentId}`, body) : api.post(`/courses/${courseId}/assignments`, body);
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['course-assignments', courseId] }); toast.success(a ? 'Trabalho actualizado' : 'Trabalho criado'); onClose(); },
    onError: (e) => { if (e instanceof ApiError) { if (Object.keys(e.fieldErrors).length) setErrors(e.fieldErrors); else toast.error(e.message); } },
  });
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}><DialogContent className="max-h-[90dvh] max-w-xl overflow-y-auto">
      <DialogHeader><DialogTitle>{a ? 'Editar trabalho' : 'Novo trabalho'}</DialogTitle><DialogDescription>Os alunos só o vêem depois de publicado.</DialogDescription></DialogHeader>
      <form className="grid gap-4" noValidate onSubmit={(e) => { e.preventDefault(); save.mutate(); }}>
        <Field label="Título" htmlFor="a-title" error={errors.title}><Input id="a-title" autoFocus value={title} onChange={(e) => setTitle(e.target.value)} /></Field>
        <Field label="Enunciado" htmlFor="a-desc" error={errors.description}><Textarea id="a-desc" rows={5} value={description} onChange={(e) => setDescription(e.target.value)} /></Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Prazo (opcional)" htmlFor="a-due" error={errors.dueDate}><Input id="a-due" type="datetime-local" value={due} onChange={(e) => setDue(e.target.value)} /></Field>
          <Field label="Nota máxima" htmlFor="a-max" error={errors.maxScore}><Input id="a-max" inputMode="numeric" value={max} onChange={(e) => setMax(e.target.value)} /></Field>
          <Field label="Estado"><Select value={status} onValueChange={setStatus}><SelectTrigger aria-label="Estado"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="draft">Rascunho</SelectItem><SelectItem value="published">Publicado</SelectItem>{a && <SelectItem value="closed">Encerrado</SelectItem>}</SelectContent></Select></Field>
          <Field label="Formato da entrega"><Select value={format} onValueChange={setFormat}><SelectTrigger aria-label="Formato"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="text">Texto</SelectItem><SelectItem value="file">Ficheiro</SelectItem><SelectItem value="both">Texto ou ficheiro</SelectItem></SelectContent></Select></Field>
        </div>
        {format !== 'text' && <div className="grid gap-2"><Label>Tipos de ficheiro aceites</Label><div className="flex flex-wrap gap-2">{EXT.map((x) => { const on = types.includes(x); return <button key={x} type="button" aria-pressed={on} onClick={() => setTypes(on ? types.filter((t) => t !== x) : [...types, x])} className={`rounded-full border px-3 py-1 text-xs font-medium transition ${on ? 'border-primary bg-primary text-primary-foreground' : 'hover:bg-muted'}`}>.{x}</button>; })}</div>{errors.allowedFileTypes && <p role="alert" className="text-xs text-destructive">{errors.allowedFileTypes}</p>}</div>}
        <div className="grid gap-3 rounded-xl bg-muted/50 p-3.5">
          <div className="flex items-start gap-3"><Checkbox id="a-late" checked={late} onCheckedChange={(v) => setLate(v === true)} className="mt-0.5" /><div><Label htmlFor="a-late">Aceitar entregas fora de prazo</Label></div></div>
          {late && <Field label="Penalização (%)" htmlFor="a-pen" error={errors.latePenalty}><Input id="a-pen" inputMode="decimal" value={penalty} onChange={(e) => setPenalty(e.target.value)} className="max-w-32" /></Field>}
        </div>
        <DialogFooter><Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button><Button type="submit" loading={save.isPending}>{a ? 'Guardar' : 'Criar trabalho'}</Button></DialogFooter>
      </form>
    </DialogContent></Dialog>
  );
}

function SubmissionsDialog({ a, onClose }: { a: ManagedAssignment; onClose: () => void }) {
  const q = useQuery({ queryKey: ['submissions', a.assignmentId], queryFn: () => requestPage<Submission>(`/assignments/${a.assignmentId}/submissions`, { query: { limit: 50 } }) });
  const [sel, setSel] = React.useState<Submission | null>(null);
  const items = q.data?.data ?? [];
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}><DialogContent className="max-h-[90dvh] max-w-2xl overflow-y-auto">
      <DialogHeader><DialogTitle>Entregas · {a.title}</DialogTitle><DialogDescription>Nota máxima {a.maxScore}.</DialogDescription></DialogHeader>
      {sel ? <GradeForm a={a} s={sel} onBack={() => setSel(null)} /> : q.isLoading ? <Skeleton className="h-24" /> : !items.length ? <p className="py-6 text-center text-sm text-muted-foreground">Ainda não há entregas.</p>
        : <ul className="divide-y rounded-xl border">{items.map((s) => (
          <li key={s.submissionId} className="flex flex-wrap items-center gap-3 p-3">
            <div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{s.student?.fullName ?? s.student?.username}</p><p className="text-xs text-muted-foreground">{formatDate(s.submittedAt, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}{s.isLate ? ' · fora de prazo' : ''}</p></div>
            {s.grade != null ? <span className="text-sm font-semibold tabular-nums">{s.grade}/{a.maxScore}</span> : <Badge variant="secondary">Por avaliar</Badge>}
            <Button size="sm" variant="outline" onClick={() => setSel(s)}>{s.grade != null ? 'Rever' : 'Avaliar'}</Button>
          </li>))}</ul>}
    </DialogContent></Dialog>
  );
}

function GradeForm({ a, s, onBack }: { a: ManagedAssignment; s: Submission; onBack: () => void }) {
  const qc = useQueryClient();
  const [grade, setGrade] = React.useState(s.grade != null ? String(s.grade) : ''); const [feedback, setFeedback] = React.useState(s.feedback ?? ''); const [err, setErr] = React.useState('');
  const save = useMutation({
    mutationFn: () => { const g = Number(grade); if (grade === '' || Number.isNaN(g) || g < 0 || g > a.maxScore) { setErr(`Entre 0 e ${a.maxScore}`); throw new Error('v'); } return api.patch(`/submissions/${s.submissionId}/grade`, { grade: g, feedback: feedback.trim() || undefined }); },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['submissions', a.assignmentId] }); qc.invalidateQueries({ queryKey: ['course-assignments', a.courseId] }); toast.success('Nota guardada'); onBack(); },
    onError: (e) => { if (e instanceof ApiError) toast.error(e.message); },
  });
  return (
    <form className="grid gap-4" noValidate onSubmit={(e) => { e.preventDefault(); save.mutate(); }}>
      <div className="rounded-xl bg-muted/50 p-3 text-sm"><p className="font-medium">{s.student?.fullName ?? s.student?.username}</p>{s.content ? <p className="mt-2 whitespace-pre-wrap">{s.content}</p> : <p className="mt-1 text-muted-foreground">Sem texto.</p>}{s.attachmentUrl && <a className="mt-2 inline-block text-primary underline" href={s.attachmentUrl} target="_blank" rel="noreferrer">Abrir anexo</a>}</div>
      <div className="grid gap-4 sm:grid-cols-[8rem_1fr]"><Field label={`Nota (0–${a.maxScore})`} htmlFor="g-grade" error={err}><Input id="g-grade" inputMode="decimal" value={grade} onChange={(e) => { setGrade(e.target.value); setErr(''); }} autoFocus /></Field><Field label="Comentário" htmlFor="g-fb"><Textarea id="g-fb" rows={3} value={feedback} onChange={(e) => setFeedback(e.target.value)} /></Field></div>
      <DialogFooter><Button type="button" variant="ghost" onClick={onBack}>Voltar</Button><Button type="submit" loading={save.isPending}>Guardar nota</Button></DialogFooter>
    </form>
  );
}
