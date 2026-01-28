import axios from 'axios';
import { logger } from '../utils/logger.js';

export interface TokenRefreshResult {
  accessToken: string;
  refreshToken?: string;
  expiresIn: number;
}

export class TokenRefreshService {
  private static readonly MICROSOFT_TOKEN_ENDPOINT = 'https://login.microsoftonline.com/common/oauth2/v2.0/token';

  async refreshMicrosoftToken(
    refreshToken: string,
    clientId: string,
    clientSecret: string
  ): Promise<TokenRefreshResult> {
    try {
      logger.info('Refreshing Microsoft access token');

      const params = new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
        scope: 'offline_access openid profile email Mail.Read Mail.Send Calendars.Read Chat.Read ChannelMessage.Read.All Files.Read.All'
      });

      const response = await axios.post(TokenRefreshService.MICROSOFT_TOKEN_ENDPOINT, params.toString(), {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });

      logger.info('Token refreshed successfully');

      return {
        accessToken: response.data.access_token,
        refreshToken: response.data.refresh_token || refreshToken,
        expiresIn: response.data.expires_in || 3600
      };
    } catch (error: any) {
      logger.error('Failed to refresh token', error);
      if (error.response?.status === 400 || error.response?.status === 401) {
        throw new Error(
          'Refresh token expired. Please re-authenticate via Express server.\n' +
          'Run: npm run dev\nThen visit: http://localhost:8025/auth/microsoft'
        );
      }
      throw new Error(`Token refresh failed: ${error.message}`);
    }
  }

  isTokenExpired(tokenExpiresAt?: Date): boolean {
    if (!tokenExpiresAt) return true;
    const expiryBuffer = 5 * 60 * 1000; // 5 minutes
    return new Date(tokenExpiresAt).getTime() - Date.now() < expiryBuffer;
  }

  calculateExpiryDate(expiresInSeconds: number): Date {
    return new Date(Date.now() + expiresInSeconds * 1000);
  }
}

export const tokenRefreshService = new TokenRefreshService();

