# R.I.T.A Reports & Exports

R.I.T.A exposes an authenticated CSV transaction export at:

GET /api/reports/transactions

The route requires a signed-in Supabase user and returns only rows visible to that user through RLS. It does not use service-role credentials.

The export is limited to the latest 1,000 transactions in the MVP. Amounts remain in minor units so exports do not introduce floating-point rounding.

Future report exports can add date-range filters, budget summaries and business P&L, using the same authenticated server-side boundary.
