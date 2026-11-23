'use client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import * as React from 'react';
import { toast } from 'sonner';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Field } from '@/components/ui/field';
import { Input, Textarea } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TagInput } from '@/components/ui/tag-input';
import { ApiError, api } from '@/lib/api/client';

export function NewCommunity() {
  const router = useRouter(); const qc = useQueryClient();
  const [name, setName] = React.useState(''); const [short, setShort] = React.useState(''); const [desc, setDesc] = React.useState('');
  const [isPublic, setPublic] = React.useState(true); const [type, setType] = React.useState('open'); const [tags, setTags] = React.useState<string[]>([]);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const save = useMutation({
    mutationFn: () => {
      const e: Record<string, string> = {};
      if (name.trim().length < 3 || name.trim().length > 50) e.name = 'Entre 3 e 50 caracteres';
      if (Object.keys(e).length) { setErrors(e); throw new Error('v'); }
      const f = new FormData(); f.set('name', name.trim()); if (short.trim()) f.set('shortDescription', short.trim()); if (desc.trim()) f.set('description', desc.trim());
      f.set('isPublic', String(isPublic)); f.set('membershipType', type); f.set('tags', JSON.stringify(tags));
      return api.upload<{ slug: string }>('/communities', f);
    },
    onSuccess: (c) => { qc.invalidateQueries({ queryKey: ['communities'] }); toast.success('Comunidade criada'); router.replace(`/comunidades/${c.slug}`); },
    onError: (e) => { if (e instanceof ApiError) { if (Object.keys(e.fieldErrors).length) setErrors(e.fieldErrors); else toast.error(e.message); } },
  });
  return (
    <>
      <PageHeader title="Nova comunidade" description="Um espaço para discutir, partilhar recursos e estudar em conjunto." />
      <form className="grid max-w-2xl gap-5 rounded-2xl border bg-card p-6" noValidate onSubmit={(e) => { e.preventDefault(); save.mutate(); }}>
        <Field label="Nome" htmlFor="c-name" error={errors.name}><Input id="c-name" value={name} onChange={(e) => setName(e.target.value)} autoFocus /></Field>
        <Field label="Resumo" htmlFor="c-short" error={errors.shortDescription} hint="Até 100 caracteres"><Input id="c-short" maxLength={100} value={short} onChange={(e) => setShort(e.target.value)} /></Field>
        <Field label="Descrição" htmlFor="c-desc" error={errors.description}><Textarea id="c-desc" rows={5} value={desc} onChange={(e) => setDesc(e.target.value)} /></Field>
        <div className="grid gap-1.5"><Label>Tags</Label><TagInput label="Tag" value={tags} onChange={setTags} max={10} placeholder="Escreva e prima Enter" />{errors.tags && <p role="alert" className="text-xs text-destructive">{errors.tags}</p>}</div>
        <Field label="Entrada de novos membros"><Select value={type} onValueChange={setType}><SelectTrigger aria-label="Tipo de adesão"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="open">Aberta: qualquer pessoa entra</SelectItem><SelectItem value="approval">Com aprovação</SelectItem><SelectItem value="invite_only">Só por convite</SelectItem></SelectContent></Select></Field>
        <div className="flex items-start gap-3 rounded-xl bg-muted/50 p-3.5"><Checkbox id="c-pub" checked={isPublic} onCheckedChange={(v) => setPublic(v === true)} className="mt-0.5" /><div><Label htmlFor="c-pub">Comunidade pública</Label><p className="text-xs text-muted-foreground">Os tópicos ficam visíveis a quem não é membro.</p></div></div>
        <div className="flex gap-2"><Button type="submit" loading={save.isPending}>Criar comunidade</Button><Button type="button" variant="ghost" onClick={() => router.back()}>Cancelar</Button></div>
      </form>
    </>
  );
}
