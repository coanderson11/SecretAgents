import { PrismaClient } from '@prisma/client';
import { ClaudeService, ExtractedTask } from './claude.service';
import { OutlookService, OutlookEmail } from './outlook.service';

const prisma = new PrismaClient();

export class TaskService {
  private claudeService: ClaudeService;

  constructor() {
    this.claudeService = new ClaudeService();
  }

  async processEmail(
    userId: string,
    email: OutlookEmail,
    outlookService: OutlookService
  ): Promise<{ emailId: string; tasksCreated: number }> {
    try {
      // Check if email already exists
      let dbEmail = await (prisma.email.findUnique({
        where: { outlookId: (email as any).id } as any
      }) as any);

      // Create email record if it doesn't exist
      if (!dbEmail) {
        dbEmail = await (prisma.email.create({
          data: {
            sessionId: 'legacy-' + userId,
            subject: email.subject,
            from: email.from,
            body: email.body
          } as any
        }) as any);
      }

      // Extract tasks using Claude
      const extractedTasks = await this.claudeService.extractTasksFromEmail(
        email.subject,
        email.body,
        email.from
      );

      // Create tasks in database
      let tasksCreated = 0;
      for (const task of extractedTasks) {
        await (prisma.task.create({
          data: {
            userId,
            emailId: dbEmail.id,
            sessionId: 'legacy-' + userId,
            title: task.title,
            description: task.description,
            dueDate: task.dueDate ? new Date(task.dueDate) : null,
            priority: task.priority,
            category: task.category,
            status: 'PENDING'
          } as any
        }) as any);
        tasksCreated++;
      }

      return { emailId: dbEmail.id, tasksCreated };
    } catch (error) {
      console.error('Error processing email:', error);
      throw error;
    }
  }

  async processMultipleEmails(
    userId: string,
    emails: OutlookEmail[],
    outlookService: OutlookService
  ): Promise<{ totalEmails: number; totalTasks: number }> {
    let totalTasks = 0;

    for (const email of emails) {
      const result = await this.processEmail(userId, email, outlookService);
      totalTasks += result.tasksCreated;
    }

    return {
      totalEmails: emails.length,
      totalTasks
    };
  }

  async getTasks(userId: string, filters?: {
    status?: string;
    priority?: string;
    category?: string;
  }) {
    const where: any = { userId } as any;

    if (filters?.status) {
      where.status = filters.status;
    }
    if (filters?.priority) {
      where.priority = filters.priority;
    }
    if (filters?.category) {
      where.category = filters.category;
    }

    return await (prisma.task.findMany({
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
      orderBy: [
        { status: 'asc' },
        { dueDate: 'asc' },
        { priority: 'desc' },
        { createdAt: 'desc' }
      ]
    }) as any);
  }

  async updateTask(taskId: string, userId: string, updates: {
    title?: string;
    description?: string;
    dueDate?: Date | null;
    priority?: 'HIGH' | 'MEDIUM' | 'LOW';
    category?: string;
    status?: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  }) {
    return await (prisma.task.update({
      where: {
        id: taskId
      } as any,
      data: updates
    }) as any);
  }

  async deleteTask(taskId: string, userId: string) {
    return await (prisma.task.delete({
      where: {
        id: taskId
      } as any
    }) as any);
  }
}
