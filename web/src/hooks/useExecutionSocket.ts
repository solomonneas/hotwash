/**
 * WebSocket hook for live execution updates.
 * Gracefully degrades if WebSocket is unavailable.
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { API_BASE_URL, API_KEY } from '../api/client';

const WS_BASE = (() => {
  try {
    return API_BASE_URL.replace(/^http/, 'ws');
  } catch {
    return `ws://${window.location.hostname}:8000`;
  }
})();

export interface ExecutionEvent {
  type: string;
  timestamp: string;
  data?: any;
}

export function useExecutionSocket(executionId: string | undefined) {
  const [lastEvent, setLastEvent] = useState<ExecutionEvent | null>(null);
  const [connected, setConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const retryRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  const connect = useCallback(() => {
    if (!executionId) return;
    try {
      const params = new URLSearchParams();
      if (API_KEY) params.set('api_key', API_KEY);
      const qs = params.toString();
      const ws = new WebSocket(
        `${WS_BASE}/api/executions/${encodeURIComponent(executionId)}/live${qs ? `?${qs}` : ''}`
      );
      wsRef.current = ws;

      ws.onopen = () => {
        setConnected(true);
        retryRef.current = 0;
      };

      ws.onmessage = (e) => {
        try {
          const event = JSON.parse(e.data) as ExecutionEvent;
          setLastEvent(event);
        } catch {}
      };

      ws.onclose = () => {
        setConnected(false);
        wsRef.current = null;
        const delay = Math.min(1000 * 2 ** retryRef.current, 30000);
        retryRef.current++;
        timerRef.current = setTimeout(connect, delay);
      };

      ws.onerror = () => {
        ws.close();
      };
    } catch {
      setConnected(false);
    }
  }, [executionId]);

  useEffect(() => {
    connect();
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (wsRef.current) {
        wsRef.current.onclose = null;
        wsRef.current.close();
      }
      setConnected(false);
    };
  }, [connect]);

  return { lastEvent, connected };
}
