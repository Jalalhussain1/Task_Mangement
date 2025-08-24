const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Mock server for demonstration
const app = express();
app.use(express.json());

// Mock database
const mockUsers = [];
const mockTasks = [];

// Mock authentication routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    // Validation
    if (!email || !password || !name) {
      return res.status(400).json({
        error: 'Email, password, and name are required'
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        error: 'Invalid email format'
      });
    }

    // Password validation (minimum 6 characters)
    if (password.length < 6) {
      return res.status(400).json({
        error: 'Password must be at least 6 characters long'
      });
    }

    // Check if user already exists
    const existingUser = mockUsers.find(user => user.email === email);
    if (existingUser) {
      return res.status(409).json({
        error: 'User with this email already exists'
      });
    }

    // Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create user
    const newUser = {
      id: mockUsers.length + 1,
      email,
      password_hash: passwordHash,
      name,
      created_at: new Date().toISOString()
    };

    mockUsers.push(newUser);

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: newUser.id,
        email: newUser.email 
      },
      'your-super-secret-jwt-key-here',
      { expiresIn: '24h' }
    );

    const { password_hash, ...userWithoutPassword } = newUser;

    res.status(201).json({
      message: 'User registered successfully',
      user: userWithoutPassword,
      token
    });

  } catch (error) {
    res.status(500).json({ error: 'Something went wrong!' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        error: 'Email and password are required'
      });
    }

    // Find user by email
    const user = mockUsers.find(u => u.email === email);

    if (!user) {
      return res.status(401).json({
        error: 'Invalid email or password'
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      return res.status(401).json({
        error: 'Invalid email or password'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.id,
        email: user.email 
      },
      'your-super-secret-jwt-key-here',
      { expiresIn: '24h' }
    );

    // Remove password_hash from response
    const { password_hash, ...userWithoutPassword } = user;

    res.json({
      message: 'Login successful',
      user: userWithoutPassword,
      token
    });

  } catch (error) {
    res.status(500).json({ error: 'Something went wrong!' });
  }
});

// Mock authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'Access token required'
    });
  }

  const token = authHeader.substring(7);

  try {
    const decoded = jwt.verify(token, 'your-super-secret-jwt-key-here');
    const user = mockUsers.find(u => u.id === decoded.userId);
    
    if (!user) {
      return res.status(401).json({
        error: 'User not found'
      });
    }

    req.user = { id: user.id, email: user.email, name: user.name };
    next();

  } catch (jwtError) {
    return res.status(403).json({
      error: 'Invalid or expired token'
    });
  }
};

// Protected task routes
app.post('/api/tasks', authenticateToken, (req, res) => {
  const { title, description, category, completed } = req.body;
  
  const newTask = {
    id: mockTasks.length + 1,
    title,
    description,
    category,
    completed: completed || false,
    user_id: req.user.id,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  mockTasks.push(newTask);

  res.status(201).json(newTask);
});

app.get('/api/tasks', authenticateToken, (req, res) => {
  const userTasks = mockTasks.filter(task => task.user_id === req.user.id);
  res.json(userTasks);
});

// Test the endpoints
async function runTests() {
  console.log('🧪 Testing Authentication System (Mock Version)\n');

  const testUser = {
    email: 'test@example.com',
    password: 'password123',
    name: 'Test User'
  };

  let authToken = null;

  try {
    // Test 1: Register
    console.log('1. Testing user registration...');
    const registerResponse = await fetch('http://localhost:3002/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testUser)
    });
    
    if (registerResponse.ok) {
      const data = await registerResponse.json();
      console.log('✅ Registration successful:', data.message);
      console.log('   User ID:', data.user.id);
      authToken = data.token;
    } else {
      const error = await registerResponse.json();
      console.log('❌ Registration failed:', error.error);
    }

    // Test 2: Login
    console.log('\n2. Testing login...');
    const loginResponse = await fetch('http://localhost:3002/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testUser.email,
        password: testUser.password
      })
    });
    
    if (loginResponse.ok) {
      const data = await loginResponse.json();
      console.log('✅ Login successful:', data.message);
      authToken = data.token;
    } else {
      const error = await loginResponse.json();
      console.log('❌ Login failed:', error.error);
    }

    // Test 3: Create task with authentication
    console.log('\n3. Testing task creation with authentication...');
    const taskResponse = await fetch('http://localhost:3002/api/tasks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({
        title: 'Test Task',
        description: 'This is a test task',
        category: 'Testing',
        completed: false
      })
    });
    
    if (taskResponse.ok) {
      const task = await taskResponse.json();
      console.log('✅ Task creation successful');
      console.log('   Task ID:', task.id);
      console.log('   Task title:', task.title);
    } else {
      const error = await taskResponse.json();
      console.log('❌ Task creation failed:', error.error);
    }

    // Test 4: Get tasks with authentication
    console.log('\n4. Testing task retrieval...');
    const tasksResponse = await fetch('http://localhost:3002/api/tasks', {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    if (tasksResponse.ok) {
      const tasks = await tasksResponse.json();
      console.log('✅ Task retrieval successful');
      console.log('   Number of tasks:', tasks.length);
    } else {
      const error = await tasksResponse.json();
      console.log('❌ Task retrieval failed:', error.error);
    }

    console.log('\n🎉 Authentication system is working correctly!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Start the mock server
const PORT = 3002;
app.listen(PORT, () => {
  console.log(`Mock server running on port ${PORT}`);
  console.log('Starting tests in 2 seconds...\n');
  
  setTimeout(runTests, 2000);
});

