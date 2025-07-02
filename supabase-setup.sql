-- Script d'initialisation pour MM Location Raiatea
-- À exécuter dans l'éditeur SQL de Supabase

-- Table des véhicules
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

-- Table des réservations
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
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  FOREIGN KEY (vehicleId) REFERENCES vehicles(id) ON DELETE CASCADE
);

-- Index pour optimiser les requêtes
CREATE INDEX IF NOT EXISTS idx_reservations_vehicle ON reservations(vehicleId);
CREATE INDEX IF NOT EXISTS idx_reservations_dates ON reservations(startTime, endTime);
CREATE INDEX IF NOT EXISTS idx_reservations_status ON reservations(status);

-- Politique de sécurité (RLS) - Accès public pour simplicité
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;

-- Permettre toutes les opérations pour les utilisateurs anonymes (pour l'instant)
CREATE POLICY "Permettre tout pour vehicles" ON vehicles FOR ALL USING (true);
CREATE POLICY "Permettre tout pour reservations" ON reservations FOR ALL USING (true);

-- Fonction pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers pour updated_at
CREATE TRIGGER update_vehicles_updated_at BEFORE UPDATE ON vehicles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reservations_updated_at BEFORE UPDATE ON reservations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 