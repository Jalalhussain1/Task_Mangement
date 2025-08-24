const axios = require('axios');

const API_BASE_URL = 'http://localhost:3001/api';

// Test data
const testUser = {
  email: 'test@example.com',
  password: 'password123',
  name: 'Test User'
};

let authToken = null;

async function testAuth() {
  console.log('🧪 Testing Authentication Endpoints\n');

  try {
    // Test 1: Register a new user
    console.log('1. Testing user registration...');
    const registerResponse = await axios.post(`${API_BASE_URL}/auth/register`, testUser);
    console.log('✅ Registration successful:', registerResponse.data.message);
    console.log('   User ID:', registerResponse.data.user.id);
    console.log('   Token received:', !!registerResponse.data.token);
    authToken = registerResponse.data.token;
    console.log('');

    // Test 2: Try to register the same user again (should fail)
    console.log('2. Testing duplicate registration...');
    try {
      await axios.post(`${API_BASE_URL}/auth/register`, testUser);
    } catch (error) {
      console.log('✅ Duplicate registration correctly rejected:', error.response.data.error);
    }
    console.log('');

    // Test 3: Login with correct credentials
    console.log('3. Testing login with correct credentials...');
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: testUser.email,
      password: testUser.password
    });
    console.log('✅ Login successful:', loginResponse.data.message);
    console.log('   User name:', loginResponse.data.user.name);
    console.log('   New token received:', !!loginResponse.data.token);
    authToken = loginResponse.data.token;
    console.log('');

    // Test 4: Login with wrong password
    console.log('4. Testing login with wrong password...');
    try {
      await axios.post(`${API_BASE_URL}/auth/login`, {
        email: testUser.email,
        password: 'wrongpassword'
      });
    } catch (error) {
      console.log('✅ Wrong password correctly rejected:', error.response.data.error);
    }
    console.log('');

    // Test 5: Verify token
    console.log('5. Testing token verification...');
    const verifyResponse = await axios.get(`${API_BASE_URL}/auth/verify`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    console.log('✅ Token verification successful:', verifyResponse.data.message);
    console.log('   User email:', verifyResponse.data.user.email);
    console.log('');

    // Test 6: Create a task with authentication
    console.log('6. Testing task creation with authentication...');
    const taskData = {
      title: 'Test Task',
      description: 'This is a test task created with authentication',
      category: 'Testing',
      completed: false
    };
    
    const taskResponse = await axios.post(`${API_BASE_URL}/tasks`, taskData, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    console.log('✅ Task creation successful');
    console.log('   Task ID:', taskResponse.data.id);
    console.log('   Task title:', taskResponse.data.title);
    console.log('');

    // Test 7: Get tasks with authentication
    console.log('7. Testing task retrieval with authentication...');
    const tasksResponse = await axios.get(`${API_BASE_URL}/tasks`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    console.log('✅ Task retrieval successful');
    console.log('   Number of tasks:', tasksResponse.data.length);
    console.log('');

    // Test 8: Access protected route without token
    console.log('8. Testing access to protected route without token...');
    try {
      await axios.get(`${API_BASE_URL}/tasks`);
    } catch (error) {
      console.log('✅ Access correctly denied without token:', error.response.data.error);
    }
    console.log('');

    console.log('🎉 All authentication tests passed!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Run the tests
testAuth();

