// src/socket.js
import { io } from "socket.io-client";

// Determine backend URL for Socket.IO
const getSocketUrl = () => {
  const envUrl = process.env.REACT_APP_BASE_URL?.trim();
  if (envUrl) {
    return envUrl;
  }

  return 'http://192.168.10.13:5500';
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
