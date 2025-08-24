const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');

// Get all users
router.get('/', async (req, res, next) => {
  try {
    const result = await pool.query(
      'SELECT id, email, name, created_at FROM users ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (error) {
    next(error);
  }
});

// Get user by ID
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT id, email, name, created_at FROM users WHERE id = $1',
      [id]
    );
    
    if (result.rows.length === 0) {
      const error = new Error('User not found');
      error.name = 'NotFoundError';
      throw error;
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

// Create new user
router.post('/', async (req, res, next) => {
  try {
    const { email, password_hash, name } = req.body;
    
    const result = await pool.query(
      `INSERT INTO users (email, password_hash, name)
       VALUES ($1, $2, $3)
       RETURNING id, email, name, created_at`,
      [email, password_hash, name]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

// Update user
router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { email, password_hash, name } = req.body;
    
    const result = await pool.query(
      `UPDATE users 
       SET email = COALESCE($1, email),
           password_hash = COALESCE($2, password_hash),
           name = COALESCE($3, name)
       WHERE id = $4
       RETURNING id, email, name, created_at`,
      [email, password_hash, name, id]
    );
    
    if (result.rows.length === 0) {
      const error = new Error('User not found');
      error.name = 'NotFoundError';
      throw error;
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

// Delete user
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'DELETE FROM users WHERE id = $1 RETURNING id',
      [id]
    );
    
    if (result.rows.length === 0) {
      const error = new Error('User not found');
      error.name = 'NotFoundError';
      throw error;
    }
    
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    next(error);
  }
});

// Get user's tasks
router.get('/:id/tasks', async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT t.*, u.name as user_name 
       FROM tasks t 
       JOIN users u ON t.user_id = u.id 
       WHERE t.user_id = $1 
       ORDER BY t.created_at DESC`,
      [id]
    );
    
    res.json(result.rows);
  } catch (error) {
    next(error);
  }
});

module.exports = router;

