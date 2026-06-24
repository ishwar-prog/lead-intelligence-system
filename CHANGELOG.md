# Changelog

All notable changes to this project, in reverse chronological order.

## [v1.0.0] - Phase 6: Documentation & Trust Page
- Added RESPONSIBLE_AI.md, CHANGELOG.md, process map, and demo script
- Added a live in-app /trust page presenting the Responsible AI Card
  to actual users, not just repo visitors
- No backend or data-model changes - documentation and one additive
  frontend route only

## [v0.5.0] - Phase 5: Flexible Lead Capture
- Added paste-and-extract: unstructured text (email/notes/bio) parsed
  into the existing lead form via a dedicated extraction endpoint
- Extraction runs synchronously (not queued) - a different interaction
  shape from scoring, by design
- Extracted fields default to null rather than guessing when absent
- Refactored GeminiProvider: shared retry/parsing logic extracted into
  one method used by both scoring and extraction
- Added a dedicated rate limiter on the extraction endpoint, separate
  from the queue's limiter, both respecting Gemini's free-tier quota

## [v0.4.0] - Phase 4: Authentication & Data Ownership
- JWT sessions via httpOnly cookies; bcrypt password hashing (12 rounds)
- Every lead query scoped by userId at the database level (IDOR prevention)
- Soft delete via deletedAt instead of permanent deletion
- Login/register/logout UI, protected dashboard route

## [v0.3.0] - Phases 1-3: Foundation, Queue, Dashboard
- Express + TypeScript API; Gemini integration behind an AIProvider
  interface; Zod validation on both AI input and output
- Bull + Redis background job queue, decoupled worker process,
  rate-limited to match Gemini's free-tier quota
- React + TypeScript dashboard; smart polling (active only while a
  lead is pending); GitHub Actions CI
- Skeuomorphic light-mode design system: paper/brass/steel palette,
  the analog Gauge component as the signature element

### Notable bugs found and fixed across these phases
- Deprecated Gemini model causing 404s
- JSON truncation from token limits, now detected via finishReason
- A Zod validation gap allowing an empty AI-drafted email through
- Free-tier rate-limit failures under burst load