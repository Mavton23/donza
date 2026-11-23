import Image from 'next/image';
import { BookOpen, Calculator, Code2, FlaskConical, Globe2, Languages, Palette, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

const PALETTES = [
  'from-[#0E6B63] to-[#2FA397]', 'from-[#0A2E2D] to-[#0E6B63]', 'from-[#B8481F] to-[#E0833B]',
  'from-[#2A6AAE] to-[#5FA0D8]', 'from-[#0B4F4A] to-[#3E9C8F]', 'from-[#8A5A00] to-[#D9962A]',
];
const hash = (s: string) => [...s].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);
function iconFor(cat?: string | null) {
  const c = (cat ?? '').toLowerCase();
  if (/mat|estat/.test(c)) return Calculator;
  if (/tecn|prog|inform|dados|web/.test(c)) return Code2;
  if (/ci[eê]n|f[ií]s|qu[ií]m|bio/.test(c)) return FlaskConical;
  if (/l[ií]ngu|idiom/.test(c)) return Languages;
  if (/neg|econ|gest|financ/.test(c)) return TrendingUp;
  if (/arte|design/.test(c)) return Palette;
  if (/geo|hist|soci/.test(c)) return Globe2;
  return BookOpen;
}

/** Capa do curso; sem imagem gera um fundo determinístico a partir do título. */
export function CourseCover({ title, category, src, className, priority }: { title: string; category?: string | null; src?: string | null; className?: string; priority?: boolean }) {
  if (src) return <div className={cn('relative aspect-[16/9] overflow-hidden bg-muted', className)}><Image src={src} alt="" fill sizes="(min-width:1024px) 33vw, 100vw" className="object-cover" priority={priority} /></div>;
  const Icon = iconFor(category);
  return (
    <div className={cn('relative aspect-[16/9] overflow-hidden bg-gradient-to-br', PALETTES[hash(title) % PALETTES.length], className)} aria-hidden>
      <div className="absolute inset-0 opacity-30 [background:radial-gradient(circle_at_20%_20%,white,transparent_45%),radial-gradient(circle_at_85%_90%,white,transparent_40%)]" />
      <Icon className="absolute right-4 bottom-3 size-16 text-white/35" strokeWidth={1.25} />
      <span className="absolute top-3 left-3 rounded-full bg-black/20 px-2.5 py-0.5 text-[11px] font-medium text-white backdrop-blur-sm">{category ?? 'Curso'}</span>
    </div>
  );
}
