/**
 * WebSocket hook for live execution updates.
 * Gracefully degrades if WebSocket is unavailable.
 */

import { useEffect, useRef, useState, useCallback } from 'react';

const WS_BASE = (() => {
  try {
    const apiUrl = (import.meta as any).env?.VITE_API_URL || 'http://localhost:5177';
    return apiUrl.replace(/^http/, 'ws');
  } catch {
    return `ws://${window.location.hostname}:5177`;
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
      const ws = new WebSocket(`${WS_BASE}/api/executions/${executionId}/live`);
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
