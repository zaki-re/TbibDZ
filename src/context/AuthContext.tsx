import React, { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import Cookies from 'js-cookie';

const TOKEN_COOKIE_NAME = 'tabibdz_token';

interface AuthContextType {
  isAuthenticated: boolean;
  userType: 'patient' | 'doctor' | null;
  userId: number | null;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  userType: null,
  userId: null,
  login: () => {},
  logout: () => {},
});

export const useAuth = () => useContext(AuthContext);

interface DecodedToken {
  id: number;
  userType: 'patient' | 'doctor';
  exp: number;
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userType, setUserType] = useState<'patient' | 'doctor' | null>(null);
  const [userId, setUserId] = useState<number | null>(null);

  useEffect(() => {
    // Check for token in cookies on mount
    const token = Cookies.get(TOKEN_COOKIE_NAME);
    if (token) {
      try {
        const decoded = jwtDecode<DecodedToken>(token);
        
        // Check if token is expired
        if (decoded.exp * 1000 > Date.now()) {
          setIsAuthenticated(true);
          setUserType(decoded.userType);
          setUserId(decoded.id);
        } else {
          // Remove expired token
          Cookies.remove(TOKEN_COOKIE_NAME);
        }
      } catch (error) {
        Cookies.remove(TOKEN_COOKIE_NAME);
      }
    }
  }, []);

  const login = (token: string) => {
    const decoded = jwtDecode<DecodedToken>(token);
    setIsAuthenticated(true);
    setUserType(decoded.userType);
    setUserId(decoded.id);
  };

  const logout = () => {
    Cookies.remove(TOKEN_COOKIE_NAME);
    setIsAuthenticated(false);
    setUserType(null);
    setUserId(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, userType, userId, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};