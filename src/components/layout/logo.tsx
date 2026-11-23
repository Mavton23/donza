import Link from 'next/link';
import { cn } from '@/lib/utils';
import { MARK_BOX, MARK_PATH, MARK_SUN, WORDMARK_PATH, WORDMARK_WIDTH, WORDMARK_X } from '@/lib/brand-paths';

/**
 * Marca Donza: um "D" cujo miolo guarda o sol. As cores vêm dos tokens, por isso muda sozinha no modo escuro.
 * `light` = para fundos escuros fixos (barra lateral): Mar-claro + wordmark branco.
 * Desenho oficial em `src/lib/brand-paths.ts` (gerado) e em `public/brand/`.
 */
const BODY = 'var(--primary)';
const SUN = 'var(--accent)';
const WORD = 'var(--wordmark)';

export function LogoMark({ className, light, title }: { className?: string; light?: boolean; title?: string }) {
  const { x, y, w, h } = MARK_BOX;
  return (
    <svg viewBox={`${x} ${y} ${w} ${h}`} className={cn('h-8 w-auto shrink-0', className)} role={title ? 'img' : undefined} aria-label={title} aria-hidden={title ? undefined : true} focusable="false">
      <path fill={light ? 'var(--brand-claro)' : BODY} fillRule="evenodd" d={MARK_PATH} />
      <circle cx={MARK_SUN.cx} cy={MARK_SUN.cy} r={MARK_SUN.r} fill={SUN} />
    </svg>
  );
}

const PAD_V = 1.5; // folga para o overshoot das letras redondas
export function LogoLockup({ className, light }: { className?: string; light?: boolean }) {
  const { x, y, h } = MARK_BOX;
  const total = WORDMARK_X - x + WORDMARK_WIDTH;
  return (
    <svg viewBox={`${x} ${y - PAD_V} ${total.toFixed(2)} ${h + 2 * PAD_V}`} className={cn('h-8 w-auto', className)} aria-hidden focusable="false">
      <path fill={light ? 'var(--brand-claro)' : BODY} fillRule="evenodd" d={MARK_PATH} />
      <circle cx={MARK_SUN.cx} cy={MARK_SUN.cy} r={MARK_SUN.r} fill={SUN} />
      <path fill={light ? '#fff' : WORD} transform={`translate(${WORDMARK_X} ${y + h})`} d={WORDMARK_PATH} />
    </svg>
  );
}

export function Logo({ href = '/', className, light }: { href?: string; className?: string; light?: boolean }) {
  return (
    <Link href={href} className={cn('inline-flex items-center rounded-md', className)} aria-label="Donza — página inicial">
      <LogoLockup light={light} />
    </Link>
  );
}
