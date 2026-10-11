import axiosInstance from './axiosInstance';

// END POINTS
export const authApi = {
  register: (email: string, password: string) =>
    axiosInstance.post('/auth/register', { email, password }),

  login: (email: string, password: string) =>
    axiosInstance.post('/auth/login', { email, password }),

  logout: () => axiosInstance.post('/auth/logout'),

  changePassword: (oldPassword: string, newPassword: string) =>
    axiosInstance.post('/auth/change-password', { oldPassword, newPassword }),
};