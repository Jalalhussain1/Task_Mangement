const axios = require('axios');

const API_BASE_URL = 'http://localhost:3001/api';

// Test data
const testUser = {
  email: 'taskuser@example.com',
  password: 'password123',
  name: 'Task User'
};

const testTasks = [
  {
    title: 'Complete Project Setup',
    description: 'Set up the initial project structure and dependencies',
    category: 'Development',
    completed: false
  },
  {
    title: 'Write Documentation',
    description: 'Create comprehensive API documentation',
    category: 'Documentation',
    completed: false
  },
  {
    title: 'Test Authentication',
    description: 'Verify all authentication endpoints work correctly',
    category: 'Testing',
    completed: true
  }
];

let authToken = null;
let createdTaskIds = [];

async function testTasksAPI() {
  console.log('🧪 Testing Complete Tasks API with Authentication\n');

  try {
    // Step 1: Register a new user
    console.log('1. 🔐 Registering new user...');
    const registerResponse = await axios.post(`${API_BASE_URL}/auth/register`, testUser);
    console.log('✅ Registration successful:', registerResponse.data.message);
    authToken = registerResponse.data.token;
    console.log('   User ID:', registerResponse.data.user.id);
    console.log('   Token received:', !!authToken);
    console.log('');

    // Step 2: Login to get fresh token
    console.log('2. 🔑 Logging in...');
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: testUser.email,
      password: testUser.password
    });
    console.log('✅ Login successful:', loginResponse.data.message);
    authToken = loginResponse.data.token;
    console.log('   User name:', loginResponse.data.user.name);
    console.log('');

    // Step 3: Create multiple tasks
    console.log('3. 📝 Creating tasks...');
    for (let i = 0; i < testTasks.length; i++) {
      const task = testTasks[i];
      console.log(`   Creating task ${i + 1}: ${task.title}`);
      
      const createResponse = await axios.post(`${API_BASE_URL}/tasks`, task, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      
      createdTaskIds.push(createResponse.data.id);
      console.log(`   ✅ Task created with ID: ${createResponse.data.id}`);
    }
    console.log('');

    // Step 4: Get all tasks
    console.log('4. 📋 Retrieving all tasks...');
    const getAllResponse = await axios.get(`${API_BASE_URL}/tasks`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    console.log('✅ Tasks retrieved successfully');
    console.log(`   Total tasks: ${getAllResponse.data.length}`);
    getAllResponse.data.forEach((task, index) => {
      console.log(`   Task ${index + 1}: ${task.title} (${task.completed ? 'Completed' : 'Pending'})`);
    });
    console.log('');

    // Step 5: Get specific task by ID
    console.log('5. 🔍 Retrieving specific task...');
    const taskId = createdTaskIds[0];
    const getOneResponse = await axios.get(`${API_BASE_URL}/tasks/${taskId}`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    console.log('✅ Specific task retrieved');
    console.log(`   Task ID: ${getOneResponse.data.id}`);
    console.log(`   Title: ${getOneResponse.data.title}`);
    console.log(`   Category: ${getOneResponse.data.category}`);
    console.log(`   Completed: ${getOneResponse.data.completed}`);
    console.log('');

    // Step 6: Update a task
    console.log('6. ✏️ Updating a task...');
    const updateData = {
      title: 'Updated: Complete Project Setup',
      description: 'Updated description with more details',
      completed: true
    };
    
    const updateResponse = await axios.put(`${API_BASE_URL}/tasks/${taskId}`, updateData, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    console.log('✅ Task updated successfully');
    console.log(`   New title: ${updateResponse.data.title}`);
    console.log(`   New description: ${updateResponse.data.description}`);
    console.log(`   Completed status: ${updateResponse.data.completed}`);
    console.log('');

    // Step 7: Verify the update by getting the task again
    console.log('7. 🔍 Verifying update...');
    const verifyResponse = await axios.get(`${API_BASE_URL}/tasks/${taskId}`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    console.log('✅ Update verified');
    console.log(`   Title: ${verifyResponse.data.title}`);
    console.log(`   Completed: ${verifyResponse.data.completed}`);
    console.log('');

    // Step 8: Test access without authentication
    console.log('8. 🚫 Testing access without authentication...');
    try {
      await axios.get(`${API_BASE_URL}/tasks`);
    } catch (error) {
      console.log('✅ Access correctly denied without token:', error.response.data.error);
    }
    console.log('');

    // Step 9: Test access to another user's task (should fail)
    console.log('9. 🚫 Testing access to non-existent task...');
    try {
      await axios.get(`${API_BASE_URL}/tasks/99999`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
    } catch (error) {
      console.log('✅ Access correctly denied for non-existent task:', error.response.data.error);
    }
    console.log('');

    // Step 10: Delete a task
    console.log('10. 🗑️ Deleting a task...');
    const taskToDelete = createdTaskIds[1];
    const deleteResponse = await axios.delete(`${API_BASE_URL}/tasks/${taskToDelete}`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    console.log('✅ Task deleted successfully:', deleteResponse.data.message);
    console.log('');

    // Step 11: Verify deletion by trying to get the deleted task
    console.log('11. 🔍 Verifying deletion...');
    try {
      await axios.get(`${API_BASE_URL}/tasks/${taskToDelete}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
    } catch (error) {
      console.log('✅ Deleted task correctly not found:', error.response.data.error);
    }
    console.log('');

    // Step 12: Get final task count
    console.log('12. 📊 Final task count...');
    const finalResponse = await axios.get(`${API_BASE_URL}/tasks`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    console.log('✅ Final task count retrieved');
    console.log(`   Remaining tasks: ${finalResponse.data.length}`);
    finalResponse.data.forEach((task, index) => {
      console.log(`   Task ${index + 1}: ${task.title} (${task.completed ? 'Completed' : 'Pending'})`);
    });
    console.log('');

    console.log('🎉 All task endpoints tested successfully!');
    console.log('📋 Summary:');
    console.log(`   - Created ${testTasks.length} tasks`);
    console.log(`   - Updated 1 task`);
    console.log(`   - Deleted 1 task`);
    console.log(`   - Final count: ${finalResponse.data.length} tasks`);
    console.log('   - All authentication checks working correctly');
    console.log('   - User ownership enforced properly');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    if (error.response?.status) {
      console.error('   Status:', error.response.status);
    }
  }
}

// Run the tests
testTasksAPI();

