import { BaseTool } from './base-tool.js';
import { ClaudeService } from '../../services/claude.service.js';
import { logger } from '../../utils/logger.js';

export class ExtractTasksTool extends BaseTool {
  name = 'extract_tasks_from_email';
  description = 'Extract actionable tasks from an email using Claude AI';
  inputSchema = {
    type: 'object' as const,
    properties: {
      emailId: {
        type: 'string',
        description: 'The email ID to extract tasks from'
      }
    },
    required: ['emailId']
  };

  async execute(params: any) {
    try {
      const { emailId } = params;
      logger.info(`Extracting tasks from email: ${emailId}`);

      const email = await this.prisma.email.findUnique({
        where: { id: emailId }
      });

      if (!email) {
        throw new Error(`Email ${emailId} not found`);
      }

      const claudeService = new ClaudeService();
      const tasks = await claudeService.extractTasksFromEmail(email.subject, email.body, email.from);

      logger.info(`Extracted ${tasks.length} tasks`);

      return {
        emailId,
        emailSubject: email.subject,
        tasksExtracted: tasks.length,
        tasks: tasks.map(t => ({
          title: t.title,
          description: t.description,
          priority: t.priority,
          category: t.category,
          dueDate: t.dueDate
        }))
      };
    } catch (error) {
      this.handleError(error, 'Failed to extract tasks');
    }
  }
}

export class ListTasksTool extends BaseTool {
  name = 'list_tasks';
  description = 'List tasks with optional filters';
  inputSchema = {
    type: 'object' as const,
    properties: {
      status: {
        type: 'string',
        enum: ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'],
        description: 'Filter by task status'
      },
      category: {
        type: 'string',
        description: 'Filter by category'
      },
      priority: {
        type: 'string',
        enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'],
        description: 'Filter by priority'
      },
      limit: {
        type: 'number',
        description: 'Maximum number of tasks to return',
        default: 50
      }
    }
  };

  async execute(params: any) {
    try {
      const { status, category, priority, limit = 50 } = params;
      logger.info(`Listing tasks with filters: status=${status}, category=${category}, priority=${priority}`);

      const where: any = {
        sessionId: this.userContext.getSessionId()
      };

      if (status) where.status = status;
      if (category) where.category = category;
      if (priority) where.priority = priority;

      const tasks = await this.prisma.task.findMany({
        where,
        take: limit,
        orderBy: [
          { priority: 'desc' },
          { dueDate: 'asc' }
        ],
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
        count: tasks.length,
        tasks: tasks.map(t => ({
          id: t.id,
          title: t.title,
          description: t.description,
          status: t.status,
          priority: t.priority,
          category: t.category,
          dueDate: t.dueDate,
          emailSubject: t.email?.subject
        }))
      };
    } catch (error) {
      this.handleError(error, 'Failed to list tasks');
    }
  }
}

export class UpdateTaskTool extends BaseTool {
  name = 'update_task';
  description = 'Update a task properties';
  inputSchema = {
    type: 'object' as const,
    properties: {
      taskId: {
        type: 'string',
        description: 'The task ID to update'
      },
      status: {
        type: 'string',
        enum: ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']
      },
      priority: {
        type: 'string',
        enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT']
      },
      dueDate: {
        type: 'string',
        description: 'Due date in ISO format'
      }
    },
    required: ['taskId']
  };

  async execute(params: any) {
    try {
      const { taskId, ...updates } = params;
      logger.info(`Updating task: ${taskId}`);

      const task = await this.prisma.task.update({
        where: { id: taskId },
        data: {
          ...updates,
          dueDate: updates.dueDate ? new Date(updates.dueDate) : undefined
        }
      });

      return {
        success: true,
        task: {
          id: task.id,
          title: task.title,
          status: task.status,
          priority: task.priority,
          dueDate: task.dueDate
        }
      };
    } catch (error) {
      this.handleError(error, 'Failed to update task');
    }
  }
}

export class DeleteTaskTool extends BaseTool {
  name = 'delete_task';
  description = 'Delete a task';
  inputSchema = {
    type: 'object' as const,
    properties: {
      taskId: {
        type: 'string',
        description: 'The task ID to delete'
      }
    },
    required: ['taskId']
  };

  async execute(params: any) {
    try {
      const { taskId } = params;
      logger.info(`Deleting task: ${taskId}`);

      await this.prisma.task.delete({
        where: { id: taskId }
      });

      return {
        success: true,
        message: `Task ${taskId} deleted successfully`
      };
    } catch (error) {
      this.handleError(error, 'Failed to delete task');
    }
  }
}

export class GetTaskStatsTool extends BaseTool {
  name = 'get_task_stats';
  description = 'Get statistics about tasks';
  inputSchema = {
    type: 'object' as const,
    properties: {}
  };

  async execute(params: any) {
    try {
      logger.info('Getting task statistics');

      const sessionId = this.userContext.getSessionId();

      const [total, pending, inProgress, completed] = await Promise.all([
        this.prisma.task.count({ where: { sessionId } }),
        this.prisma.task.count({ where: { sessionId, status: 'PENDING' } }),
        this.prisma.task.count({ where: { sessionId, status: 'IN_PROGRESS' } }),
        this.prisma.task.count({ where: { sessionId, status: 'COMPLETED' } })
      ]);

      return {
        total,
        byStatus: {
          pending,
          inProgress,
          completed
        }
      };
    } catch (error) {
      this.handleError(error, 'Failed to get task stats');
    }
  }
}
