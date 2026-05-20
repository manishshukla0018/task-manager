import express from 'express';
import { createProject, getProjects, getProjectById, addMember } from '../controllers/project.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { admin } from '../middleware/role.middleware.js';

const router = express.Router();

router.route('/')
  .post(protect, admin, createProject)
  .get(protect, getProjects);

router.route('/:id')
  .get(protect, getProjectById);

router.route('/:id/members')
  .put(protect, admin, addMember);

export default router;
