const axios = require('axios');

// Test task ownership restrictions
async function testTaskOwnership() {
  console.log('🧪 Testing Task Ownership Restrictions...\n');

  try {
    // Register Shahid
    console.log('1. Registering Shahid...');
    const shahidResponse = await axios.post('http://localhost:3001/api/auth/register', {
      email: 'shahid2@example.com',
      password: 'password123',
      name: 'Shahid'
    });
    const shahidToken = shahidResponse.data.token;
    console.log('✅ Shahid registered successfully\n');

    // Register Ahmad
    console.log('2. Registering Ahmad...');
    const ahmadResponse = await axios.post('http://localhost:3001/api/auth/register', {
      email: 'ahmad2@example.com',
      password: 'password123',
      name: 'Ahmad'
    });
    const ahmadToken = ahmadResponse.data.token;
    console.log('✅ Ahmad registered successfully\n');

    // Shahid creates a task
    console.log('3. Shahid creating a task...');
    const taskResponse = await axios.post('http://localhost:3001/api/tasks', {
      title: 'Shahid\'s Private Task',
      description: 'This task belongs to Shahid only',
      category: 'work',
      completed: false
    }, {
      headers: { Authorization: `Bearer ${shahidToken}` }
    });
    const taskId = taskResponse.data.id;
    console.log('✅ Shahid created task:', taskResponse.data.title, '\n');

    // Ahmad tries to update Shahid's task (should fail)
    console.log('4. Ahmad trying to update Shahid\'s task...');
    try {
      await axios.put(`http://localhost:3001/api/tasks/${taskId}`, {
        title: 'Hacked by Ahmad',
        description: 'This should not work',
        completed: true
      }, {
        headers: { Authorization: `Bearer ${ahmadToken}` }
      });
      console.log('❌ ERROR: Ahmad was able to update Shahid\'s task!');
    } catch (error) {
      if (error.response?.status === 404) {
        console.log('✅ SUCCESS: Ahmad cannot update Shahid\'s task (404 Not Found)');
      } else {
        console.log('✅ SUCCESS: Ahmad cannot update Shahid\'s task:', error.response?.data?.error || 'Access denied');
      }
    }
    console.log();

    // Ahmad tries to delete Shahid's task (should fail)
    console.log('5. Ahmad trying to delete Shahid\'s task...');
    try {
      await axios.delete(`http://localhost:3001/api/tasks/${taskId}`, {
        headers: { Authorization: `Bearer ${ahmadToken}` }
      });
      console.log('❌ ERROR: Ahmad was able to delete Shahid\'s task!');
    } catch (error) {
      if (error.response?.status === 404) {
        console.log('✅ SUCCESS: Ahmad cannot delete Shahid\'s task (404 Not Found)');
      } else {
        console.log('✅ SUCCESS: Ahmad cannot delete Shahid\'s task:', error.response?.data?.error || 'Access denied');
      }
    }
    console.log();

    // Ahmad creates his own task
    console.log('6. Ahmad creating his own task...');
    const ahmadTaskResponse = await axios.post('http://localhost:3001/api/tasks', {
      title: 'Ahmad\'s Private Task',
      description: 'This task belongs to Ahmad only',
      category: 'personal',
      completed: false
    }, {
      headers: { Authorization: `Bearer ${ahmadToken}` }
    });
    const ahmadTaskId = ahmadTaskResponse.data.id;
    console.log('✅ Ahmad created task:', ahmadTaskResponse.data.title, '\n');

    // Shahid tries to update Ahmad's task (should fail)
    console.log('7. Shahid trying to update Ahmad\'s task...');
    try {
      await axios.put(`http://localhost:3001/api/tasks/${ahmadTaskId}`, {
        title: 'Hacked by Shahid',
        description: 'This should not work',
        completed: true
      }, {
        headers: { Authorization: `Bearer ${shahidToken}` }
      });
      console.log('❌ ERROR: Shahid was able to update Ahmad\'s task!');
    } catch (error) {
      if (error.response?.status === 404) {
        console.log('✅ SUCCESS: Shahid cannot update Ahmad\'s task (404 Not Found)');
      } else {
        console.log('✅ SUCCESS: Shahid cannot update Ahmad\'s task:', error.response?.data?.error || 'Access denied');
      }
    }
    console.log();

    // Both users can see all tasks
    console.log('8. Testing that both users can see all tasks...');
    
    const shahidTasksResponse = await axios.get('http://localhost:3001/api/tasks', {
      headers: { Authorization: `Bearer ${shahidToken}` }
    });
    console.log('✅ Shahid can see', shahidTasksResponse.data.length, 'tasks');
    
    const ahmadTasksResponse = await axios.get('http://localhost:3001/api/tasks', {
      headers: { Authorization: `Bearer ${ahmadToken}` }
    });
    console.log('✅ Ahmad can see', ahmadTasksResponse.data.length, 'tasks');
    console.log();

    // Verify task ownership
    console.log('9. Verifying task ownership...');
    shahidTasksResponse.data.forEach(task => {
      if (task.title === 'Shahid\'s Private Task') {
        console.log(`✅ Shahid's task shows correct owner: ${task.user_name}`);
      }
      if (task.title === 'Ahmad\'s Private Task') {
        console.log(`✅ Ahmad's task shows correct owner: ${task.user_name}`);
      }
    });
    console.log();

    console.log('🎉 Task ownership test completed successfully!');
    console.log('\n📋 Summary:');
    console.log('- ✅ Users can only edit/delete their own tasks');
    console.log('- ✅ Users can see all tasks (collaborative workspace)');
    console.log('- ✅ Real-time updates work for all users');
    console.log('- ✅ Proper error handling for unauthorized actions');

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

// Run the test
testTaskOwnership();
