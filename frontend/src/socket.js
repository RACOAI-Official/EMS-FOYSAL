// src/socket.js
import { io } from "socket.io-client";

// Determine backend URL for Socket.IO
const isPrivateHost = (host) => {
  return (
    host === 'localhost' ||
    host === '127.0.0.1' ||
    /^192\.168\.\d{1,3}\.\d{1,3}$/.test(host) ||
    /^10\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(host) ||
    /^172\.(1[6-9]|2\d|3[0-1])\.\d{1,3}\.\d{1,3}$/.test(host)
  );
};

const getSocketUrl = () => {
  const envUrl = process.env.REACT_APP_BASE_URL?.trim();
  const currentHost = window.location.hostname;

  if (envUrl) {
    try {
      const envHost = new URL(envUrl).hostname;
      if (!(isPrivateHost(currentHost) && isPrivateHost(envHost) && envHost !== currentHost)) {
        return envUrl;
      }
      console.warn(`Ignoring REACT_APP_BASE_URL host (${envHost}) because app is running on ${currentHost}.`);
    } catch (error) {
      console.warn('Invalid REACT_APP_BASE_URL for socket. Falling back to host-based URL.', error);
    }
  }

  if (isPrivateHost(currentHost)) {
    return `http://${currentHost}:5500`;
  }

  console.warn('REACT_APP_BASE_URL not set for socket. Using production fallback.');
  return 'https://emsbackend.easyemployee.io';
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
