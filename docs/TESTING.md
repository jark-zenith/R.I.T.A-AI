# Testing

## Automated unit suite

The unit suite covers:
- minor-unit calculations
- invalid and unsafe amounts
- savings projections
- business profit
- budget variance
- account balances
- transfer handling
- daily reconciliation

Run with: npm test

## Two-user RLS integration suite

tests/rls.integration.test.ts is skipped unless all of these variables exist:

- RITA_TEST_SUPABASE_URL
- RITA_TEST_SUPABASE_PUBLISHABLE_KEY
- RITA_TEST_USER_A_EMAIL
- RITA_TEST_USER_A_PASSWORD
- RITA_TEST_USER_B_EMAIL
- RITA_TEST_USER_B_PASSWORD

Run the integration suite only against an isolated non-production Supabase project with two dedicated test accounts. Never use real financial data.

The suite verifies that user B cannot read an account owned by user A or insert a transaction against user A's account.

## Verification limitation

No isolated Supabase test project or test-account credentials are configured in this repository runtime, so the two-user RLS suite must not be represented as passed.

The Render production build is separately verified from Render deployment status.
