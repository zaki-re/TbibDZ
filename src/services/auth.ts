import api from './api';
import Cookies from 'js-cookie';

const TOKEN_COOKIE_NAME = 'tabibdz_token';

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData extends LoginCredentials {
  firstName: string;
  lastName: string;
  phone: string;
  userType: 'patient' | 'doctor';
  specialty?: string;
  license?: string;
}

interface AuthResponse {
  token: string;
  userType: 'patient' | 'doctor';
}

export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  const response = await api.post('/auth/login', credentials);
  const { token, userType } = response.data;
  Cookies.set(TOKEN_COOKIE_NAME, token, { expires: 7 });
  return { token, userType };
};

export const register = async (data: RegisterData): Promise<AuthResponse> => {
  const response = await api.post('/auth/register', data);
  const { token, userType } = response.data;
  Cookies.set(TOKEN_COOKIE_NAME, token, { expires: 7 });
  return { token, userType };
};

export const logout = () => {
  Cookies.remove(TOKEN_COOKIE_NAME);
};