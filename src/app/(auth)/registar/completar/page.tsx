import type { Metadata } from 'next';
import { Suspense } from 'react';
import { CompleteForm } from './complete-form';

export const metadata: Metadata = { title: 'Completar registo' };
export default function CompletePage() { return <Suspense><CompleteForm /></Suspense>; }
