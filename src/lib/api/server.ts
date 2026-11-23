import 'server-only';
import type { Meta } from './client';

const API_URL = process.env.API_URL ?? 'http://localhost:3001';

/** Leitura pública no servidor (RSC): sem sessão, com cache curta. Falhas devolvem null para a página decidir. */
export async function serverGet<T>(path: string, revalidate = 60): Promise<{ data: T; meta?: Meta } | null> {
  try {
    const res = await fetch(`${API_URL}/api${path}`, { next: { revalidate }, headers: { accept: 'application/json' } });
    if (!res.ok) return null;
    const json = await res.json();
    return { data: json.data as T, meta: json.meta };
  } catch {
    return null;
  }
}
