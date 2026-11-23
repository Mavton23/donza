'use client';
import { useQueryClient } from '@tanstack/react-query';
import * as React from 'react';
import { io, type Socket } from 'socket.io-client';
import { refreshSession, tokenStore } from '@/lib/api/client';
import { useAuth } from '@/lib/auth/auth-provider';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL ?? 'http://localhost:3001';
const RealtimeContext = React.createContext(false);

/** `true` enquanto o WebSocket está ligado. Sem ele, as consultas voltam ao polling de reserva. */
export const useRealtimeConnected = () => React.useContext(RealtimeContext);

/** Intervalo de refresco: longo (só rede de segurança) com tempo real; o original sem ele. */
export function useLiveInterval(fallbackMs: number) {
  const connected = useRealtimeConnected();
  return connected ? Math.max(fallbackMs * 6, 60_000) : fallbackMs;
}

const MESSAGE_KEYS = [['chat'], ['conversations'], ['msg-unread'], ['message-requests']];
const NOTIFICATION_KEYS = [['unread'], ['notifications'], ['conversations'], ['message-requests'], ['msg-unread']];

/**
 * Liga ao `/ws` da API com o access token (em memória) e converte os eventos do servidor em invalidações
 * do React Query — o servidor diz «mudou», o cliente volta a pedir por REST, que continua a ser a fonte de verdade.
 */
export function RealtimeProvider({ children }: { children: React.ReactNode }) {
  const { status } = useAuth(); const qc = useQueryClient();
  const [connected, setConnected] = React.useState(false);

  React.useEffect(() => {
    if (status !== 'authenticated') return;
    const invalidate = (keys: string[][]) => keys.forEach((k) => qc.invalidateQueries({ queryKey: k }));
    // `auth` como função: cada (re)ligação usa o token mais recente.
    const socket: Socket = io(`${WS_URL}/ws`, { auth: (cb) => cb({ token: tokenStore.get() ?? '' }), transports: ['websocket', 'polling'], reconnectionDelayMax: 15_000 });
    let retriedAuth = false;

    socket.on('ready', () => { retriedAuth = false; setConnected(true); invalidate([...MESSAGE_KEYS, ...NOTIFICATION_KEYS]); }); // recupera o que se perdeu offline
    socket.on('disconnect', () => setConnected(false));
    socket.on('unauthorized', async () => {
      // token expirado: renova a sessão uma vez e volta a ligar
      setConnected(false);
      if (retriedAuth) return;
      retriedAuth = true;
      if (await refreshSession()) socket.connect();
    });
    for (const ev of ['message:new', 'message:updated', 'message:deleted', 'chat:read']) socket.on(ev, () => invalidate(MESSAGE_KEYS));
    socket.on('notification:new', () => invalidate(NOTIFICATION_KEYS));

    return () => { socket.removeAllListeners(); socket.disconnect(); setConnected(false); };
  }, [status, qc]);

  return <RealtimeContext.Provider value={connected}>{children}</RealtimeContext.Provider>;
}
