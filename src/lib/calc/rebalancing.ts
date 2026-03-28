// ──────────────────────────────────────────────────────────
// rebalancing.ts — Portfolio drift detection + action signals
// ALL percentage params are DECIMALS
// ──────────────────────────────────────────────────────────

export type RebalanceAction = "HOLD" | "BUY" | "SELL";

export interface RebalanceResult {
  fundId: string;
  /** decimal: actual current allocation */
  currentPct: number;
  /** decimal: drift from target (can be negative) */
  drift: number;
  /** action signal */
  action: RebalanceAction;
  /** ₹ absolute: amount to buy or sell */
  rebalanceAmount: number;
}

/**
 * Compute rebalancing signals for each fund.
 * @param entries Array of { fundId, currentValue: ₹, targetAllocation: decimal }
 * @returns Array of RebalanceResult
 */
export function computeRebalancing(
  entries: ReadonlyArray<{
    fundId: string;
    currentValue: number;
    targetAllocation: number;
  }>
): RebalanceResult[] {
  const totalValue = entries.reduce((s, e) => s + e.currentValue, 0);

  // Edge case: zero total — return all HOLD with zero drift
  if (totalValue <= 0) {
    return entries.map((e) => ({
      fundId: e.fundId,
      currentPct: 0,
      drift: 0,
      action: "HOLD" as const,
      rebalanceAmount: 0,
    }));
  }

  return entries.map((e) => {
    const currentPct = e.currentValue / totalValue;
    const drift = currentPct - e.targetAllocation;
    const absDrift = Math.abs(drift);
    let action: RebalanceAction = "HOLD";
    if (absDrift > 0.05) {
      action = drift > 0 ? "SELL" : "BUY";
    }
    const rebalanceAmount = absDrift * totalValue;

    return {
      fundId: e.fundId,
      currentPct,
      drift,
      action,
      rebalanceAmount: Math.round(rebalanceAmount),
    };
  });
}
