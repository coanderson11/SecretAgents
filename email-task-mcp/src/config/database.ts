import { PrismaClient } from '@prisma/client';
import path from 'path';
import { logger } from '../utils/logger.js';

let prismaInstance: PrismaClient | null = null;

export function initializePrisma(): PrismaClient {
  if (prismaInstance) return prismaInstance;

  try {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      throw new Error('DATABASE_URL environment variable is not set');
    }

    let resolvedUrl = databaseUrl;
    if (databaseUrl.startsWith('file:./') || databaseUrl.startsWith('file:.\\')) {
      const relativePath = databaseUrl.substring(5);
      const absolutePath = path.resolve(process.cwd(), relativePath);
      resolvedUrl = `file:${absolutePath}`;
      logger.info(`Resolved database path: ${resolvedUrl}`);
    }

    prismaInstance = new PrismaClient({
      datasources: { db: { url: resolvedUrl } },
      log: ['error', 'warn']
    });

    logger.info('Prisma client initialized successfully');
    return prismaInstance;
  } catch (error) {
    logger.error('Failed to initialize Prisma client', error);
    throw error;
  }
}

export async function disconnectPrisma(): Promise<void> {
  if (prismaInstance) {
    await prismaInstance.$disconnect();
    prismaInstance = null;
    logger.info('Prisma client disconnected');
  }
}

export function getPrisma(): PrismaClient {
  if (!prismaInstance) {
    throw new Error('Prisma client not initialized. Call initializePrisma() first.');
  }
  return prismaInstance;
}
