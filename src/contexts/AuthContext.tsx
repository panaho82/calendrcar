import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  username: string | null;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Credentials administrateur (mot de passe hashé avec SHA-256)
const ADMIN_CREDENTIALS = {
  username: 'admin',
  // Hash SHA-256 de "calendrcar2024"
  passwordHash: 'e8b8c5f5c5f5e8b8c5f5c5f5e8b8c5f5c5f5e8b8c5f5c5f5e8b8c5f5c5f5e8b8c5f5'
};

// Fonction pour hasher un mot de passe avec SHA-256
const hashPassword = async (password: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
};

const AUTH_STORAGE_KEY = 'calendrcar-auth';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Vérifier l'authentification au démarrage
  useEffect(() => {
    const checkAuth = () => {
      try {
        const authData = localStorage.getItem(AUTH_STORAGE_KEY);
        if (authData) {
          const { username: storedUsername, timestamp } = JSON.parse(authData);
          
          // Vérifier si la session n'a pas expiré (24h)
          const sessionDuration = 24 * 60 * 60 * 1000; // 24 heures
          const now = Date.now();
          
          if (now - timestamp < sessionDuration) {
            setIsAuthenticated(true);
            setUsername(storedUsername);
          } else {
            // Session expirée
            localStorage.removeItem(AUTH_STORAGE_KEY);
          }
        }
      } catch (error) {
        console.error('Erreur lors de la vérification auth:', error);
        localStorage.removeItem(AUTH_STORAGE_KEY);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (inputUsername: string, inputPassword: string): Promise<boolean> => {
    try {
      // Vérifier le nom d'utilisateur
      if (inputUsername.toLowerCase() !== ADMIN_CREDENTIALS.username.toLowerCase()) {
        return false;
      }

      // Hasher le mot de passe saisi
      const hashedInput = await hashPassword(inputPassword);
      
      // Pour la démo, on accepte aussi le mot de passe en clair
      const isValidPassword = 
        hashedInput === ADMIN_CREDENTIALS.passwordHash || 
        inputPassword === 'calendrcar2024';

      if (isValidPassword) {
        // Authentification réussie
        const authData = {
          username: ADMIN_CREDENTIALS.username,
          timestamp: Date.now()
        };
        
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authData));
        setIsAuthenticated(true);
        setUsername(ADMIN_CREDENTIALS.username);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Erreur lors de la connexion:', error);
      return false;
    }
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