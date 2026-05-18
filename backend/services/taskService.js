import Task from '../models/Task.js';
import Project from '../models/Project.js';
import User from '../models/User.js';
import { AppError } from '../utils/AppError.js';
import { isProjectMember, isProjectAdmin, toIdString } from '../utils/projectAccess.js';

const populateOpts = [
  { path: 'assigneeId', select: 'name email role' },
  { path: 'createdBy', select: 'name email' },
  { path: 'projectId', select: 'name' },
];

const populateTask = (id) => Task.findById(id).populate(populateOpts);

/** Tasks may only be assigned to project members with the Member role (not Admin). */
const validateAssignee = async (project, assigneeId) => {
  if (!assigneeId) return;

  const isOnProject = project.members.some((m) => toIdString(m) === toIdString(assigneeId));
  if (!isOnProject) throw new AppError('Assignee must be a project member', 400);

  const assignee = await User.findById(assigneeId).select('role');
  if (!assignee) throw new AppError('Assignee not found', 404);
  if (assignee.role === 'Admin') {
    throw new AppError('Tasks cannot be assigned to Admin users. Assign to a Member only.', 400);
  }
};

export const buildTaskQuery = async (user, filters = {}) => {
  const projectFilter =
    user.role === 'Admin'
      ? { $or: [{ adminId: user._id }, { members: user._id }] }
      : { members: user._id };

  const userProjects = await Project.find(projectFilter).select('_id');
  const projectIds = userProjects.map((p) => p._id);

  if (filters.projectId) {
    if (!projectIds.some((id) => toIdString(id) === toIdString(filters.projectId))) return null;
  }

  const query = {
    projectId: filters.projectId ? filters.projectId : { $in: projectIds },
  };

  if (filters.status) query.status = filters.status;
  if (filters.assignee) query.assigneeId = filters.assignee;
  const myTasksOnly =
    filters.myTasks === true ||
    filters.myTasks === 'true' ||
    filters.myTasks === '1';
  if (myTasksOnly) query.assigneeId = user._id;

  if (filters.dueDate) {
    const date = new Date(filters.dueDate);
    const nextDay = new Date(date);
    nextDay.setDate(nextDay.getDate() + 1);
    query.dueDate = { $gte: date, $lt: nextDay };
  }

  return query;
};

export const getTasks = async (user, filters) => {
  const query = await buildTaskQuery(user, filters);
  if (query === null) throw new AppError('Access denied to this project', 403);
  return Task.find(query).populate(populateOpts).sort({ createdAt: -1 });
};

export const getTaskById = async (taskId, user) => {
  const task = await Task.findById(taskId).populate(populateOpts);
  if (!task) throw new AppError('Task not found', 404);

  const project = await Project.findById(task.projectId);
  if (!project || !isProjectMember(project, user._id)) {
    throw new AppError('Access denied', 403);
  }
  return task;
};

export const createTask = async (user, data) => {
  const project = await Project.findById(data.projectId);
  if (!project) throw new AppError('Project not found', 404);
  if (!isProjectMember(project, user._id)) throw new AppError('Access denied', 403);

  await validateAssignee(project, data.assigneeId);

  const task = await Task.create({ ...data, createdBy: user._id });
  return populateTask(task._id);
};

export const updateTask = async (taskId, user, data) => {
  const task = await Task.findById(taskId);
  if (!task) throw new AppError('Task not found', 404);

  const project = await Project.findById(task.projectId);
  if (!project || !isProjectMember(project, user._id)) {
    throw new AppError('Access denied', 403);
  }

  const isAdmin = isProjectAdmin(project, user._id) || user.role === 'Admin';
  const isAssignee = toIdString(task.assigneeId) === toIdString(user._id);

  if (!isAdmin && !isAssignee) {
    throw new AppError('You can only update tasks assigned to you', 403);
  }

  if (!isAdmin && isAssignee) {
    if (data.status) task.status = data.status;
  } else {
    const fields = ['title', 'description', 'status', 'priority', 'dueDate', 'assigneeId'];
    for (const field of fields) {
      if (data[field] === undefined) continue;

      if (field === 'assigneeId') {
        if (data.assigneeId === '' || data.assigneeId === null) {
          task.assigneeId = undefined;
          continue;
        }
        await validateAssignee(project, data.assigneeId);
      }

      task[field] = data[field];
    }
  }

  await task.save();
  return populateTask(task._id);
};

export const deleteTask = async (taskId, user) => {
  const task = await Task.findById(taskId);
  if (!task) throw new AppError('Task not found', 404);

  const project = await Project.findById(task.projectId);
  if (!project) throw new AppError('Project not found', 404);

  const isAdmin = isProjectAdmin(project, user._id) || user.role === 'Admin';
  if (!isAdmin) throw new AppError('Only admins can delete tasks', 403);

  await task.deleteOne();
};

export const getDashboardStats = async (user) => {
  const query = await buildTaskQuery(user, {});
  const empty = { total: 0, completed: 0, inProgress: 0, overdue: 0, recentTasks: [] };
  if (query === null) return empty;

  const tasks = await Task.find(query).populate(populateOpts).sort({ updatedAt: -1 });
  const now = new Date();

  return {
    total: tasks.length,
    completed: tasks.filter((t) => t.status === 'Done').length,
    inProgress: tasks.filter((t) => t.status === 'In Progress').length,
    overdue: tasks.filter(
      (t) => t.dueDate && t.status !== 'Done' && new Date(t.dueDate) < now
    ).length,
    recentTasks: tasks.slice(0, 10),
  };
};
