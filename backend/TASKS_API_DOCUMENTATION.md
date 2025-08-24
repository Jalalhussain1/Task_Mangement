# Tasks API Documentation

This document describes the complete Tasks API with JWT authentication and user ownership enforcement.

## Overview

The Tasks API provides full CRUD operations for task management with secure authentication and user isolation. All endpoints require JWT authentication, and users can only access their own tasks.

## Authentication

All task endpoints require a valid JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## API Endpoints

### 1. Get All Tasks
**GET** `/api/tasks`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
[
  {
    "id": 1,
    "title": "Complete Project Setup",
    "description": "Set up the initial project structure",
    "category": "Development",
    "completed": false,
    "user_id": 1,
    "user_name": "John Doe",
    "created_at": "2023-08-23T18:30:00.000Z",
    "updated_at": "2023-08-23T18:30:00.000Z"
  }
]
```

**Notes:**
- Returns only tasks belonging to the authenticated user
- Admin users (email: admin@example.com) can see all tasks
- Tasks are ordered by creation date (newest first)

### 2. Get Task by ID
**GET** `/api/tasks/:id`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "id": 1,
  "title": "Complete Project Setup",
  "description": "Set up the initial project structure",
  "category": "Development",
  "completed": false,
  "user_id": 1,
  "user_name": "John Doe",
  "created_at": "2023-08-23T18:30:00.000Z",
  "updated_at": "2023-08-23T18:30:00.000Z"
}
```

**Notes:**
- Users can only access their own tasks
- Returns 404 if task doesn't exist or doesn't belong to user

### 3. Create New Task
**POST** `/api/tasks`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "title": "New Task",
  "description": "Task description",
  "category": "Work",
  "completed": false
}
```

**Required Fields:**
- `title` (string, required)

**Optional Fields:**
- `description` (string)
- `category` (string)
- `completed` (boolean, defaults to false)

**Response:**
```json
{
  "id": 2,
  "title": "New Task",
  "description": "Task description",
  "category": "Work",
  "completed": false,
  "user_id": 1,
  "created_at": "2023-08-23T18:30:00.000Z",
  "updated_at": "2023-08-23T18:30:00.000Z"
}
```

**Notes:**
- `user_id` is automatically set from the authenticated user
- Returns 201 status on successful creation

### 4. Update Task
**PUT** `/api/tasks/:id`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "title": "Updated Task Title",
  "description": "Updated description",
  "category": "Personal",
  "completed": true
}
```

**All fields are optional** - only provided fields will be updated.

**Response:**
```json
{
  "id": 1,
  "title": "Updated Task Title",
  "description": "Updated description",
  "category": "Personal",
  "completed": true,
  "user_id": 1,
  "created_at": "2023-08-23T18:30:00.000Z",
  "updated_at": "2023-08-23T18:35:00.000Z"
}
```

**Notes:**
- Users can only update their own tasks
- `updated_at` is automatically updated
- Returns 404 if task doesn't exist or doesn't belong to user

### 5. Delete Task
**DELETE** `/api/tasks/:id`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "message": "Task deleted successfully"
}
```

**Notes:**
- Users can only delete their own tasks
- Returns 404 if task doesn't exist or doesn't belong to user

## Error Responses

### Authentication Errors
```json
{
  "error": "Access token required"
}
```

```json
{
  "error": "Invalid or expired token"
}
```

### Not Found Errors
```json
{
  "error": "Task not found"
}
```

### Validation Errors
```json
{
  "error": "Title is required"
}
```

## Security Features

### User Ownership Enforcement
- All task operations are scoped to the authenticated user
- Users cannot access, modify, or delete tasks belonging to other users
- Database queries include `user_id` checks to ensure data isolation

### JWT Authentication
- All endpoints require valid JWT tokens
- Tokens are verified on every request
- User existence is confirmed in the database

### Input Validation
- Required fields are validated
- SQL injection protection through parameterized queries
- XSS protection through proper response handling

## Database Schema

The tasks table structure:

```sql
CREATE TABLE tasks (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    completed BOOLEAN DEFAULT FALSE,
    user_id INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

## Usage Examples

### Using curl

1. **Get all tasks:**
```bash
curl -X GET http://localhost:3001/api/tasks \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

2. **Create a task:**
```bash
curl -X POST http://localhost:3001/api/tasks \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "My Task",
    "description": "Task description",
    "category": "Work",
    "completed": false
  }'
```

3. **Update a task:**
```bash
curl -X PUT http://localhost:3001/api/tasks/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated Task",
    "completed": true
  }'
```

4. **Delete a task:**
```bash
curl -X DELETE http://localhost:3001/api/tasks/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Using JavaScript/Fetch

```javascript
// Get all tasks
const tasksResponse = await fetch('/api/tasks', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
const tasks = await tasksResponse.json();

// Create a task
const createResponse = await fetch('/api/tasks', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    title: 'New Task',
    description: 'Task description',
    category: 'Work'
  })
});

// Update a task
const updateResponse = await fetch('/api/tasks/1', {
  method: 'PUT',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    completed: true
  })
});

// Delete a task
const deleteResponse = await fetch('/api/tasks/1', {
  method: 'DELETE',
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

## Testing

Run the complete tasks API test:

```bash
# Start the server first
npm run dev

# In another terminal, run the tests
npm run test:tasks
```

## Best Practices

1. **Always include the Authorization header** with valid JWT tokens
2. **Handle authentication errors** gracefully in your frontend
3. **Validate input data** before sending requests
4. **Use appropriate HTTP status codes** for different scenarios
5. **Implement proper error handling** for network failures
6. **Store JWT tokens securely** in your frontend application
7. **Refresh tokens** before they expire for better user experience

