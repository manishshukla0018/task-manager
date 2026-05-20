import express from 'express';
import { createTask, getTasks, updateTaskStatus, deleteTask } from '../controllers/task.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { admin } from '../middleware/role.middleware.js';

const router = express.Router();

router.route('/')
  .post(protect, createTask)
  .get(protect, getTasks);

router.route('/:id/status')
  .put(protect, updateTaskStatus);

router.route('/:id')
  .delete(protect, admin, deleteTask);

export default router;
