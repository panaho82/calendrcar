-- Script de DIAGNOSTIC et RÉPARATION Supabase CalendrCar
-- À exécuter dans l'éditeur SQL de Supabase

-- ===== ÉTAPE 1: DIAGNOSTIC COMPLET =====

-- Vérifier les tables existantes
SELECT 
    table_name, 
    table_type 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('vehicles', 'reservations');

-- Vérifier la structure des colonnes
SELECT 
    table_name, 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name IN ('vehicles', 'reservations')
ORDER BY table_name, ordinal_position;

-- Vérifier les politiques RLS
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename IN ('vehicles', 'reservations');

-- ===== ÉTAPE 2: SUPPRESSION COMPLÈTE (si nécessaire) =====

-- Supprimer toutes les politiques existantes
DROP POLICY IF EXISTS "Permettre tout pour vehicles" ON vehicles;
DROP POLICY IF EXISTS "Permettre tout pour reservations" ON reservations;

-- Supprimer les tables si elles existent (pour repartir à zéro)
DROP TABLE IF EXISTS reservations CASCADE;
DROP TABLE IF EXISTS vehicles CASCADE;

-- ===== ÉTAPE 3: RECRÉATION COMPLÈTE =====

-- Créer la table vehicles
CREATE TABLE vehicles (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  plate TEXT NOT NULL,
  type TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('available', 'occupied', 'maintenance')),
  color TEXT NOT NULL,
  icon TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Créer la table reservations  
CREATE TABLE reservations (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  client TEXT NOT NULL,
  phone TEXT NOT NULL,
  vehicleId TEXT NOT NULL,
  startTime TIMESTAMPTZ NOT NULL,
  endTime TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('confirmed', 'pending', 'cancelled')),
  notes TEXT,
  amount NUMERIC,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Créer les index
CREATE INDEX idx_reservations_vehicle ON reservations(vehicleId);
CREATE INDEX idx_reservations_dates ON reservations(startTime, endTime);
CREATE INDEX idx_reservations_status ON reservations(status);
CREATE INDEX idx_vehicles_status ON vehicles(status);

-- ===== ÉTAPE 4: CONFIGURATION RLS PERMISSIVE =====

-- Activer RLS
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;

-- Créer des politiques très permissives pour TOUT autoriser
CREATE POLICY "allow_all_vehicles" 
ON vehicles 
FOR ALL 
TO public 
USING (true) 
WITH CHECK (true);

CREATE POLICY "allow_all_reservations" 
ON reservations 
FOR ALL 
TO public 
USING (true) 
WITH CHECK (true);

-- ===== ÉTAPE 5: PERMISSIONS EXPLICITES =====

-- Donner toutes les permissions à l'utilisateur anonyme
GRANT ALL ON vehicles TO anon;
GRANT ALL ON reservations TO anon;
GRANT ALL ON vehicles TO authenticated;
GRANT ALL ON reservations TO authenticated;

-- Permissions sur les séquences (si elles existent)
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- ===== ÉTAPE 6: TEST DE FONCTIONNEMENT =====

-- Test d'insertion
INSERT INTO vehicles (id, name, plate, type, status, color, icon) 
VALUES ('test-vehicle-diagnostic', 'Test Vehicle', 'TEST-001', 'car', 'available', '#3b82f6', '🚗');

INSERT INTO reservations (id, title, client, phone, vehicleId, startTime, endTime, status, notes, amount)
VALUES (
    'test-reservation-diagnostic',
    'Test Reservation',
    'Test Client', 
    '0123456789',
    'test-vehicle-diagnostic',
    NOW(),
    NOW() + INTERVAL '1 day',
    'confirmed',
    'Test diagnostic',
    50.00
);

-- Vérifier que les insertions ont fonctionné
SELECT 'DIAGNOSTIC: Véhicules créés' as test, count(*) as nombre FROM vehicles;
SELECT 'DIAGNOSTIC: Réservations créées' as test, count(*) as nombre FROM reservations;

-- Test de lecture
SELECT 'DIAGNOSTIC: Test lecture véhicules OK' as test FROM vehicles LIMIT 1;
SELECT 'DIAGNOSTIC: Test lecture réservations OK' as test FROM reservations LIMIT 1;

-- Nettoyer les données de test
DELETE FROM reservations WHERE id = 'test-reservation-diagnostic';
DELETE FROM vehicles WHERE id = 'test-vehicle-diagnostic';

-- ===== ÉTAPE 7: VÉRIFICATION FINALE =====

-- Afficher la structure finale
SELECT 
    'STRUCTURE FINALE' as info,
    table_name, 
    column_name, 
    data_type
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name IN ('vehicles', 'reservations')
ORDER BY table_name, ordinal_position;

-- Afficher les politiques finales
SELECT 
    'POLITIQUES FINALES' as info,
    tablename,
    policyname,
    cmd
FROM pg_policies 
WHERE tablename IN ('vehicles', 'reservations');

SELECT '🎉 RÉPARATION TERMINÉE - Tables prêtes pour CalendrCar' as status; 