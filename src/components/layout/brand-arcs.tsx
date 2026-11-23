import { cn } from '@/lib/utils';

/**
 * Dispositivo gráfico "Horizonte": anéis concêntricos (o arco do D) a nascer de uma linha, com o sol no centro.
 * Usa os tokens (primária + acento), por isso acompanha o tema. Decorativo: `aria-hidden`.
 */
export function BrandArcs({ className, rings = 5, sun = true, tone = 'primary' }: { className?: string; rings?: number; sun?: boolean; tone?: 'primary' | 'light' }) {
  const stroke = tone === 'light' ? 'var(--brand-claro)' : 'var(--primary)';
  const k = tone === 'light' ? 0.5 : 1; // sobre fundo escuro, os anéis ficam mais discretos e o sol mantém a cor
  const W = 800, H = 400, cx = W / 2, cy = H;
  const ringW = H * 0.075, gap = H * 0.05, r0 = H * 0.2;
  const opacities = [1, 0.62, 0.36, 0.2, 0.1, 0.06];
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className={cn('w-full', className)} aria-hidden focusable="false" preserveAspectRatio="xMidYMax meet">
      {sun && <circle cx={cx} cy={cy} r={r0} fill="var(--accent)" />}
      {Array.from({ length: rings }, (_, i) => {
        const rOut = r0 + gap + ringW * (i + 1) + gap * i;
        return <circle key={i} cx={cx} cy={cy} r={rOut - ringW / 2} fill="none" stroke={stroke} strokeWidth={ringW} strokeOpacity={(opacities[i] ?? 0.05) * k} />;
      })}
    </svg>
  );
}
