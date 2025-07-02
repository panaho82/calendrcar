-- Script SQL avec colonnes en minuscules (compatibilité Supabase)
-- À exécuter dans l'éditeur SQL Supabase

-- Supprimer les tables existantes
DROP TABLE IF EXISTS reservations CASCADE;
DROP TABLE IF EXISTS vehicles CASCADE;

-- Créer la table vehicles avec colonnes compatibles
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

-- Créer la table reservations avec colonnes en minuscules
CREATE TABLE reservations (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  client TEXT NOT NULL,
  phone TEXT NOT NULL,
  vehicleid TEXT NOT NULL,
  starttime TIMESTAMPTZ NOT NULL,
  endtime TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('confirmed', 'pending', 'cancelled')),
  notes TEXT,
  amount NUMERIC,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Créer les index
CREATE INDEX idx_reservations_vehicle ON reservations(vehicleid);
CREATE INDEX idx_reservations_dates ON reservations(starttime, endtime);
CREATE INDEX idx_reservations_status ON reservations(status);
CREATE INDEX idx_vehicles_status ON vehicles(status);

-- Activer RLS
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;

-- Créer des politiques permissives
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

-- Permissions explicites
GRANT ALL ON vehicles TO anon;
GRANT ALL ON reservations TO anon;
GRANT ALL ON vehicles TO authenticated;
GRANT ALL ON reservations TO authenticated;

-- Test d'insertion
INSERT INTO vehicles (id, name, plate, type, status, color, icon) 
VALUES ('test-lowercase', 'Test Vehicle', 'TEST-001', 'car', 'available', '#3b82f6', '🚗');

INSERT INTO reservations (id, title, client, phone, vehicleid, starttime, endtime, status, notes, amount)
VALUES (
    'test-reservation-lowercase',
    'Test Reservation',
    'Test Client', 
    '0123456789',
    'test-lowercase',
    NOW(),
    NOW() + INTERVAL '1 day',
    'confirmed',
    'Test avec colonnes minuscules',
    50.00
);

-- Vérifier que les insertions fonctionnent
SELECT 'TEST: Véhicules créés' as test, count(*) as nombre FROM vehicles;
SELECT 'TEST: Réservations créées' as test, count(*) as nombre FROM reservations;

-- Test de lecture avec les nouvelles colonnes
SELECT id, title, client, vehicleid, starttime, endtime, status FROM reservations;

-- Nettoyer les données de test
DELETE FROM reservations WHERE id = 'test-reservation-lowercase';
DELETE FROM vehicles WHERE id = 'test-lowercase';

-- Vérification finale de la structure
SELECT 
    'STRUCTURE FINALE' as info,
    table_name, 
    column_name, 
    data_type
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name IN ('vehicles', 'reservations')
ORDER BY table_name, ordinal_position;

SELECT '✅ Tables créées avec colonnes minuscules compatibles !' as status; 