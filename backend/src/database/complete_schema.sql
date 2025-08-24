-- Complete Task Management Database Schema
-- PostgreSQL tables for users and tasks with sample data

-- =============================================
-- DROP EXISTING TABLES (if any)
-- =============================================

-- Drop triggers first
DROP TRIGGER IF EXISTS update_tasks_updated_at ON tasks;

-- Drop functions
DROP FUNCTION IF EXISTS update_updated_at_column();

-- Drop tables
DROP TABLE IF EXISTS tasks CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- =============================================
-- CREATE TABLES
-- =============================================

-- Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tasks table
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

-- =============================================
-- CREATE INDEXES
-- =============================================

CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_tasks_completed ON tasks(completed);
CREATE INDEX idx_tasks_category ON tasks(category);
CREATE INDEX idx_users_email ON users(email);

-- =============================================
-- CREATE TRIGGERS AND FUNCTIONS
-- =============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at for tasks table
CREATE TRIGGER update_tasks_updated_at 
    BEFORE UPDATE ON tasks
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- INSERT SAMPLE DATA
-- =============================================

-- Insert sample users
INSERT INTO users (email, password_hash, name) VALUES 
    ('admin@example.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Admin User'),
    ('john@example.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'John Doe'),
    ('jane@example.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Jane Smith');

-- Insert sample tasks
INSERT INTO tasks (title, description, category, completed, user_id) VALUES 
    ('Complete project setup', 'Set up the initial project structure and dependencies', 'Development', false, 1),
    ('Review code', 'Review the latest pull requests and provide feedback', 'Code Review', false, 1),
    ('Write documentation', 'Update API documentation and user guides', 'Documentation', true, 1),
    ('Design user interface', 'Create wireframes and mockups for the new features', 'Design', false, 2),
    ('Test application', 'Run comprehensive tests and fix any issues found', 'Testing', false, 2),
    ('Deploy to production', 'Deploy the latest version to production environment', 'DevOps', true, 3),
    ('Plan next sprint', 'Plan tasks and priorities for the upcoming sprint', 'Planning', false, 3);

-- =============================================
-- VERIFICATION QUERIES
-- =============================================

-- Verify tables were created
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name IN ('users', 'tasks');

-- Verify data was inserted
SELECT 'Users count:' as info, COUNT(*) as count FROM users
UNION ALL
SELECT 'Tasks count:', COUNT(*) FROM tasks;

-- Show sample data
SELECT 'Sample users:' as info;
SELECT id, email, name, created_at FROM users LIMIT 3;

SELECT 'Sample tasks:' as info;
SELECT id, title, category, completed, user_id, created_at FROM tasks LIMIT 5;

