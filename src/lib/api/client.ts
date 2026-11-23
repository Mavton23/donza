/**
 * Cliente HTTP do browser.
 *  - O access token vive só em memória (nunca em localStorage); o refresh token é cookie httpOnly,
 *    enviado automaticamente porque o Next reencaminha /api/* para a API (mesma origem).
 *  - Refresh "single-flight": vários pedidos a falhar com 401 em simultâneo partilham UM único /auth/refresh.
 */
export class ApiError extends Error {
  constructor(public status: number, message: string, public code?: string, public details?: unknown) {
    super(message);
    this.name = 'ApiError';
  }
  /** Mensagens por campo vindas da validação do servidor (`details`). */
  get fieldErrors(): Record<string, string> {
    const out: Record<string, string> = {};
    if (Array.isArray(this.details)) for (const d of this.details as { field?: string; message?: string }[]) if (d.field && d.message && !out[d.field]) out[d.field] = d.message;
    return out;
  }
}

export interface Meta { total: number; page: number; limit: number; totalPages: number }
export interface Paged<T> { data: T[]; meta: Meta; /** campos extra devolvidos ao lado de data/meta (ex.: resumo de ganhos) */ summary?: Record<string, Record<string, number>> }

const BASE = '/api';
let accessToken: string | null = null;
let refreshing: Promise<string | null> | null = null;
const listeners = new Set<(token: string | null) => void>();

export const tokenStore = {
  get: () => accessToken,
  set(token: string | null) { accessToken = token; listeners.forEach((l) => l(token)); },
  subscribe(fn: (token: string | null) => void) { listeners.add(fn); return () => { listeners.delete(fn); }; },
};

export function refreshSession(): Promise<string | null> {
  refreshing ??= (async () => {
    try {
      const res = await fetch(`${BASE}/auth/refresh`, { method: 'POST', credentials: 'include', headers: { 'content-type': 'application/json' }, body: '{}' });
      if (!res.ok) { tokenStore.set(null); return null; }
      const json = (await res.json()) as { accessToken?: string };
      tokenStore.set(json.accessToken ?? null);
      return json.accessToken ?? null;
    } catch {
      return null; // rede em baixo: não terminar a sessão
    } finally {
      refreshing = null;
    }
  })();
  return refreshing;
}

type Query = Record<string, string | number | boolean | undefined | null>;
interface Options { method?: string; query?: Query; body?: unknown; form?: FormData; auth?: boolean; signal?: AbortSignal; headers?: Record<string, string> }

function qs(query?: Query) {
  if (!query) return '';
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries(query)) if (v !== undefined && v !== null && v !== '') p.set(k, String(v));
  const s = p.toString();
  return s ? `?${s}` : '';
}

async function raw(path: string, o: Options, retry = true): Promise<Response> {
  const headers: Record<string, string> = { accept: 'application/json', ...o.headers };
  if (o.body !== undefined) headers['content-type'] = 'application/json';
  if (o.auth !== false && accessToken) headers.authorization = `Bearer ${accessToken}`;
  const res = await fetch(`${BASE}${path}${qs(o.query)}`, {
    method: o.method ?? 'GET', headers, credentials: 'include', signal: o.signal,
    body: o.form ?? (o.body !== undefined ? JSON.stringify(o.body) : undefined),
  });
  if (res.status === 401 && retry && o.auth !== false && !path.startsWith('/auth/')) {
    if (await refreshSession()) return raw(path, o, false);
  }
  return res;
}

async function parse(res: Response) {
  const text = await res.text();
  let json: any = null;
  try { json = text ? JSON.parse(text) : null; } catch { /* corpo não JSON */ }
  if (!res.ok) {
    const e = json?.error;
    throw new ApiError(res.status, e?.message ?? (res.status >= 500 ? 'Erro no servidor. Tente novamente.' : 'Pedido inválido'), e?.code, e?.details);
  }
  return json;
}

export async function request<T>(path: string, o: Options = {}): Promise<T> {
  const json = await parse(await raw(path, o));
  return (json && typeof json === 'object' && 'success' in json && 'data' in json ? json.data : json) as T;
}

export async function requestPage<T>(path: string, o: Options = {}): Promise<Paged<T>> {
  const json = await parse(await raw(path, o));
  return { data: json.data as T[], meta: json.meta as Meta, summary: json.summary };
}

/** Descarrega um ficheiro autenticado (PDF, etc.) e devolve o blob. */
export async function downloadBlob(path: string): Promise<Blob> {
  const res = await raw(path, { headers: { accept: '*/*' } });
  if (!res.ok) await parse(res);
  return res.blob();
}

export const api = {
  get: <T>(path: string, query?: Query, signal?: AbortSignal) => request<T>(path, { query, signal }),
  page: <T>(path: string, query?: Query, signal?: AbortSignal) => requestPage<T>(path, { query, signal }),
  post: <T>(path: string, body?: unknown) => request<T>(path, { method: 'POST', body: body ?? {} }),
  patch: <T>(path: string, body?: unknown) => request<T>(path, { method: 'PATCH', body: body ?? {} }),
  put: <T>(path: string, body?: unknown) => request<T>(path, { method: 'PUT', body: body ?? {} }),
  del: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
  upload: <T>(path: string, form: FormData, method = 'POST') => request<T>(path, { method, form }),
};
