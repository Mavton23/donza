'use client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import * as React from 'react';
import { Lock, Users } from 'lucide-react';
import { toast } from 'sonner';
import { ChatPanel } from '@/components/messages/chat-panel';
import { InvitesPanel, MembersPanel, RequestsPanel, SettingsPanel } from '@/components/groups/manage';
import { Contents } from '@/components/groups/contents';
import { ReportsPanel } from '@/components/groups/reports';
import { ModerationPanel } from '@/components/groups/moderation';
import { Meetings } from '@/components/groups/meetings';
import { Overview } from '@/components/groups/overview';
import { Tasks } from '@/components/groups/tasks';
import { Topics } from '@/components/groups/topics';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { EmptyState } from '@/components/ui/empty-state';
import { Field } from '@/components/ui/field';
import { Input, Textarea } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ApiError, api } from '@/lib/api/client';
import type { StudyGroup } from '@/lib/api/types';
import { useAuth } from '@/lib/auth/auth-provider';

const msg = (e: unknown) => (e instanceof ApiError ? e.message : 'Sem ligação ao servidor.');
const TABS = ['geral', 'membros', 'chat', 'reunioes', 'tarefas', 'discussoes', 'recursos', 'gestao'];

export function GroupView({ groupId }: { groupId: string }) {
  const { user } = useAuth(); const qc = useQueryClient(); const router = useRouter(); const params = useSearchParams();
  const tab = TABS.includes(params.get('tab') ?? '') ? params.get('tab')! : 'geral';
  const q = useQuery({ queryKey: ['group', groupId], queryFn: () => api.get<StudyGroup>(`/study-groups/${groupId}`) });
  const [join, setJoin] = React.useState(false);
  const refresh = () => { qc.invalidateQueries({ queryKey: ['group', groupId] }); qc.invalidateQueries({ queryKey: ['groups'] }); };
  const leave = useMutation({ mutationFn: () => api.del(`/study-groups/${groupId}/membership`), onSuccess: () => { refresh(); toast.success('Saiu do grupo'); }, onError: (e) => toast.error(msg(e)) });
  if (q.isLoading) return <div className="grid gap-4"><Skeleton className="h-32 rounded-2xl" /><Skeleton className="h-48 rounded-2xl" /></div>;
  if (q.isError || !q.data) return <EmptyState title="Grupo não encontrado" description={q.error instanceof ApiError ? q.error.message : undefined} action={<Button asChild><Link href="/grupos">Voltar</Link></Button>} />;
  const g = q.data; const v = g.viewer; const member = !!v?.isMember && v.status !== 'pending';
  return (
    <>
      <header className="mb-6 flex flex-wrap items-start gap-4 rounded-2xl border bg-card p-6">
        <div className="min-w-0 flex-1">
          <h1 className="flex flex-wrap items-center gap-2 text-2xl font-bold tracking-tight">{g.name}{g.privacy !== 'public' && <Badge variant="outline"><Lock className="mr-1 size-3" />{g.privacy === 'private' ? 'Privado' : 'Só por convite'}</Badge>}</h1>
          {g.description && <p className="mt-1 text-sm text-muted-foreground">{g.description}</p>}
          <p className="mt-2 flex flex-wrap gap-3 text-sm text-muted-foreground"><span className="inline-flex items-center gap-1"><Users className="size-4" />{g.membersCount}/{g.maxMembers}</span><span>criado por @{g.creator.username}</span>{g.community && <Link href={`/comunidades/${g.community.slug}`} className="hover:underline">em {g.community.name}</Link>}</p>
          {!!g.tags.length && <div className="mt-3 flex flex-wrap gap-1.5">{g.tags.map((t) => <Badge key={t} variant="secondary">#{t}</Badge>)}</div>}
        </div>
        <div>{member ? (!v?.isCreator && <Button variant="outline" loading={leave.isPending} onClick={() => leave.mutate()}>Sair do grupo</Button>)
          : v?.hasPendingRequest ? <Badge variant="secondary">Pedido pendente</Badge>
          : <Button onClick={() => setJoin(true)}>{g.privacy === 'public' && !g.approvalRequired ? 'Entrar' : 'Pedir para entrar'}</Button>}</div>
      </header>
      {!member ? <EmptyState icon={<Lock />} title="Entre para ver o grupo" description="Reuniões, tarefas e discussões são só para membros." />
        : <Tabs value={tab} onValueChange={(t) => router.replace(`/grupos/${groupId}?tab=${t}`, { scroll: false })}>
          <TabsList className="mb-6"><TabsTrigger value="geral">Geral</TabsTrigger><TabsTrigger value="membros">Membros</TabsTrigger><TabsTrigger value="chat">Chat</TabsTrigger><TabsTrigger value="reunioes">Reuniões</TabsTrigger><TabsTrigger value="tarefas">Tarefas</TabsTrigger><TabsTrigger value="discussoes">Discussões</TabsTrigger><TabsTrigger value="recursos">Recursos</TabsTrigger>{(v?.canModerate || v?.canManage) && <TabsTrigger value="gestao">Gestão</TabsTrigger>}</TabsList>
          <TabsContent value="geral"><Overview group={g} /></TabsContent>
          <TabsContent value="membros"><MembersPanel group={g} selfId={user?.userId ?? ''} /></TabsContent>
          <TabsContent value="chat"><div className="h-[28rem] overflow-hidden rounded-2xl border bg-card"><ChatPanel basePath={`/study-groups/${groupId}/messages`} readPath={`/study-groups/${groupId}/messages/read`} /></div></TabsContent>
          <TabsContent value="reunioes"><Meetings groupId={groupId} canManage={!!v?.canManage || !!v?.canModerate} /></TabsContent>
          <TabsContent value="tarefas"><Tasks groupId={groupId} canManage={!!v?.canManage || !!v?.canModerate} /></TabsContent>
          <TabsContent value="discussoes"><Topics groupId={groupId} canModerate={!!v?.canModerate || !!v?.canManage} /></TabsContent>
          <TabsContent value="recursos"><Contents groupId={groupId} canModerate={!!v?.canModerate || !!v?.canManage} canWrite={v?.status !== 'muted'} /></TabsContent>
          {(v?.canModerate || v?.canManage) && <TabsContent value="gestao"><ManagePanel group={g} /></TabsContent>}
        </Tabs>}
      {join && <JoinDialog group={g} onClose={() => setJoin(false)} onDone={refresh} />}
    </>
  );
}

function JoinDialog({ group, onClose, onDone }: { group: StudyGroup; onClose: () => void; onDone: () => void }) {
  const [code, setCode] = React.useState(''); const [message, setMessage] = React.useState(''); const [err, setErr] = React.useState('');
  const needsCode = group.privacy === 'invite_only';
  const send = useMutation({
    mutationFn: () => {
      if (needsCode && !code.trim()) { setErr('Introduza o código de convite'); throw new Error('v'); }
      return api.post<{ status: string }>(`/study-groups/${group.groupId}/join`, { inviteCode: code.trim() || undefined, message: message.trim() || undefined });
    },
    onSuccess: (r) => { onDone(); toast.success(r?.status === 'active' ? 'Bem-vindo ao grupo!' : 'Pedido enviado. Aguarde aprovação.'); onClose(); },
    onError: (e) => { if (e instanceof ApiError) toast.error(e.message); },
  });
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}><DialogContent>
      <DialogHeader><DialogTitle>Entrar em “{group.name}”</DialogTitle><DialogDescription>{group.privacy === 'public' && !group.approvalRequired ? 'Pode entrar já.' : 'A liderança do grupo pode ter de aprovar o pedido.'}</DialogDescription></DialogHeader>
      <form className="grid gap-4" noValidate onSubmit={(e) => { e.preventDefault(); send.mutate(); }}>
        {group.privacy !== 'public' && <Field label={needsCode ? 'Código de convite' : 'Código de convite (opcional)'} htmlFor="j-code" error={err}><Input id="j-code" value={code} onChange={(e) => { setCode(e.target.value); setErr(''); }} className="font-mono" /></Field>}
        {(group.approvalRequired || group.privacy === 'private') && <Field label="Mensagem (opcional)" htmlFor="j-msg"><Textarea id="j-msg" rows={3} maxLength={500} value={message} onChange={(e) => setMessage(e.target.value)} /></Field>}
        <DialogFooter><Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button><Button type="submit" loading={send.isPending}>Continuar</Button></DialogFooter>
      </form>
    </DialogContent></Dialog>
  );
}

function ManagePanel({ group }: { group: StudyGroup }) {
  const canManage = !!group.viewer?.canManage;
  return (
    <Tabs defaultValue="pedidos">
      <TabsList className="mb-5"><TabsTrigger value="pedidos">Pedidos</TabsTrigger><TabsTrigger value="convites">Convites</TabsTrigger><TabsTrigger value="moderacao">Moderação</TabsTrigger>{canManage && <TabsTrigger value="relatorios">Relatórios</TabsTrigger>}{canManage && <TabsTrigger value="definicoes">Definições</TabsTrigger>}</TabsList>
      <TabsContent value="pedidos"><RequestsPanel groupId={group.groupId} /></TabsContent>
      <TabsContent value="convites"><InvitesPanel group={group} /></TabsContent>
      <TabsContent value="moderacao"><ModerationPanel groupId={group.groupId} /></TabsContent>
      {canManage && <TabsContent value="relatorios"><ReportsPanel groupId={group.groupId} /></TabsContent>}
      {canManage && <TabsContent value="definicoes"><SettingsPanel group={group} /></TabsContent>}
    </Tabs>
  );
}
