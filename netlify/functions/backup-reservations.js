// Netlify Scheduled Function: Sauvegarde quotidienne des réservations et véhicules
// - Ne modifie pas l'application front
// - Écrit un JSON horodaté dans Supabase Storage (bucket "backups")
// - Utilise le Service Role Key côté serveur (variables d'environnement Netlify)

const { createClient } = require('@supabase/supabase-js');

exports.handler = async function handler(event, context) {
  const startTs = Date.now();
  try {
    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return {
        statusCode: 500,
        body: JSON.stringify({
          ok: false,
          error: 'Variables SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY manquantes',
        }),
      };
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false },
    });

    // 1) Lire les données (réservations + véhicules)
    const [{ data: reservations, error: resErr }, { data: vehicles, error: vehErr }] = await Promise.all([
      supabase.from('reservations').select('*').order('starttime', { ascending: true }),
      supabase.from('vehicles').select('*').order('name', { ascending: true }),
    ]);

    if (resErr) throw resErr;
    if (vehErr) throw vehErr;

    // 2) Préparer le contenu de sauvegarde
    const now = new Date();
    const iso = now.toISOString();
    const yyyy = String(now.getUTCFullYear());
    const mm = String(now.getUTCMonth() + 1).padStart(2, '0');
    const dd = String(now.getUTCDate()).padStart(2, '0');
    const hh = String(now.getUTCHours()).padStart(2, '0');
    const min = String(now.getUTCMinutes()).padStart(2, '0');
    const ss = String(now.getUTCSeconds()).padStart(2, '0');

    const payload = {
      meta: {
        created_at: iso,
        timezone: 'UTC',
        counts: {
          reservations: Array.isArray(reservations) ? reservations.length : 0,
          vehicles: Array.isArray(vehicles) ? vehicles.length : 0,
        },
        version: 1,
      },
      reservations: reservations || [],
      vehicles: vehicles || [],
    };

    const jsonBuffer = Buffer.from(JSON.stringify(payload, null, 2), 'utf-8');

    // 3) S'assurer que le bucket existe (privé)
    // Ignore l'erreur si le bucket existe déjà
    const { error: bucketErr } = await supabase.storage.createBucket('backups', {
      public: false,
      allowedMimeTypes: ['application/json'],
      fileSizeLimit: '50mb',
    });
    if (bucketErr && !String(bucketErr.message || '').toLowerCase().includes('already exists')) {
      throw bucketErr;
    }

    // 4) Envoyer le fichier vers Storage
    const filePath = `reservations/${yyyy}/${mm}/${dd}/backup-${yyyy}${mm}${dd}-${hh}${min}${ss}.json`;
    const { error: uploadErr } = await supabase.storage
      .from('backups')
      .upload(filePath, jsonBuffer, {
        contentType: 'application/json',
        upsert: false, // éviter d'écraser
      });

    if (uploadErr) throw uploadErr;

    const ms = Date.now() - startTs;
    return {
      statusCode: 200,
      body: JSON.stringify({
        ok: true,
        message: 'Backup créé avec succès',
        path: filePath,
        counts: payload.meta.counts,
        durationMs: ms,
      }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ ok: false, error: String(error && error.message ? error.message : error) }),
    };
  }
}


