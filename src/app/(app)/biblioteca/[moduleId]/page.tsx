import { LibraryModule } from './library-module';
export const metadata = { title: 'Módulo da biblioteca' };
export default async function Page({ params }: { params: Promise<{ moduleId: string }> }) { const { moduleId } = await params; return <LibraryModule moduleId={moduleId} />; }
