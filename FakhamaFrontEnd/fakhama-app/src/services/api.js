import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const api = axios.create({
  baseURL: 'http://172.20.10.2:8000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Request interceptor: attach Authorization header if token exists
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (err) {
      // ignore errors reading token
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: on 401 remove token to force logout
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    try {
      if (error && error.response && error.response.status === 401) {
        await AsyncStorage.removeItem('token');
      }
    } catch (err) {
      // ignore removal errors
    }
    
    // Log detailed error info for debugging
    console.log('=== API ERROR DEBUG ===');
    console.log('Attempting to reach:', error.config?.url || 'Unknown URL');
    console.log('Error type:', error.code || 'Unknown');
    console.log('Error message:', error.message);
    console.log('Error status:', error.response?.status);
    console.log('Error response:', error.response?.data);
    
    if (!error.response) {
      console.log('⚠️  NO RESPONSE - Network issue or server unreachable');
      console.log('Make sure backend is running at:', error.config?.baseURL);
    }
    console.log('========================');
    
    return Promise.reject(error);
  }
);

export default api;
