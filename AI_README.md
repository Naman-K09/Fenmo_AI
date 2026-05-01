# AI Context Readme: Expense Tracker

## Overview
This is a modern, full-stack expense tracking application built using a monorepo structure with npm workspaces. 

## Tech Stack
- **Frontend (`/client`)**: React, Vite, TypeScript, Tailwind CSS.
- **Backend (`/server`)**: Node.js, Express.js, TypeScript.
- **Database**: PostgreSQL (using the `pg` package).
- **Shared Types (`/packages/types`)**: Common TypeScript interfaces used across both client and server.

## Project Structure
- `/client`: Frontend application. Basic React setup with `App.tsx` and Tailwind configured.
- `/server`: Express API server. Includes routing for `/api/categories` and `/api/expenses`, database connection logic in `db.ts`, and error handling.
- `/packages/types`: Shared TypeScript interfaces ensuring type safety between frontend and backend. 
- Root files contain linting and formatting rules (`.eslintrc.json`, `.prettierrc.json`).

## Key Findings
- The application uses `npm workspaces` for package management. Commands like `npm run dev` at the root run both client and server simultaneously.
- The server relies on environment variables (`DATABASE_URL`, `PORT`, `CLIENT_URL`) and has a health check endpoint `/api/health` that verifies database connectivity.
- Database access is handled via typed query helpers (`queryOne`, `queryMany`, `query`) wrapping the `pg` pool.
- Error handling is managed by a centralized middleware checking for `AppError` instances.
- The UI currently has a basic skeleton in `App.tsx` using Tailwind classes for styling.

## Progress Tracking
- [x] **BATCH 3 — Backend: POST /expenses (Idempotent Create)**: Verified the implementation in `server/src/routes/expenses.ts`. Validations, Idempotency-Key header handling, Category existence checks, and response shapes correctly match the requirements without changing any pre-existing variables.
- [x] **BATCH 4 — Frontend: Project Setup & API Layer**: Configured Shadcn UI, set up absolute imports, centralized API interactions with exponential backoff logic, added an idempotency hook, and configured global React Query setup.
- [x] **BATCH 5 — Frontend: Add Expense Form**: Created a highly robust `ExpenseForm` with Zod validation, precise Shadcn inputs (including dynamic category fetching), explicit submission state handling, inline API error display, and optimistic cache invalidation.

I am ready to proceed with your instructions.
