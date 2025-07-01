import React, { useEffect, useState } from "react";
import { 
  Calendar, 
  Clock, 
  Car, 
  Phone, 
  User, 
  Plus, 
  Search, 
  Settings, 
  ChevronLeft, 
  ChevronRight, 
  MoreVertical,
  BarChart3,
  CalendarDays,
  Truck,
  X,
  Trash2,
  Save,
  Sun,
  Moon,
  CheckCircle,
  AlertCircle,
  XCircle,
  Info,
  Bell,
  Download,
  Wifi,
  WifiOff,
  Smartphone,
  LogOut,
  Lock,
  Eye,
  EyeOff,
  LogIn
} from "lucide-react";
// Imports PWA temporairement désactivés pour les tests
// import { usePWA } from './hooks/usePWA';
// import { useNotificationScheduler } from './hooks/useNotificationScheduler';

// Authentification intégrée directement dans App.tsx

// ==================== AUTHENTIFICATION ====================

interface AuthContextType {
  isAuthenticated: boolean;
  username: string | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'calendrcar-auth';
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'calendrcar2024';

const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
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

const useAuth = (): AuthContextType => {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth doit être utilisé dans un AuthProvider');
  }
  return context;
};

// Page de Login
const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim() || !password.trim()) {
      setError('Veuillez remplir tous les champs');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const success = await login(username.trim(), password);
      if (!success) {
        setError('Nom d\'utilisateur ou mot de passe incorrect');
        setPassword('');
      }
    } catch (error) {
      setError('Erreur de connexion. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-8 text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-white rounded-full p-3 shadow-lg">
                <Car className="h-8 w-8 text-blue-600" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">CalendrCar</h1>
            <p className="text-blue-100 text-sm">Gestion de Location de Véhicules</p>
          </div>

          {/* Form */}
          <div className="px-8 py-8">
            <div className="text-center mb-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-2">Connexion Administrateur</h2>
              <p className="text-gray-500 text-sm">Accédez à votre espace de gestion</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Username Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom d'utilisateur
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                    placeholder="Entrez votre nom d'utilisateur"
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mot de passe
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                    placeholder="Entrez votre mot de passe"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}

              {/* Login Button */}
              <button
                type="submit"
                disabled={isLoading || !username.trim() || !password.trim()}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-4 rounded-lg font-medium hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-2"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Connexion...</span>
                  </>
                ) : (
                  <>
                    <LogIn className="h-5 w-5" />
                    <span>Se connecter</span>
                  </>
                )}
              </button>
            </form>

            {/* Demo Credentials */}
            <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-blue-800 text-sm font-medium mb-2">Credentials de démonstration :</p>
              <div className="text-blue-700 text-sm space-y-1">
                <p><strong>Utilisateur :</strong> admin</p>
                <p><strong>Mot de passe :</strong> calendrcar2024</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-gray-500 text-xs">
            © 2024 CalendrCar - Tous droits réservés
          </p>
        </div>
      </div>
    </div>
  );
};

// ==================== FIN AUTHENTIFICATION ====================

interface Vehicle {
  id: string;
  name: string;
  plate: string;
  type: string;
  status: "available" | "occupied" | "maintenance";
  color: string;
  icon: string;
}

interface Reservation {
  id: string;
  title: string;
  client: string;
  phone: string;
  vehicleId: string;
  startTime: Date;
  endTime: Date;
  status: "confirmed" | "pending" | "cancelled";
  notes?: string;
  amount?: number;
}

interface Alternative {
  start: Date;
  end: Date;
  label: string;
}

interface DailyPosition {
  dayIndex: number;
  startPercent: number;
  widthPercent: number;
}

const INITIAL_VEHICLES: Vehicle[] = [
  // Peugeot 208 - Même couleur (bleu)
  { id: "1", name: "Peugeot 208", plate: "274-474-P", type: "Citadine", status: "available", color: "#3B82F6", icon: "🚗" },
  { id: "2", name: "Peugeot 208", plate: "274-473-P", type: "Citadine", status: "available", color: "#3B82F6", icon: "🚗" },
  
  // Mitsubishi L200 4x4 - Couleur unique (gris foncé)
  { id: "3", name: "Mitsubishi L200", plate: "292666", type: "4x4", status: "available", color: "#4B5563", icon: "🚙" },
  
  // Mitsubishi Mirage - Couleur unique (rouge)
  { id: "4", name: "Mitsubishi Mirage", plate: "273-663-P", type: "Citadine", status: "available", color: "#EF4444", icon: "🚗" },
  
  // Kia Niro - Couleur unique (vert)
  { id: "5", name: "Kia Niro", plate: "272-696-P", type: "SUV", status: "available", color: "#10B981", icon: "🚙" },
  
  // Kia Picanto - Couleur unique (violet)
  { id: "6", name: "Kia Picanto", plate: "272-695-P", type: "Citadine", status: "available", color: "#8B5CF6", icon: "🚗" },
  
  // Scooters - Même couleur (orange)
  { id: "7", name: "Scooter", plate: "BW-2943", type: "Scooter", status: "available", color: "#F59E0B", icon: "🛵" },
  { id: "8", name: "Scooter", plate: "BW-2945", type: "Scooter", status: "available", color: "#F59E0B", icon: "🛵" },
  { id: "9", name: "Scooter", plate: "BW-2946", type: "Scooter", status: "available", color: "#F59E0B", icon: "🛵" },
  
  // Swift - Même couleur (cyan)
  { id: "10", name: "Swift", plate: "277728", type: "Citadine", status: "available", color: "#06B6D4", icon: "🚗" },
  { id: "11", name: "Swift", plate: "283833", type: "Citadine", status: "available", color: "#06B6D4", icon: "🚗" },
  { id: "12", name: "Swift", plate: "277-842", type: "Citadine", status: "available", color: "#06B6D4", icon: "🚗" },
  
  // Swift automatique - Couleur différente (vert foncé)
  { id: "13", name: "Swift automatique", plate: "277277", type: "Citadine", status: "available", color: "#059669", icon: "🚗" },
];

const VEHICLES_STORAGE_KEY = "calendrcar-vehicles-v2";

const EXAMPLE_RESERVATIONS: Reservation[] = [
  // Base de données vide - prête pour tes vraies réservations
];

const STORAGE_KEY = "calendrcar-reservations-v2";

const formatDate = (date: Date) => {
  return date.toLocaleDateString('fr-FR', { 
    weekday: 'short', 
    day: 'numeric', 
    month: 'short' 
  });
};

const formatTime = (date: Date) => {
  return date.toLocaleTimeString('fr-FR', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
};

const getDuration = (start: Date, end: Date) => {
  const diff = end.getTime() - start.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);
  const remainingHours = hours % 24;
  
  if (days > 0) {
    return `${days}j ${remainingHours}h`;
  }
  return `${hours}h`;
};

// Fonction pour convertir une date en format datetime-local sans décalage UTC
const formatDateTimeLocal = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "confirmed": return "bg-green-100 text-green-800 border-green-200";
    case "pending": return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "cancelled": return "bg-red-100 text-red-800 border-red-200";
    default: return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case "confirmed": return "✓";
    case "pending": return "⏳";
    case "cancelled": return "✗";
    default: return "•";
  }
};

// Composant Notification Toast
const Toast = ({ 
  message, 
  type = 'info', 
  isVisible, 
  onClose 
}: { 
  message: string, 
  type?: 'success' | 'error' | 'warning' | 'info', 
  isVisible: boolean, 
  onClose: () => void 
}) => {
  const icons = {
    success: CheckCircle,
    error: XCircle,
    warning: AlertCircle,
    info: Info
  };

  const colors = {
    success: 'bg-green-500 border-green-600',
    error: 'bg-red-500 border-red-600',
    warning: 'bg-yellow-500 border-yellow-600',
    info: 'bg-blue-500 border-blue-600'
  };

  const Icon = icons[type];

  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(onClose, 3000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  return (
    <div className={`fixed top-4 right-4 z-50 transform transition-all duration-300 ${
      isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
    }`}>
      <div className={`${colors[type]} border-l-4 p-4 rounded-lg shadow-lg max-w-sm`}>
        <div className="flex items-center">
          <Icon className="h-5 w-5 text-white mr-3" />
          <p className="text-white font-medium">{message}</p>
          <button 
            onClick={onClose}
            className="ml-auto text-white hover:text-gray-200 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
  };

// Composant Loading Spinner
const LoadingSpinner = ({ isDarkMode }: { isDarkMode: boolean }) => {
  return (
    <div className="flex items-center justify-center space-x-2">
      <div className={`w-2 h-2 rounded-full animate-pulse ${isDarkMode ? 'bg-blue-400' : 'bg-blue-600'}`}></div>
      <div className={`w-2 h-2 rounded-full animate-pulse ${isDarkMode ? 'bg-blue-400' : 'bg-blue-600'}`} style={{ animationDelay: '0.2s' }}></div>
      <div className={`w-2 h-2 rounded-full animate-pulse ${isDarkMode ? 'bg-blue-400' : 'bg-blue-600'}`} style={{ animationDelay: '0.4s' }}></div>
    </div>
  );
};

// Composant Modal amélioré
const Modal = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  isDarkMode,
  size = 'md' 
}: { 
  isOpen: boolean, 
  onClose: () => void, 
  title: string, 
  children: React.ReactNode,
  isDarkMode: boolean,
  size?: 'sm' | 'md' | 'lg' | 'xl'
}) => {
  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl'
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center modal-overlay animate-fadeInUp">
      <div 
        className={`relative w-full mx-4 ${sizeClasses[size]} ${
          isDarkMode 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-200'
        } rounded-xl shadow-2xl border transition-all-300 animate-slideInRight`}
      >
        {/* Header */}
        <div className={`flex items-center justify-between p-6 border-b ${
          isDarkMode ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <h3 className={`text-lg font-semibold ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            {title}
          </h3>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg transition-colors hover:${
              isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
            }`}
          >
            <X className={`h-5 w-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
  };

// Composant de graphique simple (barre de progression)
const ProgressBar = ({ 
  value, 
  max, 
  label, 
  color = 'blue', 
  isDarkMode 
}: { 
  value: number, 
  max: number, 
  label: string, 
  color?: string, 
  isDarkMode: boolean 
}) => {
  const percentage = (value / max) * 100;
  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    yellow: 'bg-yellow-500',
    red: 'bg-red-500',
    purple: 'bg-purple-500'
  };

  return (
    <div className="mb-4">
      <div className="flex justify-between mb-2">
        <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
          {label}
        </span>
        <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          {value}/{max}
        </span>
      </div>
      <div className={`w-full rounded-full h-2 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
        <div 
          className={`h-2 rounded-full transition-all duration-500 ${colorClasses[color as keyof typeof colorClasses]}`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        ></div>
      </div>
    </div>
  );
  };

// Composant PWA Settings Panel
const PWASettingsPanel = ({ 
  isDarkMode, 
  isOpen, 
  onClose, 
  showNotification 
}: { 
  isDarkMode: boolean, 
  isOpen: boolean, 
  onClose: () => void,
  showNotification: (message: string, type?: 'success' | 'error' | 'warning' | 'info') => void 
}) => {
  // Temporairement désactivé pour les tests
  // const pwa = usePWA();
  const pwa = {
    isOnline: true,
    isSupported: true,
    notifications: { 
      permission: 'default' as NotificationPermission,
      subscribe: async () => {},
      unsubscribe: async () => {},
      sendTestNotification: async (type: string) => {}
    },
    install: { 
      showInstallPrompt: false, 
      isInstalled: false,
      install: async () => {}
    }
  };
  const [isLoading, setIsLoading] = useState(false);

  const handleSubscribeNotifications = async () => {
    setIsLoading(true);
    try {
      await pwa.notifications.subscribe();
      showNotification('Notifications activées avec succès !', 'success');
    } catch (error) {
      console.error('Erreur souscription:', error);
      showNotification('Erreur lors de l\'activation des notifications', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnsubscribeNotifications = async () => {
    setIsLoading(true);
    try {
      await pwa.notifications.unsubscribe();
      showNotification('Notifications désactivées', 'info');
    } catch (error) {
      console.error('Erreur désabonnement:', error);
      showNotification('Erreur lors de la désactivation', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInstallPWA = async () => {
    setIsLoading(true);
    try {
      await pwa.install.install();
      showNotification('Application installée avec succès !', 'success');
    } catch (error) {
      console.error('Erreur installation:', error);
      showNotification('Erreur lors de l\'installation', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestNotification = async (type: string) => {
    setIsLoading(true);
    try {
      await pwa.notifications.sendTestNotification(type);
      showNotification(`Notification de test envoyée: ${type}`, 'info');
    } catch (error) {
      console.error('Erreur notification test:', error);
      showNotification('Erreur lors de l\'envoi du test', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center modal-overlay animate-fadeInUp">
      <div className={`relative w-full mx-4 max-w-2xl ${
        isDarkMode 
          ? 'bg-gray-800 border-gray-700' 
          : 'bg-white border-gray-200'
      } rounded-xl shadow-2xl border transition-all-300 animate-slideInRight`}>
        {/* Header */}
        <div className={`flex items-center justify-between p-6 border-b ${
          isDarkMode ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <div className="flex items-center space-x-3">
            <Smartphone className={`h-6 w-6 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
            <h3 className={`text-xl font-semibold ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Paramètres PWA
            </h3>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg transition-colors hover:${
              isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
            }`}
          >
            <X className={`h-5 w-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Statut de connexion */}
          <div className={`p-4 rounded-lg ${
            pwa.isOnline 
              ? (isDarkMode ? 'bg-green-900/20 border-green-700' : 'bg-green-50 border-green-200')
              : (isDarkMode ? 'bg-red-900/20 border-red-700' : 'bg-red-50 border-red-200')
          } border`}>
            <div className="flex items-center space-x-3">
              {pwa.isOnline ? 
                <Wifi className="h-5 w-5 text-green-600" /> : 
                <WifiOff className="h-5 w-5 text-red-600" />
              }
              <div>
                <p className={`font-medium ${
                  pwa.isOnline 
                    ? 'text-green-800' + (isDarkMode ? ' dark:text-green-200' : '')
                    : 'text-red-800' + (isDarkMode ? ' dark:text-red-200' : '')
                }`}>
                  {pwa.isOnline ? 'En ligne' : 'Hors ligne'}
                </p>
                <p className={`text-sm ${
                  pwa.isOnline 
                    ? 'text-green-600' + (isDarkMode ? ' dark:text-green-300' : '')
                    : 'text-red-600' + (isDarkMode ? ' dark:text-red-300' : '')
                }`}>
                  {pwa.isOnline 
                    ? 'Synchronisation active avec le serveur'
                    : 'Mode hors ligne - données locales uniquement'
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Installation PWA */}
          {pwa.install.showInstallPrompt && (
            <div className={`p-4 rounded-lg border ${
              isDarkMode ? 'bg-blue-900/20 border-blue-700' : 'bg-blue-50 border-blue-200'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Download className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className={`font-medium ${
                      isDarkMode ? 'text-blue-200' : 'text-blue-800'
                    }`}>
                      Installer CalendrCar
                    </p>
                    <p className={`text-sm ${
                      isDarkMode ? 'text-blue-300' : 'text-blue-600'
                    }`}>
                      Accès rapide depuis votre bureau
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleInstallPWA}
                  disabled={isLoading}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    isDarkMode
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  } disabled:opacity-50`}
                >
                  {isLoading ? <LoadingSpinner isDarkMode={isDarkMode} /> : 'Installer'}
                </button>
              </div>
            </div>
          )}

          {pwa.install.isInstalled && (
            <div className={`p-4 rounded-lg border ${
              isDarkMode ? 'bg-green-900/20 border-green-700' : 'bg-green-50 border-green-200'
            }`}>
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <p className={`font-medium ${
                    isDarkMode ? 'text-green-200' : 'text-green-800'
                  }`}>
                    Application installée
                  </p>
                  <p className={`text-sm ${
                    isDarkMode ? 'text-green-300' : 'text-green-600'
                  }`}>
                    CalendrCar est maintenant accessible depuis votre bureau
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Notifications Push */}
          <div className={`border rounded-lg ${
            isDarkMode ? 'border-gray-700' : 'border-gray-200'
          }`}>
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <Bell className={`h-5 w-5 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`} />
                  <div>
                    <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      Notifications Push
                    </p>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Statut: {pwa.notifications.permission === 'granted' ? 'Activées' : 
                               pwa.notifications.permission === 'denied' ? 'Refusées' : 'Non configurées'}
                    </p>
                  </div>
                </div>
                
                {pwa.notifications.permission !== 'granted' ? (
                  <button
                    onClick={handleSubscribeNotifications}
                    disabled={isLoading}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      isDarkMode
                        ? 'bg-green-600 hover:bg-green-700 text-white'
                        : 'bg-green-600 hover:bg-green-700 text-white'
                    } disabled:opacity-50`}
                  >
                    {isLoading ? <LoadingSpinner isDarkMode={isDarkMode} /> : 'Activer'}
                  </button>
                ) : (
                  <button
                    onClick={handleUnsubscribeNotifications}
                    disabled={isLoading}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      isDarkMode
                        ? 'bg-red-600 hover:bg-red-700 text-white'
                        : 'bg-red-600 hover:bg-red-700 text-white'
                    } disabled:opacity-50`}
                  >
                    {isLoading ? <LoadingSpinner isDarkMode={isDarkMode} /> : 'Désactiver'}
                  </button>
                )}
              </div>

              {/* Tests de notifications */}
              {pwa.notifications.permission === 'granted' && (
                <div className="space-y-3">
                  <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Tester les notifications:
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => handleTestNotification('reservation-reminder')}
                      disabled={isLoading}
                      className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                        isDarkMode
                          ? 'border-gray-600 hover:bg-gray-700 text-gray-300'
                          : 'border-gray-300 hover:bg-gray-50 text-gray-700'
                      } disabled:opacity-50`}
                    >
                      Rappel Réservation
                    </button>
                    <button
                      onClick={() => handleTestNotification('vehicle-maintenance')}
                      disabled={isLoading}
                      className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                        isDarkMode
                          ? 'border-gray-600 hover:bg-gray-700 text-gray-300'
                          : 'border-gray-300 hover:bg-gray-50 text-gray-700'
                      } disabled:opacity-50`}
                    >
                      Maintenance
                    </button>
                    <button
                      onClick={() => handleTestNotification('new-reservation')}
                      disabled={isLoading}
                      className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                        isDarkMode
                          ? 'border-gray-600 hover:bg-gray-700 text-gray-300'
                          : 'border-gray-300 hover:bg-gray-50 text-gray-700'
                      } disabled:opacity-50`}
                    >
                      Nouvelle Réservation
                    </button>
                    <button
                      onClick={() => handleTestNotification('low-fuel')}
                      disabled={isLoading}
                      className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                        isDarkMode
                          ? 'border-gray-600 hover:bg-gray-700 text-gray-300'
                          : 'border-gray-300 hover:bg-gray-50 text-gray-700'
                      } disabled:opacity-50`}
                    >
                      Carburant Bas
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Support PWA */}
          <div className={`p-4 rounded-lg border ${
            pwa.isSupported
              ? (isDarkMode ? 'bg-green-900/20 border-green-700' : 'bg-green-50 border-green-200')
              : (isDarkMode ? 'bg-red-900/20 border-red-700' : 'bg-red-50 border-red-200')
          }`}>
            <div className="flex items-center space-x-3">
              <Smartphone className={`h-5 w-5 ${pwa.isSupported ? 'text-green-600' : 'text-red-600'}`} />
              <div>
                <p className={`font-medium ${
                  pwa.isSupported 
                    ? 'text-green-800' + (isDarkMode ? ' dark:text-green-200' : '')
                    : 'text-red-800' + (isDarkMode ? ' dark:text-red-200' : '')
                }`}>
                  {pwa.isSupported ? 'PWA Supportée' : 'PWA Non Supportée'}
                </p>
                <p className={`text-sm ${
                  pwa.isSupported 
                    ? 'text-green-600' + (isDarkMode ? ' dark:text-green-300' : '')
                    : 'text-red-600' + (isDarkMode ? ' dark:text-red-300' : '')
                }`}>
                  {pwa.isSupported 
                    ? 'Toutes les fonctionnalités PWA sont disponibles'
                    : 'Ce navigateur ne supporte pas toutes les fonctionnalités PWA'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Composant Sidebar
const Sidebar = ({ 
  currentPage, 
  setCurrentPage, 
  isDarkMode, 
  onToggleTheme,
  showNotification 
}: { 
  currentPage: string, 
  setCurrentPage: (page: string) => void,
  isDarkMode: boolean,
  onToggleTheme: () => void,
  showNotification: (message: string, type?: 'success' | 'error' | 'warning' | 'info') => void
}) => {
  const { logout, username } = useAuth();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isPWASettingsOpen, setIsPWASettingsOpen] = useState(false);
  // Temporairement désactivé pour les tests
  // const pwa = usePWA();
  const pwa = {
    isOnline: true,
    notifications: { permission: 'default' },
    install: { showInstallPrompt: false, isInstalled: false }
  };

  const menuItems = [
    { id: 'dashboard', label: 'Tableau de bord', icon: BarChart3 },
    { id: 'planning', label: 'Planning', icon: CalendarDays },
    { id: 'vehicles', label: 'Véhicules', icon: Truck },
  ];

  return (
    <div 
      className={`fixed left-0 top-0 h-full bg-gray-900 text-white transition-all duration-300 ease-in-out z-50 ${
        isExpanded ? 'w-64' : 'w-16'
      }`}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      {/* Logo */}
      <div className="flex items-center p-4 border-b border-gray-700">
        <Car className="h-8 w-8 text-blue-400 flex-shrink-0" />
        <div className={`ml-3 transition-opacity duration-300 ${isExpanded ? 'opacity-100' : 'opacity-0'}`}>
          <h1 className="text-xl font-bold">CalendrCar M&M</h1>
        </div>
      </div>

      {/* Menu Items */}
      <nav className="mt-6">
        <div className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentPage(item.id)}
                className={`w-full flex items-center px-3 py-3 text-left hover:bg-gray-800 transition-colors rounded-md ${
                  currentPage === item.id ? 'bg-blue-600 shadow-md' : 'hover:bg-gray-700'
                }`}
              >
                <Icon className={`h-5 w-5 flex-shrink-0 ${isExpanded ? '' : 'mx-auto'}`} />
                <span className={`ml-3 transition-opacity duration-300 font-medium text-sm ${isExpanded ? 'opacity-100' : 'opacity-0'}`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Bouton thème et settings en bas */}
      <div className="absolute bottom-4 w-full space-y-1">
        {/* Indicateur PWA */}
        {pwa.install.showInstallPrompt && (
          <div className="mx-4 mb-2">
            <div className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full flex items-center space-x-1">
              <Download className="h-3 w-3" />
              <span className={`transition-opacity duration-300 ${isExpanded ? 'opacity-100' : 'opacity-0'}`}>
                Installation disponible
              </span>
            </div>
          </div>
        )}

        {/* Statut de connexion */}
        <div className="mx-4 mb-2">
          <div className={`flex items-center space-x-2 px-2 py-1 rounded-lg ${
            pwa.isOnline 
              ? 'bg-green-600/20 text-green-400' 
              : 'bg-red-600/20 text-red-400'
          }`}>
            {pwa.isOnline ? 
              <Wifi className="h-3 w-3" /> : 
              <WifiOff className="h-3 w-3" />
            }
            <span className={`text-xs transition-opacity duration-300 ${isExpanded ? 'opacity-100' : 'opacity-0'}`}>
              {pwa.isOnline ? 'En ligne' : 'Hors ligne'}
            </span>
          </div>
        </div>

        <button 
          onClick={onToggleTheme}
          className="w-full flex items-center px-3 py-3 text-left hover:bg-gray-800 transition-colors rounded-md hover:bg-gray-700"
        >
          {isDarkMode ? <Sun className={`h-5 w-5 flex-shrink-0 ${isExpanded ? '' : 'mx-auto'}`} /> : <Moon className={`h-5 w-5 flex-shrink-0 ${isExpanded ? '' : 'mx-auto'}`} />}
          <span className={`ml-3 transition-opacity duration-300 font-medium text-sm ${isExpanded ? 'opacity-100' : 'opacity-0'}`}>
            {isDarkMode ? 'Mode clair' : 'Mode sombre'}
          </span>
        </button>
        
        <button 
          onClick={() => setIsPWASettingsOpen(true)}
          className="w-full flex items-center px-3 py-3 text-left hover:bg-gray-800 transition-colors rounded-md hover:bg-gray-700 relative"
        >
          <Smartphone className="h-5 w-5 flex-shrink-0" />
          <span className={`ml-3 transition-opacity duration-300 font-medium text-sm ${isExpanded ? 'opacity-100' : 'opacity-0'}`}>
            Paramètres PWA
          </span>
          {pwa.notifications.permission === 'granted' && (
            <div className="absolute top-2 right-2 w-2 h-2 bg-green-500 rounded-full"></div>
          )}
        </button>

        <button 
          onClick={() => setIsPWASettingsOpen(true)}
          className="w-full flex items-center px-3 py-3 text-left hover:bg-gray-800 transition-colors rounded-md hover:bg-gray-700"
        >
          <Settings className="h-5 w-5 flex-shrink-0" />
          <span className={`ml-3 transition-opacity duration-300 font-medium text-sm ${isExpanded ? 'opacity-100' : 'opacity-0'}`}>
            Paramètres
          </span>
        </button>

        {/* User Info & Logout */}
        <div className="border-t border-gray-700 pt-4 mt-4">
          {/* User Info */}
          <div className="px-4 py-2 mb-2">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-600 p-2 rounded-full">
                <User className="h-4 w-4 text-white" />
              </div>
              {isExpanded && (
                <div>
                  <p className="text-white text-sm font-medium">{username || 'Admin'}</p>
                  <p className="text-gray-400 text-xs">Administrateur</p>
                </div>
              )}
            </div>
          </div>

          {/* Logout Button */}
          <button
            onClick={() => {
              logout();
              showNotification('Déconnexion réussie', 'info');
            }}
            className="w-full flex items-center px-3 py-3 text-left hover:bg-red-600/20 transition-colors text-red-400 hover:text-red-300 rounded-md"
            title="Se déconnecter"
          >
            <LogOut className="h-5 w-5 flex-shrink-0" />
            <span className={`ml-3 transition-opacity duration-300 font-medium text-sm ${isExpanded ? 'opacity-100' : 'opacity-0'}`}>
              Déconnexion
            </span>
          </button>
        </div>
      </div>

      {/* PWA Settings Panel */}
      <PWASettingsPanel
        isDarkMode={isDarkMode}
        isOpen={isPWASettingsOpen}
        onClose={() => setIsPWASettingsOpen(false)}
        showNotification={showNotification}
      />
    </div>
  );
};

// Composant Dashboard
const Dashboard = ({ reservations, vehicles, isDarkMode, showNotification }: { reservations: Reservation[], vehicles: Vehicle[], isDarkMode: boolean, showNotification: (message: string, type?: 'success' | 'error' | 'warning' | 'info') => void }) => {
  const today = new Date();
  const now = new Date();
  
  // État pour le filtre de revenus
  const [revenueFilter, setRevenueFilter] = useState<'day' | 'month' | 'year'>('month');
  
  // Fonction pour calculer les revenus selon la période sélectionnée
  const getFilteredRevenue = (filter: 'day' | 'month' | 'year') => {
    return reservations
      .filter(reservation => {
        if (reservation.status === 'cancelled') return false;
        
        const resDate = new Date(reservation.startTime);
        
        switch(filter) {
          case 'day':
            return resDate.toDateString() === today.toDateString();
          
          case 'month':
            return resDate.getMonth() === today.getMonth() && 
                   resDate.getFullYear() === today.getFullYear();
          
          case 'year':
            return resDate.getFullYear() === today.getFullYear();
          
          default:
            return false;
        }
      })
      .reduce((sum, r) => sum + (r.amount || 0), 0);
  };
  
  // Fonction pour obtenir le label de période
  const getRevenueLabel = (filter: 'day' | 'month' | 'year') => {
    switch(filter) {
      case 'day': return 'Revenus Aujourd\'hui';
      case 'month': return 'Revenus du Mois';
      case 'year': return 'Revenus de l\'Année';
      default: return 'Revenus Total';
    }
  };
  
  // Fonction pour calculer le trend (comparaison avec période précédente)
  const getRevenueTrend = (filter: 'day' | 'month' | 'year') => {
    const currentRevenue = getFilteredRevenue(filter);
    
    // Calculer les revenus de la période précédente
    const previousRevenue = reservations
      .filter(reservation => {
        if (reservation.status === 'cancelled') return false;
        
        const resDate = new Date(reservation.startTime);
        
        switch(filter) {
          case 'day':
            const yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 1);
            return resDate.toDateString() === yesterday.toDateString();
          
          case 'month':
            const lastMonth = new Date(today);
            lastMonth.setMonth(lastMonth.getMonth() - 1);
            return resDate.getMonth() === lastMonth.getMonth() && 
                   resDate.getFullYear() === lastMonth.getFullYear();
          
          case 'year':
            const lastYear = new Date(today);
            lastYear.setFullYear(lastYear.getFullYear() - 1);
            return resDate.getFullYear() === lastYear.getFullYear();
          
          default:
            return false;
        }
      })
      .reduce((sum, r) => sum + (r.amount || 0), 0);
    
    if (previousRevenue === 0) return '+100%';
    
    const percentChange = Math.round(((currentRevenue - previousRevenue) / previousRevenue) * 100);
    return percentChange >= 0 ? `+${percentChange}%` : `${percentChange}%`;
  };
  
  // Fonction pour vérifier si un véhicule est occupé aujourd'hui
  const isVehicleOccupiedToday = (vehicleId: string): boolean => {
    return reservations.some(reservation => {
      if (reservation.status === 'cancelled' || reservation.vehicleId !== vehicleId) {
        return false;
      }
      
      const startDate = new Date(reservation.startTime);
      const endDate = new Date(reservation.endTime);
      
      // Vérifier si la réservation est active maintenant
      return now >= startDate && now <= endDate;
    });
  };
  
  // Fonction pour obtenir les réservations d'aujourd'hui
  const getTodayReservations = () => {
    return reservations.filter(reservation => {
      const startDate = new Date(reservation.startTime);
      const endDate = new Date(reservation.endTime);
      const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const todayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);
      
      // Réservation qui touche aujourd'hui (commence, finit, ou traverse)
      return (startDate <= todayEnd && endDate >= todayStart) && reservation.status !== 'cancelled';
    });
  };
  
  // Fonction pour obtenir les départs d'aujourd'hui (réservations qui commencent aujourd'hui)
  const getTodayDepartures = () => {
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const todayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);
    
    return reservations
      .filter(reservation => {
        const startDate = new Date(reservation.startTime);
        return startDate >= todayStart && startDate <= todayEnd && reservation.status !== 'cancelled';
      })
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
  };
  
  // Fonction pour obtenir les retours d'aujourd'hui (réservations qui se terminent aujourd'hui)
  const getTodayReturns = () => {
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const todayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);
    
    return reservations
      .filter(reservation => {
        const endDate = new Date(reservation.endTime);
        return endDate >= todayStart && endDate <= todayEnd && reservation.status !== 'cancelled';
      })
      .sort((a, b) => new Date(a.endTime).getTime() - new Date(b.endTime).getTime());
  };
  
  // Calculer les statuts réels des véhicules
  const todayReservations = getTodayReservations();
  const todayDepartures = getTodayDepartures();
  const todayReturns = getTodayReturns();
  const realOccupiedVehicles = vehicles.filter(vehicle => isVehicleOccupiedToday(vehicle.id)).length;
  const realAvailableVehicles = vehicles.length - realOccupiedVehicles - vehicles.filter(v => v.status === 'maintenance').length;
  const maintenanceVehicles = vehicles.filter(v => v.status === 'maintenance').length;
  
  // Statistiques de base avec données réelles
  const totalRevenue = reservations.reduce((sum, r) => sum + (r.amount || 0), 0);
  const confirmedReservations = reservations.filter(r => r.status === 'confirmed').length;
  const pendingReservations = reservations.filter(r => r.status === 'pending').length;
  const cancelledReservations = reservations.filter(r => r.status === 'cancelled').length;

  // Statistiques avancées avec données réelles
  const totalReservations = reservations.length;
  const revenueMoyenParReservation = totalReservations > 0 ? Math.round(totalRevenue / totalReservations) : 0;
  const tauxOccupation = vehicles.length > 0 ? Math.round((realOccupiedVehicles / vehicles.length) * 100) : 0;
  const tauxConfirmation = totalReservations > 0 ? Math.round((confirmedReservations / totalReservations) * 100) : 0;
  
  // Réservations actives aujourd'hui
  const activeReservationsToday = todayReservations.filter(r => r.status === 'confirmed').length;

  // Réservations par type de véhicule
  const reservationsByVehicleType = vehicles.reduce((acc, vehicle) => {
    const vehicleReservations = reservations.filter(r => r.vehicleId === vehicle.id);
    acc[vehicle.type] = (acc[vehicle.type] || 0) + vehicleReservations.length;
    return acc;
  }, {} as Record<string, number>);

  const stats = [
    { 
      label: getRevenueLabel(revenueFilter), 
      value: `${getFilteredRevenue(revenueFilter).toLocaleString()} XPF`, 
      icon: BarChart3, 
      color: revenueFilter === 'day' ? 'bg-green-500' : revenueFilter === 'month' ? 'bg-blue-500' : 'bg-purple-500', 
      trend: getRevenueTrend(revenueFilter),
      isRevenue: true
    },
    { label: 'Réservations Confirmées', value: confirmedReservations, icon: Calendar, color: 'bg-blue-500', trend: '+8%' },
    { label: 'Actives Aujourd\'hui', value: activeReservationsToday, icon: Clock, color: 'bg-orange-500', trend: `${activeReservationsToday > 0 ? '+' : ''}${activeReservationsToday}` },
    { label: 'Véhicules Disponibles', value: realAvailableVehicles, icon: Car, color: 'bg-purple-500', trend: `${realAvailableVehicles}/${vehicles.length}` },
  ];

  const advancedStats = [
    { label: 'Taux d\'Occupation Réel', value: `${tauxOccupation}%`, description: 'Véhicules occupés maintenant' },
    { label: 'Taux de Confirmation', value: `${tauxConfirmation}%`, description: 'Réservations confirmées vs total' },
    { label: 'Revenus Moyen/Réservation', value: `${revenueMoyenParReservation.toLocaleString()} XPF`, description: 'Montant moyen par location' },
    { label: 'Réservations Aujourd\'hui', value: todayReservations.length, description: 'Réservations qui touchent aujourd\'hui' },
  ];

  return (
    <div className="space-y-6 animate-fadeInUp">
      <div>
        <h2 className={`text-2xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Tableau de bord</h2>
        
        {/* Statistiques principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            const isPositiveTrend = stat.trend.startsWith('+');
            const isNegativeTrend = stat.trend.startsWith('-');
            
            return (
              <div 
                key={index} 
                className={`rounded-xl shadow-sm border p-6 hover-lift transition-all-300 ${
                  isDarkMode 
                    ? 'bg-gray-800 border-gray-700' 
                    : 'bg-white border-gray-200'
                }`}
              >
                <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className={`p-3 rounded-lg ${stat.color}`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-4">
                      <div className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{stat.value}</div>
                      <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{stat.label}</div>
                      
                      {/* Boutons de filtre pour les revenus */}
                      {stat.isRevenue && (
                        <div className="flex gap-1 mt-2">
                          {(['day', 'month', 'year'] as const).map((period) => (
                            <button
                              key={period}
                              onClick={() => setRevenueFilter(period)}
                              className={`px-2 py-1 text-xs rounded-md font-medium transition-all ${
                                revenueFilter === period
                                  ? isDarkMode 
                                    ? 'bg-blue-600 text-white' 
                                    : 'bg-blue-100 text-blue-800'
                                  : isDarkMode 
                                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                              }`}
                            >
                              {period === 'day' ? 'Jour' : period === 'month' ? 'Mois' : 'Année'}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className={`text-sm font-medium px-2 py-1 rounded-full ${
                    isPositiveTrend 
                      ? 'bg-green-100 text-green-800' 
                      : isNegativeTrend 
                        ? 'bg-red-100 text-red-800' 
                        : 'bg-gray-100 text-gray-800'
                  }`}>
                    {stat.trend}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Départs et Retours du Jour */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Départs d'aujourd'hui */}
          <div className={`rounded-xl shadow-sm border ${
            isDarkMode 
              ? 'bg-gray-800 border-gray-700' 
              : 'bg-white border-gray-200'
          }`}>
            <div className={`p-6 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                🚗 Départs Aujourd'hui ({todayDepartures.length})
              </h3>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Clients qui récupèrent leur véhicule
              </p>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {todayDepartures.length > 0 ? (
                  todayDepartures.map((reservation) => {
                    const vehicle = vehicles.find(v => v.id === reservation.vehicleId);
                    const startTime = new Date(reservation.startTime);
                    const isPassed = now > startTime;
                    
                    return (
                      <div key={`departure-${reservation.id}`} className={`flex items-center justify-between p-4 rounded-lg ${
                        isDarkMode ? 'bg-gray-700' : isPassed ? 'bg-gray-50' : 'bg-green-50'
                      }`}>
                        <div className="flex items-center space-x-4">
                          <div 
                            className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold"
                            style={{ backgroundColor: vehicle?.color }}
                          >
                            {vehicle?.icon}
                          </div>
                          <div>
                            <div className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                              {reservation.client}
                            </div>
                            <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                              {vehicle?.name} - {vehicle?.plate}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`font-medium ${isPassed ? 'text-gray-500' : 'text-green-600'}`}>
                            {formatTime(startTime)}
                          </div>
                          <div className={`text-xs ${
                            isPassed 
                              ? (isDarkMode ? 'text-gray-500' : 'text-gray-400') 
                              : 'text-green-600'
                          }`}>
                            {isPassed ? '✅ Parti' : '⏰ À venir'}
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className={`text-center py-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    <Calendar className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>Aucun départ prévu aujourd'hui</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Retours d'aujourd'hui */}
          <div className={`rounded-xl shadow-sm border ${
            isDarkMode 
              ? 'bg-gray-800 border-gray-700' 
              : 'bg-white border-gray-200'
          }`}>
            <div className={`p-6 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                🏠 Retours Aujourd'hui ({todayReturns.length})
              </h3>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Clients qui ramènent leur véhicule
              </p>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {todayReturns.length > 0 ? (
                  todayReturns.map((reservation) => {
                    const vehicle = vehicles.find(v => v.id === reservation.vehicleId);
                    const endTime = new Date(reservation.endTime);
                    const isPassed = now > endTime;
                    const isOverdue = isPassed && reservation.status === 'confirmed';
                    
                    return (
                      <div key={`return-${reservation.id}`} className={`flex items-center justify-between p-4 rounded-lg ${
                        isDarkMode 
                          ? 'bg-gray-700' 
                          : isOverdue 
                            ? 'bg-red-50' 
                            : isPassed 
                              ? 'bg-gray-50' 
                              : 'bg-blue-50'
                      }`}>
                        <div className="flex items-center space-x-4">
                          <div 
                            className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold"
                            style={{ backgroundColor: vehicle?.color }}
                          >
                            {vehicle?.icon}
                          </div>
                          <div>
                            <div className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                              {reservation.client}
                            </div>
                            <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                              {vehicle?.name} - {vehicle?.plate}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`font-medium ${
                            isOverdue 
                              ? 'text-red-600' 
                              : isPassed 
                                ? 'text-gray-500' 
                                : 'text-blue-600'
                          }`}>
                            {formatTime(endTime)}
                          </div>
                          <div className={`text-xs ${
                            isOverdue 
                              ? 'text-red-600' 
                              : isPassed 
                                ? (isDarkMode ? 'text-gray-500' : 'text-gray-400')
                                : 'text-blue-600'
                          }`}>
                            {isOverdue ? '⚠️ En retard' : isPassed ? '✅ Rendu' : '⏰ À venir'}
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className={`text-center py-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    <Calendar className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>Aucun retour prévu aujourd'hui</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Statistiques avancées */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Métriques de performance */}
          <div className={`rounded-xl shadow-sm border p-6 ${
            isDarkMode 
              ? 'bg-gray-800 border-gray-700' 
              : 'bg-white border-gray-200'
          }`}>
            <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Métriques de Performance
            </h3>
            <div className="space-y-6">
              {advancedStats.map((stat, index) => (
                <div key={index} className="flex justify-between items-start">
                  <div>
                    <div className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {stat.value}
                    </div>
                    <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      {stat.label}
                    </div>
                    <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {stat.description}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Répartition des statuts */}
          <div className={`rounded-xl shadow-sm border p-6 ${
            isDarkMode 
              ? 'bg-gray-800 border-gray-700' 
              : 'bg-white border-gray-200'
          }`}>
            <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              État des Véhicules
            </h3>
            <div className="space-y-4">
              <ProgressBar 
                value={realAvailableVehicles} 
                max={vehicles.length} 
                label="Disponibles" 
                color="green" 
                isDarkMode={isDarkMode} 
              />
              <ProgressBar 
                value={realOccupiedVehicles} 
                max={vehicles.length} 
                label="Occupés" 
                color="blue" 
                isDarkMode={isDarkMode} 
              />
              <ProgressBar 
                value={maintenanceVehicles} 
                max={vehicles.length} 
                label="En Maintenance" 
                color="yellow" 
                isDarkMode={isDarkMode} 
              />
            </div>
          </div>
        </div>

        {/* Réservations récentes */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Véhicules actuellement occupés */}
          <div className={`rounded-xl shadow-sm border ${
            isDarkMode 
              ? 'bg-gray-800 border-gray-700' 
              : 'bg-white border-gray-200'
          }`}>
            <div className={`p-6 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Véhicules Occupés Maintenant ({realOccupiedVehicles})
              </h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
                {realOccupiedVehicles > 0 ? (
                  vehicles
                    .filter(vehicle => isVehicleOccupiedToday(vehicle.id))
                    .map((vehicle) => {
                      const currentReservation = reservations.find(res => 
                        res.vehicleId === vehicle.id && 
                        res.status !== 'cancelled' &&
                        now >= new Date(res.startTime) && 
                        now <= new Date(res.endTime)
                      );
                      
                      if (!currentReservation) return null;
                      
                      const endTime = new Date(currentReservation.endTime);
                      const hoursLeft = Math.ceil((endTime.getTime() - now.getTime()) / (1000 * 60 * 60));
                      
                return (
                        <div key={vehicle.id} className={`flex items-center justify-between p-4 rounded-lg ${
                          isDarkMode ? 'bg-gray-700' : 'bg-red-50'
                        }`}>
                          <div className="flex items-center space-x-4">
                            <div 
                              className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold"
                              style={{ backgroundColor: vehicle.color }}
                            >
                              {vehicle.icon}
                            </div>
                            <div>
                              <div className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                {vehicle.name} - {vehicle.plate}
                              </div>
                              <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                Client: {currentReservation.client}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className={`font-medium text-red-600`}>
                              🔴 Occupé
                            </div>
                            <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                              Se libère {hoursLeft > 0 ? `dans ${hoursLeft}h` : 'bientôt'}
                            </div>
                          </div>
                        </div>
                      );
                    })
                ) : (
                  <div className={`text-center py-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    <Car className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>Tous les véhicules sont disponibles ! 🎉</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Réservations récentes */}
          <div className={`rounded-xl shadow-sm border ${
            isDarkMode 
              ? 'bg-gray-800 border-gray-700' 
              : 'bg-white border-gray-200'
          }`}>
            <div className={`p-6 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Réservations Récentes</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {reservations
                  .filter(reservation => reservation.status !== 'cancelled') // Exclure les réservations annulées
                  .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime()) // Trier par date de début (plus récentes en premier)
                  .slice(0, 5) // Prendre les 5 plus récentes
                  .map((reservation) => {
                  const vehicle = vehicles.find(v => v.id === reservation.vehicleId);
                  const startDate = new Date(reservation.startTime);
                  const isUpcoming = startDate > new Date();
                  const isToday = startDate.toDateString() === new Date().toDateString();
                  
                  return (
                    <div key={reservation.id} className={`flex items-center justify-between p-4 rounded-lg ${
                      isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
                    }`}>
                    <div className="flex items-center space-x-4">
                      <div 
                        className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold"
                        style={{ backgroundColor: vehicle?.color }}
                      >
                        {vehicle?.icon}
                      </div>
                      <div>
                          <div className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{reservation.client}</div>
                          <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{vehicle?.name} - {vehicle?.plate}</div>
                          <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            {isToday ? '🟢 Aujourd\'hui' : isUpcoming ? `📅 ${formatDate(startDate)}` : `✅ ${formatDate(startDate)}`} à {formatTime(startDate)}
                          </div>
                      </div>
                    </div>
                    <div className="text-right">
                        <div className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{reservation.amount?.toLocaleString()} XPF</div>
                      <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(reservation.status)}`}>
                        {getStatusIcon(reservation.status)} {reservation.status}
                      </div>
                    </div>
                  </div>
                );
              })}
                
                {/* Message si aucune réservation */}
                {reservations.filter(r => r.status !== 'cancelled').length === 0 && (
                  <div className={`text-center py-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    <Calendar className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>Aucune réservation récente</p>
                    <p className="text-xs mt-1">Les nouvelles réservations apparaîtront ici</p>
            </div>
                )}
          </div>
        </div>
          </div>
        </div>


      </div>
    </div>
  );
};

// Composant Modal de modification de réservation
const ReservationModal = ({ 
  reservation, 
  onSave, 
  onDelete, 
  onClose,
  vehicles,
  reservations 
}: { 
  reservation: Reservation, 
  onSave: (reservation: Reservation) => void, 
  onDelete: (id: string) => void, 
  onClose: () => void,
  vehicles: Vehicle[],
  reservations: Reservation[]
}) => {
  const [formData, setFormData] = useState({
    title: reservation.title,
    client: reservation.client,
    phone: reservation.phone,
    vehicleId: reservation.vehicleId,
    startTime: formatDateTimeLocal(reservation.startTime),
    endTime: formatDateTimeLocal(reservation.endTime),
    status: reservation.status,
    notes: reservation.notes || '',
    amount: reservation.amount || 0
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Vérification des conflits de réservation
    const newStart = new Date(formData.startTime);
    const newEnd = new Date(formData.endTime);
    
    const conflicts = reservations.filter(res => {
      if (res.vehicleId !== formData.vehicleId) return false;
      if (res.id === reservation.id) return false; // Ignorer la réservation actuelle
      
      const existingStart = new Date(res.startTime);
      const existingEnd = new Date(res.endTime);
      
      // Vérifier si les périodes se chevauchent
      return (newStart < existingEnd && newEnd > existingStart);
    });
    
    if (conflicts.length > 0) {
      const vehicle = vehicles.find(v => v.id === formData.vehicleId);
      const conflictDetails = conflicts.map(c => 
        `• ${c.client} du ${formatDate(c.startTime)} ${formatTime(c.startTime)} au ${formatDate(c.endTime)} ${formatTime(c.endTime)}`
      ).join('\n');
      
      // Calculer des créneaux alternatifs pour modification
      const duration = newEnd.getTime() - newStart.getTime();
      const vehicleReservations = reservations
        .filter(r => r.vehicleId === formData.vehicleId && r.id !== reservation.id)
        .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
      
      const alternatives: Alternative[] = [];
      
      // Option 1: Après la dernière réservation du jour
      const sameDay = vehicleReservations.filter(r => {
        const resDate = new Date(r.endTime);
        return resDate.toDateString() === newStart.toDateString();
      });
      
      if (sameDay.length > 0) {
        const lastReservation = sameDay[sameDay.length - 1];
        const suggestedStart = new Date(lastReservation.endTime);
        suggestedStart.setMinutes(suggestedStart.getMinutes() + 30);
        const suggestedEnd = new Date(suggestedStart.getTime() + duration);
        
        alternatives.push({
          start: suggestedStart,
          end: suggestedEnd,
          label: `Après la réservation de ${lastReservation.client}`
        });
      }
      
      // Option 2: Avant la première réservation du jour
      const firstToday = vehicleReservations.find(r => {
        const resDate = new Date(r.startTime);
        return resDate.toDateString() === newStart.toDateString();
      });
      
      if (firstToday) {
        const suggestedEnd = new Date(firstToday.startTime);
        suggestedEnd.setMinutes(suggestedEnd.getMinutes() - 30);
        const suggestedStart = new Date(suggestedEnd.getTime() - duration);
        
        if (suggestedStart >= new Date()) {
          alternatives.push({
            start: suggestedStart,
            end: suggestedEnd,
            label: `Avant la réservation de ${firstToday.client}`
          });
        }
      }
      
      let message = `⚠️ CONFLIT DE RÉSERVATION DÉTECTÉ !\n\n` +
        `Le véhicule "${vehicle?.name} (${vehicle?.plate})" est déjà réservé pendant cette période :\n\n` +
        `${conflictDetails}\n\n`;
      
      if (alternatives.length > 0) {
        message += `🕒 CRÉNEAUX ALTERNATIFS PROPOSÉS :\n\n`;
        alternatives.forEach((alt, index) => {
          message += `${index + 1}. ${alt.label}\n   Du ${formatDate(alt.start)} ${formatTime(alt.start)} au ${formatDate(alt.end)} ${formatTime(alt.end)}\n\n`;
        });
        message += `Choisissez :\n`;
        alternatives.forEach((_, index) => {
          message += `${index + 1} = Utiliser le créneau ${index + 1}\n`;
        });
        message += `0 = Forcer le double booking\n`;
        message += `Annuler = Abandonner`;
        
        const choice = prompt(message);
        
        if (choice === null) {
          return;
        }
        
        const choiceNum = parseInt(choice);
        if (choiceNum >= 1 && choiceNum <= alternatives.length) {
          const selectedAlt = alternatives[choiceNum - 1];
          setFormData({
            ...formData,
            startTime: formatDateTimeLocal(selectedAlt.start),
            endTime: formatDateTimeLocal(selectedAlt.end)
          });
          return;
        } else if (choiceNum === 0) {
          // Continuer avec le double booking
        } else {
          return;
        }
      } else {
        const confirmed = window.confirm(
          message + `Voulez-vous tout de même modifier cette réservation ?\n\n⚠️ Cela créera un double booking !`
        );
        
        if (!confirmed) {
          return;
        }
      }
    }
    
    const updatedReservation: Reservation = {
      ...reservation,
      title: formData.title,
      client: formData.client,
      phone: formData.phone,
      vehicleId: formData.vehicleId,
      startTime: newStart,
      endTime: newEnd,
      status: formData.status as "confirmed" | "pending" | "cancelled",
      notes: formData.notes,
      amount: formData.amount
    };
    onSave(updatedReservation);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900">Modifier la réservation</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Titre
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Client
              </label>
              <input
                type="text"
                value={formData.client}
                onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Téléphone
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Véhicule
              </label>
              <select
                value={formData.vehicleId}
                onChange={(e) => setFormData({ ...formData, vehicleId: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                {vehicles.map((vehicle) => (
                  <option key={vehicle.id} value={vehicle.id}>
                    {vehicle.name} - {vehicle.plate}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date et heure de début
              </label>
              <input
                type="datetime-local"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date et heure de fin
              </label>
              <input
                type="datetime-local"
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Statut
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as "confirmed" | "pending" | "cancelled" })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="confirmed">Confirmé</option>
                <option value="pending">En attente</option>
                <option value="cancelled">Annulé</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Montant (XPF)
              </label>
              <input
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min="0"
                step="1"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
              placeholder="Notes additionnelles..."
            />
          </div>

          <div className="flex items-center justify-between pt-4">
            <button
              type="button"
              onClick={() => onDelete(reservation.id)}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
            >
              <Trash2 className="h-4 w-4" />
              <span>Supprimer</span>
            </button>
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <Save className="h-4 w-4" />
                <span>Enregistrer</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

// Composant Modal de nouvelle réservation
const NewReservationModal = ({ 
  onSave, 
  onClose,
  vehicles,
  reservations,
  preSelectedVehicleId,
  preSelectedDate 
}: { 
  onSave: (reservation: Omit<Reservation, 'id'>) => void, 
  onClose: () => void,
  vehicles: Vehicle[],
  reservations: Reservation[],
  preSelectedVehicleId?: string | null,
  preSelectedDate?: Date | null
}) => {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);
  
  // Calculer les dates par défaut
  const defaultStartDate = preSelectedDate || now;
  const defaultEndDate = new Date(defaultStartDate);
  defaultEndDate.setHours(defaultStartDate.getHours() + 2); // 2 heures par défaut
  
  const [formData, setFormData] = useState({
    title: '',
    client: '',
    phone: '',
    vehicleId: preSelectedVehicleId || vehicles[0]?.id || '',
    startTime: formatDateTimeLocal(defaultStartDate),
    endTime: formatDateTimeLocal(defaultEndDate),
    status: 'pending' as "confirmed" | "pending" | "cancelled",
    notes: '',
    amount: 0
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Vérification des conflits de réservation
    const newStart = new Date(formData.startTime);
    const newEnd = new Date(formData.endTime);
    
    const conflicts = reservations.filter(reservation => {
      if (reservation.vehicleId !== formData.vehicleId) return false;
      
      const existingStart = new Date(reservation.startTime);
      const existingEnd = new Date(reservation.endTime);
      
      // Vérifier si les périodes se chevauchent
      return (newStart < existingEnd && newEnd > existingStart);
    });
    
    if (conflicts.length > 0) {
      const vehicle = vehicles.find(v => v.id === formData.vehicleId);
      const conflictDetails = conflicts.map(c => 
        `• ${c.client} du ${formatDate(c.startTime)} ${formatTime(c.startTime)} au ${formatDate(c.endTime)} ${formatTime(c.endTime)}`
      ).join('\n');
      
      // Calculer des créneaux alternatifs
      const duration = newEnd.getTime() - newStart.getTime(); // Durée de la réservation
      const vehicleReservations = reservations
        .filter(r => r.vehicleId === formData.vehicleId)
        .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
      
      const alternatives: Alternative[] = [];
      
      // Option 1: Commencer 30 minutes après la fin de la dernière réservation qui finit le même jour
      const sameDay = vehicleReservations.filter(r => {
        const resDate = new Date(r.endTime);
        return resDate.toDateString() === newStart.toDateString();
      });
      
      if (sameDay.length > 0) {
        const lastReservation = sameDay[sameDay.length - 1];
        const suggestedStart = new Date(lastReservation.endTime);
        suggestedStart.setMinutes(suggestedStart.getMinutes() + 30);
        const suggestedEnd = new Date(suggestedStart.getTime() + duration);
        
        alternatives.push({
          start: suggestedStart,
          end: suggestedEnd,
          label: `Après la réservation de ${lastReservation.client}`
        });
      }
      
      // Option 2: Commencer 30 minutes avant la première réservation du jour
      const firstToday = vehicleReservations.find(r => {
        const resDate = new Date(r.startTime);
        return resDate.toDateString() === newStart.toDateString();
      });
      
      if (firstToday) {
        const suggestedEnd = new Date(firstToday.startTime);
        suggestedEnd.setMinutes(suggestedEnd.getMinutes() - 30);
        const suggestedStart = new Date(suggestedEnd.getTime() - duration);
        
        if (suggestedStart >= new Date()) { // Pas dans le passé
          alternatives.push({
            start: suggestedStart,
            end: suggestedEnd,
            label: `Avant la réservation de ${firstToday.client}`
          });
        }
      }
      
      // Option 3: Le lendemain à la même heure
      const nextDay = new Date(newStart);
      nextDay.setDate(nextDay.getDate() + 1);
      const nextDayEnd = new Date(newEnd);
      nextDayEnd.setDate(nextDayEnd.getDate() + 1);
      
      alternatives.push({
        start: nextDay,
        end: nextDayEnd,
        label: "Le lendemain à la même heure"
      });
      
      let message = `⚠️ CONFLIT DE RÉSERVATION DÉTECTÉ !\n\n` +
        `Le véhicule "${vehicle?.name} (${vehicle?.plate})" est déjà réservé pendant cette période :\n\n` +
        `${conflictDetails}\n\n`;
      
      if (alternatives.length > 0) {
        message += `🕒 CRÉNEAUX ALTERNATIFS PROPOSÉS :\n\n`;
        alternatives.forEach((alt, index) => {
          message += `${index + 1}. ${alt.label}\n   Du ${formatDate(alt.start)} ${formatTime(alt.start)} au ${formatDate(alt.end)} ${formatTime(alt.end)}\n\n`;
        });
        message += `Choisissez :\n`;
        alternatives.forEach((_, index) => {
          message += `${index + 1} = Utiliser le créneau ${index + 1}\n`;
        });
        message += `0 = Forcer le double booking\n`;
        message += `Annuler = Abandonner`;
        
        const choice = prompt(message);
        
        if (choice === null) {
          return; // Annulé
        }
        
        const choiceNum = parseInt(choice);
        if (choiceNum >= 1 && choiceNum <= alternatives.length) {
          // Utiliser le créneau alternatif choisi
          const selectedAlt = alternatives[choiceNum - 1];
          setFormData({
            ...formData,
            startTime: formatDateTimeLocal(selectedAlt.start),
            endTime: formatDateTimeLocal(selectedAlt.end)
          });
          return; // Arrêter ici pour permettre à l'utilisateur de vérifier
        } else if (choiceNum === 0) {
          // Continuer avec le double booking
          // (continue avec la logique existante)
        } else {
          return; // Choix invalide, abandonner
        }
      } else {
        const confirmed = window.confirm(
          message + `Voulez-vous tout de même créer cette réservation ?\n\n⚠️ Cela créera un double booking !`
        );
        
        if (!confirmed) {
          return;
        }
      }
    }
    
    const newReservation: Omit<Reservation, 'id'> = {
      title: formData.title,
      client: formData.client,
      phone: formData.phone,
      vehicleId: formData.vehicleId,
      startTime: newStart,
      endTime: newEnd,
      status: formData.status,
      notes: formData.notes,
      amount: formData.amount
    };
    onSave(newReservation);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900">Nouvelle réservation</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Titre *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ex: Location Weekend"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Client *
              </label>
              <input
                type="text"
                value={formData.client}
                onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Nom du client"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Téléphone *
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ex: 87770338"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Véhicule *
              </label>
              <select
                value={formData.vehicleId}
                onChange={(e) => setFormData({ ...formData, vehicleId: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                {vehicles.map((vehicle) => (
                  <option key={vehicle.id} value={vehicle.id}>
                    {vehicle.icon} {vehicle.name} - {vehicle.plate}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date et heure de début *
              </label>
              <input
                type="datetime-local"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date et heure de fin *
              </label>
              <input
                type="datetime-local"
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Statut
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as "confirmed" | "pending" | "cancelled" })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="pending">En attente</option>
                <option value="confirmed">Confirmé</option>
                <option value="cancelled">Annulé</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Montant (XPF)
              </label>
              <input
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min="0"
                step="1"
                placeholder="0"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
              placeholder="Notes additionnelles..."
            />
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <Save className="h-4 w-4" />
              <span>Créer la réservation</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Composant Planning
const Planning = ({ reservations, setReservations, vehicles, setVehicles, isDarkMode, showNotification }: { reservations: Reservation[], setReservations: (reservations: Reservation[]) => void, vehicles: Vehicle[], setVehicles: (vehicles: Vehicle[]) => void, isDarkMode: boolean, showNotification: (message: string, type?: 'success' | 'error' | 'warning' | 'info') => void }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"day" | "week">("week");
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isNewReservationModalOpen, setIsNewReservationModalOpen] = useState(false);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // États pour la modal de véhicule
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [isVehicleModalOpen, setIsVehicleModalOpen] = useState(false);

  const getWeekDays = (): Date[] => {
    // Créer une semaine qui "glisse" avec currentDate au centre
    // Pour un défilement jour par jour du planning
    const centerDate = new Date(currentDate);
    const days: Date[] = [];
    
    // Créer 7 jours centrés autour de currentDate
    // currentDate sera toujours au milieu (index 3)
    for (let i = -3; i <= 3; i++) {
      const day = new Date(centerDate);
      day.setDate(centerDate.getDate() + i);
      days.push(day);
    }
    
    return days;
  };

  const getReservationsForDate = (date: Date, vehicleId: string) => {
    return reservations.filter(res => {
      const startDate = new Date(res.startTime);
      const endDate = new Date(res.endTime);
      
      // Normaliser les dates à minuit pour éviter les problèmes d'heures
      const normalizedDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const normalizedStartDate = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
      const normalizedEndDate = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
      
      // Vérifier si le jour sélectionné se trouve dans la période de la réservation
      const isInPeriod = normalizedDate >= normalizedStartDate && normalizedDate <= normalizedEndDate;
      
      return isInPeriod && res.vehicleId === vehicleId;
    });
  };



  // Fonction pour calculer les bandes de réservation continues
  const getReservationBands = (vehicleId: string) => {
    const vehicleReservations = reservations.filter(res => res.vehicleId === vehicleId);
    const bands: Array<{
      reservation: Reservation;
      startDay: number;
      duration: number;
      position: number;
      isOverlapping: boolean;
      overlapIndex: number;
      continuesBefore: boolean;
      continuesAfter: boolean;
      dailyPositions?: Array<{
        dayIndex: number;
        startPercent: number;
        widthPercent: number;
      }>;
    }> = [];

    // Utiliser les mêmes dates selon le mode de vue pour la cohérence
    const viewDays = viewMode === "week" ? getWeekDays() : [currentDate];
    const weekStart = viewDays[0]; // Premier jour de la période visible
    const weekEnd = viewDays[viewDays.length - 1];   // Dernier jour de la période visible

    // Trier les réservations par heure de début pour un traitement correct des chevauchements
    const sortedReservations = vehicleReservations.sort((a, b) => 
      new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
    );

    sortedReservations.forEach((reservation, index) => {
      const startDate = new Date(reservation.startTime);
      const endDate = new Date(reservation.endTime);
      
      // Vérifier si la réservation chevauche avec la semaine actuelle
      const reservationStartsBeforeWeekEnd = startDate <= weekEnd;
      const reservationEndsAfterWeekStart = endDate >= weekStart;
      
      if (reservationStartsBeforeWeekEnd && reservationEndsAfterWeekStart) {
        // Calculer le jour de début dans la semaine (0-6, 0 = lundi)
        // Normaliser les dates à minuit pour éviter les problèmes d'heures
        const normalizedWeekStart = new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate());
        const normalizedStartDate = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
        const normalizedEndDate = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
        
        const daysDiff = Math.floor((normalizedStartDate.getTime() - normalizedWeekStart.getTime()) / (1000 * 60 * 60 * 24));
        const duration = Math.ceil((normalizedEndDate.getTime() - normalizedStartDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
        
        // Ajuster pour que la bande reste dans les limites de la période visible
        const maxDays = viewMode === "week" ? 7 : 1;
        const adjustedStart = Math.max(0, daysDiff);
        
        // Pour les réservations qui s'étendent au-delà de la semaine, 
        // on les affiche jusqu'au bout de la semaine visible
        const actualEnd = daysDiff + duration;
        const adjustedEnd = Math.min(maxDays, actualEnd);
        const adjustedDuration = adjustedEnd - adjustedStart;
        
        // Indicateurs pour savoir si la réservation continue avant/après la semaine visible
        const continuesBefore = daysDiff < 0;
        const continuesAfter = actualEnd > maxDays;
        
        if (adjustedDuration > 0) {
          // Calculer la position horaire précise dans la journée
          const startHour = startDate.getHours() + startDate.getMinutes() / 60; // Heure décimale (ex: 10.5 pour 10h30)
          const endHour = endDate.getHours() + endDate.getMinutes() / 60;
          
          // Calculer les positions relatives dans chaque jour
          const dailyPositions: DailyPosition[] = [];
          for (let dayOffset = 0; dayOffset < adjustedDuration; dayOffset++) {
            const currentDay = new Date(normalizedStartDate);
            currentDay.setDate(currentDay.getDate() + dayOffset);
            
            let dayStartHour, dayEndHour;
            
            if (dayOffset === 0) {
              // Premier jour : commence à l'heure réelle
              dayStartHour = startHour;
              dayEndHour = currentDay.toDateString() === new Date(endDate).toDateString() ? endHour : 24;
            } else if (dayOffset === adjustedDuration - 1) {
              // Dernier jour : finit à l'heure réelle
              dayStartHour = 0;
              dayEndHour = endHour;
            } else {
              // Jours intermédiaires : toute la journée
              dayStartHour = 0;
              dayEndHour = 24;
            }
            
            dailyPositions.push({
              dayIndex: adjustedStart + dayOffset,
              startPercent: dayStartHour / 24 * 100, // Position de début en % de la journée
              widthPercent: (dayEndHour - dayStartHour) / 24 * 100 // Largeur en % de la journée
            });
          }

          // Détecter les chevauchements temporels
          const overlappingReservations = sortedReservations.filter((otherRes, otherIndex) => {
            if (otherIndex >= index) return false;
            
            const otherStart = new Date(otherRes.startTime);
            const otherEnd = new Date(otherRes.endTime);
            
            return (startDate < otherEnd && endDate > otherStart);
          });

          const isOverlapping = overlappingReservations.length > 0;
          const overlapIndex = overlappingReservations.length;

          bands.push({
            reservation,
            startDay: adjustedStart,
            duration: adjustedDuration,
            position: isOverlapping ? 0 : index,
            isOverlapping,
            overlapIndex,
            continuesBefore,
            continuesAfter,
            dailyPositions // Nouvelle propriété pour les positions horaires
          });
        }
      }
    });

    return bands;
  };



  // Navigation jour par jour (toujours)
  const navigateDay = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'next') {
      newDate.setDate(currentDate.getDate() + 1);
    } else {
      newDate.setDate(currentDate.getDate() - 1);
    }
    setCurrentDate(newDate);
  };

  // Navigation semaine par semaine
  const navigateWeek = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'next') {
      newDate.setDate(currentDate.getDate() + 7);
    } else {
      newDate.setDate(currentDate.getDate() - 7);
    }
    setCurrentDate(newDate);
  };

  const handleReservationClick = (reservation: Reservation) => {
    setSelectedReservation(reservation);
    setIsModalOpen(true);
  };

  const handleSaveReservation = (updatedReservation: Reservation) => {
    const updatedReservations = reservations.map(r => 
      r.id === updatedReservation.id ? updatedReservation : r
    );
    setReservations(updatedReservations);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedReservations));
    setIsModalOpen(false);
    setSelectedReservation(null);
  };

  const handleDeleteReservation = (reservationId: string) => {
    const updatedReservations = reservations.filter(r => r.id !== reservationId);
    setReservations(updatedReservations);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedReservations));
    setIsModalOpen(false);
    setSelectedReservation(null);
  };

  const handleCreateReservation = (newReservation: Omit<Reservation, 'id'>) => {
    const reservation: Reservation = {
      ...newReservation,
      id: Date.now().toString()
    };
    const updatedReservations = [...reservations, reservation];
    setReservations(updatedReservations);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedReservations));
    
    // Notification pour nouvelle réservation
    showNotification(`Nouvelle réservation créée pour ${reservation.client}`, 'success');
    
    setIsNewReservationModalOpen(false);
    setSelectedVehicleId(null);
    setSelectedDate(null);
  };

  const handleCellClick = (vehicleId: string, date: Date) => {
    // Vérifier si le véhicule est en maintenance
    const vehicle = vehicles.find(v => v.id === vehicleId);
    if (vehicle?.status === 'maintenance') {
      showNotification('Impossible de créer une réservation : véhicule en maintenance', 'warning');
      return;
    }
    
    setSelectedVehicleId(vehicleId);
    setSelectedDate(date);
    setIsNewReservationModalOpen(true);
  };

  // Fonction pour gérer le clic sur l'indicateur de maintenance
  const handleMaintenanceClick = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setIsVehicleModalOpen(true);
  };

  // Fonction pour sauvegarder les modifications de véhicule
  const handleSaveVehicle = (vehicleData: Vehicle | Omit<Vehicle, 'id'>) => {
    if ('id' in vehicleData) {
      // Modification d'un véhicule existant
      const updatedVehicles = vehicles.map(v => 
        v.id === vehicleData.id ? vehicleData : v
      );
      setVehicles(updatedVehicles);
      localStorage.setItem(VEHICLES_STORAGE_KEY, JSON.stringify(updatedVehicles));
      
      if (vehicleData.status === 'maintenance') {
        showNotification(`${vehicleData.name} marqué en maintenance`, 'info');
      } else if (vehicleData.status === 'available') {
        showNotification(`${vehicleData.name} remis en service`, 'success');
      }
    }
    
    setIsVehicleModalOpen(false);
    setSelectedVehicle(null);
  };

  const today = new Date();
  const weekDays = viewMode === "week" ? getWeekDays() : [currentDate];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Planning</h2>
        <div className="flex items-center space-x-4">
          {/* Sélecteur de vue */}
          <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode("day")}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                viewMode === "day" ? "bg-white text-gray-900 shadow-sm" : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Jour
            </button>
            <button
              onClick={() => setViewMode("week")}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                viewMode === "week" ? "bg-white text-gray-900 shadow-sm" : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Semaine
            </button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button 
            onClick={() => {
              setSelectedVehicleId(null);
              setSelectedDate(null);
              setIsNewReservationModalOpen(true);
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Nouvelle réservation</span>
          </button>
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* Navigation semaine par semaine en mode semaine */}
            {viewMode === "week" && (
              <div className="flex items-center space-x-1 bg-gray-50 rounded-lg px-2 py-1">
                <span className="text-xs text-gray-500">Semaine:</span>
            <button
                  onClick={() => navigateWeek('prev')}
                  className="p-1 hover:bg-white rounded text-gray-500 hover:text-gray-700 transition-colors"
                  title="Semaine précédente"
                >
                  <ChevronLeft className="h-3 w-3" />
                </button>
                <button
                  onClick={() => navigateWeek('next')}
                  className="p-1 hover:bg-white rounded text-gray-500 hover:text-gray-700 transition-colors"
                  title="Semaine suivante"
                >
                  <ChevronRight className="h-3 w-3" />
                </button>
              </div>
            )}

            {/* Navigation jour par jour (principale) */}
            <button
              onClick={() => navigateDay('prev')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Jour précédent"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            
            <h3 className="text-xl font-semibold text-gray-900">
              {viewMode === "week" 
                ? `${weekDays[0].toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })} - ${weekDays[6].toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}`
                : currentDate.toLocaleDateString('fr-FR', { 
                    weekday: 'long', 
                    day: 'numeric', 
                    month: 'long', 
                    year: 'numeric' 
                  })
              }
            </h3>
            
            <button
              onClick={() => navigateDay('next')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Jour suivant"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
          <div className="flex items-center space-x-2">
            {/* Indicateur de jour actuel en mode semaine */}
            {viewMode === "week" && (
              <div className="text-sm text-gray-600 px-3 py-1 bg-blue-50 rounded-lg">
                Centre: {currentDate.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' })}
              </div>
            )}
          <button
            onClick={() => setCurrentDate(new Date())}
            className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            Aujourd'hui
          </button>
          </div>
        </div>
      </div>

      {/* Légende (mode semaine uniquement) */}
      {viewMode === "week" && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-4">
          <h4 className="text-sm font-semibold text-gray-900 mb-3">Légende</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-gray-600">
            <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 rounded-lg bg-blue-500 opacity-90"></div>
              <span>Bandes continues = Réservations multi-jours</span>
            </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded-r-lg bg-gray-400 opacity-90 relative">
                  <span className="absolute left-0 top-0 bottom-0 text-white text-xs flex items-center">⬅️</span>
                </div>
                <span>⬅️ Continue de la semaine précédente</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded-l-lg bg-gray-400 opacity-90 relative">
                  <span className="absolute right-0 top-0 bottom-0 text-white text-xs flex items-center">➡️</span>
                </div>
                <span>➡️ Continue sur la semaine suivante</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-yellow-100 border-2 border-yellow-300 border-dashed rounded flex items-center justify-center">
                  <span className="text-yellow-700 text-xs">🔧</span>
                </div>
                <span>🔧 Véhicule en maintenance (cliquer pour modifier)</span>
              </div>
            </div>
            <div className="space-y-2">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span>Confirmé</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                <span>En attente</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 rounded-full bg-red-500"></div>
                <span>Annulé</span>
                </div>
              </div>
              <div className="flex items-center space-x-2 mt-3">
                <div className="w-4 h-4 bg-blue-50 border-l-4 border-l-blue-500 rounded-sm"></div>
                <span className="font-medium text-blue-600">Colonne d'aujourd'hui</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Calendrier */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* En-tête du calendrier */}
        {viewMode === "week" ? (
          <div className="grid grid-cols-8 bg-gray-50 border-b border-gray-200">
            <div className="p-4 font-medium text-gray-900 border-r border-gray-200">
              Véhicules
            </div>
            {weekDays.map((day, index) => {
              const isToday = day.toDateString() === today.toDateString();
              return (
                <div 
                  key={index} 
                  className={`p-4 text-center border-r border-gray-200 last:border-r-0 ${
                    isToday ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                  }`}
                >
                  <div className={`font-medium ${isToday ? 'text-blue-700' : 'text-gray-900'}`}>
                  {day.toLocaleDateString('fr-FR', { weekday: 'short' })}
                </div>
                <div className={`text-sm mt-1 ${
                    isToday ? 'text-blue-600 font-semibold' : 'text-gray-600'
                }`}>
                  {day.getDate()}
                </div>
              </div>
              );
            })}
          </div>
        ) : (
          <div className="grid grid-cols-2 bg-gray-50 border-b border-gray-200">
            <div className="p-4 font-medium text-gray-900 border-r border-gray-200">
              Véhicules
            </div>
            <div className="p-4 text-center">
              <div className="font-medium text-gray-900">
                {currentDate.toLocaleDateString('fr-FR', { weekday: 'long' })}
              </div>
              <div className={`text-sm mt-1 ${
                currentDate.toDateString() === today.toDateString() 
                  ? 'text-blue-600 font-semibold' 
                  : 'text-gray-600'
              }`}>
                {currentDate.getDate()} {currentDate.toLocaleDateString('fr-FR', { month: 'long' })}
              </div>
            </div>
          </div>
        )}

        {/* Grille des véhicules et réservations */}
        <div className="divide-y divide-gray-200">
          {vehicles.map((vehicle) => {
            // Créer une clé unique qui change quand la semaine change
            const weekKey = viewMode === "week" ? weekDays.map(d => d.toDateString()).join('-') : currentDate.toDateString();
            return (
              <div key={`${vehicle.id}-${weekKey}-${viewMode}`} className={`grid ${viewMode === "week" ? "grid-cols-8" : "grid-cols-2"} min-h-[80px] relative`}>
              {/* Colonne véhicule */}
              <div className="p-4 bg-gray-50 border-r border-gray-200 flex items-center">
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold"
                    style={{ backgroundColor: vehicle.color }}
                  >
                    {vehicle.icon}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{vehicle.name}</div>
                    <div className="text-sm text-gray-600">{vehicle.plate}</div>
                    <div className="text-xs text-gray-500">{vehicle.type}</div>
                  </div>
                </div>
              </div>

              {/* Bandes de réservation continues (mode semaine) */}
              {viewMode === "week" && (
                <div className="absolute inset-0 pointer-events-none">
                  <div className="grid grid-cols-8 h-full">
                    <div></div> {/* Espace pour la colonne véhicule */}
                    <div className="col-span-7 relative">
                      {getReservationBands(vehicle.id).map((band, bandIndex) => {
                          // Couleurs différentes pour chaque réservation
                          const colors = [
                            vehicle.color,
                            '#10B981', // Emerald
                            '#F59E0B', // Amber  
                            '#EF4444', // Red
                            '#8B5CF6', // Violet
                            '#06B6D4', // Cyan
                          ];
                          const bandColor = colors[bandIndex % colors.length];
                            
                            // Calculer les positions exactes dans la grille selon le mode de vue
                            const viewDays = viewMode === "week" ? getWeekDays() : [currentDate];
                            const startDate = new Date(band.reservation.startTime);
                            const endDate = new Date(band.reservation.endTime);
                            
                            // Trouver les positions exactes dans la période visible
                            let startDayIndex = -1;
                            let endDayIndex = -1;
                            
                            viewDays.forEach((day, index) => {
                              const dayStr = day.toDateString();
                              if (startDate.toDateString() === dayStr) {
                                startDayIndex = index;
                              }
                              if (endDate.toDateString() === dayStr) {
                                endDayIndex = index;
                              }
                            });
                            
                            const maxDays = viewDays.length;
                            // Si les dates ne sont pas trouvées dans la période, utiliser les limites
                            if (startDayIndex === -1) {
                              startDayIndex = startDate < viewDays[0] ? 0 : maxDays - 1;
                            }
                            if (endDayIndex === -1) {
                              endDayIndex = endDate > viewDays[maxDays - 1] ? maxDays - 1 : 0;
                            }
                            
                            // Calculer positions avec heures
                            const startHour = startDate.getHours() + startDate.getMinutes() / 60;
                            const endHour = endDate.getHours() + endDate.getMinutes() / 60;
                            
                            // Calculer les positions en tenant compte des continuations
                            let leftPercent, widthPercent;
                            
                            if (band.continuesBefore && band.continuesAfter) {
                              // Continue des deux côtés : occupe tout l'espace
                              leftPercent = 0;
                              widthPercent = 100;
                            } else if (band.continuesBefore) {
                              // Continue avant : commence au bord gauche, finit à l'heure exacte
                              leftPercent = 0;
                              const endPercent = (endDayIndex / maxDays) * 100 + (endHour / 24 / maxDays) * 100;
                              widthPercent = endPercent;
                            } else if (band.continuesAfter) {
                              // Continue après : commence à l'heure exacte, finit au bord droit
                              leftPercent = (startDayIndex / maxDays) * 100 + (startHour / 24 / maxDays) * 100;
                              widthPercent = 100 - leftPercent;
                            } else {
                              // Réservation normale : heures exactes
                              leftPercent = (startDayIndex / maxDays) * 100 + (startHour / 24 / maxDays) * 100;
                              
                              if (startDayIndex === endDayIndex) {
                                // Même jour
                                widthPercent = ((endHour - startHour) / 24 / maxDays) * 100;
                              } else {
                                // Multi-jours : du début jusqu'à la fin
                                const endPercent = (endDayIndex / maxDays) * 100 + (endHour / 24 / maxDays) * 100;
                                widthPercent = endPercent - leftPercent;
                              }
                            }
                            

                          
                          return (
                            <div
                              key={`${band.reservation.id}-${bandIndex}`}
                                className={`absolute shadow-md border-2 border-white cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105 pointer-events-auto ${
                                  band.isOverlapping ? 'ring-2 ring-yellow-400 ring-opacity-50' : ''
                                } ${
                                  band.continuesBefore && band.continuesAfter ? '' : // Pas de coins arrondis si continue des deux côtés
                                  band.continuesBefore ? 'rounded-r-lg' : // Arrondi à droite si continue avant
                                  band.continuesAfter ? 'rounded-l-lg' : // Arrondi à gauche si continue après
                                  'rounded-lg' // Arrondi complet si ne continue nulle part
                                }`}
                              style={{
                                backgroundColor: bandColor,
                                  left: `${leftPercent}%`,
                                  width: `${widthPercent}%`,
                                  top: '50%',
                                  transform: 'translateY(-50%)',
                                  height: band.isOverlapping ? '30px' : '35px',
                                  opacity: band.isOverlapping ? 0.85 : 0.9,
                                  minWidth: '10px',
                                  zIndex: band.isOverlapping ? 15 + band.overlapIndex : 10,
                                  maxHeight: '35px',
                                  overflow: 'hidden'
                                }}
                                title={`${band.reservation.client} - ${band.reservation.title}\n${formatDate(band.reservation.startTime)} → ${formatDate(band.reservation.endTime)}\n${formatTime(band.reservation.startTime)} - ${formatTime(band.reservation.endTime)}\n${band.reservation.amount} XPF${
                                  band.continuesBefore ? '\n⬅️ Continue de la semaine précédente' : ''
                                }${
                                  band.continuesAfter ? '\n➡️ Continue sur la semaine suivante' : ''
                                }`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleReservationClick(band.reservation);
                                }}
                              >
                                {/* Indicateur de continuation avant */}
                                {band.continuesBefore && (
                                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-white bg-opacity-50 flex items-center justify-center">
                                    <div className="text-white text-xs font-bold">⬅️</div>
                                  </div>
                                )}
                                
                                {/* Indicateur de continuation après */}
                                {band.continuesAfter && (
                                  <div className="absolute right-0 top-0 bottom-0 w-1 bg-white bg-opacity-50 flex items-center justify-center">
                                    <div className="text-white text-xs font-bold">➡️</div>
                                  </div>
                                )}

                                                          <div className="absolute inset-0 flex items-center justify-start px-3 py-2">
                              <div className="flex items-center space-x-3 w-full">
                                <span className="text-white text-sm font-bold truncate">
                                  {band.reservation.client}
                                </span>
                                <span className="text-white text-xs opacity-90 truncate">
                                  {formatDate(band.reservation.startTime).split(' ')[0]} {formatDate(band.reservation.startTime).split(' ')[1]} → {formatDate(band.reservation.endTime).split(' ')[0]} {formatDate(band.reservation.endTime).split(' ')[1]}
                                </span>
                                <span className="text-white text-xs opacity-80 truncate">
                                  {formatTime(band.reservation.startTime)} - {formatTime(band.reservation.endTime)}
                                </span>
                                {band.reservation.notes && (
                                  <span className="text-white text-xs opacity-75 truncate">
                                    • {band.reservation.notes}
                                  </span>
                                )}
                              </div>
                            </div>
                              {/* Indicateur de statut */}
                                <div className="absolute top-1 right-1 w-2 h-2 rounded-full border border-white" 
                                   style={{ 
                                     backgroundColor: band.reservation.status === 'confirmed' ? '#10B981' : 
                                                    band.reservation.status === 'pending' ? '#F59E0B' : '#EF4444' 
                                   }}>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                </div>
              )}

              {/* Colonnes des jours */}
              {viewMode === "week" ? (
                  weekDays.map((day, dayIndex) => {
                    const isToday = day.toDateString() === today.toDateString();
                    const isInMaintenance = vehicle.status === 'maintenance';
                    
                    return (
                      <div 
                        key={dayIndex} 
                        onClick={() => !isInMaintenance && handleCellClick(vehicle.id, day)}
                        className={`p-2 border-r border-gray-200 last:border-r-0 min-h-[80px] transition-colors relative ${
                          isInMaintenance 
                            ? 'bg-yellow-50 cursor-not-allowed' 
                            : isToday 
                              ? 'bg-blue-50 border-l-4 border-l-blue-500 hover:bg-blue-100 cursor-pointer' 
                              : 'bg-gray-25 hover:bg-blue-50 cursor-pointer'
                        }`}
                        title={
                          isInMaintenance 
                            ? `${vehicle.name} en maintenance - Cliquer pour modifier` 
                            : `Créer une réservation pour ${vehicle.name} le ${formatDate(day)}`
                        }
                      >
                        {/* Indicateur de maintenance */}
                        {isInMaintenance && (
                          <div 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMaintenanceClick(vehicle);
                            }}
                            className="absolute inset-0 bg-yellow-100 bg-opacity-90 border-2 border-yellow-300 border-dashed rounded-lg flex items-center justify-center cursor-pointer hover:bg-yellow-200 transition-colors"
                          >
                            <div className="text-center">
                              <div className="text-yellow-700 font-bold text-sm">🔧 EN MAINTENANCE</div>
                              <div className="text-yellow-600 text-xs mt-1">Véhicule indisponible</div>
                              <div className="text-yellow-500 text-xs">Cliquer pour modifier</div>
                            </div>
                          </div>
                        )}
                        
                    {/* Espace pour les bandes de couleur - pas de contenu ici */}
                  </div>
                    );
                  })
              ) : (
                // Vue jour - une seule colonne pour le jour actuel
                (() => {
                  const dayReservations = getReservationsForDate(currentDate, vehicle.id);
                    const isInMaintenance = vehicle.status === 'maintenance';
                    
                  return (
                      <div 
                        onClick={(e) => {
                          if (e.target === e.currentTarget && !isInMaintenance) {
                            handleCellClick(vehicle.id, currentDate);
                          }
                        }}
                        className={`p-2 min-h-[80px] transition-colors relative ${
                          isInMaintenance 
                            ? 'bg-yellow-50 cursor-not-allowed' 
                            : 'hover:bg-blue-50 cursor-pointer'
                        }`}
                        title={
                          isInMaintenance 
                            ? `${vehicle.name} en maintenance - Cliquer pour modifier` 
                            : `Créer une réservation pour ${vehicle.name} le ${formatDate(currentDate)}`
                        }
                      >
                        {/* Indicateur de maintenance */}
                        {isInMaintenance && (
                          <div 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMaintenanceClick(vehicle);
                            }}
                            className="absolute inset-0 bg-yellow-100 bg-opacity-90 border-2 border-yellow-300 border-dashed rounded-lg flex items-center justify-center cursor-pointer hover:bg-yellow-200 transition-colors mb-2"
                          >
                            <div className="text-center">
                              <div className="text-yellow-700 font-bold text-sm">🔧 EN MAINTENANCE</div>
                              <div className="text-yellow-600 text-xs mt-1">Véhicule indisponible</div>
                              <div className="text-yellow-500 text-xs">Cliquer pour modifier</div>
                            </div>
                          </div>
                        )}
                        
                        {/* Réservations du jour */}
                        {!isInMaintenance && dayReservations.map((reservation) => {
                          // Calculer si la réservation continue avant/après ce jour
                          const startDate = new Date(reservation.startTime);
                          const endDate = new Date(reservation.endTime);
                          const normalizedCurrentDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
                          const normalizedStartDate = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
                          const normalizedEndDate = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
                          
                          const continuesBefore = normalizedStartDate < normalizedCurrentDate;
                          const continuesAfter = normalizedEndDate > normalizedCurrentDate;
                          const isMultiDay = normalizedStartDate.getTime() !== normalizedEndDate.getTime();
                          
                          return (
                        <div
                          key={reservation.id}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleReservationClick(reservation);
                              }}
                              className="mb-2 p-3 rounded-lg border-l-4 bg-white shadow-sm hover:shadow-md transition-shadow cursor-pointer relative"
                          style={{ borderLeftColor: vehicle.color }}
                        >
                              {/* Indicateurs de continuation */}
                              {isMultiDay && (
                                <div className="absolute top-2 right-2 flex space-x-1">
                                  {continuesBefore && (
                                    <span className="text-xs bg-blue-100 text-blue-600 px-1 rounded" title="Continue de la veille">⬅️</span>
                                  )}
                                  {continuesAfter && (
                                    <span className="text-xs bg-blue-100 text-blue-600 px-1 rounded" title="Continue demain">➡️</span>
                                  )}
                                </div>
                              )}
                              
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-2">
                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(reservation.status)}`}>
                                  {getStatusIcon(reservation.status)}
                                </span>
                                    {isMultiDay && (
                                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 border border-orange-200">
                                        Multi-jours
                                      </span>
                                    )}
                              </div>
                              <div className="mt-1">
                                <div className="font-medium text-gray-900 text-sm truncate">
                                  {reservation.title}
                                </div>
                                <div className="flex items-center space-x-1 text-xs text-gray-600 mt-1">
                                  <User className="h-3 w-3" />
                                  <span>{reservation.client}</span>
                                </div>
                                <div className="flex items-center space-x-1 text-xs text-gray-600">
                                  <Phone className="h-3 w-3" />
                                  <span>{reservation.phone}</span>
                                </div>
                                    
                                    {/* Affichage des heures adapté selon le type de réservation */}
                                    {isMultiDay ? (
                                      <div className="space-y-1">
                                        <div className="flex items-center space-x-1 text-xs text-gray-600">
                                          <Clock className="h-3 w-3" />
                                          <span className="font-medium">Période complète :</span>
                                        </div>
                                        <div className="text-xs text-gray-500 ml-4">
                                          Du {formatDate(reservation.startTime)} à {formatTime(reservation.startTime)}
                                        </div>
                                        <div className="text-xs text-gray-500 ml-4">
                                          Au {formatDate(reservation.endTime)} à {formatTime(reservation.endTime)}
                                        </div>
                                        {continuesBefore && continuesAfter ? (
                                          <div className="text-xs text-blue-600 ml-4 font-medium">
                                            ⬅️ Jour intermédiaire ➡️
                                          </div>
                                        ) : continuesBefore ? (
                                          <div className="text-xs text-blue-600 ml-4 font-medium">
                                            ⬅️ Se termine aujourd'hui à {formatTime(reservation.endTime)}
                                          </div>
                                        ) : continuesAfter ? (
                                          <div className="text-xs text-blue-600 ml-4 font-medium">
                                            Commence aujourd'hui à {formatTime(reservation.startTime)} ➡️
                                          </div>
                                        ) : (
                                          <div className="text-xs text-blue-600 ml-4 font-medium">
                                            Jour unique de la réservation multi-jours
                                          </div>
                                        )}
                                      </div>
                                    ) : (
                                <div className="flex items-center space-x-1 text-xs text-gray-600">
                                  <Clock className="h-3 w-3" />
                                  <span>
                                    {formatTime(reservation.startTime)} - {formatTime(reservation.endTime)}
                                  </span>
                                </div>
                                    )}
                                    
                                <div className="text-xs text-gray-500">
                                  {getDuration(reservation.startTime, reservation.endTime)}
                                </div>
                                {reservation.amount && (
                                  <div className="text-xs font-medium text-green-600 mt-1">
                                        {reservation.amount} XPF
                                  </div>
                                )}
                              </div>
                            </div>
                            <button className="p-1 hover:bg-gray-100 rounded">
                              <MoreVertical className="h-4 w-4 text-gray-400" />
                            </button>
                          </div>
                        </div>
                          );
                        })}
                    </div>
                  );
                })()
              )}
            </div>
            );
          })}
        </div>
      </div>

      {/* Modal de modification */}
      {isModalOpen && selectedReservation && (
        <ReservationModal
          reservation={selectedReservation}
          onSave={handleSaveReservation}
          onDelete={handleDeleteReservation}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedReservation(null);
          }}
          vehicles={vehicles}
          reservations={reservations}
        />
      )}

      {/* Modal de nouvelle réservation */}
      {isNewReservationModalOpen && (
        <NewReservationModal
          onSave={handleCreateReservation}
          onClose={() => setIsNewReservationModalOpen(false)}
          vehicles={vehicles}
          reservations={reservations}
          preSelectedVehicleId={selectedVehicleId}
          preSelectedDate={selectedDate}
        />
      )}

      {/* Modal de véhicule */}
      {isVehicleModalOpen && selectedVehicle && (
        <VehicleModal
          vehicle={selectedVehicle}
          onSave={handleSaveVehicle}
          onClose={() => {
            setIsVehicleModalOpen(false);
            setSelectedVehicle(null);
          }}
        />
      )}
    </div>
  );
};

// Composant Modal de véhicule (nouveau/modification)
const VehicleModal = ({ 
  vehicle, 
  onSave, 
  onDelete, 
  onClose 
}: { 
  vehicle?: Vehicle, 
  onSave: (vehicle: Vehicle | Omit<Vehicle, 'id'>) => void, 
  onDelete?: (id: string) => void, 
  onClose: () => void 
}) => {
  const isEditing = !!vehicle;
  
  const [formData, setFormData] = useState({
    name: vehicle?.name || '',
    plate: vehicle?.plate || '',
    type: vehicle?.type || 'Citadine',
    status: vehicle?.status || 'available' as "available" | "occupied" | "maintenance",
    color: vehicle?.color || '#3B82F6',
    icon: vehicle?.icon || '🚗'
  });

  const vehicleTypes = ['Citadine', 'Compacte', 'SUV', 'Scooter', 'Utilitaire', 'Moto'];
  const vehicleIcons = ['🚗', '🚙', '🚐', '🛵', '🏍️', '🚛', '🚌'];
  const vehicleColors = [
    '#3B82F6', '#10B981', '#EF4444', '#8B5CF6', '#F59E0B', 
    '#06B6D4', '#EC4899', '#84CC16', '#6B7280', '#F97316'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditing && vehicle) {
      const updatedVehicle: Vehicle = {
        ...vehicle,
        ...formData
      };
      onSave(updatedVehicle);
    } else {
      onSave(formData);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900">
            {isEditing ? 'Modifier le véhicule' : 'Nouveau véhicule'}
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nom du véhicule *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ex: Peugeot 208"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Plaque d'immatriculation *
            </label>
            <input
              type="text"
              value={formData.plate}
              onChange={(e) => setFormData({ ...formData, plate: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ex: 274-474-P"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type de véhicule
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {vehicleTypes.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Statut
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as "available" | "occupied" | "maintenance" })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="available">Disponible</option>
                <option value="occupied">Occupé</option>
                <option value="maintenance">En maintenance</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Icône
            </label>
            <div className="grid grid-cols-7 gap-2">
              {vehicleIcons.map((icon) => (
                <button
                  key={icon}
                  type="button"
                  onClick={() => setFormData({ ...formData, icon })}
                  className={`p-3 border-2 rounded-lg text-2xl hover:bg-gray-50 transition-colors ${
                    formData.icon === icon ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                  }`}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Couleur
            </label>
            <div className="grid grid-cols-5 gap-2">
              {vehicleColors.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setFormData({ ...formData, color })}
                  className={`w-12 h-12 rounded-lg border-2 transition-all ${
                    formData.color === color ? 'border-gray-800 scale-110' : 'border-gray-200'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          {/* Aperçu */}
          <div className="border-t pt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Aperçu
            </label>
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <div 
                className="w-12 h-12 rounded-lg flex items-center justify-center text-white text-xl"
                style={{ backgroundColor: formData.color }}
              >
                {formData.icon}
              </div>
              <div>
                <div className="font-medium text-gray-900">{formData.name || 'Nom du véhicule'}</div>
                <div className="text-sm text-gray-600">{formData.plate || 'Plaque'}</div>
                <div className="text-xs text-gray-500">{formData.type}</div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4">
            {isEditing && onDelete && (
              <button
                type="button"
                onClick={() => onDelete(vehicle!.id)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
              >
                <Trash2 className="h-4 w-4" />
                <span>Supprimer</span>
              </button>
            )}
            <div className={`flex space-x-3 ${!isEditing || !onDelete ? 'w-full justify-end' : ''}`}>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <Save className="h-4 w-4" />
                <span>{isEditing ? 'Modifier' : 'Créer'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

// Composant Véhicules
const Vehicles = ({ vehicles, setVehicles, isDarkMode, showNotification }: { vehicles: Vehicle[], setVehicles: (vehicles: Vehicle[]) => void, isDarkMode: boolean, showNotification: (message: string, type?: 'success' | 'error' | 'warning' | 'info') => void }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isNewVehicleModalOpen, setIsNewVehicleModalOpen] = useState(false);

  const filteredVehicles = vehicles.filter(vehicle =>
    vehicle.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehicle.plate.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehicle.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleVehicleClick = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setIsModalOpen(true);
  };

  const handleSaveVehicle = (vehicleData: Vehicle | Omit<Vehicle, 'id'>) => {
    if ('id' in vehicleData) {
      // Modification d'un véhicule existant
      const updatedVehicles = vehicles.map(v => 
        v.id === vehicleData.id ? vehicleData : v
      );
      setVehicles(updatedVehicles);
    } else {
      // Création d'un nouveau véhicule
      const newVehicle: Vehicle = {
        ...vehicleData,
        id: Date.now().toString()
      };
      setVehicles([...vehicles, newVehicle]);
    }
    
    setIsModalOpen(false);
    setIsNewVehicleModalOpen(false);
    setSelectedVehicle(null);
  };

  const handleDeleteVehicle = (vehicleId: string) => {
    const updatedVehicles = vehicles.filter(v => v.id !== vehicleId);
    setVehicles(updatedVehicles);
    setIsModalOpen(false);
    setSelectedVehicle(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Véhicules</h2>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher un véhicule..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button 
            onClick={() => setIsNewVehicleModalOpen(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Ajouter véhicule</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredVehicles.map((vehicle) => (
          <div 
            key={vehicle.id} 
            onClick={() => handleVehicleClick(vehicle)}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
          >
            <div className="flex items-center space-x-4 mb-4">
              <div 
                className="w-16 h-16 rounded-xl flex items-center justify-center text-white text-2xl"
                style={{ backgroundColor: vehicle.color }}
              >
                {vehicle.icon}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{vehicle.name}</h3>
                <p className="text-sm text-gray-600">{vehicle.plate}</p>
                <p className="text-xs text-gray-500">{vehicle.type}</p>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                vehicle.status === 'available' ? 'bg-green-100 text-green-800' :
                vehicle.status === 'occupied' ? 'bg-red-100 text-red-800' :
                'bg-yellow-100 text-yellow-800'
              }`}>
                {vehicle.status === 'available' ? '✓ Disponible' :
                 vehicle.status === 'occupied' ? '🚫 Occupé' :
                 '🔧 Maintenance'}
              </span>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  handleVehicleClick(vehicle);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <MoreVertical className="h-4 w-4 text-gray-400" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal de modification de véhicule */}
      {isModalOpen && selectedVehicle && (
        <VehicleModal
          vehicle={selectedVehicle}
          onSave={handleSaveVehicle}
          onDelete={handleDeleteVehicle}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedVehicle(null);
          }}
        />
      )}

      {/* Modal de nouveau véhicule */}
      {isNewVehicleModalOpen && (
        <VehicleModal
          onSave={handleSaveVehicle}
          onClose={() => setIsNewVehicleModalOpen(false)}
        />
      )}
    </div>
  );
};

// Composant principal avec authentification
const AuthenticatedApp: React.FC = () => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [currentPage, setCurrentPage] = useState("dashboard");
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('calendrcar-theme');
    return saved === 'dark';
  });

  // État des notifications
  const [notification, setNotification] = useState<{
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
    isVisible: boolean;
  }>({
    message: '',
    type: 'info',
    isVisible: false
  });

  // Fonction pour afficher une notification
  const showNotification = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
    setNotification({
      message,
      type,
      isVisible: true
    });
  };

  // Fonction pour fermer la notification
  const closeNotification = () => {
    setNotification(prev => ({ ...prev, isVisible: false }));
  };

  // Hook de planification des notifications (temporairement désactivé)
  // const notificationScheduler = useNotificationScheduler(reservations, vehicles);

  useEffect(() => {
    // Chargement des réservations
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          const parsedData = JSON.parse(saved);
          const convertedData = parsedData.map((item: any) => ({
            ...item,
            startTime: new Date(item.startTime),
            endTime: new Date(item.endTime)
          }));
          setReservations(convertedData);
        } catch {
          setReservations(EXAMPLE_RESERVATIONS);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(EXAMPLE_RESERVATIONS));
        }
      } else {
      // Première visite - charger les données d'exemple
        setReservations(EXAMPLE_RESERVATIONS);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(EXAMPLE_RESERVATIONS));
      }

    // Chargement des véhicules
    const savedVehicles = localStorage.getItem(VEHICLES_STORAGE_KEY);
    if (savedVehicles) {
      try {
        const parsedVehicles = JSON.parse(savedVehicles);
        setVehicles(parsedVehicles);
      } catch {
        setVehicles(INITIAL_VEHICLES);
        localStorage.setItem(VEHICLES_STORAGE_KEY, JSON.stringify(INITIAL_VEHICLES));
      }
    } else {
      setVehicles(INITIAL_VEHICLES);
      localStorage.setItem(VEHICLES_STORAGE_KEY, JSON.stringify(INITIAL_VEHICLES));
    }
  }, []);

  useEffect(() => {
    if (reservations.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(reservations));
    }
  }, [reservations]);

  useEffect(() => {
    if (vehicles.length > 0) {
      localStorage.setItem(VEHICLES_STORAGE_KEY, JSON.stringify(vehicles));
    }
  }, [vehicles]);

  // Gestion du thème
  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    localStorage.setItem('calendrcar-theme', newTheme ? 'dark' : 'light');
  };

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard reservations={reservations} vehicles={vehicles} isDarkMode={isDarkMode} showNotification={showNotification} />;
      case 'planning':
        return <Planning reservations={reservations} setReservations={setReservations} vehicles={vehicles} setVehicles={setVehicles} isDarkMode={isDarkMode} showNotification={showNotification} />;
      case 'vehicles':
        return <Vehicles vehicles={vehicles} setVehicles={setVehicles} isDarkMode={isDarkMode} showNotification={showNotification} />;
      default:
        return <Dashboard reservations={reservations} vehicles={vehicles} isDarkMode={isDarkMode} showNotification={showNotification} />;
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDarkMode ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      <Sidebar 
        currentPage={currentPage} 
        setCurrentPage={setCurrentPage}
        isDarkMode={isDarkMode}
        onToggleTheme={toggleTheme}
        showNotification={showNotification}
      />
      
      {/* Contenu principal */}
      <div className="ml-16 transition-all duration-300">
        <main className="p-6">
          {renderCurrentPage()}
        </main>
      </div>

      {/* Notifications Toast */}
      <Toast
        message={notification.message}
        type={notification.type}
        isVisible={notification.isVisible}
        onClose={closeNotification}
      />
    </div>
  );
};

// Composant App avec gestion d'authentification
const App: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement de CalendrCar...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return <AuthenticatedApp />;
};

// Composant racine avec AuthProvider
const AppWithAuth: React.FC = () => {
  return (
    <AuthProvider>
      <App />
    </AuthProvider>
  );
};

export default AppWithAuth;
