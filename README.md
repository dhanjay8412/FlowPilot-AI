# FlowPilot AI — AI-Powered Business Operations & Workflow Platform

FlowPilot AI is a modern, full-stack, enterprise-grade AI SaaS application for task management, meeting summarization, intelligent daily reports, data analytics, and team collaboration.

## Features
- **Smart Workspace & Multi-Tenancy**: Tenant-isolated workspaces with granular RBAC (Owner, Admin, Manager, Member).
- **Task Management Engine**: Advanced tasks with status tracking, priority matrix, activity audit logs, and comments.
- **AI Task Assistant**: Turn raw natural language prompts into structured tasks with priority, category, confidence score, and suggested deadline.
- **AI Meeting Summarizer**: Convert transcripts into concise summaries, key decisions, risks, open questions, and action items convertable directly into tasks.
- **AI Daily Report Engine**: Automatically aggregate productivity metrics and generate daily narrative reports.
- **Interactive Analytics**: Data-driven KPI cards, task completion timeline, status/priority breakdown, team workload distribution, and transparent workflow productivity scoring.
- **Notifications & Background Jobs**: In-app notifications and scheduled background worker for overdue tasks and daily digest reports.

## Tech Stack
- **Frontend**: React 18, Vite, TypeScript, Tailwind CSS, Redux Toolkit, TanStack Query, Chart.js, Lucide Icons, React Hook Form, Zod.
- **Backend**: Node.js, Express, TypeScript, Mongoose (MongoDB), Zod, Argon2/bcrypt, Cookie Auth, Helmet, CORS, Rate limiting.
- **AI Integration**: Google Gemini 2.5 Flash API with Zod structured output validation and automatic mock fallback.
- **Worker**: Asynchronous job processor for scheduled reports and task reminders.

## Getting Started

### Prerequisites
- Node.js >= 18.0.0
- npm >= 9.0.0
- MongoDB (local instance or MongoDB Atlas URI)

### Quick Start
1. Clone the repository and install dependencies:
   ```bash
   npm install
   ```
2. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
3. Run development servers (API, Web, Worker):
   ```bash
   npm run dev
   ```
   Or run individual services:
   - Backend API: `npm run dev:api` (http://localhost:5000)
   - Frontend Web: `npm run dev:web` (http://localhost:5173)
   - Worker Service: `npm run dev:worker`

4. Run tests:
   ```bash
   npm run test
   ```

5. Run type checks and build:
   ```bash
   npm run typecheck
   npm run build
   ```
