// src/lib/db/client.ts
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  // Only log errors in production
  // In development, suppress Prisma engine connection errors during Turbopack startup
  log: process.env.NODE_ENV === 'production' ? ['query', 'error', 'warn'] : ['error'],
  errorFormat: 'pretty',
});

// Ensure proper connection handling
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// Initialize connection on app startup
if (process.env.NODE_ENV !== 'production') {
  prisma.$connect()
    .then(() => console.log('✅ Database connected successfully'))
    .catch((error) => console.error('❌ Database connection failed:', error.message));
}

// Connection health check
export async function checkDatabaseConnection() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  }
}

// Retry connection helper
export async function ensureDatabaseConnection(maxRetries = 3, delayMs = 1000) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      await prisma.$queryRaw`SELECT 1`;
      return true;
    } catch (error) {
      if (i < maxRetries - 1) {
        console.log(`Connection attempt ${i + 1} failed, retrying in ${delayMs}ms...`);
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    }
  }
  return false;
}

// Alias for convenience
export const db = prisma;