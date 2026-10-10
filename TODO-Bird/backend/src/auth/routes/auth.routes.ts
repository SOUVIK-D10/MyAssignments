import { Router } from 'express';
import { register, login, changePassword, logout, updatePushToken } from '../controllers/auth.controller';
import { authenticateToken } from '../../middleware/auth.middleware';

const router = Router();

/**
 * @openapi
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 example: souvik@example.com
 *               password:
 *                 type: string
 *                 example: secret123
 *     responses:
 *       201:
 *         description: User registered successfully.
 *       400:
 *         description: User already exists or missing fields.
 */
router.post('/register', register);

/**
 * @openapi
 * /api/auth/login:
 *   post:
 *     summary: Log in existing user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 example: souvik@example.com
 *               password:
 *                 type: string
 *                 example: secret123
 *     responses:
 *       200:
 *         description: Login successful with JWT token.
 *       401:
 *         description: Invalid credentials.
 */
router.post('/login', login);

/**
 * @openapi
 * /api/auth/logout:
 *   post:
 *     summary: Log out user and blacklist JWT token
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Token blacklisted successfully.
 *       401:
 *         description: Unauthorized.
 */
router.post('/logout', authenticateToken, logout);

/**
 * @openapi
 * /api/auth/change-password:
 *   post:
 *     summary: Change user password
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [oldPassword, newPassword]
 *             properties:
 *               oldPassword:
 *                 type: string
 *                 example: secret123
 *               newPassword:
 *                 type: string
 *                 example: newsecret456
 *     responses:
 *       200:
 *         description: Password updated successfully.
 *       400:
 *         description: New password matches old password.
 *       401:
 *         description: Incorrect old password or invalid token.
 */
router.post('/change-password', authenticateToken, changePassword);


router.post('/push-token', authenticateToken, updatePushToken);

export const authRouter = router;