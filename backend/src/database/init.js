const fs = require('fs');
const path = require('path');
const { pool } = require('../config/database');

const initializeDatabase = async () => {
  try {
    console.log('Initializing database...');
    
    // Read the complete schema file
    const schemaPath = path.join(__dirname, 'complete_schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    // Execute the schema
    await pool.query(schema);
    
    console.log('Database schema initialized successfully');
    
    // Test the connection and verify data
    const result = await pool.query('SELECT NOW()');
    console.log('Database connection verified:', result.rows[0].now);
    
    // Verify tables and data
    const userCount = await pool.query('SELECT COUNT(*) FROM users');
    const taskCount = await pool.query('SELECT COUNT(*) FROM tasks');
    console.log(`Users created: ${userCount.rows[0].count}`);
    console.log(`Tasks created: ${taskCount.rows[0].count}`);
    
  } catch (error) {
    console.error('Database initialization failed:', error);
    throw error;
  }
};

const resetDatabase = async () => {
  try {
    console.log('Resetting database...');
    
    // Drop all tables (in reverse order of dependencies)
    await pool.query('DROP TABLE IF EXISTS task_categories CASCADE');
    await pool.query('DROP TABLE IF EXISTS categories CASCADE');
    await pool.query('DROP TABLE IF EXISTS tasks CASCADE');
    await pool.query('DROP TABLE IF EXISTS users CASCADE');
    
    console.log('Database reset completed');
    
    // Reinitialize
    await initializeDatabase();
    
  } catch (error) {
    console.error('Database reset failed:', error);
    throw error;
  }
};

// Run initialization if this file is executed directly
if (require.main === module) {
  const command = process.argv[2];
  
  if (command === 'reset') {
    resetDatabase()
      .then(() => {
        console.log('Database reset and initialization completed');
        process.exit(0);
      })
      .catch((error) => {
        console.error('Failed to reset database:', error);
        process.exit(1);
      });
  } else {
    initializeDatabase()
      .then(() => {
        console.log('Database initialization completed');
        process.exit(0);
      })
      .catch((error) => {
        console.error('Failed to initialize database:', error);
        process.exit(1);
      });
  }
}

module.exports = { initializeDatabase, resetDatabase };
