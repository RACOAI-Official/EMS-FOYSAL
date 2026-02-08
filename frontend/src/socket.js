import { io } from "socket.io-client";

const getSocketUrl = () => {
  const envUrl = process.env.REACT_APP_BASE_URL;
  
  console.log('Socket URL from env:', envUrl);
  
  // Always use environment variable if set
  if (envUrl && envUrl.trim() !== '') {
    return envUrl.trim();
  }

  // Fallback for local development
  const host = window.location.hostname;
  if (host === 'localhost' || host === '127.0.0.1') {
    console.warn('Socket using localhost fallback');
    return 'http://localhost:5588';
  }
  
  // Production fallback - hardcoded
  console.error('REACT_APP_BASE_URL not set for socket! Using hardcoded fallback.');
  return 'https://emsbackend.racoai.io';
};

const socket = io(getSocketUrl(), {
  withCredentials: true,
  autoConnect: false,
  transports: ['websocket', 'polling'] // Ensure multiple transports are tried
});

socket.on('connect', () => console.log('Socket connected:', socket.id));
socket.on('connect_error', (err) => console.error('Socket connection error:', err));

export default socket;
