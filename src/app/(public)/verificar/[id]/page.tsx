import { CheckCircle2, XCircle } from 'lucide-react';
import { notFound } from 'next/navigation';
import { formatDate } from '@/lib/utils';

export const metadata = { title: 'Verificar certificado', robots: { index: false } };
const API = process.env.API_URL ?? 'http://localhost:3001';
interface V { valid: boolean; status: string; credentialId: string; holder: string; kind: 'course' | 'event'; title: string; hours: number; issueDate: string; expirationDate: string | null }

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const res = await fetch(`${API}/api/certificates/verify/${encodeURIComponent(id)}`, { cache: 'no-store' }).catch(() => null);
  if (res?.status === 404) notFound();
  if (!res?.ok) return <main className="mx-auto max-w-xl px-4 py-20 text-center"><h1 className="text-2xl font-bold">Serviço indisponível</h1><p className="mt-2 text-muted-foreground">Não foi possível verificar agora. Tente novamente em instantes.</p></main>;
  const v = ((await res.json()) as { data: V }).data;
  return (
    <main className="mx-auto max-w-xl px-4 py-16">
      <div className={`rounded-2xl border p-8 text-center ${v.valid ? 'bg-success/5' : 'bg-destructive/5'}`}>
        {v.valid ? <CheckCircle2 className="mx-auto size-12 text-success" /> : <XCircle className="mx-auto size-12 text-destructive" />}
        <h1 className="mt-4 text-2xl font-bold">{v.valid ? 'Certificado válido' : v.status === 'revoked' ? 'Certificado revogado' : 'Certificado expirado'}</h1>
        <dl className="mt-6 grid gap-3 text-left text-sm">
          <div><dt className="text-muted-foreground">Titular</dt><dd className="font-medium">{v.holder}</dd></div>
          <div><dt className="text-muted-foreground">{v.kind === 'course' ? 'Curso' : 'Evento'}</dt><dd className="font-medium">{v.title}</dd></div>
          <div className="grid grid-cols-2 gap-3"><div><dt className="text-muted-foreground">Emitido a</dt><dd className="font-medium">{formatDate(v.issueDate)}</dd></div><div><dt className="text-muted-foreground">Carga horária</dt><dd className="font-medium">{v.hours} h</dd></div></div>
          <div><dt className="text-muted-foreground">Código</dt><dd className="font-mono">{v.credentialId}</dd></div>
        </dl>
      </div>
    </main>
  );
}
