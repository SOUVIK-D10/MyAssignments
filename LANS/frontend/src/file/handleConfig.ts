import AsyncStorage from '@react-native-async-storage/async-storage';
import defaultConfig from '../../config.json'; 

const STORAGE_KEYS = {
  HOST: '@lans_target_host',
  THEME: '@lans_theme',
};


export const RECONNECTION_DELAY = defaultConfig.reconnect_interval_ms || 3000;
export const DEFAULT_THEME = defaultConfig.theme || 'dark';
export const DEFAULT_HOST = defaultConfig.default_ws_url;

export function getFormattedWsUrl(hostInput: string): string {
  let cleaned = hostInput.trim().replace(/\/ws\/?$/, '').replace(/\/$/, '');
  cleaned = cleaned.replace(/^wss?:\/\//, '').replace(/^https?:\/\//, '');
  if (!cleaned) cleaned = DEFAULT_HOST;
  return `wss://${cleaned}/ws`;
}

export async function getConfiguredHost(): Promise<string> {
  try {
    const saved = await AsyncStorage.getItem(STORAGE_KEYS.HOST);
    return saved || DEFAULT_HOST;
  } catch (e) {
    //console.error('[ConfigManager] Failed to read stored host:', e);
    return DEFAULT_HOST;
  }
}


export async function setConfiguredHost(host: string): Promise<string> {
  try {
    let cleaned = host.trim().replace(/\/ws\/?$/, '').replace(/\/$/, '');
    cleaned = cleaned.replace(/^wss?:\/\//, '').replace(/^https?:\/\//, '');
    if (!cleaned) cleaned = DEFAULT_HOST;

    await AsyncStorage.setItem(STORAGE_KEYS.HOST, cleaned);
    return cleaned;
  } catch (e) {
    //console.error('[ConfigManager] Failed to save host override:', e);
    throw e;
  }
}


export async function getConfiguredTheme(): Promise<'dark' | 'light'> {
  try {
    const saved = await AsyncStorage.getItem(STORAGE_KEYS.THEME);
    return (saved as 'dark' | 'light') || (DEFAULT_THEME as 'dark' | 'light');
  } catch (e) {
    //console.error('[ConfigManager] Failed to read stored theme:', e);
    return (DEFAULT_THEME as 'dark' | 'light');
  }
}

export async function setConfiguredTheme(theme: 'dark' | 'light'): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.THEME, theme);
  } catch (e) {
    //console.error('[ConfigManager] Failed to save theme override:', e);
    throw e;
  }
}