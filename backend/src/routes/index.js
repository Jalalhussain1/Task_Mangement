
const express = require('express');
const router = express.Router();
const tasksRouter = require('./tasks');
const usersRouter = require('./users');
const authRouter = require('./auth');

// Health check route
router.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// Database test route
router.get('/db-test', async (req, res) => {
  try {
    const { testConnection, pool } = require('../config/database');
    const isConnected = await testConnection();
    if (isConnected) {
      const result = await pool.query('SELECT NOW()');
      res.json({ 
        message: 'Database connection successful',
        timestamp: result.rows[0].now
      });
    } else {
      res.status(500).json({ 
        error: 'Database connection failed'
      });
    }
  } catch (error) {
    console.error('Database test error:', error);
    res.status(500).json({ 
      error: 'Database connection failed',
      message: error.message 
    });
  }
});

// API info route
router.get('/', (req, res) => {
  res.json({ 
    message: 'Task Management API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      dbTest: '/db-test',
      auth: {
        register: '/auth/register',
        login: '/auth/login',
        verify: '/auth/verify'
      },
      tasks: '/tasks',
      users: '/users'
    }
  });
});

// Mount auth routes
router.use('/auth', authRouter);

// Mount task routes
router.use('/tasks', tasksRouter);

// Mount user routes
router.use('/users', usersRouter);

module.exports = router;
