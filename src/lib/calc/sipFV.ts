// ──────────────────────────────────────────────────────────
// sipFV.ts — SIP future value (flat + step-up projections)
// ALL percentage params are DECIMALS (0.188, not 18.8)
// ──────────────────────────────────────────────────────────

import type { StepUpRow, FlatVsStepUpRow } from "../types";

/**
 * SIP future value for flat monthly investment.
 * @param monthlyAmount ₹ absolute
 * @param annualReturn decimal (0.188 = 18.8%)
 * @param months integer
 * @returns ₹ absolute future value
 */
export function sipFV(
  monthlyAmount: number,
  annualReturn: number,
  months: number
): number {
  if (monthlyAmount <= 0 || months <= 0) return 0;
  const r = annualReturn / 12;
  if (Math.abs(r) < 1e-10) return monthlyAmount * months;
  return monthlyAmount * (((1 + r) ** months - 1) / r) * (1 + r);
}

/**
 * Year-by-year step-up projection.
 * @param baseSIP ₹ absolute monthly SIP in year 1
 * @param annualReturn decimal
 * @param stepUpRate decimal (0.10 = 10%)
 * @param years integer (1–30)
 * @returns Array of StepUpRow
 */
export function stepUpProjection(
  baseSIP: number,
  annualReturn: number,
  stepUpRate: number,
  years: number
): StepUpRow[] {
  const rows: StepUpRow[] = [];
  let currentSIP = baseSIP;
  let cumulativeInvested = 0;
  let portfolioValue = 0;

  for (let y = 1; y <= years; y++) {
    if (y > 1) {
      currentSIP = currentSIP * (1 + stepUpRate);
    }
    const yearlyInvestment = currentSIP * 12;
    cumulativeInvested += yearlyInvestment;

    if (y === 1) {
      portfolioValue = sipFV(currentSIP, annualReturn, 12);
    } else {
      portfolioValue =
        portfolioValue * (1 + annualReturn) +
        sipFV(currentSIP, annualReturn, 12);
    }

    rows.push({
      year: y,
      monthlySip: Math.round(currentSIP),
      yearlyInvestment: Math.round(yearlyInvestment),
      totalInvested: Math.round(cumulativeInvested),
      portfolioValue: Math.round(portfolioValue),
    });
  }
  return rows;
}

/**
 * Flat vs step-up comparison data for chart.
 * @returns Array of FlatVsStepUpRow including year 0
 */
export function flatVsStepUpData(
  baseSIP: number,
  annualReturn: number,
  stepUpRate: number,
  years: number
): FlatVsStepUpRow[] {
  const stepUpRows = stepUpProjection(baseSIP, annualReturn, stepUpRate, years);
  const rows: FlatVsStepUpRow[] = [
    { year: 0, investedFlat: 0, valueFlat: 0, investedStepUp: 0, valueStepUp: 0 },
  ];

  for (let y = 1; y <= years; y++) {
    const months = y * 12;
    const investedFlat = baseSIP * months;
    const valueFlat = sipFV(baseSIP, annualReturn, months);
    const stepRow = stepUpRows[y - 1];

    rows.push({
      year: y,
      investedFlat: Math.round(investedFlat),
      valueFlat: Math.round(valueFlat),
      investedStepUp: stepRow.totalInvested,
      valueStepUp: stepRow.portfolioValue,
    });
  }
  return rows;
}
