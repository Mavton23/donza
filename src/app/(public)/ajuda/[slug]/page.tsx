import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronRight } from 'lucide-react';
import { ArticleFeedback } from '@/components/help/article-feedback';
import { RichText } from '@/components/help/rich-text';
import { serverGet } from '@/lib/api/server';
import type { HelpArticle } from '@/lib/api/types';
import { catLabel, formatDate } from '@/lib/utils';

type Props = { params: Promise<{ slug: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params; const r = await serverGet<HelpArticle>(`/help/articles/${slug}`);
  return r ? { title: r.data.title, description: r.data.excerpt ?? undefined } : { title: 'Artigo não encontrado' };
}
export default async function Page({ params }: Props) {
  const { slug } = await params; const r = await serverGet<HelpArticle>(`/help/articles/${slug}`, 300);
  if (!r) notFound();
  const a = r.data;
  return (
    <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <nav aria-label="Localização" className="mb-5 flex items-center gap-1.5 text-sm text-muted-foreground"><Link href="/ajuda" className="hover:text-foreground">Ajuda</Link><ChevronRight className="size-3.5" /><span>{catLabel(a.category)}</span></nav>
      <h1 className="text-3xl font-bold tracking-tight">{a.title}</h1>
      <p className="mt-2 text-sm text-muted-foreground">Actualizado em {formatDate(a.updatedAt)}</p>
      <div className="mt-8"><RichText text={a.content ?? ''} /></div>
      <ArticleFeedback articleId={a.articleId} />
      <p className="mt-6 text-center text-sm text-muted-foreground">Ainda precisa de ajuda? <Link href="/contacto" className="font-medium text-primary hover:underline">Contacte-nos</Link>.</p>
    </article>
  );
}
