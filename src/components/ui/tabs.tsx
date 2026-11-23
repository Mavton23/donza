'use client';
import * as T from '@radix-ui/react-tabs';
import { cn } from '@/lib/utils';
export const Tabs = T.Root;
export const TabsList = ({ className, ...p }: React.ComponentProps<typeof T.List>) => <T.List className={cn('inline-flex h-10 items-center gap-1 rounded-xl bg-muted p-1', className)} {...p} />;
export const TabsTrigger = ({ className, ...p }: React.ComponentProps<typeof T.Trigger>) => <T.Trigger className={cn('inline-flex h-8 items-center justify-center gap-1.5 rounded-lg px-3.5 text-sm font-medium whitespace-nowrap text-muted-foreground transition-all outline-none data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm focus-visible:ring-[3px] focus-visible:ring-ring/40', className)} {...p} />;
export const TabsContent = ({ className, ...p }: React.ComponentProps<typeof T.Content>) => <T.Content className={cn('mt-4 outline-none', className)} {...p} />;
