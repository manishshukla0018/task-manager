import toast from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';
import TaskTable from '../components/TaskTable';
import { STATUS_OPTIONS } from '../utils/taskHelpers';
import { useTasks } from '../hooks/useTasks';
import { useAuth } from '../hooks/useAuth';

export default function MyTasks() {
  const { user } = useAuth();
  const { tasks, loading, params, setParams, updateTaskStatus } = useTasks({ myTasks: true });

  const statusFilter = params.status || '';

  const handleStatusChange = async (taskId, status) => {
    try {
      await updateTaskStatus(taskId, status);
      toast.success('Status updated');
    } catch (err) {
      toast.error(err.message || 'Failed to update status');
    }
  };

  return (
    <div className="space-y-6 pb-20 lg:pb-0">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Tasks</h1>
          <p className="text-gray-500 mt-1">
            Tasks assigned to you. Ask your admin to assign tasks with your name as assignee.
          </p>
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setParams((p) => ({ ...p, status: e.target.value }))}
          className="text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white"
        >
          <option value="">All Statuses</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <TaskTable
          tasks={tasks}
          user={user}
          onStatusChange={handleStatusChange}
          showProject
          emptyMessage="No tasks assigned to you yet. Your admin must create a task and set you as the assignee."
        />
      )}
    </div>
  );
}
