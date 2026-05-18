import { isOverdue } from '../utils/taskHelpers';
import StatusSelect from './StatusSelect';

const priorityColors = {
  Low: 'text-gray-600',
  Medium: 'text-yellow-600',
  High: 'text-red-600',
};

/** Whether the current user can change this task's status */
export const canUserEditTaskStatus = (task, user, { isGlobalAdmin, isProjectAdmin } = {}) => {
  if (!user) return false;
  if (isGlobalAdmin || isProjectAdmin) return true;
  const assigneeId = task.assigneeId?._id ?? task.assigneeId;
  if (!assigneeId) return false;
  return String(assigneeId) === String(user._id);
};

export default function TaskTable({
  tasks,
  onStatusChange,
  onDelete,
  user,
  isGlobalAdmin = false,
  isProjectAdmin = false,
  showProject = false,
  emptyMessage = 'No tasks found',
}) {
  if (!tasks?.length) {
    return (
      <p className="text-center text-gray-500 py-8 text-sm">{emptyMessage}</p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
            {showProject && (
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Project</th>
            )}
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Assignee</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Due Date</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
            {onDelete && (
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {tasks.map((task) => {
            const overdue = isOverdue(task);
            const canEdit = onStatusChange
              ? canUserEditTaskStatus(task, user, { isGlobalAdmin, isProjectAdmin })
              : false;

            return (
              <tr
                key={task._id}
                className={overdue ? 'bg-red-50' : 'hover:bg-gray-50'}
              >
                <td className="px-4 py-3">
                  <p className={`text-sm font-medium ${overdue ? 'text-red-700' : 'text-gray-900'}`}>
                    {task.title}
                  </p>
                  {overdue && (
                    <span className="text-xs text-red-600 font-medium">Overdue</span>
                  )}
                </td>
                {showProject && (
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {task.projectId?.name || '—'}
                  </td>
                )}
                <td className="px-4 py-3 text-sm text-gray-600">
                  {task.assigneeId?.name || 'Unassigned'}
                </td>
                <td className={`px-4 py-3 text-sm font-medium ${priorityColors[task.priority]}`}>
                  {task.priority || 'Medium'}
                </td>
                <td className={`px-4 py-3 text-sm ${overdue ? 'text-red-600 font-medium' : 'text-gray-600'}`}>
                  {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '—'}
                </td>
                <td className="px-4 py-3">
                  <StatusSelect
                    status={task.status}
                    disabled={!canEdit}
                    onChange={(newStatus) => onStatusChange(task._id, newStatus)}
                  />
                </td>
                {onDelete && (
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => onDelete(task._id)}
                      className="text-xs text-red-600 hover:text-red-800 font-medium"
                    >
                      Delete
                    </button>
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
