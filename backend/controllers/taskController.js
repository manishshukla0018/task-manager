import * as taskService from '../services/taskService.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getTasks = asyncHandler(async (req, res) => {
  const tasks = await taskService.getTasks(req.user, req.query);
  res.json({ success: true, data: tasks });
});

export const getTask = asyncHandler(async (req, res) => {
  const task = await taskService.getTaskById(req.params.id, req.user);
  res.json({ success: true, data: task });
});

export const createTask = asyncHandler(async (req, res) => {
  const task = await taskService.createTask(req.user, req.body);
  res.status(201).json({ success: true, data: task });
});

export const updateTask = asyncHandler(async (req, res) => {
  const task = await taskService.updateTask(req.params.id, req.user, req.body);
  res.json({ success: true, data: task });
});

export const deleteTask = asyncHandler(async (req, res) => {
  await taskService.deleteTask(req.params.id, req.user);
  res.json({ success: true, message: 'Task deleted' });
});

export const getDashboardStats = asyncHandler(async (req, res) => {
  const stats = await taskService.getDashboardStats(req.user);
  res.json({ success: true, data: stats });
});
