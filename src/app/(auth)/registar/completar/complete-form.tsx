'use client';
import * as React from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Building2, FileUp, GraduationCap, UserRound, X } from 'lucide-react';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ApiError, request } from '@/lib/api/client';
import type { AuthResponse } from '@/lib/api/types';
import { useAuth } from '@/lib/auth/auth-provider';
import { safeNext } from '@/lib/safe-next';
import { cn } from '@/lib/utils';

const ROLES = [
  { id: 'student', label: 'Aluno', desc: 'Quero aprender', icon: UserRound },
  { id: 'instructor', label: 'Instrutor', desc: 'Quero ensinar', icon: GraduationCap },
  { id: 'institution', label: 'Instituição', desc: 'Represento uma escola', icon: Building2 },
] as const;
type RoleId = (typeof ROLES)[number]['id'];

const DOCS: Record<'instructor' | 'institution', { field: string; label: string }[]> = {
  instructor: [{ field: 'diplomas', label: 'Diplomas' }, { field: 'certificacoes', label: 'Certificações' }, { field: 'experiencia', label: 'Experiência profissional' }, { field: 'registroProfissional', label: 'Registo profissional' }],
  institution: [{ field: 'alvara', label: 'Alvará' }, { field: 'credenciamento', label: 'Credenciamento' }, { field: 'estatutos', label: 'Estatutos' }, { field: 'endereco', label: 'Comprovativo de morada' }],
};
const EDUCATION = [['graduation', 'Licenciatura'], ['specialization', 'Especialização'], ['masters', 'Mestrado'], ['phd', 'Doutoramento']];
const INSTITUTIONS = [['Universidade', 'Universidade'], ['Faculdade', 'Faculdade'], ['EscolaTecnica', 'Escola técnica'], ['CentroPesquisa', 'Centro de pesquisa'], ['PlataformaOnline', 'Plataforma online'], ['OngEducacional', 'ONG educacional'], ['Outro', 'Outro']];
const MAX_MB = 10;

const schema = z.object({
  username: z.string().trim().min(3, 'Mínimo de 3 caracteres').max(30, 'Máximo de 30 caracteres').regex(/^[a-zA-Z0-9_]+$/, 'Apenas letras, números e _').refine((v) => !/admin/i.test(v), 'Nome não permitido'),
  role: z.enum(['student', 'instructor', 'institution']),
  fullName: z.string().trim().max(150).optional(),
  educationLevel: z.string().optional(),
  educationField: z.string().trim().max(150).optional(),
  institutionName: z.string().trim().optional(),
  institutionType: z.string().optional(),
  legalRepresentative: z.string().trim().max(150).optional(),
  nuit: z.string().trim().optional(),
  contactPhone: z.string().trim().max(30).optional(),
}).superRefine((v, ctx) => {
  if (v.role !== 'institution' && !v.fullName) ctx.addIssue({ code: 'custom', path: ['fullName'], message: 'Indique o seu nome completo' });
  if (v.role === 'institution') {
    if (!v.institutionName || v.institutionName.length < 3) ctx.addIssue({ code: 'custom', path: ['institutionName'], message: 'Indique o nome da instituição (mín. 3 caracteres)' });
    if (v.nuit && !/^\d{9}$/.test(v.nuit)) ctx.addIssue({ code: 'custom', path: ['nuit'], message: 'O NUIT tem 9 dígitos' });
  }
});
type Values = z.infer<typeof schema>;

export function CompleteForm() {
  const router = useRouter();
  const sp = useSearchParams();
  const token = sp.get('token');
  const { adopt } = useAuth();
  const [error, setError] = React.useState('');
  const [files, setFiles] = React.useState<Record<string, File[]>>({});
  const [docError, setDocError] = React.useState('');
  const intent = React.useMemo(() => { try { return JSON.parse(localStorage.getItem('donza:reg') ?? '{}') as { papel?: string; next?: string }; } catch { return {}; } }, []);
  const initialRole = (['student', 'instructor', 'institution'] as const).find((r) => r === (sp.get('papel') ?? intent.papel)) ?? 'student';

  const { register, control, handleSubmit, watch, setError: setFieldError, formState: { errors, isSubmitting } } = useForm<Values>({ resolver: zodResolver(schema), defaultValues: { role: initialRole } });
  const role = watch('role') as RoleId;
  const docs = role === 'student' ? null : DOCS[role];

  function addFiles(field: string, list: FileList | null) {
    if (!list) return;
    const picked = [...list];
    if (picked.some((f) => f.size > MAX_MB * 1024 * 1024)) { setDocError(`Cada ficheiro pode ter no máximo ${MAX_MB} MB.`); return; }
    setDocError(''); setFiles((f) => ({ ...f, [field]: [...(f[field] ?? []), ...picked].slice(0, 5) }));
  }

  if (!token) return <div className="grid gap-4 text-center"><h1 className="text-2xl font-bold">Ligação incompleta</h1><Button asChild><Link href="/registar">Voltar ao registo</Link></Button></div>;

  async function onSubmit(v: Values) {
    setError('');
    const total = Object.values(files).flat().length;
    if (v.role !== 'student' && total === 0) { setDocError('Envie pelo menos um documento para validação do perfil.'); return; }
    const form = new FormData();
    form.set('token', token!);
    for (const [k, val] of Object.entries(v)) if (val) form.set(k, String(val));
    if (v.role !== 'student') for (const [field, list] of Object.entries(files)) list.forEach((f) => form.append(field, f));
    try {
      const res = await request<AuthResponse>('/auth/register/complete', { method: 'POST', form, auth: false });
      adopt(res);
      try { localStorage.removeItem('donza:reg'); } catch { /* ignore */ }
      router.replace(res.user.status === 'approved' ? safeNext(intent.next) : '/painel');
    } catch (e) {
      if (e instanceof ApiError) {
        const fe = e.fieldErrors; const names = Object.keys(fe);
        if (names.length) names.forEach((n) => setFieldError(n as keyof Values, { message: fe[n] }));
        if (e.code === 'UNIQUE_CONSTRAINT' || /utilizador|username|email/i.test(e.message)) setFieldError('username', { message: e.message });
        setError(e.message);
      } else setError('Sem ligação ao servidor.');
    }
  }

  return (
    <div className="grid gap-8">
      <div><h1 className="text-3xl font-bold">Quase lá</h1><p className="mt-2 text-muted-foreground">Passo 2 de 2 · Diga-nos quem é.</p></div>
      <form onSubmit={handleSubmit(onSubmit)} className="grid gap-5" noValidate>
        {error && <p role="alert" className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}

        <Controller control={control} name="role" render={({ field }) => (
          <fieldset className="grid gap-2"><legend className="mb-1 text-sm font-medium">Como vai usar a Donza?</legend>
            <div className="grid grid-cols-3 gap-2.5">{ROLES.map(({ id, label, desc, icon: I }) => (
              <label key={id} className={cn('flex cursor-pointer flex-col items-center gap-1 rounded-xl border p-3 text-center transition has-[:focus-visible]:ring-[3px] has-[:focus-visible]:ring-ring/40', field.value === id ? 'border-primary bg-primary/5 shadow-sm' : 'hover:bg-muted/60')}>
                <input type="radio" className="sr-only" name="role" value={id} checked={field.value === id} onChange={() => field.onChange(id)} />
                <I className={cn('size-6', field.value === id ? 'text-primary' : 'text-muted-foreground')} /><span className="text-sm font-semibold">{label}</span><span className="text-[11px] leading-tight text-muted-foreground">{desc}</span>
              </label>))}</div>
          </fieldset>)} />

        <Field label="Nome de utilizador" htmlFor="username" error={errors.username?.message} hint="Letras, números e _ (3 a 30 caracteres)"><Input id="username" autoComplete="username" autoCapitalize="none" aria-invalid={!!errors.username} {...register('username')} /></Field>

        {role !== 'institution' ? (
          <>
            <Field label="Nome completo" htmlFor="fullName" error={errors.fullName?.message}><Input id="fullName" autoComplete="name" aria-invalid={!!errors.fullName} {...register('fullName')} /></Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Nível de formação" error={errors.educationLevel?.message}>
                <Controller control={control} name="educationLevel" render={({ field }) => (
                  <Select value={field.value ?? ''} onValueChange={field.onChange}><SelectTrigger aria-label="Nível de formação"><SelectValue placeholder="Seleccionar" /></SelectTrigger><SelectContent>{EDUCATION.map(([v, l]) => <SelectItem key={v} value={v!}>{l}</SelectItem>)}</SelectContent></Select>)} />
              </Field>
              <Field label="Área de formação" htmlFor="educationField"><Input id="educationField" placeholder="Ex.: Matemática" {...register('educationField')} /></Field>
            </div>
          </>
        ) : (
          <>
            <Field label="Nome da instituição" htmlFor="institutionName" error={errors.institutionName?.message}><Input id="institutionName" aria-invalid={!!errors.institutionName} {...register('institutionName')} /></Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Tipo">
                <Controller control={control} name="institutionType" render={({ field }) => (
                  <Select value={field.value ?? ''} onValueChange={field.onChange}><SelectTrigger aria-label="Tipo de instituição"><SelectValue placeholder="Seleccionar" /></SelectTrigger><SelectContent>{INSTITUTIONS.map(([v, l]) => <SelectItem key={v} value={v!}>{l}</SelectItem>)}</SelectContent></Select>)} />
              </Field>
              <Field label="NUIT" htmlFor="nuit" error={errors.nuit?.message}><Input id="nuit" inputMode="numeric" maxLength={9} placeholder="9 dígitos" aria-invalid={!!errors.nuit} {...register('nuit')} /></Field>
              <Field label="Representante legal" htmlFor="legalRepresentative"><Input id="legalRepresentative" {...register('legalRepresentative')} /></Field>
              <Field label="Telefone de contacto" htmlFor="contactPhone"><Input id="contactPhone" type="tel" autoComplete="tel" {...register('contactPhone')} /></Field>
            </div>
          </>
        )}

        {docs && (
          <fieldset className="grid gap-3 rounded-xl border bg-muted/30 p-4">
            <legend className="px-1 text-sm font-medium">Documentos de validação</legend>
            <p className="text-xs text-muted-foreground">Envie pelo menos um documento (PDF ou imagem, até {MAX_MB} MB). A equipa Donza analisa-os antes de activar a conta.</p>
            {docs.map(({ field, label }) => (
              <div key={field} className="grid gap-1.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm">{label}</span>
                  <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border bg-card px-2.5 py-1.5 text-xs font-medium transition hover:bg-muted has-[:focus-visible]:ring-[3px] has-[:focus-visible]:ring-ring/40"><FileUp className="size-3.5" />Anexar
                    <input type="file" className="sr-only" accept=".pdf,image/*" multiple onChange={(e) => { addFiles(field, e.target.files); e.target.value = ''; }} /></label>
                </div>
                {files[field]?.map((f, i) => (
                  <div key={i} className="flex items-center justify-between gap-2 rounded-lg bg-card px-2.5 py-1.5 text-xs ring-1 ring-border"><span className="truncate">{f.name}</span>
                    <button type="button" aria-label={`Remover ${f.name}`} className="text-muted-foreground hover:text-destructive" onClick={() => setFiles((all) => ({ ...all, [field]: all[field]!.filter((_, j) => j !== i) }))}><X className="size-3.5" /></button></div>))}
              </div>
            ))}
            {docError && <p role="alert" className="text-xs text-destructive">{docError}</p>}
          </fieldset>
        )}

        <Button type="submit" size="lg" loading={isSubmitting}>Concluir registo</Button>
      </form>
    </div>
  );
}
