import api from './api';
import { jwtDecode } from 'jwt-decode';
import Cookies from 'js-cookie';

const TOKEN_COOKIE_NAME = 'tabibdz_token';
const TOKEN_EXPIRY_DAYS = 7;

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  userType: 'patient' | 'doctor';
  specialty?: string;
  license?: string;
}

interface DecodedToken {
  id: number;
  userType: 'patient' | 'doctor';
  exp: number;
}

export const login = async (data: LoginData) => {
  try {
    const response = await api.post('/auth/login', data);
    const { token } = response.data;
    
    if (!token) {
      throw new Error('No token received');
    }

    // Decode token to get user type
    const decoded = jwtDecode<DecodedToken>(token);
    
    // Store token in cookie
    Cookies.set(TOKEN_COOKIE_NAME, token, { 
      expires: TOKEN_EXPIRY_DAYS,
      secure: true,
      sameSite: 'strict'
    });
    
    return {
      token,
      userType: decoded.userType
    };
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

export const register = async (data: RegisterData) => {
  try {
    const response = await api.post('/auth/register', data);
    const { token } = response.data;
    
    if (!token) {
      throw new Error('No token received');
    }

    // Decode token to get user type
    const decoded = jwtDecode<DecodedToken>(token);
    
    // Store token in cookie
    Cookies.set(TOKEN_COOKIE_NAME, token, { 
      expires: TOKEN_EXPIRY_DAYS,
      secure: true,
      sameSite: 'strict'
    });
    
    return {
      token,
      userType: decoded.userType
    };
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
};

export const logout = () => {
  Cookies.remove(TOKEN_COOKIE_NAME);
};

export const getCurrentUser = () => {
  const token = Cookies.get(TOKEN_COOKIE_NAME);
  if (!token) return null;

  try {
    const decoded = jwtDecode<DecodedToken>(token);
    
    // Check if token is expired
    if (decoded.exp * 1000 < Date.now()) {
      Cookies.remove(TOKEN_COOKIE_NAME);
      return null;
    }

    return {
      id: decoded.id,
      userType: decoded.userType
    };
  } catch {
    Cookies.remove(TOKEN_COOKIE_NAME);
    return null;
  }
};