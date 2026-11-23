import { PostView } from './post-view';
export default async function Page({ params }: { params: Promise<{ slug: string; postId: string }> }) { const { slug, postId } = await params; return <PostView slug={slug} postId={postId} />; }
