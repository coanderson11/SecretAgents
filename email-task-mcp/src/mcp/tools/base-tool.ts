import { PrismaClient } from '@prisma/client';
import { UserContext } from '../user-context.js';

export interface ToolSchema {
  type: 'object';
  properties: Record<string, any>;
  required?: string[];
}

export abstract class BaseTool {
  protected userContext: UserContext;
  protected prisma: PrismaClient;

  abstract name: string;
  abstract description: string;
  abstract inputSchema: ToolSchema;

  constructor(userContext: UserContext, prisma: PrismaClient) {
    this.userContext = userContext;
    this.prisma = prisma;
  }

  abstract execute(params: any): Promise<any>;

  protected handleError(error: any, context: string): never {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`${context}: ${errorMessage}`);
  }
}
