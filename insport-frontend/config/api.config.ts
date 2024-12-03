// config/api.config.ts
import axios from 'axios';
import { API_BASE_URL } from '../constants/ApiRoutes';
import { getToken, handleUnauthorized } from '../utils/auth';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use(async (config) => {
  const token = await getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) handleUnauthorized();
    console.error('API Error:', error.response?.data);
    return Promise.reject(error);
  }
);

export default apiClient;
