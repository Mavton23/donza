'use client';
import * as React from 'react';
import { CheckCircle2, FileUp, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ApiError, api } from '@/lib/api/client';
import type { SignedUpload } from '@/lib/api/types';

const ACCEPT = { video: 'video/mp4,video/quicktime,video/webm,video/x-matroska', audio: 'audio/mpeg,audio/mp4,audio/wav,audio/ogg,audio/webm,audio/aac,audio/x-m4a', pdf: 'application/pdf' } as const;
const MAX_MB = { video: 500, audio: 100, pdf: 50 } as const;
export type MediaKind = keyof typeof ACCEPT;

/** Envia o ficheiro directamente ao Cloudinary com assinatura emitida pela API (o servidor nunca recebe o vídeo). */
export function MediaUpload({ courseId, kind, value, onUploaded, onClear, signPath }: { courseId?: string; kind: MediaKind; value?: string | null; onUploaded: (url: string, durationSeconds?: number) => void; onClear: () => void; signPath?: string }) {
  const [progress, setProgress] = React.useState<number | null>(null);
  const [error, setError] = React.useState('');
  const xhr = React.useRef<XMLHttpRequest | null>(null);
  React.useEffect(() => () => xhr.current?.abort(), []);

  async function start(file: File) {
    setError('');
    if (file.size > MAX_MB[kind] * 1024 * 1024) { setError(`O ficheiro excede ${MAX_MB[kind]} MB.`); return; }
    try {
      setProgress(0);
      const sig = await api.post<SignedUpload>(signPath ?? `/courses/${courseId}/media/signature`, { kind });
      const form = new FormData();
      form.set('file', file); form.set('api_key', sig.apiKey); form.set('timestamp', String(sig.timestamp)); form.set('signature', sig.signature); form.set('folder', sig.folder);
      if (sig.allowedFormats) form.set('allowed_formats', sig.allowedFormats);
      const res = await new Promise<{ secure_url: string; duration?: number }>((resolve, reject) => {
        const x = new XMLHttpRequest(); xhr.current = x;
        x.open('POST', sig.uploadUrl);
        x.upload.onprogress = (e) => { if (e.lengthComputable) setProgress(Math.round((e.loaded / e.total) * 100)); };
        x.onload = () => { try { const j = JSON.parse(x.responseText); x.status < 300 ? resolve(j) : reject(new Error(j.error?.message ?? 'Falha no envio')); } catch { reject(new Error('Resposta inválida do serviço de ficheiros')); } };
        x.onerror = () => reject(new Error('Sem ligação ao serviço de ficheiros'));
        x.onabort = () => reject(new Error('Envio cancelado'));
        x.send(form);
      });
      onUploaded(res.secure_url, res.duration ? Math.round(res.duration) : undefined);
    } catch (e) {
      setError(e instanceof ApiError || e instanceof Error ? e.message : 'Não foi possível enviar o ficheiro.');
    } finally { setProgress(null); xhr.current = null; }
  }

  if (progress !== null) return (
    <div className="grid gap-2 rounded-xl border bg-muted/40 p-3" role="status"><div className="flex items-center justify-between text-sm"><span className="inline-flex items-center gap-2"><Loader2 className="size-4 animate-spin" />A enviar… {progress}%</span><Button type="button" variant="ghost" size="sm" onClick={() => xhr.current?.abort()}>Cancelar</Button></div><Progress value={progress} /></div>
  );
  return (
    <div className="grid gap-2">
      {value ? (
        <div className="flex items-center justify-between gap-3 rounded-xl border bg-success/5 p-3 text-sm"><span className="inline-flex min-w-0 items-center gap-2"><CheckCircle2 className="size-4 shrink-0 text-success" /><span className="truncate">{decodeURIComponent(value.split('/').pop() ?? 'Ficheiro enviado')}</span></span><Button type="button" variant="ghost" size="icon-sm" aria-label="Remover ficheiro" onClick={onClear}><X /></Button></div>
      ) : (
        <label className="flex cursor-pointer flex-col items-center gap-1.5 rounded-xl border-2 border-dashed p-6 text-center transition hover:bg-muted/50 has-[:focus-visible]:ring-[3px] has-[:focus-visible]:ring-ring/40">
          <FileUp className="size-6 text-muted-foreground" /><span className="text-sm font-medium">Escolher {kind === 'video' ? 'vídeo' : kind === 'audio' ? 'áudio' : 'PDF'}</span><span className="text-xs text-muted-foreground">Até {MAX_MB[kind]} MB</span>
          <input type="file" accept={ACCEPT[kind]} className="sr-only" onChange={(e) => { const f = e.target.files?.[0]; if (f) void start(f); e.target.value = ''; }} />
        </label>
      )}
      {error && <p role="alert" className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
