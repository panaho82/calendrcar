const https = require('https');

// Configuration Supabase
const SUPABASE_URL = 'https://zrcmjmbkehiyspmqalzk.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpyY21qbWJrZWhpeXNwbXFhbHprIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE0MTU4MTksImV4cCI6MjA2Njk5MTgxOX0.t_HWBYsUK-qJrU-GjQ314Irr1DsiArbci0i7xXen9DM';

// VOS VÉHICULES ORIGINAUX CALENDRCAR 🚗
const originalVehicles = [
  // Peugeot 208 - Même couleur (bleu)
  { id: "1", name: "Peugeot 208", plate: "274-474-P", type: "Citadine", status: "available", color: "#3B82F6", icon: "🚗" },
  { id: "2", name: "Peugeot 208", plate: "274-473-P", type: "Citadine", status: "available", color: "#3B82F6", icon: "🚗" },
  
  // Mitsubishi L200 4x4 - Couleur unique (gris foncé)
  { id: "3", name: "Mitsubishi L200", plate: "292666", type: "4x4", status: "available", color: "#4B5563", icon: "🚙" },
  
  // Mitsubishi Mirage - Couleur unique (rouge)
  { id: "4", name: "Mitsubishi Mirage", plate: "273-663-P", type: "Citadine", status: "available", color: "#EF4444", icon: "🚗" },
  
  // Kia Niro - Couleur unique (vert)
  { id: "5", name: "Kia Niro", plate: "272-696-P", type: "SUV", status: "available", color: "#10B981", icon: "🚙" },
  
  // Kia Picanto - Couleur unique (violet)
  { id: "6", name: "Kia Picanto", plate: "272-695-P", type: "Citadine", status: "available", color: "#8B5CF6", icon: "🚗" },
  
  // Scooters - Même couleur (orange)
  { id: "7", name: "Scooter", plate: "BW-2943", type: "Scooter", status: "available", color: "#F59E0B", icon: "🛵" },
  { id: "8", name: "Scooter", plate: "BW-2945", type: "Scooter", status: "available", color: "#F59E0B", icon: "🛵" },
  { id: "9", name: "Scooter", plate: "BW-2946", type: "Scooter", status: "available", color: "#F59E0B", icon: "🛵" },
  
  // Swift - Même couleur (cyan)
  { id: "10", name: "Swift", plate: "277728", type: "Citadine", status: "available", color: "#06B6D4", icon: "🚗" },
  { id: "11", name: "Swift", plate: "283833", type: "Citadine", status: "available", color: "#06B6D4", icon: "🚗" },
  { id: "12", name: "Swift", plate: "277-842", type: "Citadine", status: "available", color: "#06B6D4", icon: "🚗" },
  
  // Swift automatique - Couleur différente (vert foncé)
  { id: "13", name: "Swift automatique", plate: "277277", type: "Citadine", status: "available", color: "#059669", icon: "🚗" }
];

// Réservations d'exemple CORRIGÉES avec vos vrais véhicules
const originalReservations = [
  {
    id: "demo-1",
    title: "Location Weekend",
    client: "Jean Dupont",
    phone: "87.70.33.38",
    vehicleid: "1", // Peugeot 208
    starttime: "2024-12-22T10:00:00+11:00",
    endtime: "2024-12-24T18:00:00+11:00",
    status: "confirmed",
    notes: "Client régulier",
    amount: 15000
  },
  {
    id: "demo-2", 
    title: "Sortie Famille",
    client: "Marie Martin",
    phone: "87.44.47.70",
    vehicleid: "5", // Kia Niro
    starttime: "2024-12-23T14:00:00+11:00",
    endtime: "2024-12-23T20:00:00+11:00",
    status: "confirmed", 
    notes: "SUV pour la famille",
    amount: 8000
  },
  {
    id: "demo-3",
    title: "Déplacement Pro", 
    client: "Pierre Durand",
    phone: "87.28.40.20",
    vehicleid: "3", // Mitsubishi L200 4x4
    starttime: "2024-12-25T09:00:00+11:00",
    endtime: "2024-12-25T17:00:00+11:00", 
    status: "pending",
    notes: "4x4 pour chantier",
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

// Fonction principale de restauration
async function restoreOriginalVehicles() {
  console.log('🔧 RESTAURATION DE VOS VÉHICULES ORIGINAUX CalendrCar...\n');

  try {
    // 1. Supprimer TOUS les véhicules et réservations existantes
    console.log('🗑️ Suppression des données incorrectes...');
    
    await makeRequest('DELETE', '/rest/v1/reservations?id=neq.empty');
    console.log('   ✅ Toutes les réservations supprimées');
    
    await makeRequest('DELETE', '/rest/v1/vehicles?id=neq.empty');
    console.log('   ✅ Tous les véhicules supprimés');

    // 2. Insérer VOS 13 véhicules originaux
    console.log('\n🚗 Insertion de VOS 13 véhicules CalendrCar...');
    await makeRequest('POST', '/rest/v1/vehicles', originalVehicles);
    console.log('   ✅ VOS véhicules originaux restaurés !');
    
    console.log('\n📋 Liste de vos véhicules:');
    originalVehicles.forEach(v => {
      console.log(`   ${v.icon} ${v.name} (${v.plate}) - ${v.type}`);
    });

    // 3. Insérer les réservations corrigées avec vos véhicules
    console.log('\n📅 Insertion des réservations avec VOS véhicules...');
    await makeRequest('POST', '/rest/v1/reservations', originalReservations);
    console.log('   ✅ Réservations ajustées pour vos véhicules');

    console.log('\n🎉 RESTAURATION TERMINÉE ! VOS VÉHICULES SONT DE RETOUR !');
    console.log('\nVous avez maintenant:');
    console.log('   🚗 2x Peugeot 208 (274-474-P, 274-473-P)');
    console.log('   🚙 1x Mitsubishi L200 4x4 (292666)');
    console.log('   🚗 1x Mitsubishi Mirage (273-663-P)');
    console.log('   🚙 1x Kia Niro SUV (272-696-P)');
    console.log('   🚗 1x Kia Picanto (272-695-P)');
    console.log('   🛵 3x Scooters (BW-2943, BW-2945, BW-2946)');
    console.log('   🚗 3x Swift (277728, 283833, 277-842)');
    console.log('   🚗 1x Swift automatique (277277)');
    
    console.log('\n📱 Testez maintenant:');
    console.log('   • App locale: http://localhost:3000');
    console.log('   • App Netlify: après redéploiement');
    console.log('   • Connexion: admin / calendrcar2024');

  } catch (error) {
    console.error('\n❌ Erreur lors de la restauration:', error.message);
  }
}

// Lancer la restauration
restoreOriginalVehicles(); 