# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Stream Custom Overlay is a monorepo containing a web application for stream overlays with an API backend. The project uses npm workspaces with two main packages:

- `api/` - Express.js backend (TypeScript, port 3001)
- `web/` - React frontend with Vite (TypeScript, port 3000)

## Common Development Commands

### Development
```bash
# Start both API and web in development mode
npm run dev

# Start only API in development mode
npm run dev:api

# Start only web in development mode  
npm run dev:web
```

### Building
```bash
# Build both API and web
npm run build

# Build only API
npm run build:api

# Build only web
npm run build:web
```

### Testing and Linting
```bash
# Run tests for both workspaces
npm run test

# Run linting with auto-fix for both workspaces
npm run lint
```

### Individual Workspace Commands
```bash
# Run commands in specific workspace
npm run <command> --workspace=api
npm run <command> --workspace=web
```

## Architecture

### Backend (api/)
- Express.js server with TypeScript
- Uses helmet, cors, morgan middlewares
- Health check endpoint at `/health`
- Main API endpoint at `/api/overlay`
- Built with `tsc`, runs with `tsx` in development

### Frontend (web/)
- React 19 with TypeScript and Vite
- Uses React Router for routing (`/`, `/dashboard`, `/actions`)
- Tailwind CSS with Radix UI components
- Component structure follows atomic design
- shadcn/ui component library with custom UI components
- Uses `@` alias for src imports

### Key Frontend Components
- `AppLayout` - Main layout wrapper with sidebar and header
- `AppSidebar` - Navigation sidebar component
- `SiteHeader` - Top header component
- UI components in `src/components/ui/`
- Feature components in `src/components/`

### Development Setup
- Frontend runs on port 3000 with proxy to API on port 3001
- API automatically proxied via Vite configuration at `/api` routes
- Both use ESLint with TypeScript support
- API uses Jest for testing, web uses Vitest

## Commit Guidelines

Commit messages should be humanized and avoid AI detection patterns. Follow conventional commit format but with natural language style.

## Project Language Guidelines

- Keep the entire project consistently in English
  - All code, comments, documentation, and communication should be in English
  - Maintain language uniformity across all project files and components