import toast from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';
import StatCard from '../components/StatCard';
import TaskTable from '../components/TaskTable';
import { useDashboard } from '../hooks/useDashboard';
import { useAuth } from '../hooks/useAuth';

export default function Dashboard() {
  const { user, isAdmin } = useAuth();
  const { stats, loading, updateTaskStatus } = useDashboard();

  const handleStatusChange = async (taskId, status) => {
    try {
      await updateTaskStatus(taskId, status);
      toast.success('Status updated');
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

  return (
    <div className="space-y-8 pb-20 lg:pb-0">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Overview of your team&apos;s tasks</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Tasks" value={stats?.total ?? 0} color="blue" icon={<TaskIcon />} />
        <StatCard title="Completed" value={stats?.completed ?? 0} color="green" icon={<CheckIcon />} />
        <StatCard title="In Progress" value={stats?.inProgress ?? 0} color="yellow" icon={<ClockIcon />} />
        <StatCard title="Overdue" value={stats?.overdue ?? 0} color="red" icon={<AlertIcon />} />
      </div>

      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Tasks</h2>
        <TaskTable
          tasks={stats?.recentTasks}
          user={user}
          isGlobalAdmin={isAdmin}
          onStatusChange={handleStatusChange}
          showProject
          emptyMessage="No tasks yet. Create a project and add tasks to get started."
        />
      </section>
    </div>
  );
}

function TaskIcon() {
  return (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
    </svg>
  );
}
function CheckIcon() {
  return (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  );
}
function ClockIcon() {
  return (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}
function AlertIcon() {
  return (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  );
}
