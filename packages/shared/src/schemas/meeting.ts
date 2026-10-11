import { z } from 'zod';
import { TaskPriorityEnum } from './task';

export const SummarizeMeetingInputSchema = z.object({
  title: z.string().min(1, 'Meeting title is required'),
  transcript: z.string().min(10, 'Transcript must be at least 10 characters long'),
  date: z.string().optional(),
  participants: z.array(z.string()).optional(),
});

export const CreateMeetingSchema = z.object({
  title: z.string().min(1, 'Meeting title is required'),
  transcript: z.string().min(10, 'Transcript is required'),
  summary: z.string().min(1, 'Summary is required'),
  keyDecisions: z.array(z.string()).default([]),
  actionItems: z.array(
    z.object({
      id: z.string().optional(),
      description: z.string(),
      suggestedAssignee: z.string().optional(),
      suggestedDeadline: z.string().optional(),
      priority: TaskPriorityEnum.optional(),
      status: z.enum(['pending', 'converted', 'dismissed']).default('pending'),
      createdTaskId: z.string().optional(),
    })
  ).default([]),
  risks: z.array(z.string()).default([]),
});

export type SummarizeMeetingInput = z.infer<typeof SummarizeMeetingInputSchema>;
export type CreateMeetingInput = z.infer<typeof CreateMeetingSchema>;
