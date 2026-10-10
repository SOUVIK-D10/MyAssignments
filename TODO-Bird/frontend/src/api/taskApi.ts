import axiosInstance from './axiosInstance';

export type TaskCategory = 'WORK' | 'PERSONAL' | 'ACADEMIC' | 'HEALTH' | 'SYSTEM';

export interface CreateTaskPayload {
  title: string;
  description?: string;
  deadline: string;
  priority: number;
  category?: TaskCategory;
}

export interface UpdateTaskPayload {
  title?: string;
  description?: string;
  deadline?: string;
  priority?: number;
  category?: TaskCategory;
}

export const taskApi = {
  createTask: (payload: CreateTaskPayload) =>
    axiosInstance.post('/tasks/create', payload),

  getAllTasks: (sortby: string, isDeleted: boolean | string) =>
    axiosInstance.get('/tasks/all', {
      params: { sortby, isDeleted },
    }),

  getTaskById: (id: string) => axiosInstance.get(`/tasks/${id}`),

  markCompleted: (id: string) => axiosInstance.patch(`/tasks/mark-completed/${id}`),

  updateTask: (id: string, payload: UpdateTaskPayload) =>
    axiosInstance.put(`/tasks/update-task/${id}`, payload),

  addToBin: (id: string) => axiosInstance.patch(`/tasks/add-to-bin/${id}`),

  restoreFromBin: (id: string) => axiosInstance.patch(`/tasks/restore-from-bin/${id}`),

  removeFromBin: (id: string) => axiosInstance.delete(`/tasks/remove-from-bin/${id}`),

  emptyBin: () => axiosInstance.delete('/tasks/empty-bin'),
};