import { Suspense } from 'react';
import { Inbox } from './inbox';
export const metadata = { title: 'Mensagens' };
export default function Page() { return <Suspense><Inbox /></Suspense>; }
