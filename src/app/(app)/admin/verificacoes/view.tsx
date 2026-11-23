'use client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as React from 'react';
import { ExternalLink, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { Pager, ReasonDialog, errMsg } from '@/components/admin/common';
import { PageHeader } from '@/components/layout/page-header';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { EmptyState } from '@/components/ui/empty-state';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { api } from '@/lib/api/client';
import type { AdminUser, UserDocument } from '@/lib/api/types';
import { formatDate, ROLE_LABEL } from '@/lib/utils';
import { USER_STATUS } from '../utilizadores/view';

type Detail = AdminUser & { expertise?: string[]; educationLevel?: string | null; educationField?: string | null; teachingExperience?: string | null; institutionType?: string | null; website?: string | null; contactPhone?: string | null; nuit?: string | null; legalRepresentative?: string | null; accreditation?: string | null; yearFounded?: number | null; documents: UserDocument[] };
const DOC_STATUS: Record<string, { label: string; variant: 'success' | 'warning' | 'destructive' }> = { pending: { label: 'Por rever', variant: 'warning' }, approved: { label: 'Aprovado', variant: 'success' }, rejected: { label: 'Recusado', variant: 'destructive' } };
const FIELDS: [keyof Detail, string][] = [['institutionType', 'Tipo de instituição'], ['legalRepresentative', 'Representante legal'], ['nuit', 'NUIT'], ['accreditation', 'Acreditação'], ['yearFounded', 'Ano de fundação'], ['website', 'Website'], ['contactPhone', 'Telefone'], ['educationLevel', 'Escolaridade'], ['educationField', 'Área'], ['teachingExperience', 'Experiência de ensino']];
const name = (u: Pick<AdminUser, 'fullName' | 'institutionName' | 'username'>) => u.institutionName ?? u.fullName ?? u.username;

export function Verifications() {
  const [status, setStatus] = React.useState('pending'); const [role, setRole] = React.useState('all'); const [page, setPage] = React.useState(1); const [open, setOpen] = React.useState<string | null>(null);
  const list = useQuery({ queryKey: ['admin-verifs', status, role, page], queryFn: () => api.page<AdminUser>('/admin/verifications', { limit: 15, page, status, role: role === 'all' ? undefined : role }) });
  return (
    <div>
      <PageHeader title="Verificações" description="Aprove ou recuse contas de instrutores e instituições e os seus documentos." />
      <div className="flex flex-wrap gap-3">
        <Select value={status} onValueChange={(v) => { setStatus(v); setPage(1); }}><SelectTrigger className="w-44" aria-label="Estado"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="pending">Pendentes</SelectItem><SelectItem value="approved">Aprovadas</SelectItem><SelectItem value="rejected">Recusadas</SelectItem></SelectContent></Select>
        <Select value={role} onValueChange={(v) => { setRole(v); setPage(1); }}><SelectTrigger className="w-44" aria-label="Perfil"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Todos os perfis</SelectItem><SelectItem value="instructor">Instrutores</SelectItem><SelectItem value="institution">Instituições</SelectItem></SelectContent></Select>
      </div>
      <div className="mt-4 grid gap-2">
        {list.isLoading ? <Skeleton className="h-24 rounded-2xl" /> : !list.data?.data.length ? <EmptyState title="Nada por aqui" description="Não há pedidos neste estado." /> : list.data.data.map((u) => (
          <button key={u.userId} type="button" onClick={() => setOpen(u.userId)} className="flex items-center gap-3 rounded-2xl border bg-card p-4 text-left transition hover:border-primary/40 focus-visible:ring-[3px] focus-visible:ring-ring/40 focus-visible:outline-none">
            <Avatar src={u.avatarUrl} name={name(u)} size={40} /><div className="min-w-0 flex-1"><p className="truncate font-medium">{name(u)}</p><p className="truncate text-xs text-muted-foreground">{ROLE_LABEL[u.role]} · {u.email} · pedido a {formatDate(u.createdAt)}</p></div>
            <Badge variant={USER_STATUS[u.status]?.variant ?? 'secondary'}>{USER_STATUS[u.status]?.label ?? u.status}</Badge>
          </button>))}
      </div>
      <Pager page={page} total={list.data?.meta.totalPages ?? 1} onPage={setPage} />
      <VerificationDialog id={open} onClose={() => setOpen(null)} />
    </div>
  );
}

function VerificationDialog({ id, onClose }: { id: string | null; onClose: () => void }) {
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ['admin-verif', id], enabled: !!id, queryFn: () => api.get<Detail>(`/admin/verifications/${id}`) });
  const [reject, setReject] = React.useState(false); const [docReject, setDocReject] = React.useState<string | null>(null);
  const refresh = () => { qc.invalidateQueries({ queryKey: ['admin-verif', id] }); qc.invalidateQueries({ queryKey: ['admin-verifs'] }); qc.invalidateQueries({ queryKey: ['admin-stats'] }); };
  const decide = useMutation({ mutationFn: (v: { status: 'approved' | 'rejected'; reason?: string }) => api.patch(`/admin/verifications/${id}`, v), onSuccess: (_, v) => { toast.success(v.status === 'approved' ? 'Conta aprovada' : 'Pedido recusado'); setReject(false); refresh(); }, onError: (e) => toast.error(errMsg(e)) });
  const docRev = useMutation({ mutationFn: (v: { docId: string; status: 'approved' | 'rejected'; reason?: string }) => api.patch(`/admin/documents/${v.docId}/review`, { status: v.status, reason: v.reason }), onSuccess: (_, v) => { toast.success(v.status === 'approved' ? 'Documento aprovado' : 'Documento recusado'); setDocReject(null); refresh(); }, onError: (e) => toast.error(errMsg(e)) });
  const open = useMutation({ mutationFn: (docId: string) => api.get<{ url: string }>(`/admin/documents/${docId}/download`), onSuccess: (d) => window.open(d.url, '_blank', 'noopener,noreferrer'), onError: (e) => toast.error(errMsg(e)) });
  const u = q.data;
  return (
    <>
      <Dialog open={!!id} onOpenChange={(o) => !o && onClose()}>
        <DialogContent className="max-h-[90dvh] max-w-xl overflow-y-auto">
          <DialogHeader><DialogTitle>{u ? name(u) : 'Verificação'}</DialogTitle><DialogDescription>{u ? `${ROLE_LABEL[u.role]} · ${u.email}` : 'A carregar…'}</DialogDescription></DialogHeader>
          {u && (
            <div className="grid gap-5">
              <dl className="grid gap-3 text-sm sm:grid-cols-2">
                {FIELDS.filter(([k]) => u[k] != null && u[k] !== '').map(([k, l]) => <div key={k}><dt className="text-muted-foreground">{l}</dt><dd className="break-words font-medium">{String(u[k])}</dd></div>)}
                {u.expertise?.length ? <div className="sm:col-span-2"><dt className="text-muted-foreground">Especialidades</dt><dd className="font-medium">{u.expertise.join(', ')}</dd></div> : null}
                {u.bio && <div className="sm:col-span-2"><dt className="text-muted-foreground">Apresentação</dt><dd className="whitespace-pre-wrap break-words">{u.bio}</dd></div>}
              </dl>
              <section aria-labelledby="docs-h"><h3 id="docs-h" className="mb-2 text-sm font-semibold">Documentos ({u.documents.length})</h3>
                {!u.documents.length ? <p className="text-sm text-muted-foreground">Sem documentos submetidos.</p> : <ul className="grid gap-2">{u.documents.map((d) => (
                  <li key={d.docId} className="rounded-xl border p-3 text-sm">
                    <div className="flex items-center gap-2"><FileText className="size-4 shrink-0 text-muted-foreground" /><span className="min-w-0 flex-1 truncate font-medium">{d.originalName}</span><Badge variant={DOC_STATUS[d.status].variant}>{DOC_STATUS[d.status].label}</Badge></div>
                    <p className="mt-0.5 text-xs text-muted-foreground">{d.documentType} · {(d.size / 1024).toFixed(0)} KB</p>
                    {d.rejectionReason && <p className="mt-1 text-xs text-destructive">Motivo: {d.rejectionReason}</p>}
                    <div className="mt-2 flex flex-wrap gap-1"><Button size="sm" variant="outline" loading={open.isPending && open.variables === d.docId} onClick={() => open.mutate(d.docId)}><ExternalLink /> Abrir</Button>
                      {d.status !== 'approved' && <Button size="sm" variant="outline" loading={docRev.isPending && docRev.variables?.docId === d.docId && docRev.variables.status === 'approved'} onClick={() => docRev.mutate({ docId: d.docId, status: 'approved' })}>Aprovar</Button>}
                      {d.status !== 'rejected' && <Button size="sm" variant="ghost" onClick={() => setDocReject(d.docId)}>Recusar</Button>}</div>
                  </li>))}</ul>}
              </section>
              {u.status === 'pending' ? <div className="flex flex-wrap justify-end gap-2 border-t pt-4"><Button variant="outline" onClick={() => setReject(true)}>Recusar pedido</Button><Button loading={decide.isPending && decide.variables?.status === 'approved'} onClick={() => decide.mutate({ status: 'approved' })}>Aprovar conta</Button></div>
                : <p className="border-t pt-4 text-sm text-muted-foreground">Decidido: <strong>{USER_STATUS[u.status]?.label ?? u.status}</strong>{u.reviewDate ? ` em ${formatDate(u.reviewDate)}` : ''}{u.rejectionReason ? ` — ${u.rejectionReason}` : ''}</p>}
            </div>)}
        </DialogContent>
      </Dialog>
      <ReasonDialog open={reject} onOpenChange={setReject} title="Recusar pedido" description="O motivo é enviado ao utilizador." confirmLabel="Recusar" destructive pending={decide.isPending} onConfirm={(reason) => decide.mutate({ status: 'rejected', reason })} />
      <ReasonDialog open={!!docReject} onOpenChange={(o) => !o && setDocReject(null)} title="Recusar documento" description="O motivo é enviado ao utilizador." confirmLabel="Recusar" destructive pending={docRev.isPending} onConfirm={(reason) => docReject && docRev.mutate({ docId: docReject, status: 'rejected', reason })} />
    </>
  );
}
