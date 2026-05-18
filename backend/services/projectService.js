import Project from '../models/Project.js';
import User from '../models/User.js';
import Task from '../models/Task.js';
import { AppError } from '../utils/AppError.js';
import { isProjectMember, canManageProject, toIdString } from '../utils/projectAccess.js';

const populateOpts = [
  { path: 'adminId', select: 'name email' },
  { path: 'members', select: 'name email role' },
];

const populateProject = (id) => Project.findById(id).populate(populateOpts);

export const getProjectsForUser = async (user) => {
  const filter =
    user.role === 'Admin'
      ? { $or: [{ adminId: user._id }, { members: user._id }] }
      : { members: user._id };

  return Project.find(filter).populate(populateOpts).sort({ createdAt: -1 });
};

export const getProjectById = async (projectId, user) => {
  const project = await Project.findById(projectId).populate(populateOpts);
  if (!project) throw new AppError('Project not found', 404);
  if (!isProjectMember(project, user._id)) throw new AppError('Access denied', 403);
  return project;
};

export const createProject = async (user, { name, description }) => {
  const project = await Project.create({
    name,
    description,
    adminId: user._id,
    members: [user._id],
  });
  return populateProject(project._id);
};

export const updateProject = async (projectId, user, data) => {
  const project = await Project.findById(projectId);
  if (!project) throw new AppError('Project not found', 404);
  if (!canManageProject(project, user)) {
    throw new AppError('Only project admin can update', 403);
  }

  if (data.name !== undefined) project.name = data.name;
  if (data.description !== undefined) project.description = data.description;
  await project.save();
  return populateProject(project._id);
};

export const deleteProject = async (projectId, user) => {
  const project = await Project.findById(projectId);
  if (!project) throw new AppError('Project not found', 404);
  if (!canManageProject(project, user)) {
    throw new AppError('Only project admin can delete', 403);
  }

  await Task.deleteMany({ projectId: project._id });
  await project.deleteOne();
};

export const addMember = async (projectId, user, email) => {
  const project = await Project.findById(projectId);
  if (!project) throw new AppError('Project not found', 404);
  if (!canManageProject(project, user)) {
    throw new AppError('Only project admin can add members', 403);
  }

  const member = await User.findOne({ email: email.toLowerCase() });
  if (!member) throw new AppError('User with this email not found', 404);
  if (project.members.some((m) => toIdString(m) === toIdString(member._id))) {
    throw new AppError('User is already a member', 400);
  }

  project.members.push(member._id);
  await project.save();
  return populateProject(project._id);
};

export const removeMember = async (projectId, user, memberId) => {
  const project = await Project.findById(projectId);
  if (!project) throw new AppError('Project not found', 404);
  if (!canManageProject(project, user)) {
    throw new AppError('Only project admin can remove members', 403);
  }
  if (toIdString(project.adminId) === toIdString(memberId)) {
    throw new AppError('Cannot remove project admin', 400);
  }

  project.members = project.members.filter((m) => m.toString() !== memberId);
  await project.save();
  return populateProject(project._id);
};
