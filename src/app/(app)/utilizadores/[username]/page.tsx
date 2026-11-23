import type { Metadata } from 'next';
import { ProfileView } from './profile-view';

export const metadata: Metadata = { title: 'Perfil' };
export default async function Page({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  return <ProfileView username={decodeURIComponent(username)} />;
}
