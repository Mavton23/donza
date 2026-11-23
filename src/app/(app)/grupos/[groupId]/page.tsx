import { GroupView } from './group-view';
export default async function Page({ params }: { params: Promise<{ groupId: string }> }) { const { groupId } = await params; return <GroupView groupId={groupId} />; }
