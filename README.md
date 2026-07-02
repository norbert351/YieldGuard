# YieldGuard — DeFi Yield Optimization System

Automated treasury management and yield optimization across multiple DeFi lending protocols.

## Tech Stack

- **Frontend:** Next.js 15 + Tailwind CSS v4 + TypeScript
- **Backend:** NestJS 11 + TypeScript
- **Monorepo:** npm workspaces

## Quick Start

```bash
# Install dependencies
npm install

# Build all packages
npm run build

# Start development (frontend + backend)
npm run dev
```

- Frontend: http://localhost:3000
- API: http://localhost:4000/api

## Project Structure

```
yieldguard/
├── apps/
│   ├── web/          # Next.js frontend
│   └── api/          # NestJS backend
├── packages/
│   └── shared/       # Shared TypeScript types
├── package.json      # Root workspace config
└── start.sh          # Dev starter script
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/portfolio` | Portfolio overview |
| GET | `/api/portfolio/positions` | Active positions |
| GET | `/api/simulation` | List simulations |
| POST | `/api/simulation` | Run simulation |
| GET | `/api/protocols` | List protocols |
| GET | `/api/protocols/rates` | Rate comparison |
| GET | `/api/analytics/metrics` | Analytics metrics |
| GET | `/api/analytics/history/:days` | Value history |

## Modular Architecture

Built for extensibility — add new features for future hackathons without starting from scratch:
- Protocol modules are pluggable
- Simulation engine is configurable
- Frontend components are composable
