import Task, { ITask, TaskPriority, TaskCategory } from '../modules/Task';
import { LightTaskDTO, HeavyTaskDTO, toLightTaskDTO, toHeavyTaskDTO } from '../dtos/task.dto';
import { AppError } from '../../utils/AppError';
import User from '../../auth/modules/User';

export async function createTaskService(
    userId: string,
    data: {
        title: string;
        description?: string;
        deadline: Date;
        priority?: TaskPriority;
        category?: TaskCategory;
    }
): Promise<HeavyTaskDTO> {

    if (data.title === undefined || data.title === null) {
        throw new AppError('Title Invalid.', 400);
    }

    if (data.description === undefined || data.description === null) {
        throw new AppError('Description Invalid.', 400);
    }

    if (data.deadline === undefined || data.deadline === null) {
        throw new AppError('Deadline Invalid.', 400);
    }

    // Convert string/date input safely to a Date object
    const deadlineDate = new Date(data.deadline);
    if (isNaN(deadlineDate.getTime())) {
        throw new AppError('Deadline Invalid.', 400);
    }

    if (deadlineDate.getTime() < Date.now()) {
        throw new AppError('Deadline cannot be set in the past.', 400);
    }

    if (
        data.priority === undefined ||
        typeof data.priority !== 'number' ||
        ![0, 1, 2].includes(data.priority)
    ) {
        throw new AppError('Invalid Priority.', 400);
    }

    if (data.category !== undefined) {
        if (!Object.values(TaskCategory).includes(data.category)) {
            throw new AppError('Invalid Category.', 400);
        }
    }

    const newTask = await Task.create({
        userId,
        title: data.title,
        description: data.description || '',
        deadline: new Date(data.deadline),
        priority: data.priority ?? TaskPriority.MID,
        category: data.category ?? TaskCategory.PERSONAL,
        is_completed: false,
        is_deleted: false,
    });

    return toHeavyTaskDTO(newTask);
}

export async function getAllTasksService(userId: string, sortby: string, isDeleted: boolean): Promise<LightTaskDTO[]> {
    const tasks = await Task.find({ userId, is_deleted: isDeleted }).sort({ [sortby]: 1 });
    return tasks.map(toLightTaskDTO);
}

export async function getTaskByIdService(userId: string, taskId: string): Promise<HeavyTaskDTO> {
    const task = await Task.findOne({ _id: taskId, userId });
    if (!task) {
        throw new AppError('Task not found.', 404);
    }
    return toHeavyTaskDTO(task);
}

export async function markTaskCompletedService(userId: string, taskId: string): Promise<HeavyTaskDTO> {
    const task = await Task.findOne({ _id: taskId, userId, is_deleted: false });
    if (!task) {
        throw new AppError('Task not found.', 404);
    }

    if (task.is_completed) {
        throw new AppError('Task is already completed. No updates allowed.', 400);
    }

    task.is_completed = true;
    task.completed_at = new Date();
    await task.save();

    return toHeavyTaskDTO(task);
}

export async function updateTaskService(
    userId: string,
    taskId: string,
    data: {
        title?: string;
        description?: string;
        deadline?: string | Date;
        priority?: TaskPriority;
        category?: TaskCategory;
    }
): Promise<HeavyTaskDTO> {
    const task = await Task.findOne({ _id: taskId, userId, is_deleted: false, is_completed: false });
    if (!task) {
        throw new AppError('Task not found.', 404);
    }

    if (task.is_completed) {
        throw new AppError('Cannot update a completed task.', 400);
    }

    if (task.is_deleted) {
        throw new AppError('Cannot update a soft-deleted task. Restore it first.', 400);
    }

    if (data.title !== undefined) task.title = data.title;
    if (data.description !== undefined) task.description = data.description;
    
    if (data.priority !== undefined) {
        if (typeof data.priority !== 'number' || ![0, 1, 2].includes(data.priority)) {
            throw new AppError('Invalid Priority.', 400);
        }
        task.priority = data.priority;
    }

    if (data.category !== undefined) {
        if (!Object.values(TaskCategory).includes(data.category)) {
            throw new AppError('Invalid Category.', 400);
        }
        task.category = data.category;
    }

    if (data.deadline !== undefined) {
        const deadlineDate = new Date(data.deadline);
        if (isNaN(deadlineDate.getTime())) {
            throw new AppError('Deadline Invalid.', 400);
        }
        if (deadlineDate.getTime() < Date.now()) {
            throw new AppError('Deadline cannot be set in the past.', 400);
        }
        task.deadline = deadlineDate;
    }

    await task.save();
    return toHeavyTaskDTO(task);
}

// Recycle Bin Services
export async function addToBinService(userId: string, taskId: string): Promise<HeavyTaskDTO> {
    const task = await Task.findOne({ _id: taskId, userId });
    if (!task) {
        throw new AppError('Task not found.', 404);
    }

    if (task.is_deleted) {
        throw new AppError('Task is already in the bin.', 400);
    }

    task.is_deleted = true;
    await task.save();
    return toHeavyTaskDTO(task);
}

export async function restoreFromBinService(userId: string, taskId: string): Promise<HeavyTaskDTO> {
    const task = await Task.findOne({ _id: taskId, userId });
    if (!task) {
        throw new AppError('Task not found.', 404);
    }

    if (!task.is_deleted) {
        throw new AppError('Task is not in the bin.', 400);
    }

    task.is_deleted = false;
    await task.save();
    return toHeavyTaskDTO(task);
}

export async function removeFromBinService(userId: string, taskId: string): Promise<void> {
    const task = await Task.findOne({ _id: taskId, userId });
    if (!task) {
        throw new AppError('Task not found.', 404);
    }

    if (!task.is_deleted) {
        throw new AppError('Only tasks marked as deleted can be permanently removed.', 400);
    }

    await Task.deleteOne({ _id: taskId, userId });
}

export async function emptyBinService(userId: string): Promise<{ deletedCount: number }> {
    const result = await Task.deleteMany({ userId, is_deleted: true });
    return { deletedCount: result.deletedCount || 0 };
}