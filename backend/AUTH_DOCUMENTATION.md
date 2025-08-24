# Authentication System Documentation

This document describes the authentication system implemented in the Task Management API.

## Overview

The authentication system uses JWT (JSON Web Tokens) for stateless authentication and bcrypt for secure password hashing.

## Dependencies

- `bcrypt`: Password hashing
- `jsonwebtoken`: JWT token generation and verification

## Environment Variables

Make sure these are set in your `.env` file:

```env
JWT_SECRET=your-super-secret-jwt-key-here
```

## API Endpoints

### 1. User Registration
**POST** `/api/auth/register`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}
```

**Validation Rules:**
- Email must be valid format
- Password must be at least 6 characters
- Name is required
- Email must be unique

**Response:**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe",
    "created_at": "2023-08-23T18:30:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 2. User Login
**POST** `/api/auth/login`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 3. Token Verification
**GET** `/api/auth/verify`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "message": "Token is valid",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe",
    "created_at": "2023-08-23T18:30:00.000Z"
  }
}
```

## Protected Routes

All task-related endpoints now require authentication:

- `GET /api/tasks` - Get user's tasks
- `GET /api/tasks/:id` - Get specific task
- `POST /api/tasks` - Create new task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

### Authentication Header
For protected routes, include the JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Security Features

### Password Security
- Passwords are hashed using bcrypt with 10 salt rounds
- Original passwords are never stored in the database
- Password validation ensures minimum 6 characters

### JWT Security
- Tokens expire after 24 hours
- Tokens contain user ID and email
- Server validates tokens on each protected request
- Invalid or expired tokens are rejected

### User Isolation
- Users can only access their own tasks
- Admin users (email: admin@example.com) can see all tasks
- User ID is automatically set from the authenticated user

## Error Responses

### Registration Errors
```json
{
  "error": "Email, password, and name are required"
}
```

```json
{
  "error": "Invalid email format"
}
```

```json
{
  "error": "Password must be at least 6 characters long"
}
```

```json
{
  "error": "User with this email already exists"
}
```

### Login Errors
```json
{
  "error": "Email and password are required"
}
```

```json
{
  "error": "Invalid email or password"
}
```

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

## Testing

Run the authentication tests:

```bash
# Start the server first
npm run dev

# In another terminal, run the tests
npm run test:auth
```

## Usage Examples

### Using curl

1. **Register a user:**
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "name": "Test User"
  }'
```

2. **Login:**
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

3. **Create a task (with authentication):**
```bash
curl -X POST http://localhost:3001/api/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "title": "My Task",
    "description": "Task description",
    "category": "Work",
    "completed": false
  }'
```

### Using JavaScript/Fetch

```javascript
// Register
const registerResponse = await fetch('/api/auth/register', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password123',
    name: 'John Doe'
  })
});

const { token } = await registerResponse.json();

// Use token for authenticated requests
const tasksResponse = await fetch('/api/tasks', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

## Database Schema

The authentication system uses the existing `users` table:

```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Best Practices

1. **Store tokens securely** in the frontend (localStorage, sessionStorage, or secure cookies)
2. **Never expose JWT_SECRET** in client-side code
3. **Use HTTPS** in production to protect tokens in transit
4. **Implement token refresh** for better user experience
5. **Log authentication events** for security monitoring
6. **Rate limit** authentication endpoints to prevent brute force attacks

