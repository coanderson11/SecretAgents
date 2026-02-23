import Anthropic from '@anthropic-ai/sdk';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface DraftEmail {
  subject: string;
  body: string;
  recipientTo: string;
}

export class DraftService {
  private client: Anthropic;

  constructor() {
    this.client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY
    });
  }

  async generateDraftResponse(
    emailSubject: string,
    emailBody: string,
    emailFrom: string,
    taskContext?: string
  ): Promise<DraftEmail> {
    const prompt = `You are an intelligent email assistant. Generate a professional draft email response based on the following context:

Original Email From: ${emailFrom}
Original Subject: ${emailSubject}

Original Email Body:
${emailBody}

${taskContext ? `Related Task Context: ${taskContext}` : ''}

Please generate a professional, concise, and appropriate email response. The response should:
1. Acknowledge the original email
2. Address any questions or action items mentioned
3. Be polite and professional
4. Be brief but complete
5. Include an appropriate subject line for the reply

Respond with a JSON object in this exact format:
{
  "subject": "Re: [subject line]",
  "body": "[email body]",
  "recipientTo": "${emailFrom}"
}

Important: Return ONLY valid JSON, no additional text or formatting.`;

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
        throw new Error('Invalid response from Claude');
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

      const draftEmail = JSON.parse(jsonText);

      return {
        subject: draftEmail.subject || `Re: ${emailSubject}`,
        body: draftEmail.body || '',
        recipientTo: draftEmail.recipientTo || emailFrom
      };
    } catch (error) {
      console.error('Error generating draft with Claude:', error);
      throw new Error('Failed to generate draft response');
    }
  }

  async saveDraft(
    userId: string,
    emailId: string | null,
    taskId: string | null,
    draft: DraftEmail
  ) {
    return await (prisma.draft.create({
      data: {
        userId,
        emailId,
        taskId,
        subject: draft.subject,
        body: draft.body,
        recipientTo: draft.recipientTo,
        status: 'PENDING'
      } as any
    }) as any);
  }

  async getDrafts(userId: string, status?: 'PENDING' | 'SENT' | 'DISCARDED') {
    const where: any = { userId } as any;
    if (status) {
      where.status = status;
    }

    return await (prisma.draft.findMany({
      where,
      include: {
        email: {
          select: {
            subject: true,
            from: true,
            receivedAt: true
          } as any
        }
      },
      orderBy: { createdAt: 'desc' }
    }) as any);
  }

  async updateDraft(draftId: string, userId: string, updates: {
    subject?: string;
    body?: string;
    status?: 'PENDING' | 'SENT' | 'DISCARDED';
  }) {
    return await (prisma.draft.update({
      where: {
        id: draftId,
        userId
      } as any,
      data: updates
    }) as any);
  }

  async deleteDraft(draftId: string, userId: string) {
    return await (prisma.draft.delete({
      where: {
        id: draftId,
        userId
      } as any
    }) as any);
  }
}
