import { supabaseService } from './supabaseService.ts';

// Types pour la synchronisation
interface SyncStatus {
  localReservations: number;
  remoteReservations: number;
  localVehicles: number;
  remoteVehicles: number;
  needsSync: boolean;
  lastSync: Date | null;
}

interface SyncPreview {
  toUpload: {
    reservations: any[];
    vehicles: any[];
  };
  toDownload: {
    reservations: any[];
    vehicles: any[];
  };
  conflicts: {
    reservations: any[];
    vehicles: any[];
  };
}

interface AutoSyncResult {
  success: boolean;
  message: string;
  action: 'none' | 'upload' | 'download' | 'conflict';
  details?: {
    reservationsUploaded?: number;
    vehiclesUploaded?: number;
    reservationsDownloaded?: number;
    vehiclesDownloaded?: number;
  };
}

class SyncService {
  private lastSyncKey = 'calendrcar-last-sync';
  private autoSyncEnabledKey = 'calendrcar-auto-sync-enabled';

  // ==================== AUTO-SYNC FUNCTIONS ====================

  // Vérifier si l'auto-sync est activée
  isAutoSyncEnabled(): boolean {
    const enabled = localStorage.getItem(this.autoSyncEnabledKey);
    return enabled !== 'false'; // Par défaut activé
  }

  // Activer/désactiver l'auto-sync
  setAutoSyncEnabled(enabled: boolean): void {
    localStorage.setItem(this.autoSyncEnabledKey, enabled.toString());
  }

  // Auto-sync intelligente à l'ouverture
  async performAutoSync(): Promise<AutoSyncResult> {
    try {
      // Vérifier si auto-sync est activée
      if (!this.isAutoSyncEnabled()) {
        return { success: true, message: 'Auto-sync désactivée', action: 'none' };
      }

      // Vérifier si Supabase est disponible
      if (!supabaseService.isSupabaseEnabled()) {
        return { success: true, message: 'Supabase non disponible - mode hors ligne', action: 'none' };
      }

      // Obtenir le statut actuel
      const status = await this.getSyncStatus();
      
      // Si pas de données locales, télécharger du cloud
      if (status.localReservations === 0 && status.localVehicles === 0 && 
          (status.remoteReservations > 0 || status.remoteVehicles > 0)) {
        
        const result = await this.silentDownload();
        return {
          success: result.success,
          message: result.success ? 'Données téléchargées du cloud' : result.message,
          action: 'download',
          details: {
            reservationsDownloaded: status.remoteReservations,
            vehiclesDownloaded: status.remoteVehicles
          }
        };
      }

      // Si pas de données dans le cloud, uploader
      if (status.remoteReservations === 0 && status.remoteVehicles === 0 && 
          (status.localReservations > 0 || status.localVehicles > 0)) {
        
        const result = await this.silentUpload();
        return {
          success: result.success,
          message: result.success ? 'Données envoyées vers le cloud' : result.message,
          action: 'upload',
          details: {
            reservationsUploaded: status.localReservations,
            vehiclesUploaded: status.localVehicles
          }
        };
      }

      // Si les données sont identiques, marquer comme synchronisé
      if (!status.needsSync) {
        return { success: true, message: 'Données déjà synchronisées', action: 'none' };
      }

      // Si conflit potentiel, ne rien faire (sync manuelle requise)
      if (status.localReservations !== status.remoteReservations || 
          status.localVehicles !== status.remoteVehicles) {
        return { 
          success: true, 
          message: 'Conflit détecté - synchronisation manuelle recommandée', 
          action: 'conflict' 
        };
      }

      return { success: true, message: 'Aucune action nécessaire', action: 'none' };

    } catch (error) {
      console.error('Erreur auto-sync:', error);
      return { 
        success: false, 
        message: `Erreur auto-sync: ${error}`, 
        action: 'none' 
      };
    }
  }

  // Upload silencieux (sans confirmation)
  private async silentUpload(): Promise<{ success: boolean; message: string }> {
    try {
      const localReservations = this.getLocalReservations();
      const localVehicles = this.getLocalVehicles();

      await supabaseService.saveReservations(localReservations);
      await supabaseService.saveVehicles(localVehicles);

      localStorage.setItem(this.lastSyncKey, new Date().toISOString());

      return { 
        success: true, 
        message: `Auto-upload: ${localReservations.length} réservations, ${localVehicles.length} véhicules` 
      };
    } catch (error) {
      return { 
        success: false, 
        message: `Erreur auto-upload: ${error}` 
      };
    }
  }

  // Download silencieux (sans confirmation)
  private async silentDownload(): Promise<{ success: boolean; message: string }> {
    try {
      const remoteReservations = await supabaseService.getReservations();
      const remoteVehicles = await supabaseService.getVehicles();

      localStorage.setItem('calendrcar-reservations', JSON.stringify(remoteReservations));
      localStorage.setItem('calendrcar-vehicles', JSON.stringify(remoteVehicles));
      localStorage.setItem(this.lastSyncKey, new Date().toISOString());

      return { 
        success: true, 
        message: `Auto-download: ${remoteReservations.length} réservations, ${remoteVehicles.length} véhicules` 
      };
    } catch (error) {
      return { 
        success: false, 
        message: `Erreur auto-download: ${error}` 
      };
    }
  }

  // ==================== MANUAL SYNC FUNCTIONS (EXISTING) ====================

  // Obtenir le statut de synchronisation
  async getSyncStatus(): Promise<SyncStatus> {
    try {
      if (!supabaseService.isSupabaseEnabled()) {
        return {
          localReservations: 0,
          remoteReservations: 0,
          localVehicles: 0,
          remoteVehicles: 0,
          needsSync: false,
          lastSync: null
        };
      }

      // Données locales
      const localReservations = this.getLocalReservations();
      const localVehicles = this.getLocalVehicles();

      // Données distantes
      const remoteReservations = await supabaseService.getReservations();
      const remoteVehicles = await supabaseService.getVehicles();

      // Dernière synchronisation
      const lastSyncStr = localStorage.getItem(this.lastSyncKey);
      const lastSync = lastSyncStr ? new Date(lastSyncStr) : null;

      // Déterminer si une sync est nécessaire
      const needsSync = this.detectChanges(
        localReservations, localVehicles,
        remoteReservations, remoteVehicles,
        lastSync
      );

      return {
        localReservations: localReservations.length,
        remoteReservations: remoteReservations.length,
        localVehicles: localVehicles.length,
        remoteVehicles: remoteVehicles.length,
        needsSync,
        lastSync
      };
    } catch (error) {
      console.error('Erreur statut sync:', error);
      return {
        localReservations: 0,
        remoteReservations: 0,
        localVehicles: 0,
        remoteVehicles: 0,
        needsSync: false,
        lastSync: null
      };
    }
  }

  // Aperçu de la synchronisation
  async getSyncPreview(): Promise<SyncPreview> {
    try {
      const localReservations = this.getLocalReservations();
      const localVehicles = this.getLocalVehicles();
      
      const remoteReservations = await supabaseService.getReservations();
      const remoteVehicles = await supabaseService.getVehicles();

      // Pour simplifier, on considère que local = source de vérité
      // En cas de conflit, on privilégie les données locales
      return {
        toUpload: {
          reservations: localReservations,
          vehicles: localVehicles
        },
        toDownload: {
          reservations: [], // On ne télécharge pas pour éviter les conflits
          vehicles: []
        },
        conflicts: {
          reservations: [],
          vehicles: []
        }
      };
    } catch (error) {
      console.error('Erreur aperçu sync:', error);
      return {
        toUpload: { reservations: [], vehicles: [] },
        toDownload: { reservations: [], vehicles: [] },
        conflicts: { reservations: [], vehicles: [] }
      };
    }
  }

  // Synchronisation manuelle
  async performSync(): Promise<{ success: boolean; message: string }> {
    try {
      if (!supabaseService.isSupabaseEnabled()) {
        return { success: false, message: 'Supabase non disponible' };
      }

      const localReservations = this.getLocalReservations();
      const localVehicles = this.getLocalVehicles();

      // Upload vers Supabase
      await supabaseService.saveReservations(localReservations);
      await supabaseService.saveVehicles(localVehicles);

      // Marquer la synchronisation
      localStorage.setItem(this.lastSyncKey, new Date().toISOString());

      return { 
        success: true, 
        message: `Synchronisé: ${localReservations.length} réservations, ${localVehicles.length} véhicules` 
      };
    } catch (error) {
      console.error('Erreur synchronisation:', error);
      return { 
        success: false, 
        message: `Erreur de synchronisation: ${error}` 
      };
    }
  }

  // Forcer un download depuis Supabase (avec confirmation)
  async forceDownload(): Promise<{ success: boolean; message: string }> {
    try {
      if (!supabaseService.isSupabaseEnabled()) {
        return { success: false, message: 'Supabase non disponible' };
      }

      const remoteReservations = await supabaseService.getReservations();
      const remoteVehicles = await supabaseService.getVehicles();

      // Sauvegarder en localStorage
      localStorage.setItem('calendrcar-reservations', JSON.stringify(remoteReservations));
      localStorage.setItem('calendrcar-vehicles', JSON.stringify(remoteVehicles));

      // Marquer la synchronisation
      localStorage.setItem(this.lastSyncKey, new Date().toISOString());

      return { 
        success: true, 
        message: `Téléchargé: ${remoteReservations.length} réservations, ${remoteVehicles.length} véhicules` 
      };
    } catch (error) {
      console.error('Erreur download:', error);
      return { 
        success: false, 
        message: `Erreur de téléchargement: ${error}` 
      };
    }
  }

  // ==================== UTILITAIRES PRIVÉS ====================

  private getLocalReservations(): any[] {
    try {
      const stored = localStorage.getItem('calendrcar-reservations');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  private getLocalVehicles(): any[] {
    try {
      const stored = localStorage.getItem('calendrcar-vehicles');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  private detectChanges(
    localReservations: any[], localVehicles: any[],
    remoteReservations: any[], remoteVehicles: any[],
    lastSync: Date | null
  ): boolean {
    // Si pas de dernière sync, considérer qu'il faut synchroniser
    if (!lastSync) return true;

    // Comparer les longueurs (méthode simple)
    return localReservations.length !== remoteReservations.length ||
           localVehicles.length !== remoteVehicles.length;
  }
}

// Instance singleton
export const syncService = new SyncService();
export default syncService; 