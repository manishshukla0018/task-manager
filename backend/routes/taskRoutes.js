import { Router } from 'express';
import { body } from 'express-validator';
import {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  getDashboardStats,
} from '../controllers/taskController.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = Router();
router.use(protect);

router.get('/stats/dashboard', getDashboardStats);
router.get('/', getTasks);

router.post(
  '/',
  [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('projectId').notEmpty().withMessage('Project ID is required'),
    body('status').optional().isIn(['To Do', 'In Progress', 'Done']),
    body('priority').optional().isIn(['Low', 'Medium', 'High']),
    body('dueDate').optional().isISO8601(),
  ],
  validate,
  createTask
);

router.get('/:id', getTask);

router.put(
  '/:id',
  [
    body('status').optional().isIn(['To Do', 'In Progress', 'Done']),
    body('priority').optional().isIn(['Low', 'Medium', 'High']),
    body('dueDate').optional().isISO8601(),
  ],
  validate,
  updateTask
);

router.delete('/:id', deleteTask);

export default router;
