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

export const createTask = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const task = await createTaskService(req.userId!, req.body);
  res.status(201).json({ message: 'Task created successfully.', task });
};

export const getAllTasks = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const isCompleted = req.query.isCompleted === 'true';
  const tasks = await getAllTasksService(req.userId!, isCompleted);
  res.status(200).json(tasks);
};

export const filterTasksComingSoon = async (_req: AuthenticatedRequest, res: Response): Promise<void> => {
  res.status(501).json({ status: 'Not Implemented', message: 'Task filtering feature coming soon.' });
};

export const getTaskById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const id = req.params.id as string;
  const task = await getTaskByIdService(req.userId!, id);
  res.status(200).json(task);
};

export const markCompleted = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const id = req.params.id as string;
  const task = await markTaskCompletedService(req.userId!, id);
  res.status(200).json({ message: 'Task marked as completed.', task });
};

export const updateTask = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const id = req.params.id as string;
  const task = await updateTaskService(req.userId!, id, req.body);
  res.status(200).json({ message: 'Task updated successfully.', task });
};

export const addToBin = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const id = req.params.id as string;
  const task = await addToBinService(req.userId!, id);
  res.status(200).json({ message: 'Task moved to bin.', task });
};

export const restoreFromBin = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const id = req.params.id as string;
  const task = await restoreFromBinService(req.userId!, id);
  res.status(200).json({ message: 'Task restored from bin.', task });
};

export const removeFromBin = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const id = req.params.id as string;
  await removeFromBinService(req.userId!, id);
  res.status(200).json({ message: 'Task permanently deleted.' });
};

export const emptyBin = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const result = await emptyBinService(req.userId!);
  res.status(200).json({ message: 'Recycle bin emptied.', deletedCount: result.deletedCount });
};