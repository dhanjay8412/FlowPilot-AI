import { z } from 'zod';

export const CreateWorkspaceSchema = z.object({
  name: z.string().min(2, 'Workspace name must be at least 2 characters').max(100),
});

export const UpdateWorkspaceSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  settings: z.object({
    timezone: z.string().optional(),
    defaultTaskPriority: z.enum(['Low', 'Medium', 'High', 'Critical']).optional(),
    enableAiSuggestions: z.boolean().optional(),
    dailyReportTime: z.string().optional(),
  }).optional(),
});

export const AddMemberSchema = z.object({
  email: z.string().email('Valid user email required'),
  role: z.enum(['Admin', 'Manager', 'Member']).default('Member'),
  department: z.string().optional(),
});

export const UpdateMemberRoleSchema = z.object({
  role: z.enum(['Owner', 'Admin', 'Manager', 'Member']),
  department: z.string().optional(),
});
