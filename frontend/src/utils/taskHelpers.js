export const isOverdue = (task) => {
  if (!task.dueDate || task.status === 'Done') return false;
  return new Date(task.dueDate) < new Date();
};

export const STATUS_OPTIONS = ['To Do', 'In Progress', 'Done'];
export const PRIORITY_OPTIONS = ['Low', 'Medium', 'High'];
