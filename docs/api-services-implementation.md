# TurboMarket service integration notes

## Overview

TurboMarket includes service wrappers and worker-side scaffolding for several external systems used by the prototype.

These integrations are useful for experimentation and code structure, but they should not be interpreted as production-ready infrastructure.

## Included service areas

### Bedrock

- text generation wrapper
- streaming support shape
- model invocation helpers

### OpenAI

- chat completion wrapper
- image generation wrapper
- additional utility methods for multimodal and related tasks

### SES

- email sending helpers
- bulk send and template-oriented structure

### BullMQ

- queue setup and job processing shape
- retry and worker orchestration concepts

### ClickHouse

- analytics-oriented client code
- event and reporting support shape

### tRPC

- early type-safe API structure for application-facing procedures

## Current role in the repository

At this stage, these services mainly serve three purposes:

1. define the intended integration surface,
2. support further prototyping work,
3. show how the product might be decomposed into web, worker, and service layers.

## Important caveat

The presence of these files does not mean the full end-to-end product flow is finished, validated, or production hardened.

The repository still has prototype-level gaps in:

- wiring,
- operational validation,
- environment management,
- deployment readiness,
- full user workflow coverage.

## Worker

`apps/worker/src/index.ts` contains the current worker entry point and illustrates how generation, sending, and analytics responsibilities might be coordinated in the prototype.

## Purpose of this document

This file is a short map of the integration surface currently present in the repo. It is not a claim that all services are complete or that the product is deployment-ready.
