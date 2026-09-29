# Phase 4 — External financial integrations

The integration boundary is prepared, but live execution is still disabled.

Required before enabling a real provider:
- provider contract and permitted transaction types
- production credentials stored only in server-side secret storage
- idempotency enforcement
- explicit user confirmation immediately before execution
- server-side authorization independent of AI-generated instructions
- provider response verification and durable audit records
- failure/retry/reversal handling
- compliance and operational review

Current state:
- action requests have an idempotency key and lifecycle status
- R.I.T.A has a provider adapter interface
- no bank, card, mobile-money or payout provider credentials are configured
- the executionEnabled policy remains false
