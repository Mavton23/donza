import Link from 'next/link';
import { Clock, Star, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { displayName } from '@/lib/format';
import type { Course } from '@/lib/api/types';
import { formatPrice, LEVEL_LABEL } from '@/lib/utils';
import { CourseCover } from './course-cover';

export function CourseCard({ course, progress, href }: { course: Course; progress?: number; href?: string }) {
  const price = Number(course.price);
  const rating = Number(course.ratingAverage);
  return (
    <Link href={href ?? `/cursos/${course.slug}`} className="group flex flex-col overflow-hidden rounded-2xl border bg-card shadow-[var(--shadow-soft)] transition duration-200 hover:-translate-y-0.5 hover:shadow-lg focus-visible:ring-[3px] focus-visible:ring-ring/40">
      <CourseCover title={course.title} category={course.category} src={course.coverImageUrl} className="transition duration-500 group-hover:scale-[1.02]" />
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex items-center justify-between gap-2">
          <Badge variant="secondary">{LEVEL_LABEL[course.level] ?? course.level}</Badge>
          {rating > 0 && <span className="inline-flex items-center gap-1 text-xs font-medium"><Star className="size-3.5 fill-accent text-accent" />{rating.toFixed(1)}<span className="text-muted-foreground">({course.ratingCount})</span></span>}
        </div>
        <h3 className="line-clamp-2 text-[15px] leading-snug font-semibold group-hover:text-primary">{course.title}</h3>
        {course.shortDescription && <p className="line-clamp-2 text-sm text-muted-foreground">{course.shortDescription}</p>}
        <div className="mt-auto flex items-center gap-2 pt-1 text-xs text-muted-foreground">
          <Avatar src={course.instructor.avatarUrl} name={displayName(course.instructor)} size={22} />
          <span className="truncate">{displayName(course.instructor)}</span>
        </div>
        {progress !== undefined ? (
          <div className="grid gap-1.5 border-t pt-3">
            <div className="flex justify-between text-xs"><span className="text-muted-foreground">Progresso</span><span className="font-semibold">{Math.round(progress)}%</span></div>
            <Progress value={progress} />
          </div>
        ) : (
          <div className="flex items-center justify-between border-t pt-3">
            <span className="flex items-center gap-3 text-xs text-muted-foreground">
              {course.duration ? <span className="inline-flex items-center gap-1"><Clock className="size-3.5" />{course.duration} h</span> : null}
              {course.enrollmentsCount ? <span className="inline-flex items-center gap-1"><Users className="size-3.5" />{course.enrollmentsCount}</span> : null}
            </span>
            <span className={price ? 'text-base font-bold' : 'text-sm font-semibold text-success'}>{formatPrice(course.price, course.currency)}</span>
          </div>
        )}
      </div>
    </Link>
  );
}

export function CourseCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border bg-card">
      <div className="aspect-[16/9] animate-pulse bg-muted" />
      <div className="grid gap-3 p-4"><div className="h-4 w-1/3 animate-pulse rounded bg-muted" /><div className="h-5 w-4/5 animate-pulse rounded bg-muted" /><div className="h-4 w-full animate-pulse rounded bg-muted" /><div className="mt-4 h-5 w-1/4 animate-pulse rounded bg-muted" /></div>
    </div>
  );
}
