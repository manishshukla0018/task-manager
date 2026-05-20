import { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const MyTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchTasks = async () => {
    try {
      const { data } = await api.get(`/tasks?assigneeId=${user._id}`);
      setTasks(data);
    } catch (error) {
      toast.error('Failed to load your tasks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await api.put(`/tasks/${taskId}/status`, { status: newStatus });
      fetchTasks();
      toast.success('Status updated');
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  if (loading) return <div>Loading tasks...</div>;

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">My Tasks</h1>
      
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {tasks.length === 0 ? (
            <li className="px-4 py-8 text-center text-gray-500">You have no tasks assigned.</li>
          ) : (
            tasks.map(task => (
              <li key={task._id} className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0 pr-4">
                    <h3 className="text-lg font-medium text-gray-900 truncate">{task.title}</h3>
                    <p className="mt-1 text-sm text-gray-500 line-clamp-2">{task.description}</p>
                    <div className="mt-2 flex items-center text-sm text-gray-500 space-x-4">
                      <span>Project: <span className="font-medium">{task.projectId?.name || 'Unknown'}</span></span>
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${task.priority === 'High' ? 'bg-red-100 text-red-800' : task.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                        {task.priority} Priority
                      </span>
                      {task.dueDate && (
                        <span className={new Date(task.dueDate) < new Date() && task.status !== 'Done' ? 'text-red-500 font-bold' : ''}>
                          Due: {new Date(task.dueDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    <select 
                      value={task.status} 
                      onChange={(e) => handleStatusChange(task._id, e.target.value)}
                      className="border-gray-300 rounded-md text-sm pl-3 pr-8 py-2 focus:ring-brand-500 focus:border-brand-500 bg-gray-50 border shadow-sm"
                    >
                      <option value="To Do">To Do</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Done">Done</option>
                    </select>
                  </div>
                </div>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
};

export default MyTasks;
