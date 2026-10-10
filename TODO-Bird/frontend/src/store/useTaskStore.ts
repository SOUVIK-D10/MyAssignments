import { create } from 'zustand';
import { taskApi, CreateTaskPayload, UpdateTaskPayload } from '../api/taskApi';

export type TaskCategory = 'WORK' | 'PERSONAL' | 'ACADEMIC' | 'HEALTH' | 'SYSTEM';

export interface LightTask {
  id: string;
  title: string;
  deadline: string;
  priority: number;
  category: TaskCategory;
  is_completed: boolean;
  is_deleted: boolean;
}

export interface HeavyTask extends LightTask {
  userId: string;
  description: string;
  completed_at?: string | null;
  createdAt: string;
  updatedAt: string;
}

interface TaskState {
  tasks: LightTask[];
  selectedTask: HeavyTask | null;
  activeFocusTaskId: string | null;
  isLoading: boolean;
  error: string | null;

  fetchTasks: (sortby: string, isDeleted: boolean) => Promise<void>;
  fetchTaskById: (id: string) => Promise<void>;
  createTask: (payload: CreateTaskPayload) => Promise<void>;
  updateTask: (id: string, payload: UpdateTaskPayload) => Promise<void>;
  markCompleted: (id: string) => Promise<void>;
  addToBin: (id: string) => Promise<void>;
  restoreFromBin: (id: string) => Promise<void>;
  removeFromBin: (id: string) => Promise<void>;
  emptyBin: () => Promise<void>;
  setFocusTask: (id: string | null) => void;
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  selectedTask: null,
  activeFocusTaskId: null,
  isLoading: false,
  error: null,

  fetchTasks: async (sortby = 'deadline', isDeleted = false) => {
    set({ isLoading: true });
    try {
      const response = await taskApi.getAllTasks(sortby, isDeleted);
      set({ tasks: response.data, isLoading: false });
    } catch (error) {
      console.error('Fetch tasks error:', error);
      set({ isLoading: false });
    }
  },

  fetchTaskById: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await taskApi.getTaskById(id);
      set({ selectedTask: response.data, isLoading: false });
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Task not found', isLoading: false });
    }
  },

  createTask: async (payload) => {
    await taskApi.createTask(payload);
    await get().fetchTasks('priority', false);
  },

  updateTask: async (id, payload) => {
    await taskApi.updateTask(id, payload);
    await get().fetchTasks('priority', false);
  },

  markCompleted: async (id) => {
    await taskApi.markCompleted(id);
    await get().fetchTasks('priority', false);
  },

  addToBin: async (id) => {
    await taskApi.addToBin(id);
    await get().fetchTasks('priority', false);
  },

  restoreFromBin: async (id) => {
    await taskApi.restoreFromBin(id);
    await get().fetchTasks('priority', false);
  },

  removeFromBin: async (id) => {
    await taskApi.removeFromBin(id);
    await get().fetchTasks('priority', false);
  },

  emptyBin: async () => {
    await taskApi.emptyBin();
    await get().fetchTasks('priority', false);
  },

  setFocusTask: (id) => set({ activeFocusTaskId: id }),
}));