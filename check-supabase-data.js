// Script pour vérifier les données Supabase
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://zrcmjmbkehiyspmqalzk.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpyY21qbWJrZWhpeXNwbXFhbHprIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE0MTU4MTksImV4cCI6MjA2Njk5MTgxOX0.t_HWBYsUK-qJrU-GjQ314Irr1DsiArbci0i7xXen9DM';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSupabaseData() {
    console.log('🔍 Vérification des données Supabase...\n');
    
    try {
        // Vérifier les réservations
        const { data: reservations, error: resError } = await supabase
            .from('reservations')
            .select('*');
            
        if (resError) {
            console.error('❌ Erreur réservations:', resError.message);
        } else {
            console.log(`📅 RESERVATIONS: ${reservations.length} trouvées`);
            if (reservations.length > 0) {
                console.log('└─ Détails:');
                reservations.forEach(res => {
                    console.log(`   • ${res.title} - ${res.client} (${res.vehicleid})`);
                    console.log(`     Du: ${res.starttime} au: ${res.endtime}`);
                });
            }
        }
        
        console.log('');
        
        // Vérifier les véhicules
        const { data: vehicles, error: vehicleError } = await supabase
            .from('vehicles')
            .select('*');
            
        if (vehicleError) {
            console.error('❌ Erreur véhicules:', vehicleError.message);
        } else {
            console.log(`🚗 VEHICULES: ${vehicles.length} trouvés`);
            if (vehicles.length > 0) {
                console.log('└─ Détails:');
                vehicles.forEach(vehicle => {
                    console.log(`   • ${vehicle.name} (${vehicle.plate}) - ${vehicle.status}`);
                });
            }
        }
        
    } catch (error) {
        console.error('❌ Erreur générale:', error.message);
    }
}

checkSupabaseData(); 