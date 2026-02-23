import { PrismaClient } from '@prisma/client';
import { getPrisma } from '../config/database.js';
import { logger } from '../utils/logger.js';

export class UserContext {
  private sessionId: string;
  private prisma: PrismaClient;

  private constructor(sessionId: string, prisma: PrismaClient) {
    this.sessionId = sessionId;
    this.prisma = prisma;
  }

  static async loadSingleUser(): Promise<UserContext> {
    try {
      const prisma = getPrisma();
      
      // Try to get or create a session
      let session = await prisma.session.findFirst({
        orderBy: { createdAt: 'desc' }
      });

      // If no session exists, create one for testing
      if (!session) {
        logger.info('Creating new session for testing');
        session = await prisma.session.create({
          data: {}
        });
      }

      logger.info(`Loaded session context: ${session.id}`);
      return new UserContext(session.id, prisma);
    } catch (error) {
      logger.error('Failed to load user context', error);
      throw error;
    }
  }

  async getAccessToken(): Promise<string> {
    // For testing, return a dummy token
    return 'test-access-token-' + Date.now();
  }

  getUserId(): string { return this.sessionId; }
  getSessionId(): string { return this.sessionId; }
  getEmail(): string { return 'session-' + this.sessionId.substring(0, 8) + '@test.local'; }
  getUser(): any { return { id: this.sessionId, email: this.getEmail() }; }

  async checkAuthStatus() {
    return {
      authenticated: true,
      sessionId: this.sessionId,
      status: 'ready',
      reauthUrl: process.env.BACKEND_URL || 'http://localhost:8025'
    };
  }
}
