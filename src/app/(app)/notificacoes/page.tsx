import type { Metadata } from 'next';
import { NotificationsView } from './notifications-view';

export const metadata: Metadata = { title: 'Notificações' };
export default function Page() { return <NotificationsView />; }
