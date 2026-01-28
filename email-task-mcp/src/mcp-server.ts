import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

import { configManager } from './config/mcp-config.js';
import { initializePrisma, disconnectPrisma, getPrisma } from './config/database.js';
import { UserContext } from './mcp/user-context.js';
import { logger } from './utils/logger.js';

// Import only working email tools
import { FetchEmailsTool, GetEmailDetailsTool, SearchEmailsTool } from './mcp/tools/email-tools.js';

class MCPServer {
  private server: Server;
  private userContext: UserContext | null = null;
  private tools: Map<string, any> = new Map();

  constructor() {
    this.server = new Server(
      {
        name: 'email-task-agent',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupHandlers();
    this.setupErrorHandling();
  }

  private async initializeTools(): Promise<void> {
    if (!this.userContext) {
      throw new Error('User context not initialized');
    }

    const prisma = getPrisma();

    const toolInstances = [
      new FetchEmailsTool(this.userContext, prisma),
      new GetEmailDetailsTool(this.userContext, prisma),
      new SearchEmailsTool(this.userContext, prisma),
    ];

    for (const tool of toolInstances) {
      this.tools.set(tool.name, tool);
    }

    logger.info(`Initialized ${this.tools.size} MCP tools`);
  }

  private setupHandlers(): void {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      const toolsList = Array.from(this.tools.values()).map(tool => ({
        name: tool.name,
        description: tool.description,
        inputSchema: tool.inputSchema,
      }));

      return { tools: toolsList };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      logger.info(`Tool called: ${name}`, args);

      const tool = this.tools.get(name);
      if (!tool) {
        throw new Error(`Unknown tool: ${name}`);
      }

      try {
        const result = await tool.execute(args || {});
        
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      } catch (error: any) {
        logger.error(`Tool execution failed: ${name}`, error);
        
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                error: true,
                message: error.message,
                tool: name,
              }, null, 2),
            },
          ],
          isError: true,
        };
      }
    });
  }

  private setupErrorHandling(): void {
    process.on('SIGINT', async () => {
      logger.info('Received SIGINT, shutting down gracefully');
      await this.shutdown();
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      logger.info('Received SIGTERM, shutting down gracefully');
      await this.shutdown();
      process.exit(0);
    });

    process.on('uncaughtException', (error) => {
      logger.error('Uncaught exception', error);
      this.shutdown().then(() => process.exit(1));
    });

    process.on('unhandledRejection', (reason, promise) => {
      logger.error('Unhandled rejection', { reason, promise });
    });
  }

  async start(): Promise<void> {
    try {
      logger.info('Starting MCP server...');

      configManager.load();

      initializePrisma();

      this.userContext = await UserContext.loadSingleUser();

      await this.initializeTools();

      const transport = new StdioServerTransport();
      await this.server.connect(transport);

      logger.info('MCP server started successfully');
      logger.info(`User: ${this.userContext.getEmail()}`);
      logger.info(`Tools available: ${this.tools.size}`);
    } catch (error) {
      logger.error('Failed to start MCP server', error);
      throw error;
    }
  }

  async shutdown(): Promise<void> {
    logger.info('Shutting down MCP server...');
    await disconnectPrisma();
    logger.info('MCP server shut down complete');
  }
}

const server = new MCPServer();
server.start().catch((error) => {
  console.error('Fatal error starting MCP server:', error);
  process.exit(1);
});
