'use client';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { CourseForm } from '@/components/courses/course-form';
import { PageHeader } from '@/components/layout/page-header';
import { useAuth } from '@/lib/auth/auth-provider';

export function NewCourse() {
  const { user } = useAuth();
  const router = useRouter();
  const allowed = user && ['instructor', 'institution', 'admin'].includes(user.role);
  useEffect(() => { if (user && !allowed) router.replace('/painel'); }, [user, allowed, router]);
  if (!allowed) return null;
  return (<><PageHeader title="Novo curso" description="Comece pelo essencial. Pode editar tudo depois e só publica quando estiver pronto." /><CourseForm /></>);
}
