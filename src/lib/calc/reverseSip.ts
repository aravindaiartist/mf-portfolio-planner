// ──────────────────────────────────────────────────────────
// reverseSip.ts — Required monthly SIP for a target corpus
// ALL percentage params are DECIMALS
// ──────────────────────────────────────────────────────────

/**
 * Compute the flat monthly SIP required to reach a target corpus.
 * @param targetCorpus ₹ absolute
 * @param annualReturn decimal (0.188 = 18.8%)
 * @param years integer
 * @returns ₹ absolute required monthly SIP
 */
export function reverseSip(
  targetCorpus: number,
  annualReturn: number,
  years: number
): number {
  if (targetCorpus <= 0 || years <= 0) return 0;
  const r = annualReturn / 12;
  const n = years * 12;
  if (Math.abs(r) < 1e-10) return targetCorpus / n;
  return (targetCorpus * r) / (((1 + r) ** n - 1) * (1 + r));
}
