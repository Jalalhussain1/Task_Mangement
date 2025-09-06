import React, { useState, useEffect } from 'react';

const TaskForm = ({ task, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'work',
    completed: false
  });

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || '',
        description: task.description || '',
        category: task.category || 'work',
        completed: task.completed || false
      });
    }
  }, [task]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      alert('Title is required');
      return;
    }
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 z-50">
      <div className="card max-w-md w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
        <div className="p-4 sm:p-6">
          <div className="flex justify-between items-start mb-4 sm:mb-6">
            <div className="flex-1">
              <h2 className="text-xl sm:text-2xl font-bold text-white">
                {task ? 'Edit Task' : 'Create New Task'}
              </h2>
              <p className="text-gray-300 text-xs sm:text-sm mt-1">
                {task ? 'Update your task details' : 'Add a new task to your list'}
              </p>
            </div>
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-white hover:bg-[#8DBCC7]/20 p-1 sm:p-2 rounded-xl transition-all duration-200 ml-2"
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            <div className="space-y-2">
              <label htmlFor="title" className="block text-sm font-semibold text-white">
                Title *
              </label>
              <input
                id="title"
                name="title"
                type="text"
                required
                className="form-input text-sm sm:text-base"
                placeholder="Enter task title"
                value={formData.title}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="description" className="block text-sm font-semibold text-white">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                rows="3"
                className="form-input resize-none text-sm sm:text-base"
                placeholder="Enter task description (optional)"
                value={formData.description}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="category" className="block text-sm font-semibold text-white">
                Category
              </label>
              <select
                id="category"
                name="category"
                className="form-select text-sm sm:text-base"
                value={formData.category}
                onChange={handleChange}
              >
                <option value="work">💼 Work</option>
                <option value="personal">👤 Personal</option>
                <option value="shopping">🛒 Shopping</option>
                <option value="health">🏥 Health</option>
                <option value="other">📝 Other</option>
              </select>
            </div>

            {task && (
              <div className="space-y-2">
                <label className="flex items-center space-x-3 p-4 bg-black/30 rounded-xl hover:bg-black/50 transition-colors duration-200 cursor-pointer border border-[#8DBCC7]/20">
                  <input
                    type="checkbox"
                    name="completed"
                    className="w-5 h-5 text-[#8DBCC7] border-gray-300 rounded focus:ring-[#8DBCC7] focus:ring-2"
                    checked={formData.completed}
                    onChange={handleChange}
                  />
                  <span className="text-sm font-medium text-white">Mark as completed</span>
                </label>
              </div>
            )}

            <div className="flex justify-end space-x-3 pt-6">
              <button
                type="button"
                onClick={onCancel}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
              >
                {task ? 'Update Task' : 'Create Task'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TaskForm;
