# R.I.T.A AI

Revenue Intelligence and Transaction Assistant.

R.I.T.A is a standalone financial intelligence application for personal finance and small-business money management, with KES as the default currency.

## Current phase

Phase 1 establishes the secure application foundation:

- Next.js 16 + TypeScript
- Supabase SSR authentication boundary
- PostgreSQL schema with Row Level Security
- User-owned accounts, categories, transactions, budgets, savings goals, and audit logs
- Deterministic money and financial calculation utilities
- Permission contracts for future PRUDEN DYNASTY integration
- Automated unit tests for core calculations

The dashboard currently uses a non-persistent preview capture. It intentionally does not claim that financial records were stored until Supabase is configured and RLS is validated.

## Security boundary

R.I.T.A does not currently connect to banks, cards, payment processors, or mobile-money rails. No external financial transaction can be executed by the MVP.

See docs/SECURITY.md for the security model and docs/API.md for the integration contract boundary.

## Setup

1. Create a Supabase project.
2. Apply supabase/migrations/001_rita_phase1.sql.
3. Copy .env.example to .env.local and set the two publishable Supabase variables.
4. Install dependencies and run the development server.
5. Run the unit tests and TypeScript typecheck.

Do not commit credentials or service-role secrets.
