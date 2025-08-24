-- Drop tables in reverse order of dependencies
-- This ensures foreign key constraints are respected

-- Drop triggers first
DROP TRIGGER IF EXISTS update_tasks_updated_at ON tasks;

-- Drop functions
DROP FUNCTION IF EXISTS update_updated_at_column();

-- Drop tables
DROP TABLE IF EXISTS tasks CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Drop indexes (they will be dropped with tables, but explicit for clarity)
-- DROP INDEX IF EXISTS idx_tasks_user_id;
-- DROP INDEX IF EXISTS idx_tasks_completed;
-- DROP INDEX IF EXISTS idx_tasks_category;
-- DROP INDEX IF EXISTS idx_users_email;

