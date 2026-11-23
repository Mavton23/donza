'use client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import * as React from 'react';
import { Award, Copy, RefreshCw, Search, Trash2, UserPlus } from 'lucide-react';
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
import type { GroupInviteRow, GroupJoinRequest, GroupMemberRow, PersonCard, StudyGroup } from '@/lib/api/types';
import { AchievementsDialog } from '@/components/groups/reports';
import { formatDate } from '@/lib/utils';

export const msg = (e: unknown) => (e instanceof ApiError ? e.message : 'Sem ligação ao servidor.');
export const ROLE: Record<string, string> = { leader: 'Líder', 'co-leader': 'Co-líder', moderator: 'Moderador', member: 'Membro' };
export const Pager = ({ page, total, onPage }: { page: number; total: number; onPage: (p: number) => void }) => total <= 1 ? null : (
  <div className="mt-4 flex items-center justify-center gap-2"><Button variant="outline" size="sm" disabled={page <= 1} onClick={() => onPage(page - 1)}>Anterior</Button><span className="text-sm text-muted-foreground">{page} / {total}</span><Button variant="outline" size="sm" disabled={page >= total} onClick={() => onPage(page + 1)}>Seguinte</Button></div>);

type ActionKind = 'warn' | 'mute' | 'ban' | 'unmute' | 'unban';
const ACTION_TEXT: Record<ActionKind, { title: string; button: string; reasonRequired: boolean; destructive?: boolean }> = {
  warn: { title: 'Avisar membro', button: 'Enviar aviso', reasonRequired: true },
  mute: { title: 'Silenciar membro', button: 'Silenciar', reasonRequired: true },
  ban: { title: 'Banir membro', button: 'Banir', reasonRequired: true, destructive: true },
  unmute: { title: 'Levantar silenciamento', button: 'Levantar', reasonRequired: false },
  unban: { title: 'Levantar banimento', button: 'Levantar', reasonRequired: false },
};

/** Diálogo único para avisar / silenciar / banir / levantar — regista sempre uma acção de moderação. */
function ActionDialog({ groupId, member, kind, isLeaderOrCo, onClose, onDone }: { groupId: string; member: GroupMemberRow; kind: ActionKind; isLeaderOrCo: boolean; onClose: () => void; onDone: () => void }) {
  const t = ACTION_TEXT[kind]; const [reason, setReason] = React.useState(''); const [minutes, setMinutes] = React.useState(isLeaderOrCo ? '1440' : '60'); const [errors, setErrors] = React.useState<Record<string, string>>({});
  const max = isLeaderOrCo ? 43200 : 1440;
  const run = useMutation({
    mutationFn: () => {
      const e: Record<string, string> = {};
      if (t.reasonRequired && reason.trim().length < 3) e.reason = 'Indique o motivo (mín. 3 caracteres)';
      if (kind === 'mute' && (!/^\d+$/.test(minutes) || +minutes < 1 || +minutes > max)) e.minutes = `Entre 1 e ${max} minutos`;
      if (Object.keys(e).length) { setErrors(e); throw new Error('v'); }
      return api.post(`/study-groups/${groupId}/moderation/${kind}`, { userId: member.userId, ...(reason.trim() && { reason: reason.trim() }), ...(kind === 'mute' && { minutes: +minutes }) });
    },
    onSuccess: () => { toast.success('Acção registada'); onDone(); onClose(); },
    onError: (e) => { if (e instanceof ApiError) { if (Object.keys(e.fieldErrors).length) setErrors(e.fieldErrors); else toast.error(e.message); } },
  });
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}><DialogContent className="max-w-md">
      <DialogHeader><DialogTitle>{t.title}</DialogTitle><DialogDescription>@{member.username}. A acção fica no registo de moderação e o membro é notificado.</DialogDescription></DialogHeader>
      <form className="grid gap-4" noValidate onSubmit={(e) => { e.preventDefault(); run.mutate(); }}>
        {kind === 'mute' && <Field label="Duração (minutos)" htmlFor="a-min" error={errors.minutes} hint={isLeaderOrCo ? 'Até 30 dias (43 200 min).' : 'Moderadores: até 24 h (1 440 min).'}><Input id="a-min" inputMode="numeric" value={minutes} onChange={(e) => setMinutes(e.target.value)} /></Field>}
        <Field label={t.reasonRequired ? 'Motivo' : 'Motivo (opcional)'} htmlFor="a-reason" error={errors.reason}><Textarea id="a-reason" rows={3} maxLength={500} value={reason} onChange={(e) => { setReason(e.target.value); setErrors({}); }} /></Field>
        <DialogFooter><Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button><Button type="submit" variant={t.destructive ? 'destructive' : 'default'} loading={run.isPending}>{t.button}</Button></DialogFooter>
      </form>
    </DialogContent></Dialog>
  );
}

/** Lista de membros; quem modera vê os controlos (banidos incluídos, para os poder repor). */
export function MembersPanel({ group, selfId }: { group: StudyGroup; selfId: string }) {
  const qc = useQueryClient(); const router = useRouter(); const id = group.groupId; const v = group.viewer;
  const canModerate = !!v?.canModerate || !!v?.canManage; const canManage = !!v?.canManage; const isLeader = v?.role === 'leader' || !!v?.isCreator;
  const [q, setQ] = React.useState(''); const [term, setTerm] = React.useState(''); const [page, setPage] = React.useState(1);
  React.useEffect(() => { const t = setTimeout(() => { setTerm(q.trim()); setPage(1); }, 300); return () => clearTimeout(t); }, [q]);
  const list = useQuery({ queryKey: ['group-members-admin', id, term, page], queryFn: () => api.page<GroupMemberRow>(`/study-groups/${id}/members`, { limit: 20, page, search: term || undefined }) });
  const refresh = () => { qc.invalidateQueries({ queryKey: ['group-members-admin', id] }); qc.invalidateQueries({ queryKey: ['group-members', id] }); qc.invalidateQueries({ queryKey: ['group', id] }); qc.invalidateQueries({ queryKey: ['group-mod', id] }); };
  const setRole = useMutation({ mutationFn: (a: { uid: string; role: string }) => api.patch(`/study-groups/${id}/members/${a.uid}`, { role: a.role }), onSuccess: () => { toast.success('Papel actualizado'); refresh(); }, onError: (e) => toast.error(msg(e)) });
  const [act, setAct] = React.useState<{ m: GroupMemberRow; kind: ActionKind } | null>(null);
  const [ach, setAch] = React.useState<string | null>(null);
  const [remove, setRemove] = React.useState<GroupMemberRow | null>(null); const [lead, setLead] = React.useState<GroupMemberRow | null>(null);
  const rm = useMutation({ mutationFn: (uid: string) => api.del(`/study-groups/${id}/members/${uid}`), onSuccess: () => { toast.success('Membro removido'); setRemove(null); refresh(); }, onError: (e) => { setRemove(null); toast.error(msg(e)); } });
  const transfer = useMutation({ mutationFn: (uid: string) => api.post(`/study-groups/${id}/transfer-leadership`, { userId: uid }), onSuccess: () => { toast.success('Liderança transferida'); setLead(null); refresh(); router.refresh(); }, onError: (e) => { setLead(null); toast.error(msg(e)); } });
  return (
    <div>
      <div className="relative max-w-sm"><Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input className="pl-9" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Pesquisar membros" aria-label="Pesquisar membros" /></div>
      <ul className="mt-4 grid gap-2">
        {list.isLoading ? <Skeleton className="h-20 rounded-2xl" /> : !list.data?.data.length ? <EmptyState title="Sem membros" description="Nenhum resultado." /> : list.data.data.map((m) => {
          const self = m.userId === selfId; const isL = m.role === 'leader'; const muted = m.status === 'muted'; const banned = m.status === 'banned';
          return (
            <li key={m.userId} className="flex flex-wrap items-center gap-3 rounded-2xl border bg-card p-3">
              <Avatar src={m.avatarUrl} name={m.username} size={36} />
              <div className="min-w-0 flex-1"><Link href={`/utilizadores/${m.username}`} className="truncate font-medium hover:underline">@{m.username}</Link>
                <p className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground"><span>Desde {formatDate(m.joinedAt)}</span><span>{m.contributionScore} pts</span>{m.role !== 'member' && <Badge variant="secondary">{ROLE[m.role]}</Badge>}{muted && <Badge variant="outline">Silenciado{m.mutedUntil ? ` até ${formatDate(m.mutedUntil)}` : ''}</Badge>}{banned && <Badge variant="destructive">Banido</Badge>}</p></div>
              <Button size="sm" variant="ghost" aria-label={`Conquistas de ${m.username}`} onClick={() => setAch(m.membershipId)}><Award /></Button>
              {canModerate && !self && !isL && (
                <div className="flex flex-wrap items-center gap-1">
                  {canManage && !banned && <Select value={m.role} onValueChange={(r) => setRole.mutate({ uid: m.userId, role: r })}><SelectTrigger className="h-8 w-32 text-xs" aria-label={`Papel de ${m.username}`}><SelectValue /></SelectTrigger><SelectContent><SelectItem value="member">Membro</SelectItem><SelectItem value="moderator">Moderador</SelectItem><SelectItem value="co-leader">Co-líder</SelectItem></SelectContent></Select>}
                  {!banned && <Button size="sm" variant="ghost" onClick={() => setAct({ m, kind: 'warn' })}>Avisar</Button>}
                  {!banned && (muted ? <Button size="sm" variant="outline" onClick={() => setAct({ m, kind: 'unmute' })}>Reactivar</Button> : <Button size="sm" variant="outline" onClick={() => setAct({ m, kind: 'mute' })}>Silenciar</Button>)}
                  {banned ? <Button size="sm" variant="outline" onClick={() => setAct({ m, kind: 'unban' })}>Desbanir</Button> : <Button size="sm" variant="ghost" onClick={() => setAct({ m, kind: 'ban' })}>Banir</Button>}
                  {isLeader && !banned && <Button size="sm" variant="ghost" onClick={() => setLead(m)}>Tornar líder</Button>}
                  {canManage && <Button size="sm" variant="ghost" aria-label={`Remover ${m.username}`} onClick={() => setRemove(m)}><Trash2 /></Button>}
                </div>)}
            </li>); })}
      </ul>
      <Pager page={page} total={list.data?.meta.totalPages ?? 1} onPage={setPage} />
      {ach && <AchievementsDialog groupId={id} membershipId={ach} onClose={() => setAch(null)} />}
      {act && <ActionDialog groupId={id} member={act.m} kind={act.kind} isLeaderOrCo={canManage} onClose={() => setAct(null)} onDone={refresh} />}
      <ConfirmDialog open={!!remove} onOpenChange={(o) => !o && setRemove(null)} title="Remover membro?" description={`@${remove?.username} deixa de pertencer ao grupo.`} confirmLabel="Remover" destructive pending={rm.isPending} onConfirm={() => remove && rm.mutate(remove.userId)} />
      <ConfirmDialog open={!!lead} onOpenChange={(o) => !o && setLead(null)} title="Transferir a liderança?" description={`@${lead?.username} passa a líder do grupo e você passa a co-líder.`} confirmLabel="Transferir" pending={transfer.isPending} onConfirm={() => lead && transfer.mutate(lead.userId)} />
    </div>
  );
}

export function RequestsPanel({ groupId }: { groupId: string }) {
  const qc = useQueryClient(); const [page, setPage] = React.useState(1);
  const list = useQuery({ queryKey: ['group-requests', groupId, page], queryFn: () => api.page<GroupJoinRequest>(`/study-groups/${groupId}/requests`, { limit: 10, page }) });
  const review = useMutation({
    mutationFn: (a: { id: string; approve: boolean }) => api.post(`/study-groups/${groupId}/requests/${a.id}/${a.approve ? 'approve' : 'reject'}`, {}),
    onSuccess: (_r, a) => { toast.success(a.approve ? 'Pedido aprovado' : 'Pedido rejeitado'); qc.invalidateQueries({ queryKey: ['group-requests', groupId] }); qc.invalidateQueries({ queryKey: ['group', groupId] }); qc.invalidateQueries({ queryKey: ['group-members-admin', groupId] }); qc.invalidateQueries({ queryKey: ['group-members', groupId] }); },
    onError: (e) => toast.error(msg(e)),
  });
  if (list.isLoading) return <Skeleton className="h-24 rounded-2xl" />;
  if (!list.data?.data.length) return <EmptyState title="Sem pedidos pendentes" description="Os novos pedidos de adesão aparecem aqui." />;
  return (
    <div><ul className="grid gap-2">{list.data.data.map((r) => (
      <li key={r.requestId} className="flex flex-wrap items-center gap-3 rounded-2xl border bg-card p-3">
        <Avatar src={r.avatarUrl} name={r.username} size={36} />
        <div className="min-w-0 flex-1"><p className="font-medium">@{r.username}</p>{r.message && <p className="whitespace-pre-wrap text-sm text-muted-foreground">{r.message}</p>}<p className="text-xs text-muted-foreground">{formatDate(r.requestedAt)}</p></div>
        <Button size="sm" loading={review.isPending && review.variables?.id === r.requestId && review.variables.approve} onClick={() => review.mutate({ id: r.requestId, approve: true })}>Aprovar</Button>
        <Button size="sm" variant="outline" loading={review.isPending && review.variables?.id === r.requestId && !review.variables.approve} onClick={() => review.mutate({ id: r.requestId, approve: false })}>Rejeitar</Button>
      </li>))}</ul><Pager page={page} total={list.data.meta.totalPages} onPage={setPage} /></div>
  );
}

export function InvitesPanel({ group }: { group: StudyGroup }) {
  const qc = useQueryClient(); const groupId = group.groupId; const [term, setTerm] = React.useState(''); const [debounced, setDebounced] = React.useState('');
  React.useEffect(() => { const t = setTimeout(() => setDebounced(term.trim()), 300); return () => clearTimeout(t); }, [term]);
  const found = useQuery({ queryKey: ['group-invite-search', debounced], enabled: debounced.length >= 2, queryFn: () => api.page<PersonCard>('/users/search', { q: debounced, limit: 6 }) });
  const list = useQuery({ queryKey: ['group-invites', groupId], queryFn: () => api.page<GroupInviteRow>(`/study-groups/${groupId}/invites`, { limit: 30 }) });
  const refresh = () => qc.invalidateQueries({ queryKey: ['group-invites', groupId] });
  const invite = useMutation({ mutationFn: (uid: string) => api.post(`/study-groups/${groupId}/invites`, { userIds: [uid] }), onSuccess: () => { toast.success('Convite enviado'); refresh(); }, onError: (e) => toast.error(msg(e)) });
  const revoke = useMutation({ mutationFn: (rid: string) => api.del(`/study-groups/${groupId}/invites/${rid}`), onSuccess: () => { toast.success('Convite revogado'); refresh(); }, onError: (e) => toast.error(msg(e)) });
  return (
    <div className="grid gap-6">
      <section className="rounded-2xl border bg-card p-5"><h3 className="mb-3 flex items-center gap-2 font-semibold"><UserPlus className="size-4" /> Convidar utilizadores</h3>
        <div className="relative max-w-sm"><Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input className="pl-9" value={term} onChange={(e) => setTerm(e.target.value)} placeholder="Nome ou @utilizador" aria-label="Pesquisar utilizadores a convidar" /></div>
        {debounced.length >= 2 && <ul className="mt-3 grid gap-2">{found.isLoading ? <Skeleton className="h-12" /> : !found.data?.data.length ? <li className="text-sm text-muted-foreground">Sem resultados.</li> : found.data.data.map((u) => (
          <li key={u.userId} className="flex items-center gap-3 rounded-xl border p-2.5"><Avatar src={u.avatarUrl} name={u.name} size={32} /><div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{u.name}</p><p className="text-xs text-muted-foreground">@{u.username}</p></div>
            <Button size="sm" aria-label={`Convidar ${u.username}`} loading={invite.isPending && invite.variables === u.userId} onClick={() => invite.mutate(u.userId)}>Convidar</Button></li>))}</ul>}
      </section>
      <section><h3 className="mb-3 font-semibold">Convites pendentes</h3>
        {list.isLoading ? <Skeleton className="h-16 rounded-2xl" /> : !list.data?.data.length ? <EmptyState title="Sem convites pendentes" /> : <ul className="grid gap-2">{list.data.data.map((i) => (
          <li key={i.requestId} className="flex items-center gap-3 rounded-2xl border bg-card p-3"><Avatar src={i.avatarUrl} name={i.username} size={32} /><div className="min-w-0 flex-1"><p className="font-medium">@{i.username}</p><p className="text-xs text-muted-foreground">{i.invitedBy ? `por @${i.invitedBy.username} · ` : ''}{formatDate(i.requestedAt)}</p></div>
            <Button size="sm" variant="ghost" loading={revoke.isPending && revoke.variables === i.requestId} onClick={() => revoke.mutate(i.requestId)}>Revogar</Button></li>))}</ul>}
      </section>
    </div>
  );
}

const PRIVACY_TEXT: Record<string, string> = { public: 'Pública', private: 'Privada (código ou pedido)', invite_only: 'Só por convite' };
const STATUS_TEXT: Record<string, string> = { active: 'Activo', paused: 'Em pausa', completed: 'Concluído', archived: 'Arquivado' };

export function SettingsPanel({ group }: { group: StudyGroup }) {
  const qc = useQueryClient(); const router = useRouter(); const id = group.groupId; const isLeader = group.viewer?.role === 'leader' || !!group.viewer?.isCreator;
  const [name, setName] = React.useState(group.name); const [desc, setDesc] = React.useState(group.description ?? ''); const [goals, setGoals] = React.useState(group.goals ?? '');
  const [max, setMax] = React.useState(String(group.maxMembers)); const [tags, setTags] = React.useState<string[]>(group.tags); const [privacy, setPrivacy] = React.useState<string>(group.privacy);
  const [approval, setApproval] = React.useState(group.approvalRequired); const [status, setStatus] = React.useState(group.status); const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [confirmDel, setConfirmDel] = React.useState(false); const [code, setCode] = React.useState(group.inviteCode ?? '');
  const refresh = () => { qc.invalidateQueries({ queryKey: ['group', id] }); qc.invalidateQueries({ queryKey: ['groups'] }); };
  const save = useMutation({
    mutationFn: () => {
      const e: Record<string, string> = {};
      if (name.trim().length < 3) e.name = 'Mínimo de 3 caracteres';
      if (!/^\d+$/.test(max) || +max < 2 || +max > 500) e.maxMembers = 'Entre 2 e 500';
      if (Object.keys(e).length) { setErrors(e); throw new Error('v'); }
      const f = new FormData(); f.set('name', name.trim()); f.set('description', desc.trim()); f.set('goals', goals.trim()); f.set('maxMembers', max); f.set('tags', JSON.stringify(tags));
      if (isLeader) { f.set('privacy', privacy); f.set('status', status); }
      f.set('approvalRequired', String(privacy === 'public' ? approval : true));
      return api.upload<{ inviteCode?: string }>(`/study-groups/${id}`, f, 'PATCH');
    },
    onSuccess: (r) => { setErrors({}); if (r?.inviteCode !== undefined) setCode(r.inviteCode ?? ''); toast.success('Definições guardadas'); refresh(); },
    onError: (e) => { if (e instanceof ApiError) { if (Object.keys(e.fieldErrors).length) setErrors(e.fieldErrors); else toast.error(e.message); } },
  });
  const regen = useMutation({ mutationFn: () => api.post<{ inviteCode: string }>(`/study-groups/${id}/invite-code/regenerate`, {}), onSuccess: (r) => { setCode(r.inviteCode); toast.success('Novo código gerado'); refresh(); }, onError: (e) => toast.error(msg(e)) });
  const del = useMutation({ mutationFn: () => api.del(`/study-groups/${id}`), onSuccess: () => { toast.success('Grupo eliminado'); qc.invalidateQueries({ queryKey: ['groups'] }); router.replace('/grupos'); }, onError: (e) => { setConfirmDel(false); toast.error(msg(e)); } });
  return (
    <div className="grid max-w-2xl gap-6">
      <form className="grid gap-5 rounded-2xl border bg-card p-6" noValidate onSubmit={(e) => { e.preventDefault(); save.mutate(); }}>
        <Field label="Nome" htmlFor="s-name" error={errors.name}><Input id="s-name" value={name} onChange={(e) => setName(e.target.value)} /></Field>
        <Field label="Descrição" htmlFor="s-desc" error={errors.description}><Textarea id="s-desc" rows={3} value={desc} onChange={(e) => setDesc(e.target.value)} /></Field>
        <Field label="Objectivos" htmlFor="s-goals" error={errors.goals}><Textarea id="s-goals" rows={3} value={goals} onChange={(e) => setGoals(e.target.value)} /></Field>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Máximo de membros" htmlFor="s-max" error={errors.maxMembers}><Input id="s-max" inputMode="numeric" value={max} onChange={(e) => setMax(e.target.value)} /></Field>
          {isLeader && <Field label="Estado"><Select value={status} onValueChange={setStatus}><SelectTrigger aria-label="Estado do grupo"><SelectValue /></SelectTrigger><SelectContent>{Object.entries(STATUS_TEXT).map(([k, t]) => <SelectItem key={k} value={k}>{t}</SelectItem>)}</SelectContent></Select></Field>}
        </div>
        {isLeader && <Field label="Privacidade"><Select value={privacy} onValueChange={setPrivacy}><SelectTrigger aria-label="Privacidade"><SelectValue /></SelectTrigger><SelectContent>{Object.entries(PRIVACY_TEXT).map(([k, t]) => <SelectItem key={k} value={k}>{t}</SelectItem>)}</SelectContent></Select></Field>}
        <div className="grid gap-1.5"><Label>Tags</Label><TagInput label="Tag" value={tags} onChange={setTags} max={10} placeholder="Escreva e prima Enter" /></div>
        {privacy === 'public' && <div className="flex items-start gap-3 rounded-xl bg-muted/50 p-3.5"><Checkbox id="s-appr" checked={approval} onCheckedChange={(v) => setApproval(v === true)} className="mt-0.5" /><div><Label htmlFor="s-appr">Exigir aprovação para entrar</Label><p className="text-xs text-muted-foreground">A liderança aceita ou recusa cada pedido.</p></div></div>}
        <div><Button type="submit" loading={save.isPending}>Guardar alterações</Button></div>
      </form>
      {group.privacy !== 'public' && (
        <section className="rounded-2xl border bg-card p-6"><h3 className="font-semibold">Código de convite</h3><p className="mt-1 text-sm text-muted-foreground">Quem tiver o código pode pedir para entrar. Gerar um novo invalida o anterior.</p>
          <div className="mt-3 flex flex-wrap items-center gap-2"><code className="rounded-lg bg-muted px-3 py-2 font-mono text-sm" data-testid="invite-code">{code || '—'}</code>
            <Button size="sm" variant="outline" disabled={!code} onClick={() => { navigator.clipboard?.writeText(code).then(() => toast.success('Código copiado'), () => toast.error('Não foi possível copiar')); }}><Copy /> Copiar</Button>
            <Button size="sm" variant="outline" loading={regen.isPending} onClick={() => regen.mutate()}><RefreshCw /> Gerar novo</Button></div></section>)}
      {isLeader && (
        <section className="rounded-2xl border border-destructive/40 bg-card p-6"><h3 className="font-semibold text-destructive">Zona de perigo</h3><p className="mt-1 text-sm text-muted-foreground">Só é possível eliminar um grupo sem outros membros; caso contrário, arquive-o em “Estado”.</p>
          <Button className="mt-3" variant="destructive" onClick={() => setConfirmDel(true)}>Eliminar grupo</Button></section>)}
      <ConfirmDialog open={confirmDel} onOpenChange={setConfirmDel} title="Eliminar este grupo?" description="Reuniões, tarefas, discussões e partilhas serão apagadas. Esta acção não pode ser desfeita." confirmLabel="Eliminar" destructive pending={del.isPending} onConfirm={() => del.mutate()} />
    </div>
  );
}
