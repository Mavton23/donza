'use client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import * as React from 'react';
import { Plus, Search, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { EmptyState } from '@/components/ui/empty-state';
import { Field } from '@/components/ui/field';
import { Input, Textarea } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { TagInput } from '@/components/ui/tag-input';
import { ApiError, api } from '@/lib/api/client';
import type { Community, CommunityInvite, CommunityMemberRow, CommunityPermissions, CommunityRole, PersonCard } from '@/lib/api/types';
import { useAuth } from '@/lib/auth/auth-provider';
import { formatDate } from '@/lib/utils';

const msg = (e: unknown) => (e instanceof ApiError ? e.message : 'Sem ligação ao servidor.');
const BASE_ROLE = { admin: 'Administrador', moderator: 'Moderador', member: 'Membro' } as const;
const PERM_LABEL: Record<keyof CommunityPermissions, string> = { managePosts: 'Moderar tópicos', manageEvents: 'Gerir eventos', inviteMembers: 'Convidar e aprovar membros', removeMembers: 'Remover membros', editCommunity: 'Editar a comunidade' };
const Pager = ({ page, total, onPage }: { page: number; total: number; onPage: (p: number) => void }) => total <= 1 ? null : <div className="mt-4 flex items-center justify-center gap-2"><Button variant="outline" size="sm" disabled={page <= 1} onClick={() => onPage(page - 1)}>Anterior</Button><span className="text-sm text-muted-foreground">{page} / {total}</span><Button variant="outline" size="sm" disabled={page >= total} onClick={() => onPage(page + 1)}>Seguinte</Button></div>;

/** Lista de membros (todos os membros vêem; quem gere tem controlos). */
export function MembersPanel({ community, canManage }: { community: Community; canManage: boolean }) {
  const { user } = useAuth(); const qc = useQueryClient(); const id = community.communityId;
  const isAdmin = user?.role === 'admin' || community.viewer.role === 'admin';
  const [q, setQ] = React.useState(''); const [term, setTerm] = React.useState(''); const [page, setPage] = React.useState(1);
  React.useEffect(() => { const t = setTimeout(() => { setTerm(q.trim()); setPage(1); }, 300); return () => clearTimeout(t); }, [q]);
  const list = useQuery({ queryKey: ['community-members', id, term, page], queryFn: () => api.page<CommunityMemberRow>(`/communities/${id}/members`, { limit: 20, page, search: term || undefined }) });
  const roles = useQuery({ queryKey: ['community-roles', id], enabled: canManage, queryFn: () => api.get<CommunityRole[]>(`/communities/${id}/roles`) });
  const refresh = () => { qc.invalidateQueries({ queryKey: ['community-members', id] }); qc.invalidateQueries({ queryKey: ['community', community.slug] }); };
  const upd = useMutation({ mutationFn: (v: { uid: string; role?: string; status?: string }) => api.patch(`/communities/${id}/members/${v.uid}`, { role: v.role, status: v.status }), onSuccess: () => { toast.success('Membro actualizado'); refresh(); }, onError: (e) => toast.error(msg(e)) });
  const [remove, setRemove] = React.useState<CommunityMemberRow | null>(null); const [ban, setBan] = React.useState<CommunityMemberRow | null>(null); const [assign, setAssign] = React.useState<CommunityMemberRow | null>(null);
  const rm = useMutation({ mutationFn: (uid: string) => api.del(`/communities/${id}/members/${uid}`), onSuccess: () => { toast.success('Membro removido'); setRemove(null); refresh(); }, onError: (e) => { setRemove(null); toast.error(msg(e)); } });
  const doBan = useMutation({ mutationFn: (uid: string) => api.patch(`/communities/${id}/members/${uid}`, { status: 'banned' }), onSuccess: () => { toast.success('Membro banido'); setBan(null); refresh(); }, onError: (e) => { setBan(null); toast.error(msg(e)); } });
  return (
    <div>
      <div className="relative max-w-sm"><Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input className="pl-9" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Pesquisar membros" aria-label="Pesquisar membros" /></div>
      <ul className="mt-4 grid gap-2">
        {list.isLoading ? <Skeleton className="h-20 rounded-2xl" /> : !list.data?.data.length ? <EmptyState title="Sem membros" description="Nenhum resultado." /> : list.data.data.map((m) => { const self = m.userId === user?.userId; return (
          <li key={m.userId} className="flex flex-wrap items-center gap-3 rounded-2xl border bg-card p-3">
            <Avatar src={m.avatarUrl} name={m.fullName ?? m.username} size={36} />
            <div className="min-w-0 flex-1"><p className="truncate font-medium">{m.fullName ?? m.username} <span className="font-normal text-muted-foreground">@{m.username}</span></p>
              <p className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground"><span>Desde {formatDate(m.joinedAt)}</span>{m.role !== 'member' && <Badge variant="secondary">{BASE_ROLE[m.role]}</Badge>}{m.status === 'muted' && <Badge variant="warning">Silenciado</Badge>}{m.roles.map((r) => <Badge key={r.roleId} variant="outline">{r.name}</Badge>)}</p></div>
            {canManage && !self && (
              <div className="flex flex-wrap items-center gap-1">
                {isAdmin && <Select value={m.role} onValueChange={(v) => upd.mutate({ uid: m.userId, role: v })}><SelectTrigger className="h-8 w-36 text-xs" aria-label={`Papel de ${m.username}`}><SelectValue /></SelectTrigger><SelectContent>{Object.entries(BASE_ROLE).map(([k, l]) => <SelectItem key={k} value={k}>{l}</SelectItem>)}</SelectContent></Select>}
                {!!roles.data?.length && <Button size="sm" variant="ghost" onClick={() => setAssign(m)}>Papéis</Button>}
                <Button size="sm" variant="outline" loading={upd.isPending && upd.variables?.uid === m.userId && upd.variables.status !== undefined} onClick={() => upd.mutate({ uid: m.userId, status: m.status === 'muted' ? 'active' : 'muted' })}>{m.status === 'muted' ? 'Reactivar' : 'Silenciar'}</Button>
                <Button size="sm" variant="ghost" onClick={() => setBan(m)}>Banir</Button>
                <Button size="sm" variant="ghost" aria-label={`Remover ${m.username}`} onClick={() => setRemove(m)}><Trash2 /></Button>
              </div>)}
          </li>); })}
      </ul>
      <Pager page={page} total={list.data?.meta.totalPages ?? 1} onPage={setPage} />
      <ConfirmDialog open={!!remove} onOpenChange={(o) => !o && setRemove(null)} title="Remover membro?" description={`@${remove?.username} deixa de fazer parte da comunidade, mas pode voltar a pedir para entrar.`} confirmLabel="Remover" destructive pending={rm.isPending} onConfirm={() => remove && rm.mutate(remove.userId)} />
      <ConfirmDialog open={!!ban} onOpenChange={(o) => !o && setBan(null)} title="Banir membro?" description={`@${ban?.username} é removido e não pode voltar a entrar.`} confirmLabel="Banir" destructive pending={doBan.isPending} onConfirm={() => ban && doBan.mutate(ban.userId)} />
      {assign && <AssignRoles communityId={id} member={assign} roles={roles.data ?? []} onClose={() => setAssign(null)} onDone={refresh} />}
    </div>
  );
}

function AssignRoles({ communityId, member, roles, onClose, onDone }: { communityId: string; member: CommunityMemberRow; roles: CommunityRole[]; onClose: () => void; onDone: () => void }) {
  const [sel, setSel] = React.useState<string[]>(member.roles.map((r) => r.roleId));
  const save = useMutation({ mutationFn: () => api.put(`/communities/${communityId}/members/${member.userId}/roles`, { roleIds: sel }), onSuccess: () => { toast.success('Papéis actualizados'); onDone(); onClose(); }, onError: (e) => toast.error(msg(e)) });
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}><DialogContent className="max-w-sm">
      <DialogHeader><DialogTitle>Papéis de @{member.username}</DialogTitle><DialogDescription>Cada papel concede permissões específicas.</DialogDescription></DialogHeader>
      <ul className="grid gap-2">{roles.map((r) => <li key={r.roleId} className="flex items-center gap-2"><Checkbox id={`ar-${r.roleId}`} checked={sel.includes(r.roleId)} onCheckedChange={(v) => setSel(v === true ? [...sel, r.roleId] : sel.filter((x) => x !== r.roleId))} /><Label htmlFor={`ar-${r.roleId}`}>{r.name}</Label></li>)}</ul>
      <DialogFooter><Button variant="ghost" onClick={onClose}>Cancelar</Button><Button loading={save.isPending} onClick={() => save.mutate()}>Guardar</Button></DialogFooter>
    </DialogContent></Dialog>
  );
}

export function RequestsPanel({ community }: { community: Community }) {
  const qc = useQueryClient(); const id = community.communityId; const [page, setPage] = React.useState(1);
  const list = useQuery({ queryKey: ['community-requests', id, page], queryFn: () => api.page<PersonCard & { requestedAt: string; fullName?: string | null }>(`/communities/${id}/requests`, { limit: 20, page }) });
  const refresh = () => { qc.invalidateQueries({ queryKey: ['community-requests', id] }); qc.invalidateQueries({ queryKey: ['community-members', id] }); qc.invalidateQueries({ queryKey: ['community', community.slug] }); };
  const act = useMutation({ mutationFn: (v: { uid: string; approve: boolean }) => api.post(`/communities/${id}/requests/${v.uid}/${v.approve ? 'approve' : 'reject'}`, {}), onSuccess: (_, v) => { toast.success(v.approve ? 'Pedido aceite' : 'Pedido recusado'); refresh(); }, onError: (e) => toast.error(msg(e)) });
  return (
    <div>
      {list.isLoading ? <Skeleton className="h-20 rounded-2xl" /> : !list.data?.data.length ? <EmptyState title="Sem pedidos pendentes" description="Os pedidos de entrada aparecem aqui." /> : (
        <ul className="grid gap-2">{list.data.data.map((r) => { const u = r as unknown as { userId: string; username: string; fullName: string | null; avatarUrl: string | null; requestedAt: string }; return (
          <li key={u.userId} className="flex flex-wrap items-center gap-3 rounded-2xl border bg-card p-3"><Avatar src={u.avatarUrl} name={u.fullName ?? u.username} size={36} /><div className="min-w-0 flex-1"><p className="font-medium">{u.fullName ?? u.username} <span className="font-normal text-muted-foreground">@{u.username}</span></p><p className="text-xs text-muted-foreground">Pediu {formatDate(u.requestedAt)}</p></div>
            <Button size="sm" variant="outline" disabled={act.isPending} onClick={() => act.mutate({ uid: u.userId, approve: false })}>Recusar</Button><Button size="sm" loading={act.isPending && act.variables?.uid === u.userId && act.variables.approve} onClick={() => act.mutate({ uid: u.userId, approve: true })}>Aceitar</Button></li>); })}</ul>)}
      <Pager page={page} total={list.data?.meta.totalPages ?? 1} onPage={setPage} />
    </div>
  );
}

export function InvitesPanel({ community }: { community: Community }) {
  const qc = useQueryClient(); const id = community.communityId; const [email, setEmail] = React.useState(''); const [err, setErr] = React.useState('');
  const list = useQuery({ queryKey: ['community-invites', id], queryFn: () => api.page<CommunityInvite>(`/communities/${id}/invites`, { limit: 50 }) });
  const send = useMutation({ mutationFn: () => api.post(`/communities/${id}/invites`, { email: email.trim() }), onSuccess: () => { toast.success('Convite enviado'); setEmail(''); qc.invalidateQueries({ queryKey: ['community-invites', id] }); }, onError: (e) => { if (e instanceof ApiError && e.fieldErrors.email) setErr(e.fieldErrors.email); else toast.error(msg(e)); } });
  const revoke = useMutation({ mutationFn: (inv: string) => api.del(`/communities/${id}/invites/${inv}`), onSuccess: () => { toast.success('Convite revogado'); qc.invalidateQueries({ queryKey: ['community-invites', id] }); }, onError: (e) => toast.error(msg(e)) });
  return (
    <div>
      <form noValidate onSubmit={(e) => { e.preventDefault(); if (!/^\S+@\S+\.\S+$/.test(email.trim())) { setErr('Indique um email válido'); return; } setErr(''); send.mutate(); }} className="flex max-w-lg items-start gap-2">
        <div className="flex-1"><Input type="email" value={email} onChange={(e) => { setEmail(e.target.value); setErr(''); }} placeholder="email@exemplo.com" aria-label="Email a convidar" aria-invalid={!!err} />{err && <p role="alert" className="mt-1 text-xs text-destructive">{err}</p>}</div>
        <Button type="submit" loading={send.isPending}>Convidar</Button>
      </form>
      <ul className="mt-4 grid gap-2">{list.isLoading ? <Skeleton className="h-16 rounded-2xl" /> : !list.data?.data.length ? <p className="text-sm text-muted-foreground">Sem convites pendentes.</p> : list.data.data.map((i) => <li key={i.inviteId} className="flex items-center gap-3 rounded-2xl border bg-card p-3 text-sm"><div className="min-w-0 flex-1"><p className="truncate font-medium">{i.email}</p><p className="text-xs text-muted-foreground">Por @{i.inviter.username} · expira {formatDate(i.expiresAt)}</p></div><Button size="sm" variant="ghost" onClick={() => revoke.mutate(i.inviteId)}>Revogar</Button></li>)}</ul>
    </div>
  );
}

export function RolesPanel({ community }: { community: Community }) {
  const qc = useQueryClient(); const id = community.communityId;
  const list = useQuery({ queryKey: ['community-roles', id], queryFn: () => api.get<CommunityRole[]>(`/communities/${id}/roles`) });
  const [edit, setEdit] = React.useState<CommunityRole | 'new' | null>(null); const [del, setDel] = React.useState<CommunityRole | null>(null);
  const rm = useMutation({ mutationFn: (rid: string) => api.del(`/communities/${id}/roles/${rid}`), onSuccess: () => { toast.success('Papel eliminado'); setDel(null); qc.invalidateQueries({ queryKey: ['community-roles', id] }); qc.invalidateQueries({ queryKey: ['community-members', id] }); }, onError: (e) => { setDel(null); toast.error(msg(e)); } });
  return (
    <div>
      <Button onClick={() => setEdit('new')}><Plus /> Novo papel</Button>
      <ul className="mt-4 grid gap-2">{list.isLoading ? <Skeleton className="h-16 rounded-2xl" /> : !list.data?.length ? <p className="text-sm text-muted-foreground">Sem papéis personalizados. Crie, por exemplo, «Curador de recursos» com permissão de moderar tópicos.</p> : list.data.map((r) => (
        <li key={r.roleId} className="flex flex-wrap items-center gap-3 rounded-2xl border bg-card p-3"><div className="min-w-0 flex-1"><p className="font-medium">{r.name} <span className="text-xs font-normal text-muted-foreground">· {r.membersCount} membro{r.membersCount === 1 ? '' : 's'}</span></p><p className="mt-1 flex flex-wrap gap-1">{(Object.keys(PERM_LABEL) as (keyof CommunityPermissions)[]).filter((k) => r.permissions?.[k]).map((k) => <Badge key={k} variant="secondary">{PERM_LABEL[k]}</Badge>)}</p></div>
          <Button size="sm" variant="outline" onClick={() => setEdit(r)}>Editar</Button><Button size="sm" variant="ghost" onClick={() => setDel(r)}>Eliminar</Button></li>))}</ul>
      <RoleDialog communityId={id} target={edit} onClose={() => setEdit(null)} onDone={() => qc.invalidateQueries({ queryKey: ['community-roles', id] })} />
      <ConfirmDialog open={!!del} onOpenChange={(o) => !o && setDel(null)} title="Eliminar papel?" description={`«${del?.name}» é retirado a quem o tem.`} confirmLabel="Eliminar" destructive pending={rm.isPending} onConfirm={() => del && rm.mutate(del.roleId)} />
    </div>
  );
}

function RoleDialog({ communityId, target, onClose, onDone }: { communityId: string; target: CommunityRole | 'new' | null; onClose: () => void; onDone: () => void }) {
  const cur = target && target !== 'new' ? target : null; const [name, setName] = React.useState(''); const [perms, setPerms] = React.useState<CommunityPermissions>({}); const [err, setErr] = React.useState('');
  React.useEffect(() => { if (target) { setErr(''); setName(cur?.name ?? ''); setPerms(cur?.permissions ?? {}); } }, [target]); // eslint-disable-line react-hooks/exhaustive-deps
  const save = useMutation({
    mutationFn: () => { const body = { name: name.trim(), permissions: perms }; return cur ? api.patch(`/communities/${communityId}/roles/${cur.roleId}`, body) : api.post(`/communities/${communityId}/roles`, body); },
    onSuccess: () => { toast.success(cur ? 'Papel guardado' : 'Papel criado'); onDone(); onClose(); }, onError: (e) => { if (e instanceof ApiError && e.fieldErrors.name) setErr(e.fieldErrors.name); else toast.error(msg(e)); },
  });
  return (
    <Dialog open={!!target} onOpenChange={(o) => !o && onClose()}><DialogContent className="max-w-md">
      <form noValidate className="grid gap-4" onSubmit={(e) => { e.preventDefault(); if (!name.trim()) { setErr('Dê um nome ao papel'); return; } save.mutate(); }}>
        <DialogHeader><DialogTitle>{cur ? 'Editar papel' : 'Novo papel'}</DialogTitle></DialogHeader>
        <Field label="Nome" htmlFor="rl-name" error={err}><Input id="rl-name" maxLength={40} value={name} onChange={(e) => { setName(e.target.value); setErr(''); }} aria-invalid={!!err} /></Field>
        <fieldset className="grid gap-2"><legend className="mb-1 text-sm font-medium">Permissões</legend>{(Object.keys(PERM_LABEL) as (keyof CommunityPermissions)[]).map((k) => <div key={k} className="flex items-center gap-2"><Checkbox id={`pm-${k}`} checked={!!perms[k]} onCheckedChange={(v) => setPerms({ ...perms, [k]: v === true })} /><Label htmlFor={`pm-${k}`}>{PERM_LABEL[k]}</Label></div>)}</fieldset>
        <DialogFooter><Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button><Button type="submit" loading={save.isPending}>Guardar</Button></DialogFooter>
      </form>
    </DialogContent></Dialog>
  );
}

export function SettingsPanel({ community }: { community: Community }) {
  const qc = useQueryClient(); const router = useRouter(); const c = community;
  const [name, setName] = React.useState(c.name); const [short, setShort] = React.useState(c.shortDescription ?? ''); const [desc, setDesc] = React.useState(c.description ?? '');
  const [isPublic, setPublic] = React.useState(c.isPublic); const [type, setType] = React.useState<string>(c.membershipType); const [tags, setTags] = React.useState<string[]>(c.tags); const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [delOpen, setDelOpen] = React.useState(false); const [archiveOpen, setArchiveOpen] = React.useState(false);
  const save = useMutation({
    mutationFn: (extra?: { status: 'active' | 'archived' }) => {
      if (name.trim().length < 3) { setErrors({ name: 'Mínimo de 3 caracteres' }); throw new Error('v'); }
      const f = new FormData(); f.set('name', name.trim()); f.set('shortDescription', short.trim()); f.set('description', desc.trim()); f.set('isPublic', String(isPublic)); f.set('membershipType', type); f.set('tags', JSON.stringify(tags)); if (extra) f.set('status', extra.status);
      return api.upload<{ slug: string }>(`/communities/${c.communityId}`, f, 'PATCH');
    },
    onSuccess: (r) => { toast.success('Alterações guardadas'); qc.invalidateQueries({ queryKey: ['community'] }); qc.invalidateQueries({ queryKey: ['communities'] }); setArchiveOpen(false); if (r?.slug && r.slug !== c.slug) router.replace(`/comunidades/${r.slug}`); },
    onError: (e) => { if (e instanceof ApiError) { if (Object.keys(e.fieldErrors).length) setErrors(e.fieldErrors); else toast.error(e.message); } },
  });
  const del = useMutation({ mutationFn: () => api.del(`/communities/${c.communityId}`), onSuccess: () => { toast.success('Comunidade eliminada'); qc.invalidateQueries({ queryKey: ['communities'] }); router.replace('/comunidades'); }, onError: (e) => { setDelOpen(false); toast.error(msg(e)); } });
  return (
    <div className="grid max-w-2xl gap-6">
      <form noValidate className="grid gap-5 rounded-2xl border bg-card p-6" onSubmit={(e) => { e.preventDefault(); setErrors({}); save.mutate(undefined); }}>
        <Field label="Nome" htmlFor="cs-name" error={errors.name}><Input id="cs-name" value={name} onChange={(e) => setName(e.target.value)} /></Field>
        <Field label="Resumo" htmlFor="cs-short" error={errors.shortDescription}><Input id="cs-short" maxLength={100} value={short} onChange={(e) => setShort(e.target.value)} /></Field>
        <Field label="Descrição" htmlFor="cs-desc" error={errors.description}><Textarea id="cs-desc" rows={5} value={desc} onChange={(e) => setDesc(e.target.value)} /></Field>
        <div className="grid gap-1.5"><Label>Tags</Label><TagInput label="Tag" value={tags} onChange={setTags} max={10} placeholder="Escreva e prima Enter" /></div>
        <Field label="Entrada de novos membros"><Select value={type} onValueChange={setType}><SelectTrigger aria-label="Tipo de adesão"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="open">Aberta</SelectItem><SelectItem value="approval">Com aprovação</SelectItem><SelectItem value="invite_only">Só por convite</SelectItem></SelectContent></Select></Field>
        <div className="flex items-center gap-3 rounded-xl bg-muted/50 p-3.5"><Checkbox id="cs-pub" checked={isPublic} onCheckedChange={(v) => setPublic(v === true)} /><Label htmlFor="cs-pub">Comunidade pública</Label></div>
        <div><Button type="submit" loading={save.isPending && !save.variables}>Guardar alterações</Button></div>
      </form>
      <section aria-labelledby="danger-h" className="rounded-2xl border border-destructive/30 p-6"><h3 id="danger-h" className="font-semibold">Zona de risco</h3>
        <div className="mt-3 flex flex-wrap gap-2"><Button variant="outline" onClick={() => setArchiveOpen(true)}>{c.status === 'archived' ? 'Reactivar comunidade' : 'Arquivar comunidade'}</Button><Button variant="destructive" onClick={() => setDelOpen(true)}>Eliminar comunidade</Button></div></section>
      <ConfirmDialog open={archiveOpen} onOpenChange={setArchiveOpen} title={c.status === 'archived' ? 'Reactivar comunidade?' : 'Arquivar comunidade?'} description={c.status === 'archived' ? 'Volta a ficar activa para todos.' : 'Deixa de aceitar novas publicações; pode reactivá-la depois.'} confirmLabel={c.status === 'archived' ? 'Reactivar' : 'Arquivar'} pending={save.isPending && !!save.variables} onConfirm={() => save.mutate({ status: c.status === 'archived' ? 'active' : 'archived' })} />
      <ConfirmDialog open={delOpen} onOpenChange={setDelOpen} title="Eliminar comunidade?" description="Os tópicos, comentários e membros são apagados. Não pode ser desfeito." confirmLabel="Eliminar" destructive pending={del.isPending} onConfirm={() => del.mutate()} />
    </div>
  );
}
