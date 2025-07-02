const https = require('https');

// Configuration Supabase
const SUPABASE_URL = 'https://zrcmjmbkehiyspmqalzk.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpyY21qbWJrZWhpeXNwbXFhbHprIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE0MTU4MTksImV4cCI6MjA2Njk5MTgxOX0.t_HWBYsUK-qJrU-GjQ314Irr1DsiArbci0i7xXen9DM';

// Données des véhicules
const vehicles = [
  { id: 'hyundai-i30', name: 'Hyundai i30 Berline', plate: 'CAR-001', type: 'Berline', status: 'available', color: '#3B82F6', icon: '🚗' },
  { id: 'toyota-yaris', name: 'Toyota Yaris Citadine', plate: 'CAR-002', type: 'Citadine', status: 'available', color: '#10B981', icon: '🚙' },
  { id: 'peugeot-3008', name: 'Peugeot 3008 SUV', plate: 'CAR-003', type: 'SUV', status: 'available', color: '#F59E0B', icon: '🚐' },
  { id: 'renault-clio', name: 'Renault Clio Compacte', plate: 'CAR-004', type: 'Compacte', status: 'available', color: '#EF4444', icon: '🚗' },
  { id: 'volkswagen-golf', name: 'Volkswagen Golf Break', plate: 'CAR-005', type: 'Break', status: 'available', color: '#8B5CF6', icon: '🚙' },
  { id: 'nissan-qashqai', name: 'Nissan Qashqai SUV', plate: 'CAR-006', type: 'SUV', status: 'available', color: '#06B6D4', icon: '🚐' },
  { id: 'ford-fiesta', name: 'Ford Fiesta Citadine', plate: 'CAR-007', type: 'Citadine', status: 'available', color: '#F97316', icon: '🚗' },
  { id: 'mercedes-a-class', name: 'Mercedes Classe A Premium', plate: 'CAR-008', type: 'Premium', status: 'available', color: '#1F2937', icon: '✨' },
  { id: 'bmw-serie-3', name: 'BMW Série 3 Berline', plate: 'CAR-009', type: 'Berline', status: 'available', color: '#374151', icon: '🏎️' },
  { id: 'audi-a4', name: 'Audi A4 Premium', plate: 'CAR-010', type: 'Premium', status: 'available', color: '#111827', icon: '✨' },
  { id: 'opel-corsa', name: 'Opel Corsa Électrique', plate: 'CAR-011', type: 'Électrique', status: 'available', color: '#22C55E', icon: '⚡' },
  { id: 'tesla-model-3', name: 'Tesla Model 3 Électrique', plate: 'CAR-012', type: 'Électrique', status: 'available', color: '#DC2626', icon: '⚡' },
  { id: 'citroen-c3', name: 'Citroën C3 Aircross', plate: 'CAR-013', type: 'SUV', status: 'available', color: '#7C3AED', icon: '🚐' }
];

// Réservations d'exemple
const reservations = [
  {
    id: 'demo-reservation-1',
    title: 'Location Weekend',
    client: 'Jean Dupont',
    phone: '40.50.60.70',
    vehicleid: 'hyundai-i30',
    starttime: '2024-12-22T10:00:00+11:00',
    endtime: '2024-12-24T18:00:00+11:00',
    status: 'confirmed',
    notes: 'Client régulier',
    amount: 15000
  },
  {
    id: 'demo-reservation-2',
    title: 'Sortie Famille',
    client: 'Marie Martin',
    phone: '40.55.65.75',
    vehicleid: 'peugeot-3008',
    starttime: '2024-12-23T14:00:00+11:00',
    endtime: '2024-12-23T20:00:00+11:00',
    status: 'confirmed',
    notes: 'Siège bébé requis',
    amount: 8000
  },
  {
    id: 'demo-reservation-3',
    title: 'Déplacement Pro',
    client: 'Pierre Durand',
    phone: '40.60.70.80',
    vehicleid: 'mercedes-a-class',
    starttime: '2024-12-25T09:00:00+11:00',
    endtime: '2024-12-25T17:00:00+11:00',
    status: 'pending',
    notes: 'Vérifier permis',
    amount: 12000
  }
];

// Fonction pour faire des requêtes HTTPS
function makeRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'zrcmjmbkehiyspmqalzk.supabase.co',
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Prefer': 'return=minimal'
      }
    };

    if (data) {
      const jsonData = JSON.stringify(data);
      options.headers['Content-Length'] = Buffer.byteLength(jsonData);
    }

    const req = https.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve({
            statusCode: res.statusCode,
            data: responseData ? JSON.parse(responseData) : null
          });
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${responseData}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

// Fonction principale d'initialisation
async function initializeSupabase() {
  console.log('🚀 Initialisation automatique de Supabase CalendrCar...\n');

  try {
    // 1. Supprimer les données existantes
    console.log('🗑️ Suppression des données existantes...');
    
    try {
      await makeRequest('DELETE', '/rest/v1/reservations?id=neq.empty');
      console.log('   ✅ Réservations supprimées');
    } catch (error) {
      console.log('   ⚠️ Pas de réservations à supprimer');
    }
    
    try {
      await makeRequest('DELETE', '/rest/v1/vehicles?id=neq.empty');
      console.log('   ✅ Véhicules supprimés');
    } catch (error) {
      console.log('   ⚠️ Pas de véhicules à supprimer');
    }

    // 2. Insérer les véhicules
    console.log('\n🚗 Insertion des 13 véhicules...');
    await makeRequest('POST', '/rest/v1/vehicles', vehicles);
    console.log('   ✅ 13 véhicules insérés avec succès');

    // 3. Insérer les réservations d'exemple
    console.log('\n📅 Insertion des réservations d\'exemple...');
    await makeRequest('POST', '/rest/v1/reservations', reservations);
    console.log('   ✅ 3 réservations d\'exemple insérées');

    // 4. Vérification
    console.log('\n🔍 Vérification des données...');
    const vehicleCount = await makeRequest('GET', '/rest/v1/vehicles?select=count');
    const reservationCount = await makeRequest('GET', '/rest/v1/reservations?select=count');
    
    console.log(`   📊 Véhicules dans la base: ${vehicleCount.data.length || 'N/A'}`);
    console.log(`   📊 Réservations dans la base: ${reservationCount.data.length || 'N/A'}`);

    console.log('\n🎉 Initialisation terminée avec succès !');
    console.log('\n📱 Vous pouvez maintenant:');
    console.log('   • Tester l\'app sur http://localhost:3000');
    console.log('   • Vous connecter avec admin / calendrcar2024');
    console.log('   • Vérifier la synchronisation PC ↔ Mobile');

  } catch (error) {
    console.error('\n❌ Erreur lors de l\'initialisation:', error.message);
    
    if (error.message.includes('authorization')) {
      console.log('\n💡 Suggestions:');
      console.log('   • Vérifiez que RLS est désactivé sur les tables');
      console.log('   • Exécutez le script supabase-fix-auth.sql');
      console.log('   • Vérifiez les permissions de la clé API');
    }
  }
}

// Lancer l'initialisation
initializeSupabase(); 