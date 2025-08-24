#!/bin/bash

echo "🗄️ PostgreSQL Database Setup Script"
echo "=================================="

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL is not installed or not in PATH"
    echo "Please install PostgreSQL first:"
    echo "  macOS: brew install postgresql"
    echo "  Ubuntu: sudo apt install postgresql"
    echo "  Windows: Download from https://www.postgresql.org/download/windows/"
    exit 1
fi

echo "✅ PostgreSQL is installed"

# Check if PostgreSQL service is running
if ! pg_isready -q; then
    echo "❌ PostgreSQL service is not running"
    echo "Please start PostgreSQL service:"
    echo "  macOS: brew services start postgresql"
    echo "  Ubuntu: sudo systemctl start postgresql"
    echo "  Windows: Start PostgreSQL service from Services"
    exit 1
fi

echo "✅ PostgreSQL service is running"

# Create database and user
echo ""
echo "📝 Creating database and user..."

# Create user (if not exists)
psql -d postgres -c "CREATE USER task_user WITH PASSWORD 'task_password';" 2>/dev/null || echo "User task_user already exists"

# Create database (if not exists)
psql -d postgres -c "CREATE DATABASE task_management OWNER task_user;" 2>/dev/null || echo "Database task_management already exists"

# Grant privileges
psql -d postgres -c "GRANT ALL PRIVILEGES ON DATABASE task_management TO task_user;"

echo "✅ Database setup completed!"

# Update .env file
echo ""
echo "🔧 Updating .env file..."

# Create backup of current .env
cp .env .env.backup

# Update DATABASE_URL in .env
sed -i.bak 's|DATABASE_URL=postgresql://username:password@localhost:5432/task_management|DATABASE_URL=postgresql://task_user:task_password@localhost:5432/task_management|' .env

echo "✅ .env file updated with new database URL"

echo ""
echo "📋 Database Configuration:"
echo "  Host: localhost"
echo "  Port: 5432"
echo "  Database: task_management"
echo "  Username: task_user"
echo "  Password: task_password"

echo ""
echo "🚀 Next steps:"
echo "  1. Run: npm run db:init"
echo "  2. Test connection: curl http://localhost:3001/api/db-test"
echo "  3. Check data: curl http://localhost:3001/api/tasks"

