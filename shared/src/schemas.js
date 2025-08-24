const { z } = require('zod');

// Task schemas
const taskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255, 'Title too long'),
  description: z.string().optional(),
  category: z.string().optional(),
  completed: z.boolean().default(false),
  user_id: z.number().int().positive()
});

const taskUpdateSchema = taskSchema.partial();

// User schemas
const userSchema = z.object({
  email: z.string().email('Invalid email format'),
  password_hash: z.string().min(1, 'Password hash is required'),
  name: z.string().min(1, 'Name is required').max(100, 'Name too long')
});

const userLoginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

const userRegisterSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().min(1, 'Name is required').max(100, 'Name too long')
});

// Category schemas
const categorySchema = z.object({
  name: z.string().min(1, 'Category name is required').max(100, 'Category name too long'),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid color format').default('#007bff'),
  user_id: z.number().int().positive().optional()
});

// Request validation schemas
const createTaskSchema = z.object({
  body: taskSchema,
  query: z.object({}),
  params: z.object({})
});

const updateTaskSchema = z.object({
  body: taskUpdateSchema,
  query: z.object({}),
  params: z.object({
    id: z.string().regex(/^\d+$/, 'Invalid task ID')
  })
});

const getTaskSchema = z.object({
  body: z.object({}),
  query: z.object({}),
  params: z.object({
    id: z.string().regex(/^\d+$/, 'Invalid task ID')
  })
});

const createUserSchema = z.object({
  body: userSchema,
  query: z.object({}),
  params: z.object({})
});

const loginUserSchema = z.object({
  body: userLoginSchema,
  query: z.object({}),
  params: z.object({})
});

const registerUserSchema = z.object({
  body: userRegisterSchema,
  query: z.object({}),
  params: z.object({})
});

module.exports = {
  taskSchema,
  taskUpdateSchema,
  userSchema,
  userLoginSchema,
  userRegisterSchema,
  categorySchema,
  createTaskSchema,
  updateTaskSchema,
  getTaskSchema,
  createUserSchema,
  loginUserSchema,
  registerUserSchema
};
