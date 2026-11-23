import { cn } from '@/lib/utils';
export const Separator = ({ className, ...p }: React.ComponentProps<'hr'>) => <hr className={cn('border-0 border-t border-border', className)} {...p} />;
