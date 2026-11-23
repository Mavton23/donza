'use client';
import * as React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { AppShell } from '@/components/layout/app-shell';
import { useAuth } from '@/lib/auth/auth-provider';

/** Guarda de sessão do lado do cliente (o access token só existe em memória). */
export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { status, explicitLogout } = useAuth();
  const router = useRouter();
  const path = usePathname();
  React.useEffect(() => { if (status === 'anonymous' && !explicitLogout) router.replace(`/entrar?next=${encodeURIComponent(path)}`); }, [status, explicitLogout, path, router]);
  if (status !== 'authenticated') return <div className="grid min-h-dvh place-items-center" role="status" aria-label="A carregar"><Loader2 className="size-8 animate-spin text-primary" /></div>;
  return <AppShell>{children}</AppShell>;
}
