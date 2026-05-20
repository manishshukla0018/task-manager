import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../contexts/AuthContext';
import { Plus, UserPlus } from 'lucide-react';
import toast from 'react-hot-toast';

const ProjectDetails = () => {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]); // All users to invite
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);

  // New Task Form
  const [newTask, setNewTask] = useState({ title: '', description: '', priority: 'Medium', dueDate: '', assigneeId: '' });
  // New Member Form
  const [memberEmail, setMemberEmail] = useState('');

  const fetchData = async () => {
    try {
      const [projRes, tasksRes] = await Promise.all([
        api.get(`/projects/${id}`),
        api.get(`/tasks?projectId=${id}`)
      ]);
      setProject(projRes.data);
      setTasks(tasksRes.data);
    } catch (error) {
      toast.error('Failed to load project details');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const { data } = await api.get('/users');
      setUsers(data);
    } catch (error) {
      toast.error('Failed to fetch users');
    }
  };

  useEffect(() => {
    fetchData();
    if (user.role === 'Admin') fetchUsers();
  }, [id, user.role]);

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      await api.post('/tasks', { ...newTask, projectId: id });
      toast.success('Task created');
      setShowTaskModal(false);
      setNewTask({ title: '', description: '', priority: 'Medium', dueDate: '', assigneeId: '' });
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create task');
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/projects/${id}/members`, { email: memberEmail });
      toast.success('Member added');
      setShowMemberModal(false);
      setMemberEmail('');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add member');
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await api.put(`/tasks/${taskId}/status`, { status: newStatus });
      fetchData();
      toast.success('Status updated');
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  if (loading) return <div>Loading project...</div>;
  if (!project) return <div>Project not found</div>;

  const isAdmin = user.role === 'Admin' || project.adminId._id === user._id;

  return (
    <div>
      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{project.name}</h1>
            <p className="mt-2 text-gray-600 max-w-2xl">{project.description}</p>
          </div>
          <div className="flex space-x-3">
            {isAdmin && (
              <button onClick={() => setShowMemberModal(true)} className="flex items-center text-brand-600 bg-brand-50 px-3 py-2 rounded-md hover:bg-brand-100">
                <UserPlus className="w-4 h-4 mr-2" /> Add Member
              </button>
            )}
            <button onClick={() => setShowTaskModal(true)} className="flex items-center bg-brand-600 text-white px-3 py-2 rounded-md hover:bg-brand-700">
              <Plus className="w-4 h-4 mr-2" /> New Task
            </button>
          </div>
        </div>
        <div className="mt-6 flex items-center">
          <h3 className="text-sm font-medium text-gray-500 mr-3">Members:</h3>
          <div className="flex flex-wrap gap-2">
            {project.members.map(m => (
              <span key={m._id} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                {m.name}
              </span>
            ))}
          </div>
        </div>
      </div>

      <h2 className="text-xl font-semibold mb-4 text-gray-800">Tasks</h2>
      
      {/* Kanban Board style or Simple List */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {['To Do', 'In Progress', 'Done'].map(status => (
          <div key={status} className="bg-gray-100 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-700 mb-4">{status}</h3>
            <div className="space-y-4">
              {tasks.filter(t => t.status === status).map(task => (
                <div key={task._id} className="bg-white p-4 rounded shadow-sm border border-gray-200">
                  <h4 className="font-bold text-gray-900 mb-1">{task.title}</h4>
                  <p className="text-xs text-gray-500 mb-3">{task.description}</p>
                  <div className="flex justify-between items-center mt-2">
                    <span className={`text-xs px-2 py-1 rounded ${task.priority === 'High' ? 'bg-red-100 text-red-800' : task.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                      {task.priority}
                    </span>
                    <select 
                      value={task.status} 
                      onChange={(e) => handleStatusChange(task._id, e.target.value)}
                      className="text-xs border-gray-300 rounded pl-2 pr-6 py-1 focus:ring-brand-500 focus:border-brand-500"
                    >
                      <option value="To Do">To Do</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Done">Done</option>
                    </select>
                  </div>
                  {task.assigneeId && (
                     <div className="mt-3 text-xs text-gray-500 border-t pt-2">
                       Assigned to: <span className="font-medium text-gray-700">{task.assigneeId.name}</span>
                     </div>
                  )}
                </div>
              ))}
              {tasks.filter(t => t.status === status).length === 0 && (
                <p className="text-sm text-gray-400 italic">No tasks</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Task Modal */}
      {showTaskModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-md p-6">
            <h2 className="text-xl font-bold mb-4">Create New Task</h2>
            <form onSubmit={handleCreateTask}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input required type="text" value={newTask.title} onChange={e => setNewTask({...newTask, title: e.target.value})} className="w-full border-gray-300 rounded-md px-3 py-2 border" />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea value={newTask.description} onChange={e => setNewTask({...newTask, description: e.target.value})} className="w-full border-gray-300 rounded-md px-3 py-2 border h-20"></textarea>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                  <select value={newTask.priority} onChange={e => setNewTask({...newTask, priority: e.target.value})} className="w-full border-gray-300 rounded-md px-3 py-2 border bg-white">
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                  <input type="date" value={newTask.dueDate} onChange={e => setNewTask({...newTask, dueDate: e.target.value})} className="w-full border-gray-300 rounded-md px-3 py-2 border" />
                </div>
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">Assign To</label>
                <select value={newTask.assigneeId} onChange={e => setNewTask({...newTask, assigneeId: e.target.value})} className="w-full border-gray-300 rounded-md px-3 py-2 border bg-white">
                  <option value="">Unassigned</option>
                  {project.members.map(m => (
                    <option key={m._id} value={m._id}>{m.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end space-x-3">
                <button type="button" onClick={() => setShowTaskModal(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-md">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-brand-600 text-white rounded-md hover:bg-brand-700 text-sm">Create Task</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Member Modal */}
      {showMemberModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-sm p-6">
            <h2 className="text-xl font-bold mb-4">Add Member</h2>
            <form onSubmit={handleAddMember}>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">User Email</label>
                <input required type="email" value={memberEmail} onChange={e => setMemberEmail(e.target.value)} className="w-full border-gray-300 rounded-md px-3 py-2 border" placeholder="user@example.com" />
              </div>
              <div className="flex justify-end space-x-3">
                <button type="button" onClick={() => setShowMemberModal(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-md">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-brand-600 text-white rounded-md hover:bg-brand-700 text-sm">Add</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default ProjectDetails;
