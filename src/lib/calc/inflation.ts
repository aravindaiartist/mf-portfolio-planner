// ──────────────────────────────────────────────────────────
// inflation.ts — Inflation-adjusted corpus projections
// ALL percentage params are DECIMALS
// ──────────────────────────────────────────────────────────

import type { InflationRow } from "../types";
import { sipFV } from "./sipFV";

/**
 * Year-by-year inflation-adjusted projection.
 * @param totalMonthlySIP ₹ absolute
 * @param portfolioCAGR decimal (0.185 = 18.5%)
 * @param inflationRate decimal (0.06 = 6%)
 * @param years integer (1–30)
 * @returns Array of InflationRow
 */
export function inflationProjection(
  totalMonthlySIP: number,
  portfolioCAGR: number,
  inflationRate: number,
  years: number
): InflationRow[] {
  const rows: InflationRow[] = [];

  for (let y = 1; y <= years; y++) {
    const months = y * 12;
    const totalInvested = totalMonthlySIP * months;
    const nominalCorpus = sipFV(totalMonthlySIP, portfolioCAGR, months);
    const discountFactor = 1 / (1 + inflationRate) ** y;
    const realValue = nominalCorpus * discountFactor;
    const purchasingPowerLoss = nominalCorpus - realValue;

    let realCAGR = 0;
    if (totalInvested > 0 && y > 0) {
      const ratio = realValue / totalInvested;
      realCAGR = ratio > 0 ? ratio ** (1 / y) - 1 : 0;
    }

    const inflationErosion = 1 - discountFactor;

    rows.push({
      year: y,
      nominalCorpus: Math.round(nominalCorpus),
      totalInvested: Math.round(totalInvested),
      discountFactor,
      realValue: Math.round(realValue),
      purchasingPowerLoss: Math.round(purchasingPowerLoss),
      realCAGR,
      inflationErosion,
    });
  }

  return rows;
}
