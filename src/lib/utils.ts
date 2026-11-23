import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

export function formatPrice(price: string | number, currency = 'USD') {
  const n = Number(price);
  if (!n) return 'Gratuito';
  return new Intl.NumberFormat('pt-PT', { style: 'currency', currency, maximumFractionDigits: n % 1 ? 2 : 0 }).format(n);
}

/** Valor monetário sem o caso especial «Gratuito» (totais, receitas). */
export function formatMoney(amount: number, currency = 'MZN') {
  return new Intl.NumberFormat('pt-PT', { style: 'currency', currency, maximumFractionDigits: amount % 1 ? 2 : 0 }).format(amount);
}

export function formatDuration(seconds?: number | null) {
  if (!seconds) return '';
  const m = Math.round(seconds / 60);
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60);
  return m % 60 ? `${h} h ${m % 60} min` : `${h} h`;
}

export function formatDate(iso?: string | null, opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' }) {
  return iso ? new Intl.DateTimeFormat('pt-PT', opts).format(new Date(iso)) : '';
}

export function timeAgo(iso: string) {
  const s = Math.round((Date.now() - new Date(iso).getTime()) / 1000);
  const rtf = new Intl.RelativeTimeFormat('pt-PT', { numeric: 'auto' });
  if (s < 60) return 'agora mesmo';
  if (s < 3600) return rtf.format(-Math.floor(s / 60), 'minute');
  if (s < 86400) return rtf.format(-Math.floor(s / 3600), 'hour');
  if (s < 2592000) return rtf.format(-Math.floor(s / 86400), 'day');
  return formatDate(iso);
}

export const initials = (name?: string | null) =>
  (name ?? '?').split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0]!.toUpperCase()).join('') || '?';

export const LEVEL_LABEL: Record<string, string> = { beginner: 'Iniciante', intermediate: 'Intermédio', advanced: 'Avançado' };
export const ROLE_LABEL: Record<string, string> = { student: 'Aluno', instructor: 'Instrutor', institution: 'Instituição', admin: 'Administrador' };
export const LESSON_TYPE_LABEL: Record<string, string> = { video: 'Vídeo', audio: 'Áudio', pdf: 'PDF', text: 'Leitura', quiz: 'Quiz', assignment: 'Trabalho' };

export const POST_TYPE_LABEL: Record<string, string> = { discussion: 'Discussão', question: 'Pergunta', resource: 'Recurso', announcement: 'Anúncio', assignment: 'Tarefa' };
export const REACTIONS: { type: 'like' | 'helpful' | 'creative' | 'confused' | 'celebrate' | 'insightful'; emoji: string; label: string }[] = [
  { type: 'like', emoji: '👍', label: 'Gosto' }, { type: 'helpful', emoji: '🙌', label: 'Útil' }, { type: 'insightful', emoji: '💡', label: 'Esclarecedor' },
  { type: 'creative', emoji: '🎨', label: 'Criativo' }, { type: 'celebrate', emoji: '🎉', label: 'Parabéns' }, { type: 'confused', emoji: '🤔', label: 'Confuso' },
];

/** `primeiros-passos` → «Primeiros passos» (nomes de categoria da ajuda). */
export const catLabel = (name: string) => name.replace(/-/g, ' ').replace(/^./, (c) => c.toUpperCase());
