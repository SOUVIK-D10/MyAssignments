import { Response } from 'express';
import { AuthenticatedRequest } from '../../middleware/auth.middleware';
import {
  createTaskService,
  getAllTasksService,
  getTaskByIdService,
  markTaskCompletedService,
  updateTaskService,
  addToBinService,
  restoreFromBinService,
  removeFromBinService,
  emptyBinService,
} from '../services/task.services';

// CREATE TASK
export const createTask = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const task = await createTaskService(req.userId!, req.body);
  res.status(201).json({ message: 'Task created successfully.', task });
};

// GET ALL TASKS
export const getAllTasks = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const isDeleted = req.query.isDeleted === 'true' || req.query.is_deleted === 'true';
  const sortby = (req.query.sortby as string) || "deadline";
  
  const tasks = await getAllTasksService(req.userId!, sortby, isDeleted);
  res.status(200).json(tasks);
};

// UNIMPLEMENTED FEATURE : FILTER IS IMPLEMENTED AT CLIENT SIDE AS WE DON'T EXPECT one person to register to-many task 
export const filterTasksComingSoon = async (_req: AuthenticatedRequest, res: Response): Promise<void> => {
  res.status(501).json({ status: 'Not Implemented', message: 'Task filtering feature coming soon.' });
};

// GET TASK DETAILS 
export const getTaskById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const id = req.params.id as string;
  const task = await getTaskByIdService(req.userId!, id);
  res.status(200).json(task);
};

// MARK TASK AS COMPLETE
export const markCompleted = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const id = req.params.id as string;
  const task = await markTaskCompletedService(req.userId!, id);
  res.status(200).json({ message: 'Task marked as completed.', task });
};

// UPDATE TASK DATA
export const updateTask = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const id = req.params.id as string;
  const task = await updateTaskService(req.userId!, id, req.body);
  res.status(200).json({ message: 'Task updated successfully.', task });
};

// SOFT-DELETE TASK (reversible)
export const addToBin = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const id = req.params.id as string;
  const task = await addToBinService(req.userId!, id);
  res.status(200).json({ message: 'Task moved to bin.', task });
};

// RESTORE SOFT-DELETE TASK
export const restoreFromBin = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const id = req.params.id as string;
  const task = await restoreFromBinService(req.userId!, id);
  res.status(200).json({ message: 'Task restored from bin.', task });
};

// HARD-DELETE TASK (non-reversible)
export const removeFromBin = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const id = req.params.id as string;
  await removeFromBinService(req.userId!, id);
  res.status(200).json({ message: 'Task permanently deleted.' });
};

// DELETE ALL SOFT DELETED ELEMENTS (non-reversible)
export const emptyBin = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const result = await emptyBinService(req.userId!);
  res.status(200).json({ message: 'Recycle bin emptied.', deletedCount: result.deletedCount });
};