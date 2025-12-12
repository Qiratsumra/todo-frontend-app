# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # Start development server (localhost:3000)
npm run build      # Run migrations + production build
npm run lint       # Run ESLint
npm run migrate    # Run better-auth database migrations
npm start          # Start production server
```

## Architecture

This is a Next.js 16 frontend using the App Router, part of a full-stack todo application with a FastAPI backend.

### Tech Stack
- **Framework**: Next.js 16 with App Router (React 19)
- **Auth**: Better-auth (JWT in HTTP-only cookies)
- **UI**: shadcn/ui components (Radix UI + Tailwind CSS v4)
- **Forms**: React Hook Form + Zod validation
- **Styling**: Tailwind CSS with CSS variables

### Directory Structure
```
app/                    # App Router pages
├── api/               # API routes (better-auth handlers)
├── signin/page.tsx    # Login page
├── signup/page.tsx    # Registration page
├── todo/page.tsx      # Protected todo dashboard
└── layout.tsx         # Root layout

components/
├── ui/                # shadcn/ui primitives (button, input, form, etc.)
├── task-*.tsx         # Task management components
├── todo-page-client.tsx  # Main todo client component
├── Sidebar.tsx        # Navigation sidebar
└── Sign*.tsx          # Auth form components

lib/
├── auth.ts            # Better-auth server config
├── auth-client.ts     # Better-auth client
└── utils.ts           # cn() utility for Tailwind class merging

types/
└── index.ts           # TypeScript type definitions
```

### Path Alias
`@/*` maps to project root (e.g., `@/components`, `@/lib`)

### Authentication Flow
1. Better-auth handles signin/signup at `/api/auth/[...all]`
2. JWT stored in HTTP-only cookies
3. Protected routes check auth via `auth.api.getSession()`
4. Auth client (`lib/auth-client.ts`) used for client-side auth operations

### Backend Integration
The frontend communicates with a FastAPI backend (typically at `localhost:8000`). Tasks are scoped to authenticated users via JWT validation.

## Parent Project

See `../CLAUDE.md` for SDD (Spec-Driven Development) workflow, PHR recording, and ADR guidelines. Key specs located in `../specs/001-fullstack-todo-app/`.
