-- Test queries for the task management database
-- Run these queries to verify your database setup

-- 1. Check if tables exist
SELECT table_name, table_type 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('users', 'tasks')
ORDER BY table_name;

-- 2. Check table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;

SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'tasks' 
ORDER BY ordinal_position;

-- 3. Check foreign key constraints
SELECT 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND tc.table_name = 'tasks';

-- 4. Count records in each table
SELECT 'users' as table_name, COUNT(*) as record_count FROM users
UNION ALL
SELECT 'tasks' as table_name, COUNT(*) as record_count FROM tasks;

-- 5. Sample data from users table
SELECT id, email, name, created_at FROM users LIMIT 5;

-- 6. Sample data from tasks table with user information
SELECT 
    t.id,
    t.title,
    t.category,
    t.completed,
    u.name as user_name,
    t.created_at
FROM tasks t
JOIN users u ON t.user_id = u.id
ORDER BY t.created_at DESC
LIMIT 10;

-- 7. Tasks by category
SELECT 
    category,
    COUNT(*) as task_count,
    COUNT(CASE WHEN completed = true THEN 1 END) as completed_count
FROM tasks 
GROUP BY category
ORDER BY task_count DESC;

-- 8. Tasks by user
SELECT 
    u.name as user_name,
    COUNT(*) as total_tasks,
    COUNT(CASE WHEN t.completed = true THEN 1 END) as completed_tasks
FROM tasks t
JOIN users u ON t.user_id = u.id
GROUP BY u.id, u.name
ORDER BY total_tasks DESC;

