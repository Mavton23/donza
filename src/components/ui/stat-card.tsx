import { Card } from './card';
export function StatCard({ label, value, icon, hint }: { label: string; value: React.ReactNode; icon: React.ReactNode; hint?: string }) {
  return (
    <Card className="flex items-center gap-4 p-5">
      <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary [&_svg]:size-6">{icon}</div>
      <div className="min-w-0"><p className="text-2xl leading-none font-bold tabular-nums">{value}</p><p className="mt-1.5 truncate text-sm text-muted-foreground">{label}</p>{hint && <p className="text-xs text-muted-foreground/80">{hint}</p>}</div>
    </Card>
  );
}
