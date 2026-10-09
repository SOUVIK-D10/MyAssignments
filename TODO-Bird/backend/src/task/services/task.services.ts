import Task, { ITask, TaskPriority } from '../modules/Task';
import { LightTaskDTO, HeavyTaskDTO, toLightTaskDTO, toHeavyTaskDTO } from '../dtos/task.dto';
import { AppError } from '../../utils/AppError';

export async function createTaskService(
    userId: string,
    data: {
        title: string;
        description?: string;
        assigned_at?: Date;
        deadline: Date;
        priority?: TaskPriority;
    }
): Promise<HeavyTaskDTO> {
    if (!data.title || !data.deadline) {
        throw new AppError('Title and deadline are required fields.', 400);
    }

    if (data.title === undefined) throw new AppError('Title Invalid.', 400);
    if (data.description === undefined) throw new AppError('Description Invalid.', 400);
    if (data.assigned_at === undefined) throw new AppError('Assigned Invalid.', 400);
    if (data.deadline === undefined) throw new AppError('Deadline Invalid.', 400);
    if(data.deadline.getTime() < Date.now()) throw new AppError('Deadline cannot be set in the past.', 400);
    if (data.priority === undefined) throw new AppError('Priority Invalid.', 400);
    if ( typeof data.priority !== 'number' || (data.priority !== 1 && data.priority !== 2 && data.priority !== 0)) throw new AppError('Invalid Priority.', 400);

    const newTask = await Task.create({
        userId,
        title: data.title,
        description: data.description || '',
        assigned_at: data.assigned_at ? new Date(data.assigned_at) : new Date(),
        deadline: new Date(data.deadline),
        priority: data.priority ?? TaskPriority.MID,
        is_completed: false,
        is_deleted: false,
    });

    return toHeavyTaskDTO(newTask);
}

export async function getAllTasksService(userId: string, isCompleted: boolean): Promise<LightTaskDTO[]> {
    const tasks = await Task.find({ userId, is_deleted: false, is_completed: isCompleted }).sort({ deadline: 1 });
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
    const task = await Task.findOne({ _id: taskId, userId });
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
        assigned_at?: Date;
        deadline?: Date;
        priority?: TaskPriority;
    }
): Promise<HeavyTaskDTO> {
    const task = await Task.findOne({ _id: taskId, userId });
    if (!task) {
        throw new AppError('Task not found.', 404);
    }

    if (task.is_completed) {
        throw new AppError('Cannot update a completed task.', 400);
    }

    if (task.is_deleted) {
        throw new AppError('Cannot update a soft-deleted task. Restore it first.', 400);
    }

    if (data.title === undefined) throw new AppError('Title Invalid.', 400);
    if (data.description === undefined) throw new AppError('Description Invalid.', 400);
    if (data.assigned_at === undefined) throw new AppError('Assigned Invalid.', 400);
    if (data.deadline === undefined) throw new AppError('Deadline Invalid.', 400);
    if(data.deadline.getTime() < Date.now()) throw new AppError('Deadline cannot be set in the past.', 400);
    if (data.priority === undefined) throw new AppError('Priority Invalid.', 400);
    if ( typeof data.priority !== 'number' || (data.priority !== 1 && data.priority !== 2 && data.priority !== 0)) throw new AppError('Invalid Priority.', 400);
    task.title = data.title;
    task.description = data.description;
    task.assigned_at = new Date(data.assigned_at);
    task.priority = data.priority;
    task.deadline = new Date(data.deadline);

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