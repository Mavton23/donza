'use client';
import * as P from '@radix-ui/react-progress';
import { cn } from '@/lib/utils';
export function Progress({ value, className, indicatorClassName }: { value: number; className?: string; indicatorClassName?: string }) {
  return (
    <P.Root value={value} className={cn('relative h-2 w-full overflow-hidden rounded-full bg-secondary', className)}>
      <P.Indicator className={cn('h-full rounded-full bg-primary transition-all duration-500', indicatorClassName)} style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
    </P.Root>
  );
}
