'use client';
import { useQuery } from '@tanstack/react-query';
import * as React from 'react';
import { Trophy } from 'lucide-react';
import { Avatar } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { api } from '@/lib/api/client';
import { AchievementsDialog } from '@/components/groups/reports';
import { Button } from '@/components/ui/button';
import { MySanctions } from '@/components/groups/moderation';
import type { LeaderboardEntry, StudyGroup } from '@/lib/api/types';

export function Overview({ group }: { group: StudyGroup }) {
  const me = useQuery({ queryKey: ['group-me', group.groupId], queryFn: () => api.get<{ membershipId: string } | null>(`/study-groups/${group.groupId}/membership/me`) });
  const [ach, setAch] = React.useState(false);
  const board = useQuery({ queryKey: ['group-board', group.groupId], queryFn: () => api.get<{ members: LeaderboardEntry[] }>(`/study-groups/${group.groupId}/leaderboard`) });
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
      <div className="grid gap-6">
        {group.goals && <section className="rounded-2xl border bg-card p-5"><h2 className="mb-2 font-semibold">Objectivos</h2><p className="whitespace-pre-wrap text-sm text-muted-foreground">{group.goals}</p></section>}
        <MySanctions groupId={group.groupId} />
        {me.data && <section className="flex items-center justify-between gap-3 rounded-2xl border bg-card p-5"><div><h2 className="font-semibold">As minhas conquistas</h2><p className="text-sm text-muted-foreground">Veja o que já conquistou e o que falta.</p></div><Button variant="outline" onClick={() => setAch(true)}>Ver conquistas</Button></section>}
        {ach && me.data && <AchievementsDialog groupId={group.groupId} membershipId={me.data.membershipId} onClose={() => setAch(false)} />}
      </div>
      <aside className="rounded-2xl border bg-card p-5 h-fit"><h2 className="mb-3 flex items-center gap-2 font-semibold"><Trophy className="size-4 text-accent-foreground" /> Classificação</h2>
        {board.isLoading ? <Skeleton className="h-24" /> : <ol className="grid gap-2">{board.data?.members.map((m) => (
          <li key={m.userId} className="flex items-center gap-3 text-sm"><span className="w-5 text-right font-semibold tabular-nums text-muted-foreground">{m.rank}</span><Avatar src={m.avatarUrl} name={m.username} size={24} /><span className="min-w-0 flex-1 truncate">@{m.username}</span><span className="tabular-nums">{m.points} pts</span></li>))}</ol>}
      </aside>
    </div>
  );
}
