import { PrismaClient } from '@prisma/client';
import { getPrisma } from '../config/database.js';
import { tokenRefreshService } from '../services/token-refresh.service.js';
import { logger } from '../utils/logger.js';

export class UserContext {
  private user: any;
  private prisma: PrismaClient;
  private cachedAccessToken: string;

  private constructor(user: any, prisma: PrismaClient) {
    this.user = user;
    this.prisma = prisma;
    this.cachedAccessToken = user.accessToken;
  }

  static async loadSingleUser(): Promise<UserContext> {
    try {
      const prisma = getPrisma();
      const user = await prisma.user.findFirst({
        where: {
          accessToken: { not: null },
          refreshToken: { not: null }
        },
        orderBy: { createdAt: 'desc' }
      });

      if (!user) {
        throw new Error(
          'No authenticated user found.\n\n' +
          'Please authenticate first:\n' +
          '1. npm run dev\n' +
          '2. Visit: http://localhost:8025/auth/microsoft\n' +
          '3. Complete OAuth flow\n' +
          '4. Restart MCP server'
        );
      }

      logger.info(`Loaded user context for: ${user.email}`);
      return new UserContext(user, prisma);
    } catch (error) {
      logger.error('Failed to load user context', error);
      throw error;
    }
  }

  async getAccessToken(): Promise<string> {
    const needsRefresh = tokenRefreshService.isTokenExpired(this.user.tokenExpiresAt || undefined);
    if (needsRefresh) {
      logger.info('Token expired, refreshing...');
      await this.refreshToken();
    }
    return this.cachedAccessToken;
  }

  private async refreshToken(): Promise<void> {
    try {
      const clientId = process.env.MICROSOFT_CLIENT_ID;
      const clientSecret = process.env.MICROSOFT_CLIENT_SECRET;

      if (!clientId || !clientSecret) {
        throw new Error('MICROSOFT_CLIENT_ID and MICROSOFT_CLIENT_SECRET required for token refresh');
      }

      const result = await tokenRefreshService.refreshMicrosoftToken(
        this.user.refreshToken!,
        clientId,
        clientSecret
      );

      this.cachedAccessToken = result.accessToken;
      const newExpiryDate = tokenRefreshService.calculateExpiryDate(result.expiresIn);

      await this.prisma.user.update({
        where: { id: this.user.id },
        data: {
          accessToken: result.accessToken,
          refreshToken: result.refreshToken || this.user.refreshToken,
          tokenExpiresAt: newExpiryDate
        }
      });

      this.user.accessToken = result.accessToken;
      this.user.tokenExpiresAt = newExpiryDate;

      logger.info('Token refreshed successfully');
    } catch (error) {
      logger.error('Failed to refresh token', error);
      throw error;
    }
  }

  getUserId(): string { return this.user.id; }
  getEmail(): string { return this.user.email; }
  getUser(): any { return this.user; }

  async checkAuthStatus() {
    const expiresAt = this.user.tokenExpiresAt ? new Date(this.user.tokenExpiresAt).getTime() : Date.now();
    const expiresInMs = expiresAt - Date.now();
    const expiresInMinutes = Math.floor(expiresInMs / (1000 * 60));
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:8025';

    return {
      authenticated: true,
      userEmail: this.user.email,
      tokenExpiresIn: expiresInMinutes > 0 ? `${expiresInMinutes} minutes` : 'Expired',
      requiresReauth: expiresInMinutes < 5,
      reauthUrl: `${backendUrl}/auth/microsoft`
    };
  }
}
