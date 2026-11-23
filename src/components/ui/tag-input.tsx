'use client';
import * as React from 'react';
import { Plus, X } from 'lucide-react';
import { Button } from './button';
import { Input } from './input';

/** Lista editável de textos curtos (requisitos, objectivos). Enter adiciona. */
export function TagInput({ value, onChange, placeholder, max = 30, id, label }: { value: string[]; onChange: (v: string[]) => void; placeholder?: string; max?: number; id?: string; label: string }) {
  const [draft, setDraft] = React.useState('');
  const add = () => { const t = draft.trim(); if (t && !value.includes(t) && value.length < max) onChange([...value, t.slice(0, 300)]); setDraft(''); };
  return (
    <div className="grid gap-2">
      <div className="flex gap-2">
        <Input id={id} value={draft} placeholder={placeholder} aria-label={label} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); add(); } }} />
        <Button type="button" variant="outline" size="icon" aria-label={`Adicionar ${label.toLowerCase()}`} onClick={add} disabled={!draft.trim()}><Plus /></Button>
      </div>
      {value.length > 0 && (
        <ul className="grid gap-1.5">{value.map((v, i) => (
          <li key={v} className="flex items-center justify-between gap-2 rounded-lg bg-muted px-3 py-2 text-sm"><span className="min-w-0 break-words">{v}</span>
            <button type="button" aria-label={`Remover: ${v}`} onClick={() => onChange(value.filter((_, j) => j !== i))} className="shrink-0 text-muted-foreground hover:text-destructive"><X className="size-4" /></button></li>))}</ul>
      )}
    </div>
  );
}
