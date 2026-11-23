import type { Metadata } from 'next';
import { ForgotForm } from './forgot-form';

export const metadata: Metadata = { title: 'Recuperar palavra-passe' };
export default function ForgotPage() { return <ForgotForm />; }
