import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import socketService from '../services/socketService';
import TaskList from './TaskList';
import TaskForm from './TaskForm';
import Header from './Header';
import RealTimeNotification from './RealTimeNotification';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchTasks();
    
    // Listen for real-time task updates
    const handleTaskCreated = (data) => {
      console.log('Real-time: Task created by', data.createdBy);
      setTasks(prevTasks => [data.task, ...prevTasks]);
    };

    const handleTaskUpdated = (data) => {
      console.log('Real-time: Task updated by', data.updatedBy);
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task.id === data.task.id ? data.task : task
        )
      );
    };

    const handleTaskDeleted = (data) => {
      console.log('Real-time: Task deleted by', data.deletedBy);
      setTasks(prevTasks => 
        prevTasks.filter(task => task.id !== data.task.id)
      );
    };

    // Subscribe to Socket.IO events
    socketService.on('task_created', handleTaskCreated);
    socketService.on('task_updated', handleTaskUpdated);
    socketService.on('task_deleted', handleTaskDeleted);

    // Cleanup listeners on unmount
    return () => {
      socketService.off('task_created', handleTaskCreated);
      socketService.off('task_updated', handleTaskUpdated);
      socketService.off('task_deleted', handleTaskDeleted);
    };
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/tasks');
      setTasks(response.data);
      setError('');
    } catch (error) {
      setError('Failed to fetch tasks');
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const createTask = async (taskData) => {
    try {
      const response = await axios.post('/api/tasks', taskData);
      setTasks([response.data, ...tasks]);
      setShowTaskForm(false);
      setError('');
    } catch (error) {
      setError('Failed to create task');
      console.error('Error creating task:', error);
    }
  };

  const updateTask = async (id, taskData) => {
    try {
      const response = await axios.put(`/api/tasks/${id}`, taskData);
      setTasks(tasks.map(task => task.id === id ? response.data : task));
      setEditingTask(null);
      setError('');
    } catch (error) {
      if (error.response?.status === 404) {
        setError('Task not found or you do not have permission to edit this task');
      } else {
        setError('Failed to update task');
      }
      console.error('Error updating task:', error);
    }
  };

  const deleteTask = async (id) => {
    try {
      await axios.delete(`/api/tasks/${id}`);
      setTasks(tasks.filter(task => task.id !== id));
      setError('');
    } catch (error) {
      if (error.response?.status === 404) {
        setError('Task not found or you do not have permission to delete this task');
      } else {
        setError('Failed to delete task');
      }
      console.error('Error deleting task:', error);
    }
  };

  const toggleTaskComplete = async (id, completed) => {
    try {
      const task = tasks.find(t => t.id === id);
      const response = await axios.put(`/api/tasks/${id}`, {
        ...task,
        completed: !completed
      });
      setTasks(tasks.map(task => task.id === id ? response.data : task));
    } catch (error) {
      if (error.response?.status === 404) {
        setError('Task not found or you do not have permission to update this task');
      } else {
        setError('Failed to update task');
      }
      console.error('Error updating task:', error);
    }
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === 'all') return true;
    if (filter === 'completed') return task.completed;
    if (filter === 'pending') return !task.completed;
    return task.category === filter;
  });

  const stats = {
    total: tasks.length,
    completed: tasks.filter(task => task.completed).length,
    pending: tasks.filter(task => !task.completed).length
  };

  return (
    <div className="min-h-screen">
      <Header user={user} onLogout={logout} />
      <RealTimeNotification />
      
      <div className="container mx-auto py-8 px-4">
        {error && (
          <div className="alert alert-error mb-6">
            {error}
          </div>
        )}
        
        {/* Welcome Section */}
        <div className="text-center mb-8 sm:mb-10 mt-4 sm:mt-6">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 px-4">
            Welcome back, {user?.name}! 👋
          </h1>
          <p className="text-gray-300 text-base sm:text-lg px-4">
            Let's organize your day and boost your productivity
          </p>
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="card p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-300 mb-1">Total Tasks</p>
                <p className="text-2xl sm:text-3xl font-bold text-[#8DBCC7]">{stats.total}</p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#8DBCC7]/20 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-[#8DBCC7]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="card p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-300 mb-1">Completed</p>
                <p className="text-2xl sm:text-3xl font-bold text-green-400">{stats.completed}</p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-400/20 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="card p-4 sm:p-6 sm:col-span-2 lg:col-span-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-300 mb-1">Pending</p>
                <p className="text-2xl sm:text-3xl font-bold text-orange-400">{stats.pending}</p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-400/20 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
        
        {/* Controls */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
            <div className="w-full lg:w-64">
              <label className="block text-sm font-semibold text-white mb-2">
                Filter Tasks
              </label>
              <div className="relative">
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="form-select"
                >
                  <option value="all">📋 All Tasks</option>
                  <option value="completed">✅ Completed</option>
                  <option value="pending">⏳ Pending</option>
                  <option value="work">💼 Work</option>
                  <option value="personal">👤 Personal</option>
                  <option value="shopping">🛒 Shopping</option>
                  <option value="health">🏥 Health</option>
                  <option value="other">📝 Other</option>
                </select>
              </div>
            </div>
            
            <div className="w-full lg:w-auto">
              <button
                onClick={() => setShowTaskForm(true)}
                className="btn btn-primary w-full lg:w-auto flex items-center justify-center gap-3 text-sm"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add New Task
              </button>
            </div>
          </div>
        </div>
        
        {/* Task Form Modal */}
        {showTaskForm && (
          <TaskForm
            onSubmit={createTask}
            onCancel={() => setShowTaskForm(false)}
          />
        )}
        
        {/* Edit Task Modal */}
        {editingTask && (
          <TaskForm
            task={editingTask}
            onSubmit={(taskData) => updateTask(editingTask.id, taskData)}
            onCancel={() => setEditingTask(null)}
          />
        )}
        
        {/* Task List */}
        {loading ? (
          <div className="loading">
            <div className="spinner"></div>
          </div>
        ) : (
          <TaskList
            tasks={filteredTasks}
            onEdit={setEditingTask}
            onDelete={deleteTask}
            onToggleComplete={toggleTaskComplete}
          />
        )}
      </div>
    </div>
  );
};

export default Dashboard;
