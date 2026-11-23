import type { Metadata } from 'next';
import { Suspense } from 'react';
import { ResetForm } from './reset-form';

export const metadata: Metadata = { title: 'Nova palavra-passe' };
export default function ResetPage() { return <Suspense><ResetForm /></Suspense>; }
