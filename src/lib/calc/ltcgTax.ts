// ──────────────────────────────────────────────────────────
// ltcgTax.ts — LTCG tax computation
// Portfolio-level = PRIMARY (single exemption pool)
// Per-fund = ILLUSTRATIVE APPROXIMATION ONLY
// ALL percentage params are DECIMALS
// ──────────────────────────────────────────────────────────

import type { LtcgHorizonResult, LtcgPerFundResult } from "../types";
import { sipFV } from "./sipFV";

/**
 * Portfolio-level LTCG tax computation across horizons.
 * Uses a single cumulative exemption pool (₹1.25L × years).
 *
 * @param totalMonthlySIP ₹ absolute
 * @param portfolioCAGR decimal
 * @param exemptionPerYear ₹ absolute (default 125000)
 * @param taxRate decimal (default 0.125)
 * @param horizons array of year integers
 * @returns Array of LtcgHorizonResult
 */
export function ltcgPortfolio(
  totalMonthlySIP: number,
  portfolioCAGR: number,
  exemptionPerYear: number = 125000,
  taxRate: number = 0.125,
  horizons: readonly number[] = [3, 5, 10]
): LtcgHorizonResult[] {
  return horizons.map((h) => {
    const totalInvested = totalMonthlySIP * h * 12;
    const grossValue = sipFV(totalMonthlySIP, portfolioCAGR, h * 12);
    const grossGain = grossValue - totalInvested;
    const exemptGain = exemptionPerYear * h;
    const taxableGain = Math.max(0, grossGain - exemptGain);
    const ltcgTax = taxableGain * taxRate;
    const netCorpus = grossValue - ltcgTax;
    const taxDrag = grossValue > 0 ? ltcgTax / grossValue : 0;
    const netCAGR =
      totalInvested > 0 && h > 0
        ? (netCorpus / totalInvested) ** (1 / h) - 1
        : 0;

    return {
      horizon: h,
      totalInvested: Math.round(totalInvested),
      grossValue: Math.round(grossValue),
      grossGain: Math.round(grossGain),
      exemptGain: Math.round(exemptGain),
      taxableGain: Math.round(taxableGain),
      ltcgTax: Math.round(ltcgTax),
      netCorpus: Math.round(netCorpus),
      taxDrag,
      netCAGR,
    };
  });
}

/**
 * Per-fund LTCG breakdown — ILLUSTRATIVE APPROXIMATION ONLY.
 * Applies per-fund exemption which overstates the real benefit.
 *
 * @param funds Array of { fundId, fundName, sipAmount: ₹, expectedReturn: decimal, allocation: decimal }
 * @param exemptionPerYear ₹ absolute
 * @param taxRate decimal
 * @param years integer (default 10)
 */
export function ltcgPerFund(
  funds: ReadonlyArray<{
    fundId: string;
    fundName: string;
    sipAmount: number;
    expectedReturn: number;
    allocation: number;
  }>,
  exemptionPerYear: number = 125000,
  taxRate: number = 0.125,
  years: number = 10
): LtcgPerFundResult[] {
  return funds.map((f) => {
    const months = years * 12;
    const grossValue = sipFV(f.sipAmount, f.expectedReturn, months);
    const totalInvested = f.sipAmount * months;
    const grossGain = grossValue - totalInvested;
    const exemptGain = exemptionPerYear * years;
    const estimatedTax = Math.max(0, grossGain - exemptGain) * taxRate;
    const netValue = grossValue - estimatedTax;

    return {
      fundId: f.fundId,
      fundName: f.fundName,
      allocation: f.allocation,
      grossValue: Math.round(grossValue),
      grossGain: Math.round(grossGain),
      estimatedTax: Math.round(estimatedTax),
      netValue: Math.round(netValue),
    };
  });
}
