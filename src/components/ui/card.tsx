import * as React from 'react';
import { cn } from '@/lib/utils';

export const Card = ({ className, ...p }: React.ComponentProps<'div'>) => <div className={cn('rounded-xl border bg-card text-card-foreground shadow-[var(--shadow-soft)]', className)} {...p} />;
export const CardHeader = ({ className, ...p }: React.ComponentProps<'div'>) => <div className={cn('flex flex-col gap-1.5 p-5 pb-3', className)} {...p} />;
export const CardTitle = ({ className, ...p }: React.ComponentProps<'h3'>) => <h3 className={cn('text-base font-semibold leading-tight', className)} {...p} />;
export const CardDescription = ({ className, ...p }: React.ComponentProps<'p'>) => <p className={cn('text-sm text-muted-foreground', className)} {...p} />;
export const CardContent = ({ className, ...p }: React.ComponentProps<'div'>) => <div className={cn('p-5 pt-2', className)} {...p} />;
export const CardFooter = ({ className, ...p }: React.ComponentProps<'div'>) => <div className={cn('flex items-center p-5 pt-0', className)} {...p} />;
