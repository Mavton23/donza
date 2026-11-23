import { Stars } from '@/components/reviews/stars';
import { Avatar } from '@/components/ui/avatar';
import type { Testimonial } from '@/lib/api/types';
import { ROLE_LABEL } from '@/lib/utils';

export function TestimonialCard({ t }: { t: Testimonial }) {
  const role = t.author.role ? (ROLE_LABEL[t.author.role] ?? t.author.role) : null;
  return (
    <figure className="flex h-full flex-col gap-3 rounded-2xl border bg-card p-5">
      <Stars value={t.rating} />
      <blockquote className="flex-1 whitespace-pre-wrap break-words text-[15px] leading-relaxed">{t.content}</blockquote>
      <figcaption className="flex items-center gap-2 text-sm"><Avatar src={t.author.avatarUrl} name={t.author.name} size={32} /><span><span className="font-medium">{t.author.name}</span>{role && <span className="block text-xs text-muted-foreground">{role}</span>}</span></figcaption>
    </figure>
  );
}
