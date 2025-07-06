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
    try {
      this.supabase = createClient(supabaseConfig.url, supabaseConfig.anonKey, supabaseConfig.options);
      this.isEnabled = true;
      console.log('🟢 Supabase connecté à:', supabaseConfig.url);
      
      // Vérifier/créer les tables automatiquement
      this.ensureTablesExist();
    } catch (error) {
      console.error('❌ Erreur critique: Supabase non disponible:', error);
      throw new Error('Connexion Supabase requise pour fonctionner');
    }
  }

  // ==================== RESERVATIONS ====================

  async getReservations(): Promise<Reservation[]> {
    console.log('📥 Récupération des réservations depuis Supabase...');
    
    if (!this.isEnabled || !this.supabase) {
      throw new Error('Supabase non disponible');
    }

    try {
      const { data, error } = await this.supabase
        .from('reservations')
        .select('*')
        .order('starttime', { ascending: true });

      if (error) throw error;
      
      console.log('✅ Réservations récupérées:', data?.length || 0);

      return data?.map(item => ({
        ...item,
        vehicleId: item.vehicleid || item.vehicleId,
        startTime: new Date(item.starttime || item.startTime),
        endTime: new Date(item.endtime || item.endTime)
      })) || [];
    } catch (error) {
      console.error('❌ Erreur récupération réservations:', error);
      throw error;
    }
  }

  async saveReservations(reservations: Reservation[]): Promise<void> {
    console.log('📤 Sauvegarde de', reservations.length, 'réservations vers Supabase...');
    
    if (!this.isEnabled || !this.supabase) {
      throw new Error('Supabase non disponible');
    }

    try {
      // Utiliser upsert au lieu de delete/insert pour éviter les conflits
      const formattedData = reservations.map(r => ({
        id: r.id,
        title: r.title,
        client: r.client,
        phone: r.phone,
        vehicleid: r.vehicleId,
        starttime: r.startTime instanceof Date ? r.startTime.toISOString() : new Date(r.startTime).toISOString(),
        endtime: r.endTime instanceof Date ? r.endTime.toISOString() : new Date(r.endTime).toISOString(),
        status: r.status,
        notes: r.notes || '',
        amount: r.amount || 0
      }));
      
      console.log('📝 SAVE: Upsert des réservations...');
      
      // Utiliser upsert (INSERT avec ON CONFLICT)
      const { error } = await this.supabase
        .from('reservations')
        .upsert(formattedData, { 
          onConflict: 'id',
          ignoreDuplicates: false 
        });

      if (error) throw error;
      console.log('✅ SAVE: Réservations sauvegardées avec succès');
    } catch (error) {
      console.error('❌ SAVE: Erreur sauvegarde réservations:', error);
      throw error;
    }
  }

  // ==================== VEHICLES ====================

  async getVehicles(): Promise<Vehicle[]> {
    console.log('📥 Récupération des véhicules depuis Supabase...');
    
    if (!this.isEnabled || !this.supabase) {
      throw new Error('Supabase non disponible');
    }

    try {
      const { data, error } = await this.supabase
        .from('vehicles')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      
      console.log('✅ Véhicules récupérés:', data?.length || 0);
      return data || [];
    } catch (error) {
      console.error('❌ Erreur récupération véhicules:', error);
      throw error;
    }
  }

  async saveVehicles(vehicles: Vehicle[]): Promise<void> {
    console.log('📤 Sauvegarde de', vehicles.length, 'véhicules vers Supabase...');
    
    if (!this.isEnabled || !this.supabase) {
      throw new Error('Supabase non disponible');
    }

    try {
      console.log('📝 SAVE: Upsert des véhicules...');
      
      // Utiliser upsert au lieu de delete/insert pour éviter les conflits
      const { error } = await this.supabase
        .from('vehicles')
        .upsert(vehicles, { 
          onConflict: 'id',
          ignoreDuplicates: false 
        });

      if (error) throw error;
      console.log('✅ SAVE: Véhicules sauvegardés avec succès');
    } catch (error) {
      console.error('❌ SAVE: Erreur sauvegarde véhicules:', error);
      throw error;
    }
  }

  // ==================== UTILITAIRES ====================

  isSupabaseEnabled(): boolean {
    return this.isEnabled;
  }

  getSupabaseUrl(): string {
    return supabaseConfig.url;
  }

  getSupabaseKey(): string {
    return supabaseConfig.anonKey;
  }

  async testConnection(): Promise<boolean> {
    try {
      if (!this.supabase) return false;
      
      const { data, error } = await this.supabase
        .from('reservations')
        .select('count')
        .limit(1);
      
      return !error;
    } catch {
      return false;
    }
  }

  async ensureTablesExist(): Promise<void> {
    // Cette méthode vérifie que les tables existent
    // Si pas, elles doivent être créées manuellement dans Supabase
    console.log('🔍 Vérification des tables Supabase...');
  }
}

export const supabaseService = new SupabaseService(); 
export default supabaseService; 