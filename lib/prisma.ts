// File: lib/prisma.ts
// Description: Cliente Prisma centralizado para acceder a la base de datos (Appointments, etc.) en el servidor de Next.js.

// Lazy initialization of PrismaClient with optional adapter.
// We avoid importing native adapter packages at module-evaluation time
// so that Next/Vercel build doesn't attempt to load native binaries
// during the build phase. Call `getPrisma()` from server routes to
// obtain the client.

import type { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export async function getPrisma(): Promise<PrismaClient> {
  if (globalForPrisma.prisma) return globalForPrisma.prisma;

  // Dynamic import to avoid failing at build-time when native adapters
  // (like better-sqlite3) are not available in the environment.
  const { PrismaClient: ImportedPrismaClient } = await import('@prisma/client');

  let client: PrismaClient;
  try {
    // Attempt to load the better-sqlite3 adapter and construct the client
    // with it. This may fail in some build environments; we catch and
    // fall back to a plain PrismaClient if necessary.
     
    const { PrismaBetterSqlite3 } = await import('@prisma/adapter-better-sqlite3');
    const databaseUrl = process.env.DATABASE_URL ?? 'file:./dev.db';
    const adapter = new (PrismaBetterSqlite3 as any)({ url: databaseUrl }, {});
    client = new (ImportedPrismaClient as any)({ adapter });
  } catch (_e) {
    // Fallback: try plain PrismaClient (may still require suitable engine).
    client = new ImportedPrismaClient();
  }

  if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = client;
  }

  return client;
}
