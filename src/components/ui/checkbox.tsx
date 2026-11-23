'use client';
import * as C from '@radix-ui/react-checkbox';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
export const Checkbox = ({ className, ...p }: React.ComponentProps<typeof C.Root>) => (
  <C.Root className={cn('peer size-[18px] shrink-0 rounded-[5px] border border-input bg-card shadow-xs outline-none transition focus-visible:ring-[3px] focus-visible:ring-ring/40 data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground aria-invalid:border-destructive', className)} {...p}>
    <C.Indicator className="flex items-center justify-center"><Check className="size-3.5" strokeWidth={3} /></C.Indicator>
  </C.Root>
);
