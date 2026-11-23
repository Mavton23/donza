import { FileText, Headphones, Lock, PlayCircle, ClipboardCheck, HelpCircle } from 'lucide-react';
import type { LessonType } from '@/lib/api/types';

const ICONS = { video: PlayCircle, audio: Headphones, pdf: FileText, text: FileText, quiz: HelpCircle, assignment: ClipboardCheck } as const;
export function LessonIcon({ type, locked, className = 'size-4' }: { type: LessonType; locked?: boolean; className?: string }) {
  const I = locked ? Lock : ICONS[type] ?? FileText;
  return <I className={className} aria-hidden />;
}
