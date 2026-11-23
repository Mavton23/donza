'use client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import * as React from 'react';
import { ArrowLeft, Check, Reply, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { ReactionBar } from '@/components/community/post-parts';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { EmptyState } from '@/components/ui/empty-state';
import { Textarea } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { ApiError, api } from '@/lib/api/client';
import type { Community, Post, PostComment, ReactionType } from '@/lib/api/types';
import { useAuth } from '@/lib/auth/auth-provider';
import { POST_TYPE_LABEL, timeAgo } from '@/lib/utils';

const msg = (e: unknown) => (e instanceof ApiError ? e.message : 'Sem ligação ao servidor.');

export function PostView({ slug, postId }: { slug: string; postId: string }) {
  const { user } = useAuth(); const qc = useQueryClient(); const router = useRouter();
  const c = useQuery({ queryKey: ['community', slug], queryFn: () => api.get<Community>(`/communities/${slug}`) });
  const cid = c.data?.communityId;
  const post = useQuery({ queryKey: ['post', cid, postId], enabled: !!cid, queryFn: () => api.get<Post>(`/communities/${cid}/posts/${postId}`) });
  const comments = useQuery({ queryKey: ['comments', cid, postId], enabled: !!cid, queryFn: () => api.page<PostComment>(`/communities/${cid}/posts/${postId}/comments`, { limit: 50 }) });
  const [del, setDel] = React.useState(false);
  const react = useMutation({
    mutationFn: (t: ReactionType) => (post.data?.viewer?.reaction === t ? api.del(`/communities/${cid}/posts/${postId}/reaction`) : api.put(`/communities/${cid}/posts/${postId}/reaction`, { type: t })),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['post', cid, postId] }), onError: (e) => toast.error(msg(e)),
  });
  const remove = useMutation({ mutationFn: () => api.del(`/communities/${cid}/posts/${postId}`), onSuccess: () => { qc.invalidateQueries({ queryKey: ['posts'] }); toast.success('Tópico eliminado'); router.replace(`/comunidades/${slug}`); }, onError: (e) => { setDel(false); toast.error(msg(e)); } });

  if (c.isLoading || post.isLoading) return <Skeleton className="h-72 rounded-2xl" />;
  if (c.isError || post.isError || !post.data) return <EmptyState title="Tópico não encontrado" description={post.error instanceof ApiError ? post.error.message : undefined} action={<Button asChild><Link href={`/comunidades/${slug}`}>Voltar à comunidade</Link></Button>} />;
  const p = post.data; const v = p.viewer;
  const refreshAll = () => { qc.invalidateQueries({ queryKey: ['comments', cid, postId] }); qc.invalidateQueries({ queryKey: ['post', cid, postId] }); };
  return (
    <div className="mx-auto max-w-3xl">
      <Button asChild variant="ghost" size="sm" className="mb-3 -ml-2"><Link href={`/comunidades/${slug}`}><ArrowLeft /> {c.data?.name}</Link></Button>
      <article className="rounded-2xl border bg-card p-6">
        <div className="mb-3 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <Avatar src={p.author.avatarUrl} name={p.author.username} size={28} /><Link href={`/utilizadores/${p.author.username}`} className="font-medium text-foreground hover:underline">@{p.author.username}</Link><span>· {timeAgo(p.createdAt)}</span>
          <Badge variant="secondary" className="ml-auto">{POST_TYPE_LABEL[p.postType]}</Badge>
          {(v?.canEdit || v?.canModerate) && <Button variant="ghost" size="icon-sm" aria-label="Eliminar tópico" onClick={() => setDel(true)}><Trash2 /></Button>}
        </div>
        <h1 className="text-2xl font-bold tracking-tight">{p.title}</h1>
        {/* O conteúdo pode vir de outros clientes como HTML: mostra-se sempre como texto simples. */}
        <p className="mt-4 whitespace-pre-wrap break-words leading-relaxed">{p.content}</p>
        {!!p.tags.length && <div className="mt-4 flex flex-wrap gap-1.5">{p.tags.map((t) => <Badge key={t} variant="outline">#{t}</Badge>)}</div>}
        <div className="mt-5 border-t pt-4"><ReactionBar stats={p.stats} mine={v?.reaction} disabled={react.isPending} onPick={(t) => react.mutate(t)} /></div>
      </article>

      <section className="mt-6" aria-labelledby="comments-h">
        <h2 id="comments-h" className="mb-3 text-lg font-semibold">{p.stats.commentCount} comentário(s)</h2>
        {v?.canComment ? <CommentForm cid={cid!} postId={postId} onDone={refreshAll} /> : <p className="mb-4 rounded-xl bg-muted/50 p-3 text-sm text-muted-foreground">{p.isLocked ? 'Os comentários estão fechados.' : 'Entre na comunidade para comentar.'}</p>}
        <ul className="mt-4 grid gap-4">
          {comments.data?.data.map((cm) => <CommentItem key={cm.commentId} cm={cm} cid={cid!} post={p} me={user?.userId} canModerate={!!v?.canModerate} canComment={!!v?.canComment} onChange={refreshAll} />)}
        </ul>
      </section>

      <Dialog open={del} onOpenChange={setDel}><DialogContent><DialogHeader><DialogTitle>Eliminar este tópico?</DialogTitle><DialogDescription>Os comentários também deixam de ser visíveis.</DialogDescription></DialogHeader><DialogFooter><Button variant="ghost" onClick={() => setDel(false)}>Cancelar</Button><Button variant="destructive" loading={remove.isPending} onClick={() => remove.mutate()}>Eliminar</Button></DialogFooter></DialogContent></Dialog>
    </div>
  );
}

function CommentForm({ cid, postId, parent, onDone, onCancel }: { cid: string; postId: string; parent?: string; onDone: () => void; onCancel?: () => void }) {
  const [text, setText] = React.useState('');
  const send = useMutation({
    mutationFn: () => api.post(`/communities/${cid}/posts/${postId}/comments`, { content: text.trim(), parentCommentId: parent }),
    onSuccess: () => { setText(''); onDone(); onCancel?.(); }, onError: (e) => toast.error(msg(e)),
  });
  return (
    <form className="grid gap-2" onSubmit={(e) => { e.preventDefault(); if (text.trim()) send.mutate(); }}>
      <Textarea rows={parent ? 2 : 3} value={text} maxLength={1000} onChange={(e) => setText(e.target.value)} placeholder={parent ? 'Escreva uma resposta…' : 'Escreva um comentário…'} aria-label={parent ? 'Resposta' : 'Comentário'} />
      <div className="flex gap-2"><Button type="submit" size="sm" disabled={!text.trim()} loading={send.isPending}>{parent ? 'Responder' : 'Comentar'}</Button>{onCancel && <Button type="button" size="sm" variant="ghost" onClick={onCancel}>Cancelar</Button>}</div>
    </form>
  );
}

function CommentItem({ cm, cid, post, me, canModerate, canComment, onChange, nested }: { cm: PostComment; cid: string; post: Post; me?: string; canModerate: boolean; canComment: boolean; onChange: () => void; nested?: boolean }) {
  const [replying, setReplying] = React.useState(false);
  const remove = useMutation({ mutationFn: () => api.del(`/communities/${cid}/posts/${post.postId}/comments/${cm.commentId}`), onSuccess: () => { toast.success('Comentário eliminado'); onChange(); }, onError: (e) => toast.error(msg(e)) });
  const accept = useMutation({ mutationFn: () => api.patch(`/communities/${cid}/posts/${post.postId}/comments/${cm.commentId}`, { isAnswer: !cm.isAnswer }), onSuccess: onChange, onError: (e) => toast.error(msg(e)) });
  const mine = me === cm.author.userId;
  return (
    <li className={nested ? 'ml-8' : undefined}>
      <div className={`rounded-xl border p-4 ${cm.isAnswer ? 'border-success/50 bg-success/5' : 'bg-card'}`}>
        <div className="mb-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground"><Avatar src={cm.author.avatarUrl} name={cm.author.username} size={22} /><span className="font-medium text-foreground">@{cm.author.username}</span><span>· {timeAgo(cm.createdAt)}</span>{cm.isAnswer && <Badge variant="success"><Check className="mr-1 size-3" />Resposta aceite</Badge>}</div>
        <p className="whitespace-pre-wrap break-words text-sm">{cm.content}</p>
        <div className="mt-2 flex flex-wrap gap-1">
          {canComment && !nested && !post.isLocked && <Button variant="ghost" size="sm" onClick={() => setReplying(!replying)}><Reply /> Responder</Button>}
          {post.postType === 'question' && (post.authorId === me || canModerate) && !nested && <Button variant="ghost" size="sm" loading={accept.isPending} onClick={() => accept.mutate()}><Check /> {cm.isAnswer ? 'Desmarcar resposta' : 'Aceitar resposta'}</Button>}
          {(mine || canModerate) && <Button variant="ghost" size="sm" loading={remove.isPending} onClick={() => remove.mutate()}><Trash2 /> Eliminar</Button>}
        </div>
      </div>
      {replying && <div className="mt-2 ml-8"><CommentForm cid={cid} postId={post.postId} parent={cm.commentId} onDone={onChange} onCancel={() => setReplying(false)} /></div>}
      {!!cm.replies?.length && <ul className="mt-2 grid gap-2">{cm.replies.map((r) => <CommentItem key={r.commentId} cm={r} cid={cid} post={post} me={me} canModerate={canModerate} canComment={canComment} onChange={onChange} nested />)}</ul>}
    </li>
  );
}
