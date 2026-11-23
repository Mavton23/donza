'use client';
import * as React from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Camera, Check, Lock, LogOut, ShieldCheck, UserRound, X } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '@/components/layout/page-header';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { Field } from '@/components/ui/field';
import { Input, Textarea } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ApiError, api } from '@/lib/api/client';
import type { PersonCard, User } from '@/lib/api/types';
import { useAuth } from '@/lib/auth/auth-provider';
import { displayName } from '@/lib/format';
import { timeAgo } from '@/lib/utils';

export function SettingsView() {
  const router = useRouter();
  const sp = useSearchParams();
  const tab = sp.get('tab') ?? 'perfil';
  return (
    <>
      <PageHeader title="Definições" description="Gira o seu perfil, privacidade e segurança." />
      <Tabs value={tab} onValueChange={(v) => router.replace(`/definicoes?tab=${v}`, { scroll: false })}>
        <TabsList className="h-auto flex-wrap"><TabsTrigger value="perfil"><UserRound className="size-4" />Perfil</TabsTrigger><TabsTrigger value="privacidade"><Lock className="size-4" />Privacidade</TabsTrigger><TabsTrigger value="seguranca"><ShieldCheck className="size-4" />Segurança</TabsTrigger></TabsList>
        <TabsContent value="perfil"><ProfileTab /></TabsContent>
        <TabsContent value="privacidade"><PrivacyTab /></TabsContent>
        <TabsContent value="seguranca"><SecurityTab /></TabsContent>
      </Tabs>
    </>
  );
}

const splitTags = (s: string) => [...new Set(s.split(',').map((t) => t.trim()).filter(Boolean))].slice(0, 20);

function ProfileTab() {
  const { user, setUser } = useAuth();
  const [fullName, setFullName] = React.useState(user?.fullName ?? '');
  const [bio, setBio] = React.useState(user?.bio ?? '');
  const [expertise, setExpertise] = React.useState((user?.expertise ?? []).join(', '));
  const [interests, setInterests] = React.useState((user?.interests ?? []).join(', '));
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const fileRef = React.useRef<HTMLInputElement>(null);
  const isInst = user?.role === 'instructor';

  const save = useMutation({
    mutationFn: () => api.patch<User>('/users/me/profile', { fullName: fullName.trim(), bio: bio.trim() || undefined, expertise: splitTags(expertise), interests: splitTags(interests) }),
    onSuccess: (u) => { setUser({ ...user!, ...u }); setErrors({}); toast.success('Perfil actualizado'); },
    onError: (e) => { if (e instanceof ApiError) { setErrors(e.fieldErrors); toast.error(e.message); } else toast.error('Sem ligação ao servidor.'); },
  });
  const avatar = useMutation({
    mutationFn: (file: File) => { const f = new FormData(); f.set('avatar', file); return api.upload<{ avatarUrl: string }>('/users/me/avatar', f); },
    onSuccess: (r) => { setUser({ ...user!, avatarUrl: r.avatarUrl }); toast.success('Fotografia actualizada'); },
    onError: (e) => toast.error(e instanceof ApiError ? e.message : 'Não foi possível enviar a imagem.'),
  });
  if (!user) return null;

  return (
    <Card className="max-w-2xl"><CardContent className="grid gap-6 p-6">
      <div className="flex items-center gap-4">
        <Avatar src={user.avatarUrl} name={displayName(user)} size={72} />
        <div><Button variant="outline" size="sm" loading={avatar.isPending} onClick={() => fileRef.current?.click()}><Camera />Alterar fotografia</Button><p className="mt-1.5 text-xs text-muted-foreground">JPG, PNG ou WEBP, até 5 MB.</p>
          <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={(e) => { const f = e.target.files?.[0]; if (f) { if (f.size > 5 * 1024 * 1024) toast.error('A imagem excede 5 MB.'); else avatar.mutate(f); } e.target.value = ''; }} /></div>
      </div>
      <form className="grid gap-5" onSubmit={(e) => { e.preventDefault(); save.mutate(); }} noValidate>
        <Field label="Nome completo" htmlFor="fullName" error={errors.fullName}><Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} required aria-invalid={!!errors.fullName} /></Field>
        <Field label="Sobre mim" htmlFor="bio" error={errors.bio} hint={`${bio.length}/500`}><Textarea id="bio" value={bio} maxLength={500} onChange={(e) => setBio(e.target.value)} /></Field>
        <Field label={isInst ? 'Áreas de especialização (mín. 3)' : 'Áreas de especialização'} htmlFor="expertise" error={errors.expertise} hint="Separe por vírgulas"><Input id="expertise" value={expertise} onChange={(e) => setExpertise(e.target.value)} placeholder="Matemática, Física, Estatística" /></Field>
        <Field label="Interesses" htmlFor="interests" hint="Separe por vírgulas"><Input id="interests" value={interests} onChange={(e) => setInterests(e.target.value)} /></Field>
        <div className="flex justify-end"><Button type="submit" loading={save.isPending} disabled={!fullName.trim()}>Guardar alterações</Button></div>
      </form>
    </CardContent></Card>
  );
}

interface Req extends PersonCard { requestedAt: string }

function PrivacyTab() {
  const qc = useQueryClient();
  const { user, setUser } = useAuth();
  const incoming = useQuery({ queryKey: ['follow-requests'], queryFn: () => api.page<Req>('/users/me/follow-requests', { limit: 50 }) });
  const sent = useQuery({ queryKey: ['follow-requests-sent'], queryFn: () => api.page<Req>('/users/me/follow-requests/sent', { limit: 50 }) });
  const refresh = () => { qc.invalidateQueries({ queryKey: ['follow-requests'] }); qc.invalidateQueries({ queryKey: ['follow-requests-sent'] }); qc.invalidateQueries({ queryKey: ['profile'] }); };

  const privacy = useMutation({
    mutationFn: (isPrivate: boolean) => api.patch<{ isPrivate: boolean; acceptedRequests: number }>('/users/me/privacy', { isPrivate }),
    onSuccess: (r) => { setUser({ ...user!, isPrivate: r.isPrivate }); refresh(); toast.success(r.isPrivate ? 'O seu perfil é agora privado' : r.acceptedRequests ? `Perfil público. ${r.acceptedRequests} pedidos foram aceites.` : 'O seu perfil é agora público'); },
    onError: (e) => toast.error(e instanceof ApiError ? e.message : 'Não foi possível alterar.'),
  });
  const decide = useMutation({
    mutationFn: ({ id, accept }: { id: string; accept: boolean }) => api.post(`/users/me/follow-requests/${id}/${accept ? 'accept' : 'decline'}`),
    onSuccess: (_r, v) => { refresh(); toast.success(v.accept ? 'Pedido aceite' : 'Pedido recusado'); },
    onError: (e) => { refresh(); toast.error(e instanceof ApiError ? e.message : 'Não foi possível concluir.'); },
  });
  const cancel = useMutation({ mutationFn: (id: string) => api.del(`/users/${id}/follow`), onSuccess: () => { refresh(); toast.success('Pedido cancelado'); } });
  if (!user) return null;

  return (
    <div className="grid max-w-2xl gap-6">
      <Card><CardContent className="flex items-start justify-between gap-6 p-6">
        <div><h2 className="font-semibold">Perfil privado</h2><p className="mt-1 text-sm text-muted-foreground">Só quem aprovar pode ver a sua biografia, seguidores e actividade. Os seus seguidores actuais mantêm o acesso. Ao tornar o perfil público, os pedidos pendentes são aceites automaticamente.</p></div>
        <Switch checked={user.isPrivate} onCheckedChange={(v) => privacy.mutate(v)} disabled={privacy.isPending} label="Perfil privado" />
      </CardContent></Card>

      <Card><CardHeader><CardTitle>Pedidos para o seguir{incoming.data?.meta.total ? ` (${incoming.data.meta.total})` : ''}</CardTitle><CardDescription>Pessoas que pediram para seguir o seu perfil.</CardDescription></CardHeader><CardContent>
        {incoming.isLoading ? <div className="h-16 animate-pulse rounded-lg bg-muted" /> : !incoming.data?.data.length ? <EmptyState className="border-0 py-8" title="Sem pedidos pendentes" /> : (
          <ul className="divide-y">{incoming.data.data.map((r) => (
            <li key={r.userId} className="flex items-center gap-3 py-3">
              <Link href={`/utilizadores/${r.username}`} className="flex min-w-0 flex-1 items-center gap-3 hover:opacity-80"><Avatar src={r.avatarUrl} name={r.name} size={40} /><span className="min-w-0"><span className="block truncate text-sm font-semibold">{r.name}</span><span className="block truncate text-xs text-muted-foreground">@{r.username} · {timeAgo(r.requestedAt)}</span></span></Link>
              <Button size="sm" onClick={() => decide.mutate({ id: r.userId, accept: true })} disabled={decide.isPending}><Check />Aceitar</Button>
              <Button size="icon-sm" variant="outline" aria-label={`Recusar ${r.name}`} onClick={() => decide.mutate({ id: r.userId, accept: false })} disabled={decide.isPending}><X /></Button>
            </li>))}</ul>)}
      </CardContent></Card>

      {!!sent.data?.data.length && (
        <Card><CardHeader><CardTitle>Pedidos enviados</CardTitle><CardDescription>A aguardar resposta.</CardDescription></CardHeader><CardContent>
          <ul className="divide-y">{sent.data.data.map((r) => (
            <li key={r.userId} className="flex items-center gap-3 py-3"><Avatar src={r.avatarUrl} name={r.name} size={36} /><Link href={`/utilizadores/${r.username}`} className="min-w-0 flex-1 truncate text-sm font-medium hover:underline">{r.name}</Link><Button size="sm" variant="ghost" onClick={() => cancel.mutate(r.userId)}>Cancelar</Button></li>))}</ul>
        </CardContent></Card>
      )}
    </div>
  );
}

function SecurityTab() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const all = useMutation({
    mutationFn: () => api.post('/auth/logout-all'),
    onSuccess: async () => { toast.success('Todas as sessões foram terminadas'); await logout(); router.push('/entrar'); },
    onError: (e) => toast.error(e instanceof ApiError ? e.message : 'Não foi possível concluir.'),
  });
  return (
    <div className="grid max-w-2xl gap-6">
      <Card><CardHeader><CardTitle>Conta</CardTitle></CardHeader><CardContent className="grid gap-1 text-sm"><p><span className="text-muted-foreground">Email:</span> {user?.email}</p><p><span className="text-muted-foreground">Utilizador:</span> @{user?.username}</p></CardContent></Card>
      <Card><CardContent className="flex flex-wrap items-center justify-between gap-4 p-6">
        <div><h2 className="font-semibold">Terminar todas as sessões</h2><p className="mt-1 text-sm text-muted-foreground">Sai de todos os dispositivos, incluindo este. Útil se perdeu um aparelho.</p></div>
        <Button variant="destructive" loading={all.isPending} onClick={() => all.mutate()}><LogOut />Terminar sessões</Button>
      </CardContent></Card>
      <p className="text-sm text-muted-foreground">Para alterar a palavra-passe, <Link href="/recuperar" className="font-medium text-primary hover:underline">peça uma ligação de redefinição</Link>.</p>
    </div>
  );
}
