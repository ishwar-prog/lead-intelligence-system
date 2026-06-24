# Responsible AI Card — Lead Intelligence System

## System Purpose
Scores inbound B2B leads against a fixed, transparent five-factor rubric;
drafts outreach (email, LinkedIn message, follow-up action); and routes
analysis through a background queue. It does not autonomously contact
prospects — every output is a draft awaiting human review.

## Intended Users
Sales reps, SDRs, and sales operations staff qualifying inbound leads.
Not intended for fully unattended use, regulated-industry compliance
scoring, or any decision with legal/financial consequence for the lead
(e.g. credit, employment, insurance).

## Data Inputs
Company name, industry, role, company size, a free-text pain point
description, and optional budget/timeline signals. Entered via a
structured form or extracted from pasted free text (email, notes,
LinkedIn bio). The system never requests protected attributes (age,
gender, health, religion, ethnicity, etc.) and the extraction prompt
is explicitly instructed not to infer them.

## Benefits
- Reduces manual lead triage from an estimated 15-20 minutes per lead
  (research, scoring, drafting) to under 5 minutes including human review
- Produces a consistent, explainable score instead of ad hoc judgment
- Surfaces missing information explicitly rather than silently guessing

## Risks
- **Hallucination**: an AI-drafted email could state something not
  actually true about the prospect's situation if the input itself
  was inaccurate
- **Garbage in, garbage out**: the score is only as good as the
  submitted pain point and signals; the AI cannot independently verify them
- **Overreliance**: a user could skip the review step and treat the
  score as ground truth
- **Transient provider failures**: third-party AI infrastructure
  (Gemini) occasionally returns 503/429 errors outside this system's control

## Human Review
Every lead's AI output - score, reasoning, drafted email, LinkedIn
message, follow-up action - is presented in a review panel requiring
a named reviewer before a lead is considered actioned. The system
supports a manual score override with notes, explicitly preserving
human judgment as the final authority.

## Data Privacy
- No payment information, government IDs, or special-category personal
  data should ever be entered into this system
- Passwords are bcrypt-hashed (cost factor 12), never stored or logged
  in plaintext
- Sessions use httpOnly cookies, inaccessible to client-side JavaScript
- All lead data is scoped per-account at the database query level;
  no cross-account access path exists

## Limitations
- Scoring reflects the stated rubric only - it is not a measure of
  deal probability, revenue potential, or any externally validated metric
- The model can occasionally misjudge ambiguous or sparse pain-point
  descriptions
- Extraction is instructed to return "not found" rather than invent
  values, but this is a prompt-level instruction, not a hard guarantee
- This is a portfolio/demonstration system; it has not undergone the
  fairness, robustness, or compliance review required for production
  use in a regulated industry

## Mitigation (implemented in this codebase)
- Every AI response is validated against a strict Zod schema before
  being stored; malformed output is rejected, not silently accepted
- Extraction prompt explicitly requires `null` over invention for
  any field not clearly present in the source text
- Rate limiting (queue-level and endpoint-level) prevents runaway
  API usage and keeps the system within the provider's quota
- Soft deletion (`deletedAt`) preserves an audit trail rather than
  permanently destroying records
- All ownership checks are enforced inside the database query itself
  (not as an after-the-fact permission check), preventing one
  account from ever retrieving another's data