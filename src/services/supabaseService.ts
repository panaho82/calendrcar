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
    } catch (error) {
      console.warn('🟡 Supabase non disponible, utilisation localStorage:', error);
      this.isEnabled = false;
    }
  }

  // ==================== RESERVATIONS ====================

  async getReservations(): Promise<Reservation[]> {
    if (!this.isEnabled || !this.supabase) {
      return this.getReservationsFromLocalStorage();
    }

    try {
      const { data, error } = await this.supabase
        .from('reservations')
        .select('*')
        .order('startTime', { ascending: true });

      if (error) throw error;

      return data?.map(item => ({
        ...item,
        startTime: new Date(item.startTime),
        endTime: new Date(item.endTime)
      })) || [];
    } catch (error) {
      console.warn('Erreur Supabase, fallback localStorage:', error);
      return this.getReservationsFromLocalStorage();
    }
  }

  async saveReservations(reservations: Reservation[]): Promise<void> {
    // Toujours sauvegarder en localStorage (sécurité)
    this.saveReservationsToLocalStorage(reservations);

    if (!this.isEnabled || !this.supabase) {
      return;
    }

    try {
      // Supprimer toutes les réservations existantes
      await this.supabase.from('reservations').delete().neq('id', '');

      // Insérer les nouvelles réservations
      const { error } = await this.supabase
        .from('reservations')
        .insert(reservations.map(r => ({
          ...r,
          startTime: r.startTime.toISOString(),
          endTime: r.endTime.toISOString()
        })));

      if (error) throw error;
      console.log('✅ Réservations synchronisées avec Supabase');
    } catch (error) {
      console.warn('Erreur synchronisation Supabase:', error);
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
}

// Instance singleton
export const supabaseService = new SupabaseService();
export default supabaseService; 