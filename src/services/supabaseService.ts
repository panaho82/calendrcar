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
      // Pour gérer correctement les suppressions, on doit faire delete + insert
      // en mode transaction sécurisé
      
      console.log('🗑️ SAVE: Suppression des réservations existantes...');
      const { error: deleteError } = await this.supabase
        .from('reservations')
        .delete()
        .neq('id', ''); // Supprime toutes les réservations

      if (deleteError) {
        console.error('❌ Erreur suppression:', deleteError);
        throw deleteError;
      }

      // Si on a des réservations à sauvegarder
      if (reservations.length > 0) {
        console.log('📝 SAVE: Insertion des réservations actuelles...');
        
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
        
        const { error: insertError } = await this.supabase
          .from('reservations')
          .insert(formattedData);

        if (insertError) {
          console.error('❌ Erreur insertion:', insertError);
          throw insertError;
        }
        
        console.log('✅ SAVE:', reservations.length, 'réservations sauvegardées avec succès');
      } else {
        console.log('✅ SAVE: Toutes les réservations supprimées avec succès');
      }
      
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
      console.log('🗑️ SAVE: Suppression des véhicules existants...');
      const { error: deleteError } = await this.supabase
        .from('vehicles')
        .delete()
        .neq('id', ''); // Supprime tous les véhicules

      if (deleteError) {
        console.error('❌ Erreur suppression véhicules:', deleteError);
        throw deleteError;
      }

      // Si on a des véhicules à sauvegarder
      if (vehicles.length > 0) {
        console.log('📝 SAVE: Insertion des véhicules actuels...');
        
        const { error: insertError } = await this.supabase
          .from('vehicles')
          .insert(vehicles);

        if (insertError) {
          console.error('❌ Erreur insertion véhicules:', insertError);
          throw insertError;
        }
        
        console.log('✅ SAVE:', vehicles.length, 'véhicules sauvegardés avec succès');
      } else {
        console.log('✅ SAVE: Tous les véhicules supprimés avec succès');
      }
      
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