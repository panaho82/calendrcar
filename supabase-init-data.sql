-- Script d'initialisation des données par défaut CalendrCar
-- À exécuter après avoir créé les tables avec supabase-lowercase-schema.sql

BEGIN;

-- Supprimer les données existantes
DELETE FROM reservations;
DELETE FROM vehicles;

-- Insérer les 13 véhicules pré-configurés
INSERT INTO vehicles (id, name, plate, type, status, color, icon) VALUES
('hyundai-i30', 'Hyundai i30 Berline', 'CAR-001', 'Berline', 'available', '#3B82F6', '🚗'),
('toyota-yaris', 'Toyota Yaris Citadine', 'CAR-002', 'Citadine', 'available', '#10B981', '🚙'),
('peugeot-3008', 'Peugeot 3008 SUV', 'CAR-003', 'SUV', 'available', '#F59E0B', '🚐'),
('renault-clio', 'Renault Clio Compacte', 'CAR-004', 'Compacte', 'available', '#EF4444', '🚗'),
('volkswagen-golf', 'Volkswagen Golf Break', 'CAR-005', 'Break', 'available', '#8B5CF6', '🚙'),
('nissan-qashqai', 'Nissan Qashqai SUV', 'CAR-006', 'SUV', 'available', '#06B6D4', '🚐'),
('ford-fiesta', 'Ford Fiesta Citadine', 'CAR-007', 'Citadine', 'available', '#F97316', '🚗'),
('mercedes-a-class', 'Mercedes Classe A Premium', 'CAR-008', 'Premium', 'available', '#1F2937', '✨'),
('bmw-serie-3', 'BMW Série 3 Berline', 'CAR-009', 'Berline', 'available', '#374151', '🏎️'),
('audi-a4', 'Audi A4 Premium', 'CAR-010', 'Premium', 'available', '#111827', '✨'),
('opel-corsa', 'Opel Corsa Électrique', 'CAR-011', 'Électrique', 'available', '#22C55E', '⚡'),
('tesla-model-3', 'Tesla Model 3 Électrique', 'CAR-012', 'Électrique', 'available', '#DC2626', '⚡'),
('citroen-c3', 'Citroën C3 Aircross', 'CAR-013', 'SUV', 'available', '#7C3AED', '🚐');

-- Insérer quelques réservations d'exemple pour démonstration
INSERT INTO reservations (id, title, client, phone, vehicleid, starttime, endtime, status, notes, amount) VALUES
('demo-reservation-1', 'Location Weekend', 'Jean Dupont', '40.50.60.70', 'hyundai-i30', '2024-12-22 10:00:00+11', '2024-12-24 18:00:00+11', 'confirmed', 'Client régulier', 15000),
('demo-reservation-2', 'Sortie Famille', 'Marie Martin', '40.55.65.75', 'peugeot-3008', '2024-12-23 14:00:00+11', '2024-12-23 20:00:00+11', 'confirmed', 'Siège bébé requis', 8000),
('demo-reservation-3', 'Déplacement Pro', 'Pierre Durand', '40.60.70.80', 'mercedes-a-class', '2024-12-25 09:00:00+11', '2024-12-25 17:00:00+11', 'pending', 'Vérifier permis', 12000);

COMMIT;

SELECT 
  'Données initialisées avec succès' as status,
  (SELECT COUNT(*) FROM vehicles) as vehicles_count,
  (SELECT COUNT(*) FROM reservations) as reservations_count; 