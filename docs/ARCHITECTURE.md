# R.I.T.A Architecture

R.I.T.A (Revenue Intelligence and Transaction Assistant) is a standalone financial intelligence application.

The MVP is manual-data-first: R.I.T.A computes intelligence from user-entered records and does not connect to banks, cards, payment processors, or mobile-money rails.

## Stack

- Next.js App Router 16
- TypeScript
- Supabase Auth
- PostgreSQL with Row Level Security
- Deterministic financial-domain calculations

## Domain boundary

1. Presentation
2. Verified identity/session
3. Finance calculation layer
4. Persistence with RLS
5. Permission-controlled interoperability

Future PRUDEN DYNASTY AIs may consume typed read-only financial intelligence contracts. Action requests remain separate from approval and execution.
