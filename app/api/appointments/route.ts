/**
 * API route: /api/appointments
 *
 * Proposito:
 * - Proveer un endpoint que devuelve las citas (appointments) almacenadas
 *   en la base de datos y soporta filtros comunes: profesional, estado,
 *   búsqueda libre y rango de fechas.
 *
 * Comportamiento y notas importantes:
 * - Esta ruta fuerza el runtime de Node.js con `export const runtime = 'nodejs'`
 *   porque usa Prisma para acceder a la base de datos y Prisma requiere
 *   el entorno Node en server functions.
 * - El cliente de Prisma se obtiene de forma perezosa mediante `getPrisma()`
 *   (ver `lib/prisma.ts`) para evitar importar adaptadores nativos en
 *   tiempo de build (evita fallos en entornos como Vercel durante build).
 * - Parámetros de consulta (query params) soportados:
 *   - `professional` (string): email del profesional
 *   - `status` (PENDING|CONFIRMED|COMPLETED|CANCELLED)
 *   - `q` (string): búsqueda libre sobre paciente, título, tipo de sesión o notas
 *   - `from` / `to` (ISO date): rango de fechas sobre el campo `start`
 *
 * Respuesta:
 * - 200: { data: Appointment[] }
 * - 500: { error: string }
 */

import { NextRequest, NextResponse } from 'next/server';
// Force this API route to run on the Node.js runtime so Prisma is usable.
export const runtime = 'nodejs';
import { AppointmentStatus } from '@prisma/client';
import { getPrisma } from '@/lib/prisma';

/**
 * Valida y castea un string a AppointmentStatus (enum de Prisma).
 * Si no es válido, devuelve undefined.
 */
function parseStatus(value: string | null): AppointmentStatus | undefined {
  if (!value) return undefined;

  const normalized = value.toUpperCase() as AppointmentStatus;

  const allowed: AppointmentStatus[] = [
    'PENDING',
    'CONFIRMED',
    'COMPLETED',
    'CANCELLED',
  ];

  if (allowed.includes(normalized)) {
    return normalized;
  }

  return undefined;
}

/**
 * Parsea un string a Date, devolviendo undefined si es inválido.
 */
function parseDate(value: string | null): Date | undefined {
  if (!value) return undefined;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return undefined;
  return date;
}

export async function GET(req: NextRequest) {
  try {
    // Usamos el cliente Prisma centralizado (creado de forma perezosa)
    const prismaClient = await getPrisma();
    const { searchParams } = req.nextUrl;

    const professional = searchParams.get('professional'); // email del profesional
    const statusParam = searchParams.get('status'); // PENDING, CONFIRMED, COMPLETED, CANCELLED
    const query = searchParams.get('q'); // búsqueda libre
    const fromParam = searchParams.get('from'); // fecha inicio rango
    const toParam = searchParams.get('to'); // fecha fin rango

    const status = parseStatus(statusParam);
    const fromDate = parseDate(fromParam);
    const toDate = parseDate(toParam);

    // Construimos el objeto "where" de forma incremental
    const where: any = {};

    if (professional) {
      where.professionalEmail = professional;
    }

    if (status) {
      where.status = status;
    }

    // Filtro de rango de fechas sobre el campo "start"
    if (fromDate || toDate) {
      where.start = {};
      if (fromDate) {
        where.start.gte = fromDate;
      }
      if (toDate) {
        where.start.lte = toDate;
      }
    }

    // Filtro de búsqueda libre
    if (query && query.trim().length > 0) {
      const q = query.trim();

      // Añadimos un AND para combinar con otros filtros (professional, status, dates)
      where.AND = [
        {
          OR: [
            { patientName: { contains: q, mode: 'insensitive' } },
            { patientEmail: { contains: q, mode: 'insensitive' } },
            { title: { contains: q, mode: 'insensitive' } },
            { sessionType: { contains: q, mode: 'insensitive' } },
            { notes: { contains: q, mode: 'insensitive' } },
          ],
        },
      ];
    }

    const appointments = await prismaClient.appointment.findMany({
      where,
      orderBy: {
        start: 'asc',
      },
    });

    return NextResponse.json(
      {
        data: appointments,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error('[GET /api/appointments] Error:', error);

    // En una app real podríamos diferenciar errores de validación vs. server error.
    return NextResponse.json(
      {
        error: 'Error fetching appointments',
      },
      { status: 500 },
    );
  }
}
