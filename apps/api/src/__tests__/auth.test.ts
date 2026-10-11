import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../app';
import { connectDB, disconnectDB } from '../config/db';
import { User } from '../models/User';
import { Workspace } from '../models/Workspace';
import { Membership } from '../models/Membership';

describe('Auth API Endpoints', () => {
  beforeAll(async () => {
    await connectDB();
    await User.deleteMany({ email: /test-auth-.*@example\.com/ });
  });

  afterAll(async () => {
    await User.deleteMany({ email: /test-auth-.*@example\.com/ });
    await disconnectDB();
  });

  it('should register a new user and auto-create a workspace', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({
        name: 'Test Auth User',
        email: 'test-auth-user@example.com',
        password: 'Password123!',
        workspaceName: 'Test Org',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe('test-auth-user@example.com');
    expect(res.body.data.workspace.name).toBe('Test Org');
    expect(res.body.data.workspace.userRole).toBe('Owner');
  });

  it('should prevent registering duplicate email', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({
        name: 'Duplicate User',
        email: 'test-auth-user@example.com',
        password: 'Password123!',
      });

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
  });

  it('should login successfully with valid credentials', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'test-auth-user@example.com',
        password: 'Password123!',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.user.email).toBe('test-auth-user@example.com');
  });

  it('should reject login with wrong password', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'test-auth-user@example.com',
        password: 'WrongPassword!',
      });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
});
