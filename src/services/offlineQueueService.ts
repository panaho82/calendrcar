import { supabaseService } from './supabaseService.ts';

interface QueueAction {
  id: string;
  type: 'create' | 'update' | 'delete';
  entity: 'reservation' | 'vehicle';
  data: any;
  timestamp: number;
  retryCount: number;
}

interface OfflineStatus {
  isOnline: boolean;
  lastOnlineTime: number;
  queuedActions: number;
  lastSyncAttempt: number;
}

class OfflineQueueService {
  private queueKey = 'calendrcar-offline-queue';
  private statusKey = 'calendrcar-offline-status';
  private onlineCallbacks: ((status: OfflineStatus) => void)[] = [];
  private offlineCallbacks: ((status: OfflineStatus) => void)[] = [];
  private syncCallbacks: ((result: { success: boolean; message: string; syncedActions: number }) => void)[] = [];
  
  constructor() {
    this.initializeConnectionListeners();
  }

  // ==================== CONNEXION LISTENERS ====================

  private initializeConnectionListeners(): void {
    // Écouter les événements de connexion
    window.addEventListener('online', () => {
      console.log('🌐 Retour en ligne détecté');
      this.handleOnline();
    });

    window.addEventListener('offline', () => {
      console.log('📴 Passage hors ligne détecté');
      this.handleOffline();
    });

    // Vérifier le statut initial
    if (navigator.onLine) {
      this.handleOnline();
    } else {
      this.handleOffline();
    }
  }

  private async handleOnline(): Promise<void> {
    const status = this.getOfflineStatus();
    status.isOnline = true;
    status.lastOnlineTime = Date.now();
    this.saveOfflineStatus(status);

    // Notifier les callbacks
    this.onlineCallbacks.forEach(callback => callback(status));

    // Démarrer la synchronisation de rattrapage
    await this.processPendingQueue();
  }

  private handleOffline(): void {
    const status = this.getOfflineStatus();
    status.isOnline = false;
    this.saveOfflineStatus(status);

    // Notifier les callbacks
    this.offlineCallbacks.forEach(callback => callback(status));
  }

  // ==================== QUEUE MANAGEMENT ====================

  addToQueue(type: 'create' | 'update' | 'delete', entity: 'reservation' | 'vehicle', data: any): string {
    const action: QueueAction = {
      id: `${type}-${entity}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      entity,
      data,
      timestamp: Date.now(),
      retryCount: 0
    };

    const queue = this.getQueue();
    queue.push(action);
    this.saveQueue(queue);

    // Mettre à jour le statut
    const status = this.getOfflineStatus();
    status.queuedActions = queue.length;
    this.saveOfflineStatus(status);

    console.log(`📋 Action ajoutée à la queue: ${type} ${entity}`, action.id);
    return action.id;
  }

  removeFromQueue(actionId: string): void {
    const queue = this.getQueue().filter(action => action.id !== actionId);
    this.saveQueue(queue);

    // Mettre à jour le statut
    const status = this.getOfflineStatus();
    status.queuedActions = queue.length;
    this.saveOfflineStatus(status);
  }

  getQueue(): QueueAction[] {
    try {
      const queueData = localStorage.getItem(this.queueKey);
      return queueData ? JSON.parse(queueData) : [];
    } catch {
      return [];
    }
  }

  private saveQueue(queue: QueueAction[]): void {
    localStorage.setItem(this.queueKey, JSON.stringify(queue));
  }

  clearQueue(): void {
    localStorage.removeItem(this.queueKey);
    const status = this.getOfflineStatus();
    status.queuedActions = 0;
    this.saveOfflineStatus(status);
  }

  // ==================== OFFLINE STATUS ====================

  getOfflineStatus(): OfflineStatus {
    try {
      const statusData = localStorage.getItem(this.statusKey);
      return statusData ? JSON.parse(statusData) : {
        isOnline: navigator.onLine,
        lastOnlineTime: Date.now(),
        queuedActions: 0,
        lastSyncAttempt: 0
      };
    } catch {
      return {
        isOnline: navigator.onLine,
        lastOnlineTime: Date.now(),
        queuedActions: 0,
        lastSyncAttempt: 0
      };
    }
  }

  private saveOfflineStatus(status: OfflineStatus): void {
    localStorage.setItem(this.statusKey, JSON.stringify(status));
  }

  // ==================== SYNC DE RATTRAPAGE ====================

  async processPendingQueue(): Promise<{ success: boolean; message: string; syncedActions: number }> {
    const queue = this.getQueue();
    
    if (queue.length === 0) {
      console.log('✅ Queue vide - aucune synchronisation nécessaire');
      return { success: true, message: 'Aucune action en attente', syncedActions: 0 };
    }

    console.log(`🔄 Traitement de ${queue.length} actions en attente...`);
    
    const status = this.getOfflineStatus();
    status.lastSyncAttempt = Date.now();
    this.saveOfflineStatus(status);

    let successCount = 0;
    let errorCount = 0;
    const errors: string[] = [];

    // Traiter chaque action
    for (const action of queue) {
      try {
        await this.processAction(action);
        this.removeFromQueue(action.id);
        successCount++;
        console.log(`✅ Action synchronisée: ${action.type} ${action.entity}`);
      } catch (error) {
        errorCount++;
        action.retryCount++;
        const errorMessage = `Erreur ${action.type} ${action.entity}: ${String(error)}`;
        errors.push(errorMessage);
        
        // Retirer de la queue après 3 tentatives échouées
        if (action.retryCount >= 3) {
          console.warn(`❌ Action abandonnée après 3 tentatives: ${action.id}`);
          this.removeFromQueue(action.id);
        } else {
          console.warn(`⚠️ Échec tentative ${action.retryCount}/3: ${action.id}`);
        }
      }
    }

    // Résultat final
    const result = {
      success: errorCount === 0,
      message: successCount > 0 
        ? `${successCount} actions synchronisées` + (errorCount > 0 ? `, ${errorCount} échecs` : '')
        : `Échec de synchronisation: ${errors.join(', ')}`,
      syncedActions: successCount
    };

    // Notifier les callbacks
    this.syncCallbacks.forEach(callback => callback(result));

    return result;
  }

  private async processAction(action: QueueAction): Promise<void> {
    switch (action.entity) {
      case 'reservation':
        await this.processReservationAction(action);
        break;
      case 'vehicle':
        await this.processVehicleAction(action);
        break;
      default:
        throw new Error(`Type d'entité non supporté: ${action.entity}`);
    }
  }

  private async processReservationAction(action: QueueAction): Promise<void> {
    switch (action.type) {
      case 'create':
      case 'update':
        // Pour create et update, on sauvegarde toutes les réservations
        const localReservations = this.getLocalReservations();
        await supabaseService.saveReservations(localReservations);
        break;
      case 'delete':
        // Pour delete, on utilise l'API de suppression directe
        await this.deleteReservationById(action.data.id);
        break;
    }
  }

  private async processVehicleAction(action: QueueAction): Promise<void> {
    switch (action.type) {
      case 'create':
      case 'update':
        const localVehicles = this.getLocalVehicles();
        await supabaseService.saveVehicles(localVehicles);
        break;
      case 'delete':
        await this.deleteVehicleById(action.data.id);
        break;
    }
  }

  private async deleteReservationById(id: string): Promise<void> {
    // Utiliser l'API Supabase pour supprimer directement
    const response = await fetch(`${supabaseService.getSupabaseUrl()}/rest/v1/reservations?id=eq.${id}`, {
      method: 'DELETE',
      headers: {
        'apikey': supabaseService.getSupabaseKey(),
        'Authorization': `Bearer ${supabaseService.getSupabaseKey()}`
      }
    });

    if (!response.ok) {
      throw new Error(`Erreur suppression réservation: HTTP ${response.status}`);
    }
  }

  private async deleteVehicleById(id: string): Promise<void> {
    const response = await fetch(`${supabaseService.getSupabaseUrl()}/rest/v1/vehicles?id=eq.${id}`, {
      method: 'DELETE',
      headers: {
        'apikey': supabaseService.getSupabaseKey(),
        'Authorization': `Bearer ${supabaseService.getSupabaseKey()}`
      }
    });

    if (!response.ok) {
      throw new Error(`Erreur suppression véhicule: HTTP ${response.status}`);
    }
  }

  // ==================== HELPERS ====================

  private getLocalReservations(): any[] {
    try {
      const data = localStorage.getItem('calendrcar-reservations');
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  private getLocalVehicles(): any[] {
    try {
      const data = localStorage.getItem('calendrcar-vehicles');
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  // ==================== SMART SYNC ====================

  async performSmartSync(): Promise<{ success: boolean; message: string; actions: string[] }> {
    if (!navigator.onLine) {
      return { success: false, message: 'Pas de connexion internet', actions: [] };
    }

    console.log('🧠 Démarrage sync intelligente...');
    const actions: string[] = [];

    try {
      // 1. Vérifier si on a des données locales plus récentes
      const localReservations = this.getLocalReservations();
      const localVehicles = this.getLocalVehicles();
      const lastSync = localStorage.getItem('calendrcar-last-sync');
      
      if (!lastSync || localReservations.length === 0) {
        return { success: true, message: 'Aucune donnée locale à synchroniser', actions };
      }

      // 2. Récupérer les données Supabase
      const remoteReservations = await supabaseService.getReservations();
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const remoteVehicles = await supabaseService.getVehicles();

      // 3. Comparer et déterminer l'action
      const localCount = localReservations.length;
      const remoteCount = remoteReservations.length;
      const lastSyncTime = new Date(lastSync).getTime();
      const timeSinceSync = Date.now() - lastSyncTime;

      // Si les données locales sont plus récentes (modifiées dans les dernières 5 minutes)
      if (timeSinceSync < 300000 && localCount !== remoteCount) {
        console.log('📤 Données locales plus récentes détectées - Upload vers Supabase');
        
        await supabaseService.saveReservations(localReservations);
        await supabaseService.saveVehicles(localVehicles);
        
        actions.push(`📤 ${localReservations.length} réservations uploadées`);
        actions.push(`📤 ${localVehicles.length} véhicules uploadés`);
        
        // Marquer comme synchronisé
        localStorage.setItem('calendrcar-last-sync', new Date().toISOString());
      }

      return { 
        success: true, 
        message: actions.length > 0 ? 'Synchronisation intelligente terminée' : 'Données déjà synchronisées',
        actions 
      };

    } catch (error) {
      console.error('Erreur sync intelligente:', error);
      return { 
        success: false, 
        message: `Erreur sync: ${String(error)}`, 
        actions 
      };
    }
  }

  // ==================== CALLBACKS ====================

  onOnline(callback: (status: OfflineStatus) => void): void {
    this.onlineCallbacks.push(callback);
  }

  onOffline(callback: (status: OfflineStatus) => void): void {
    this.offlineCallbacks.push(callback);
  }

  onSync(callback: (result: { success: boolean; message: string; syncedActions: number }) => void): void {
    this.syncCallbacks.push(callback);
  }

  // ==================== FORCE SYNC ====================

  async forceSync(): Promise<{ success: boolean; message: string }> {
    console.log('⚡ Synchronisation forcée démarrée...');
    
    try {
      // 1. Traiter la queue en attente
      const queueResult = await this.processPendingQueue();
      
      // 2. Effectuer une sync intelligente
      const smartResult = await this.performSmartSync();
      
      const totalActions = queueResult.syncedActions + smartResult.actions.length;
      
      return {
        success: queueResult.success && smartResult.success,
        message: totalActions > 0 
          ? `Synchronisation forcée réussie: ${totalActions} actions`
          : 'Aucune synchronisation nécessaire'
      };
      
    } catch (error) {
      return {
        success: false,
        message: `Erreur synchronisation forcée: ${String(error)}`
      };
    }
  }
}

// Instance singleton
export const offlineQueueService = new OfflineQueueService(); 