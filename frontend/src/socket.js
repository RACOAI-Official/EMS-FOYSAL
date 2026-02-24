// src/socket.js
import { io } from "socket.io-client";

// Determine backend URL for Socket.IO
const getSocketUrl = () => {
  const normalizeUrl = (url = '') => url.trim().replace(/\/+$/, '');
  const envUrl = normalizeUrl(process.env.REACT_APP_BASE_URL || '');

  if (typeof window !== 'undefined' && window.location?.origin) {
    const currentOrigin = normalizeUrl(window.location.origin);
    const isHttpsPage = window.location.protocol === 'https:';

    // Prevent mixed-content websocket/polling calls from HTTPS pages.
    if (isHttpsPage) {
      if (envUrl && envUrl.startsWith('https://')) return envUrl;
      return currentOrigin;
    }

    if (envUrl) return envUrl;

    if (window.location?.hostname) {
      return `${window.location.protocol}//${window.location.hostname}:5500`;
    }
  }

  return envUrl || 'http://127.0.0.1:5500';
};

// Create a single shared Socket.IO instance
const socket = io(getSocketUrl(), {
  withCredentials: true,            // Allow cookies/auth headers
  autoConnect: false,               // Connect manually when ready
  transports: ['websocket', 'polling'] // Ensure multiple transports are tried
});

// Optional: debug events
socket.on('connect', () => console.log('✅ Socket connected:', socket.id));
socket.on('disconnect', () => console.log('❌ Socket disconnected'));
socket.on('connect_error', (err) => console.error('Socket connection error:', err));

export default socket;
