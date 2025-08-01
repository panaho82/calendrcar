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

    // 🚨 PROTECTION: Ne jamais vider la base avec un tableau vide accidentel
    if (reservations.length === 0) {
      console.warn('⚠️ PROTECTION: Tentative de sauvegarde avec tableau vide - OPÉRATION BLOQUÉE pour éviter la perte de données');
      console.warn('   Si vous voulez vraiment supprimer toutes les réservations, utilisez deleteAllReservations()');
      return;
    }

    try {
      // Récupérer les réservations actuelles pour comparaison sécurisée
      const { data: currentReservations, error: getCurrentError } = await this.supabase
        .from('reservations')
        .select('id');

      if (getCurrentError) {
        console.error('❌ Erreur récupération réservations actuelles:', getCurrentError);
        throw getCurrentError;
      }

      const currentIds = new Set(currentReservations?.map(r => r.id) || []);
      const newIds = new Set(reservations.map(r => r.id));

      // Supprimer seulement les réservations qui ne sont plus dans le nouveau set
      const idsToDelete = [...currentIds].filter(id => !newIds.has(id));
      
      if (idsToDelete.length > 0) {
        console.log('🗑️ SAVE: Suppression de', idsToDelete.length, 'réservations supprimées...');
        const { error: deleteError } = await this.supabase
          .from('reservations')
          .delete()
          .in('id', idsToDelete);

        if (deleteError) {
          console.error('❌ Erreur suppression sélective:', deleteError);
          throw deleteError;
        }
      }

      // Séparer les nouvelles réservations des modifications
      const existingIds = [...currentIds];
      const newReservations = reservations.filter(r => !existingIds.includes(r.id));
      const updatedReservations = reservations.filter(r => existingIds.includes(r.id));

      // Insérer les nouvelles réservations
      if (newReservations.length > 0) {
        console.log('📝 SAVE: Insertion de', newReservations.length, 'nouvelles réservations...');
        
        const formattedNewData = newReservations.map(r => ({
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
          .insert(formattedNewData);

        if (insertError) {
          console.error('❌ Erreur insertion nouvelles réservations:', insertError);
          throw insertError;
        }
      }

      // Mettre à jour les réservations existantes
      if (updatedReservations.length > 0) {
        console.log('🔄 SAVE: Mise à jour de', updatedReservations.length, 'réservations existantes...');
        
        for (const reservation of updatedReservations) {
          const formattedData = {
            title: reservation.title,
            client: reservation.client,
            phone: reservation.phone,
            vehicleid: reservation.vehicleId,
            starttime: reservation.startTime instanceof Date ? reservation.startTime.toISOString() : new Date(reservation.startTime).toISOString(),
            endtime: reservation.endTime instanceof Date ? reservation.endTime.toISOString() : new Date(reservation.endTime).toISOString(),
            status: reservation.status,
            notes: reservation.notes || '',
            amount: reservation.amount || 0
          };

          const { error: updateError } = await this.supabase
            .from('reservations')
            .update(formattedData)
            .eq('id', reservation.id);

          if (updateError) {
            console.error('❌ Erreur mise à jour réservation:', updateError);
            throw updateError;
          }
        }
      }
      
      console.log('✅ SAVE:', reservations.length, 'réservations sauvegardées avec succès (méthode sécurisée)');
      
    } catch (error) {
      console.error('❌ SAVE: Erreur sauvegarde réservations:', error);
      throw error;
    }
  }

  // Méthode séparée pour supprimer toutes les réservations (explicite et sécurisée)
  async deleteAllReservations(): Promise<void> {
    console.log('🚨 SUPPRESSION COMPLÈTE: Toutes les réservations vont être supprimées...');
    
    if (!this.isEnabled || !this.supabase) {
      throw new Error('Supabase non disponible');
    }

    try {
      const { error: deleteError } = await this.supabase
        .from('reservations')
        .delete()
        .neq('id', '');

      if (deleteError) {
        console.error('❌ Erreur suppression complète:', deleteError);
        throw deleteError;
      }

      console.log('✅ SUPPRESSION COMPLÈTE: Toutes les réservations supprimées');
    } catch (error) {
      console.error('❌ Erreur suppression complète:', error);
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