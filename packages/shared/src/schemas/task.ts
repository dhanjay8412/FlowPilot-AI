import { z } from 'zod';

export const TaskPriorityEnum = z.enum(['Low', 'Medium', 'High', 'Critical']);
export const TaskStatusEnum = z.enum(['Todo', 'In Progress', 'Blocked', 'Done']);

export const CreateTaskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  description: z.string().optional().default(''),
  assignedTo: z.string().optional(),
  priority: TaskPriorityEnum.default('Medium'),
  prioritySource: z.enum(['manual', 'AI-assisted']).default('manual'),
  category: z.string().min(1, 'Category is required').default('General'),
  status: TaskStatusEnum.default('Todo'),
  deadline: z.string().optional(),
});

export const UpdateTaskSchema = CreateTaskSchema.partial().extend({
  version: z.number().optional(),
});

export const AddCommentSchema = z.object({
  content: z.string().min(1, 'Comment text cannot be empty').max(2000, 'Comment too long'),
});

export const ClassifyTaskInputSchema = z.object({
  prompt: z.string().min(3, 'Prompt must be at least 3 characters'),
  context: z.string().optional(),
});

export type CreateTaskInput = z.infer<typeof CreateTaskSchema>;
export type UpdateTaskInput = z.infer<typeof UpdateTaskSchema>;
