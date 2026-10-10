import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// For Android emulator use http://10.0.2.2:5000/api, for local LAN use machine IP
// const BASE_URL = Platform.OS === 'android' ? 'http://10.0.2.2:5000/api' : 'http://localhost:5000/api';
// const BASE_URL = 'http://10.127.161.198:5000/api';
// const BASE_URL = 'http://10.203.91.198:5000/api';
// const BASE_URL = 'http://10.203.91.198:5000/api';
const BASE_URL = 'https://zack-submammary-jacquiline.ngrok-free.dev/api';


const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    'ngrok-skip-browser-warning': 'true',
    'Content-Type': 'application/json',
  },
});

// Automatic Bearer Token injection
axiosInstance.interceptors.request.use(
  async (config) => {
    const token = await SecureStore.getItemAsync('userToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default axiosInstance;