import { Router } from 'express';
import { body } from 'express-validator';
import {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  addMember,
  removeMember,
} from '../controllers/projectController.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/authorize.js';
import { validate } from '../middleware/validate.js';

const router = Router();
router.use(protect);

router.get('/', getProjects);

router.post(
  '/',
  authorize('Admin'),
  [
    body('name').trim().notEmpty().withMessage('Project name is required'),
    body('description').optional().trim(),
  ],
  validate,
  createProject
);

router.get('/:id', getProject);

router.put(
  '/:id',
  [
    body('name').optional().trim().notEmpty(),
    body('description').optional().trim(),
  ],
  validate,
  updateProject
);

router.delete('/:id', deleteProject);

router.post(
  '/:id/members',
  [body('email').isEmail().withMessage('Valid email is required')],
  validate,
  addMember
);

router.delete('/:id/members/:userId', removeMember);

export default router;
