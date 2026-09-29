export const RITA_SCOPES = [
  "finance:read",
  "finance:write",
  "finance:reconcile",
  "finance:report",
  "finance:action:request",
] as const;

export type RitaScope = (typeof RITA_SCOPES)[number];

export function hasScope(granted: readonly string[], required: RitaScope): boolean {
  return granted.includes(required);
}

export function assertScope(granted: readonly string[], required: RitaScope): void {
  if (!hasScope(granted, required)) throw new Error("Missing RITA permission: " + required);
}

/** An action request is never the same as approval or execution. */
export const EXTERNAL_MONEY_ACTION_POLICY = Object.freeze({
  executionEnabled: false,
  requiresExplicitConfirmation: true,
});
