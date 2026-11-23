'use client';
import * as React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowDown, ArrowUp, Eye, EyeOff, ListPlus, Pencil, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { LessonIcon } from '@/components/courses/lesson-icon';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { EmptyState } from '@/components/ui/empty-state';
import { Field } from '@/components/ui/field';
import { Input, Textarea } from '@/components/ui/input';
import { ApiError, api } from '@/lib/api/client';
import type { ManagedCourse, ManagedLesson, ManagedModule } from '@/lib/api/types';
import { formatDuration } from '@/lib/utils';
import { LessonDialog } from './lesson-dialog';

const errMsg = (e: unknown) => (e instanceof ApiError ? e.message : 'Sem ligação ao servidor.');

export function Curriculum({ course }: { course: ManagedCourse }) {
  const qc = useQueryClient();
  const id = course.courseId;
  const refresh = () => qc.invalidateQueries({ queryKey: ['manage', id] });
  const [moduleDlg, setModuleDlg] = React.useState<{ module?: ManagedModule } | null>(null);
  const [lessonDlg, setLessonDlg] = React.useState<{ moduleId: string; lesson?: ManagedLesson } | null>(null);
  const [batchFor, setBatchFor] = React.useState<ManagedModule | null>(null);
  const [confirm, setConfirm] = React.useState<{ kind: 'module' | 'lesson'; moduleId: string; lessonId?: string; title: string } | null>(null);

  const run = useMutation({
    mutationFn: (fn: () => Promise<unknown>) => fn(),
    onSuccess: refresh,
    onError: (e) => toast.error(errMsg(e)),
  });

  function move<T extends { order: number }>(list: T[], idOf: (x: T) => string, index: number, dir: -1 | 1, path: string) {
    const ids = list.map(idOf); const j = index + dir; if (j < 0 || j >= ids.length) return;
    [ids[index], ids[j]] = [ids[j]!, ids[index]!];
    run.mutate(() => api.put(path, { ids }));
  }

  const modules = [...course.modules].sort((a, b) => a.order - b.order);

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">{modules.length} módulo(s) · {modules.reduce((n, m) => n + m.lessons.length, 0)} aula(s)</p>
        <Button onClick={() => setModuleDlg({})}><Plus /> Novo módulo</Button>
      </div>

      {!modules.length ? <EmptyState icon={<ListPlus />} title="O currículo está vazio" description="Crie o primeiro módulo e depois adicione as aulas." action={<Button onClick={() => setModuleDlg({})}><Plus /> Criar módulo</Button>} /> : modules.map((m, mi) => {
        const lessons = [...m.lessons].sort((a, b) => a.order - b.order);
        return (
          <section key={m.moduleId} className="rounded-2xl border bg-card" aria-label={`Módulo ${m.title}`}>
            <header className="flex flex-wrap items-center gap-2 border-b p-3 sm:px-4">
              <div className="min-w-0 flex-1"><h3 className="truncate font-semibold">{mi + 1}. {m.title}</h3>{m.description && <p className="truncate text-xs text-muted-foreground">{m.description}</p>}</div>
              {!m.isPublished && <Badge variant="outline">Rascunho</Badge>}
              <div className="flex items-center">
                <Button variant="ghost" size="icon-sm" aria-label="Subir módulo" disabled={mi === 0 || run.isPending} onClick={() => move(modules, (x) => x.moduleId, mi, -1, `/courses/${id}/modules/reorder`)}><ArrowUp /></Button>
                <Button variant="ghost" size="icon-sm" aria-label="Descer módulo" disabled={mi === modules.length - 1 || run.isPending} onClick={() => move(modules, (x) => x.moduleId, mi, 1, `/courses/${id}/modules/reorder`)}><ArrowDown /></Button>
                <Button variant="ghost" size="icon-sm" aria-label={m.isPublished ? 'Passar a rascunho' : 'Publicar módulo'} onClick={() => run.mutate(() => api.patch(`/courses/${id}/modules/${m.moduleId}`, { isPublished: !m.isPublished }))}>{m.isPublished ? <Eye /> : <EyeOff />}</Button>
                <Button variant="ghost" size="icon-sm" aria-label="Editar módulo" onClick={() => setModuleDlg({ module: m })}><Pencil /></Button>
                <Button variant="ghost" size="icon-sm" aria-label="Eliminar módulo" onClick={() => setConfirm({ kind: 'module', moduleId: m.moduleId, title: m.title })}><Trash2 /></Button>
              </div>
            </header>
            <ul className="divide-y">
              {lessons.map((l, li) => (
                <li key={l.lessonId} className="flex flex-wrap items-center gap-2 px-3 py-2.5 sm:px-4">
                  <LessonIcon type={l.lessonType} className="size-4 text-muted-foreground" />
                  <button type="button" className="min-w-0 flex-1 truncate text-left text-sm font-medium hover:underline" onClick={() => setLessonDlg({ moduleId: m.moduleId, lesson: l })}>{l.title}</button>
                  {l.duration ? <span className="text-xs text-muted-foreground">{formatDuration(l.duration)}</span> : null}
                  {l.isFree && <Badge variant="secondary">Grátis</Badge>}
                  {!l.isPublished && <Badge variant="outline">Rascunho</Badge>}
                  <div className="flex items-center">
                    <Button variant="ghost" size="icon-sm" aria-label="Subir aula" disabled={li === 0 || run.isPending} onClick={() => move(lessons, (x) => x.lessonId, li, -1, `/courses/${id}/modules/${m.moduleId}/lessons/reorder`)}><ArrowUp /></Button>
                    <Button variant="ghost" size="icon-sm" aria-label="Descer aula" disabled={li === lessons.length - 1 || run.isPending} onClick={() => move(lessons, (x) => x.lessonId, li, 1, `/courses/${id}/modules/${m.moduleId}/lessons/reorder`)}><ArrowDown /></Button>
                    <Button variant="ghost" size="icon-sm" aria-label={l.isPublished ? 'Passar aula a rascunho' : 'Publicar aula'} onClick={() => run.mutate(() => api.patch(`/courses/${id}/modules/${m.moduleId}/lessons/${l.lessonId}`, { isPublished: !l.isPublished }))}>{l.isPublished ? <Eye /> : <EyeOff />}</Button>
                    <Button variant="ghost" size="icon-sm" aria-label="Eliminar aula" onClick={() => setConfirm({ kind: 'lesson', moduleId: m.moduleId, lessonId: l.lessonId, title: l.title })}><Trash2 /></Button>
                  </div>
                </li>
              ))}
              {!lessons.length && <li className="px-4 py-4 text-sm text-muted-foreground">Sem aulas neste módulo.</li>}
            </ul>
            <footer className="flex flex-wrap gap-2 border-t p-3 sm:px-4">
              <Button variant="outline" size="sm" onClick={() => setLessonDlg({ moduleId: m.moduleId })}><Plus /> Nova aula</Button>
              <Button variant="ghost" size="sm" onClick={() => setBatchFor(m)}><ListPlus /> Adicionar várias</Button>
            </footer>
          </section>
        );
      })}

      {moduleDlg && <ModuleDialog courseId={id} module={moduleDlg.module} onClose={() => setModuleDlg(null)} onDone={refresh} />}
      {lessonDlg && <LessonDialog courseId={id} moduleId={lessonDlg.moduleId} lesson={lessonDlg.lesson} open onOpenChange={(o) => !o && setLessonDlg(null)} />}
      {batchFor && <BatchDialog courseId={id} module={batchFor} onClose={() => setBatchFor(null)} onDone={refresh} />}

      <Dialog open={!!confirm} onOpenChange={(o) => !o && setConfirm(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Eliminar {confirm?.kind === 'module' ? 'módulo' : 'aula'}?</DialogTitle><DialogDescription>{confirm?.kind === 'module' ? `“${confirm?.title}” e todas as suas aulas serão eliminados.` : `“${confirm?.title}” será eliminada.`} Esta acção não pode ser anulada.</DialogDescription></DialogHeader>
          <DialogFooter><Button variant="ghost" onClick={() => setConfirm(null)}>Cancelar</Button><Button variant="destructive" loading={run.isPending} onClick={() => { const c = confirm!; run.mutate(() => api.del(c.kind === 'module' ? `/courses/${id}/modules/${c.moduleId}` : `/courses/${id}/modules/${c.moduleId}/lessons/${c.lessonId}`), { onSuccess: () => { setConfirm(null); refresh(); toast.success('Eliminado'); } }); }}>Eliminar</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ModuleDialog({ courseId, module, onClose, onDone }: { courseId: string; module?: ManagedModule; onClose: () => void; onDone: () => void }) {
  const [title, setTitle] = React.useState(module?.title ?? '');
  const [description, setDescription] = React.useState(module?.description ?? '');
  const [err, setErr] = React.useState('');
  const save = useMutation({
    mutationFn: () => {
      if (title.trim().length < 3) { setErr('Mínimo de 3 caracteres'); throw new Error('validation'); }
      const body = { title: title.trim(), description: description.trim() || undefined };
      return module ? api.patch(`/courses/${courseId}/modules/${module.moduleId}`, body) : api.post(`/courses/${courseId}/modules`, body);
    },
    onSuccess: () => { onDone(); toast.success(module ? 'Módulo actualizado' : 'Módulo criado'); onClose(); },
    onError: (e) => { if (e instanceof ApiError) toast.error(e.message); },
  });
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader><DialogTitle>{module ? 'Editar módulo' : 'Novo módulo'}</DialogTitle><DialogDescription>Um módulo agrupa aulas sobre o mesmo tema.</DialogDescription></DialogHeader>
        <form className="grid gap-4" noValidate onSubmit={(e) => { e.preventDefault(); save.mutate(); }}>
          <Field label="Título" htmlFor="m-title" error={err}><Input id="m-title" autoFocus value={title} onChange={(e) => { setTitle(e.target.value); setErr(''); }} aria-invalid={!!err} /></Field>
          <Field label="Descrição (opcional)" htmlFor="m-desc"><Textarea id="m-desc" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} /></Field>
          <DialogFooter><Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button><Button type="submit" loading={save.isPending}>{module ? 'Guardar' : 'Criar módulo'}</Button></DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/** Uma aula de texto por linha — cria até 50 de uma vez. */
function BatchDialog({ courseId, module, onClose, onDone }: { courseId: string; module: ManagedModule; onClose: () => void; onDone: () => void }) {
  const [text, setText] = React.useState('');
  const [publish, setPublish] = React.useState(false);
  const titles = text.split('\n').map((t) => t.trim()).filter(Boolean);
  const save = useMutation({
    mutationFn: () => api.post(`/courses/${courseId}/modules/${module.moduleId}/lessons/batch`, { lessons: titles.map((title) => ({ title, lessonType: 'text', isPublished: publish })) }),
    onSuccess: () => { onDone(); toast.success(`${titles.length} aula(s) criada(s)`); onClose(); },
    onError: (e) => toast.error(errMsg(e)),
  });
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader><DialogTitle>Adicionar várias aulas</DialogTitle><DialogDescription>Escreva um título por linha (máx. 50). Serão criadas como aulas de texto em “{module.title}”; preencha o conteúdo depois.</DialogDescription></DialogHeader>
        <form className="grid gap-4" onSubmit={(e) => { e.preventDefault(); save.mutate(); }}>
          <Field label="Títulos" htmlFor="b-titles" hint={`${titles.length} aula(s)`}><Textarea id="b-titles" rows={8} autoFocus value={text} onChange={(e) => setText(e.target.value)} placeholder={'Introdução\nConceitos básicos\nExercícios resolvidos'} /></Field>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={publish} onChange={(e) => setPublish(e.target.checked)} className="size-4 accent-primary" /> Publicar logo</label>
          <DialogFooter><Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button><Button type="submit" disabled={!titles.length || titles.length > 50 || titles.some((t) => t.length < 3)} loading={save.isPending}>Criar {titles.length || ''} aula(s)</Button></DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
