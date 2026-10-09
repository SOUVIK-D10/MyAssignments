import { Router } from 'express';
import { register, login, changePassword, logout } from '../controllers/auth.controller';
import { authenticateToken } from '../../middleware/auth.middleware';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', authenticateToken, logout);
router.post('/change-password', authenticateToken, changePassword);

export const authRouter = router;