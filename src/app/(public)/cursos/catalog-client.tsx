'use client';
import * as React from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { BookX, ChevronLeft, ChevronRight, Search, X } from 'lucide-react';
import { CourseCard, CourseCardSkeleton } from '@/components/courses/course-card';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { api } from '@/lib/api/client';
import type { Course } from '@/lib/api/types';
import { LEVEL_LABEL } from '@/lib/utils';

const SORTS = { popular: 'Mais populares', newest: 'Mais recentes', rating: 'Melhor avaliados', title: 'A–Z' } as const;
const ANY = '__any';
const CATEGORIES = ['Matemática', 'Ciências', 'Tecnologia', 'Línguas', 'Negócios', 'Artes'];
const LIMIT = 12;

export function CatalogClient() {
  const router = useRouter();
  const path = usePathname();
  const sp = useSearchParams();
  const get = (k: string) => sp.get(k) ?? '';
  const page = Math.max(1, Number(get('page')) || 1);
  const [text, setText] = React.useState(get('search'));

  const setParams = React.useCallback((patch: Record<string, string | null>) => {
    const next = new URLSearchParams(sp.toString());
    for (const [k, v] of Object.entries(patch)) { if (v) next.set(k, v); else next.delete(k); }
    if (!('page' in patch)) next.delete('page');
    router.replace(`${path}${next.size ? `?${next}` : ''}`, { scroll: false });
  }, [sp, router, path]);

  // pesquisa com debounce
  React.useEffect(() => {
    const t = setTimeout(() => { if (text !== get('search')) setParams({ search: text.trim() || null }); }, 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text]);

  const query = { search: get('search'), level: get('level'), category: get('category'), sort: get('sort') || 'popular', page, limit: LIMIT };
  const { data, isLoading, isError, isFetching, refetch } = useQuery({
    queryKey: ['courses', query],
    queryFn: ({ signal }) => api.page<Course>('/courses', query, signal),
    placeholderData: keepPreviousData,
  });
  const filtered = !!(get('search') || get('level') || get('category'));

  return (
    <div className="grid gap-8 lg:grid-cols-[250px_1fr]">
      <aside className="grid content-start gap-5 lg:sticky lg:top-24 lg:self-start" aria-label="Filtros">
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={text} onChange={(e) => setText(e.target.value)} placeholder="Pesquisar cursos…" className="pl-9" aria-label="Pesquisar cursos" />
        </div>
        <FilterSelect label="Categoria" value={get('category')} onChange={(v) => setParams({ category: v })} options={CATEGORIES.map((c) => [c, c])} anyLabel="Todas" />
        <FilterSelect label="Nível" value={get('level')} onChange={(v) => setParams({ level: v })} options={Object.entries(LEVEL_LABEL)} anyLabel="Todos" />
        <FilterSelect label="Ordenar por" value={query.sort} onChange={(v) => setParams({ sort: v === 'popular' ? null : v })} options={Object.entries(SORTS)} anyLabel={null} />
        {filtered && <Button variant="ghost" size="sm" onClick={() => { setText(''); router.replace(path, { scroll: false }); }}><X />Limpar filtros</Button>}
      </aside>

      <section aria-live="polite" aria-busy={isFetching}>
        {isError ? (
          <EmptyState icon={<BookX />} title="Não foi possível carregar os cursos" description="Verifique a ligação e tente novamente." action={<Button onClick={() => refetch()}>Tentar de novo</Button>} />
        ) : isLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">{Array.from({ length: 6 }, (_, i) => <CourseCardSkeleton key={i} />)}</div>
        ) : !data?.data.length ? (
          <EmptyState icon={<BookX />} title="Nenhum curso encontrado" description={filtered ? 'Experimente alargar a pesquisa ou remover filtros.' : 'Ainda não há cursos publicados.'} action={filtered ? <Button variant="outline" onClick={() => { setText(''); router.replace(path); }}>Limpar filtros</Button> : undefined} />
        ) : (
          <>
            <p className="mb-4 text-sm text-muted-foreground">{data.meta.total} {data.meta.total === 1 ? 'curso' : 'cursos'}</p>
            <div className={`grid gap-6 sm:grid-cols-2 xl:grid-cols-3 transition-opacity ${isFetching ? 'opacity-60' : ''}`}>{data.data.map((c) => <CourseCard key={c.courseId} course={c} />)}</div>
            {data.meta.totalPages > 1 && (
              <nav className="mt-10 flex items-center justify-center gap-3" aria-label="Paginação">
                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setParams({ page: String(page - 1) })}><ChevronLeft />Anterior</Button>
                <span className="text-sm text-muted-foreground">Página {page} de {data.meta.totalPages}</span>
                <Button variant="outline" size="sm" disabled={page >= data.meta.totalPages} onClick={() => setParams({ page: String(page + 1) })}>Seguinte<ChevronRight /></Button>
              </nav>
            )}
          </>
        )}
      </section>
    </div>
  );
}

function FilterSelect({ label, value, onChange, options, anyLabel }: { label: string; value: string; onChange: (v: string | null) => void; options: (readonly [string, string])[]; anyLabel: string | null }) {
  return (
    <div className="grid gap-1.5">
      <span className="text-sm font-medium">{label}</span>
      <Select value={value || (anyLabel ? ANY : options[0]![0])} onValueChange={(v) => onChange(v === ANY ? null : v)}>
        <SelectTrigger aria-label={label}><SelectValue /></SelectTrigger>
        <SelectContent>
          {anyLabel && <SelectItem value={ANY}>{anyLabel}</SelectItem>}
          {options.map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}
        </SelectContent>
      </Select>
    </div>
  );
}
