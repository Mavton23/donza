'use client';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import * as React from 'react';
import { ArrowRight, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { api } from '@/lib/api/client';
import type { HelpArticle, HelpCategory } from '@/lib/api/types';
import { catLabel, cn } from '@/lib/utils';

function ArticleRow({ a }: { a: HelpArticle }) {
  return <li><Link href={`/ajuda/${a.slug}`} className="group flex items-start gap-3 rounded-xl border bg-card p-4 transition hover:border-primary/40"><div className="min-w-0 flex-1"><p className="font-medium group-hover:text-primary">{a.title}</p>{a.excerpt && <p className="mt-0.5 line-clamp-2 text-sm text-muted-foreground">{a.excerpt}</p>}<p className="mt-1 text-xs text-muted-foreground">{catLabel(a.category)}</p></div><ArrowRight className="mt-1 size-4 shrink-0 text-muted-foreground transition group-hover:translate-x-0.5" /></Link></li>;
}

export function HelpCenter() {
  const [q, setQ] = React.useState(''); const [term, setTerm] = React.useState(''); const [cat, setCat] = React.useState(''); const [page, setPage] = React.useState(1);
  React.useEffect(() => { const t = setTimeout(() => setTerm(q.trim()), 300); return () => clearTimeout(t); }, [q]);
  const cats = useQuery({ queryKey: ['help-cats'], queryFn: () => api.get<HelpCategory[]>('/help/categories') });
  const popular = useQuery({ queryKey: ['help-popular'], queryFn: () => api.get<HelpArticle[]>('/help/popular-topics?limit=5') });
  const searching = term.length >= 2;
  const search = useQuery({ queryKey: ['help-search', term], enabled: searching, queryFn: () => api.get<HelpArticle[]>(`/help/search?q=${encodeURIComponent(term)}&limit=20`) });
  const list = useQuery({ queryKey: ['help-list', cat, page], enabled: !searching && !!cat, queryFn: () => api.page<HelpArticle>('/help/articles', { category: cat, page, limit: 10 }) });
  return (
    <div>
      <div className="relative mx-auto max-w-xl"><Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" /><Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Como podemos ajudar?" aria-label="Pesquisar na ajuda" className="h-12 rounded-2xl pl-12 text-base" /></div>
      {searching ? (
        <section aria-live="polite" aria-labelledby="res-h" className="mt-8"><h2 id="res-h" className="mb-3 font-semibold">Resultados para «{term}»</h2>
          {search.isLoading ? <Skeleton className="h-24 rounded-xl" /> : !search.data?.length ? <p className="rounded-xl border bg-card p-5 text-sm text-muted-foreground">Nenhum artigo encontrado. <Link href="/contacto" className="font-medium text-primary hover:underline">Fale connosco</Link>.</p> : <ul className="grid gap-2">{search.data.map((a) => <ArticleRow key={a.articleId} a={a} />)}</ul>}</section>
      ) : (
        <>
          <section aria-labelledby="cat-h" className="mt-8"><h2 id="cat-h" className="mb-3 font-semibold">Categorias</h2>
            {cats.isLoading ? <Skeleton className="h-20 rounded-xl" /> : <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{cats.data?.map((c) => (
              <li key={c.id}><button type="button" aria-pressed={cat === c.name} onClick={() => { setCat(cat === c.name ? '' : c.name); setPage(1); }} className={cn('h-full w-full rounded-2xl border bg-card p-4 text-left transition hover:border-primary/40 focus-visible:ring-[3px] focus-visible:ring-ring/40 focus-visible:outline-none', cat === c.name && 'border-primary bg-primary/5')}>
                <p className="font-semibold">{catLabel(c.name)}</p>{c.description && <p className="mt-0.5 text-sm text-muted-foreground">{c.description}</p>}<p className="mt-2 text-xs text-muted-foreground">{c.articleCount} artigo{c.articleCount === 1 ? '' : 's'}</p></button></li>))}</ul>}
          </section>
          {cat ? (
            <section aria-labelledby="art-h" className="mt-8"><h2 id="art-h" className="mb-3 font-semibold">{catLabel(cat)}</h2>
              {list.isLoading ? <Skeleton className="h-24 rounded-xl" /> : !list.data?.data.length ? <p className="text-sm text-muted-foreground">Ainda sem artigos nesta categoria.</p> : <ul className="grid gap-2">{list.data.data.map((a) => <ArticleRow key={a.articleId} a={a} />)}</ul>}
              {(list.data?.meta.totalPages ?? 1) > 1 && <div className="mt-4 flex items-center justify-center gap-2"><Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>Anterior</Button><span className="text-sm text-muted-foreground">{page} / {list.data?.meta.totalPages}</span><Button variant="outline" size="sm" disabled={page >= (list.data?.meta.totalPages ?? 1)} onClick={() => setPage(page + 1)}>Seguinte</Button></div>}
            </section>
          ) : !!popular.data?.length && (
            <section aria-labelledby="pop-h" className="mt-8"><h2 id="pop-h" className="mb-3 font-semibold">Temas populares</h2><ul className="grid gap-2">{popular.data.map((a) => <ArticleRow key={a.articleId} a={a} />)}</ul></section>)}
        </>)}
      <p className="mt-10 rounded-2xl bg-secondary/50 p-5 text-center text-sm">Não encontrou o que procurava? <Link href="/contacto" className="font-medium text-primary hover:underline">Contacte a nossa equipa</Link>.</p>
    </div>
  );
}
