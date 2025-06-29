import { useEffect, useCallback } from 'react';
import { usePWA } from './usePWA';

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

interface Vehicle {
  id: string;
  name: string;
  plate: string;
  type: string;
  status: "available" | "occupied" | "maintenance";
  color: string;
  icon: string;
}

export const useNotificationScheduler = (
  reservations: Reservation[],
  vehicles: Vehicle[]
) => {
  const pwa = usePWA();

  // Fonction pour planifier les notifications de rappel
  const scheduleReservationReminders = useCallback(() => {
    if (pwa.notifications.permission !== 'granted' || !pwa.registration) {
      return;
    }

    const now = new Date();
    const upcoming = reservations.filter(reservation => {
      if (reservation.status !== 'confirmed') return false;
      
      const startTime = new Date(reservation.startTime);
      const timeDiff = startTime.getTime() - now.getTime();
      
      // Notifications 1 heure avant et 15 minutes avant
      return timeDiff > 0 && timeDiff <= 60 * 60 * 1000; // Dans l'heure
    });

    upcoming.forEach(reservation => {
      const vehicle = vehicles.find(v => v.id === reservation.vehicleId);
      const startTime = new Date(reservation.startTime);
      const timeDiff = startTime.getTime() - now.getTime();
      
      // Notification 15 minutes avant
      const reminderTime15 = timeDiff - (15 * 60 * 1000);
      if (reminderTime15 > 0 && reminderTime15 <= 5 * 60 * 1000) { // Dans les 5 prochaines minutes
        scheduleNotification({
          title: 'Rappel de Réservation - 15 min',
          body: `${reservation.client} - ${vehicle?.name} (${vehicle?.plate})`,
          data: {
            type: 'reservation-reminder',
            reservationId: reservation.id,
            clientName: reservation.client,
            vehicleName: vehicle?.name,
            timeRemaining: '15 minutes'
          },
          delay: reminderTime15
        });
      }

      // Notification 5 minutes avant
      const reminderTime5 = timeDiff - (5 * 60 * 1000);
      if (reminderTime5 > 0 && reminderTime5 <= 2 * 60 * 1000) { // Dans les 2 prochaines minutes
        scheduleNotification({
          title: 'Rappel de Réservation - 5 min',
          body: `${reservation.client} - ${vehicle?.name} départ imminent`,
          data: {
            type: 'reservation-reminder',
            reservationId: reservation.id,
            clientName: reservation.client,
            vehicleName: vehicle?.name,
            timeRemaining: '5 minutes'
          },
          delay: reminderTime5
        });
      }
    });
  }, [reservations, vehicles, pwa.notifications.permission, pwa.registration]);

  // Fonction pour détecter les retours en retard
  const checkOverdueReturns = useCallback(() => {
    if (pwa.notifications.permission !== 'granted' || !pwa.registration) {
      return;
    }

    const now = new Date();
    const overdue = reservations.filter(reservation => {
      if (reservation.status !== 'confirmed') return false;
      
      const endTime = new Date(reservation.endTime);
      const timeDiff = now.getTime() - endTime.getTime();
      
      // Véhicule en retard de plus de 30 minutes
      return timeDiff > 30 * 60 * 1000;
    });

    overdue.forEach(reservation => {
      const vehicle = vehicles.find(v => v.id === reservation.vehicleId);
      const endTime = new Date(reservation.endTime);
      const hoursLate = Math.floor((now.getTime() - endTime.getTime()) / (60 * 60 * 1000));
      
      scheduleNotification({
        title: 'Retour en Retard',
        body: `${reservation.client} - ${vehicle?.name} (${hoursLate}h de retard)`,
        data: {
          type: 'overdue-return',
          reservationId: reservation.id,
          clientName: reservation.client,
          vehicleName: vehicle?.name,
          hoursLate
        },
        delay: 0 // Immédiat
      });
    });
  }, [reservations, vehicles, pwa.notifications.permission, pwa.registration]);

  // Fonction pour planifier une notification
  const scheduleNotification = useCallback(async (notification: {
    title: string;
    body: string;
    data: any;
    delay: number;
  }) => {
    if (!pwa.registration) return;

    if (notification.delay <= 0) {
      // Notification immédiate
      await pwa.registration.showNotification(notification.title, {
        body: notification.body,
        icon: '/logo192.png',
        badge: '/favicon.ico',
        vibrate: [200, 100, 200],
        data: notification.data,
        actions: [
          { action: 'view', title: 'Voir détails', icon: '/logo192.png' },
          { action: 'dismiss', title: 'Ignorer' }
        ],
        tag: `calendrcar-${notification.data.type}-${Date.now()}`,
        requireInteraction: true,
        timestamp: Date.now()
      });
    } else {
      // Notification différée (utilise setTimeout pour la démo)
      setTimeout(async () => {
        await pwa.registration?.showNotification(notification.title, {
          body: notification.body,
          icon: '/logo192.png',
          badge: '/favicon.ico',
          vibrate: [200, 100, 200],
          data: notification.data,
          actions: [
            { action: 'view', title: 'Voir détails', icon: '/logo192.png' },
            { action: 'dismiss', title: 'Ignorer' }
          ],
          tag: `calendrcar-${notification.data.type}-${Date.now()}`,
          requireInteraction: true,
          timestamp: Date.now()
        });
      }, notification.delay);
    }
  }, [pwa.registration]);

  // Notification pour nouvelles réservations
  const notifyNewReservation = useCallback((reservation: Reservation) => {
    if (pwa.notifications.permission !== 'granted') return;
    
    const vehicle = vehicles.find(v => v.id === reservation.vehicleId);
    
    scheduleNotification({
      title: 'Nouvelle Réservation',
      body: `${reservation.client} - ${vehicle?.name || 'Véhicule'} du ${new Date(reservation.startTime).toLocaleDateString('fr-FR')}`,
      data: {
        type: 'new-reservation',
        reservationId: reservation.id,
        clientName: reservation.client,
        vehicleName: vehicle?.name
      },
      delay: 0
    });
  }, [vehicles, pwa.notifications.permission, scheduleNotification]);

  // Surveillance périodique
  useEffect(() => {
    if (pwa.notifications.permission !== 'granted') return;

    // Vérifie les notifications toutes les 30 secondes en développement
    const interval = setInterval(() => {
      scheduleReservationReminders();
      checkOverdueReturns();
    }, 30 * 1000); // 30 secondes

    // Vérification initiale
    scheduleReservationReminders();
    checkOverdueReturns();

    return () => clearInterval(interval);
  }, [
    scheduleReservationReminders, 
    checkOverdueReturns, 
    pwa.notifications.permission
  ]);

  return {
    notifyNewReservation,
    scheduleReservationReminders,
    checkOverdueReturns,
    isNotificationsEnabled: pwa.notifications.permission === 'granted'
  };
};

// Export nommé seulement 