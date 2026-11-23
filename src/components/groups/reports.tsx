'use client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as React from 'react';
import { Award } from 'lucide-react';
import { toast } from 'sonner';
import { BarChart } from '@/components/admin/common';
import { Pager, msg } from '@/components/groups/manage';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { EmptyState } from '@/components/ui/empty-state';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ApiError, api } from '@/lib/api/client';
import type { ActivityReportData, GroupReportRow, MemberAchievements, TaskReportData } from '@/lib/api/types';
import { formatDate } from '@/lib/utils';

const TYPE_LABEL: Record<string, string> = { WEEKLY_ACTIVITY: 'Semanal', MONTHLY_SUMMARY: 'Mensal', TASK_COMPLETION: 'Tarefas', TOP_CONTRIBUTORS: 'Contribuidores' };
const STATUS: Record<string, string> = { pending: 'Pendente', in_progress: 'Em curso', completed: 'Concluída', archived: 'Arquivada' };
const PRIO: Record<string, string> = { low: 'Baixa', medium: 'Média', high: 'Alta' };
const Tile = ({ label, value, hint }: { label: string; value: React.ReactNode; hint?: string }) => <div className="rounded-2xl border bg-card p-4"><p className="text-2xl font-bold tabular-nums">{value}</p><p className="text-xs text-muted-foreground">{label}</p>{hint && <p className="text-[11px] text-muted-foreground">{hint}</p>}</div>;
const range = (p: { start: string; end: string }) => `${formatDate(p.start)} – ${formatDate(p.end)}`;

/** Relatórios (liderança): actividade semanal/mensal, tarefas e histórico. */
export function ReportsPanel({ groupId }: { groupId: string }) {
  const qc = useQueryClient();
  const evaluate = useMutation({ mutationFn: () => api.post<{ awarded: number }>(`/study-groups/${groupId}/achievements/evaluate`, {}), onSuccess: (r) => { toast.success(r.awarded ? `${r.awarded} conquista(s) atribuída(s)` : 'Sem novas conquistas'); qc.invalidateQueries({ queryKey: ['group-ach'] }); qc.invalidateQueries({ queryKey: ['group-board', groupId] }); }, onError: (e) => toast.error(msg(e)) });
  return (
    <div className="grid gap-4">
      <div className="flex items-center justify-between gap-3 rounded-2xl border bg-card p-4"><p className="text-sm text-muted-foreground">As conquistas são avaliadas semanalmente; avalie já para premiar quem as atingiu.</p><Button variant="outline" loading={evaluate.isPending} onClick={() => evaluate.mutate()}><Award /> Avaliar conquistas</Button></div>
      <Tabs defaultValue="weekly">
        <TabsList className="mb-4"><TabsTrigger value="weekly">Semanal</TabsTrigger><TabsTrigger value="monthly">Mensal</TabsTrigger><TabsTrigger value="tasks">Tarefas</TabsTrigger><TabsTrigger value="history">Histórico</TabsTrigger></TabsList>
        <TabsContent value="weekly"><ActivityReport groupId={groupId} kind="weekly" /></TabsContent>
        <TabsContent value="monthly"><ActivityReport groupId={groupId} kind="monthly" /></TabsContent>
        <TabsContent value="tasks"><TaskReport groupId={groupId} /></TabsContent>
        <TabsContent value="history"><History groupId={groupId} /></TabsContent>
      </Tabs>
    </div>
  );
}

function ActivityView({ d }: { d: ActivityReportData }) {
  return (
    <div className="grid gap-5">
      <p className="text-sm text-muted-foreground">Período: {range(d.period)}</p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Tile label="Membros" value={d.members.total} hint={`+${d.members.joined} / −${d.members.left}`} /><Tile label="Participação" value={`${d.members.engagementRate}%`} hint={`${d.members.active} activos`} />
        <Tile label="Tópicos e respostas" value={d.discussions.topics + d.discussions.replies} hint={`${d.discussions.topics} tópicos`} /><Tile label="Recursos partilhados" value={d.contents.shared} />
        <Tile label="Tarefas concluídas" value={d.tasks.completed} hint={`${d.tasks.created} criadas`} /><Tile label="Reuniões" value={d.meetings.held} hint={`${d.meetings.completed} concluídas`} /><Tile label="Acções registadas" value={d.totalActions} />
      </div>
      {!!d.dailyActivity.length && <section className="rounded-2xl border bg-card p-5"><h3 className="mb-3 font-semibold">Actividade diária</h3><BarChart labels={d.dailyActivity.map((x) => formatDate(x.date))} values={d.dailyActivity.map((x) => x.actions)} label="Acções por dia" /></section>}
      <div className="grid gap-4 md:grid-cols-2">
        <section className="rounded-2xl border bg-card p-5"><h3 className="mb-2 font-semibold">Mais activos</h3>{d.topContributors.length ? <ol className="grid gap-1 text-sm">{d.topContributors.map((t) => <li key={t.userId} className="flex justify-between"><span>@{t.username}</span><span className="tabular-nums text-muted-foreground">{t.actions} acções</span></li>)}</ol> : <p className="text-sm text-muted-foreground">Sem actividade no período.</p>}</section>
        <section className="rounded-2xl border bg-card p-5"><h3 className="mb-2 font-semibold">Membros inactivos</h3>{d.inactiveMembers.length ? <ul className="grid gap-1 text-sm">{d.inactiveMembers.map((t) => <li key={t.userId} className="flex justify-between"><span>@{t.username}</span><span className="text-muted-foreground">{t.lastActiveAt ? formatDate(t.lastActiveAt) : 'nunca activo'}</span></li>)}</ul> : <p className="text-sm text-muted-foreground">Todos participaram.</p>}</section>
      </div>
    </div>
  );
}

function ActivityReport({ groupId, kind }: { groupId: string; kind: 'weekly' | 'monthly' }) {
  const [which, setWhich] = React.useState('previous');
  const q = useQuery({ queryKey: ['group-report', groupId, kind, which], queryFn: () => api.get<GroupReportRow<ActivityReportData>>(`/study-groups/${groupId}/reports/${kind}`, { [kind === 'weekly' ? 'week' : 'month']: which }) });
  return (
    <div className="grid gap-4">
      <Select value={which} onValueChange={setWhich}><SelectTrigger className="w-52" aria-label="Período do relatório"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="previous">{kind === 'weekly' ? 'Semana anterior' : 'Mês anterior'}</SelectItem><SelectItem value="current">{kind === 'weekly' ? 'Semana em curso' : 'Mês em curso'}</SelectItem></SelectContent></Select>
      {q.isLoading ? <Skeleton className="h-40 rounded-2xl" /> : q.data?.data ? <ActivityView d={q.data.data} /> : <EmptyState title="Relatório indisponível" description={q.error instanceof ApiError ? q.error.message : undefined} />}
    </div>
  );
}

function TaskView({ d }: { d: TaskReportData }) {
  return (
    <div className="grid gap-5">
      <p className="text-sm text-muted-foreground">Período: {range(d.period)}</p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5"><Tile label="Tarefas" value={d.totals.tasks} /><Tile label="Concluídas" value={d.totals.completed} hint={`${d.totals.completionRate}%`} /><Tile label="Em aberto" value={d.totals.open} /><Tile label="Em atraso" value={d.totals.overdue} /><Tile label="Concluídas no período" value={d.totals.completedInPeriod} /></div>
      <div className="grid gap-4 md:grid-cols-2">
        <section className="rounded-2xl border bg-card p-5"><h3 className="mb-2 font-semibold">Por estado</h3><ul className="grid gap-1 text-sm">{Object.entries(d.byStatus).map(([k, n]) => <li key={k} className="flex justify-between"><span>{STATUS[k] ?? k}</span><span className="tabular-nums">{n}</span></li>)}</ul></section>
        <section className="rounded-2xl border bg-card p-5"><h3 className="mb-2 font-semibold">Por prioridade</h3><ul className="grid gap-1 text-sm">{Object.entries(d.byPriority).map(([k, n]) => <li key={k} className="flex justify-between"><span>{PRIO[k] ?? k}</span><span className="tabular-nums">{n}</span></li>)}</ul></section>
        <section className="rounded-2xl border bg-card p-5"><h3 className="mb-2 font-semibold">Em atraso</h3>{d.overdueTasks.length ? <ul className="grid gap-1 text-sm">{d.overdueTasks.map((t) => <li key={t.taskId} className="flex justify-between gap-2"><span className="truncate">{t.title}</span><span className="shrink-0 text-muted-foreground">{formatDate(t.deadline)}</span></li>)}</ul> : <p className="text-sm text-muted-foreground">Nenhuma.</p>}</section>
        <section className="rounded-2xl border bg-card p-5"><h3 className="mb-2 font-semibold">Prazos nos próximos 7 dias</h3>{d.upcomingDeadlines.length ? <ul className="grid gap-1 text-sm">{d.upcomingDeadlines.map((t) => <li key={t.taskId} className="flex justify-between gap-2"><span className="truncate">{t.title}</span><span className="shrink-0 text-muted-foreground">{formatDate(t.deadline)}</span></li>)}</ul> : <p className="text-sm text-muted-foreground">Nenhum.</p>}</section>
      </div>
      {!!d.members.length && <section className="rounded-2xl border bg-card p-5"><h3 className="mb-2 font-semibold">Por membro</h3><ul className="grid gap-1 text-sm">{d.members.map((m) => <li key={m.userId} className="flex justify-between"><span>@{m.username}</span><span className="tabular-nums text-muted-foreground">{m.completed}/{m.assigned} ({m.completionRate}%){m.overdue ? ` · ${m.overdue} em atraso` : ''}</span></li>)}</ul></section>}
    </div>
  );
}

function TaskReport({ groupId }: { groupId: string }) {
  const [period, setPeriod] = React.useState('30d');
  const q = useQuery({ queryKey: ['group-report', groupId, 'tasks', period], queryFn: () => api.get<GroupReportRow<TaskReportData>>(`/study-groups/${groupId}/reports/tasks`, { period }) });
  return (
    <div className="grid gap-4">
      <Select value={period} onValueChange={setPeriod}><SelectTrigger className="w-44" aria-label="Período das tarefas"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="7d">Últimos 7 dias</SelectItem><SelectItem value="30d">Últimos 30 dias</SelectItem><SelectItem value="90d">Últimos 90 dias</SelectItem></SelectContent></Select>
      {q.isLoading ? <Skeleton className="h-40 rounded-2xl" /> : q.data?.data ? <TaskView d={q.data.data} /> : <EmptyState title="Relatório indisponível" description={q.error instanceof ApiError ? q.error.message : undefined} />}
    </div>
  );
}

function History({ groupId }: { groupId: string }) {
  const [page, setPage] = React.useState(1); const [open, setOpen] = React.useState<string | null>(null);
  const q = useQuery({ queryKey: ['group-report', groupId, 'history', page], queryFn: () => api.page<GroupReportRow>(`/study-groups/${groupId}/reports`, { limit: 10, page }) });
  const detail = useQuery({ queryKey: ['group-report', groupId, 'detail', open], enabled: !!open, queryFn: () => api.get<GroupReportRow<ActivityReportData & TaskReportData>>(`/study-groups/${groupId}/reports/${open}`) });
  if (q.isLoading) return <Skeleton className="h-24 rounded-2xl" />;
  if (!q.data?.data.length) return <EmptyState title="Sem relatórios guardados" description="Os relatórios gerados ficam aqui." />;
  const row = q.data.data.find((r) => r.reportId === open); const d = detail.data?.data;
  return (
    <div><ul className="grid gap-2">{q.data.data.map((r) => (
      <li key={r.reportId} className="flex items-center gap-3 rounded-2xl border bg-card p-3"><Badge variant="secondary">{TYPE_LABEL[r.type] ?? r.type}</Badge><span className="flex-1 text-sm">{range({ start: r.periodStart, end: r.periodEnd })}</span><Button size="sm" variant="outline" onClick={() => setOpen(r.reportId)}>Ver</Button></li>))}</ul>
      <Pager page={page} total={q.data.meta.totalPages} onPage={setPage} />
      <Dialog open={!!open} onOpenChange={(o) => !o && setOpen(null)}><DialogContent className="max-h-[85vh] max-w-3xl overflow-y-auto">
        <DialogHeader><DialogTitle>Relatório {row ? TYPE_LABEL[row.type]?.toLowerCase() : ''}</DialogTitle><DialogDescription>{row ? range({ start: row.periodStart, end: row.periodEnd }) : ''}</DialogDescription></DialogHeader>
        {detail.isLoading ? <Skeleton className="h-40" /> : d ? ('totals' in d ? <TaskView d={d as TaskReportData} /> : 'members' in d && 'discussions' in d ? <ActivityView d={d as ActivityReportData} /> : <p className="text-sm text-muted-foreground">Sem pré-visualização para este tipo.</p>) : null}
      </DialogContent></Dialog>
    </div>
  );
}

/** Conquistas de um membro (obtidas e por conquistar). */
export function AchievementsDialog({ groupId, membershipId, onClose }: { groupId: string; membershipId: string; onClose: () => void }) {
  const q = useQuery({ queryKey: ['group-ach', groupId, membershipId], queryFn: () => api.get<MemberAchievements>(`/study-groups/${groupId}/members/${membershipId}/achievements`) });
  const d = q.data;
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}><DialogContent className="max-w-md">
      <DialogHeader><DialogTitle>Conquistas{d ? ` de @${d.member.username}` : ''}</DialogTitle><DialogDescription>{d ? `${d.member.points} pontos de contribuição` : 'A carregar…'}</DialogDescription></DialogHeader>
      {q.isLoading ? <Skeleton className="h-32" /> : !d ? <p className="text-sm text-muted-foreground">Não foi possível carregar.</p> : (
        <div className="grid gap-4">
          <section><h4 className="mb-2 text-sm font-semibold">Obtidas</h4>{d.achievements.length ? <ul className="grid gap-2">{d.achievements.map((a) => <li key={a.achievementId} className="flex items-start gap-3 rounded-xl border bg-primary/5 p-3"><Award className="mt-0.5 size-5 text-accent-foreground" /><div className="text-sm"><p className="font-medium">{a.label} <span className="font-normal text-muted-foreground">+{a.points} pts</span></p><p className="text-muted-foreground">{a.description} · {formatDate(a.createdAt)}</p></div></li>)}</ul> : <p className="text-sm text-muted-foreground">Ainda nenhuma.</p>}</section>
          <section><h4 className="mb-2 text-sm font-semibold">Por conquistar</h4>{d.available.length ? <ul className="grid gap-2">{d.available.map((a) => <li key={a.type} className="rounded-xl border p-3 text-sm opacity-80"><p className="font-medium">{a.label} <span className="font-normal text-muted-foreground">+{a.points} pts</span></p><p className="text-muted-foreground">{a.description}</p></li>)}</ul> : <p className="text-sm text-muted-foreground">Todas conquistadas!</p>}</section>
        </div>)}
    </DialogContent></Dialog>
  );
}
