// seed_all.js
// Inserts example data into clients, professionals, services, schedules and foods
// Uses DATABASE_URL from .env.local
require('dotenv').config({ path: '.env.local' });
const { Client } = require('pg');

const connection = process.env.DATABASE_URL;
if (!connection) {
  console.error('DATABASE_URL not set in .env.local');
  process.exit(1);
}

async function main() {
  // Use SSL when DB_SSL=true in .env.local (helpful for Supabase connections)
  const useSsl = (process.env.DB_SSL || '').toLowerCase() === 'true';
  const client = new Client({ connectionString: connection, ssl: useSsl ? { rejectUnauthorized: false } : undefined });
  await client.connect();
  try {
    // Ensure schema: create appointments and bills tables if missing
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.appointments (
        id BIGSERIAL PRIMARY KEY,
        title TEXT,
        patient_name TEXT,
        patient_email TEXT,
        patient_phone TEXT,
        professional_email TEXT,
        status TEXT,
        session_type TEXT,
        starts_at TIMESTAMPTZ,
        ends_at TIMESTAMPTZ,
        location TEXT,
        notes TEXT,
        diagnosis TEXT,
        google_event_id TEXT,
        source TEXT,
        created_at TIMESTAMPTZ DEFAULT now(),
        updated_at TIMESTAMPTZ DEFAULT now()
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS public.bills (
        id BIGSERIAL PRIMARY KEY,
        numero TEXT,
        fecha DATE,
        client_id BIGINT,
        client_name TEXT,
        descripcion TEXT,
        base NUMERIC,
        iva_percent NUMERIC,
        irpf_percent NUMERIC,
        otros_percent NUMERIC,
        total NUMERIC,
        estado TEXT,
        created_at TIMESTAMPTZ DEFAULT now(),
        updated_at TIMESTAMPTZ DEFAULT now()
      )
    `);

    // clients
    await client.query(
      `INSERT INTO public.clients (first_name,last_name,dni,email,phone,birth_date,sex,pathology,notes,status)
       VALUES
        ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
       ON CONFLICT (email) DO NOTHING`,
      ['Juan','Pérez','12345678A','juan.perez@example.com','600111222','1985-03-20','M','Hipertensión','Primer paciente','active']
    );

    await client.query(
      `INSERT INTO public.clients (first_name,last_name,dni,email,phone,birth_date,sex,pathology,notes,status)
       VALUES
        ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
       ON CONFLICT (email) DO NOTHING`,
      ['María','García','87654321B','maria.garcia@example.com','600333444','1990-07-08','F',NULL,'Contacto web','active']
    );

    // professionals
    await client.query(
      `INSERT INTO public.professionals (name,email,phone,bio,specialties,hours,status)
       VALUES ($1,$2,$3,$4,$5,$6,$7)
       ON CONFLICT (email) DO NOTHING`,
      ['Ana López','ana.lopez@example.com','611222333','Fisioterapeuta con 10 años de experiencia', ['fisioterapia','domicilio'], JSON.stringify({mon:'09:00-17:00'}),'active']
    );

    // services
    await client.query(
      `INSERT INTO public.services (name,duration,price,description,status)
       VALUES ($1,$2,$3,$4,$5)
       ON CONFLICT (name) DO NOTHING`,
      ['Consulta inicial','60m',45,'Evaluación inicial y plan de tratamiento','active']
    );

    // schedules (example slot)
    const res = await client.query('SELECT id FROM public.professionals LIMIT 1');
    const prof = res.rows[0];
    if (prof) {
      await client.query(
        `INSERT INTO public.schedules (professional_id,starts_at,ends_at,is_booked,metadata)
         VALUES ($1,$2,$3,$4,$5)
         ON CONFLICT DO NOTHING`,
        [prof.id, new Date().toISOString(), new Date(Date.now() + 3600 * 1000).toISOString(), false, null]
      );
    }

    // Insert a sample appointment tied to the first professional and a sample client if available
    const clientRow = await client.query('SELECT id, first_name, last_name, email, phone FROM public.clients LIMIT 1');
    const firstClient = clientRow.rows[0];
    if (prof && firstClient) {
      const appointmentStart = new Date();
      appointmentStart.setDate(appointmentStart.getDate() + 1);
      appointmentStart.setHours(10, 0, 0, 0);
      const appointmentEnd = new Date(appointmentStart.getTime() + 60 * 60 * 1000);

      await client.query(
        `INSERT INTO public.appointments (title, patient_name, patient_email, patient_phone, professional_email, status, session_type, starts_at, ends_at, location, notes)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
         ON CONFLICT DO NOTHING`,
        [
          `Sesión – ${firstClient.first_name} ${firstClient.last_name}`,
          `${firstClient.first_name} ${firstClient.last_name}`,
          firstClient.email,
          firstClient.phone,
          'ana.lopez@example.com',
          'PENDING',
          'Primera visita',
          appointmentStart.toISOString(),
          appointmentEnd.toISOString(),
          'Consulta de ejemplo',
          'Cita generada por seed_all'
        ].slice(0,10)
      );
    }

    // foods
    await client.query(
      `INSERT INTO public.foods (name,duration,proteins,fats,carbs,sugars,vitamins,calories_per_100,tags)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
       ON CONFLICT (name) DO NOTHING`,
      ['Manzana','',0.3,0.2,14,10,'A,C',52, ['fruta','snack']]
    );

    // Insert a demo bill if there is a client
    if (firstClient) {
      const svcBase = 50;
      const ivaPercent = 21;
      const irpfPercent = 0;
      const otrosPercent = 0;
      const ivaAmt = (svcBase * ivaPercent) / 100;
      const irpfAmt = (svcBase * irpfPercent) / 100;
      const otrosAmt = (svcBase * otrosPercent) / 100;
      const total = svcBase + ivaAmt - irpfAmt + otrosAmt;

      await client.query(
        `INSERT INTO public.bills (numero, fecha, client_id, client_name, descripcion, base, iva_percent, irpf_percent, otros_percent, total, estado)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
         ON CONFLICT DO NOTHING`,
        [
          `F-${Date.now().toString(36).toUpperCase().slice(-6)}`,
          new Date().toISOString().slice(0,10),
          firstClient.id,
          `${firstClient.first_name} ${firstClient.last_name}`,
          'Servicio de ejemplo - sesión',
          svcBase,
          ivaPercent,
          irpfPercent,
          otrosPercent,
          total,
          'pendiente',
        ]
      );
    }

    console.log('Seed completed');
  } catch (err) {
    console.error('Seed failed', err);
    process.exitCode = 1;
  } finally {
    await client.end();
  }
}

main();
