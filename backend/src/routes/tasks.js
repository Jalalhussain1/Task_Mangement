const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

// Get socketService instance
let socketService;
try {
  const { socketService: service } = require('../index');
  socketService = service;
} catch (error) {
  // Socket service not available (for testing)
  socketService = null;
}

// Get all tasks (all authenticated users can see all tasks for real-time collaboration)
router.get('/', authenticateToken, async (req, res, next) => {
  try {
    // All users can see all tasks for real-time collaboration
    const result = await pool.query(
      `SELECT t.*, u.name as user_name 
       FROM tasks t 
       JOIN users u ON t.user_id = u.id 
       ORDER BY t.created_at DESC`
    );
    
    res.json(result.rows);
  } catch (error) {
    next(error);
  }
});

// Get task by ID (authenticated users can only see their own tasks)
router.get('/:id', authenticateToken, async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT t.*, u.name as user_name 
       FROM tasks t 
       JOIN users u ON t.user_id = u.id 
       WHERE t.id = $1 AND t.user_id = $2`,
      [id, req.user.id]
    );
    
    if (result.rows.length === 0) {
      const error = new Error('Task not found');
      error.name = 'NotFoundError';
      throw error;
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

// Create new task (authenticated users can only create tasks for themselves)
router.post('/', authenticateToken, async (req, res, next) => {
  try {
    const { title, description, category, completed } = req.body;
    
    const result = await pool.query(
      `INSERT INTO tasks (title, description, category, completed, user_id)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [title, description, category, completed || false, req.user.id]
    );
    
    const newTask = result.rows[0];
    
    // Emit Socket.IO event for task creation
    if (socketService) {
      socketService.emitTaskCreated(newTask, req.user.id);
    }
    
    res.status(201).json(newTask);
  } catch (error) {
    next(error);
  }
});

// Update task (authenticated users can only update their own tasks)
router.put('/:id', authenticateToken, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description, category, completed } = req.body;
    
    const result = await pool.query(
      `UPDATE tasks 
       SET title = COALESCE($1, title),
           description = COALESCE($2, description),
           category = COALESCE($3, category),
           completed = COALESCE($4, completed)
       WHERE id = $5 AND user_id = $6
       RETURNING *`,
      [title, description, category, completed, id, req.user.id]
    );
    
    if (result.rows.length === 0) {
      const error = new Error('Task not found');
      error.name = 'NotFoundError';
      throw error;
    }
    
    const updatedTask = result.rows[0];
    
    // Emit Socket.IO event for task update
    if (socketService) {
      socketService.emitTaskUpdated(updatedTask, req.user.id);
    }
    
    res.json(updatedTask);
  } catch (error) {
    next(error);
  }
});

// Delete task (authenticated users can only delete their own tasks)
router.delete('/:id', authenticateToken, async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'DELETE FROM tasks WHERE id = $1 AND user_id = $2 RETURNING *',
      [id, req.user.id]
    );
    
    if (result.rows.length === 0) {
      const error = new Error('Task not found');
      error.name = 'NotFoundError';
      throw error;
    }
    
    const deletedTask = result.rows[0];
    
    // Emit Socket.IO event for task deletion
    if (socketService) {
      socketService.emitTaskDeleted(deletedTask, req.user.id);
    }
    
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
