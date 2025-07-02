import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { supabaseConfig } from '../config/supabase.ts';

// Types de données
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

class SupabaseService {
  private supabase: SupabaseClient | null = null;
  private isEnabled = false;

  constructor() {
    // Configuration Supabase
    try {
      this.supabase = createClient(supabaseConfig.url, supabaseConfig.anonKey);
      this.isEnabled = true;
      console.log('🟢 Supabase connecté à:', supabaseConfig.url);
      
      // Vérifier/créer les tables automatiquement
      this.ensureTablesExist();
    } catch (error) {
      console.warn('🟡 Supabase non disponible, utilisation localStorage:', error);
      this.isEnabled = false;
    }
  }

  // ==================== RESERVATIONS ====================

  async getReservations(): Promise<Reservation[]> {
    console.log('📥 GET: Tentative récupération réservations');
    
    if (!this.isEnabled || !this.supabase) {
      console.log('⚠️ GET: Supabase désactivé, lecture localStorage');
      return this.getReservationsFromLocalStorage();
    }

    try {
      console.log('🔍 GET: Requête Supabase...');
      const { data, error } = await this.supabase
        .from('reservations')
        .select('*')
        .order('starttime', { ascending: true });

      if (error) throw error;
      
      console.log('✅ GET: Données Supabase reçues:', data?.length || 0, 'réservations');
      console.log('📋 GET: Détail données:', data);

      return data?.map(item => ({
        ...item,
        vehicleId: item.vehicleid || item.vehicleId,
        startTime: new Date(item.starttime || item.startTime),
        endTime: new Date(item.endtime || item.endTime)
      })) || [];
    } catch (error) {
      console.error('❌ GET: Erreur Supabase, fallback localStorage:', error);
      console.error('❌ GET: Détail erreur:', error);
      console.error('❌ GET: Message:', error.message);
      console.error('❌ GET: Code:', error.code);
      console.error('❌ GET: Details:', error.details);
      console.error('❌ GET: Hint:', error.hint);
      return this.getReservationsFromLocalStorage();
    }
  }

  async saveReservations(reservations: Reservation[]): Promise<void> {
    console.log('📤 SAVE: Tentative sauvegarde', reservations.length, 'réservations');
    
    // Toujours sauvegarder en localStorage (sécurité)
    this.saveReservationsToLocalStorage(reservations);

    if (!this.isEnabled || !this.supabase) {
      console.log('⚠️ SAVE: Supabase désactivé, sauvegarde localStorage uniquement');
      return;
    }

    try {
      console.log('🗑️ SAVE: Suppression réservations existantes...');
      // Supprimer toutes les réservations existantes
      await this.supabase.from('reservations').delete().neq('id', '');

      console.log('📝 SAVE: Insertion nouvelles réservations...');
      // Insérer les nouvelles réservations avec conversion de dates sécurisée
      const formattedData = reservations.map(r => ({
        ...r,
        vehicleid: r.vehicleId,
        starttime: r.startTime instanceof Date ? r.startTime.toISOString() : new Date(r.startTime).toISOString(),
        endtime: r.endTime instanceof Date ? r.endTime.toISOString() : new Date(r.endTime).toISOString()
      }));
      
      console.log('📝 SAVE: Données formatées:', formattedData);
      
      const { error } = await this.supabase
        .from('reservations')
        .insert(formattedData);

      if (error) throw error;
      console.log('✅ SAVE: Réservations synchronisées avec Supabase');
    } catch (error) {
      console.error('❌ SAVE: Erreur synchronisation Supabase:', error);
      console.error('❌ SAVE: Détail erreur:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      });
      // Les données restent en localStorage
    }
  }

  // ==================== VEHICLES ====================

  async getVehicles(): Promise<Vehicle[]> {
    if (!this.isEnabled || !this.supabase) {
      return this.getVehiclesFromLocalStorage();
    }

    try {
      const { data, error } = await this.supabase
        .from('vehicles')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.warn('Erreur Supabase, fallback localStorage:', error);
      return this.getVehiclesFromLocalStorage();
    }
  }

  async saveVehicles(vehicles: Vehicle[]): Promise<void> {
    // Toujours sauvegarder en localStorage (sécurité)
    this.saveVehiclesToLocalStorage(vehicles);

    if (!this.isEnabled || !this.supabase) {
      return;
    }

    try {
      // Supprimer tous les véhicules existants
      await this.supabase.from('vehicles').delete().neq('id', '');

      // Insérer les nouveaux véhicules
      const { error } = await this.supabase
        .from('vehicles')
        .insert(vehicles);

      if (error) throw error;
      console.log('✅ Véhicules synchronisés avec Supabase');
    } catch (error) {
      console.warn('Erreur synchronisation Supabase:', error);
      console.error('❌ VEHICLES: Détail erreur:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      });
      // Les données restent en localStorage
    }
  }

  // ==================== LOCALSTORAGE FALLBACK ====================

  private getReservationsFromLocalStorage(): Reservation[] {
    try {
      const stored = localStorage.getItem('calendrcar-reservations');
      if (!stored) return [];
      
      const parsed = JSON.parse(stored);
      return parsed.map((r: any) => ({
        ...r,
        startTime: new Date(r.startTime),
        endTime: new Date(r.endTime)
      }));
    } catch (error) {
      console.error('Erreur lecture localStorage reservations:', error);
      return [];
    }
  }

  private saveReservationsToLocalStorage(reservations: Reservation[]): void {
    try {
      localStorage.setItem('calendrcar-reservations', JSON.stringify(reservations));
    } catch (error) {
      console.error('Erreur sauvegarde localStorage reservations:', error);
    }
  }

  private getVehiclesFromLocalStorage(): Vehicle[] {
    try {
      const stored = localStorage.getItem('calendrcar-vehicles');
      if (!stored) return [];
      return JSON.parse(stored);
    } catch (error) {
      console.error('Erreur lecture localStorage vehicles:', error);
      return [];
    }
  }

  private saveVehiclesToLocalStorage(vehicles: Vehicle[]): void {
    try {
      localStorage.setItem('calendrcar-vehicles', JSON.stringify(vehicles));
    } catch (error) {
      console.error('Erreur sauvegarde localStorage vehicles:', error);
    }
  }

  // ==================== UTILITAIRES ====================

  isSupabaseEnabled(): boolean {
    return this.isEnabled;
  }

  async testConnection(): Promise<boolean> {
    if (!this.isEnabled || !this.supabase) {
      return false;
    }

    try {
      const { error } = await this.supabase.from('vehicles').select('count').limit(1);
      return !error;
    } catch (error) {
      return false;
    }
  }

  // ==================== AUTO-SETUP ====================

  async ensureTablesExist(): Promise<void> {
    if (!this.isEnabled || !this.supabase) {
      return;
    }

    try {
      console.log('🔧 Vérification/création des tables...');
      
      // Méthode alternative : tester l'existence des tables via des requêtes simples
      // Tester la table vehicles
      const { error: vehiclesError } = await this.supabase
        .from('vehicles')
        .select('id')
        .limit(1);
      
      // Tester la table reservations  
      const { error: reservationsError } = await this.supabase
        .from('reservations')
        .select('id')
        .limit(1);

      if (vehiclesError || reservationsError) {
        console.warn('⚠️ Tables non trouvées ou erreur d\'accès:', {
          vehicles: vehiclesError?.message,
          reservations: reservationsError?.message
        });
        console.warn('📋 Veuillez créer les tables manuellement avec le script fourni dans debug-supabase-tables.html');
      } else {
        console.log('✅ Tables vérifiées - connexion OK');
      }
    } catch (error) {
      console.warn('⚠️ Erreur lors de la vérification des tables:', error);
    }
  }
}

// Instance singleton
export const supabaseService = new SupabaseService();
export default supabaseService; 