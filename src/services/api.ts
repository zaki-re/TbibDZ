import axios from 'axios';
import Cookies from 'js-cookie';

const API_URL = 'http://localhost:3000/api';
const TOKEN_COOKIE_NAME = 'tabibdz_token';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true
});

// Add token to requests if it exists
api.interceptors.request.use((config) => {
  const token = Cookies.get(TOKEN_COOKIE_NAME);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      Cookies.remove(TOKEN_COOKIE_NAME);
      window.dispatchEvent(new CustomEvent('navigate', { detail: 'login' }));
    }
    return Promise.reject(error);
  }
);

export default api;