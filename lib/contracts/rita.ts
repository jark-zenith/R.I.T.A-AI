export const RITA_API_VERSION = "v1";

export const RITA_SCOPES = [
  "finance:read",
  "finance:write",
  "finance:reconcile",
  "finance:report",
  "finance:action:request",
] as const;

export type RitaScope = (typeof RITA_SCOPES)[number];

export interface RitaPrincipal {
  subject: string;
  scopes: RitaScope[];
  clientId: string;
}

export interface FinancialSummaryRequest {
  version: typeof RITA_API_VERSION;
  principal: RitaPrincipal;
  resource: "personal.summary" | "business.summary" | "budget.status" | "savings.status";
  periodStart?: string;
  periodEnd?: string;
}

export interface ExternalActionRequest {
  version: typeof RITA_API_VERSION;
  principal: RitaPrincipal;
  action: "payment" | "transfer" | "payout";
  amountMinor: number;
  currency: string;
  destinationRef: string;
  idempotencyKey: string;
}

/**
 * An action request can be created by an authorized caller, but it can never
 * directly execute a financial transaction. User confirmation and a separate
 * execution authorization are required by policy.
 */
export const EXTERNAL_ACTION_POLICY = Object.freeze({
  requestEnabled: false,
  executionEnabled: false,
  explicitConfirmationRequired: true,
  separateExecutionAuthorizationRequired: true,
});
