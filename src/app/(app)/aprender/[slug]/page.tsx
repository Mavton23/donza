import type { Metadata } from 'next';
import { Suspense } from 'react';
import { Player } from './player';

export const metadata: Metadata = { title: 'A aprender' };
export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <Suspense><Player slug={slug} /></Suspense>;
}
