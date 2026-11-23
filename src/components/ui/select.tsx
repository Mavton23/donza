'use client';
import * as S from '@radix-ui/react-select';
import { Check, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
export const Select = S.Root;
export const SelectValue = S.Value;
export const SelectTrigger = ({ className, children, ...p }: React.ComponentProps<typeof S.Trigger>) => (
  <S.Trigger className={cn('flex h-10 w-full items-center justify-between gap-2 rounded-lg border border-input bg-card px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/30 data-[placeholder]:text-muted-foreground aria-invalid:border-destructive', className)} {...p}>
    {children}<S.Icon asChild><ChevronDown className="size-4 opacity-60" /></S.Icon>
  </S.Trigger>
);
export const SelectContent = ({ className, children, ...p }: React.ComponentProps<typeof S.Content>) => (
  <S.Portal>
    <S.Content position="popper" sideOffset={6} className={cn('z-50 max-h-72 min-w-[var(--radix-select-trigger-width)] overflow-hidden rounded-xl border bg-popover p-1.5 text-popover-foreground shadow-xl data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95', className)} {...p}>
      <S.Viewport>{children}</S.Viewport>
    </S.Content>
  </S.Portal>
);
export const SelectItem = ({ className, children, ...p }: React.ComponentProps<typeof S.Item>) => (
  <S.Item className={cn('relative flex cursor-pointer items-center rounded-lg py-2 pr-8 pl-2.5 text-sm outline-none select-none data-[highlighted]:bg-muted data-[disabled]:opacity-50', className)} {...p}>
    <S.ItemText>{children}</S.ItemText>
    <S.ItemIndicator className="absolute right-2.5"><Check className="size-4 text-primary" /></S.ItemIndicator>
  </S.Item>
);
