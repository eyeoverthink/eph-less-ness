import { io } from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
    this.listeners = new Map();
  }

  connect() {
    if (this.socket) return;

    this.socket = io(import.meta.env.VITE_API_URL, {
      autoConnect: true,
      reconnection: true,
    });

    this.socket.on('connect', () => {
      console.log('Socket connected');
    });

    this.socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    this.socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // Add listener for processing progress
  onProcessingProgress(callback) {
    if (!this.socket) return;
    
    const handler = (data) => callback(data);
    this.listeners.set('processingProgress', handler);
    this.socket.on('processingProgress', handler);
  }

  // Add listener for processing completion
  onProcessingComplete(callback) {
    if (!this.socket) return;
    
    const handler = (data) => callback(data);
    this.listeners.set('processingComplete', handler);
    this.socket.on('processingComplete', handler);
  }

  // Add listener for processing errors
  onProcessingError(callback) {
    if (!this.socket) return;
    
    const handler = (data) => callback(data);
    this.listeners.set('processingError', handler);
    this.socket.on('processingError', handler);
  }

  // Remove all listeners
  removeListeners() {
    if (!this.socket) return;
    
    this.listeners.forEach((handler, event) => {
      this.socket.off(event, handler);
    });
    this.listeners.clear();
  }
}

// Create a singleton instance
const socketService = new SocketService();
export default socketService;
