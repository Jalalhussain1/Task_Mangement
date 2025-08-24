# Socket.IO Real-time Integration Documentation

This document describes the Socket.IO integration for real-time task management events.

## Overview

Socket.IO has been integrated into the backend to provide real-time updates for task operations. The system supports authenticated connections, user-specific events, and admin notifications.

## Features

- ✅ **JWT Authentication**: Secure Socket.IO connections with JWT tokens
- ✅ **Real-time Events**: Instant notifications for task CRUD operations
- ✅ **User Isolation**: Users only receive events for their own tasks
- ✅ **Admin Notifications**: Special events for admin users
- ✅ **Connection Management**: Track connected users and connection health
- ✅ **Room Support**: Join/leave rooms for advanced features
- ✅ **Error Handling**: Comprehensive error handling and logging

## Architecture

### Socket.IO Service (`src/services/socketService.js`)

The main Socket.IO service handles:
- Authentication middleware
- Connection management
- Event emission
- User tracking
- Admin notifications

### Integration Points

- **HTTP Server**: Socket.IO attached to Express server
- **Task Routes**: Events emitted on task operations
- **Authentication**: JWT verification for secure connections

## Connection Setup

### Server Configuration

```javascript
const { createServer } = require('http');
const { Server } = require('socket.io');

const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true
  }
});
```

### Client Connection

```javascript
import { io } from 'socket.io-client';

const socket = io('http://localhost:3001', {
  auth: {
    token: 'your-jwt-token'
  }
});
```

## Authentication

### JWT Token Verification

Socket.IO connections require valid JWT tokens:

```javascript
// Middleware automatically verifies tokens
socket.on('connect', () => {
  console.log('Authenticated connection established');
});
```

### Token Format

- **Header**: `Authorization: Bearer <token>`
- **Auth Object**: `{ token: '<jwt-token>' }`

## Real-time Events

### Task Events

#### 1. Task Created
**Event**: `task_created`
**Emitted**: When a new task is created
**Data**:
```json
{
  "task": {
    "id": 1,
    "title": "New Task",
    "description": "Task description",
    "category": "Work",
    "completed": false,
    "user_id": 1,
    "created_at": "2023-08-23T18:30:00.000Z",
    "updated_at": "2023-08-23T18:30:00.000Z"
  },
  "createdBy": "John Doe"
}
```

#### 2. Task Updated
**Event**: `task_updated`
**Emitted**: When a task is modified
**Data**:
```json
{
  "task": {
    "id": 1,
    "title": "Updated Task",
    "description": "Updated description",
    "category": "Personal",
    "completed": true,
    "user_id": 1,
    "created_at": "2023-08-23T18:30:00.000Z",
    "updated_at": "2023-08-23T18:35:00.000Z"
  },
  "updatedBy": "John Doe"
}
```

#### 3. Task Deleted
**Event**: `task_deleted`
**Emitted**: When a task is removed
**Data**:
```json
{
  "task": {
    "id": 1,
    "title": "Deleted Task",
    "description": "Task description",
    "category": "Work",
    "completed": false,
    "user_id": 1,
    "created_at": "2023-08-23T18:30:00.000Z",
    "updated_at": "2023-08-23T18:30:00.000Z"
  },
  "deletedBy": "John Doe"
}
```

### Admin Events

Admin users receive additional events with `_admin` suffix:

- `task_created_admin`
- `task_updated_admin`
- `task_deleted_admin`

These events are sent to all admin users regardless of who performed the action.

### Connection Events

#### 1. Connected
**Event**: `connected`
**Emitted**: When user successfully connects
**Data**:
```json
{
  "message": "Successfully connected to real-time service",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

#### 2. Pong
**Event**: `pong`
**Emitted**: Response to ping for connection health
**Data**:
```json
{
  "timestamp": "2023-08-23T18:30:00.000Z"
}
```

## Client Event Listeners

### Basic Setup

```javascript
// Connection events
socket.on('connect', () => {
  console.log('Connected to Socket.IO');
});

socket.on('connected', (data) => {
  console.log('Server confirmed connection:', data.message);
});

socket.on('disconnect', (reason) => {
  console.log('Disconnected:', reason);
});

// Task events
socket.on('task_created', (data) => {
  console.log('New task created:', data.task.title);
  // Update UI with new task
});

socket.on('task_updated', (data) => {
  console.log('Task updated:', data.task.title);
  // Update UI with modified task
});

socket.on('task_deleted', (data) => {
  console.log('Task deleted:', data.task.title);
  // Remove task from UI
});

// Admin events
socket.on('task_created_admin', (data) => {
  console.log('Admin notification - Task created:', data.task.title);
  // Show admin notification
});
```

### Advanced Features

```javascript
// Join/leave rooms
socket.emit('join_room', 'admin-dashboard');
socket.emit('leave_room', 'admin-dashboard');

// Connection health check
socket.emit('ping');
socket.on('pong', (data) => {
  console.log('Connection healthy:', data.timestamp);
});
```

## Server-Side Event Emission

### Automatic Events

Events are automatically emitted when tasks are modified through the API:

```javascript
// In task routes
const newTask = result.rows[0];

// Emit Socket.IO event for task creation
if (socketService) {
  socketService.emitTaskCreated(newTask, req.user.id);
}
```

### Manual Event Emission

```javascript
// Emit to specific user
socketService.emitToUser(userId, 'custom_event', data);

// Emit to all connected users
socketService.emitToAll('broadcast_event', data);

// Emit to admin users only
socketService.emitToAdmins('admin_event', data);
```

## Connection Management

### Connected Users Tracking

The server tracks all connected users:

```javascript
// Get connected users
const users = socketService.getConnectedUsers();
console.log('Connected users:', users);

// Get connection count
const count = socketService.getConnectionCount();
console.log('Active connections:', count);
```

### Socket Status Endpoint

**GET** `/socket-status`

Returns information about connected users:

```json
{
  "connectedUsers": [
    {
      "userId": 1,
      "socketId": "socket-id-123",
      "user": {
        "id": 1,
        "email": "user@example.com",
        "name": "John Doe"
      },
      "connectedAt": "2023-08-23T18:30:00.000Z"
    }
  ],
  "connectionCount": 1,
  "status": "Socket.IO is running"
}
```

## Error Handling

### Connection Errors

```javascript
socket.on('connect_error', (error) => {
  console.error('Connection failed:', error.message);
  // Handle authentication errors, network issues, etc.
});
```

### Authentication Errors

- **Missing Token**: `Authentication token required`
- **Invalid Token**: `Invalid token`
- **User Not Found**: `User not found`

### Reconnection

Socket.IO automatically handles reconnection:

```javascript
socket.on('disconnect', (reason) => {
  if (reason === 'io server disconnect') {
    // Server disconnected, reconnect manually
    socket.connect();
  }
});
```

## Environment Variables

```env
# Frontend URL for CORS
FRONTEND_URL=http://localhost:3000

# JWT Secret (required for authentication)
JWT_SECRET=your-super-secret-jwt-key-here
```

## Testing

### Run Socket.IO Tests

```bash
# Start the server
npm run dev

# In another terminal, run Socket.IO tests
npm run test:socket
```

### Test Features

The test script demonstrates:
- User registration and authentication
- Socket.IO connection establishment
- Real-time task operations
- Event emission and reception
- Connection health monitoring
- Admin event handling

## Best Practices

### Security

1. **Always authenticate connections** with valid JWT tokens
2. **Validate user permissions** before emitting events
3. **Use HTTPS** in production for secure connections
4. **Implement rate limiting** for Socket.IO events

### Performance

1. **Emit events only when necessary** to avoid spam
2. **Use rooms** for targeted event distribution
3. **Monitor connection count** to prevent resource exhaustion
4. **Implement connection pooling** for high-traffic applications

### Error Handling

1. **Handle connection errors** gracefully
2. **Implement reconnection logic** for better UX
3. **Log Socket.IO events** for debugging
4. **Validate event data** before processing

### Frontend Integration

1. **Store JWT tokens securely** for Socket.IO authentication
2. **Handle connection state** in UI components
3. **Update UI immediately** when receiving events
4. **Show connection status** to users

## Troubleshooting

### Common Issues

1. **Connection refused**: Check if server is running
2. **Authentication failed**: Verify JWT token is valid
3. **Events not received**: Check event listener setup
4. **CORS errors**: Verify FRONTEND_URL configuration

### Debug Mode

Enable Socket.IO debug mode:

```javascript
// Client
const socket = io('http://localhost:3001', {
  auth: { token: 'your-token' },
  debug: true
});

// Server
const io = new Server(server, {
  cors: { origin: "http://localhost:3000" },
  debug: true
});
```

