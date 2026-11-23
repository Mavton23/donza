import Link from 'next/link';
import { ArrowRight, Award, BookOpenCheck, CalendarDays, Check, GraduationCap, MessagesSquare, Search, Sparkles, Users } from 'lucide-react';
import { CourseCard } from '@/components/courses/course-card';
import { TestimonialCard } from '@/components/help/testimonial-card';
import { Button } from '@/components/ui/button';
import { serverGet } from '@/lib/api/server';
import type { Course, PublicStats, Testimonial } from '@/lib/api/types';

export const revalidate = 60;

const nf = new Intl.NumberFormat('pt-PT');

export default async function HomePage() {
  const [featured, latest, stats, quotes] = await Promise.all([
    serverGet<Course[]>('/courses/featured?limit=6&minRating=0'),
    serverGet<Course[]>('/courses?limit=6&sort=popular'),
    serverGet<PublicStats>('/public/stats', 300),
    serverGet<Testimonial[]>('/testimonials/featured?limit=3', 60),
  ]);
  const courses = (featured?.data?.length ? featured.data : latest?.data ?? []).slice(0, 6);
  const s = stats?.data;

  return (
    <>
      {/* Hero */}
      <section className="relative isolate overflow-hidden border-b">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(60%_50%_at_75%_0%,color-mix(in_oklch,var(--primary)_14%,transparent),transparent),radial-gradient(40%_40%_at_0%_100%,color-mix(in_oklch,var(--accent)_16%,transparent),transparent)]" />
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 md:py-24 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1 text-xs font-medium text-muted-foreground shadow-xs"><Sparkles className="size-3.5 text-accent" />Ensino online para Moçambique e além</span>
            <h1 className="mt-5 text-4xl leading-[1.08] font-bold sm:text-5xl lg:text-6xl">Aprenda no seu ritmo.<br /><span className="text-primary">Ensine com impacto.</span></h1>
            <p className="mt-5 max-w-xl text-lg text-muted-foreground">Cursos de instrutores e instituições verificadas, comunidades de estudo, eventos ao vivo e certificados que pode partilhar com qualquer empregador.</p>
            <form action="/cursos" className="mt-8 flex max-w-xl gap-2 rounded-2xl border bg-card p-2 shadow-[var(--shadow-soft)]" role="search">
              <label htmlFor="hero-search" className="sr-only">Pesquisar cursos</label>
              <Search className="my-auto ml-3 size-5 shrink-0 text-muted-foreground" />
              <input id="hero-search" name="search" placeholder="O que quer aprender hoje?" className="min-w-0 flex-1 bg-transparent px-1 text-base outline-none placeholder:text-muted-foreground/70" />
              <Button type="submit" size="lg" className="shrink-0">Pesquisar</Button>
            </form>
            <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
              {['Cursos gratuitos e pagos', 'Pagamento por M-Pesa e e-Mola', 'Certificados verificáveis'].map((t) => <li key={t} className="inline-flex items-center gap-1.5"><Check className="size-4 text-success" />{t}</li>)}
            </ul>
          </div>
          <HeroVisual />
        </div>
      </section>

      {/* Números */}
      {s && (
        <section aria-label="A Donza em números" className="border-b bg-card">
          <dl className="mx-auto grid max-w-7xl grid-cols-2 gap-y-6 px-4 py-8 sm:px-6 md:grid-cols-4">
            {([['Cursos publicados', s.courses], ['Alunos', s.students], ['Instrutores', s.instructors], ['Certificados emitidos', s.certificatesIssued]] as const).map(([l, v]) => (
              <div key={l} className="text-center"><dd className="text-3xl font-bold tracking-tight text-primary">{nf.format(v)}</dd><dt className="mt-1 text-sm text-muted-foreground">{l}</dt></div>
            ))}
          </dl>
        </section>
      )}

      {/* Cursos em destaque */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="flex items-end justify-between gap-4">
          <div><h2 className="text-2xl font-bold sm:text-3xl">Cursos em destaque</h2><p className="mt-2 text-muted-foreground">Os mais procurados pelos nossos alunos.</p></div>
          <Button asChild variant="ghost" className="hidden sm:inline-flex"><Link href="/cursos">Ver todos <ArrowRight /></Link></Button>
        </div>
        {courses.length ? (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{courses.map((c) => <CourseCard key={c.courseId} course={c} />)}</div>
        ) : (
          <p className="mt-8 rounded-2xl border border-dashed p-10 text-center text-muted-foreground">Os primeiros cursos estão a caminho.</p>
        )}
        <Button asChild variant="outline" className="mt-8 w-full sm:hidden"><Link href="/cursos">Ver todos os cursos</Link></Button>
      </section>

      {/* Como funciona */}
      <section id="como-funciona" className="scroll-mt-20 border-y bg-secondary/40">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
          <h2 className="text-center text-2xl font-bold sm:text-3xl">Tudo o que precisa para aprender</h2>
          <p className="mx-auto mt-2 max-w-xl text-center text-muted-foreground">Uma plataforma completa, do primeiro vídeo ao certificado final.</p>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[
              [BookOpenCheck, 'Aprenda ao seu ritmo', 'Aulas em vídeo, áudio, PDF e texto, com progresso guardado automaticamente.'],
              [Users, 'Estude em grupo', 'Comunidades e grupos de estudo com tarefas, discussões e reuniões.'],
              [CalendarDays, 'Eventos e prazos', 'Calendário integrado com exportação para o seu telemóvel.'],
              [Award, 'Certificados verificáveis', 'Cada certificado tem um código público que qualquer pessoa pode validar.'],
            ].map(([I, t, d]) => {
              const Icon = I as typeof Award;
              return (
                <div key={t as string} className="rounded-2xl border bg-card p-6 shadow-[var(--shadow-soft)]">
                  <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary"><Icon className="size-5" /></div>
                  <h3 className="mt-4 font-semibold">{t as string}</h3><p className="mt-1.5 text-sm text-muted-foreground">{d as string}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {!!quotes?.data.length && (
        <section aria-labelledby="quotes-h" className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
          <div className="flex items-end justify-between gap-4"><h2 id="quotes-h" className="text-2xl font-bold tracking-tight">O que dizem sobre a Donza</h2><Link href="/testemunhos" className="text-sm font-medium text-primary hover:underline">Ver todos</Link></div>
          <ul className="mt-6 grid gap-4 md:grid-cols-3">{quotes.data.map((t) => <li key={t.testimonialId}><TestimonialCard t={t} /></li>)}</ul>
        </section>
      )}

      {/* Ensinar */}
      <section id="ensinar" className="scroll-mt-20 mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="relative overflow-hidden rounded-3xl bg-sidebar px-6 py-12 text-sidebar-foreground sm:px-12 sm:py-16">
          <div className="absolute -top-24 -right-24 size-80 rounded-full bg-primary/30 blur-3xl" aria-hidden />
          <div className="relative grid items-center gap-8 md:grid-cols-[1.4fr_1fr]">
            <div>
              <GraduationCap className="size-9 text-accent" />
              <h2 className="mt-4 text-3xl font-bold text-white">Partilhe o que sabe</h2>
              <p className="mt-3 max-w-lg text-sidebar-foreground/80">Crie cursos, organize turmas e receba pagamentos directamente. Instrutores e instituições passam por uma verificação para garantir a confiança dos alunos.</p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Button asChild variant="accent" size="lg"><Link href="/registar?papel=instructor">Tornar-me instrutor</Link></Button>
                <Button asChild size="lg" variant="outline" className="border-white/20 bg-white/5 text-white hover:bg-white/10"><Link href="/registar?papel=institution">Sou uma instituição</Link></Button>
              </div>
            </div>
            <ul className="grid gap-3 text-sm">
              {['Receba por M-Pesa, e-Mola ou cartão', 'Painel com métricas dos seus alunos', 'Lotes de aulas e biblioteca reutilizável', 'Certificados emitidos automaticamente'].map((t) => (
                <li key={t} className="flex items-start gap-2.5 rounded-xl bg-white/5 p-3 ring-1 ring-white/10"><Check className="mt-0.5 size-4 shrink-0 text-accent" />{t}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </>
  );
}

/** Composição ilustrativa em CSS (sem imagens externas). */
function HeroVisual() {
  return (
    <div className="relative mx-auto hidden w-full max-w-md lg:block" aria-hidden>
      <div className="absolute -inset-6 rounded-[2rem] bg-gradient-to-br from-primary/20 via-transparent to-accent/25 blur-2xl" />
      <div className="relative rotate-2 rounded-2xl border bg-card p-4 shadow-xl">
        <div className="aspect-video rounded-xl bg-gradient-to-br from-teal-600 to-emerald-400 p-4"><div className="h-full rounded-lg bg-white/10 ring-1 ring-white/25" /></div>
        <div className="mt-4 grid gap-2.5"><div className="h-3 w-3/4 rounded-full bg-foreground/80" /><div className="h-2.5 w-1/2 rounded-full bg-muted-foreground/30" /></div>
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-secondary"><div className="h-full w-2/3 rounded-full bg-primary" /></div>
      </div>
      <div className="absolute -bottom-6 -left-6 flex -rotate-3 items-center gap-3 rounded-2xl border bg-card p-3.5 pr-5 shadow-xl">
        <div className="flex size-10 items-center justify-center rounded-full bg-accent/30 text-accent-foreground"><Award className="size-5" /></div>
        <div><p className="text-sm font-semibold">Certificado emitido</p><p className="text-xs text-muted-foreground">Verificável online</p></div>
      </div>
      <div className="absolute -top-5 -right-4 flex items-center gap-2 rounded-full border bg-card px-3.5 py-2 text-xs font-medium shadow-lg"><MessagesSquare className="size-4 text-primary" />12 novas respostas</div>
    </div>
  );
}
