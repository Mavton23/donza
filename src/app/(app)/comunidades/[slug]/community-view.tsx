'use client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import * as React from 'react';
import { Lock, MessageSquarePlus, Search, Users } from 'lucide-react';
import { toast } from 'sonner';
import { ChatPanel } from '@/components/messages/chat-panel';
import { InvitesPanel, MembersPanel, RequestsPanel, RolesPanel, SettingsPanel } from '@/components/community/manage';
import { PostCard } from '@/components/community/post-parts';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { EmptyState } from '@/components/ui/empty-state';
import { Field } from '@/components/ui/field';
import { Input, Textarea } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TagInput } from '@/components/ui/tag-input';
import { ApiError, api } from '@/lib/api/client';
import type { Community, Post } from '@/lib/api/types';
import { useAuth } from '@/lib/auth/auth-provider';
import { POST_TYPE_LABEL } from '@/lib/utils';

const msg = (e: unknown) => (e instanceof ApiError ? e.message : 'Sem ligação ao servidor.');

export function CommunityView({ slug }: { slug: string }) {
  const qc = useQueryClient(); const { user } = useAuth();
  const c = useQuery({ queryKey: ['community', slug], queryFn: () => api.get<Community>(`/communities/${slug}`) });
  const [type, setType] = React.useState('all'); const [sort, setSort] = React.useState('newest'); const [search, setSearch] = React.useState(''); const [q, setQ] = React.useState('');
  React.useEffect(() => { const t = setTimeout(() => setQ(search.trim()), 300); return () => clearTimeout(t); }, [search]);
  const [compose, setCompose] = React.useState(false);
  const id = c.data?.communityId;
  const posts = useQuery({ queryKey: ['posts', id, type, sort, q], enabled: !!id && (c.data?.isPublic || c.data?.viewer.status === 'active'), queryFn: () => api.page<Post>(`/communities/${id}/posts`, { limit: 30, postType: type === 'all' ? undefined : type, sort, search: q || undefined }) });
  const refresh = () => { qc.invalidateQueries({ queryKey: ['community', slug] }); qc.invalidateQueries({ queryKey: ['communities'] }); qc.invalidateQueries({ queryKey: ['posts', id] }); };
  const join = useMutation({ mutationFn: () => api.post<{ status: string }>(`/communities/${id}/join`), onSuccess: (r) => { refresh(); toast.success(r?.status === 'pending' ? 'Pedido enviado. Aguarde aprovação.' : 'Bem-vindo à comunidade!'); }, onError: (e) => toast.error(msg(e)) });
  const leave = useMutation({ mutationFn: () => api.del(`/communities/${id}/membership`), onSuccess: () => { refresh(); toast.success('Saiu da comunidade'); }, onError: (e) => toast.error(msg(e)) });

  if (c.isLoading) return <div className="grid gap-4"><Skeleton className="h-32 rounded-2xl" /><Skeleton className="h-40 rounded-2xl" /></div>;
  if (c.isError || !c.data) return <EmptyState title="Comunidade não encontrada" description={c.error instanceof ApiError ? c.error.message : undefined} action={<Button asChild><Link href="/comunidades">Voltar</Link></Button>} />;
  const com = c.data; const active = com.viewer.status === 'active'; const pending = com.viewer.status === 'pending';
  const canSee = com.isPublic || active;
  const isCommunityAdmin = user?.role === 'admin' || com.viewer.role === 'admin';
  const canManage = isCommunityAdmin || com.viewer.role === 'moderator';
  return (
    <>
      <header className="mb-6 flex flex-wrap items-start gap-4 rounded-2xl border bg-card p-6">
        <div className="grid size-16 shrink-0 place-items-center overflow-hidden rounded-2xl bg-gradient-to-br from-primary/20 to-accent/30 text-2xl font-bold text-primary">{com.thumbnailImage ? <img src={com.thumbnailImage} alt="" className="size-full object-cover" /> : com.name.slice(0, 1).toUpperCase()}</div>
        <div className="min-w-0 flex-1">
          <h1 className="flex flex-wrap items-center gap-2 text-2xl font-bold tracking-tight">{com.name}{!com.isPublic && <Badge variant="outline"><Lock className="mr-1 size-3" />Privada</Badge>}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{com.description ?? com.shortDescription}</p>
          <p className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted-foreground"><span className="inline-flex items-center gap-1"><Users className="size-4" />{com.stats.members} {com.stats.members === 1 ? "membro" : "membros"}</span><span>{com.stats.posts} tópicos</span><span>por @{com.creator.username}</span></p>
          {!!com.tags.length && <div className="mt-3 flex flex-wrap gap-1.5">{com.tags.map((t) => <Badge key={t} variant="secondary">#{t}</Badge>)}</div>}
        </div>
        <div className="flex gap-2">
          {active ? (<><Button onClick={() => setCompose(true)}><MessageSquarePlus /> Novo tópico</Button><Button variant="outline" loading={leave.isPending} onClick={() => leave.mutate()}>Sair</Button></>)
            : pending ? <Badge variant="secondary">Pedido pendente</Badge>
            : com.membershipType === 'invite_only' ? <Badge variant="outline">Só por convite</Badge>
            : <Button loading={join.isPending} onClick={() => join.mutate()}>{com.membershipType === 'approval' ? 'Pedir para entrar' : 'Entrar'}</Button>}
        </div>
      </header>

      {!canSee ? <EmptyState icon={<Lock />} title="Comunidade privada" description="Entre para ver os tópicos." />
        : (<Tabs defaultValue="posts">
          <TabsList className="mb-5"><TabsTrigger value="posts">Publicações</TabsTrigger><TabsTrigger value="members">Membros</TabsTrigger>{active && <TabsTrigger value="chat">Chat</TabsTrigger>}{canManage && <TabsTrigger value="manage">Gestão</TabsTrigger>}</TabsList>
          <TabsContent value="posts">
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <Select value={type} onValueChange={setType}><SelectTrigger className="w-44" aria-label="Tipo"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Todos os tipos</SelectItem>{Object.entries(POST_TYPE_LABEL).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent></Select>
            <Select value={sort} onValueChange={setSort}><SelectTrigger className="w-44" aria-label="Ordenar"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="newest">Mais recentes</SelectItem><SelectItem value="mostCommented">Mais comentados</SelectItem><SelectItem value="topRated">Mais bem avaliados</SelectItem></SelectContent></Select>
            <div className="relative ml-auto w-full max-w-60"><Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" /><Input className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Procurar tópicos…" aria-label="Procurar tópicos" /></div>
          </div>
          {posts.isLoading ? <div className="grid gap-3">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-28 rounded-2xl" />)}</div>
            : !posts.data?.data.length ? <EmptyState icon={<MessageSquarePlus />} title="Ainda sem tópicos" description={active ? 'Seja o primeiro a escrever.' : 'Entre na comunidade para começar a conversa.'} action={active ? <Button onClick={() => setCompose(true)}>Novo tópico</Button> : undefined} />
            : <div className="grid gap-3">{posts.data.data.map((p) => <PostCard key={p.postId} post={p} slug={com.slug} />)}</div>}
          </TabsContent>
          {active && <TabsContent value="chat"><div className="h-[28rem] overflow-hidden rounded-2xl border bg-card"><ChatPanel basePath={`/communities/${com.communityId}/messages`} readPath={`/communities/${com.communityId}/messages/read`} /></div></TabsContent>}
          <TabsContent value="members"><MembersPanel community={com} canManage={canManage} /></TabsContent>
          {canManage && <TabsContent value="manage"><ManagePanel community={com} isAdmin={isCommunityAdmin} /></TabsContent>}
        </Tabs>)}
      {compose && <ComposeDialog communityId={com.communityId} onClose={() => setCompose(false)} onDone={refresh} />}
    </>
  );
}

function ComposeDialog({ communityId, onClose, onDone }: { communityId: string; onClose: () => void; onDone: () => void }) {
  const [title, setTitle] = React.useState(''); const [content, setContent] = React.useState(''); const [type, setType] = React.useState('discussion'); const [tags, setTags] = React.useState<string[]>([]);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const save = useMutation({
    mutationFn: () => {
      const e: Record<string, string> = {};
      if (title.trim().length < 3) e.title = 'Mínimo de 3 caracteres';
      if (!content.trim()) e.content = 'Escreva o conteúdo';
      if (Object.keys(e).length) { setErrors(e); throw new Error('v'); }
      return api.post(`/communities/${communityId}/posts`, { title: title.trim(), content: content.trim(), postType: type, tags });
    },
    onSuccess: () => { onDone(); toast.success('Tópico publicado'); onClose(); },
    onError: (e) => { if (e instanceof ApiError) { if (Object.keys(e.fieldErrors).length) setErrors(e.fieldErrors); else toast.error(e.message); } },
  });
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}><DialogContent className="max-h-[90dvh] max-w-xl overflow-y-auto">
      <DialogHeader><DialogTitle>Novo tópico</DialogTitle><DialogDescription>Seja claro e respeitador. As regras da comunidade aplicam-se.</DialogDescription></DialogHeader>
      <form className="grid gap-4" noValidate onSubmit={(e) => { e.preventDefault(); save.mutate(); }}>
        <Field label="Tipo"><Select value={type} onValueChange={setType}><SelectTrigger aria-label="Tipo de tópico"><SelectValue /></SelectTrigger><SelectContent>{Object.entries(POST_TYPE_LABEL).filter(([k]) => k !== 'announcement' && k !== 'assignment').map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent></Select></Field>
        <Field label="Título" htmlFor="p-title" error={errors.title}><Input id="p-title" autoFocus value={title} onChange={(e) => setTitle(e.target.value)} /></Field>
        <Field label="Conteúdo" htmlFor="p-content" error={errors.content}><Textarea id="p-content" rows={7} value={content} onChange={(e) => setContent(e.target.value)} /></Field>
        <div className="grid gap-1.5"><span className="text-sm font-medium">Tags</span><TagInput label="Tag" value={tags} onChange={setTags} max={10} placeholder="Opcional" /></div>
        <DialogFooter><Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button><Button type="submit" loading={save.isPending}>Publicar</Button></DialogFooter>
      </form>
    </DialogContent></Dialog>
  );
}

function ManagePanel({ community, isAdmin }: { community: Community; isAdmin: boolean }) {
  return (
    <Tabs defaultValue="requests">
      <TabsList className="mb-5"><TabsTrigger value="requests">Pedidos</TabsTrigger><TabsTrigger value="invites">Convites</TabsTrigger>{isAdmin && <TabsTrigger value="roles">Papéis</TabsTrigger>}{isAdmin && <TabsTrigger value="settings">Definições</TabsTrigger>}</TabsList>
      <TabsContent value="requests"><RequestsPanel community={community} /></TabsContent>
      <TabsContent value="invites"><InvitesPanel community={community} /></TabsContent>
      {isAdmin && <TabsContent value="roles"><RolesPanel community={community} /></TabsContent>}
      {isAdmin && <TabsContent value="settings"><SettingsPanel community={community} /></TabsContent>}
    </Tabs>
  );
}
