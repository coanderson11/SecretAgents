import fs from 'fs';
import path from 'path';

export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR'
}

class Logger {
  private logFilePath: string | null = null;
  private isInitialized = false;

  constructor() {
    const logFile = process.env.LOG_FILE;
    if (logFile) {
      this.logFilePath = path.resolve(logFile);
      this.ensureLogDirectory();
      this.isInitialized = true;
    }
  }

  private ensureLogDirectory(): void {
    if (!this.logFilePath) return;
    const dir = path.dirname(this.logFilePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  private formatMessage(level: LogLevel, message: string, context?: any): string {
    const timestamp = new Date().toISOString();
    let formattedMessage = `[${timestamp}] [${level}] ${message}`;
    if (context) {
      formattedMessage += `\n${JSON.stringify(context, null, 2)}`;
    }
    return formattedMessage;
  }

  private writeToFile(message: string): void {
    if (!this.logFilePath) return;
    try {
      fs.appendFileSync(this.logFilePath, message + '\n', 'utf8');
    } catch (error) {
      console.error('Failed to write to log file:', error);
    }
  }

  log(level: LogLevel, message: string, context?: any): void {
    const formattedMessage = this.formatMessage(level, message, context);
    if (this.isInitialized && this.logFilePath) {
      this.writeToFile(formattedMessage);
    } else {
      console.log(formattedMessage);
    }
  }

  debug(message: string, context?: any): void { this.log(LogLevel.DEBUG, message, context); }
  info(message: string, context?: any): void { this.log(LogLevel.INFO, message, context); }
  warn(message: string, context?: any): void { this.log(LogLevel.WARN, message, context); }
  error(message: string, context?: any): void { this.log(LogLevel.ERROR, message, context); }
}

export const logger = new Logger();
