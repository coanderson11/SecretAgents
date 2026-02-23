import { Client } from '@microsoft/microsoft-graph-client';
import Anthropic from '@anthropic-ai/sdk';
import 'isomorphic-fetch';

export interface ContextSource {
  type: 'teams_chat' | 'teams_channel' | 'email' | 'calendar' | 'document';
  title: string;
  content: string;
  url?: string;
  date?: string;
  author?: string;
  relevance: number; // 0-1 score
}

export interface ContextResult {
  sources: ContextSource[];
  summary: string;
  totalSources: number;
}

export class ContextService {
  private client: any; // Microsoft Graph Client
  private claudeClient: Anthropic;

  constructor(accessToken: string) {
    this.client = Client.init({
      authProvider: (done) => {
        done(null, accessToken);
      }
    });

    this.claudeClient = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY
    });
  }

  async gatherContext(
    topic: string,
    emailSubject?: string,
    emailFrom?: string
  ): Promise<ContextResult> {
    const sources: ContextSource[] = [];

    try {
      // Search Teams chats
      const teamsChats = await this.searchTeamsChats(topic);
      sources.push(...teamsChats);

      // Search Teams channels
      const teamsChannels = await this.searchTeamsChannels(topic);
      sources.push(...teamsChannels);

      // Search email history
      const emails = await this.searchEmailHistory(topic, emailFrom);
      sources.push(...emails);

      // Search calendar
      const calendarEvents = await this.searchCalendar(topic);
      sources.push(...calendarEvents);

      // Search documents
      const documents = await this.searchDocuments(topic);
      sources.push(...documents);

      // Sort by relevance and take top 10
      const topSources = sources
        .sort((a, b) => b.relevance - a.relevance)
        .slice(0, 10);

      // Generate summary using Claude
      const summary = await this.generateContextSummary(topic, topSources);

      return {
        sources: topSources,
        summary,
        totalSources: sources.length
      };
    } catch (error) {
      console.error('Error gathering context:', error);
      return {
        sources: [],
        summary: 'Unable to gather additional context',
        totalSources: 0
      };
    }
  }

  private async searchTeamsChats(query: string): Promise<ContextSource[]> {
    try {
      const response = await this.client
        .api('/me/chats')
        .top(20)
        .get();

      const chats = response.value || [];
      const sources: ContextSource[] = [];

      for (const chat of chats.slice(0, 5)) {
        try {
          const messages = await this.client
            .api(`/me/chats/${chat.id}/messages`)
            .top(10)
            .get();

          for (const message of messages.value || []) {
            const content = message.body?.content || '';
            if (this.isRelevant(query, content)) {
              sources.push({
                type: 'teams_chat',
                title: `Teams Chat: ${chat.topic || 'Conversation'}`,
                content: this.stripHTML(content),
                date: message.createdDateTime,
                author: message.from?.user?.displayName,
                relevance: this.calculateRelevance(query, content)
              });
            }
          }
        } catch (err) {
          // Skip inaccessible chats
          continue;
        }
      }

      return sources;
    } catch (error) {
      console.error('Error searching Teams chats:', error);
      return [];
    }
  }

  private async searchTeamsChannels(query: string): Promise<ContextSource[]> {
    try {
      const teams = await this.client
        .api('/me/joinedTeams')
        .top(10)
        .get();

      const sources: ContextSource[] = [];

      for (const team of teams.value || []) {
        try {
          const channels = await this.client
            .api(`/teams/${team.id}/channels`)
            .get();

          for (const channel of (channels.value || []).slice(0, 2)) {
            try {
              const messages = await this.client
                .api(`/teams/${team.id}/channels/${channel.id}/messages`)
                .top(20)
                .get();

              for (const message of messages.value || []) {
                const content = message.body?.content || '';
                if (this.isRelevant(query, content)) {
                  sources.push({
                    type: 'teams_channel',
                    title: `${team.displayName} - ${channel.displayName}`,
                    content: this.stripHTML(content),
                    date: message.createdDateTime,
                    author: message.from?.user?.displayName,
                    relevance: this.calculateRelevance(query, content)
                  });
                }
              }
            } catch (err) {
              continue;
            }
          }
        } catch (err) {
          continue;
        }
      }

      return sources;
    } catch (error) {
      console.error('Error searching Teams channels:', error);
      return [];
    }
  }

  private async searchEmailHistory(query: string, excludeFrom?: string): Promise<ContextSource[]> {
    try {
      const response = await this.client
        .api('/me/messages')
        .search(`"${query}"`)
        .top(10)
        .select('subject,from,bodyPreview,receivedDateTime')
        .get();

      const messages = response.value || [];

      return messages
        .filter((msg: any) => !excludeFrom || msg.from?.emailAddress?.address !== excludeFrom)
        .map((msg: any) => ({
          type: 'email' as const,
          title: msg.subject || 'No Subject',
          content: msg.bodyPreview || '',
          date: msg.receivedDateTime,
          author: msg.from?.emailAddress?.address,
          relevance: this.calculateRelevance(query, msg.bodyPreview + ' ' + msg.subject)
        }));
    } catch (error) {
      console.error('Error searching email history:', error);
      return [];
    }
  }

  private async searchCalendar(query: string): Promise<ContextSource[]> {
    try {
      const pastDate = new Date();
      pastDate.setMonth(pastDate.getMonth() - 3); // Last 3 months

      const response = await this.client
        .api('/me/events')
        .filter(`start/dateTime ge '${pastDate.toISOString()}'`)
        .top(20)
        .select('subject,bodyPreview,start,attendees,location')
        .orderby('start/dateTime desc')
        .get();

      const events = response.value || [];

      return events
        .filter((event: any) => this.isRelevant(query, event.subject + ' ' + event.bodyPreview))
        .map((event: any) => ({
          type: 'calendar' as const,
          title: event.subject || 'No Title',
          content: `${event.bodyPreview || ''}\nLocation: ${event.location?.displayName || 'N/A'}`,
          date: event.start?.dateTime,
          relevance: this.calculateRelevance(query, event.subject + ' ' + event.bodyPreview)
        }));
    } catch (error) {
      console.error('Error searching calendar:', error);
      return [];
    }
  }

  private async searchDocuments(query: string): Promise<ContextSource[]> {
    try {
      const response = await this.client
        .api('/me/drive/search(q=\'{query}\')')
        .top(10)
        .get();

      const items = response.value || [];

      return items
        .filter((item: any) => item.file) // Only files, not folders
        .map((item: any) => ({
          type: 'document' as const,
          title: item.name,
          content: `Document: ${item.name}\nPath: ${item.parentReference?.path || ''}`,
          url: item.webUrl,
          date: item.lastModifiedDateTime,
          author: item.lastModifiedBy?.user?.displayName,
          relevance: this.calculateRelevance(query, item.name)
        }));
    } catch (error) {
      console.error('Error searching documents:', error);
      return [];
    }
  }

  private isRelevant(query: string, content: string): boolean {
    const queryLower = query.toLowerCase();
    const contentLower = content.toLowerCase();
    const queryWords = queryLower.split(/\s+/);

    // Check if at least 30% of query words appear in content
    const matchCount = queryWords.filter(word => contentLower.includes(word)).length;
    return matchCount / queryWords.length >= 0.3;
  }

  private calculateRelevance(query: string, content: string): number {
    const queryLower = query.toLowerCase();
    const contentLower = content.toLowerCase();
    const queryWords = queryLower.split(/\s+/);

    let score = 0;
    queryWords.forEach(word => {
      if (contentLower.includes(word)) {
        score += 1;
      }
    });

    return Math.min(score / queryWords.length, 1);
  }

  private stripHTML(html: string): string {
    return html
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .trim()
      .substring(0, 500); // Limit length
  }

  private async generateContextSummary(topic: string, sources: ContextSource[]): Promise<string> {
    if (sources.length === 0) {
      return 'No relevant context found from your Teams, emails, calendar, or documents.';
    }

    const contextText = sources.map((source, idx) =>
      `[${idx + 1}] ${source.type.toUpperCase()} - ${source.title}\n${source.content}\n`
    ).join('\n');

    const prompt = `Summarize the following context related to "${topic}":

${contextText}

Provide a brief summary (2-3 sentences) highlighting the most relevant information that would be helpful for understanding the topic or responding to related emails/meetings.`;

    try {
      const response = await this.claudeClient.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 500,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      });

      const content = response.content[0];
      if (content.type === 'text') {
        return content.text;
      }
    } catch (error) {
      console.error('Error generating context summary:', error);
    }

    return `Found ${sources.length} relevant items from your Teams, emails, calendar, and documents.`;
  }

  async generateContextAwareDraft(
    emailSubject: string,
    emailBody: string,
    emailFrom: string,
    context: ContextResult
  ): Promise<{ subject: string; body: string; recipientTo: string }> {
    const contextText = context.sources.map((source, idx) =>
      `[${idx + 1}] ${source.type.toUpperCase()} - ${source.title}\n${source.content}\nDate: ${source.date || 'N/A'}\n`
    ).join('\n');

    const prompt = `You are an intelligent email assistant. Generate a professional draft email response using the following context:

ORIGINAL EMAIL:
From: ${emailFrom}
Subject: ${emailSubject}
Body: ${emailBody}

RELEVANT CONTEXT FROM YOUR TEAMS, EMAILS, CALENDAR, AND DOCUMENTS:
${contextText}

CONTEXT SUMMARY:
${context.summary}

Please generate a comprehensive, professional email response that:
1. Acknowledges the original email
2. Uses relevant information from the context to provide a more informed response
3. References specific details from Teams conversations, meetings, or documents when helpful
4. Is professional and concise
5. Includes an appropriate subject line

Respond with a JSON object:
{
  "subject": "Re: [subject line]",
  "body": "[email body - you can reference specific context sources if helpful]",
  "recipientTo": "${emailFrom}"
}

Return ONLY valid JSON, no additional text.`;

    try {
      const response = await this.claudeClient.messages.create({
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

      const text = content.text.trim();
      let jsonText = text;

      if (text.startsWith('```')) {
        const match = text.match(/```(?:json)?\s*([\s\S]*?)```/);
        if (match) {
          jsonText = match[1].trim();
        }
      }

      const draft = JSON.parse(jsonText);

      return {
        subject: draft.subject || `Re: ${emailSubject}`,
        body: draft.body || '',
        recipientTo: draft.recipientTo || emailFrom
      };
    } catch (error) {
      console.error('Error generating context-aware draft:', error);
      throw error;
    }
  }

  async generateMeetingPrep(
    meetingTitle: string,
    meetingDescription: string,
    attendees: string,
    context: ContextResult
  ): Promise<string> {
    const contextText = context.sources.map((source, idx) =>
      `[${idx + 1}] ${source.type.toUpperCase()} - ${source.title}\n${source.content}\n`
    ).join('\n');

    const prompt = `Generate a meeting preparation briefing for the following meeting:

MEETING DETAILS:
Title: ${meetingTitle}
Description: ${meetingDescription || 'N/A'}
Attendees: ${attendees || 'N/A'}

RELEVANT CONTEXT:
${contextText}

CONTEXT SUMMARY:
${context.summary}

Create a concise meeting prep document that includes:
1. Meeting overview
2. Key context and background (from Teams/emails/previous meetings)
3. Suggested talking points
4. Action items to prepare
5. References to relevant sources

Format as a clear, scannable document.`;

    try {
      const response = await this.claudeClient.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1500,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      });

      const content = response.content[0];
      if (content.type === 'text') {
        return content.text;
      }
    } catch (error) {
      console.error('Error generating meeting prep:', error);
    }

    return 'Meeting preparation unavailable';
  }
}
