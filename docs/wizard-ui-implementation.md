# TurboMarket wizard UI notes

## Overview

The current UI prototype implements a six-step campaign wizard:

1. Purpose
2. Hook
3. Structure
4. Voice
5. CTA
6. Footer

The goal of the wizard is to make campaign drafting feel structured and inspectable rather than fully free-form.

## Implemented pieces

### Homepage

- introductory landing page
- entry point into the wizard
- high-level product framing

### Wizard shell

- step navigation
- step state management
- previous / continue controls

### Step coverage

- purpose selection
- hook editing
- structure editing
- voice controls
- CTA editing
- footer configuration

## Technical notes

- built in Next.js with React
- local state is used to manage wizard data
- UI components are organized under `apps/web/src/components`

## Limitations

The wizard is a prototype UI. Some actions still stop at local state or placeholder behavior rather than a completed backend flow.

Examples:

- draft saving is not a complete persistence flow
- final submission is not a complete launch workflow
- some analytics and AI behaviors are represented as UI concepts rather than finished integrations

## Purpose of this document

This file exists to describe what the wizard prototype currently covers and what it does not. It should be read as implementation notes, not as a statement that the product is complete.
