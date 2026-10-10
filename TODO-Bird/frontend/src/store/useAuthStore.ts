import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { authApi } from '../api/authApi';

interface AuthState {
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  isAuthenticated: false,
  isLoading: true,

  login: async (token: string) => {
    await SecureStore.setItemAsync('userToken', token);
    set({ token, isAuthenticated: true });
  },

  logout: async () => {
    try {
      await authApi.logout();
    } catch {
      // Ignore network errors during local teardown
    } finally {
      await SecureStore.deleteItemAsync('userToken');
      set({ token: null, isAuthenticated: false });
    }
  },

  checkAuth: async () => {
    try {
      const token = await SecureStore.getItemAsync('userToken');
      if (token) {
        set({ token, isAuthenticated: true, isLoading: false });
      } else {
        set({ token: null, isAuthenticated: false, isLoading: false });
      }
    } catch {
      set({ token: null, isAuthenticated: false, isLoading: false });
    }
  },
}));