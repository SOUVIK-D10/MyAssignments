import { Router } from 'express';
import {
  createTask,
  getAllTasks,
  getTaskById,
  filterTasksComingSoon,
  markCompleted,
  updateTask,
  addToBin,
  restoreFromBin,
  removeFromBin,
  emptyBin,
} from '../controller/task.controller';
import { authenticateToken } from '../../middleware/auth.middleware';
import { catchAsync } from '../../utils/catchAsync';

const router = Router();

router.use(authenticateToken);

/**
 * @openapi
 * /api/tasks/create:
 *   post:
 *     summary: Create a new task
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, deadline]
 *             properties:
 *               title: { type: string, example: "Build React Native UI" }
 *               description: { type: string, example: "Setup components for auth and task list" }
 *               deadline: { type: string, format: date-time, example: "2026-10-11T18:00:00.000Z" }
 *               priority: { type: integer, enum: [0, 1, 2], example: 2, description: "0: Low, 1: Mid, 2: High" }
 */
router.post('/create', catchAsync(createTask));

/**
 * @openapi
 * /api/tasks/all:
 *   get:
 *     summary: Retrieve light task DTO list
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 */
router.get('/all', catchAsync(getAllTasks));

/**
 * @openapi
 * /api/tasks/filter:
 *   get:
 *     summary: Filter tasks (Coming Soon)
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 */
router.get('/filter', catchAsync(filterTasksComingSoon));

/**
 * @openapi
 * /api/tasks/{id}:
 *   get:
 *     summary: Retrieve heavy task DTO by ID
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 */
router.get('/:id', catchAsync(getTaskById));

/**
 * @openapi
 * /api/tasks/mark-completed/{id}:
 *   patch:
 *     summary: Mark a task as completed
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 */
router.patch('/mark-completed/:id', catchAsync(markCompleted));

/**
 * @openapi
 * /api/tasks/update-task/{id}:
 *   put:
 *     summary: Overwrite/update task with validation
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 */
router.put('/update-task/:id', catchAsync(updateTask));

/**
 * @openapi
 * /api/tasks/add-to-bin/{id}:
 *   patch:
 *     summary: Soft delete task (Move to bin)
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 */
router.patch('/add-to-bin/:id', catchAsync(addToBin));

/**
 * @openapi
 * /api/tasks/restore-from-bin/{id}:
 *   patch:
 *     summary: Restore task from bin
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 */
router.patch('/restore-from-bin/:id', catchAsync(restoreFromBin));

/**
 * @openapi
 * /api/tasks/empty-bin:
 *   delete:
 *     summary: Delete all soft-deleted tasks permanently
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 */
router.delete('/empty-bin', catchAsync(emptyBin));

/**
 * @openapi
 * /api/tasks/remove-from-bin/{id}:
 *   delete:
 *     summary: Permanently delete a task marked as deleted
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 */
router.delete('/remove-from-bin/:id', catchAsync(removeFromBin));

export const taskRouter = router;