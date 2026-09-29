# R.I.T.A API Contract Boundary

Phase 1 keeps the integration boundary documented but does not expose an autonomous public financial API.

Suggested future scopes:
- finance:read
- finance:write
- finance:reconcile
- finance:report
- finance:action:request

A future action lifecycle is:
request -> validate -> explicit user confirmation -> authorize -> execute

No AI scope should imply approval to move money.
