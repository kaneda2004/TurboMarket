# TurboMarket

example interface:

What the screenshot tells us about the product

Clue	What it implies
Left-hand “wizard” steps (Purpose → Hook → Structure → Voice → CTA → Footer)	Step-by-step flow for composing something—most likely a marketing email.
Card-style options for “Launch / Newsletter / Survey Invite / Waitlist Update”	Pre-baked email types that map to common growth/marketing workflows.
Toggle for Audience Type (New Users ↔ Existing Users) and Goal (Drive Clicks, Promote an Offer, …)	Segmentation + goal-based copy generation—again, classic email-marketing needs.
Clean, very “web-app” layout inside a tablet frame	Looks like a responsive web SaaS being previewed on an iPad, rather than a native iOS view.
Subtle pastel palette, feather-style icons, modern spacing	Design language typical of Tailwind/Chakra/Material-3 era React apps.

Inductive conclusion:
It’s almost certainly a SaaS tool that walks a user through crafting high-converting marketing emails/newsletters with opinionated structure and (probably) some AI copy suggestions under the hood.

⸻

Likely tech stack (deductive guesses)

Layer	Probable choice	Why it fits
Frontend framework	React (often shipped via Next.js or Remix)	De-facto choice for modern B2B SaaS UIs with multi-step wizards and rich state.
Styling	Tailwind CSS with a component kit like shadcn/ui or Radix + Stitches	The spacing, rounded cards, and pastel utilities look straight-out-of-Tailwind design tokens.
State / form logic	React Hook Form + Zod (or Formik for vintage devs)	You need fine-grained control-state across the wizard; Hook Form + Zod is the current sweet spot.
Iconography	Lucide-React icons	Rocket, paper-plane, hourglass all match Lucide set.
Routing / data fetching	If Next.js: App Router + React Server Components; if Remix: nested routes with loaders/actions.	Page-level transitions are minimal; server-side rendering optional for SEO on public marketing pages.
Auth & DB	Supabase / Firebase Auth with Postgres (usually via Prisma)	Standard, quick-to-ship managed stack for indie SaaS.
AI integration	OpenAI / Anthropic API calls sitting behind a tRPC / REST layer	Tool almost certainly offers AI-generated subject lines / body copy.
Email provider	Write-only integration to SendGrid / Postmark / Mailchimp API	Makes sense given it’s an email-composer product.
State machine (optional)	Some teams drop in XState for wizard logic	Helps keep “which step-is-valid” logic predictable.


⸻

Short narrative

“From the step-wise sidebar, pre-canned email archetypes, and audience/goal toggles we can infer this is a web-first SaaS that helps growth teams crank out perfectly structured marketing emails. The polished, component-driven UI screams React + Tailwind, likely scaffolded in Next.js, talking to a Node/TypeScript back end that proxies OpenAI for copy suggestions and pushes the final HTML to SendGrid or Mailchimp.”

That’s the most economical explanation that fits every visual breadcrumb in the screenshot.

#todo

Below is an exhaustive, up-to-date product brief. It merges every functional feature we scoped earlier with the newest “all-Docker / AWS-only / Claude 3.7 + OpenAI-images” constraints and the latest stable framework versions. Use it as the single source of truth for building and shipping the app.

1  Quick overview (TL;DR)

A Docker-packaged SaaS that lets growth teams design, send, and continuously optimise AI-written marketing emails.
Text is generated with Claude 3.7 Sonnet on Amazon Bedrock  ￼; imagery comes from OpenAI’s gpt-image-1 model  ￼.
Everything—web front-end, queue workers, databases, analytics—runs as containers locally (via docker-compose) and in production on ECS Fargate.
The stack locks into AWS only (plus pay-as-you-go OpenAI Images) and avoids third-party SaaS fees such as SendGrid by using SES ($0.10 / 1 000 mails)  ￼.

⸻

2  Full functionality & feature set

2.1 Onboarding & brand ingestion
	•	OAuth into CRM → scrape logo/colours → auto-build a Theme JSON and starter audience segments.
	•	Voice calibration quiz feeds the “brand style” object that is injected into every Claude prompt.

2.2 Six-step Campaign Wizard
	1.	Purpose (launch, newsletter, survey, wait-list, etc.).
	2.	Hook – subject & preview lines ranked by an uplift model; swipe to A/B buckets.
	3.	Structure – drag-drop MJML blocks; Story-Arc meter (Problem→Proof→CTA) flags gaps.
	4.	Voice – slider (Professional-Casual, Authoritative-Friendly) directly modulates Claude’s system prompt.
	5.	CTA – dynamic buttons, inline pricing cards; click cost estimator.
	6.	Footer – locked compliance block (unsubscribe, address).

2.3 Asset & Media Hub
	•	Upload or generate hero images via OpenAI (1024×1024, PNG, stored on S3).
	•	AI auto-generates alt text and checks WCAG contrast.

2.4 Segmentation & personalisation
	•	Visual rule-builder (tier == pro && last_login > 30d).
	•	Real-time segment size preview.
	•	Dynamic storylines let one email carry alternate intros/CTAs without duplicating the whole template.

2.5 Send orchestration
	•	Predictive send-time (LightGBM regression trained on campaign history) chooses per-recipient hour.
	•	Deliverability guard: inbox-placement simulation + spam-word linter before “Confirm Send”.

2.6 Post-send analytics & optimisation
	•	Live opens/clicks funnel (ClickHouse 24.3 LTS)  ￼.
	•	Scroll-depth heat-map.
	•	LLM insight digest—Claude summarises why Variant B beat A.
	•	One-click “Re-roll weakest block & resend to non-openers”.

2.7 Collaboration & governance
	•	Google-Doc-style multi-cursor editing.
	•	Role-based approvals (Creator → Marketing Lead → Legal).
	•	Version diff/rollback and immutable audit trail.

2.8 Brand, compliance & accessibility guard-rails
	•	Tailwind plugin enforces brand colours and font scale.
	•	CASL / CAN-SPAM checks auto-block send if unsubscribe link missing.
	•	WCAG 2.2 AA scanner on every preview.

2.9 Integrations (all optional, via webhooks)
	•	CRM (HubSpot, Salesforce, Pipedrive), CDP (Segment).
	•	Commerce (Shopify, Stripe events).
	•	Slack / Teams for proof-to-channel and auto-posting campaign digests.

2.10 Differentiators
	•	Continuous Conversion Forecast panel updates after every keystroke.
	•	Hook Lab with competitor-subject scraping.
	•	Automated Claude-written PDF summary for execs after every send.

⸻

3  Technical architecture (versions pinned)

Layer	Tech / Version	Source
Front-end	Next.js 15.4  ￼ + React 19.1  ￼ + Tailwind CSS 4.0  ￼	
Typed RPC	tRPC v11  ￼	
ORM	Prisma 6.10.1  ￼	
Queues	BullMQ 5.56  ￼ + Redis 7.4  ￼	
Streaming	Kafka 3.7.2 (MSK Serverless)  ￼	
Analytics	ClickHouse 24.3  ￼	
LLM	Claude 3.7 Sonnet on Bedrock  ￼	
Images	OpenAI gpt-image-1  ￼	
Email	Amazon SES ($0.10 / 1 000)  ￼	


⸻

4  Docker-first workflow

# one-shot dev spin-up
docker compose up --build

docker-compose.yml services:

Service	Image	Role
web	node:20-alpine → nextjs:latest	UI & tRPC
worker	same base → worker:latest	queues, SES, Bedrock, OpenAI
supabase	supabase/postgres:16	auth + DB (dev only)
redis	redis:7.4	queues/sessions
kafka	vectorized/redpanda:latest	event stream
clickhouse	clickhouse/clickhouse-server:24.3	analytics
localstack	localstack/localstack:latest	mock S3 + SES for tests

CI/CD → AWS
	•	GitHub Actions builds multi-arch images, pushes to ECR.
	•	Terraform provisions VPC, ALB, ECS Fargate services, Aurora Postgres, ElastiCache, MSK, ClickHouse EC2, S3, SES.
	•	Blue-green deploy with automatic rollback on failed health-checks.

⸻

5  AI integration details

Flow	Prompt / API	Notes
Copy generation	bedrock:anthropic.claude-sonnet-3.7 JSON API	Max 1024 tokens; brand voice & top past winners injected.
Image generation	openai.images.generate with model:"gpt-image-1"	Single 1024×1024 PNG → S3; store CDN URL in Asset table.
Open-rate ranking	LightGBM model served by the worker; features = n-grams + emojis + send-time.	


⸻

6  Cost & vendor-lock profile
	•	AWS-only infrastructure; can migrate by re-pointing Docker images if needed.
	•	Pay-as-you-go extras: Bedrock tokens for Claude 3.7 and OpenAI image credits; everything else is open-source.
	•	No SendGrid / Postmark / Vercel subscription.

⸻

7  Immediate next steps
	1.	Create branch spec-lock-07-2025 and commit this document to /docs/architecture.md.
	2.	Scaffold mono-repo + compose file; verify hot reload.
	3.	Implement Bedrock wrapper and SES transport.
	4.	Finish wizard UI (Purpose → Footer) with Tailwind 4 components.
	5.	Stand-up staging in AWS dev account via Terraform; load test to 500 req/s.

⸻

With this document you now have the entire functional surface and the fully modernised technical blueprint in one place—ready for coding, containerising, and deploying. Good luck!
