'use client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as React from 'react';
import { ShieldAlert } from 'lucide-react';
import { toast } from 'sonner';
import { Pager, msg } from '@/components/groups/manage';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { EmptyState } from '@/components/ui/empty-state';
import { Field } from '@/components/ui/field';
import { Textarea } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ApiError, api } from '@/lib/api/client';
import type { ContentScan, GroupAppeal, ModAction, ModActionType, ModDashboard, MyModAction, TopicReport } from '@/lib/api/types';
import { formatDate } from '@/lib/utils';

const ACTION_LABEL: Record<ModActionType, string> = { warn: 'Aviso', mute: 'Silenciamento', unmute: 'Silenciamento levantado', ban: 'Banimento', unban: 'Banimento levantado', remove_content: 'Conteúdo removido' };
const SCAN_TYPE: Record<string, string> = { post: 'Tópico', comment: 'Resposta', resource: 'Recurso', profile: 'Perfil' };
const SCAN_STATUS: Record<string, string> = { pending: 'Pendente', reviewed: 'Revisto', actioned: 'Removido', falsePositive: 'Falso positivo' };
const SCAN_CAT: Record<string, string> = { profanity: 'linguagem ofensiva', spam: 'spam', shouting: 'gritos (maiúsculas)' };
const APPEAL_STATUS: Record<string, string> = { pending: 'Pendente', accepted: 'Aceite', rejected: 'Rejeitada' };

export function ModerationPanel({ groupId }: { groupId: string }) {
  const dash = useQuery({ queryKey: ['group-mod', groupId, 'dash'], queryFn: () => api.get<ModDashboard>(`/study-groups/${groupId}/moderation/dashboard`) });
  const p = dash.data?.pending;
  const count = (n?: number) => (n ? ` (${n})` : '');
  return (
    <Tabs defaultValue="resumo">
      <TabsList className="mb-5 flex-wrap h-auto"><TabsTrigger value="resumo">Resumo</TabsTrigger><TabsTrigger value="denuncias">Denúncias{count(p?.reports)}</TabsTrigger><TabsTrigger value="analises">Análises{count(p?.scans)}</TabsTrigger><TabsTrigger value="recursos">Recursos{count(p?.appeals)}</TabsTrigger><TabsTrigger value="registo">Registo</TabsTrigger></TabsList>
      <TabsContent value="resumo"><Summary groupId={groupId} /></TabsContent>
      <TabsContent value="denuncias"><Reports groupId={groupId} /></TabsContent>
      <TabsContent value="analises"><Scans groupId={groupId} /></TabsContent>
      <TabsContent value="recursos"><Appeals groupId={groupId} /></TabsContent>
      <TabsContent value="registo"><ActionLog groupId={groupId} /></TabsContent>
    </Tabs>
  );
}

const ActionRow = ({ a }: { a: ModAction }) => (
  <li className="rounded-xl border bg-card p-3 text-sm"><p><Badge variant={a.type === 'ban' ? 'destructive' : 'secondary'}>{ACTION_LABEL[a.type]}</Badge> <span className="font-medium">@{a.target.username}</span> <span className="text-muted-foreground">por @{a.moderator.username} · {formatDate(a.createdAt)}{a.type === 'mute' && a.durationMinutes ? ` · ${a.durationMinutes} min` : ''}</span></p><p className="mt-1 text-muted-foreground">{a.reason}</p></li>
);

function Summary({ groupId }: { groupId: string }) {
  const q = useQuery({ queryKey: ['group-mod', groupId, 'dash'], queryFn: () => api.get<ModDashboard>(`/study-groups/${groupId}/moderation/dashboard`) });
  if (q.isLoading) return <Skeleton className="h-40 rounded-2xl" />;
  const d = q.data; if (!d) return <EmptyState title="Sem dados de moderação" description={q.error instanceof ApiError ? q.error.message : undefined} />;
  const tiles: [string, number][] = [['Denúncias por tratar', d.pending.reports], ['Análises pendentes', d.pending.scans], ['Recursos pendentes', d.pending.appeals], ['Silenciados', d.inForce.mutes], ['Banidos', d.inForce.bans]];
  return (
    <div className="grid gap-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">{tiles.map(([l, n]) => <div key={l} className="rounded-2xl border bg-card p-4"><p className="text-2xl font-bold tabular-nums">{n}</p><p className="text-xs text-muted-foreground">{l}</p></div>)}</div>
      {!!d.mostSanctioned.length && <section className="rounded-2xl border bg-card p-5"><h3 className="mb-2 font-semibold">Mais sancionados (30 dias)</h3><ul className="grid gap-1 text-sm">{d.mostSanctioned.map((m) => <li key={m.user.userId} className="flex justify-between"><span>@{m.user.username}</span><span className="tabular-nums text-muted-foreground">{m.actions} acções</span></li>)}</ul></section>}
      <section><h3 className="mb-2 font-semibold">Acções recentes</h3>{d.recent.length ? <ul className="grid gap-2">{d.recent.map((a) => <ActionRow key={a.actionId} a={a} />)}</ul> : <p className="text-sm text-muted-foreground">Ainda sem acções de moderação.</p>}</section>
    </div>
  );
}

function ActionLog({ groupId }: { groupId: string }) {
  const [page, setPage] = React.useState(1); const [type, setType] = React.useState('all');
  const q = useQuery({ queryKey: ['group-mod', groupId, 'log', page, type], queryFn: () => api.page<ModAction>(`/study-groups/${groupId}/moderation/actions`, { limit: 15, page, type: type === 'all' ? undefined : type }) });
  return (
    <div>
      <Select value={type} onValueChange={(v) => { setType(v); setPage(1); }}><SelectTrigger className="w-56" aria-label="Filtrar por tipo"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Todas as acções</SelectItem>{Object.entries(ACTION_LABEL).map(([k, l]) => <SelectItem key={k} value={k}>{l}</SelectItem>)}</SelectContent></Select>
      <div className="mt-4">{q.isLoading ? <Skeleton className="h-24 rounded-2xl" /> : !q.data?.data.length ? <EmptyState title="Sem registos" /> : <ul className="grid gap-2">{q.data.data.map((a) => <ActionRow key={a.actionId} a={a} />)}</ul>}</div>
      <Pager page={page} total={q.data?.meta.totalPages ?? 1} onPage={setPage} />
    </div>
  );
}

function Reports({ groupId }: { groupId: string }) {
  const qc = useQueryClient(); const [page, setPage] = React.useState(1);
  const q = useQuery({ queryKey: ['group-mod', groupId, 'reports', page], queryFn: () => api.page<TopicReport>(`/study-groups/${groupId}/topics/reports`, { limit: 10, page }) });
  const resolve = useMutation({ mutationFn: (id: string) => api.post(`/study-groups/${groupId}/topics/reports/${id}/resolve`, {}), onSuccess: () => { toast.success('Denúncia resolvida'); qc.invalidateQueries({ queryKey: ['group-mod', groupId] }); qc.invalidateQueries({ queryKey: ['group-topics', groupId] }); }, onError: (e) => toast.error(msg(e)) });
  if (q.isLoading) return <Skeleton className="h-24 rounded-2xl" />;
  if (!q.data?.data.length) return <EmptyState title="Sem denúncias por tratar" description="As denúncias a tópicos de discussão aparecem aqui." />;
  return (
    <div><ul className="grid gap-2">{q.data.data.map((r) => (
      <li key={r.reportId} className="flex flex-wrap items-center gap-3 rounded-2xl border bg-card p-3"><div className="min-w-0 flex-1"><p className="font-medium">{r.topic ? r.topic.title : 'Tópico removido'}</p><p className="text-sm text-muted-foreground">Motivo: {r.reason} · por @{r.reporter.username} · {formatDate(r.createdAt)}</p></div>
        <Button size="sm" variant="outline" loading={resolve.isPending && resolve.variables === r.reportId} onClick={() => resolve.mutate(r.reportId)}>Marcar como resolvida</Button></li>))}</ul>
      <Pager page={page} total={q.data.meta.totalPages} onPage={setPage} /></div>
  );
}

function Scans({ groupId }: { groupId: string }) {
  const qc = useQueryClient(); const [page, setPage] = React.useState(1); const [status, setStatus] = React.useState('pending');
  const [days, setDays] = React.useState('7'); const [sens, setSens] = React.useState('medium');
  const q = useQuery({ queryKey: ['group-mod', groupId, 'scans', page, status], queryFn: () => api.page<ContentScan>(`/study-groups/${groupId}/moderation/scans`, { limit: 10, page, status: status === 'all' ? undefined : status }) });
  const refresh = () => qc.invalidateQueries({ queryKey: ['group-mod', groupId] });
  const scan = useMutation({ mutationFn: () => api.post<{ scanned: number; flagged: number }>(`/study-groups/${groupId}/moderation/scan`, { days: +days, sensitivity: sens }), onSuccess: (r) => { toast.success(`${r.scanned} analisados, ${r.flagged} assinalados`); setPage(1); refresh(); }, onError: (e) => toast.error(msg(e)) });
  const review = useMutation({ mutationFn: (a: { id: string; status: string; removeContent?: boolean }) => api.patch(`/study-groups/${groupId}/moderation/scans/${a.id}`, { status: a.status, removeContent: a.removeContent }), onSuccess: () => { toast.success('Análise actualizada'); refresh(); qc.invalidateQueries({ queryKey: ['group-topics', groupId] }); }, onError: (e) => toast.error(msg(e)) });
  return (
    <div className="grid gap-5">
      <section className="flex flex-wrap items-end gap-3 rounded-2xl border bg-card p-4">
        <div className="grid gap-1.5"><span className="text-xs text-muted-foreground">Período</span><Select value={days} onValueChange={setDays}><SelectTrigger className="w-36" aria-label="Período"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="1">Último dia</SelectItem><SelectItem value="7">7 dias</SelectItem><SelectItem value="30">30 dias</SelectItem><SelectItem value="90">90 dias</SelectItem></SelectContent></Select></div>
        <div className="grid gap-1.5"><span className="text-xs text-muted-foreground">Sensibilidade</span><Select value={sens} onValueChange={setSens}><SelectTrigger className="w-36" aria-label="Sensibilidade"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="low">Baixa</SelectItem><SelectItem value="medium">Média</SelectItem><SelectItem value="high">Alta</SelectItem></SelectContent></Select></div>
        <Button onClick={() => scan.mutate()} loading={scan.isPending}><ShieldAlert /> Analisar conteúdo</Button>
        <div className="ml-auto grid gap-1.5"><span className="text-xs text-muted-foreground">Mostrar</span><Select value={status} onValueChange={(v) => { setStatus(v); setPage(1); }}><SelectTrigger className="w-40" aria-label="Filtrar análises"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Todas</SelectItem>{Object.entries(SCAN_STATUS).map(([k, l]) => <SelectItem key={k} value={k}>{l}</SelectItem>)}</SelectContent></Select></div>
      </section>
      {q.isLoading ? <Skeleton className="h-24 rounded-2xl" /> : !q.data?.data.length ? <EmptyState title="Sem conteúdo assinalado" description="Execute uma análise para procurar conteúdo de risco." /> : (
        <ul className="grid gap-2">{q.data.data.map((s) => (
          <li key={s.scanId} className="rounded-2xl border bg-card p-4">
            <div className="flex flex-wrap items-center gap-2 text-sm"><Badge variant="secondary">{SCAN_TYPE[s.contentType] ?? s.contentType}</Badge><Badge variant={s.riskScore >= 0.7 ? 'destructive' : 'outline'}>Risco {Math.round(s.riskScore * 100)}%</Badge>{s.flaggedCategories.map((c) => <Badge key={c} variant="outline">{SCAN_CAT[c] ?? c}</Badge>)}<span className="text-muted-foreground">{s.author ? `@${s.author.username} · ` : ''}{formatDate(s.createdAt)}</span><Badge className="ml-auto" variant={s.status === 'pending' ? 'secondary' : 'outline'}>{SCAN_STATUS[s.status]}</Badge></div>
            {s.details?.excerpt && <p className="mt-2 whitespace-pre-wrap rounded-lg bg-muted/50 p-3 text-sm">{s.details.excerpt}</p>}
            {(s.status === 'pending' || s.status === 'reviewed') && (
              <div className="mt-3 flex flex-wrap gap-2">
                <Button size="sm" variant="outline" onClick={() => review.mutate({ id: s.scanId, status: 'falsePositive' })}>Falso positivo</Button>
                {s.status === 'pending' && <Button size="sm" variant="outline" onClick={() => review.mutate({ id: s.scanId, status: 'reviewed' })}>Marcar revisto</Button>}
                <Button size="sm" variant="destructive" onClick={() => review.mutate({ id: s.scanId, status: 'actioned', removeContent: true })}>Remover conteúdo</Button>
              </div>)}
          </li>))}</ul>)}
      <Pager page={page} total={q.data?.meta.totalPages ?? 1} onPage={setPage} />
    </div>
  );
}

function Appeals({ groupId }: { groupId: string }) {
  const qc = useQueryClient(); const [page, setPage] = React.useState(1); const [status, setStatus] = React.useState('pending');
  const q = useQuery({ queryKey: ['group-mod', groupId, 'appeals', page, status], queryFn: () => api.page<GroupAppeal>(`/study-groups/${groupId}/moderation/appeals`, { limit: 10, page, status: status === 'all' ? undefined : status }) });
  const [decide, setDecide] = React.useState<{ a: GroupAppeal; decision: 'accepted' | 'rejected' } | null>(null); const [note, setNote] = React.useState('');
  const run = useMutation({
    mutationFn: () => api.patch(`/study-groups/${groupId}/moderation/appeals/${decide!.a.appealId}`, { decision: decide!.decision, note: note.trim() || undefined }),
    onSuccess: () => { toast.success('Decisão registada'); setDecide(null); setNote(''); qc.invalidateQueries({ queryKey: ['group-mod', groupId] }); qc.invalidateQueries({ queryKey: ['group-members-admin', groupId] }); },
    onError: (e) => toast.error(msg(e)),
  });
  return (
    <div>
      <Select value={status} onValueChange={(v) => { setStatus(v); setPage(1); }}><SelectTrigger className="w-44" aria-label="Filtrar recursos"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Todos</SelectItem>{Object.entries(APPEAL_STATUS).map(([k, l]) => <SelectItem key={k} value={k}>{l}</SelectItem>)}</SelectContent></Select>
      <div className="mt-4">{q.isLoading ? <Skeleton className="h-24 rounded-2xl" /> : !q.data?.data.length ? <EmptyState title="Sem recursos" description="Os recursos dos membros sancionados aparecem aqui." /> : (
        <ul className="grid gap-2">{q.data.data.map((a) => (
          <li key={a.appealId} className="rounded-2xl border bg-card p-4">
            <p className="text-sm"><span className="font-medium">@{a.user.username}</span> recorre de <Badge variant="secondary">{ACTION_LABEL[a.action.type]}</Badge> <span className="text-muted-foreground">({a.action.reason}, por @{a.action.moderator.username}) · {formatDate(a.createdAt)}</span></p>
            <p className="mt-2 whitespace-pre-wrap rounded-lg bg-muted/50 p-3 text-sm">{a.message}</p>
            {a.status === 'pending' ? <div className="mt-3 flex gap-2"><Button size="sm" onClick={() => setDecide({ a, decision: 'accepted' })}>Aceitar</Button><Button size="sm" variant="outline" onClick={() => setDecide({ a, decision: 'rejected' })}>Rejeitar</Button></div>
              : <p className="mt-2 text-sm text-muted-foreground">{APPEAL_STATUS[a.status]}{a.decisionNote ? `: ${a.decisionNote}` : ''}</p>}
          </li>))}</ul>)}</div>
      <Pager page={page} total={q.data?.meta.totalPages ?? 1} onPage={setPage} />
      <Dialog open={!!decide} onOpenChange={(o) => { if (!o) { setDecide(null); setNote(''); } }}><DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>{decide?.decision === 'accepted' ? 'Aceitar recurso' : 'Rejeitar recurso'}</DialogTitle><DialogDescription>{decide?.decision === 'accepted' ? 'A sanção é levantada e o membro é notificado.' : 'A sanção mantém-se e o membro é notificado.'}</DialogDescription></DialogHeader>
        <form className="grid gap-4" onSubmit={(e) => { e.preventDefault(); run.mutate(); }}>
          <Field label="Nota (opcional)" htmlFor="ap-note"><Textarea id="ap-note" rows={3} maxLength={500} value={note} onChange={(e) => setNote(e.target.value)} /></Field>
          <DialogFooter><Button type="button" variant="ghost" onClick={() => setDecide(null)}>Cancelar</Button><Button type="submit" loading={run.isPending}>Confirmar</Button></DialogFooter>
        </form>
      </DialogContent></Dialog>
    </div>
  );
}

/** As sanções do próprio utilizador neste grupo, com a possibilidade de recorrer. */
export function MySanctions({ groupId }: { groupId: string }) {
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ['group-mod', groupId, 'mine'], queryFn: () => api.get<MyModAction[]>(`/study-groups/${groupId}/moderation/mine`) });
  const [target, setTarget] = React.useState<MyModAction | null>(null); const [text, setText] = React.useState(''); const [err, setErr] = React.useState('');
  const send = useMutation({
    mutationFn: () => { if (text.trim().length < 10) { setErr('Explique o recurso (mín. 10 caracteres)'); throw new Error('v'); } return api.post(`/study-groups/${groupId}/moderation/appeals`, { actionId: target!.actionId, message: text.trim() }); },
    onSuccess: () => { toast.success('Recurso enviado'); setTarget(null); setText(''); qc.invalidateQueries({ queryKey: ['group-mod', groupId, 'mine'] }); },
    onError: (e) => { if (e instanceof ApiError) { if (e.fieldErrors.message) setErr(e.fieldErrors.message); else toast.error(e.message); } },
  });
  const rows = (q.data ?? []).filter((a) => a.type !== 'unmute' && a.type !== 'unban');
  if (!rows.length) return null;
  return (
    <section className="rounded-2xl border bg-card p-5"><h2 className="mb-3 font-semibold">As minhas sanções</h2>
      <ul className="grid gap-2">{rows.map((a) => (
        <li key={a.actionId} className="rounded-xl border p-3 text-sm"><p><Badge variant={a.inForce ? 'destructive' : 'outline'}>{ACTION_LABEL[a.type]}</Badge> <span className="text-muted-foreground">{formatDate(a.createdAt)}{a.inForce ? ' · em vigor' : ''}</span></p><p className="mt-1">{a.reason}</p>
          {a.appeal ? <p className="mt-1 text-muted-foreground">Recurso: {APPEAL_STATUS[a.appeal.status]}{a.appeal.decisionNote ? ` — ${a.appeal.decisionNote}` : ''}</p> : a.appealable && <Button className="mt-2" size="sm" variant="outline" onClick={() => { setTarget(a); setErr(''); }}>Recorrer</Button>}</li>))}</ul>
      <Dialog open={!!target} onOpenChange={(o) => !o && setTarget(null)}><DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>Recorrer da sanção</DialogTitle><DialogDescription>A liderança do grupo analisa o seu recurso.</DialogDescription></DialogHeader>
        <form className="grid gap-4" noValidate onSubmit={(e) => { e.preventDefault(); send.mutate(); }}>
          <Field label="Mensagem" htmlFor="my-appeal" error={err}><Textarea id="my-appeal" rows={4} maxLength={1000} value={text} onChange={(e) => { setText(e.target.value); setErr(''); }} /></Field>
          <DialogFooter><Button type="button" variant="ghost" onClick={() => setTarget(null)}>Cancelar</Button><Button type="submit" loading={send.isPending}>Enviar recurso</Button></DialogFooter>
        </form>
      </DialogContent></Dialog>
    </section>
  );
}
