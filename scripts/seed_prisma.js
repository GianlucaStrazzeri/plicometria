// seed_prisma.js
// Seed script for Prisma (SQLite) to create a Patient and an Appointment
require('dotenv').config({ path: '.env.local' });

// Ensure DATABASE_URL for Prisma: fallback to local sqlite file inside ./prisma
process.env.DATABASE_URL = process.env.DATABASE_URL || 'file:./prisma/dev.db';

// Construct Prisma client similarly to `lib/prisma.ts` to support adapters
async function createPrismaClient() {
  const { PrismaClient: ImportedPrismaClient } = await import('@prisma/client');
  return new ImportedPrismaClient();
}

let prisma;

async function main() {
  try {
    prisma = await createPrismaClient();
    // Upsert a patient (uses unique email)
    const patientEmail = 'juan.perez@example.com';
    const patientDni = '12345678A';

    const patient = await prisma.patient.upsert({
      where: { email: patientEmail },
      update: {},
      create: {
        firstName: 'Juan',
        lastName: 'Pérez',
        dni: patientDni,
        email: patientEmail,
        phone: '+34600000000',
        birthDate: new Date('1985-03-20'),
        sex: 'M',
        pathology: 'Hipertensión',
        notes: 'Paciente seedado automáticamente',
        status: 'active',
      },
    });

    console.log('Patient upserted:', patient.email || patient.id);

    // Create a sample appointment if one similar doesn't exist
    const start = new Date();
    start.setDate(start.getDate() + 1); // mañana
    start.setHours(10, 0, 0, 0);
    const end = new Date(start.getTime() + 60 * 60 * 1000); // +1h

    const existing = await prisma.appointment.findFirst({
      where: {
        patientName: `${patient.firstName} ${patient.lastName}`,
        start: start,
      },
    });

    if (existing) {
      console.log('Appointment already exists, skipping creation.');
    } else {
      const appt = await prisma.appointment.create({
        data: {
          title: `Sesión – ${patient.firstName} ${patient.lastName}`,
          patientName: `${patient.firstName} ${patient.lastName}`,
          patientEmail: patient.email,
          patientPhone: patient.phone || undefined,
          professionalEmail: 'profesional1@example.com',
          status: 'PENDING',
          sessionType: 'Primera visita',
          start,
          end,
          location: 'Consulta de ejemplo',
          notes: 'Cita seed creada automáticamente',
        },
      });
      console.log('Created appointment:', appt.id);
    }
  } catch (err) {
    console.error('Prisma seed failed:', err);
    process.exitCode = 1;
  } finally {
    if (prisma && prisma.$disconnect) await prisma.$disconnect();
  }
}

main();
