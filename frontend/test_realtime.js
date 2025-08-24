const axios = require('axios');

// Test real-time functionality
async function testRealTimeUpdates() {
  console.log('🧪 Testing Real-time Task Updates...\n');

  try {
    // Register Shahid
    console.log('1. Registering Shahid...');
    const shahidResponse = await axios.post('http://localhost:3001/api/auth/register', {
      email: 'shahid@example.com',
      password: 'password123',
      name: 'Shahid'
    });
    const shahidToken = shahidResponse.data.token;
    console.log('✅ Shahid registered successfully\n');

    // Register Ahmad
    console.log('2. Registering Ahmad...');
    const ahmadResponse = await axios.post('http://localhost:3001/api/auth/register', {
      email: 'ahmad@example.com',
      password: 'password123',
      name: 'Ahmad'
    });
    const ahmadToken = ahmadResponse.data.token;
    console.log('✅ Ahmad registered successfully\n');

    // Shahid creates a task
    console.log('3. Shahid creating a task...');
    const taskResponse = await axios.post('http://localhost:3001/api/tasks', {
      title: 'Task 1 by Shahid',
      description: 'This task was created by Shahid',
      category: 'work',
      completed: false
    }, {
      headers: { Authorization: `Bearer ${shahidToken}` }
    });
    const taskId = taskResponse.data.id;
    console.log('✅ Shahid created task:', taskResponse.data.title, '\n');

    // Ahmad gets all tasks (should see Shahid's task)
    console.log('4. Ahmad fetching all tasks...');
    const ahmadTasksResponse = await axios.get('http://localhost:3001/api/tasks', {
      headers: { Authorization: `Bearer ${ahmadToken}` }
    });
    console.log('✅ Ahmad can see', ahmadTasksResponse.data.length, 'tasks');
    ahmadTasksResponse.data.forEach(task => {
      console.log(`   - ${task.title} (by ${task.user_name})`);
    });
    console.log();

    // Shahid updates the task
    console.log('5. Shahid updating the task...');
    const updateResponse = await axios.put(`http://localhost:3001/api/tasks/${taskId}`, {
      title: 'Task 1 by Shahid - UPDATED',
      description: 'This task was updated by Shahid',
      completed: true
    }, {
      headers: { Authorization: `Bearer ${shahidToken}` }
    });
    console.log('✅ Shahid updated task:', updateResponse.data.title, '\n');

    // Ahmad gets tasks again (should see the updated task)
    console.log('6. Ahmad fetching tasks again...');
    const ahmadUpdatedTasksResponse = await axios.get('http://localhost:3001/api/tasks', {
      headers: { Authorization: `Bearer ${ahmadToken}` }
    });
    console.log('✅ Ahmad can see updated tasks:');
    ahmadUpdatedTasksResponse.data.forEach(task => {
      console.log(`   - ${task.title} (by ${task.user_name}) - Completed: ${task.completed}`);
    });
    console.log();

    console.log('🎉 Real-time test completed!');
    console.log('\n📱 To test in the browser:');
    console.log('1. Open http://localhost:3000 in two different browser windows');
    console.log('2. Login as Shahid in one window');
    console.log('3. Login as Ahmad in the other window');
    console.log('4. Create/update tasks in Shahid\'s window');
    console.log('5. Watch real-time updates in Ahmad\'s window!');

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

// Run the test
testRealTimeUpdates();
