'use client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as React from 'react';
import { Search, UserPlus } from 'lucide-react';
import { toast } from 'sonner';
import { Pager, ReasonDialog, errMsg } from '@/components/admin/common';
import { PageHeader } from '@/components/layout/page-header';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { EmptyState } from '@/components/ui/empty-state';
import { Field } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { ApiError, api } from '@/lib/api/client';
import type { AdminUser } from '@/lib/api/types';
import { useAuth } from '@/lib/auth/auth-provider';
import { formatDate, ROLE_LABEL } from '@/lib/utils';

export const USER_STATUS: Record<string, { label: string; variant: 'success' | 'warning' | 'destructive' | 'secondary' }> = {
  approved: { label: 'Activo', variant: 'success' }, pending: { label: 'Pendente', variant: 'warning' }, rejected: { label: 'Recusado', variant: 'destructive' }, suspended: { label: 'Suspenso', variant: 'destructive' },
};
const name = (u: Pick<AdminUser, 'fullName' | 'institutionName' | 'username'>) => u.institutionName ?? u.fullName ?? u.username;

export function Users() {
  const { user: me } = useAuth(); const qc = useQueryClient();
  const [q, setQ] = React.useState(''); const [term, setTerm] = React.useState(''); const [role, setRole] = React.useState('all'); const [status, setStatus] = React.useState('all'); const [page, setPage] = React.useState(1);
  React.useEffect(() => { const t = setTimeout(() => { setTerm(q.trim()); setPage(1); }, 300); return () => clearTimeout(t); }, [q]);
  const list = useQuery({ queryKey: ['admin-users', term, role, status, page], queryFn: () => api.page<AdminUser>('/admin/users', { limit: 15, page, q: term || undefined, role: role === 'all' ? undefined : role, status: status === 'all' ? undefined : status }) });
  const [detail, setDetail] = React.useState<string | null>(null); const [suspend, setSuspend] = React.useState<AdminUser | null>(null); const [create, setCreate] = React.useState(false);
  const refresh = () => { qc.invalidateQueries({ queryKey: ['admin-users'] }); qc.invalidateQueries({ queryKey: ['admin-user'] }); };
  const setSt = useMutation({
    mutationFn: (v: { id: string; status: 'suspended' | 'active'; reason?: string }) => api.patch(`/admin/users/${v.id}/status`, { status: v.status, reason: v.reason }),
    onSuccess: (_, v) => { toast.success(v.status === 'active' ? 'Conta reactivada' : 'Conta suspensa'); setSuspend(null); refresh(); }, onError: (e) => toast.error(errMsg(e)),
  });
  return (
    <div>
      <PageHeader title="Utilizadores" description="Pesquise, consulte e suspenda contas." actions={<Button onClick={() => setCreate(true)}><UserPlus /> Novo administrador</Button>} />
      <div className="flex flex-wrap gap-3">
        <div className="relative min-w-56 flex-1"><Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Nome, utilizador ou email" aria-label="Pesquisar utilizadores" className="pl-9" /></div>
        <Select value={role} onValueChange={(v) => { setRole(v); setPage(1); }}><SelectTrigger className="w-44" aria-label="Perfil"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Todos os perfis</SelectItem>{Object.entries(ROLE_LABEL).map(([k, l]) => <SelectItem key={k} value={k}>{l}</SelectItem>)}</SelectContent></Select>
        <Select value={status} onValueChange={(v) => { setStatus(v); setPage(1); }}><SelectTrigger className="w-44" aria-label="Estado"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Todos os estados</SelectItem>{Object.entries(USER_STATUS).map(([k, s]) => <SelectItem key={k} value={k}>{s.label}</SelectItem>)}</SelectContent></Select>
      </div>
      <div className="mt-4 overflow-x-auto rounded-2xl border bg-card">
        {list.isLoading ? <Skeleton className="h-48" /> : !list.data?.data.length ? <EmptyState title="Sem resultados" description="Ajuste a pesquisa ou os filtros." /> : (
          <table className="w-full text-sm"><caption className="sr-only">Utilizadores</caption>
            <thead className="border-b text-left text-xs text-muted-foreground"><tr><th scope="col" className="p-3 font-medium">Utilizador</th><th scope="col" className="p-3 font-medium">Perfil</th><th scope="col" className="p-3 font-medium">Estado</th><th scope="col" className="p-3 font-medium">Último acesso</th><th scope="col" className="p-3"><span className="sr-only">Acções</span></th></tr></thead>
            <tbody className="divide-y">{list.data.data.map((u) => { const st = USER_STATUS[u.status] ?? { label: u.status, variant: 'secondary' as const }; const self = u.userId === me?.userId; return (
              <tr key={u.userId}>
                <td className="p-3"><div className="flex items-center gap-3"><Avatar src={u.avatarUrl} name={name(u)} size={32} /><div className="min-w-0"><p className="truncate font-medium">{name(u)}</p><p className="truncate text-xs text-muted-foreground">{u.email}</p></div></div></td>
                <td className="p-3">{ROLE_LABEL[u.role] ?? u.role}</td>
                <td className="p-3"><Badge variant={st.variant}>{st.label}</Badge></td>
                <td className="p-3 text-muted-foreground">{u.lastLogin ? formatDate(u.lastLogin) : '—'}</td>
                <td className="p-3"><div className="flex justify-end gap-1">
                  <Button size="sm" variant="ghost" onClick={() => setDetail(u.userId)}>Ver</Button>
                  {!self && u.role !== 'admin' && (u.status === 'suspended' ? <Button size="sm" variant="outline" loading={setSt.isPending && setSt.variables?.id === u.userId} onClick={() => setSt.mutate({ id: u.userId, status: 'active' })}>Reactivar</Button> : u.status === 'approved' && <Button size="sm" variant="outline" onClick={() => setSuspend(u)}>Suspender</Button>)}
                </div></td>
              </tr>); })}</tbody></table>)}
      </div>
      <Pager page={page} total={list.data?.meta.totalPages ?? 1} onPage={setPage} />
      <ReasonDialog open={!!suspend} onOpenChange={(o) => !o && setSuspend(null)} title={`Suspender ${suspend ? name(suspend) : ''}`} description="A pessoa deixa de conseguir entrar. O motivo fica registado." confirmLabel="Suspender" destructive pending={setSt.isPending} onConfirm={(reason) => suspend && setSt.mutate({ id: suspend.userId, status: 'suspended', reason })} />
      <UserDetail id={detail} onClose={() => setDetail(null)} />
      <CreateAdmin open={create} onOpenChange={setCreate} onDone={refresh} />
    </div>
  );
}

function UserDetail({ id, onClose }: { id: string | null; onClose: () => void }) {
  const q = useQuery({ queryKey: ['admin-user', id], enabled: !!id, queryFn: () => api.get<AdminUser>(`/admin/users/${id}`) });
  const u = q.data;
  return (
    <Dialog open={!!id} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>{u ? name(u) : 'Utilizador'}</DialogTitle><DialogDescription>{u ? `@${u.username} · ${u.email}` : 'A carregar…'}</DialogDescription></DialogHeader>
        {u && (
          <dl className="grid grid-cols-2 gap-3 text-sm">
            <div><dt className="text-muted-foreground">Perfil</dt><dd className="font-medium">{ROLE_LABEL[u.role] ?? u.role}</dd></div>
            <div><dt className="text-muted-foreground">Estado</dt><dd className="font-medium">{(USER_STATUS[u.status]?.label ?? u.status)}</dd></div>
            <div><dt className="text-muted-foreground">Registado em</dt><dd className="font-medium">{formatDate(u.createdAt)}</dd></div>
            <div><dt className="text-muted-foreground">Último acesso</dt><dd className="font-medium">{u.lastLogin ? formatDate(u.lastLogin) : '—'}</dd></div>
            {u.counts && <><div><dt className="text-muted-foreground">Cursos leccionados</dt><dd className="font-medium">{u.counts.taughtCourses}</dd></div><div><dt className="text-muted-foreground">Matrículas</dt><dd className="font-medium">{u.counts.enrollments}</dd></div><div><dt className="text-muted-foreground">Certificados</dt><dd className="font-medium">{u.counts.certificates}</dd></div><div><dt className="text-muted-foreground">Documentos</dt><dd className="font-medium">{u.counts.documents}</dd></div></>}
            {u.rejectionReason && <div className="col-span-2"><dt className="text-muted-foreground">Motivo registado</dt><dd className="whitespace-pre-wrap break-words font-medium">{u.rejectionReason}</dd></div>}
          </dl>)}
      </DialogContent>
    </Dialog>
  );
}

function CreateAdmin({ open, onOpenChange, onDone }: { open: boolean; onOpenChange: (o: boolean) => void; onDone: () => void }) {
  const [f, setF] = React.useState({ email: '', username: '', fullName: '', password: '' }); const [errs, setErrs] = React.useState<Record<string, string>>({});
  React.useEffect(() => { if (open) { setF({ email: '', username: '', fullName: '', password: '' }); setErrs({}); } }, [open]);
  const m = useMutation({
    mutationFn: () => api.post('/admin/register', { email: f.email.trim(), username: f.username.trim(), password: f.password, fullName: f.fullName.trim() || undefined }),
    onSuccess: () => { toast.success('Administrador criado'); onOpenChange(false); onDone(); },
    onError: (e) => { if (e instanceof ApiError && e.fieldErrors) setErrs(e.fieldErrors); else toast.error(errMsg(e)); },
  });
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement>) => { setF({ ...f, [k]: e.target.value }); setErrs({ ...errs, [k]: '' }); };
  const submit = (e: React.FormEvent) => { e.preventDefault(); const er: Record<string, string> = {}; if (!/^\S+@\S+\.\S+$/.test(f.email.trim())) er.email = 'Indique um email válido'; if (f.username.trim().length < 3) er.username = 'Mínimo 3 caracteres'; if (f.password.length < 12) er.password = 'Mínimo 12 caracteres'; setErrs(er); if (!Object.keys(er).length) m.mutate(); };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <form noValidate onSubmit={submit} className="grid gap-4">
          <DialogHeader><DialogTitle>Novo administrador</DialogTitle><DialogDescription>A conta fica activa de imediato com acesso total.</DialogDescription></DialogHeader>
          <Field label="Email" htmlFor="na-email" error={errs.email}><Input id="na-email" type="email" value={f.email} onChange={set('email')} aria-invalid={!!errs.email} /></Field>
          <Field label="Nome de utilizador" htmlFor="na-user" error={errs.username}><Input id="na-user" value={f.username} onChange={set('username')} aria-invalid={!!errs.username} /></Field>
          <Field label="Nome completo (opcional)" htmlFor="na-name" error={errs.fullName}><Input id="na-name" value={f.fullName} onChange={set('fullName')} /></Field>
          <Field label="Palavra-passe" htmlFor="na-pass" error={errs.password} hint="Pelo menos 12 caracteres."><Input id="na-pass" type="password" autoComplete="new-password" value={f.password} onChange={set('password')} aria-invalid={!!errs.password} /></Field>
          <DialogFooter><Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button><Button type="submit" loading={m.isPending}>Criar administrador</Button></DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
