# FlowPilot AI — System Architecture & Design Specification

## Overview
FlowPilot AI is an enterprise-grade AI-powered business operations and workflow platform. It unifies task management, meeting transcript summarization, team collaboration, data analytics, automated daily reporting, and role-based workspace management into a single cohesive platform.

## Architectural Architecture Diagram
```
               +----------------------------------+
               |    React 18 + Vite (apps/web)    |
               | Redux Toolkit + TanStack Query   |
               +----------------+-----------------+
                                | HTTP REST / JSON / Cookies
                                v
               +----------------------------------+
               |   Express.js API (apps/api)      |
               | Auth / RBAC / Multi-Tenant Guard |
               +--------+----------------+--------+
                        |                |
         +--------------+                +---------------+
         | MongoDB Atlas                                 | Google Gemini API
         v                                               v
  +--------------+                              +----------------+
  |  MongoDB     |                              | Gemini 2.5     |
  |  Database    |                              | Structured     |
  +--------------+                              | AI Engine      |
         ^                                      +----------------+
         |
  +------+-------+
  | Background   |
  | Worker Cron  | (apps/worker)
  +--------------+
```

## Core Modules & Tech Stack
1. **Shared Workspace Layer (`packages/shared`)**: Shared TypeScript interfaces, Zod schemas, contract definitions, and permission matrices.
2. **Backend API (`apps/api`)**: Node.js + Express + Mongoose + Zod + Argon2/bcrypt password hashing + HttpOnly Cookie Auth + Helmet + Rate Limiters + OpenAPI Swagger docs.
3. **Frontend Application (`apps/web`)**: React 18 + TypeScript + Vite + Tailwind CSS + Redux Toolkit + React Router v6 + Chart.js + Lucide Icons + TanStack Query + Zod.
4. **AI Processing Engine**: Gemini API service integration with schema-enforced JSON outputs (Zod) + robust fallback parser & mock provider for offline deterministic testing.
5. **Worker Service (`apps/worker`)**: Scheduled daily report generator and automated task overdue & reminder notification processor.

## Role-Based Access Control (RBAC) Matrix
| Permission / Action | Owner | Admin | Manager | Member |
|---|---|---|---|---|
| Delete Workspace | Yes | No | No | No |
| Manage Workspace Settings | Yes | Yes | No | No |
| Invite/Remove Members | Yes | Yes | No | No |
| Change Member Roles | Yes | Yes | No | No |
| Assign Tasks to Anyone | Yes | Yes | Yes | Own/Team |
| Create/Edit/Delete Tasks | Yes | Yes | Yes | Permitted |
| AI Task Creation & Meeting Summarization | Yes | Yes | Yes | Yes |
| View Analytics & Daily Reports | Yes | Yes | Yes | View Only |

## Database Schema Model Definitions
- **User**: Name, Email (unique), PasswordHash, EmailVerified, Status, Timestamps.
- **Workspace**: Name, Slug, OwnerId, Settings, Timestamps.
- **Membership**: WorkspaceId, UserId, Role (Owner, Admin, Manager, Member), Department, JoinedAt.
- **Task**: WorkspaceId, Title, Description, CreatedBy, AssignedTo, Priority (Low, Medium, High, Critical), PrioritySource (manual, AI-assisted), Category, Status (Todo, In Progress, Blocked, Done), Deadline, CompletedAt, Version.
- **TaskActivity**: WorkspaceId, TaskId, ActorId, EventType, Changes, CreatedAt.
- **Meeting**: WorkspaceId, Title, Transcript, Summary, KeyDecisions, ActionItems, Risks, CreatedBy, Timestamps.
- **Comment**: WorkspaceId, TaskId, AuthorId, Content, Timestamps.
- **Notification**: WorkspaceId, RecipientId, Type, Title, Message, ResourceType, ResourceId, ReadAt, CreatedAt.
- **ActivityEvent**: WorkspaceId, ActorId, Action, EntityType, EntityId, Metadata, CreatedAt.
- **DailyReport**: WorkspaceId, ReportDate, Timezone, MetricsSnapshot, Narrative, Status, GeneratedAt.
- **FileMetadata**: WorkspaceId, UploadedBy, ResourceType, ResourceId, StorageKey, OriginalName, ContentType, Size, CreatedAt.

## Security & Tenant Isolation
- **Authentication**: JWT signed token stored in HttpOnly, SameSite, Secure cookies or Authorization bearer headers.
- **Tenant Isolation**: Every database query explicitly filters by `workspaceId` extracted from validated user token claims and verified workspace membership.
