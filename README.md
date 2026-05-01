# Expense Tracker — Production Ready

A modern, full-stack expense tracking application built with React, Node.js, and PostgreSQL.

## 🏗️ Project Structure

```
expense-tracker/
├── client/                 # React + TypeScript + Vite
├── server/                 # Express + TypeScript
├── packages/
│   └── types/             # Shared TypeScript interfaces
├── package.json           # Root npm workspaces config
├── tsconfig.json          # Shared TypeScript config
├── .eslintrc.json         # ESLint rules
├── .prettierrc.json       # Prettier formatting
└── .gitignore
```

## 🚀 Quick Start

### Prerequisites
- Node.js ≥ 20.0.0
- npm ≥ 10.0.0
- PostgreSQL (or Neon for serverless)

### Installation

```bash
# Clone and navigate
cd expense-tracker

# Install all dependencies
npm install

# Copy environment files
cp server/.env.example server/.env
cp client/.env.example client/.env

# Update .env files with actual values
```

### Development

```bash
# Start both client and server with one command
npm run dev

# Or run individually:
npm run dev --workspace=@expense-tracker/client
npm run dev --workspace=@expense-tracker/server
```

### Build & Deploy

```bash
# Build all workspaces
npm run build

# Format and lint
npm run format
npm run lint
```

## 📦 Workspaces

### `/packages/types`
Shared TypeScript types for the entire project. This is the single source of truth for all data contracts.

**Key types:**
- `Expense` — Expense entity
- `Category` — Category entity
- `CreateExpenseBody` — Request payload
- `CreateCategoryBody` — Request payload
- `ExpenseFilters` — Query filters
- `ApiResponse<T>` — Standard API response

### `/server`
Express.js API server with TypeScript.

**Features:**
- Health check endpoint at `/api/health`
- CORS configured for client
- Environment-based configuration
- Strict TypeScript compilation

**Running:**
```bash
npm run dev --workspace=@expense-tracker/server
npm run build --workspace=@expense-tracker/server
```

### `/client`
React + Vite + TypeScript frontend with Tailwind CSS.

**Features:**
- Hot module replacement in dev
- Production-optimized builds
- Tailwind CSS for styling
- Proxy to backend for API calls

**Running:**
```bash
npm run dev --workspace=@expense-tracker/client
npm run build --workspace=@expense-tracker/client
```

## 🔧 Configuration

### Environment Variables

**Server (`.env`):**
```
DATABASE_URL=postgresql://user:password@host/dbname
PORT=3000
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

**Client (`.env`):**
```
VITE_API_BASE_URL=http://localhost:3000/api
```

### TypeScript

- **Server:** ES2022 target, Node module resolution
- **Client:** ESNext target with React JSX
- **Strict mode enabled across all workspaces**

### Code Quality

- **ESLint:** Catches unused variables, implicit any, etc.
- **Prettier:** Consistent formatting

```bash
# Format all code
npm run format

# Check formatting
npm run format:check

# Lint all code
npm run lint
```

## 📋 API Endpoints

*(To be implemented in Batch 1)*

- `GET /api/health` — Health check
- `GET /api/expenses` — List expenses with filters
- `POST /api/expenses` — Create expense
- `GET /api/expenses/:id` — Get expense by ID
- `PUT /api/expenses/:id` — Update expense
- `DELETE /api/expenses/:id` — Delete expense
- `GET /api/categories` — List categories
- `POST /api/categories` — Create category

## 🚢 Deployment

### Vercel Setup

1. Client: Static site from `/client` directory
2. Server: Serverless function from `/server` directory
3. Database: Neon PostgreSQL

*(Deployment configuration in future batch)*

## 📝 License

MIT
