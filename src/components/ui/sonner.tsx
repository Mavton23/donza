'use client';
import { Toaster as Sonner } from 'sonner';
import { useTheme } from 'next-themes';
export function Toaster() {
  const { resolvedTheme } = useTheme();
  return <Sonner theme={(resolvedTheme as 'light' | 'dark') ?? 'light'} position="top-center" richColors closeButton toastOptions={{ classNames: { toast: '!rounded-xl !shadow-xl' } }} />;
}
