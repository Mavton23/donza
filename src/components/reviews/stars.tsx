'use client';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Stars({ value, size = 16, className }: { value: number; size?: number; className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-0.5', className)} role="img" aria-label={`${value.toFixed(1)} de 5 estrelas`}>
      {[1, 2, 3, 4, 5].map((i) => <Star key={i} style={{ width: size, height: size }} className={i <= Math.round(value) ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/40'} />)}
    </span>
  );
}

export function StarInput({ value, onChange, label = 'Classificação' }: { value: number; onChange: (v: number) => void; label?: string }) {
  return (
    <div role="radiogroup" aria-label={label} className="inline-flex gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <button key={i} type="button" role="radio" aria-checked={value === i} aria-label={`${i} estrela${i > 1 ? 's' : ''}`} onClick={() => onChange(i)}
          className="rounded p-0.5 transition hover:scale-110 focus-visible:ring-[3px] focus-visible:ring-ring/40 focus-visible:outline-none"><Star className={cn('size-7', i <= value ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/40')} /></button>))}
    </div>
  );
}
