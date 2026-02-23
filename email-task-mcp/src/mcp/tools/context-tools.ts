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

      const context = await contextService.gatherContext(topic);

      const maxResults = depth === 'quick' ? 5 : depth === 'standard' ? 10 : 20;

      return {
        topic,
        sources: context.sources?.slice(0, maxResults).map(s => ({
          type: s.type,
          title: s.title,
          content: s.content?.substring(0, 200),
          url: s.url,
          date: s.date,
          author: s.author,
          relevance: s.relevance
        })) || [],
        summary: context.summary
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
        where: { id: emailId }
      });

      if (!email) {
        throw new Error(`Email ${emailId} not found`);
      }

      const accessToken = await this.userContext.getAccessToken();

      let contextSummary = '';
      if (researchTopics.length > 0) {
        const contextService = new ContextService(accessToken);
        const topics = researchTopics.join(' ');
        const context = await contextService.gatherContext(topics);
        contextSummary = `Context: Found ${context.totalSources} relevant sources.`;
      }

      const draftService = new DraftService();
      const instructions = contextSummary 
        ? `Use this context in your response: ${contextSummary}` 
        : undefined;
      const draft = await draftService.generateDraftResponse(email.subject, email.body, email.from, instructions);

      return {
        success: true,
        draft: {
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
