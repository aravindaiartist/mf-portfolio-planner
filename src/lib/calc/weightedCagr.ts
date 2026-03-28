// ──────────────────────────────────────────────────────────
// weightedCagr.ts — Portfolio weighted average CAGR
// ALL inputs are DECIMALS
// ──────────────────────────────────────────────────────────

/**
 * Compute weighted average CAGR from fund allocations and returns.
 * @param funds Array of { allocation: decimal, expectedReturn: decimal }
 * @returns decimal weighted average return
 */
export function weightedCagr(
  funds: ReadonlyArray<{ allocation: number; expectedReturn: number }>
): number {
  if (funds.length === 0) return 0;
  const totalAlloc = funds.reduce((s, f) => s + f.allocation, 0);
  if (totalAlloc === 0) return 0;
  return funds.reduce((s, f) => s + f.allocation * f.expectedReturn, 0) / totalAlloc;
}
