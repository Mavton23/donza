'use client';
import * as React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Field } from '@/components/ui/field';
import { Input, Textarea } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TagInput } from '@/components/ui/tag-input';
import { ApiError, api } from '@/lib/api/client';
import type { LessonType, ManagedLesson } from '@/lib/api/types';
import { LESSON_TYPE_LABEL } from '@/lib/utils';
import { MediaUpload, type MediaKind } from './media-upload';

const TYPES: LessonType[] = ['text', 'video', 'audio', 'pdf'];
const isMedia = (t: LessonType): t is MediaKind => t === 'video' || t === 'audio' || t === 'pdf';

/** Criar ou editar uma aula. `lesson` ausente = criar. */
export function LessonDialog({ courseId, moduleId, lesson, open, onOpenChange, library }: { courseId?: string; moduleId: string; lesson?: ManagedLesson; open: boolean; onOpenChange: (o: boolean) => void; /** módulo da biblioteca (sem curso) */ library?: boolean }) {
  const qc = useQueryClient();
  const [title, setTitle] = React.useState('');
  const [type, setType] = React.useState<LessonType>('text');
  const [content, setContent] = React.useState('');
  const [mediaUrl, setMediaUrl] = React.useState<string | null>(null);
  const [minutes, setMinutes] = React.useState('');
  const [links, setLinks] = React.useState<string[]>([]);
  const [free, setFree] = React.useState(false);
  const [price, setPrice] = React.useState('0');
  const [published, setPublished] = React.useState(false);
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  React.useEffect(() => {
    if (!open) return;
    setTitle(lesson?.title ?? ''); setType(lesson?.lessonType ?? 'text'); setContent(lesson?.content ?? ''); setMediaUrl(lesson?.mediaUrl ?? null);
    setMinutes(lesson?.duration ? String(Math.round(lesson.duration / 60)) : ''); setLinks(lesson?.externalResources ?? []);
    setFree(lesson?.isFree ?? false); setPrice(lesson ? String(Number(lesson.price)) : '0'); setPublished(lesson?.isPublished ?? false); setErrors({});
  }, [open, lesson]);

  const save = useMutation({
    mutationFn: () => {
      const e: Record<string, string> = {};
      if (title.trim().length < 3) e.title = 'Mínimo de 3 caracteres';
      if (minutes && !/^\d+$/.test(minutes)) e.duration = 'Minutos inteiros';
      if (!free && price && !/^\d+(\.\d{1,2})?$/.test(price)) e.price = 'Valor inválido';
      if (published && isMedia(type) && !mediaUrl) e.mediaUrl = 'Envie o ficheiro antes de publicar';
      if (Object.keys(e).length) { setErrors(e); throw new ApiError(400, 'Corrija os campos assinalados', 'VALIDATION_ERROR'); }
      const body = {
        title: title.trim(), lessonType: type, content: content.trim() || undefined, mediaUrl: isMedia(type) ? mediaUrl ?? undefined : undefined,
        duration: minutes ? Number(minutes) * 60 : undefined, externalResources: links, isFree: free, price: free ? 0 : Number(price || 0), isPublished: published,
      };
      const base = library ? `/library/modules/${moduleId}/lessons` : `/courses/${courseId}/modules/${moduleId}/lessons`;
      return lesson ? api.patch(`${base}/${lesson.lessonId}`, body) : api.post(base, body);
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: library ? ['library-module', moduleId] : ['manage', courseId] }); toast.success(lesson ? 'Aula actualizada' : 'Aula criada'); onOpenChange(false); },
    onError: (e) => { if (e instanceof ApiError) { if (Object.keys(e.fieldErrors).length) setErrors(e.fieldErrors); if (e.code !== 'VALIDATION_ERROR' || !Object.keys(errors).length) toast.error(e.message); } else toast.error('Sem ligação ao servidor.'); },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90dvh] max-w-xl overflow-y-auto">
        <DialogHeader><DialogTitle>{lesson ? 'Editar aula' : 'Nova aula'}</DialogTitle><DialogDescription>As aulas só ficam visíveis aos alunos depois de publicadas.</DialogDescription></DialogHeader>
        <form className="grid gap-4" onSubmit={(e) => { e.preventDefault(); save.mutate(); }} noValidate>
          <Field label="Título" htmlFor="l-title" error={errors.title}><Input id="l-title" value={title} onChange={(e) => setTitle(e.target.value)} autoFocus aria-invalid={!!errors.title} /></Field>
          <Field label="Tipo"><Select value={type} onValueChange={(v) => setType(v as LessonType)}><SelectTrigger aria-label="Tipo de aula"><SelectValue /></SelectTrigger><SelectContent>{TYPES.map((t) => <SelectItem key={t} value={t}>{LESSON_TYPE_LABEL[t]}</SelectItem>)}</SelectContent></Select></Field>
          {isMedia(type) && <Field label="Ficheiro" error={errors.mediaUrl}><MediaUpload courseId={courseId} signPath={library ? '/library/media/signature' : undefined} kind={type} value={mediaUrl} onUploaded={(url, d) => { setMediaUrl(url); if (d && !minutes) setMinutes(String(Math.max(1, Math.round(d / 60)))); }} onClear={() => setMediaUrl(null)} /></Field>}
          <Field label={type === 'text' ? 'Conteúdo' : 'Descrição / notas'} htmlFor="l-content" error={errors.content}><Textarea id="l-content" rows={type === 'text' ? 8 : 3} value={content} onChange={(e) => setContent(e.target.value)} /></Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Duração (minutos)" htmlFor="l-dur" error={errors.duration}><Input id="l-dur" inputMode="numeric" value={minutes} onChange={(e) => setMinutes(e.target.value)} /></Field>
            <Field label="Preço da aula" htmlFor="l-price" error={errors.price} hint="Só tem efeito fora de cursos pagos"><Input id="l-price" inputMode="decimal" value={free ? '0' : price} disabled={free} onChange={(e) => setPrice(e.target.value)} /></Field>
          </div>
          <div className="grid gap-1.5"><Label>Recursos externos</Label><TagInput label="Ligação" value={links} onChange={setLinks} max={20} placeholder="https://…" />{errors.externalResources && <p role="alert" className="text-xs text-destructive">{errors.externalResources}</p>}</div>
          <div className="grid gap-3 rounded-xl bg-muted/50 p-3.5">
            <div className="flex items-start gap-3"><Checkbox id="l-free" checked={free} onCheckedChange={(v) => setFree(v === true)} className="mt-0.5" /><div><Label htmlFor="l-free">Pré-visualização gratuita</Label><p className="text-xs text-muted-foreground">Visível a quem ainda não está matriculado.</p></div></div>
            <div className="flex items-start gap-3"><Checkbox id="l-pub" checked={published} onCheckedChange={(v) => setPublished(v === true)} className="mt-0.5" /><div><Label htmlFor="l-pub">Publicada</Label><p className="text-xs text-muted-foreground">Desmarcada, fica como rascunho.</p></div></div>
          </div>
          <DialogFooter><Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button><Button type="submit" loading={save.isPending}>{lesson ? 'Guardar' : 'Criar aula'}</Button></DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
