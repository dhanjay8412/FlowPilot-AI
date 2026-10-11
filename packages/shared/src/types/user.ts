export type Role = 'Owner' | 'Admin' | 'Manager' | 'Member';

export interface User {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  status: 'active' | 'suspended' | 'invited';
  createdAt: string;
  updatedAt: string;
}

export interface WorkspaceMember {
  id: string;
  workspaceId: string;
  userId: string;
  role: Role;
  department?: string;
  joinedAt: string;
  user?: User;
}
