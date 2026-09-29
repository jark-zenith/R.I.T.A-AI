# R.I.T.A Security Model

Financial records are user-owned and protected by server-side identity checks plus PostgreSQL Row Level Security.

Rules:
- Client-side checks are UX only.
- Never trust an arbitrary client-supplied user ID for ownership.
- Use exact integer minor units for money where practical.
- Never commit credentials or secrets.
- Do not log sensitive financial payloads.
- Do not seed production with fabricated financial data.
- Do not expose Supabase service-role secrets to the browser.

External money movement is disabled in Phase 1.

Future execution must separately require:
1. authenticated actor
2. required permission
3. server-side revalidation
4. explicit confirmation immediately before execution
5. idempotency protection
6. audit record
7. safe failure handling
