import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { connectDB, disconnectDB } from './config/db';
import { User } from './models/User';
import { Workspace } from './models/Workspace';
import { Membership } from './models/Membership';
import { Task } from './models/Task';
import { Meeting } from './models/Meeting';
import { Notification } from './models/Notification';
import { TaskActivity } from './models/TaskActivity';

async function seed() {
  if (process.env.NODE_ENV === 'production') {
    console.error('[Seed] FATAL: Database seeding is strictly forbidden in production mode!');
    process.exit(1);
  }

  console.log('[Seed] Starting database seeding...');
  await connectDB();

  // Clean existing demo data
  await Promise.all([
    User.deleteMany({ email: /@flowpilot\.ai$/ }),
    Workspace.deleteMany({ slug: 'acme-operations' }),
  ]);

  const passwordHash = await bcrypt.hash('Password123!', 10);

  // 1. Create Users
  const owner = await User.create({
    name: 'Sarah Connor (Owner)',
    email: 'sarah@flowpilot.ai',
    passwordHash,
    emailVerified: true,
  });

  const manager = await User.create({
    name: 'Alex Rivera (Manager)',
    email: 'alex@flowpilot.ai',
    passwordHash,
    emailVerified: true,
  });

  const dev = await User.create({
    name: 'David Chen (Dev)',
    email: 'david@flowpilot.ai',
    passwordHash,
    emailVerified: true,
  });

  // 2. Create Workspace
  const workspace = await Workspace.create({
    name: 'Acme Operations',
    slug: 'acme-operations',
    ownerId: owner._id,
    settings: {
      timezone: 'America/New_York',
      defaultTaskPriority: 'High',
      enableAiSuggestions: true,
      dailyReportTime: '17:00',
    },
  });

  // 3. Create Memberships
  await Membership.create([
    { workspaceId: workspace._id, userId: owner._id, role: 'Owner', department: 'Executive' },
    { workspaceId: workspace._id, userId: manager._id, role: 'Manager', department: 'Operations' },
    { workspaceId: workspace._id, userId: dev._id, role: 'Member', department: 'Engineering' },
  ]);

  // 4. Create Tasks
  const today = new Date();
  const yesterday = new Date(Date.now() - 86400000);
  const tomorrow = new Date(Date.now() + 86400000);
  const nextWeek = new Date(Date.now() + 86400000 * 7);

  const t1 = await Task.create({
    workspaceId: workspace._id,
    title: 'Resolve critical customer payment gateway timeout issue',
    description: 'Multiple users reporting 504 gateway timeout when submitting checkout orders.',
    createdBy: owner._id,
    assignedTo: dev._id,
    priority: 'Critical',
    prioritySource: 'AI-assisted',
    category: 'Engineering',
    status: 'In Progress',
    deadline: today,
  });

  const t2 = await Task.create({
    workspaceId: workspace._id,
    title: 'Finalize Q4 workflow automation architecture roadmap',
    description: 'Review background worker queue designs and database isolation boundaries.',
    createdBy: owner._id,
    assignedTo: manager._id,
    priority: 'High',
    prioritySource: 'manual',
    category: 'Operations',
    status: 'Todo',
    deadline: tomorrow,
  });

  const t3 = await Task.create({
    workspaceId: workspace._id,
    title: 'Conduct accessibility contrast audit for dark theme UI',
    description: 'Ensure color ratios meet WCAG 2.2 AA standards across all interactive components.',
    createdBy: manager._id,
    assignedTo: dev._id,
    priority: 'Medium',
    prioritySource: 'manual',
    category: 'Design',
    status: 'Done',
    deadline: yesterday,
    completedAt: yesterday,
  });

  const t4 = await Task.create({
    workspaceId: workspace._id,
    title: 'Update OAuth2 authorization documentation',
    description: 'Add clear API specification guidelines for client integrations.',
    createdBy: manager._id,
    assignedTo: dev._id,
    priority: 'Low',
    prioritySource: 'manual',
    category: 'Documentation',
    status: 'Todo',
    deadline: nextWeek,
  });

  // 5. Create Task Activity
  await TaskActivity.create([
    { workspaceId: workspace._id, taskId: t1._id, actorId: owner._id, eventType: 'created' },
    { workspaceId: workspace._id, taskId: t1._id, actorId: dev._id, eventType: 'status_change', changes: { status: { old: 'Todo', new: 'In Progress' } } },
    { workspaceId: workspace._id, taskId: t3._id, actorId: dev._id, eventType: 'status_change', changes: { status: { old: 'In Progress', new: 'Done' } } },
  ]);

  // 6. Create Sample Meeting
  await Meeting.create({
    workspaceId: workspace._id,
    title: 'Q4 Product Operations & AI Alignment Sync',
    transcript: `Sarah: Let's focus on finishing our multi-tenant isolation audit by Friday.
Alex: I have updated the background queue design. We also need to fix the payment gateway timeout today.
David: I am already looking into the gateway logs and will push a fix by 4 PM.
Sarah: Perfect. Let's make sure WCAG accessibility is verified on dark mode.`,
    summary: 'The team aligned on Q4 operations priorities, focusing on multi-tenant security audits, fixing the payment gateway timeout, and completing UI accessibility checks.',
    keyDecisions: [
      'Prioritize payment gateway timeout patch for immediate deployment.',
      'Complete tenant isolation audit by Friday.',
    ],
    actionItems: [
      {
        description: 'Deploy hotfix for payment gateway timeout',
        suggestedAssignee: 'David Chen',
        suggestedDeadline: today.toISOString().split('T')[0],
        priority: 'Critical',
        status: 'converted',
        createdTaskId: t1._id,
      },
      {
        description: 'Schedule security peer review for tenant isolation middleware',
        suggestedAssignee: 'Alex Rivera',
        suggestedDeadline: tomorrow.toISOString().split('T')[0],
        priority: 'High',
        status: 'pending',
      },
    ],
    risks: ['Third-party payment provider API rate limits during peak deployment.'],
    createdBy: owner._id,
  });

  // 7. Create Sample Notification
  await Notification.create({
    workspaceId: workspace._id,
    recipientId: dev._id,
    type: 'task_assigned',
    title: 'Urgent Task Assigned',
    message: 'You were assigned to: "Resolve critical customer payment gateway timeout issue"',
    resourceType: 'task',
    resourceId: t1._id,
  });

  console.log('[Seed] Database seed completed successfully!');
  console.log('[Seed] Login Credentials:');
  console.log('   Email: sarah@flowpilot.ai');
  console.log('   Password: Password123!');
  await disconnectDB();
}

seed().catch((err) => {
  console.error('[Seed] Error:', err);
  process.exit(1);
});
