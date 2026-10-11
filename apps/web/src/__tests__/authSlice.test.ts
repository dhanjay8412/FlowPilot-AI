import { describe, it, expect, beforeEach } from 'vitest';
import authReducer, { setCredentials, logout } from '../store/slices/authSlice';
import { User, Workspace } from '@flowpilot/shared';

describe('authSlice reducer', () => {
  beforeEach(() => {
    if (typeof localStorage !== 'undefined') {
      localStorage.clear();
    }
  });

  const mockUser: User = {
    id: 'user-1',
    name: 'Sarah Connor',
    email: 'sarah@flowpilot.ai',
    emailVerified: true,
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const mockWorkspace: Workspace = {
    id: 'ws-1',
    name: 'Acme Operations',
    slug: 'acme-operations',
    ownerId: 'user-1',
    settings: {
      timezone: 'America/New_York',
      defaultTaskPriority: 'High',
      enableAiSuggestions: true,
      dailyReportTime: '17:00',
    },
    memberCount: 3,
    userRole: 'Owner',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  it('handles setCredentials correctly', () => {
    const initialState = {
      user: null,
      token: null,
      currentWorkspace: null,
      workspaces: [],
      isAuthenticated: false,
    };

    const nextState = authReducer(
      initialState,
      setCredentials({
        user: mockUser,
        token: 'test-jwt-token',
        workspace: mockWorkspace,
        workspaces: [mockWorkspace],
      })
    );

    expect(nextState.isAuthenticated).toBe(true);
    expect(nextState.token).toBe('test-jwt-token');
    expect(nextState.user?.email).toBe('sarah@flowpilot.ai');
    expect(nextState.currentWorkspace?.name).toBe('Acme Operations');
  });

  it('handles logout correctly', () => {
    const activeState = {
      user: mockUser,
      token: 'test-jwt-token',
      currentWorkspace: mockWorkspace,
      workspaces: [mockWorkspace],
      isAuthenticated: true,
    };

    const nextState = authReducer(activeState, logout());
    expect(nextState.isAuthenticated).toBe(false);
    expect(nextState.token).toBeNull();
    expect(nextState.user).toBeNull();
    expect(nextState.currentWorkspace).toBeNull();
  });
});
