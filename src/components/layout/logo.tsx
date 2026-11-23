import Link from 'next/link';
import { cn } from '@/lib/utils';

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={cn('size-8', className)} aria-hidden>
      <rect width="32" height="32" rx="9" className="fill-primary" />
      <path d="M10 9.5h6.2c4.2 0 6.8 2.6 6.8 6.5s-2.6 6.5-6.8 6.5H10v-13Z" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinejoin="round" className="text-primary-foreground" />
      <circle cx="22.5" cy="9.5" r="2.6" className="fill-accent" />
    </svg>
  );
}
export function Logo({ href = '/', className, light }: { href?: string; className?: string; light?: boolean }) {
  return (
    <Link href={href} className={cn('inline-flex items-center gap-2.5 font-semibold tracking-tight', light && 'text-white', className)} aria-label="Donza — página inicial">
      <LogoMark /><span className="text-xl">Donza</span>
    </Link>
  );
}
