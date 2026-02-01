import { writable, derived } from 'svelte/store';
import type { ServerMessage, ClientMessage } from '../types';

type MessageHandler = (message: ServerMessage) => void;

function createWebSocketStore() {
  const _connected = writable(false);
  const _error = writable<string | null>(null);
  const handlers = new Set<MessageHandler>();

  let ws: WebSocket | null = null;
  let reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
  let reconnectAttempts = 0;
  const maxReconnectAttempts = 10;
  const baseReconnectDelay = 1000;

  function getWsUrl(): string {
    if (typeof window === 'undefined') return '';
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    return `${protocol}//${host}/ws`;
  }

  function scheduleReconnect(): void {
    if (reconnectTimeout) return;
    if (reconnectAttempts >= maxReconnectAttempts) {
      _error.set('Max reconnection attempts reached');
      return;
    }

    const delay = baseReconnectDelay * Math.pow(2, reconnectAttempts);
    reconnectAttempts++;

    console.log(`[ws] Reconnecting in ${delay}ms (attempt ${reconnectAttempts})`);

    reconnectTimeout = setTimeout(() => {
      reconnectTimeout = null;
      connect();
    }, delay);
  }

  function connect(): void {
    if (ws?.readyState === WebSocket.OPEN) return;

    try {
      ws = new WebSocket(getWsUrl());

      ws.onopen = () => {
        console.log('[ws] Connected');
        _connected.set(true);
        _error.set(null);
        reconnectAttempts = 0;
      };

      ws.onclose = () => {
        console.log('[ws] Disconnected');
        _connected.set(false);
        scheduleReconnect();
      };

      ws.onerror = (event) => {
        console.error('[ws] Error:', event);
        _error.set('WebSocket connection error');
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data) as ServerMessage;
          handlers.forEach((handler) => handler(message));
        } catch (err) {
          console.error('[ws] Failed to parse message:', err);
        }
      };
    } catch (err) {
      console.error('[ws] Failed to connect:', err);
      _error.set('Failed to connect to WebSocket');
      scheduleReconnect();
    }
  }

  function send(message: ClientMessage): void {
    if (ws?.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
    } else {
      console.warn('[ws] Cannot send - not connected');
    }
  }

  function addHandler(handler: MessageHandler): () => void {
    handlers.add(handler);
    return () => {
      handlers.delete(handler);
    };
  }

  function disconnect(): void {
    if (reconnectTimeout) {
      clearTimeout(reconnectTimeout);
      reconnectTimeout = null;
    }
    if (ws) {
      ws.close();
      ws = null;
    }
  }

  // Auto-connect when in browser
  if (typeof window !== 'undefined') {
    connect();
  }

  // Derived store that exposes both connected and error
  const state = derived([_connected, _error], ([$connected, $error]) => ({
    connected: $connected,
    error: $error,
  }));

  return {
    subscribe: state.subscribe,
    connected: _connected,
    error: _error,
    connect,
    send,
    addHandler,
    disconnect,
  };
}

export const wsStore = createWebSocketStore();
