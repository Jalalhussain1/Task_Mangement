# Task Management Monorepo

A monorepo containing a full-stack task management application with shared utilities.

## Project Structure

```
├── backend/          # Node.js/Express API server
├── frontend/         # React frontend application
├── shared/           # Shared utilities and types
├── package.json      # Root package.json with workspace configuration
└── .gitignore        # Git ignore rules
```

## Workspaces

- **@task-management/backend**: Express.js API server
- **@task-management/frontend**: React frontend application
- **@task-management/shared**: Shared utilities, types, and validation schemas

## Getting Started

### Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   ```bash
   cd backend
   cp .env.example .env
   # Edit .env with your database configuration
   ```
4. Initialize the database:
   ```bash
   npm run db:init
   ```

### Development

Start both backend and frontend in development mode:
```bash
npm run dev
```

Or start them individually:
```bash
# Backend only
npm run dev:backend

# Frontend only
npm run dev:frontend
```

### Available Scripts

- `npm run dev` - Start both backend and frontend in development mode
- `npm run build` - Build all workspaces
- `npm run test` - Run tests across all workspaces
- `npm run lint` - Run linting across all workspaces
- `npm run clean` - Clean node_modules across all workspaces

#### Backend Scripts
- `npm run dev:backend` - Start backend server in development mode
- `npm run db:init` - Initialize database schema
- `npm run db:reset` - Reset and reinitialize database

## Technology Stack

### Backend
- Node.js
- Express.js
- PostgreSQL with pg pool
- CORS, Helmet, Morgan for security and logging
- Zod for validation
- Jest for testing

### Frontend
- React 18
- Vite for build tooling
- React Router for navigation
- Axios for HTTP requests
- Vitest for testing

### Shared
- Zod for schema validation
- Common utilities and types
- Validation schemas for API requests

## Development Workflow

1. The monorepo uses npm workspaces for dependency management
2. Shared code should be placed in the `shared` workspace
3. Both backend and frontend can import from the shared workspace
4. Use `npm run dev` to start both services simultaneously

## Contributing

1. Make changes in the appropriate workspace
2. Run tests: `npm run test`
3. Run linting: `npm run lint`
4. Commit your changes
