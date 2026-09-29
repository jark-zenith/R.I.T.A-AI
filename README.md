# R.I.T.A AI

Revenue Intelligence and Transaction Assistant.

R.I.T.A is a multi-user financial information system for personal finance and small-business money management, with KES as the initial default currency.

## Current architecture

- Next.js 16 + TypeScript on Render
- Supabase Auth with SSR session handling
- PostgreSQL with Row Level Security
- User-owned profiles, accounts, categories, transactions, budgets, savings goals, businesses, transfers, daily snapshots, report runs and correction history
- Server-side mutations that derive ownership from the verified session
- Fixed-precision minor-unit monetary storage using PostgreSQL bigint
- Deterministic financial calculation and reporting services
- Typed PRUDEN DYNASTY integration boundary for future AI services
- No external financial execution enabled

## Implemented

### Public and authentication
- Public landing page
- Email/password registration and sign-in
- Sign-out
- Password reset flow
- Google OAuth UI and callback flow
- Account settings
- Generic authentication error handling

Google sign-in is not considered production-enabled until the Google provider is configured in the Supabase project and its redirect URLs are allowlisted.

### Privacy and financial data
- Per-user ownership columns
- PostgreSQL RLS policies
- Cross-owner relationship checks for transactions, budgets, transfers and business records
- Audit-preserving transaction correction/deletion history
- Authenticated CSV transaction export
- Authenticated complete JSON user-data export
- Account deletion request state

### Financial functionality
- Multi-currency accounts
- Income and expense transactions
- First-class account-to-account transfers
- Budgets and variance monitoring
- Savings goals and time-to-goal projections
- Business revenue, direct costs, operating expenses, gross profit and net profit
- Daily user-submitted snapshots
- Daily and monthly on-demand reports
- Explicit reconciliation differences
- No fabricated financial figures

### Deployment
Render web service:
- Service: rita-ai
- URL: https://rita-ai.onrender.com
- Region: Frankfurt
- Branch: phase-1-secure-core
- Auto-deploy: enabled

## Required production setup

1. Create or select a Supabase project.
2. Apply migrations in order from supabase/migrations/001 through 005.
3. Configure Supabase Auth email/password.
4. Configure Google OAuth in Supabase if Google sign-in is desired.
5. Add Supabase project URL and publishable key to Render environment variables.
6. Set NEXT_PUBLIC_SITE_URL to the public R.I.T.A origin and allowlist the same callback destinations in Supabase.
7. Review backup/recovery settings before putting real financial data into production.
8. Complete the applicable privacy/data-protection assessment before treating the public service as legally compliant.

Do not commit service-role keys, OAuth secrets, database passwords or real financial data.

## Testing

Run npm test for deterministic calculations.

Run the two-user RLS integration suite only against an isolated non-production Supabase project with dedicated test users. See docs/TESTING.md.

The repository intentionally does not contain fake credentials or fake production financial records.
