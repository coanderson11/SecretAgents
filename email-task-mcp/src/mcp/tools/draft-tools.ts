import { BaseTool } from './base-tool.js';
import { DraftService } from '../../services/draft.service.js';
import { OutlookService } from '../../services/outlook.service.js';
import { logger } from '../../utils/logger.js';

export class GenerateDraftTool extends BaseTool {
  name = 'generate_email_draft';
  description = 'Generate an AI-powered email draft in response to an email';
  inputSchema = {
    type: 'object' as const,
    properties: {
      emailId: {
        type: 'string',
        description: 'The email ID to respond to'
      },
      instructions: {
        type: 'string',
        description: 'Additional instructions for the draft (optional)'
      },
      tone: {
        type: 'string',
        enum: ['professional', 'friendly', 'formal', 'casual'],
        description: 'Tone of the response',
        default: 'professional'
      }
    },
    required: ['emailId']
  };

  async execute(params: any) {
    try {
      const { emailId, instructions, tone = 'professional' } = params;
      logger.info(`Generating draft for email: ${emailId}`);

      const email = await this.prisma.email.findUnique({
        where: { outlookId: emailId }
      });

      if (!email) {
        throw new Error(`Email ${emailId} not found`);
      }

      const draftService = new DraftService();
      const draft = await draftService.generateDraft(email, instructions, tone);

      return {
        success: true,
        draft: {
          id: draft.id,
          subject: draft.subject,
          body: draft.body,
          recipientTo: draft.recipientTo,
          status: draft.status
        }
      };
    } catch (error) {
      this.handleError(error, 'Failed to generate draft');
    }
  }
}

export class ListDraftsTool extends BaseTool {
  name = 'list_drafts';
  description = 'List email drafts';
  inputSchema = {
    type: 'object' as const,
    properties: {
      status: {
        type: 'string',
        enum: ['DRAFT', 'SENT', 'ARCHIVED'],
        description: 'Filter by draft status'
      },
      limit: {
        type: 'number',
        description: 'Maximum number of drafts to return',
        default: 20
      }
    }
  };

  async execute(params: any) {
    try {
      const { status, limit = 20 } = params;
      logger.info(`Listing drafts: status=${status}`);

      const where: any = {
        userId: this.userContext.getUserId()
      };

      if (status) where.status = status;

      const drafts = await this.prisma.draft.findMany({
        where,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          email: {
            select: {
              subject: true,
              from: true
            }
          }
        }
      });

      return {
        count: drafts.length,
        drafts: drafts.map(d => ({
          id: d.id,
          subject: d.subject,
          recipientTo: d.recipientTo,
          status: d.status,
          createdAt: d.createdAt,
          originalEmailSubject: d.email?.subject,
          bodyPreview: d.body.substring(0, 150)
        }))
      };
    } catch (error) {
      this.handleError(error, 'Failed to list drafts');
    }
  }
}

export class UpdateDraftTool extends BaseTool {
  name = 'update_draft';
  description = 'Update a draft content';
  inputSchema = {
    type: 'object' as const,
    properties: {
      draftId: {
        type: 'string',
        description: 'The draft ID to update'
      },
      subject: {
        type: 'string',
        description: 'New subject line'
      },
      body: {
        type: 'string',
        description: 'New email body'
      },
      recipientTo: {
        type: 'string',
        description: 'New recipient email'
      }
    },
    required: ['draftId']
  };

  async execute(params: any) {
    try {
      const { draftId, ...updates } = params;
      logger.info(`Updating draft: ${draftId}`);

      const draft = await this.prisma.draft.update({
        where: { id: draftId },
        data: updates
      });

      return {
        success: true,
        draft: {
          id: draft.id,
          subject: draft.subject,
          body: draft.body,
          recipientTo: draft.recipientTo
        }
      };
    } catch (error) {
      this.handleError(error, 'Failed to update draft');
    }
  }
}

export class SendDraftTool extends BaseTool {
  name = 'send_draft';
  description = 'Send a draft email via Outlook';
  inputSchema = {
    type: 'object' as const,
    properties: {
      draftId: {
        type: 'string',
        description: 'The draft ID to send'
      }
    },
    required: ['draftId']
  };

  async execute(params: any) {
    try {
      const { draftId } = params;
      logger.info(`Sending draft: ${draftId}`);

      const draft = await this.prisma.draft.findUnique({
        where: { id: draftId }
      });

      if (!draft) {
        throw new Error(`Draft ${draftId} not found`);
      }

      if (draft.status === 'SENT') {
        throw new Error('Draft already sent');
      }

      const accessToken = await this.userContext.getAccessToken();
      const outlookService = new OutlookService(accessToken);

      await outlookService.sendEmail(draft.recipientTo, draft.subject, draft.body);

      await this.prisma.draft.update({
        where: { id: draftId },
        data: { status: 'SENT', sentAt: new Date() }
      });

      return {
        success: true,
        message: `Draft sent to ${draft.recipientTo}`,
        sentAt: new Date()
      };
    } catch (error) {
      this.handleError(error, 'Failed to send draft');
    }
  }
}
