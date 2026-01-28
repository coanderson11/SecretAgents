import { BaseTool } from './base-tool.js';
import { OutlookService } from '../../services/outlook.service.js';
import { logger } from '../../utils/logger.js';

export class FetchEmailsTool extends BaseTool {
  name = 'fetch_emails';
  description = 'Fetch recent emails from Outlook inbox';
  inputSchema = {
    type: 'object' as const,
    properties: {
      maxResults: {
        type: 'number',
        description: 'Maximum number of emails to fetch (default: 10)',
        default: 10
      },
      unreadOnly: {
        type: 'boolean',
        description: 'Only fetch unread emails',
        default: false
      }
    }
  };

  async execute(params: any) {
    try {
      const { maxResults = 10, unreadOnly = false } = params;
      logger.info(`Fetching emails: max=${maxResults}, unreadOnly=${unreadOnly}`);

      const accessToken = await this.userContext.getAccessToken();
      const outlookService = new OutlookService(accessToken);

      const emails = await outlookService.fetchEmails(maxResults);

      const filteredEmails = unreadOnly 
        ? emails.filter((e: any) => !e.processed) 
        : emails;

      for (const email of filteredEmails) {
        await this.prisma.email.upsert({
          where: { outlookId: (email as any).outlookId },
          update: email,
          create: {
            ...email,
            userId: this.userContext.getUserId()
          }
        });
      }

      logger.info(`Fetched ${filteredEmails.length} emails`);

      return {
        count: filteredEmails.length,
        emails: filteredEmails.map((e: any) => ({
          id: (e as any).outlookId,
          subject: e.subject,
          from: e.from,
          receivedAt: e.receivedAt,
          preview: e.body.substring(0, 150)
        }))
      };
    } catch (error) {
      this.handleError(error, 'Failed to fetch emails');
    }
  }
}

export class GetEmailDetailsTool extends BaseTool {
  name = 'get_email_details';
  description = 'Get full details of a specific email by ID';
  inputSchema = {
    type: 'object' as const,
    properties: {
      emailId: {
        type: 'string',
        description: 'The Outlook email ID'
      }
    },
    required: ['emailId']
  };

  async execute(params: any) {
    try {
      const { emailId } = params;
      logger.info(`Getting email details: ${emailId}`);

      let email = await this.prisma.email.findUnique({
        where: { outlookId: emailId }
      });

      if (!email) {
        const accessToken = await this.userContext.getAccessToken();
        const outlookService = new OutlookService(accessToken);
        const emailData = await outlookService.getEmailById(emailId);

        email = await this.prisma.email.create({
          data: {
            ...emailData,
            userId: this.userContext.getUserId()
          }
        });
      }

      return {
        id: email.outlookId,
        subject: email.subject,
        from: email.from,
        body: email.body,
        receivedAt: email.receivedAt,
        processed: email.processed
      };
    } catch (error) {
      this.handleError(error, 'Failed to get email details');
    }
  }
}

export class SearchEmailsTool extends BaseTool {
  name = 'search_emails';
  description = 'Search emails in database by keywords or filters';
  inputSchema = {
    type: 'object' as const,
    properties: {
      query: {
        type: 'string',
        description: 'Search query (searches subject and body)'
      },
      from: {
        type: 'string',
        description: 'Filter by sender email'
      },
      limit: {
        type: 'number',
        description: 'Maximum results to return',
        default: 20
      }
    }
  };

  async execute(params: any) {
    try {
      const { query, from, limit = 20 } = params;
      logger.info(`Searching emails: query="${query}", from="${from}"`);

      const where: any = {
        userId: this.userContext.getUserId()
      };

      if (query) {
        where.OR = [
          { subject: { contains: query, mode: 'insensitive' } },
          { body: { contains: query, mode: 'insensitive' } }
        ];
      }

      if (from) {
        where.from = { contains: from, mode: 'insensitive' };
      }

      const emails = await this.prisma.email.findMany({
        where,
        take: limit,
        orderBy: { receivedAt: 'desc' }
      });

      return {
        count: emails.length,
        emails: emails.map((e: any) => ({
          id: (e as any).outlookId,
          subject: e.subject,
          from: e.from,
          receivedAt: e.receivedAt,
          preview: e.body.substring(0, 150)
        }))
      };
    } catch (error) {
      this.handleError(error, 'Failed to search emails');
    }
  }
}

