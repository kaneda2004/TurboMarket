# TurboMarket

Prototype for an AI-assisted email campaign builder.

TurboMarket explores a workflow for drafting marketing emails through a structured six-step wizard covering purpose, hook, structure, voice, CTA, and footer composition.

## Status

This repository is a product prototype, not a production-ready SaaS.

What is currently present:

- Next.js web UI
- multi-step campaign wizard
- supporting worker and service scaffolding
- Docker-based local development setup
- exploratory integrations for AI generation and email infrastructure

What is not yet complete:

- end-to-end campaign generation flow
- fully wired backend integrations
- deployment-ready infrastructure
- production validation and operational hardening

## Scope

The project focuses on the shape of the product and the interaction model:

- campaign setup through a guided workflow
- structured editing of subject lines and email content
- configurable tone and CTA controls
- draft infrastructure for AI-assisted generation

## Repository structure

```text
apps/
  web/
  worker/
packages/
lib/
docs/
docker-compose.yml
```

## Development

### Web UI

```bash
cd apps/web
npm install --legacy-peer-deps
npm run dev
```

### Full local stack

```bash
docker compose up --build
```

## Notes

- Some architecture documents in `docs/` are exploratory product notes rather than final implementation documentation.
- The repository is best read as a prototype and reference implementation for the UI and system shape.

## License

MIT License
