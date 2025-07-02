-- Script de correction des problèmes d'authentification CalendrCar
-- À exécuter dans l'éditeur SQL de Supabase

-- Étape 1: Vérifier et désactiver RLS temporairement pour permettre l'accès anonyme
BEGIN;

-- Désactiver RLS sur la table vehicles
ALTER TABLE vehicles DISABLE ROW LEVEL SECURITY;

-- Désactiver RLS sur la table reservations
ALTER TABLE reservations DISABLE ROW LEVEL SECURITY;

-- Ou alternative: créer des politiques qui permettent l'accès anonyme
-- Si vous préférez garder RLS activé, décommentez les lignes suivantes:

/*
-- Politiques pour la table vehicles
DROP POLICY IF EXISTS "Allow anonymous read on vehicles" ON vehicles;
CREATE POLICY "Allow anonymous read on vehicles" ON vehicles
  FOR SELECT TO anon
  USING (true);

DROP POLICY IF EXISTS "Allow anonymous write on vehicles" ON vehicles;
CREATE POLICY "Allow anonymous write on vehicles" ON vehicles
  FOR ALL TO anon
  USING (true)
  WITH CHECK (true);

-- Politiques pour la table reservations
DROP POLICY IF EXISTS "Allow anonymous read on reservations" ON reservations;
CREATE POLICY "Allow anonymous read on reservations" ON reservations
  FOR SELECT TO anon
  USING (true);

DROP POLICY IF EXISTS "Allow anonymous write on reservations" ON reservations;
CREATE POLICY "Allow anonymous write on reservations" ON reservations
  FOR ALL TO anon
  USING (true)
  WITH CHECK (true);

-- Réactiver RLS avec les nouvelles politiques
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;
*/

-- Étape 2: Vérifier les permissions
GRANT USAGE ON SCHEMA public TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON vehicles TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON reservations TO anon;

-- Étape 3: Test de connexion
SELECT 'Test vehicles' as test, COUNT(*) as count FROM vehicles;
SELECT 'Test reservations' as test, COUNT(*) as count FROM reservations;

COMMIT;

SELECT '🎉 Correction des permissions terminée - RLS désactivé pour l\'accès anonyme' as status; 