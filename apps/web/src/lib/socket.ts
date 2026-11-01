import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

const getSocketUrl = (): string => {
  if (process.env.NEXT_PUBLIC_SOCKET_URL) {
    return process.env.NEXT_PUBLIC_SOCKET_URL.replace(/\/+$/, '');
  }
  if (process.env.NEXT_PUBLIC_API_URL && !process.env.NEXT_PUBLIC_API_URL.startsWith('/')) {
    return process.env.NEXT_PUBLIC_API_URL.replace(/\/api\/v1\/?$/, '').replace(/\/+$/, '');
  }
  if (typeof window !== 'undefined') {
    // If running in browser on production without a separate socket URL,
    // fallback to current origin (Vercel serverless mode)
    return window.location.origin;
  }
  return 'http://localhost:5000';
};

export function getSocket(): Socket {
  if (typeof window === 'undefined') {
    return {} as Socket;
  }

  const SOCKET_URL = getSocketUrl();
  const token = localStorage.getItem('swap_access_token');

  if (!socket) {
    socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 3,
      timeout: 5000,
    });

    // Gracefully handle connection errors in serverless Vercel environments
    // where no standalone WebSocket daemon is present
    socket.on('connect_error', (err) => {
      if (process.env.NODE_ENV !== 'production') {
        console.debug('[SWAP Realtime] Socket connection idle (running in fallback/serverless mode):', err.message);
      }
    });

    socket.on('connect', () => {
      if (process.env.NODE_ENV !== 'production') {
        console.info('[SWAP Realtime] Connected to realtime gateway:', SOCKET_URL);
      }
    });
  } else if (token && (socket.auth as any)?.token !== token) {
    // Update credentials if user logged in or refreshed token
    socket.auth = { token };
    if (!socket.connected) {
      socket.connect();
    }
  }

  return socket;
}

export function isSocketConnected(): boolean {
  return !!(socket && socket.connected);
}
