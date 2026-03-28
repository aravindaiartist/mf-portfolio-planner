// ──────────────────────────────────────────────────────────
// reverseSip.ts — Required monthly SIP for a target corpus
// ALL percentage params are DECIMALS
// ──────────────────────────────────────────────────────────

/**
 * Compute the flat monthly SIP required to reach a target corpus.
 * Uses annuity due formula with effective monthly rate.
 * Inverse of sipFV function.
 * 
 * @param targetCorpus ₹ absolute
 * @param annualReturn decimal (0.155 = 15.5% p.a.)
 * @param years integer
 * @returns ₹ absolute required monthly SIP
 */
export function reverseSip(
  targetCorpus: number,
  annualReturn: number,
  years: number
): number {
  if (targetCorpus <= 0 || years <= 0) return 0;
  if (Math.abs(annualReturn) < 1e-10) return targetCorpus / (years * 12);
  
  // Convert annual rate to effective monthly rate (compound conversion)
  const r = Math.pow(1 + annualReturn, 1 / 12) - 1;
  const n = years * 12;
  
  // Inverse of annuity due: P = FV × r / [((1 + r)^n - 1) × (1 + r)]
  return (targetCorpus * r) / (((1 + r) ** n - 1) * (1 + r));
}
