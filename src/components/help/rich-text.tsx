import * as React from 'react';

/** Renderizador mínimo e seguro para conteúdo de ajuda: só gera elementos React (nunca HTML).
 *  `## Título`, `- item` e parágrafos separados por linha em branco. */
export function RichText({ text }: { text: string }) {
  const blocks = text.replace(/\r\n/g, '\n').split(/\n{2,}/);
  return (
    <div className="grid gap-4 text-[15px] leading-relaxed">
      {blocks.map((b, i) => {
        const lines = b.split('\n').filter((l) => l.trim());
        if (!lines.length) return null;
        if (lines.length === 1 && /^#{1,3}\s/.test(lines[0])) return <h2 key={i} className="mt-2 text-xl font-bold">{lines[0].replace(/^#{1,3}\s+/, '')}</h2>;
        if (lines.every((l) => /^[-*]\s/.test(l))) return <ul key={i} className="list-disc space-y-1 pl-5">{lines.map((l, j) => <li key={j}>{l.replace(/^[-*]\s+/, '')}</li>)}</ul>;
        if (lines.every((l) => /^\d+[.)]\s/.test(l))) return <ol key={i} className="list-decimal space-y-1 pl-5">{lines.map((l, j) => <li key={j}>{l.replace(/^\d+[.)]\s+/, '')}</li>)}</ol>;
        return <p key={i} className="break-words">{lines.map((l, j) => <React.Fragment key={j}>{j > 0 && <br />}{l}</React.Fragment>)}</p>;
      })}
    </div>
  );
}
