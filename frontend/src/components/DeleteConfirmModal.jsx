import React from 'react';

const DeleteConfirmModal = ({ task, onConfirm, onCancel }) => {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 z-50">
      <div className="card max-w-md w-full">
        <div className="p-6">
          <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-500/20 rounded-full">
            <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          
          <div className="text-center">
            <h3 className="text-lg font-semibold text-white mb-2">
              Delete Task
            </h3>
            <p className="text-gray-300 mb-4">
              Are you sure you want to delete this task? This action cannot be undone.
            </p>
            
            <div className="bg-gray-800/50 rounded-lg p-4 mb-6 border border-[#8DBCC7]/20">
              <h4 className="text-white font-medium mb-2">{task?.title}</h4>
              {task?.description && (
                <p className="text-gray-300 text-sm">{task.description}</p>
              )}
              <div className="flex items-center justify-center mt-2">
                <span className={`badge ${
                  task?.category === 'work' ? 'badge-work' :
                  task?.category === 'personal' ? 'badge-personal' :
                  task?.category === 'shopping' ? 'badge-shopping' :
                  task?.category === 'health' ? 'badge-health' :
                  'badge-other'
                }`}>
                  {task?.category === 'work' ? '💼' : 
                   task?.category === 'personal' ? '👤' :
                   task?.category === 'shopping' ? '🛒' :
                   task?.category === 'health' ? '🏥' : '📝'} {task?.category || 'other'}
                </span>
              </div>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={onCancel}
                className="btn btn-secondary flex-1 py-2 px-4 rounded-xl font-medium transition-all duration-200"
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                className="btn btn-danger flex-1 py-2 px-4 rounded-xl font-medium transition-all duration-200"
              >
                Delete Task
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;
