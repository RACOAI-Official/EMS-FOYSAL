import { io } from "socket.io-client";

const getSocketUrl = () => {
  let envUrl = null;
  try {
    if (typeof process !== 'undefined' && process.env) {
      envUrl = process.env.REACT_APP_BASE_URL;
    }
  } catch (e) { }

  if (envUrl) return envUrl;

  // Fallback for local development if env var is missing
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'http://localhost:5588';
  }
  return ''; // Fallback to relative URL
};

const socket = io(getSocketUrl(), {
  withCredentials: true,
  autoConnect: false,
  transports: ['websocket', 'polling'] // Ensure multiple transports are tried
});

socket.on('connect', () => console.log('Socket connected:', socket.id));
socket.on('connect_error', (err) => console.error('Socket connection error:', err));

export default socket;
