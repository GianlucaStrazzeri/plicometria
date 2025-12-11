// Temporary declaration to satisfy TypeScript until generated Prisma types
// are resolved correctly. This file provides minimal type declarations
// for `@prisma/client` so the rest of the app can compile.

declare module '@prisma/client' {
  export const Prisma: any;
  export type Prisma = any;

  export class PrismaClient {
    constructor(...args: any[]);
    $disconnect(): Promise<void>;
    $connect(): Promise<void>;
    [key: string]: any;
  }

  export const AppointmentStatus: {
    PENDING: 'PENDING';
    CONFIRMED: 'CONFIRMED';
    COMPLETED: 'COMPLETED';
    CANCELLED: 'CANCELLED';
  };
  export type AppointmentStatus =
    | 'PENDING'
    | 'CONFIRMED'
    | 'COMPLETED'
    | 'CANCELLED';

  // Generic model types fallback
  export type PrismaClientKnownRequestError = any;
  export type PrismaClientUnknownRequestError = any;
  export type PrismaClientValidationError = any;
}

export {};
