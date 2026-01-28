import { BaseTool } from './base-tool.js';
import { ContextService } from '../../services/context.service.js';
import { DraftService } from '../../services/draft.service.js';
import { logger } from '../../utils/logger.js';

export class ResearchContextTool extends BaseTool {
  name = 'research_context';
  description = 'Research context from Teams, OneDrive, and Outlook about specific topics';
  inputSchema = {
    type: 'object' as const,
    properties: {
      topic: {
        type: 'string',
        description: 'The topic to research'
      },
      sources: {
        type: 'array',
        items: {
          type: 'string',
          enum: ['emails', 'teams', 'files', 'calendar']
        },
        description: 'Which sources to search (default: all)',
        default: ['emails', 'teams', 'files', 'calendar']
      },
      depth: {
        type: 'string',
        enum: ['quick', 'standard', 'deep'],
        description: 'How thorough the search should be',
        default: 'standard'
      }
    },
    required: ['topic']
  };

  async execute(params: any) {
    try {
      const { topic, sources = ['emails', 'teams', 'files', 'calendar'], depth = 'standard' } = params;
      logger.info(`Researching context for topic: ${topic}`);

      const accessToken = await this.userContext.getAccessToken();
      const contextService = new ContextService(accessToken);

      const context = await contextService.gatherContext([topic]);

      const maxResults = depth === 'quick' ? 5 : depth === 'standard' ? 10 : 20;

      return {
        topic,
        sources: sources,
        results: {
          emails: context.emails?.slice(0, maxResults).map(e => ({
            subject: e.subject,
            from: e.from,
            date: e.receivedDateTime,
            relevance: e.importance
          })) || [],
          teamsMessages: context.chatMessages?.slice(0, maxResults).map(m => ({
            content: m.body?.content?.substring(0, 200),
            from: m.from?.user?.displayName,
            date: m.createdDateTime
          })) || [],
          documents: context.documents?.slice(0, maxResults).map(d => ({
            name: d.name,
            path: d.webUrl,
            lastModified: d.lastModifiedDateTime
          })) || []
        },
        summary: `Found ${context.emails?.length || 0} emails, ${context.chatMessages?.length || 0} Teams messages, and ${context.documents?.length || 0} documents related to "${topic}"`
      };
    } catch (error) {
      this.handleError(error, 'Failed to research context');
    }
  }
}

export class GenerateContextAwareDraftTool extends BaseTool {
  name = 'generate_context_aware_draft';
  description = 'Generate an email draft with background research and context';
  inputSchema = {
    type: 'object' as const,
    properties: {
      emailId: {
        type: 'string',
        description: 'The email ID to respond to'
      },
      researchTopics: {
        type: 'array',
        items: { type: 'string' },
        description: 'Topics to research for context'
      },
      tone: {
        type: 'string',
        enum: ['professional', 'friendly', 'formal', 'casual'],
        default: 'professional'
      }
    },
    required: ['emailId']
  };

  async execute(params: any) {
    try {
      const { emailId, researchTopics = [], tone = 'professional' } = params;
      logger.info(`Generating context-aware draft for email: ${emailId}`);

      const email = await this.prisma.email.findUnique({
        where: { outlookId: emailId }
      });

      if (!email) {
        throw new Error(`Email ${emailId} not found`);
      }

      const accessToken = await this.userContext.getAccessToken();

      let contextSummary = '';
      if (researchTopics.length > 0) {
        const contextService = new ContextService(accessToken);
        const context = await contextService.gatherContext(researchTopics);
        contextSummary = `Context: Found ${context.emails?.length || 0} related emails, ${context.chatMessages?.length || 0} Teams messages.`;
      }

      const draftService = new DraftService();
      const instructions = contextSummary 
        ? `Use this context in your response: ${contextSummary}` 
        : undefined;
      const draft = await draftService.generateDraft(email, instructions, tone);

      return {
        success: true,
        draft: {
          id: draft.id,
          subject: draft.subject,
          body: draft.body,
          recipientTo: draft.recipientTo
        },
        contextUsed: {
          topicsResearched: researchTopics,
          contextSummary
        }
      };
    } catch (error) {
      this.handleError(error, 'Failed to generate context-aware draft');
    }
  }
}
