require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const winston = require('winston');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const Redis = require('ioredis');

const app = express();
const server = http.createServer(app);
const redis = new Redis(process.env.REDIS_URL || 'redis://redis:6379');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: '/var/log/webrtc-signaling.log' })
  ]
});

const io = socketIo(server, {
  cors: {
    origin: process.env.NODE_ENV === 'production' 
      ? ['https://medtour.ai', 'https://www.medtour.ai', 'https://admin.medtour.ai']
      : ['http://localhost:3000', 'http://localhost:5173'],
    methods: ['GET', 'POST'],
    credentials: true
  },
  transports: ['websocket', 'polling']
});

app.use(helmet());
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://medtour.ai', 'https://www.medtour.ai', 'https://admin.medtour.ai']
    : ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true
}));
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || 'medtour-webrtc-secret-key';
const ROOM_EXPIRY = 60 * 60 * 24;

const authenticateSocket = async (socket, next) => {
  try {
    const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return next(new Error('Authentication token required'));
    }
    
    const decoded = jwt.verify(token, JWT_SECRET);
    socket.userId = decoded.userId;
    socket.userRole = decoded.role;
    socket.userName = decoded.name;
    
    logger.info(`User authenticated: ${socket.userId} (${socket.userRole})`);
    next();
  } catch (error) {
    logger.error('Socket authentication failed:', error.message);
    next(new Error('Invalid authentication token'));
  }
};

const rooms = new Map();

class MedicalRoom {
  constructor(roomId, doctorId, patientId) {
    this.id = roomId;
    this.doctorId = doctorId;
    this.patientId = patientId;
    this.participants = new Map();
    this.createdAt = new Date();
    this.status = 'waiting';
    this.recordingEnabled = false;
    this.chatHistory = [];
  }
  
  addParticipant(socket) {
    this.participants.set(socket.userId, {
      socketId: socket.id,
      userId: socket.userId,
      role: socket.userRole,
      name: socket.userName,
      joinedAt: new Date(),
      isConnected: true
    });
    
    if (this.participants.size === 2) {
      this.status = 'active';
    }
    
    logger.info(`Participant ${socket.userId} joined room ${this.id}`);
  }
  
  removeParticipant(userId) {
    const participant = this.participants.get(userId);
    if (participant) {
      participant.isConnected = false;
      participant.leftAt = new Date();
      logger.info(`Participant ${userId} left room ${this.id}`);
    }
  }
  
  getOtherParticipant(userId) {
    for (const [id, participant] of this.participants) {
      if (id !== userId && participant.isConnected) {
        return participant;
      }
    }
    return null;
  }
  
  addChatMessage(userId, message) {
    const chatMessage = {
      id: uuidv4(),
      userId,
      message,
      timestamp: new Date(),
      type: 'text'
    };
    this.chatHistory.push(chatMessage);
    return chatMessage;
  }
}

io.use(authenticateSocket);

io.on('connection', (socket) => {
  logger.info(`Socket connected: ${socket.id} for user ${socket.userId}`);
  
  socket.on('join-room', async (data) => {
    try {
      const { roomId, doctorId, patientId } = data;
      
      if (!roomId || !doctorId || !patientId) {
        socket.emit('error', { message: 'Room ID, doctor ID, and patient ID are required' });
        return;
      }
      
      if (socket.userRole === 'doctor' && socket.userId !== doctorId) {
        socket.emit('error', { message: 'Doctor can only join their own consultation rooms' });
        return;
      }
      
      if (socket.userRole === 'patient' && socket.userId !== patientId) {
        socket.emit('error', { message: 'Patient can only join their own consultation rooms' });
        return;
      }
      
      let room = rooms.get(roomId);
      if (!room) {
        room = new MedicalRoom(roomId, doctorId, patientId);
        rooms.set(roomId, room);
        await redis.setex(`room:${roomId}`, ROOM_EXPIRY, JSON.stringify({
          id: roomId,
          doctorId,
          patientId,
          createdAt: room.createdAt
        }));
      }
      
      socket.join(roomId);
      socket.currentRoom = roomId;
      room.addParticipant(socket);
      
      socket.emit('room-joined', {
        roomId,
        participants: Array.from(room.participants.values()),
        status: room.status
      });
      
      socket.to(roomId).emit('participant-joined', {
        userId: socket.userId,
        role: socket.userRole,
        name: socket.userName
      });
      
      if (room.status === 'active') {
        io.to(roomId).emit('consultation-ready');
      }
      
    } catch (error) {
      logger.error('Error joining room:', error);
      socket.emit('error', { message: 'Failed to join room' });
    }
  });
  
  socket.on('webrtc-offer', (data) => {
    const { roomId, offer } = data;
    const room = rooms.get(roomId);
    
    if (!room) {
      socket.emit('error', { message: 'Room not found' });
      return;
    }
    
    const otherParticipant = room.getOtherParticipant(socket.userId);
    if (otherParticipant) {
      io.to(otherParticipant.socketId).emit('webrtc-offer', {
        offer,
        from: socket.userId,
        fromName: socket.userName
      });
      
      logger.info(`WebRTC offer sent from ${socket.userId} to ${otherParticipant.userId} in room ${roomId}`);
    }
  });
  
  socket.on('webrtc-answer', (data) => {
    const { roomId, answer } = data;
    const room = rooms.get(roomId);
    
    if (!room) {
      socket.emit('error', { message: 'Room not found' });
      return;
    }
    
    const otherParticipant = room.getOtherParticipant(socket.userId);
    if (otherParticipant) {
      io.to(otherParticipant.socketId).emit('webrtc-answer', {
        answer,
        from: socket.userId,
        fromName: socket.userName
      });
      
      logger.info(`WebRTC answer sent from ${socket.userId} to ${otherParticipant.userId} in room ${roomId}`);
    }
  });
  
  socket.on('webrtc-ice-candidate', (data) => {
    const { roomId, candidate } = data;
    const room = rooms.get(roomId);
    
    if (!room) {
      socket.emit('error', { message: 'Room not found' });
      return;
    }
    
    const otherParticipant = room.getOtherParticipant(socket.userId);
    if (otherParticipant) {
      io.to(otherParticipant.socketId).emit('webrtc-ice-candidate', {
        candidate,
        from: socket.userId
      });
    }
  });
  
  socket.on('chat-message', (data) => {
    const { roomId, message } = data;
    const room = rooms.get(roomId);
    
    if (!room) {
      socket.emit('error', { message: 'Room not found' });
      return;
    }
    
    const chatMessage = room.addChatMessage(socket.userId, message);
    
    io.to(roomId).emit('chat-message', {
      ...chatMessage,
      userName: socket.userName,
      userRole: socket.userRole
    });
    
    logger.info(`Chat message in room ${roomId} from ${socket.userId}: ${message.substring(0, 50)}...`);
  });
  
  socket.on('toggle-recording', (data) => {
    const { roomId, enabled } = data;
    const room = rooms.get(roomId);
    
    if (!room) {
      socket.emit('error', { message: 'Room not found' });
      return;
    }
    
    if (socket.userRole !== 'doctor') {
      socket.emit('error', { message: 'Only doctors can control recording' });
      return;
    }
    
    room.recordingEnabled = enabled;
    
    io.to(roomId).emit('recording-status', {
      enabled,
      changedBy: socket.userId,
      timestamp: new Date()
    });
    
    logger.info(`Recording ${enabled ? 'enabled' : 'disabled'} in room ${roomId} by ${socket.userId}`);
  });
  
  socket.on('end-consultation', (data) => {
    const { roomId } = data;
    const room = rooms.get(roomId);
    
    if (!room) {
      socket.emit('error', { message: 'Room not found' });
      return;
    }
    
    if (socket.userRole !== 'doctor') {
      socket.emit('error', { message: 'Only doctors can end consultations' });
      return;
    }
    
    room.status = 'ended';
    room.endedAt = new Date();
    room.endedBy = socket.userId;
    
    io.to(roomId).emit('consultation-ended', {
      endedBy: socket.userId,
      endedAt: room.endedAt,
      duration: room.endedAt - room.createdAt
    });
    
    setTimeout(() => {
      rooms.delete(roomId);
      redis.del(`room:${roomId}`);
    }, 30000);
    
    logger.info(`Consultation ended in room ${roomId} by ${socket.userId}`);
  });
  
  socket.on('disconnect', () => {
    logger.info(`Socket disconnected: ${socket.id} for user ${socket.userId}`);
    
    if (socket.currentRoom) {
      const room = rooms.get(socket.currentRoom);
      if (room) {
        room.removeParticipant(socket.userId);
        
        socket.to(socket.currentRoom).emit('participant-left', {
          userId: socket.userId,
          role: socket.userRole,
          name: socket.userName
        });
        
        const remainingParticipants = Array.from(room.participants.values()).filter(p => p.isConnected);
        if (remainingParticipants.length === 0) {
          setTimeout(() => {
            if (rooms.has(socket.currentRoom)) {
              const currentRoom = rooms.get(socket.currentRoom);
              const stillEmpty = Array.from(currentRoom.participants.values()).filter(p => p.isConnected).length === 0;
              if (stillEmpty) {
                rooms.delete(socket.currentRoom);
                redis.del(`room:${socket.currentRoom}`);
                logger.info(`Empty room ${socket.currentRoom} cleaned up`);
              }
            }
          }, 300000);
        }
      }
    }
  });
});

app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    activeRooms: rooms.size,
    connectedClients: io.engine.clientsCount
  });
});

app.post('/api/create-room', (req, res) => {
  try {
    const { doctorId, patientId, scheduledTime } = req.body;
    
    if (!doctorId || !patientId) {
      return res.status(400).json({ error: 'Doctor ID and Patient ID are required' });
    }
    
    const roomId = uuidv4();
    const room = new MedicalRoom(roomId, doctorId, patientId);
    
    if (scheduledTime) {
      room.scheduledTime = new Date(scheduledTime);
    }
    
    rooms.set(roomId, room);
    
    redis.setex(`room:${roomId}`, ROOM_EXPIRY, JSON.stringify({
      id: roomId,
      doctorId,
      patientId,
      createdAt: room.createdAt,
      scheduledTime: room.scheduledTime
    }));
    
    res.json({
      roomId,
      doctorId,
      patientId,
      createdAt: room.createdAt,
      scheduledTime: room.scheduledTime,
      joinUrl: `${process.env.FRONTEND_URL || 'https://medtour.ai'}/consultation/${roomId}`
    });
    
    logger.info(`Room created: ${roomId} for doctor ${doctorId} and patient ${patientId}`);
  } catch (error) {
    logger.error('Error creating room:', error);
    res.status(500).json({ error: 'Failed to create room' });
  }
});

app.get('/api/room/:roomId', async (req, res) => {
  try {
    const { roomId } = req.params;
    const room = rooms.get(roomId);
    
    if (!room) {
      const cachedRoom = await redis.get(`room:${roomId}`);
      if (!cachedRoom) {
        return res.status(404).json({ error: 'Room not found' });
      }
      
      const roomData = JSON.parse(cachedRoom);
      return res.json({
        ...roomData,
        status: 'waiting',
        participants: []
      });
    }
    
    res.json({
      id: room.id,
      doctorId: room.doctorId,
      patientId: room.patientId,
      status: room.status,
      createdAt: room.createdAt,
      participants: Array.from(room.participants.values()),
      recordingEnabled: room.recordingEnabled
    });
  } catch (error) {
    logger.error('Error getting room:', error);
    res.status(500).json({ error: 'Failed to get room information' });
  }
});

const PORT = process.env.PORT || 8084;

server.listen(PORT, () => {
  logger.info(`WebRTC Signaling Server running on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  server.close(() => {
    redis.disconnect();
    process.exit(0);
  });
});

module.exports = { app, server };
