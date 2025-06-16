import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Circle, Plus, Calendar, User, Flag } from 'lucide-react';
import { Task } from '../types';

interface TaskBoardProps {
  tasks: Task[];
  onTaskUpdate: (taskId: string, updates: Partial<Task>) => void;
  onTaskCreate: (task: Omit<Task, 'id' | 'createdAt'>) => void;
}

export const TaskBoard: React.FC<TaskBoardProps> = ({ tasks, onTaskUpdate, onTaskCreate }) => {
  const [showNewTaskForm, setShowNewTaskForm] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium' as const,
    status: 'todo' as const
  });

  const taskColumns = {
    'todo': { title: 'To Do', color: 'bg-gray-100', count: 0 },
    'in-progress': { title: 'In Progress', color: 'bg-blue-100', count: 0 },
    'completed': { title: 'Completed', color: 'bg-green-100', count: 0 }
  };

  // Count tasks in each column
  tasks.forEach(task => {
    taskColumns[task.status].count++;
  });

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const handleTaskStatusChange = (taskId: string, status: Task['status']) => {
    onTaskUpdate(taskId, { status });
  };

  const handleNewTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTask.title.trim()) {
      onTaskCreate({
        ...newTask,
        roomId: 'current-room' // This would come from context
      });
      setNewTask({ title: '', description: '', priority: 'medium', status: 'todo' });
      setShowNewTaskForm(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Shared Tasks</h3>
        <button
          onClick={() => setShowNewTaskForm(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add Task</span>
        </button>
      </div>

      {/* New Task Form */}
      <AnimatePresence>
        {showNewTaskForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 p-4 bg-gray-50 rounded-lg"
          >
            <form onSubmit={handleNewTaskSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="Task title..."
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                autoFocus
              />
              <textarea
                placeholder="Description (optional)..."
                value={newTask.description}
                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={2}
              />
              <div className="flex items-center space-x-4">
                <select
                  value={newTask.priority}
                  onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as Task['priority'] })}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="low">Low Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="high">High Priority</option>
                </select>
                <div className="flex space-x-2">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Create
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowNewTaskForm(false)}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Task Columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Object.entries(taskColumns).map(([status, column]) => (
          <div key={status} className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-gray-900">{column.title}</h4>
              <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                {column.count}
              </span>
            </div>

            <div className="space-y-3">
              {tasks
                .filter(task => task.status === status)
                .map((task) => (
                  <motion.div
                    key={task.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h5 className="font-medium text-gray-900 flex-1">{task.title}</h5>
                      <button
                        onClick={() => handleTaskStatusChange(
                          task.id,
                          task.status === 'completed' ? 'todo' : 
                          task.status === 'todo' ? 'in-progress' : 'completed'
                        )}
                        className="text-gray-400 hover:text-blue-600 transition-colors"
                      >
                        {task.status === 'completed' ? 
                          <CheckCircle2 className="w-5 h-5 text-green-600" /> :
                          <Circle className="w-5 h-5" />
                        }
                      </button>
                    </div>

                    {task.description && (
                      <p className="text-sm text-gray-600 mb-3">{task.description}</p>
                    )}

                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded ${getPriorityColor(task.priority)}`}>
                          <Flag className="w-3 h-3 inline mr-1" />
                          {task.priority}
                        </span>
                      </div>

                      {task.assignedTo && (
                        <div className="flex items-center space-x-1 text-gray-500">
                          <User className="w-3 h-3" />
                          <span>{task.assignedTo}</span>
                        </div>
                      )}
                    </div>

                    {task.dueDate && (
                      <div className="flex items-center space-x-1 text-xs text-gray-500 mt-2">
                        <Calendar className="w-3 h-3" />
                        <span>{task.dueDate.toLocaleDateString()}</span>
                      </div>
                    )}
                  </motion.div>
                ))}
            </div>
          </div>
        ))}
      </div>

      {tasks.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>No tasks yet. Create your first task to get started!</p>
        </div>
      )}
    </div>
  );
};