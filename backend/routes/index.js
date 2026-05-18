import { Router } from 'express';
import authRoutes from './authRoutes.js';
import projectRoutes from './projectRoutes.js';
import taskRoutes from './taskRoutes.js';
import userRoutes from './userRoutes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/projects', projectRoutes);
router.use('/tasks', taskRoutes);
router.use('/users', userRoutes);

export default router;
