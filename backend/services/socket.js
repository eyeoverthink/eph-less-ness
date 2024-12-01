const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
let io;

// Initialize Socket.IO with the HTTP server
const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.NODE_ENV === 'production' 
        ? 'your-production-url' 
        : 'http://localhost:3030',
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  // Middleware to handle authentication
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication error'));
    }
    
    jwt.verify(token, 'your-test-secret-key', (err, user) => {
      if (err) {
        return next(new Error('Invalid token'));
      }
      socket.userId = user.userId;
      next();
    });
  });

  // Handle connection
  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);
    
    // Join user-specific room
    socket.join(`user-${socket.userId}`);

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });

  return io;
};

// Emit progress updates for media processing
const emitProcessingProgress = (userId, mediaType, mediaId, progress) => {
  if (!io) return;
  
  io.to(`user-${userId}`).emit('processingProgress', {
    mediaType,
    mediaId,
    progress
  });
};

// Emit completion status
const emitProcessingComplete = (userId, mediaType, mediaId, data) => {
  if (!io) return;
  
  io.to(`user-${userId}`).emit('processingComplete', {
    mediaType,
    mediaId,
    data
  });
};

// Emit error status
const emitProcessingError = (userId, mediaType, mediaId, error) => {
  if (!io) return;
  
  io.to(`user-${userId}`).emit('processingError', {
    mediaType,
    mediaId,
    error
  });
};

module.exports = {
  initializeSocket,
  emitProcessingProgress,
  emitProcessingComplete,
  emitProcessingError
};
