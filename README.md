# R.I.T.A AI

Revenue Intelligence and Transaction Assistant.

R.I.T.A is a standalone financial intelligence application for personal finance and small-business money management, with KES as the default currency.

## Current phase

Phase 1 establishes a secure application foundation with real authenticated manual finance entry:

- Next.js 16 + TypeScript
- Supabase SSR authentication boundary
- PostgreSQL schema with Row Level Security
- User-owned accounts, categories, transactions, budgets, savings goals, and audit logs
- Server-side account/category/transaction mutations
- Deterministic money and financial calculation utilities
- Permission contracts for future PRUDEN DYNASTY integration
- Automated unit tests for core calculations
- Empty-state dashboard with no fabricated financial data

## Not enabled

R.I.T.A does not currently connect to banks, cards, payment processors, or mobile-money rails. No external financial transaction can be executed by the MVP.

Budget reconciliation workflows, business ledger/reporting UI, advanced intelligence, and external integrations are separate subsequent phases.

## Setup

1. Create a Supabase project.
2. Apply supabase/migrations/001_rita_phase1.sql.
3. Copy .env.example to .env.local and set only the Supabase publishable URL/key.
4. Install dependencies and run the development server.
5. Run unit tests and TypeScript typecheck.

Do not commit credentials, service-role secrets, or real financial data fixtures.
