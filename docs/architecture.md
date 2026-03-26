# TurboMarket architecture notes

## Repository status

TurboMarket is a prototype for an AI-assisted email campaign builder.

The codebase currently includes:

- a Next.js web application,
- a multi-step campaign wizard UI,
- a worker application,
- service wrappers for AI, email, queueing, and analytics integrations,
- Docker-based local development scaffolding.

It does not currently represent a complete production system.

## Product direction

The prototype is centered on a guided email composition flow with six stages:

1. Purpose
2. Hook
3. Structure
4. Voice
5. CTA
6. Footer

The intent is to explore a product that helps a user plan and draft a campaign through structured inputs rather than a single free-form editor.

## Current technical shape

### Web

- Next.js application in `apps/web`
- React-based wizard flow
- local component-driven UI

### Worker

- worker application in `apps/worker`
- queue-oriented processing shape
- early integration points for generation and delivery flows

### Supporting services

The repository includes wrappers and scaffolding for:

- Bedrock
- OpenAI
- SES
- BullMQ
- ClickHouse
- tRPC

These should be read as prototype infrastructure and integration experiments, not final production services.

## Development workflow

### Web-only

```bash
cd apps/web
npm install --legacy-peer-deps
npm run dev
```

### Full local stack

```bash
docker compose up --build
```

## What this document is

This file is intentionally narrow in scope. It describes the current direction of the repository and the main architectural slices that exist today.

It is not a requirements document, launch plan, or claim of production completeness.
