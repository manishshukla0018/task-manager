import { Router } from 'express';
import { getUsers, searchUsers } from '../controllers/userController.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/authorize.js';

const router = Router();
router.use(protect);

router.get('/', authorize('Admin'), getUsers);
router.get('/search', searchUsers);

export default router;
