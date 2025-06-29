import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  username: string | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'calendrcar-auth';
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'calendrcar2024';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      try {
        const authData = localStorage.getItem(AUTH_STORAGE_KEY);
        if (authData) {
          const { username: storedUsername, timestamp } = JSON.parse(authData);
          
          const sessionDuration = 24 * 60 * 60 * 1000; // 24 heures
          const now = Date.now();
          
          if (now - timestamp < sessionDuration) {
            setIsAuthenticated(true);
            setUsername(storedUsername);
          } else {
            localStorage.removeItem(AUTH_STORAGE_KEY);
          }
        }
      } catch (error) {
        console.error('Erreur auth:', error);
        localStorage.removeItem(AUTH_STORAGE_KEY);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (inputUsername: string, inputPassword: string): Promise<boolean> => {
    if (inputUsername === ADMIN_USERNAME && inputPassword === ADMIN_PASSWORD) {
      const authData = {
        username: ADMIN_USERNAME,
        timestamp: Date.now()
      };
      
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authData));
      setIsAuthenticated(true);
      setUsername(ADMIN_USERNAME);
      return true;
    }
    return false;
  };

  const logout = () => {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    setIsAuthenticated(false);
    setUsername(null);
  };

  const value: AuthContextType = {
    isAuthenticated,
    username,
    login,
    logout,
    isLoading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth doit être utilisé dans un AuthProvider');
  }
  return context;
};

export default AuthContext; 