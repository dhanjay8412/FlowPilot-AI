import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../app';
import { connectDB, disconnectDB } from '../config/db';
import { User } from '../models/User';
import { Workspace } from '../models/Workspace';
import { Membership } from '../models/Membership';
import { Task } from '../models/Task';

describe('Tenant Isolation Guard', () => {
  let userA: any, tokenA: string, wsA: any;
  let userB: any, tokenB: string, wsB: any;
  let taskA: any;

  beforeAll(async () => {
    await connectDB();
    await User.deleteMany({ email: /tenant-.*@example\.com/ });

    // Register User A
    const resA = await request(app).post('/api/v1/auth/register').send({
      name: 'User A',
      email: 'tenant-usera@example.com',
      password: 'Password123!',
      workspaceName: 'Workspace A',
    });
    tokenA = resA.body.data.token;
    userA = resA.body.data.user;
    wsA = resA.body.data.workspace;

    // Register User B
    const resB = await request(app).post('/api/v1/auth/register').send({
      name: 'User B',
      email: 'tenant-userb@example.com',
      password: 'Password123!',
      workspaceName: 'Workspace B',
    });
    tokenB = resB.body.data.token;
    userB = resB.body.data.user;
    wsB = resB.body.data.workspace;

    // Create Task in Workspace A
    const taskRes = await request(app)
      .post('/api/v1/tasks')
      .set('Authorization', `Bearer ${tokenA}`)
      .set('X-Workspace-ID', wsA.id)
      .send({
        title: 'Secret Task in Workspace A',
        priority: 'High',
        category: 'Engineering',
      });
    taskA = taskRes.body.data;
  });

  afterAll(async () => {
    await User.deleteMany({ email: /tenant-.*@example\.com/ });
    await Task.deleteMany({ title: /Secret Task/ });
    await disconnectDB();
  });

  it('should allow User A to view task in Workspace A', async () => {
    const res = await request(app)
      .get(`/api/v1/tasks/${taskA.id}`)
      .set('Authorization', `Bearer ${tokenA}`)
      .set('X-Workspace-ID', wsA.id);

    expect(res.status).toBe(200);
    expect(res.body.data.title).toBe('Secret Task in Workspace A');
  });

  it('should BLOCK User B from accessing Workspace A tasks', async () => {
    const res = await request(app)
      .get(`/api/v1/tasks/${taskA.id}`)
      .set('Authorization', `Bearer ${tokenB}`)
      .set('X-Workspace-ID', wsA.id);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('Access denied');
  });

  it('should BLOCK User B from accessing Workspace A tasks via header spoofing', async () => {
    const res = await request(app)
      .get('/api/v1/tasks')
      .set('Authorization', `Bearer ${tokenB}`)
      .set('X-Workspace-ID', wsA.id);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });
});
