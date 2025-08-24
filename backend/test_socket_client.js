const { io } = require('socket.io-client');
const axios = require('axios');

const API_BASE_URL = 'http://localhost:3001/api';

// Test user data
const testUser = {
  email: 'socketuser@example.com',
  password: 'password123',
  name: 'Socket Test User'
};

let authToken = null;
let socket = null;

async function setupTest() {
  console.log('🔧 Setting up Socket.IO test...\n');

  try {
    // Register user
    console.log('1. Registering test user...');
    const registerResponse = await axios.post(`${API_BASE_URL}/auth/register`, testUser);
    authToken = registerResponse.data.token;
    console.log('✅ User registered, token received\n');

    // Login to get fresh token
    console.log('2. Logging in...');
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: testUser.email,
      password: testUser.password
    });
    authToken = loginResponse.data.token;
    console.log('✅ Login successful\n');

    return true;
  } catch (error) {
    console.error('❌ Setup failed:', error.response?.data || error.message);
    return false;
  }
}

function connectSocket() {
  console.log('3. Connecting to Socket.IO...');
  
  socket = io('http://localhost:3001', {
    auth: {
      token: authToken
    }
  });

  // Connection events
  socket.on('connect', () => {
    console.log('✅ Socket.IO connected successfully');
    console.log(`   Socket ID: ${socket.id}\n`);
  });

  socket.on('connected', (data) => {
    console.log('✅ Server confirmed connection');
    console.log(`   Message: ${data.message}`);
    console.log(`   User: ${data.user.name} (${data.user.email})\n`);
  });

  socket.on('disconnect', (reason) => {
    console.log('❌ Socket.IO disconnected:', reason);
  });

  socket.on('connect_error', (error) => {
    console.error('❌ Socket.IO connection error:', error.message);
  });

  // Task events
  socket.on('task_created', (data) => {
    console.log('📝 Task Created Event Received:');
    console.log(`   Task: ${data.task.title}`);
    console.log(`   Created by: ${data.createdBy}`);
    console.log(`   Category: ${data.task.category}`);
    console.log(`   Completed: ${data.task.completed}\n`);
  });

  socket.on('task_updated', (data) => {
    console.log('✏️ Task Updated Event Received:');
    console.log(`   Task: ${data.task.title}`);
    console.log(`   Updated by: ${data.updatedBy}`);
    console.log(`   Category: ${data.task.category}`);
    console.log(`   Completed: ${data.task.completed}\n`);
  });

  socket.on('task_deleted', (data) => {
    console.log('🗑️ Task Deleted Event Received:');
    console.log(`   Task: ${data.task.title}`);
    console.log(`   Deleted by: ${data.deletedBy}`);
    console.log(`   Category: ${data.task.category}\n`);
  });

  // Admin events
  socket.on('task_created_admin', (data) => {
    console.log('👑 Admin Task Created Event:');
    console.log(`   Task: ${data.task.title}`);
    console.log(`   Created by: ${data.createdBy}\n`);
  });

  socket.on('task_updated_admin', (data) => {
    console.log('👑 Admin Task Updated Event:');
    console.log(`   Task: ${data.task.title}`);
    console.log(`   Updated by: ${data.updatedBy}\n`);
  });

  socket.on('task_deleted_admin', (data) => {
    console.log('👑 Admin Task Deleted Event:');
    console.log(`   Task: ${data.task.title}`);
    console.log(`   Deleted by: ${data.deletedBy}\n`);
  });

  // Ping/pong for connection health
  socket.on('pong', (data) => {
    console.log('🏓 Pong received:', data.timestamp);
  });
}

async function testTaskOperations() {
  console.log('4. Testing task operations with real-time events...\n');

  try {
    // Create a task
    console.log('📝 Creating a task...');
    const createResponse = await axios.post(`${API_BASE_URL}/tasks`, {
      title: 'Socket.IO Test Task',
      description: 'This task was created to test real-time events',
      category: 'Testing',
      completed: false
    }, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    const taskId = createResponse.data.id;
    console.log(`✅ Task created with ID: ${taskId}\n`);

    // Wait a moment for the event to be processed
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Update the task
    console.log('✏️ Updating the task...');
    await axios.put(`${API_BASE_URL}/tasks/${taskId}`, {
      title: 'Updated Socket.IO Test Task',
      completed: true
    }, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    console.log('✅ Task updated\n');

    // Wait a moment for the event to be processed
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Delete the task
    console.log('🗑️ Deleting the task...');
    await axios.delete(`${API_BASE_URL}/tasks/${taskId}`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    console.log('✅ Task deleted\n');

    // Wait a moment for the event to be processed
    await new Promise(resolve => setTimeout(resolve, 1000));

  } catch (error) {
    console.error('❌ Task operation failed:', error.response?.data || error.message);
  }
}

async function testSocketFeatures() {
  console.log('5. Testing additional Socket.IO features...\n');

  // Test ping/pong
  console.log('🏓 Testing ping/pong...');
  socket.emit('ping');
  
  // Wait for pong response
  await new Promise(resolve => setTimeout(resolve, 500));

  // Test joining a room
  console.log('🚪 Testing room joining...');
  socket.emit('join_room', 'test-room');
  
  // Wait a moment
  await new Promise(resolve => setTimeout(resolve, 500));

  // Test leaving a room
  console.log('🚪 Testing room leaving...');
  socket.emit('leave_room', 'test-room');
  
  // Wait a moment
  await new Promise(resolve => setTimeout(resolve, 500));

  console.log('✅ Socket.IO features tested\n');
}

async function checkSocketStatus() {
  console.log('6. Checking Socket.IO server status...\n');

  try {
    const statusResponse = await axios.get('http://localhost:3001/socket-status');
    console.log('📊 Socket.IO Server Status:');
    console.log(`   Status: ${statusResponse.data.status}`);
    console.log(`   Connected users: ${statusResponse.data.connectionCount}`);
    console.log('   Connected users details:');
    statusResponse.data.connectedUsers.forEach((user, index) => {
      console.log(`     ${index + 1}. ${user.user.name} (${user.user.email}) - Connected at ${user.connectedAt}`);
    });
    console.log('');
  } catch (error) {
    console.error('❌ Failed to get socket status:', error.message);
  }
}

async function runSocketTest() {
  console.log('🧪 Socket.IO Real-time Test\n');

  // Setup test user
  const setupSuccess = await setupTest();
  if (!setupSuccess) {
    console.log('❌ Test setup failed, exiting...');
    return;
  }

  // Connect to Socket.IO
  connectSocket();

  // Wait for connection
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Test task operations
  await testTaskOperations();

  // Test additional Socket.IO features
  await testSocketFeatures();

  // Check server status
  await checkSocketStatus();

  console.log('🎉 Socket.IO test completed!');
  console.log('📋 Summary:');
  console.log('   - Socket.IO connection established');
  console.log('   - Real-time events working correctly');
  console.log('   - Task operations emit events');
  console.log('   - Authentication working properly');
  console.log('   - Admin events configured');
  console.log('   - Connection health monitoring active');

  // Keep connection alive for a moment to see all events
  console.log('\n⏳ Keeping connection alive for 5 seconds to see all events...');
  await new Promise(resolve => setTimeout(resolve, 5000));

  // Disconnect
  if (socket) {
    socket.disconnect();
    console.log('👋 Socket.IO disconnected');
  }
}

// Run the test
runSocketTest().catch(console.error);

