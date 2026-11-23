'use client';
import { useQuery } from '@tanstack/react-query';
import * as React from 'react';
import { Award, Download, Link2 } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '@/components/layout/page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import { ApiError, api, downloadBlob } from '@/lib/api/client';
import type { Certificate } from '@/lib/api/types';
import { formatDate } from '@/lib/utils';

const ST = { issued: { label: 'Válido', variant: 'success' }, revoked: { label: 'Revogado', variant: 'destructive' }, expired: { label: 'Expirado', variant: 'outline' } } as const;

export function Certificates() {
  const q = useQuery({ queryKey: ['certificates'], queryFn: () => api.page<Certificate>('/certificates', { limit: 50 }) });
  const [busy, setBusy] = React.useState<string | null>(null);
  async function download(c: Certificate) {
    setBusy(c.certificateId);
    try {
      const url = URL.createObjectURL(await downloadBlob(`/certificates/${c.certificateId}/download`));
      const a = document.createElement('a'); a.href = url; a.download = `certificado-${c.credentialId}.pdf`; a.click(); setTimeout(() => URL.revokeObjectURL(url), 5000);
    } catch (e) { toast.error(e instanceof ApiError ? e.message : 'Não foi possível descarregar.'); } finally { setBusy(null); }
  }
  async function copy(c: Certificate) {
    try { await navigator.clipboard.writeText(`${location.origin}/verificar/${c.credentialId}`); toast.success('Ligação de verificação copiada'); } catch { toast.error('Não foi possível copiar.'); }
  }
  const items = q.data?.data ?? [];
  return (
    <>
      <PageHeader title="Certificados" description="Emitidos automaticamente quando conclui um curso." />
      {q.isLoading ? <div className="grid gap-4 sm:grid-cols-2">{[0, 1].map((i) => <Skeleton key={i} className="h-36 rounded-2xl" />)}</div>
        : q.isError ? <EmptyState title="Não foi possível carregar os certificados" action={<Button onClick={() => q.refetch()}>Tentar de novo</Button>} />
        : !items.length ? <EmptyState icon={<Award />} title="Ainda sem certificados" description="Conclua todas as aulas de um curso para receber o seu." />
        : <div className="grid gap-4 sm:grid-cols-2">{items.map((c) => { const s = ST[c.status]; return (
          <article key={c.certificateId} className="flex flex-col gap-3 rounded-2xl border bg-card p-5">
            <div className="flex items-start justify-between gap-2"><Award className="size-6 text-accent-foreground" /><Badge variant={s.variant}>{s.label}</Badge></div>
            <div><h3 className="font-semibold leading-snug">{c.course?.title ?? c.event?.title}</h3><p className="mt-1 text-sm text-muted-foreground">Emitido a {formatDate(c.issueDate)} · {c.hours} h</p><p className="mt-1 font-mono text-xs text-muted-foreground">{c.credentialId}</p></div>
            <div className="mt-auto flex gap-2"><Button size="sm" loading={busy === c.certificateId} disabled={c.status === 'revoked'} onClick={() => download(c)}><Download /> PDF</Button><Button size="sm" variant="outline" onClick={() => copy(c)}><Link2 /> Copiar ligação</Button></div>
          </article>); })}</div>}
    </>
  );
}
