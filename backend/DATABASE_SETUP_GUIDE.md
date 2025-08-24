# Database Setup and Checking Guide

## 🗄️ PostgreSQL Installation

### Option 1: Install Homebrew First (Recommended for macOS)

```bash
# Install Homebrew
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install PostgreSQL
brew install postgresql
brew services start postgresql
```

### Option 2: Download PostgreSQL App (Easiest for macOS)

1. Go to: https://postgresapp.com/
2. Download and install PostgreSQL.app
3. Start the app and click "Initialize" to create a server

### Option 3: Manual Installation

**macOS:**
```bash
# Using MacPorts
sudo port install postgresql15

# Or download from official website
# https://www.postgresql.org/download/macosx/
```

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

**Windows:**
1. Download from: https://www.postgresql.org/download/windows/
2. Run the installer
3. Remember the password you set for the postgres user

## 🔧 Database Configuration

### Step 1: Create Database and User

Once PostgreSQL is installed, run these commands:

```bash
# Connect to PostgreSQL as superuser
psql -U postgres

# Or if you're on macOS with Homebrew
psql postgres
```

In the PostgreSQL prompt, run:

```sql
-- Create user
CREATE USER task_user WITH PASSWORD 'task_password';

-- Create database
CREATE DATABASE task_management OWNER task_user;

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE task_management TO task_user;

-- Exit PostgreSQL
\q
```

### Step 2: Update Environment Variables

Edit your `.env` file:

```env
# Server Configuration
PORT=3001
NODE_ENV=development

# Database Configuration
DATABASE_URL=postgresql://task_user:task_password@localhost:5432/task_management

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
```

## 🔍 Database Checking Methods

### Method 1: Check via API (Recommended)

```bash
# Start the server
npm run dev

# Test database connection
curl http://localhost:3001/api/db-test

# Check API health
curl http://localhost:3001/api/health
```

### Method 2: Check via PostgreSQL CLI

```bash
# Connect to database
psql -U task_user -d task_management

# List tables
\dt

# Check users table
SELECT * FROM users;

# Check tasks table
SELECT * FROM tasks;

# Exit
\q
```

### Method 3: Run Database Tests

```bash
# Initialize database with sample data
npm run db:init

# Test authentication
npm run test:auth

# Test tasks API
npm run test:tasks
```

### Method 4: Use Database GUI Tools

**pgAdmin (Free):**
1. Download from: https://www.pgadmin.org/download/
2. Connect to your database
3. Browse tables and data visually

**TablePlus (Paid, but excellent):**
1. Download from: https://tableplus.com/
2. Connect to PostgreSQL
3. Browse and edit data

**DBeaver (Free):**
1. Download from: https://dbeaver.io/
2. Connect to PostgreSQL
3. SQL editor and data browser

## 📊 Database Schema Verification

### Check Tables Exist

```sql
-- Connect to database and run:
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';
```

Expected output:
```
 table_name
------------
 users
 tasks
```

### Check Table Structure

```sql
-- Check users table structure
\d users

-- Check tasks table structure
\d tasks
```

### Check Sample Data

```sql
-- Count records
SELECT 'users' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'tasks' as table_name, COUNT(*) as count FROM tasks;

-- View sample data
SELECT * FROM users LIMIT 5;
SELECT * FROM tasks LIMIT 5;
```

## 🚨 Troubleshooting

### Common Issues

**1. Connection Refused**
```bash
# Check if PostgreSQL is running
pg_isready

# Start PostgreSQL service
brew services start postgresql  # macOS
sudo systemctl start postgresql  # Linux
```

**2. Authentication Failed**
```bash
# Check your .env file
cat .env

# Verify DATABASE_URL format
# Should be: postgresql://username:password@host:port/database
```

**3. Database Doesn't Exist**
```bash
# Create database manually
createdb task_management

# Or connect to PostgreSQL and create:
psql postgres
CREATE DATABASE task_management;
\q
```

**4. Permission Denied**
```bash
# Grant permissions
psql postgres
GRANT ALL PRIVILEGES ON DATABASE task_management TO task_user;
\q
```

### Quick Database Reset

If you need to start fresh:

```bash
# Drop and recreate database
dropdb task_management
createdb task_management

# Reinitialize with sample data
npm run db:init
```

## 📋 Database Status Commands

### Check Database Health

```bash
# Test connection
npm run db:init

# Check API endpoints
curl http://localhost:3001/api/health
curl http://localhost:3001/api/db-test

# Check Socket.IO status
curl http://localhost:3001/socket-status
```

### Monitor Database Activity

```sql
-- Check active connections
SELECT * FROM pg_stat_activity;

-- Check table sizes
SELECT 
    schemaname,
    tablename,
    attname,
    n_distinct,
    correlation
FROM pg_stats
WHERE schemaname = 'public';
```

## 🎯 Quick Start Checklist

- [ ] Install PostgreSQL
- [ ] Start PostgreSQL service
- [ ] Create database and user
- [ ] Update .env file
- [ ] Run `npm run db:init`
- [ ] Test connection: `curl http://localhost:3001/api/db-test`
- [ ] Check data: `curl http://localhost:3001/api/tasks`

