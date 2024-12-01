require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { initializeSocket } = require('./services/socket');
const { handleSocketEvents } = require('./test-socket-server');
const podcastRoutes = require('./routes/podcasts');
const videoRoutes = require('./routes/video');
const audioRoutes = require('./routes/audio');
const { Server } = require('socket.io');
const http = require('http');
const jwt = require('jsonwebtoken');

const app = express();
const server = http.createServer(app);

// Initialize Socket.IO
const io = initializeSocket(server);

// Add socket event handlers
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  handleSocketEvents(socket);
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Middleware
app.use(cors({
    origin: process.env.NODE_ENV === 'production' 
      ? process.env.PRODUCTION_URL 
      : process.env.DEVELOPMENT_URL,
    credentials: true
}));
app.use(express.json());

// JWT Authentication Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    
    // Only start the server after MongoDB connection is established
    const PORT = process.env.PORT || 3100;
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Routes with JWT auth instead of Clerk
app.use('/api/podcasts', authenticateToken, podcastRoutes);
app.use('/api/videos', authenticateToken, videoRoutes);
app.use('/api/audio', audioRoutes); // No auth required for waveform processing

// Protected route example
app.get('/api/protected', authenticateToken, (req, res) => {
    res.json({ message: 'This is a protected route', userId: req.user.userId });
});

// Health check route
app.get('/health', (req, res) => {
    res.json({ status: 'healthy' });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});