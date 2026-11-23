'use client';
import * as A from '@radix-ui/react-accordion';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
export const Accordion = A.Root;
export const AccordionItem = ({ className, ...p }: React.ComponentProps<typeof A.Item>) => <A.Item className={cn('overflow-hidden rounded-xl border bg-card', className)} {...p} />;
export function AccordionTrigger({ className, children, ...p }: React.ComponentProps<typeof A.Trigger>) {
  return (
    <A.Header className="flex">
      <A.Trigger className={cn('group flex flex-1 items-center justify-between gap-3 px-4 py-3.5 text-left text-sm font-semibold outline-none hover:bg-muted/50 focus-visible:bg-muted/50', className)} {...p}>
        {children}<ChevronDown className="size-4 shrink-0 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180" />
      </A.Trigger>
    </A.Header>
  );
}
export const AccordionContent = ({ className, children, ...p }: React.ComponentProps<typeof A.Content>) => (
  <A.Content className="overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down" {...p}><div className={cn('border-t', className)}>{children}</div></A.Content>
);
