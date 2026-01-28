import { BaseTool } from './base-tool.js';
import { MeetingService } from '../../services/meeting.service.js';
import { ContextService } from '../../services/context.service.js';
import { logger } from '../../utils/logger.js';

export class ExtractMeetingInfoTool extends BaseTool {
  name = 'extract_meeting_info';
  description = 'Extract meeting information from an email';
  inputSchema = {
    type: 'object' as const,
    properties: {
      emailId: {
        type: 'string',
        description: 'The email ID to extract meeting info from'
      }
    },
    required: ['emailId']
  };

  async execute(params: any) {
    try {
      const { emailId } = params;
      logger.info(`Extracting meeting info from email: ${emailId}`);

      const email = await this.prisma.email.findUnique({
        where: { outlookId: emailId }
      });

      if (!email) {
        throw new Error(`Email ${emailId} not found`);
      }

      const meetingService = new MeetingService();
      const meeting = await meetingService.extractMeetingInfo(email);

      return {
        success: true,
        meeting: {
          id: meeting.id,
          title: meeting.title,
          startTime: meeting.startTime,
          endTime: meeting.endTime,
          location: meeting.location,
          attendees: meeting.attendees,
          agenda: meeting.agenda
        }
      };
    } catch (error) {
      this.handleError(error, 'Failed to extract meeting info');
    }
  }
}

export class ListMeetingsTool extends BaseTool {
  name = 'list_meetings';
  description = 'List upcoming meetings';
  inputSchema = {
    type: 'object' as const,
    properties: {
      startDate: {
        type: 'string',
        description: 'Start date filter (ISO format)'
      },
      endDate: {
        type: 'string',
        description: 'End date filter (ISO format)'
      },
      limit: {
        type: 'number',
        description: 'Maximum number of meetings to return',
        default: 20
      }
    }
  };

  async execute(params: any) {
    try {
      const { startDate, endDate, limit = 20 } = params;
      logger.info(`Listing meetings: startDate=${startDate}, endDate=${endDate}`);

      const where: any = {
        userId: this.userContext.getUserId()
      };

      if (startDate || endDate) {
        where.startTime = {};
        if (startDate) where.startTime.gte = new Date(startDate);
        if (endDate) where.startTime.lte = new Date(endDate);
      }

      const meetings = await this.prisma.meeting.findMany({
        where,
        take: limit,
        orderBy: { startTime: 'asc' }
      });

      return {
        count: meetings.length,
        meetings: meetings.map(m => ({
          id: m.id,
          title: m.title,
          startTime: m.startTime,
          endTime: m.endTime,
          location: m.location,
          attendees: m.attendees,
          agenda: m.agenda
        }))
      };
    } catch (error) {
      this.handleError(error, 'Failed to list meetings');
    }
  }
}

export class PrepareMeetingContextTool extends BaseTool {
  name = 'prepare_meeting_context';
  description = 'Generate a comprehensive meeting preparation document with background context';
  inputSchema = {
    type: 'object' as const,
    properties: {
      meetingId: {
        type: 'string',
        description: 'The meeting ID to prepare for'
      },
      includeHistory: {
        type: 'boolean',
        description: 'Include email history with attendees',
        default: true
      }
    },
    required: ['meetingId']
  };

  async execute(params: any) {
    try {
      const { meetingId, includeHistory = true } = params;
      logger.info(`Preparing meeting context for: ${meetingId}`);

      const meeting = await this.prisma.meeting.findUnique({
        where: { id: meetingId }
      });

      if (!meeting) {
        throw new Error(`Meeting ${meetingId} not found`);
      }

      const accessToken = await this.userContext.getAccessToken();
      const contextService = new ContextService(accessToken);

      const topics = meeting.agenda ? [meeting.agenda] : [meeting.title];
      const context = await contextService.gatherContext(topics);

      const meetingPrep = await this.prisma.meetingPrep.findUnique({
        where: { meetingId }
      });

      return {
        meeting: {
          title: meeting.title,
          startTime: meeting.startTime,
          endTime: meeting.endTime,
          location: meeting.location,
          attendees: meeting.attendees,
          agenda: meeting.agenda
        },
        context: {
          relevantEmails: context.emails?.length || 0,
          relevantDocuments: context.documents?.length || 0,
          teamsChatMessages: context.chatMessages?.length || 0
        },
        preparation: meetingPrep ? {
          summary: meetingPrep.summary,
          keyPoints: meetingPrep.keyPoints,
          suggestedTopics: meetingPrep.suggestedTopics,
          generatedAt: meetingPrep.createdAt
        } : null
      };
    } catch (error) {
      this.handleError(error, 'Failed to prepare meeting context');
    }
  }
}
