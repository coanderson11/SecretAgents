import Anthropic from '@anthropic-ai/sdk';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface ExtractedMeeting {
  title: string;
  description?: string;
  startTime: string; // ISO date string
  endTime: string; // ISO date string
  location?: string;
  attendees?: string;
  category?: string;
}

export class MeetingService {
  private client: Anthropic;

  constructor() {
    this.client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY
    });
  }

  async extractMeetingsFromEmail(
    emailSubject: string,
    emailBody: string,
    emailFrom: string
  ): Promise<ExtractedMeeting[]> {
    const prompt = `Analyze the following email and extract any meeting or calendar event information. Look for:
- Meeting invitations
- Scheduled calls or conferences
- Events with specific dates and times
- Appointments

Email From: ${emailFrom}
Subject: ${emailSubject}

Body:
${emailBody}

Extract all meeting/event details and respond with a JSON array. For each meeting, include:
- title: Meeting name/subject
- description: Additional details about the meeting
- startTime: ISO 8601 format (YYYY-MM-DDTHH:MM:SS)
- endTime: ISO 8601 format (YYYY-MM-DDTHH:MM:SS)
- location: Physical location or online meeting link
- attendees: Comma-separated list of attendee names/emails
- category: Type of meeting (e.g., "Team Meeting", "Client Call", "Interview", etc.)

Example format:
[
  {
    "title": "Q4 Planning Meeting",
    "description": "Discuss quarterly goals and objectives",
    "startTime": "2026-02-15T14:00:00",
    "endTime": "2026-02-15T15:30:00",
    "location": "Conference Room B",
    "attendees": "john@example.com, sarah@example.com",
    "category": "Team Meeting"
  }
]

Important:
- Return an empty array [] if no meetings are found
- Infer dates/times from context if not explicitly stated
- Return valid JSON only, no additional text`;

    try {
      const response = await this.client.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 2000,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      });

      const content = response.content[0];
      if (content.type !== 'text') {
        return [];
      }

      // Extract JSON from response
      const text = content.text.trim();
      let jsonText = text;

      // Remove markdown code blocks if present
      if (text.startsWith('```')) {
        const match = text.match(/```(?:json)?\s*([\s\S]*?)```/);
        if (match) {
          jsonText = match[1].trim();
        }
      }

      const meetings = JSON.parse(jsonText);

      if (!Array.isArray(meetings)) {
        console.error('Claude response is not an array:', meetings);
        return [];
      }

      // Validate and normalize meetings
      return meetings
        .filter((meeting: any) => meeting.title && meeting.startTime && meeting.endTime)
        .map((meeting: any) => ({
          title: meeting.title,
          description: meeting.description || undefined,
          startTime: meeting.startTime,
          endTime: meeting.endTime,
          location: meeting.location || undefined,
          attendees: meeting.attendees || undefined,
          category: meeting.category || undefined
        }));
    } catch (error) {
      console.error('Error extracting meetings with Claude:', error);
      return [];
    }
  }

  async saveMeeting(userId: string, emailId: string | null, meeting: ExtractedMeeting) {
    return await (prisma.meeting.create({
      data: {
        userId,
        emailId,
        title: meeting.title,
        description: meeting.description,
        startTime: new Date(meeting.startTime),
        endTime: new Date(meeting.endTime),
        location: meeting.location,
        attendees: meeting.attendees,
        category: meeting.category
      } as any
    }) as any);
  }

  async getMeetings(userId: string, filters?: {
    startDate?: Date;
    endDate?: Date;
    category?: string;
  }) {
    const where: any = { userId } as any;

    if (filters?.startDate || filters?.endDate) {
      where.startTime = {};
      if (filters.startDate) {
        where.startTime.gte = filters.startDate;
      }
      if (filters.endDate) {
        where.startTime.lte = filters.endDate;
      }
    }

    if (filters?.category) {
      where.category = filters.category;
    }

    return await prisma.meeting.findMany({
      where,
      include: {
        email: {
          select: {
            subject: true,
            from: true
          }
        }
      },
      orderBy: { startTime: 'asc' }
    });
  }

  async getUpcomingMeetings(userId: string, limit: number = 10) {
    const now = new Date();

    return await (prisma.meeting.findMany({
      where: {
        userId,
        startTime: {
          gte: now
        }
      } as any,
      include: {
        email: {
          select: {
            subject: true,
            from: true
          }
        }
      },
      orderBy: { startTime: 'asc' },
      take: limit
    }) as any);
  }

  async deleteMeeting(meetingId: string, userId: string) {
    return await (prisma.meeting.delete({
      where: {
        id: meetingId,
        userId
      } as any
    }) as any);
  }
}
