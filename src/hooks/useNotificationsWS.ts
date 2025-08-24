import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { INotification } from 'types/entities';

type NotificationMessage = {
  type: 'notification';
  notification: INotification;
};

type UnreadListMessage = {
  type: 'unread_notifications';
  notifications: INotification[];
};

type WSMessage = NotificationMessage | UnreadListMessage;

interface UseNotificationsWSParams {
  enabled?: boolean;
  onNotification?: (payload: INotification) => void;
  onUnreadList?: (list: INotification[]) => void;
}

/**
 * Robust WebSocket hook for notifications.
 * - Chooses ws URL based on environment (prod/dev).
 * - Tries to authenticate by adding ?token=... if token exists in localStorage.
 * - Auto-reconnect with exponential backoff.
 * - Exposes helpers to send WS actions.
 * - Emits console.log at important steps to help backend integration.
 */
export function useNotificationsWS(params: UseNotificationsWSParams = {}) {
  const { enabled = true, onNotification, onUnreadList } = params;

  const [connected, setConnected] = useState(false);
  const [lastEvent, setLastEvent] = useState<WSMessage | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimerRef = useRef<number | null>(null);
  const retryRef = useRef(0);

  const getToken = useCallback((): string | null => {
    try {
      const raw = localStorage.getItem('access_token');
      if (!raw) return null;

      // If it's already a plain token string (most JWT setups)
      if (!raw.startsWith('{') && !raw.startsWith('[') && !raw.startsWith('"')) {
        console.log('[WS] Using token from localStorage (raw string)');
        return raw;
      }

      // Try JSON parse
      const parsed = JSON.parse(raw);
      if (typeof parsed === 'string') {
        console.log('[WS] Using token from localStorage (parsed string)');
        return parsed;
      }
      if (parsed && typeof parsed === 'object') {
        const guess =
          (parsed.access as string) || (parsed.token as string) || (parsed.access_token as string) || (parsed.value as string) || null;

        console.log('[WS] Using token from localStorage (parsed object)', { hasGuess: Boolean(guess) });
        return guess;
      }
      return null;
    } catch (e) {
      console.log('[WS] Failed to parse access_token from localStorage', e);
      return null;
    }
  }, []);

  const url = useMemo(() => {
    const isLocal = typeof window !== 'undefined' && window.location.hostname === 'localhost';
    const base = isLocal ? 'ws://localhost:8000/ws/notifications/' : 'wss://bsv.sino0on.ru/ws/notifications/';
    const token = getToken();
    // If backend supports token via query, attach it; otherwise server may rely on session cookies.
    const finalUrl = token ? `${base}?token=${encodeURIComponent(token)}` : base;
    console.log('[WS] notifications URL:', finalUrl, 'hasToken:', Boolean(token));
    return finalUrl;
  }, [getToken]);

  const cleanup = useCallback(() => {
    if (reconnectTimerRef.current) {
      window.clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }
    if (wsRef.current) {
      try {
        wsRef.current.close();
      } catch {
        // ignore
      }
      wsRef.current = null;
    }
  }, []);

  const scheduleReconnect = useCallback(() => {
    const attempt = retryRef.current;
    const backoff = Math.min(30000, 1000 * Math.pow(2, attempt)); // 1s, 2s, 4s, ... max 30s
    console.log('[WS] schedule reconnect attempt:', attempt + 1, 'in', backoff, 'ms');
    reconnectTimerRef.current = window.setTimeout(() => {
      retryRef.current += 1;
      connect();
    }, backoff);
  }, []);

  function isNotificationMessage(data: unknown): data is NotificationMessage {
    if (!data || typeof data !== 'object') return false;
    const d = data as Record<string, unknown>;
    const n = d.notification as Record<string, unknown> | undefined;
    return d.type === 'notification' && !!n && typeof n.id === 'number' && typeof n.title === 'string';
  }

  function isUnreadListMessage(data: unknown): data is UnreadListMessage {
    if (!data || typeof data !== 'object') return false;
    const d = data as Record<string, unknown>;
    const list = d.notifications as unknown;
    return d.type === 'unread_notifications' && Array.isArray(list);
  }

  const connect = useCallback(() => {
    if (!enabled) {
      console.log('[WS] disabled, not connecting');
      return;
    }
    cleanup();
    try {
      console.log('[WS] connecting...');
      const socket = new WebSocket(url);
      wsRef.current = socket;

      socket.onopen = () => {
        console.log('[WS] connected');
        setConnected(true);
        retryRef.current = 0; // reset backoff
      };

      socket.onmessage = (event) => {
        try {
          const data: unknown = JSON.parse(event.data);

          if (isNotificationMessage(data)) {
            console.log('[WS] Incoming notification');
            setLastEvent(data);
            onNotification?.(data.notification);
          } else if (isUnreadListMessage(data)) {
            const size = Array.isArray(data.notifications) ? data.notifications.length : 0;
            console.log('[WS] Incoming unread list size:', size);
            setLastEvent(data);
            onUnreadList?.(data.notifications);
          } else {
            console.log('[WS] Unknown message type:', data);
          }
        } catch (e) {
          console.log('[WS] Failed to parse message', e);
        }
      };

      socket.onerror = (err) => {
        console.log('[WS] error', err);
      };

      socket.onclose = (evt) => {
        console.log('[WS] closed', evt.code, evt.reason);
        setConnected(false);
        if (enabled) scheduleReconnect();
      };
    } catch (e) {
      console.log('[WS] connect error', e);
      scheduleReconnect();
    }
  }, [cleanup, enabled, scheduleReconnect, url, onNotification, onUnreadList]);

  useEffect(() => {
    connect();
    return () => {
      cleanup();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, enabled]);

  const send = useCallback((payload: unknown) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      console.log('[WS] send: not connected, skipped', payload);
      return;
    }
    try {
      wsRef.current.send(JSON.stringify(payload));
    } catch (e) {
      console.log('[WS] send error', e);
    }
  }, []);

  const sendMarkAsRead = useCallback(
    (notificationId: number) => {
      console.log('[WS] action mark_as_read', notificationId);
      send({ action: 'mark_as_read', notification_id: notificationId });
    },
    [send]
  );

  const sendMarkAllAsRead = useCallback(() => {
    console.log('[WS] action mark_all_as_read');
    send({ action: 'mark_all_as_read' });
  }, [send]);

  return {
    connected,
    lastEvent,
    send,
    sendMarkAsRead,
    sendMarkAllAsRead
  };
}
