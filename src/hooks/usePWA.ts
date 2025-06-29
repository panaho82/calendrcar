import { useState, useEffect, useCallback } from 'react';

interface NotificationPermissionInterface {
  permission: NotificationPermission;
  subscribe: () => Promise<void>;
  unsubscribe: () => Promise<void>;
  sendTestNotification: (type?: string, data?: any) => Promise<void>;
}

interface PWAInstall {
  isInstallable: boolean;
  isInstalled: boolean;
  install: () => Promise<void>;
  showInstallPrompt: boolean;
}

interface PWACapabilities {
  isOnline: boolean;
  isSupported: boolean;
  notifications: NotificationPermissionInterface;
  install: PWAInstall;
  registration: ServiceWorkerRegistration | null;
}

export const usePWA = (): PWACapabilities => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [permission, setPermission] = useState<NotificationPermission>(Notification.permission);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  // Vérification du support PWA
  const isSupported = 'serviceWorker' in navigator && 'PushManager' in window;

  useEffect(() => {
    // Gestion du statut en ligne/hors ligne
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Gestion de l'événement d'installation PWA
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    // Détection si l'app est déjà installée
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    // Détection du mode standalone (app installée)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    setIsInstalled(isStandalone);

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Enregistrement du service worker
    if (isSupported) {
      navigator.serviceWorker.ready
        .then((reg) => {
          setRegistration(reg);
          console.log('Service Worker prêt:', reg);
        })
        .catch((error) => {
          console.error('Erreur Service Worker:', error);
        });

      // Écoute des messages du service worker
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'NOTIFICATION_CLICK') {
          // Gestion de la navigation depuis les notifications
          const url = new URL(event.data.url, window.location.origin);
          const params = new URLSearchParams(url.search);
          
          if (params.get('page')) {
            // Logique de navigation dans l'app
            window.dispatchEvent(new CustomEvent('pwa-navigate', {
              detail: { page: params.get('page'), data: event.data.data }
            }));
          }
        }
      });
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [isSupported]);

  // Souscription aux notifications push
  const subscribe = useCallback(async () => {
    if (!registration || !isSupported) {
      throw new Error('Service Worker non disponible');
    }

    try {
      const permission = await Notification.requestPermission();
      setPermission(permission);

      if (permission === 'granted') {
        // Clé VAPID publique (à remplacer par votre vraie clé)
        const vapidPublicKey = 'BEl62iUYgUivxIkv69yViEuiBIa40HI80NM8CcrNRUpz9s6Z1MQHJzk4hq7lGH9iA6-1QhFD4u7F5v_Z4_6N2E4';
        
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidPublicKey)
        });

        console.log('Souscription push:', subscription);

        // Envoi de la souscription au serveur (placeholder)
        // await fetch('/api/subscribe', {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify(subscription)
        // });

        // Stockage local de la souscription
        localStorage.setItem('calendrcar-push-subscription', JSON.stringify(subscription));
      }
    } catch (error) {
      console.error('Erreur souscription push:', error);
      throw error;
    }
  }, [registration, isSupported]);

  // Désabonnement des notifications
  const unsubscribe = useCallback(async () => {
    if (!registration) {
      throw new Error('Service Worker non disponible');
    }

    try {
      const subscription = await registration.pushManager.getSubscription();
      if (subscription) {
        await subscription.unsubscribe();
        localStorage.removeItem('calendrcar-push-subscription');
        console.log('Désabonnement push réussi');
      }
    } catch (error) {
      console.error('Erreur désabonnement push:', error);
      throw error;
    }
  }, [registration]);

  // Envoi d'une notification de test
  const sendTestNotification = useCallback(async (type = 'test', data = {}) => {
    if (!registration || permission !== 'granted') {
      throw new Error('Notifications non autorisées');
    }

    try {
      // Simulation d'une notification push locale
      const notificationData = {
        type,
        body: getTestNotificationBody(type),
        data: { ...data, type }
      };

      await registration.showNotification('CalendrCar - Test', {
        body: notificationData.body,
        icon: '/logo192.png',
        badge: '/favicon.ico',
        vibrate: [100, 50, 100],
        data: notificationData.data,
        actions: [
          { action: 'explore', title: 'Voir détails', icon: '/logo192.png' },
          { action: 'close', title: 'Fermer' }
        ],
        tag: `calendrcar-test-${type}`,
        requireInteraction: true
      });

      console.log('Notification de test envoyée:', type);
    } catch (error) {
      console.error('Erreur notification test:', error);
      throw error;
    }
  }, [registration, permission]);

  // Installation de l'app PWA
  const install = useCallback(async () => {
    if (!deferredPrompt) {
      throw new Error('Installation non disponible');
    }

    try {
      await deferredPrompt.prompt();
      const result = await deferredPrompt.userChoice;
      
      if (result.outcome === 'accepted') {
        console.log('PWA installée');
        setIsInstalled(true);
      } else {
        console.log('Installation PWA refusée');
      }
      
      setDeferredPrompt(null);
    } catch (error) {
      console.error('Erreur installation PWA:', error);
      throw error;
    }
  }, [deferredPrompt]);

  return {
    isOnline,
    isSupported,
    notifications: {
      permission,
      subscribe,
      unsubscribe,
      sendTestNotification
    },
    install: {
      isInstallable: !!deferredPrompt,
      isInstalled,
      install,
      showInstallPrompt: !!deferredPrompt && !isInstalled
    },
    registration
  };
};

// Utilitaires
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

function getTestNotificationBody(type: string): string {
  switch (type) {
    case 'reservation-reminder':
      return 'Rappel: Réservation de Jean Dupont dans 1 heure';
    case 'vehicle-maintenance':
      return 'Maintenance requise pour Peugeot 208 (274-474-P)';
    case 'new-reservation':
      return 'Nouvelle réservation reçue de Marie Martin';
    case 'low-fuel':
      return 'Niveau de carburant bas pour véhicule 274-473-P';
    case 'overdue-return':
      return 'Retour en retard: Client Dupont - Véhicule attendu';
    default:
      return 'Notification de test de CalendrCar';
  }
}

// Export nommé seulement 