import React, { useState, useEffect } from 'react';
import socketService from '../services/socketService';

const RealTimeNotification = () => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const handleTaskCreated = (data) => {
      if (data.createdBy) {
        addNotification(`${data.createdBy} created a new task: "${data.task.title}"`, 'success');
      }
    };

    const handleTaskUpdated = (data) => {
      if (data.updatedBy) {
        addNotification(`${data.updatedBy} updated task: "${data.task.title}"`, 'info');
      }
    };

    const handleTaskDeleted = (data) => {
      if (data.deletedBy) {
        addNotification(`${data.deletedBy} deleted task: "${data.task.title}"`, 'warning');
      }
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

  const addNotification = (message, type = 'info') => {
    const id = Date.now();
    const notification = {
      id,
      message,
      type,
      timestamp: new Date()
    };

    setNotifications(prev => [...prev, notification]);

    // Auto-remove notification after 5 seconds
    setTimeout(() => {
      removeNotification(id);
    }, 5000);
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  const getNotificationClass = (type) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800 shadow-green-100';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800 shadow-yellow-100';
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800 shadow-red-100';
      default:
        return 'bg-blue-50 border-blue-200 text-blue-800 shadow-blue-100';
    }
  };

  if (notifications.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 space-y-3">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`max-w-sm w-full border-l-4 p-4 rounded-2xl shadow-lg backdrop-blur-sm ${getNotificationClass(notification.type)} transform transition-all duration-300 hover:scale-105`}
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-semibold">{notification.message}</p>
              <p className="text-xs opacity-75 mt-1">
                {notification.timestamp.toLocaleTimeString()}
              </p>
            </div>
            <button
              onClick={() => removeNotification(notification.id)}
              className="ml-4 text-gray-400 hover:text-gray-600 hover:bg-white/50 p-1 rounded-lg transition-all duration-200"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default RealTimeNotification;
