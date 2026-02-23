import Anthropic from '@anthropic-ai/sdk';

export interface ExtractedTask {
  title: string;
  description?: string;
  dueDate?: string; // ISO date string
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  category?: string;
}

export class ClaudeService {
  private client: Anthropic;

  constructor() {
    this.client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY
    });
  }

  async extractTasksFromEmail(emailSubject: string, emailBody: string, emailFrom: string): Promise<ExtractedTask[]> {
    const prompt = `Analyze the following email and extract any actionable tasks. For each task, identify:
- Title (brief, clear description of the action)
- Description (optional additional details)
- Due date (if mentioned, in ISO format YYYY-MM-DD)
- Priority (HIGH/MEDIUM/LOW based on urgency and importance)
- Category (e.g., "Meeting", "Review", "Follow-up", "Development", etc.)

Email From: ${emailFrom}
Subject: ${emailSubject}

Body:
${emailBody}

Respond with a JSON array of tasks. If no tasks are found, return an empty array.
Example format:
[
  {
    "title": "Review project proposal",
    "description": "Review the Q4 project proposal and provide feedback",
    "dueDate": "2026-02-01",
    "priority": "HIGH",
    "category": "Review"
  }
]

Important:
- Only extract clear, actionable items (not just information)
- Infer priority from context (words like "urgent", "ASAP", "important" suggest HIGH priority)
- Extract explicit dates or infer from context (e.g., "tomorrow", "next week", "by Friday")
- Be concise with titles (5-10 words max)
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

      const tasks = JSON.parse(jsonText);

      if (!Array.isArray(tasks)) {
        console.error('Claude response is not an array:', tasks);
        return [];
      }

      // Validate and normalize tasks
      return tasks.map((task: any) => ({
        title: task.title || 'Untitled task',
        description: task.description || undefined,
        dueDate: task.dueDate || undefined,
        priority: ['HIGH', 'MEDIUM', 'LOW'].includes(task.priority) ? task.priority : 'MEDIUM',
        category: task.category || undefined
      }));
    } catch (error) {
      console.error('Error extracting tasks with Claude:', error);
      if (error instanceof Error) {
        console.error('Error message:', error.message);
      }
      return [];
    }
  }
}
