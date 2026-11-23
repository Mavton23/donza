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

export function NewGroup() {
  const router = useRouter(); const qc = useQueryClient();
  const [name, setName] = React.useState(''); const [desc, setDesc] = React.useState(''); const [goals, setGoals] = React.useState('');
  const [max, setMax] = React.useState('20'); const [privacy, setPrivacy] = React.useState('public'); const [approval, setApproval] = React.useState(false); const [tags, setTags] = React.useState<string[]>([]);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const save = useMutation({
    mutationFn: () => {
      const e: Record<string, string> = {};
      if (name.trim().length < 3) e.name = 'Mínimo de 3 caracteres';
      if (!/^\d+$/.test(max) || +max < 2 || +max > 500) e.maxMembers = 'Entre 2 e 500';
      if (Object.keys(e).length) { setErrors(e); throw new Error('v'); }
      const f = new FormData(); f.set('name', name.trim()); if (desc.trim()) f.set('description', desc.trim()); if (goals.trim()) f.set('goals', goals.trim());
      f.set('maxMembers', max); f.set('privacy', privacy); f.set('approvalRequired', String(approval)); f.set('tags', JSON.stringify(tags));
      return api.upload<{ groupId: string }>('/study-groups', f);
    },
    onSuccess: (g) => { qc.invalidateQueries({ queryKey: ['groups'] }); toast.success('Grupo criado'); router.replace(`/grupos/${g.groupId}`); },
    onError: (e) => { if (e instanceof ApiError) { if (Object.keys(e.fieldErrors).length) setErrors(e.fieldErrors); else toast.error(e.message); } },
  });
  return (
    <>
      <PageHeader title="Novo grupo de estudo" description="Reúna colegas à volta de um objectivo comum." />
      <form className="grid max-w-2xl gap-5 rounded-2xl border bg-card p-6" noValidate onSubmit={(e) => { e.preventDefault(); save.mutate(); }}>
        <Field label="Nome" htmlFor="g-name" error={errors.name}><Input id="g-name" autoFocus value={name} onChange={(e) => setName(e.target.value)} /></Field>
        <Field label="Descrição" htmlFor="g-desc" error={errors.description}><Textarea id="g-desc" rows={3} value={desc} onChange={(e) => setDesc(e.target.value)} /></Field>
        <Field label="Objectivos" htmlFor="g-goals" error={errors.goals}><Textarea id="g-goals" rows={3} value={goals} onChange={(e) => setGoals(e.target.value)} /></Field>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Máximo de membros" htmlFor="g-max" error={errors.maxMembers}><Input id="g-max" inputMode="numeric" value={max} onChange={(e) => setMax(e.target.value)} /></Field>
          <Field label="Privacidade"><Select value={privacy} onValueChange={setPrivacy}><SelectTrigger aria-label="Privacidade"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="public">Pública</SelectItem><SelectItem value="private">Privada (código ou pedido)</SelectItem><SelectItem value="invite_only">Só por convite</SelectItem></SelectContent></Select></Field>
        </div>
        <div className="grid gap-1.5"><Label>Tags</Label><TagInput label="Tag" value={tags} onChange={setTags} max={10} placeholder="Escreva e prima Enter" /></div>
        <div className="flex items-start gap-3 rounded-xl bg-muted/50 p-3.5"><Checkbox id="g-appr" checked={approval} onCheckedChange={(v) => setApproval(v === true)} className="mt-0.5" /><div><Label htmlFor="g-appr">Exigir aprovação para entrar</Label><p className="text-xs text-muted-foreground">A liderança aceita ou recusa cada pedido.</p></div></div>
        <div className="flex gap-2"><Button type="submit" loading={save.isPending}>Criar grupo</Button><Button type="button" variant="ghost" onClick={() => router.back()}>Cancelar</Button></div>
      </form>
    </>
  );
}
