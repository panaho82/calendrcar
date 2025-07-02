-- Script SQL corrigé pour Supabase CalendrCar
-- À exécuter dans l'éditeur SQL de Supabase

-- 1. Créer la table des véhicules
CREATE TABLE IF NOT EXISTS vehicles (
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

-- 2. Créer la table des réservations
CREATE TABLE IF NOT EXISTS reservations (
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

-- 3. Créer les index
CREATE INDEX IF NOT EXISTS idx_reservations_vehicle ON reservations(vehicleId);
CREATE INDEX IF NOT EXISTS idx_reservations_dates ON reservations(startTime, endTime);

-- 4. Activer RLS (Row Level Security)
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;

-- 5. Supprimer les politiques existantes si elles existent
DROP POLICY IF EXISTS "Permettre tout pour vehicles" ON vehicles;
DROP POLICY IF EXISTS "Permettre tout pour reservations" ON reservations;

-- 6. Créer les nouvelles politiques d'accès
CREATE POLICY "Permettre tout pour vehicles" ON vehicles FOR ALL USING (true);
CREATE POLICY "Permettre tout pour reservations" ON reservations FOR ALL USING (true);

-- 7. Insérer des véhicules de test (optionnel)
INSERT INTO vehicles (id, name, plate, type, status, color, icon) VALUES
('peugeot-208-1', 'Peugeot 208 Allure', '9876 RB', 'car', 'available', '#3b82f6', '🚗'),
('mitsubishi-space', 'Mitsubishi Space Star', '8765 RB', 'car', 'available', '#10b981', '🚗'),
('kia-picanto', 'Kia Picanto', '7654 RB', 'car', 'available', '#ef4444', '🚗')
ON CONFLICT (id) DO NOTHING;

-- 8. Vérification finale
SELECT 'Tables créées avec succès !' as status;
SELECT 'Véhicules disponibles:' as info, count(*) as nombre FROM vehicles;
SELECT 'Réservations existantes:' as info, count(*) as nombre FROM reservations; 