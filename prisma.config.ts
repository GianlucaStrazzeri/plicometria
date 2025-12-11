// File: prisma.config.ts
// Description: Configuración principal de Prisma 7 para la app plicometria-app.

import 'dotenv/config';
import { defineConfig, env } from 'prisma/config';

export default defineConfig({
  // Ruta al schema de Prisma (relativa al proyecto plicometria-app)
  schema: './prisma/schema.prisma',

  // Ruta donde se guardan las migraciones
  migrations: {
    path: './prisma/migrations',
  },

  // Configuración del datasource (Prisma 7: la URL va aquí, no en schema.prisma)
  datasource: {
    url: env('DATABASE_URL'),
  },
});
