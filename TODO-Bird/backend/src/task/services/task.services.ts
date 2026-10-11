import Task, { ITask, TaskPriority, TaskCategory } from '../modules/Task';
import { LightTaskDTO, HeavyTaskDTO, toLightTaskDTO, toHeavyTaskDTO } from '../dtos/task.dto';
import { AppError } from '../../utils/AppError';
import User from '../../auth/modules/User';


// CREATION OF TASK
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

    // VALIDATE TITLE
    if (data.title === undefined || data.title === null) {
        throw new AppError('Title Invalid.', 400);
    }

    // VALIDATE DESCRIPTION
    if (data.description === undefined || data.description === null) {
        throw new AppError('Description Invalid.', 400);
    }

    // VALIDATE DEADLINE first
    if (data.deadline === undefined || data.deadline === null) {
        throw new AppError('Deadline Invalid.', 400);
    }

    // Convert string/date input safely to a Date object
    const deadlineDate = new Date(data.deadline);
    if (isNaN(deadlineDate.getTime())) {
        throw new AppError('Deadline Invalid.', 400);
    }

    // VALIDATE DEADLINE second
    if (deadlineDate.getTime() < Date.now()) {
        throw new AppError('Deadline cannot be set in the past.', 400);
    }

    // VALIDATE PRIORITY
    if (
        data.priority === undefined ||
        typeof data.priority !== 'number' ||
        ![0, 1, 2].includes(data.priority)
    ) {
        throw new AppError('Invalid Priority.', 400);
    }

    // VALIDATE CATEGORY
    if (data.category !== undefined) {
        if (!Object.values(TaskCategory).includes(data.category)) {
            throw new AppError('Invalid Category.', 400);
        }
    }

    // CREATING DATABASE ENTRY
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

    // MAP & RETURN
    return toHeavyTaskDTO(newTask);
}

// Fetching all tasks
export async function getAllTasksService(userId: string, sortby: string, isDeleted: boolean): Promise<LightTaskDTO[]> {
    const tasks = await Task.find({ userId, is_deleted: isDeleted }).sort({ [sortby]: 1 });
    // MAP & RETURN (LIGHT FOR LESS BANDWIDTH CONSUMPTION)
    return tasks.map(toLightTaskDTO);
}

// Fetching one task with details
export async function getTaskByIdService(userId: string, taskId: string): Promise<HeavyTaskDTO> {
    const task = await Task.findOne({ _id: taskId, userId });
    if (!task) {
        throw new AppError('Task not found.', 404);
    }
    // MAP & RETURN
    return toHeavyTaskDTO(task);
}

// Database Update on Complete
export async function markTaskCompletedService(userId: string, taskId: string): Promise<HeavyTaskDTO> {
    const task = await Task.findOne({ _id: taskId, userId, is_deleted: false });
    if (!task) {
        throw new AppError('Task not found.', 404);
    }

    // VALIDATE IF COMPLETED ALREADY
    if (task.is_completed) {
        throw new AppError('Task is already completed. No updates allowed.', 400);
    }

    task.is_completed = true;
    task.completed_at = new Date();
    await task.save();

    // MAP & RETURN
    return toHeavyTaskDTO(task);
}

// Database update , Edited Task
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
    // CHECKING IF TASK EXISTS (HARD DELETED don't exist)
    const task = await Task.findOne({ _id: taskId, userId, is_deleted: false, is_completed: false });
    if (!task) {
        throw new AppError('Task not found.', 404);
    }

    // CHECKING IS TASK ALREADY COMPLETED
    if (task.is_completed) {
        throw new AppError('Cannot update a completed task.', 400);
    }

    // CHECKING IS TASK SOFT-DELETED
    if (task.is_deleted) {
        throw new AppError('Cannot update a soft-deleted task. Restore it first.', 400);
    }

    // VALIDATE TITLE
    if (data.title !== undefined) task.title = data.title;

    // VALIDATE DESCRIPTION
    if (data.description !== undefined) task.description = data.description;

    // VALIDATE PRIORITY
    if (data.priority !== undefined) {
        if (typeof data.priority !== 'number' || ![0, 1, 2].includes(data.priority)) {
            throw new AppError('Invalid Priority.', 400);
        }
        task.priority = data.priority;
    }

    // VALIDATE CATEGORY
    if (data.category !== undefined) {
        if (!Object.values(TaskCategory).includes(data.category)) {
            throw new AppError('Invalid Category.', 400);
        }
        task.category = data.category;
    }

    // VALIDATE DEADLINE
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

    // OVERWRITING CURRENT ENTRY
    await task.save();

    // MAP & RETURN
    return toHeavyTaskDTO(task);
}

// Recycle Bin add
export async function addToBinService(userId: string, taskId: string): Promise<HeavyTaskDTO> {

    const task = await Task.findOne({ _id: taskId, userId });
    if (!task) {
        throw new AppError('Task not found.', 404);
    }

    // VALIDATE IS SOFT-DELETED 
    if (task.is_deleted) {
        throw new AppError('Task is already in the bin.', 400);
    }

    task.is_deleted = true;

    // UPDATE
    await task.save();

    // MAP & RETURN
    return toHeavyTaskDTO(task);
}

// Recycle bin restore
export async function restoreFromBinService(userId: string, taskId: string): Promise<HeavyTaskDTO> {
    const task = await Task.findOne({ _id: taskId, userId });
    if (!task) {
        throw new AppError('Task not found.', 404);
    }

    // VALIDATE IF SOFT-DELETED
    if (!task.is_deleted) {
        throw new AppError('Task is not in the bin.', 400);
    }

    task.is_deleted = false;
    await task.save();

    // MAP & RETURN
    return toHeavyTaskDTO(task);
}

// Permanent delete
export async function removeFromBinService(userId: string, taskId: string): Promise<void> {
    const task = await Task.findOne({ _id: taskId, userId });
    if (!task) {
        throw new AppError('Task not found.', 404);
    }

    // VALIDATE IF SOFT DELETED
    if (!task.is_deleted) {
        throw new AppError('Only tasks marked as deleted can be permanently removed.', 400);
    }

    // DELETE PERMANENTLY
    await Task.deleteOne({ _id: taskId, userId });
}

// delete all in recycle bin (permanent)
export async function emptyBinService(userId: string): Promise<{ deletedCount: number }> {
    const result = await Task.deleteMany({ userId, is_deleted: true });
    return { deletedCount: result.deletedCount || 0 };
}