'use client';
import Link from 'next/link';
import { MessageSquare, Pin, Lock } from 'lucide-react';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn, POST_TYPE_LABEL, REACTIONS, timeAgo } from '@/lib/utils';
import type { Post, PostStats, ReactionType } from '@/lib/api/types';

export function PostCard({ post, slug }: { post: Post; slug: string }) {
  const top = REACTIONS.filter((r) => post.stats.reactions[r.type] > 0).sort((a, b) => post.stats.reactions[b.type] - post.stats.reactions[a.type]).slice(0, 3);
  return (
    <article className="rounded-2xl border bg-card p-5 transition hover:shadow-sm">
      <div className="mb-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <Avatar src={post.author.avatarUrl} name={post.author.fullName ?? post.author.username} size={24} />
        <span className="font-medium text-foreground">@{post.author.username}</span><span>· {timeAgo(post.createdAt)}</span>
        <Badge variant={post.postType === 'announcement' ? 'default' : 'secondary'} className="ml-auto">{POST_TYPE_LABEL[post.postType]}</Badge>
        {post.isPinned && <Pin className="size-3.5" aria-label="Fixado" />}{post.isLocked && <Lock className="size-3.5" aria-label="Comentários fechados" />}
      </div>
      <h3 className="text-lg font-semibold leading-snug"><Link href={`/comunidades/${slug}/${post.postId}`} className="hover:underline">{post.title}</Link></h3>
      {post.excerpt && <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{post.excerpt}</p>}
      {!!post.tags.length && <div className="mt-2 flex flex-wrap gap-1.5">{post.tags.map((t) => <Badge key={t} variant="outline">#{t}</Badge>)}</div>}
      <div className="mt-3 flex items-center gap-3 text-sm text-muted-foreground">
        <span className="inline-flex items-center gap-1" aria-label={`${post.stats.reactionsTotal} reacções`}>{top.map((r) => <span key={r.type}>{r.emoji}</span>)}{post.stats.reactionsTotal}</span>
        <span className="inline-flex items-center gap-1"><MessageSquare className="size-4" />{post.stats.commentCount}</span>
      </div>
    </article>
  );
}

export function ReactionBar({ stats, mine, disabled, onPick }: { stats: PostStats; mine: ReactionType | null | undefined; disabled?: boolean; onPick: (t: ReactionType) => void }) {
  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="Reacções">
      {REACTIONS.map((r) => (
        <button key={r.type} type="button" disabled={disabled} aria-pressed={mine === r.type} title={r.label} onClick={() => onPick(r.type)}
          className={cn('inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm transition hover:bg-muted disabled:opacity-50', mine === r.type && 'border-primary bg-primary/10 font-medium')}>
          <span aria-hidden>{r.emoji}</span><span className="sr-only">{r.label}</span><span className="tabular-nums">{stats.reactions[r.type]}</span>
        </button>))}
    </div>
  );
}
