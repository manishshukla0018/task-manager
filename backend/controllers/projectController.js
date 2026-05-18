import * as projectService from '../services/projectService.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getProjects = asyncHandler(async (req, res) => {
  const projects = await projectService.getProjectsForUser(req.user);
  res.json({ success: true, data: projects });
});

export const getProject = asyncHandler(async (req, res) => {
  const project = await projectService.getProjectById(req.params.id, req.user);
  res.json({ success: true, data: project });
});

export const createProject = asyncHandler(async (req, res) => {
  const project = await projectService.createProject(req.user, req.body);
  res.status(201).json({ success: true, data: project });
});

export const updateProject = asyncHandler(async (req, res) => {
  const project = await projectService.updateProject(req.params.id, req.user, req.body);
  res.json({ success: true, data: project });
});

export const deleteProject = asyncHandler(async (req, res) => {
  await projectService.deleteProject(req.params.id, req.user);
  res.json({ success: true, message: 'Project deleted' });
});

export const addMember = asyncHandler(async (req, res) => {
  const project = await projectService.addMember(req.params.id, req.user, req.body.email);
  res.json({ success: true, data: project });
});

export const removeMember = asyncHandler(async (req, res) => {
  const project = await projectService.removeMember(
    req.params.id,
    req.user,
    req.params.userId
  );
  res.json({ success: true, data: project });
});
