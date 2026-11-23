import { EventView } from './event-view';
export default async function Page({ params }: { params: Promise<{ eventId: string }> }) { const { eventId } = await params; return <EventView eventId={eventId} />; }
