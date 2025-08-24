const jwt = require('jsonwebtoken');
const { pool } = require('../config/database');

class SocketService {
  constructor(io) {
    this.io = io;
    this.connectedUsers = new Map(); // Map to store user connections
    this.setupMiddleware();
    this.setupEventHandlers();
  }

  // Setup Socket.IO middleware for authentication
  setupMiddleware() {
    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token || socket.handshake.headers.authorization;
        
        if (!token) {
          return next(new Error('Authentication token required'));
        }

        // Remove 'Bearer ' prefix if present
        const cleanToken = token.startsWith('Bearer ') ? token.substring(7) : token;
        
        // Verify JWT token
        const decoded = jwt.verify(cleanToken, process.env.JWT_SECRET);
        
        // Get user from database
        const result = await pool.query(
          'SELECT id, email, name FROM users WHERE id = $1',
          [decoded.userId]
        );

        if (result.rows.length === 0) {
          return next(new Error('User not found'));
        }

        // Attach user info to socket
        socket.user = result.rows[0];
        next();
      } catch (error) {
        next(new Error('Invalid token'));
      }
    });
  }

  // Setup Socket.IO event handlers
  setupEventHandlers() {
    this.io.on('connection', (socket) => {
      console.log(`User connected: ${socket.user.name} (${socket.user.email})`);
      
      // Store user connection
      this.connectedUsers.set(socket.user.id, {
        socketId: socket.id,
        user: socket.user,
        connectedAt: new Date()
      });

      // Join user to their personal room
      socket.join(`user_${socket.user.id}`);

      // Emit connection event to user
      socket.emit('connected', {
        message: 'Successfully connected to real-time service',
        user: socket.user
      });

      // Handle disconnection
      socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.user.name} (${socket.user.email})`);
        this.connectedUsers.delete(socket.user.id);
      });

      // Handle user joining a specific room (for admin features)
      socket.on('join_room', (roomName) => {
        socket.join(roomName);
        console.log(`User ${socket.user.name} joined room: ${roomName}`);
      });

      // Handle user leaving a room
      socket.on('leave_room', (roomName) => {
        socket.leave(roomName);
        console.log(`User ${socket.user.name} left room: ${roomName}`);
      });

      // Handle custom events
      socket.on('task_created', (taskData) => {
        console.log(`Task created by ${socket.user.name}:`, taskData.title);
        this.emitToUser(socket.user.id, 'task_created', {
          task: taskData,
          createdBy: socket.user.name
        });
      });

      socket.on('task_updated', (taskData) => {
        console.log(`Task updated by ${socket.user.name}:`, taskData.title);
        this.emitToUser(socket.user.id, 'task_updated', {
          task: taskData,
          updatedBy: socket.user.name
        });
      });

      socket.on('task_deleted', (taskData) => {
        console.log(`Task deleted by ${socket.user.name}:`, taskData.title);
        this.emitToUser(socket.user.id, 'task_deleted', {
          task: taskData,
          deletedBy: socket.user.name
        });
      });

      // Handle ping/pong for connection health
      socket.on('ping', () => {
        socket.emit('pong', { timestamp: new Date().toISOString() });
      });
    });
  }

  // Emit event to specific user
  emitToUser(userId, event, data) {
    const userConnection = this.connectedUsers.get(userId);
    if (userConnection) {
      this.io.to(userConnection.socketId).emit(event, data);
    }
  }

  // Emit event to all connected users (for admin notifications)
  emitToAll(event, data) {
    this.io.emit(event, data);
  }

  // Emit event to admin users only
  emitToAdmins(event, data) {
    this.connectedUsers.forEach((connection, userId) => {
      if (connection.user.email === 'admin@example.com') {
        this.io.to(connection.socketId).emit(event, data);
      }
    });
  }

  // Emit task events to appropriate users
  emitTaskCreated(taskData, createdByUserId) {
    const createdByUser = this.connectedUsers.get(createdByUserId);
    
    // Emit to all connected users for real-time updates
    this.emitToAll('task_created', {
      task: taskData,
      createdBy: createdByUser?.user.name || 'Unknown',
      action: 'created'
    });

    // Emit to admin users with additional info
    this.emitToAdmins('task_created_admin', {
      task: taskData,
      createdBy: createdByUser?.user.name || 'Unknown'
    });
  }

  emitTaskUpdated(taskData, updatedByUserId) {
    const updatedByUser = this.connectedUsers.get(updatedByUserId);
    
    // Emit to all connected users for real-time updates
    this.emitToAll('task_updated', {
      task: taskData,
      updatedBy: updatedByUser?.user.name || 'Unknown',
      action: 'updated'
    });

    // Emit to admin users with additional info
    this.emitToAdmins('task_updated_admin', {
      task: taskData,
      updatedBy: updatedByUser?.user.name || 'Unknown'
    });
  }

  emitTaskDeleted(taskData, deletedByUserId) {
    const deletedByUser = this.connectedUsers.get(deletedByUserId);
    
    // Emit to all connected users for real-time updates
    this.emitToAll('task_deleted', {
      task: taskData,
      deletedBy: deletedByUser?.user.name || 'Unknown',
      action: 'deleted'
    });

    // Emit to admin users with additional info
    this.emitToAdmins('task_deleted_admin', {
      task: taskData,
      deletedBy: deletedByUser?.user.name || 'Unknown'
    });
  }

  // Get connected users info (for admin dashboard)
  getConnectedUsers() {
    const users = [];
    this.connectedUsers.forEach((connection, userId) => {
      users.push({
        userId,
        socketId: connection.socketId,
        user: connection.user,
        connectedAt: connection.connectedAt
      });
    });
    return users;
  }

  // Get connection count
  getConnectionCount() {
    return this.connectedUsers.size;
  }
}

module.exports = SocketService;

