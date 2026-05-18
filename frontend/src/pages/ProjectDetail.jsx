import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { projectService } from '../services/projectService';
import { taskService } from '../services/taskService';
import { useAuth } from '../hooks/useAuth';
import LoadingSpinner from '../components/LoadingSpinner';
import Modal from '../components/Modal';
import TaskTable from '../components/TaskTable';
import { STATUS_OPTIONS, PRIORITY_OPTIONS } from '../utils/taskHelpers';
import { getAssignableMembers } from '../utils/projectHelpers';

const emptyTask = {
  title: '',
  description: '',
  status: 'To Do',
  priority: 'Medium',
  dueDate: '',
  assigneeId: '',
};

export default function ProjectDetail() {
  const { id } = useParams();
  const { user, isAdmin } = useAuth();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [taskModal, setTaskModal] = useState(false);
  const [memberModal, setMemberModal] = useState(false);
  const [taskForm, setTaskForm] = useState(emptyTask);
  const [memberEmail, setMemberEmail] = useState('');
  const [filters, setFilters] = useState({ status: '', assignee: '', dueDate: '' });
  const [submitting, setSubmitting] = useState(false);

  const adminId = project?.adminId?._id ?? project?.adminId;
  const isProjectAdmin =
    adminId != null && user?._id != null && String(adminId) === String(user._id);

  const assignableMembers = getAssignableMembers(project?.members);

  const fetchProject = async () => {
    const { data } = await projectService.getById(id);
    setProject(data.data);
  };

  const fetchTasks = async () => {
    const params = { projectId: id, ...filters };
    Object.keys(params).forEach((k) => !params[k] && delete params[k]);
    const { data } = await taskService.getAll(params);
    setTasks(data.data);
  };

  const loadAll = async () => {
    setLoading(true);
    try {
      await Promise.all([fetchProject(), fetchTasks()]);
    } catch (err) {
      toast.error(err.message || 'Failed to load project');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, [id]);

  useEffect(() => {
    if (!loading) fetchTasks();
  }, [filters]);

  const handleCreateTask = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await taskService.create({
        ...taskForm,
        projectId: id,
        assigneeId: taskForm.assigneeId || undefined,
        dueDate: taskForm.dueDate || undefined,
      });
      toast.success('Task created');
      setTaskModal(false);
      setTaskForm(emptyTask);
      fetchTasks();
    } catch (err) {
      toast.error(err.message || 'Failed to create task');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const { data } = await projectService.addMember(id, memberEmail);
      setProject(data.data);
      toast.success('Member added');
      setMemberModal(false);
      setMemberEmail('');
    } catch (err) {
      toast.error(err.message || 'Failed to add member');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemoveMember = async (userId) => {
    if (!window.confirm('Remove this member from the project?')) return;
    try {
      const { data } = await projectService.removeMember(id, userId);
      setProject(data.data);
      toast.success('Member removed');
    } catch (err) {
      toast.error(err.message || 'Failed to remove member');
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await taskService.delete(taskId);
      toast.success('Task deleted');
      fetchTasks();
    } catch (err) {
      toast.error(err.message || 'Failed to delete task');
    }
  };

  const handleStatusChange = async (taskId, status) => {
    try {
      await taskService.update(taskId, { status });
      toast.success('Status updated');
      fetchTasks();
    } catch (err) {
      toast.error(err.message || 'Failed to update status');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!project) {
    return <p className="text-gray-500">Project not found.</p>;
  }

  return (
    <div className="space-y-6 pb-20 lg:pb-0">
      <div>
        <Link to="/projects" className="text-sm text-primary-600 hover:underline">
          ← Back to Projects
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 mt-2">{project.name}</h1>
        <p className="text-gray-500 mt-1">{project.description || 'No description'}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Team Members</h2>
            {isProjectAdmin && (
              <button
                type="button"
                onClick={() => setMemberModal(true)}
                className="text-sm text-primary-600 hover:underline"
              >
                + Add
              </button>
            )}
          </div>
          <ul className="space-y-2">
            {project.members?.map((member) => (
              <li
                key={member._id}
                className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
              >
                <div>
                  <p className="text-sm font-medium text-gray-900">{member.name}</p>
                  <p className="text-xs text-gray-500">{member.email}</p>
                </div>
                {isProjectAdmin &&
                  String(member._id) !== String(adminId) && (
                    <button
                      type="button"
                      onClick={() => handleRemoveMember(member._id)}
                      className="text-xs text-red-600 hover:underline"
                    >
                      Remove
                    </button>
                  )}
              </li>
            ))}
          </ul>
        </div>

        <div className="lg:col-span-2 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <h2 className="font-semibold text-gray-900">Tasks</h2>
            <button
              type="button"
              onClick={() => setTaskModal(true)}
              className="px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700"
            >
              + New Task
            </button>
          </div>

          <div className="flex flex-wrap gap-3 bg-white p-4 rounded-lg border border-gray-200">
            <select
              value={filters.status}
              onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}
              className="text-sm border border-gray-300 rounded-lg px-3 py-1.5"
            >
              <option value="">All Statuses</option>
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <select
              value={filters.assignee}
              onChange={(e) => setFilters((f) => ({ ...f, assignee: e.target.value }))}
              className="text-sm border border-gray-300 rounded-lg px-3 py-1.5"
            >
              <option value="">All Assignees</option>
              {assignableMembers.map((m) => (
                <option key={m._id} value={String(m._id)}>{m.name}</option>
              ))}
            </select>
            <input
              type="date"
              value={filters.dueDate}
              onChange={(e) => setFilters((f) => ({ ...f, dueDate: e.target.value }))}
              className="text-sm border border-gray-300 rounded-lg px-3 py-1.5"
            />
          </div>

          <TaskTable
            tasks={tasks}
            user={user}
            isGlobalAdmin={isAdmin}
            isProjectAdmin={isProjectAdmin}
            onStatusChange={handleStatusChange}
            onDelete={isProjectAdmin || isAdmin ? handleDeleteTask : undefined}
          />
        </div>
      </div>

      <Modal isOpen={taskModal} onClose={() => setTaskModal(false)} title="Create Task" size="lg">
        <form onSubmit={handleCreateTask} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input
                required
                value={taskForm.title}
                onChange={(e) => setTaskForm((f) => ({ ...f, title: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                rows={3}
                value={taskForm.description}
                onChange={(e) => setTaskForm((f) => ({ ...f, description: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none resize-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
              <select
                value={taskForm.priority}
                onChange={(e) => setTaskForm((f) => ({ ...f, priority: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                {PRIORITY_OPTIONS.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
              <input
                type="date"
                value={taskForm.dueDate}
                onChange={(e) => setTaskForm((f) => ({ ...f, dueDate: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Assignee</label>
              <select
                value={taskForm.assigneeId}
                onChange={(e) => setTaskForm((f) => ({ ...f, assigneeId: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="">Unassigned</option>
                {assignableMembers.map((m) => (
                  <option key={m._id} value={String(m._id)}>
                    {m.name} ({m.email})
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Only Members can be assigned. Admin users manage tasks but are not assignees.
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={taskForm.status}
                onChange={(e) => setTaskForm((f) => ({ ...f, status: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <button type="button" onClick={() => setTaskModal(false)} className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg">
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="px-4 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-60">
              {submitting ? 'Creating...' : 'Create Task'}
            </button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={memberModal} onClose={() => setMemberModal(false)} title="Add Team Member">
        <form onSubmit={handleAddMember} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Member Email</label>
            <input
              type="email"
              required
              value={memberEmail}
              onChange={(e) => setMemberEmail(e.target.value)}
              placeholder="member@example.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
            />
          </div>
          <div className="flex justify-end gap-3">
            <button type="button" onClick={() => setMemberModal(false)} className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg">
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="px-4 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-60">
              {submitting ? 'Adding...' : 'Add Member'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
