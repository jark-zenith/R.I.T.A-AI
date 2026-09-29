export interface ExternalMoneyAction {
  actionType: "payment" | "transfer" | "payout";
  amountMinor: number;
  currency: string;
  destinationRef: string;
  idempotencyKey: string;
}

export interface ProviderActionResult {
  provider: string;
  providerReference: string;
}

export interface ExternalMoneyProvider {
  readonly name: string;
  execute(action: ExternalMoneyAction): Promise<ProviderActionResult>;
}

/**
 * R.I.T.A deliberately has no enabled provider implementation yet.
 * Providers must be added behind this interface so credentials, request signing,
 * idempotency and provider-specific error handling stay outside the finance core.
 */
