# Lead Intelligence System

An AI-powered B2B lead qualification system that scores leads, generates personalized outreach, and automates CRM updates.

## Tech Stack
- **Backend:** Node.js, Express, TypeScript
- **AI:** Google Gemini 1.5 Flash
- **Database:** MongoDB with Mongoose
- **Validation:** Zod
- **Frontend:** React + TypeScript (Phase 3)

## Project Phases
- [x] Phase 1: Foundation + AI Service + Lead Scoring API
- [ ] Phase 2: Background Jobs + Real-time Updates
- [ ] Phase 3: React Dashboard
- [ ] Phase 4: Responsible AI Layer + Portfolio Packaging

## Setup
Instructions coming as each phase completes.

## Architecture
This project follows the AI Adapter Pattern — business logic never 
calls an AI provider directly. This makes the AI layer swappable 
and testable.