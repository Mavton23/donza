/** Só aceita caminhos internos (evita open-redirect via ?next=). */
export function safeNext(next: string | null | undefined, fallback = '/painel') {
  return next && next.startsWith('/') && !next.startsWith('//') && !next.includes('\\') ? next : fallback;
}
