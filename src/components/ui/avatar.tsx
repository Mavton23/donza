'use client';
import * as AvatarPrimitive from '@radix-ui/react-avatar';
import { cn, initials } from '@/lib/utils';

export function Avatar({ src, name, className, size = 40 }: { src?: string | null; name?: string | null; className?: string; size?: number }) {
  return (
    <AvatarPrimitive.Root className={cn('relative inline-flex shrink-0 overflow-hidden rounded-full bg-secondary ring-1 ring-border', className)} style={{ width: size, height: size }}>
      {src && <AvatarPrimitive.Image src={src} alt={name ?? ''} className="size-full object-cover" />}
      <AvatarPrimitive.Fallback className="flex size-full items-center justify-center bg-gradient-to-br from-primary/20 to-accent/30 font-semibold text-secondary-foreground" style={{ fontSize: size * 0.38 }}>
        {initials(name)}
      </AvatarPrimitive.Fallback>
    </AvatarPrimitive.Root>
  );
}
