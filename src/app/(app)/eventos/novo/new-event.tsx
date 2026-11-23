'use client';
import { useRouter } from 'next/navigation';
import * as React from 'react';
import { EventForm } from '@/components/events/event-form';
import { PageHeader } from '@/components/layout/page-header';
import { useAuth } from '@/lib/auth/auth-provider';

export function NewEvent() {
  const { user } = useAuth(); const router = useRouter();
  const allowed = !!user && ['instructor', 'institution', 'admin'].includes(user.role);
  React.useEffect(() => { if (user && !allowed) router.replace('/eventos'); }, [user, allowed, router]);
  if (!allowed) return null;
  return (<><PageHeader title="Novo evento" description="Os seguidores e inscritos são avisados de alterações importantes." /><div className="max-w-2xl rounded-2xl border bg-card p-6"><EventForm onDone={(id) => router.replace(`/eventos/${id}`)} onCancel={() => router.back()} /></div></>);
}
