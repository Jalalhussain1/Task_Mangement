# Database Schema Documentation

This directory contains all the SQL scripts for the Task Management application database.

## Files Overview

### 1. `complete_schema.sql` - Main Schema File
**Purpose**: Complete database setup with tables, indexes, triggers, and sample data
**Contains**:
- Users table with authentication fields
- Tasks table with category and completion status
- Foreign key constraints
- Indexes for performance
- Triggers for automatic timestamp updates
- Sample data for testing

### 2. `schema_v2.sql` - Clean Schema Only
**Purpose**: Just the table definitions without sample data
**Contains**:
- Users table structure
- Tasks table structure
- Indexes and constraints
- Triggers and functions

### 3. `drop_tables.sql` - Cleanup Script
**Purpose**: Safely remove all database objects
**Contains**:
- Drop triggers and functions
- Drop tables in correct order
- Respects foreign key constraints

### 4. `test_queries.sql` - Verification Queries
**Purpose**: Test and verify database setup
**Contains**:
- Table existence checks
- Structure verification
- Foreign key constraint checks
- Sample data queries
- Analytics queries

## Table Structures

### Users Table
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Tasks Table
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

## Usage

### Initial Setup
```bash
# Initialize database with sample data
npm run db:init

# Or run manually
psql -d your_database -f src/database/complete_schema.sql
```

### Reset Database
```bash
# Reset and reinitialize
npm run db:reset

# Or run manually
psql -d your_database -f src/database/drop_tables.sql
psql -d your_database -f src/database/complete_schema.sql
```

### Test Queries
```bash
# Run test queries to verify setup
psql -d your_database -f src/database/test_queries.sql
```

## Features

- **Automatic Timestamps**: `created_at` and `updated_at` are automatically managed
- **Foreign Key Constraints**: Ensures data integrity between users and tasks
- **Indexes**: Optimized for common query patterns
- **Cascade Deletes**: When a user is deleted, their tasks are automatically removed
- **Sample Data**: Pre-populated with test data for development

## API Endpoints

The database supports these API endpoints:

### Users
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create new user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user
- `GET /api/users/:id/tasks` - Get user's tasks

### Tasks
- `GET /api/tasks` - Get all tasks with user info
- `GET /api/tasks/:id` - Get task by ID with user info
- `POST /api/tasks` - Create new task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

