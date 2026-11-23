'use client';
import * as React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ImagePlus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Field } from '@/components/ui/field';
import { Input, Textarea } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TagInput } from '@/components/ui/tag-input';
import { ApiError, api } from '@/lib/api/client';
import type { ManagedCourse } from '@/lib/api/types';
import { useAuth } from '@/lib/auth/auth-provider';
import { LEVEL_LABEL } from '@/lib/utils';
import { CourseCover } from './course-cover';

export const CATEGORIES = ['Matemática', 'Ciências', 'Tecnologia', 'Línguas', 'Negócios', 'Artes', 'Saúde', 'Humanidades'];
const MAX_COVER = 5 * 1024 * 1024;

const schema = z.object({
  title: z.string().trim().min(5, 'Mínimo de 5 caracteres').max(150),
  shortDescription: z.string().trim().min(10, 'Mínimo de 10 caracteres').max(200, 'Máximo de 200 caracteres'),
  description: z.string().trim().max(20000).optional(),
  category: z.string().optional(),
  level: z.enum(['beginner', 'intermediate', 'advanced']),
  language: z.string().trim().max(40).optional(),
  duration: z.string().trim().refine((v) => !v || (/^\d+$/.test(v) && +v >= 1 && +v <= 10000), 'Horas inteiras entre 1 e 10000').optional(),
  price: z.string().trim().refine((v) => !v || (/^\d+(\.\d{1,2})?$/.test(v) && +v <= 1_000_000), 'Valor inválido (máx. 2 casas decimais)').optional(),
  currency: z.enum(['MZN', 'USD', 'EUR', 'ZAR']),
  isPublic: z.boolean(),
  instructorId: z.string().optional(),
});
type Values = z.infer<typeof schema>;

export function CourseForm({ course }: { course?: ManagedCourse }) {
  const router = useRouter();
  const qc = useQueryClient();
  const { user } = useAuth();
  const needsInstructor = user?.role === 'institution' || user?.role === 'admin';
  const [requirements, setRequirements] = React.useState<string[]>(course?.requirements ?? []);
  const [outcomes, setOutcomes] = React.useState<string[]>(course?.learningOutcomes ?? []);
  const [cover, setCover] = React.useState<File | null>(null);
  const [removeCover, setRemoveCover] = React.useState(false);
  const [coverError, setCoverError] = React.useState('');
  const preview = React.useMemo(() => (cover ? URL.createObjectURL(cover) : null), [cover]);
  React.useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);

  const instructors = useQuery({
    queryKey: ['inst-instructors', user?.userId], enabled: user?.role === 'institution' && !course,
    queryFn: () => api.page<{ instructor: { userId: string; name: string } }>(`/institutions/${user!.userId}/instructors`, { status: 'accepted', limit: 100 }),
  });

  const { register, control, handleSubmit, setError, formState: { errors } } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: course?.title ?? '', shortDescription: course?.shortDescription ?? '', description: course?.description ?? '', category: course?.category ?? undefined,
      level: course?.level ?? 'beginner', language: course?.language ?? 'Portuguese', duration: course?.duration ? String(course.duration) : '', price: course ? String(Number(course.price)) : '0',
      currency: (course?.currency as Values['currency']) ?? 'MZN', isPublic: course?.isPublic ?? true,
    },
  });

  const save = useMutation({
    mutationFn: async (v: Values) => {
      if (!course && !cover) throw new ApiError(400, 'A capa do curso é obrigatória', 'VALIDATION_ERROR');
      if (needsInstructor && !course && !v.instructorId) throw new ApiError(400, 'Escolha o instrutor responsável', 'VALIDATION_ERROR', [{ field: 'instructorId', message: 'Escolha o instrutor responsável' }]);
      const f = new FormData();
      f.set('title', v.title); f.set('shortDescription', v.shortDescription);
      f.set('description', v.description ?? ''); if (v.category) f.set('category', v.category);
      f.set('level', v.level); if (v.language) f.set('language', v.language);
      if (v.duration) f.set('duration', v.duration);
      f.set('price', v.price || '0'); f.set('currency', v.currency); f.set('isPublic', String(v.isPublic));
      f.set('requirements', JSON.stringify(requirements)); f.set('learningOutcomes', JSON.stringify(outcomes));
      if (v.instructorId && !course) f.set('instructorId', v.instructorId);
      if (cover) f.set('coverImage', cover);
      if (course && removeCover && !cover) f.set('removeCover', 'true');
      return course ? api.upload<ManagedCourse>(`/courses/${course.courseId}`, f, 'PATCH') : api.upload<{ courseId: string }>('/courses', f);
    },
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['authored'] }); qc.invalidateQueries({ queryKey: ['course-counts'] }); qc.invalidateQueries({ queryKey: ['manage'] });
      toast.success(course ? 'Curso actualizado' : 'Curso criado. Adicione agora o conteúdo.');
      if (!course) router.replace(`/gestao/${(res as { courseId: string }).courseId}?tab=curriculo`);
    },
    onError: (e) => {
      if (e instanceof ApiError) { Object.entries(e.fieldErrors).forEach(([k, m]) => setError(k as keyof Values, { message: m })); if (/capa/i.test(e.message)) setCoverError(e.message); toast.error(e.message); }
      else toast.error('Sem ligação ao servidor.');
    },
  });

  function pickCover(f?: File) {
    if (!f) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(f.type)) { setCoverError('Use uma imagem JPEG, PNG ou WEBP.'); return; }
    if (f.size > MAX_COVER) { setCoverError('A capa pode ter no máximo 5 MB.'); return; }
    setCoverError(''); setCover(f); setRemoveCover(false);
  }
  const shownCover = preview ?? (!removeCover ? course?.coverImageUrl : null);

  return (
    <form onSubmit={handleSubmit((v) => save.mutate(v))} className="grid max-w-3xl gap-8" noValidate>
      <section className="grid gap-5 rounded-2xl border bg-card p-6">
        <h2 className="text-lg font-semibold">Informação básica</h2>
        <Field label="Título" htmlFor="title" error={errors.title?.message}><Input id="title" aria-invalid={!!errors.title} {...register('title')} /></Field>
        <Field label="Descrição curta" htmlFor="shortDescription" error={errors.shortDescription?.message} hint="Aparece nos cartões do catálogo (10–200 caracteres)."><Textarea id="shortDescription" rows={2} aria-invalid={!!errors.shortDescription} {...register('shortDescription')} /></Field>
        <Field label="Descrição completa" htmlFor="description" error={errors.description?.message}><Textarea id="description" rows={7} {...register('description')} /></Field>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Categoria"><Controller control={control} name="category" render={({ field }) => (
            <Select value={field.value ?? ''} onValueChange={field.onChange}><SelectTrigger aria-label="Categoria"><SelectValue placeholder="Seleccionar" /></SelectTrigger><SelectContent>{CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select>)} /></Field>
          <Field label="Nível"><Controller control={control} name="level" render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}><SelectTrigger aria-label="Nível"><SelectValue /></SelectTrigger><SelectContent>{Object.entries(LEVEL_LABEL).map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}</SelectContent></Select>)} /></Field>
          <Field label="Idioma" htmlFor="language"><Input id="language" {...register('language')} /></Field>
          <Field label="Duração (horas)" htmlFor="duration" error={errors.duration?.message}><Input id="duration" inputMode="numeric" aria-invalid={!!errors.duration} {...register('duration')} /></Field>
        </div>
        {needsInstructor && !course && (
          <Field label="Instrutor responsável" error={errors.instructorId?.message}>
            <Controller control={control} name="instructorId" render={({ field }) => (
              <Select value={field.value ?? ''} onValueChange={field.onChange}><SelectTrigger aria-label="Instrutor responsável"><SelectValue placeholder={instructors.data && !instructors.data.data.length ? 'Sem instrutores ligados' : 'Seleccionar'} /></SelectTrigger>
                <SelectContent>{instructors.data?.data.map((i) => <SelectItem key={i.instructor.userId} value={i.instructor.userId}>{i.instructor.name}</SelectItem>)}</SelectContent></Select>)} />
          </Field>
        )}
      </section>

      <section className="grid gap-4 rounded-2xl border bg-card p-6">
        <h2 className="text-lg font-semibold">Capa</h2>
        <div className="grid items-start gap-4 sm:grid-cols-[260px_1fr]">
          <div className="overflow-hidden rounded-xl border">
            {shownCover ? <div className="relative aspect-[16/9]"><Image src={shownCover} alt="Pré-visualização da capa" fill unoptimized={!!preview} sizes="260px" className="object-cover" /></div> : <CourseCover title={course?.title || 'Novo curso'} category={undefined} />}
          </div>
          <div className="grid gap-2">
            <label className="inline-flex w-fit cursor-pointer items-center gap-2 rounded-lg border bg-card px-3.5 py-2 text-sm font-medium transition hover:bg-muted has-[:focus-visible]:ring-[3px] has-[:focus-visible]:ring-ring/40"><ImagePlus className="size-4" />{shownCover ? 'Substituir imagem' : 'Escolher imagem'}
              <input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={(e) => { pickCover(e.target.files?.[0]); e.target.value = ''; }} /></label>
            {course && course.coverImageUrl && !cover && !removeCover && <Button type="button" variant="ghost" size="sm" className="w-fit" onClick={() => setRemoveCover(true)}><Trash2 />Remover capa</Button>}
            <p className="text-xs text-muted-foreground">JPEG, PNG ou WEBP, até 5 MB. Proporção 16:9 recomendada.{!course && ' Obrigatória.'}</p>
            {coverError && <p role="alert" className="text-xs text-destructive">{coverError}</p>}
          </div>
        </div>
      </section>

      <section className="grid gap-5 rounded-2xl border bg-card p-6">
        <h2 className="text-lg font-semibold">Preço e visibilidade</h2>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Preço" htmlFor="price" error={errors.price?.message} hint="0 = gratuito"><Input id="price" inputMode="decimal" aria-invalid={!!errors.price} {...register('price')} /></Field>
          <Field label="Moeda"><Controller control={control} name="currency" render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}><SelectTrigger aria-label="Moeda"><SelectValue /></SelectTrigger><SelectContent>{['MZN', 'USD', 'EUR', 'ZAR'].map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select>)} /></Field>
        </div>
        <Controller control={control} name="isPublic" render={({ field }) => (
          <div className="flex items-start gap-3"><Checkbox id="isPublic" checked={field.value} onCheckedChange={(v) => field.onChange(v === true)} className="mt-0.5" />
            <div><Label htmlFor="isPublic">Visível no catálogo público</Label><p className="text-xs text-muted-foreground">Se desmarcar, só quem já está matriculado acede ao curso.</p></div></div>)} />
      </section>

      <section className="grid gap-5 rounded-2xl border bg-card p-6">
        <h2 className="text-lg font-semibold">O que os alunos vão aprender</h2>
        <TagInput label="Objectivo" value={outcomes} onChange={setOutcomes} placeholder="Ex.: Resolver equações do 2.º grau" />
        <h2 className="mt-2 text-lg font-semibold">Requisitos</h2>
        <TagInput label="Requisito" value={requirements} onChange={setRequirements} placeholder="Ex.: Conhecimentos básicos de álgebra" />
      </section>

      <div className="flex justify-end gap-3"><Button type="button" variant="ghost" onClick={() => router.back()}>Cancelar</Button><Button type="submit" size="lg" loading={save.isPending}>{course ? 'Guardar alterações' : 'Criar curso'}</Button></div>
    </form>
  );
}
