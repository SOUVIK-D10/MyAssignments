import { create } from 'zustand';
import { 
  getConfiguredHost, 
  setConfiguredHost, 
  getConfiguredTheme, 
  setConfiguredTheme, 
  getFormattedWsUrl
} from '../file/handleConfig';

export interface LeadPayload {
  leadgen_id: string;
  form_id?: string;
  created_time?: number;
  name?: string;
  email?: string;
  phone?: string;
}

interface AppState {
  targetHost: string;
  activeWsUrl: string;
  theme: 'dark' | 'light';
  isConnected: boolean;
  statusText: string;
  leads: LeadPayload[];

  // Actions
  initializeConfig: () => Promise<void>;
  updateTargetHost: (host: string) => Promise<void>;
  toggleTheme: () => Promise<void>;
  setIsConnected: (status: boolean) => void;
  setStatusText: (text: string) => void;
  addLead: (lead: LeadPayload) => void;
}

export const useStore = create<AppState>((set, get) => ({
  targetHost: '',
  activeWsUrl: '',
  theme: 'dark',
  isConnected: false,
  statusText: 'Starting...',
  leads: [],

  initializeConfig: async () => {
    const host = await getConfiguredHost();
    const theme = await getConfiguredTheme();
    set({
      targetHost: host,
      activeWsUrl: getFormattedWsUrl(host),
      theme,
    });
  },

  updateTargetHost: async (host: string) => {
    const savedHost = await setConfiguredHost(host);
    set({
      targetHost: savedHost,
      activeWsUrl: getFormattedWsUrl(savedHost),
    });
  },

  toggleTheme: async () => {
    const newTheme = get().theme === 'dark' ? 'light' : 'dark';
    await setConfiguredTheme(newTheme);
    set({ theme: newTheme });
  },

  setIsConnected: (isConnected) => set({ isConnected }),
  setStatusText: (statusText) => set({ statusText }),
  addLead: (lead) => set((state) => ({ leads: [lead, ...state.leads] })),
}));