import { logger } from '../utils/logger.js';
import { config } from 'dotenv';

export interface MCPConfig {
  databaseUrl: string;
  anthropicApiKey: string;
  logFile?: string;
  enableScheduler: boolean;
  backendUrl?: string;
}

class ConfigManager {
  private config: MCPConfig | null = null;

  load(): MCPConfig {
    if (this.config) return this.config;

    // Load .env file
    config();

    try {
      const databaseUrl = process.env.DATABASE_URL;
      const anthropicApiKey = process.env.ANTHROPIC_API_KEY;
      const logFile = process.env.LOG_FILE;
      const enableScheduler = process.env.ENABLE_SCHEDULER !== 'false';
      const backendUrl = process.env.BACKEND_URL;

      if (!databaseUrl) {
        throw new Error(
          'DATABASE_URL is required. Example: file:c:\\Users\\YourName\\email-task-app\\backend\\dev.db'
        );
      }

      if (!anthropicApiKey) {
        throw new Error(
          'ANTHROPIC_API_KEY is required. Get your API key from: https://console.anthropic.com/'
        );
      }

      this.config = { databaseUrl, anthropicApiKey, logFile, enableScheduler, backendUrl };
      logger.info('Configuration loaded successfully');
      return this.config;
    } catch (error) {
      logger.error('Failed to load configuration', error);
      throw error;
    }
  }

  get(): MCPConfig {
    if (!this.config) throw new Error('Configuration not loaded. Call load() first.');
    return this.config;
  }
}

export const configManager = new ConfigManager();
