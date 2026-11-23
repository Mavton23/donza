import { cn } from '@/lib/utils';
import { Label } from './label';

/** Rótulo + controlo + erro/ajuda. O erro é anunciado a leitores de ecrã (aria-live). */
export function Field({ label, htmlFor, error, hint, children, className }: { label?: string; htmlFor?: string; error?: string; hint?: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('grid gap-1.5', className)}>
      {label && <Label htmlFor={htmlFor}>{label}</Label>}
      {children}
      {hint && !error && <p className="text-xs text-muted-foreground">{hint}</p>}
      <p role="alert" aria-live="polite" className={cn('text-xs text-destructive', !error && 'sr-only')}>{error}</p>
    </div>
  );
}
