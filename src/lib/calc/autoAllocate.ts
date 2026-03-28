// ──────────────────────────────────────────────────────────
// autoAllocate.ts — Auto-distribute allocation across funds
// Rule: 60% Core, 40% Satellite, equal within each bucket
// Called on ADD_FUND and REMOVE_FUND only (not manual edits)
// ──────────────────────────────────────────────────────────

import type { Fund } from "../types";

const CORE_SHARE = 60;
const SATELLITE_SHARE = 40;

/**
 * Recalculate fund allocations using the 60/40 Core/Satellite rule.
 * Distributes equally within each bucket.
 * Handles rounding so total is exactly 100%.
 *
 * @param funds Current fund array
 * @returns New fund array with updated allocation values (UI percentages)
 */
export function autoAllocate(funds: Fund[]): Fund[] {
  if (funds.length === 0) return [];

  const coreFunds = funds.filter((f) => f.bucket === "Core");
  const satFunds = funds.filter((f) => f.bucket === "Satellite");

  const coreCount = coreFunds.length;
  const satCount = satFunds.length;

  // Edge case: all funds in one bucket — give that bucket 100%
  let corePool: number;
  let satPool: number;

  if (coreCount === 0 && satCount > 0) {
    corePool = 0;
    satPool = 100;
  } else if (satCount === 0 && coreCount > 0) {
    corePool = 100;
    satPool = 0;
  } else {
    corePool = CORE_SHARE;
    satPool = SATELLITE_SHARE;
  }

  // Distribute equally within each bucket, rounded to 1 decimal
  const corePerFund = coreCount > 0
    ? Math.floor((corePool / coreCount) * 10) / 10
    : 0;
  const satPerFund = satCount > 0
    ? Math.floor((satPool / satCount) * 10) / 10
    : 0;

  // Compute remainder to add to first fund in each bucket
  const coreRemainder = coreCount > 0
    ? Math.round((corePool - corePerFund * coreCount) * 10) / 10
    : 0;
  const satRemainder = satCount > 0
    ? Math.round((satPool - satPerFund * satCount) * 10) / 10
    : 0;

  // Build allocation map: fundId → allocation
  const allocationMap = new Map<string, number>();

  coreFunds.forEach((f, i) => {
    const alloc = i === 0 ? corePerFund + coreRemainder : corePerFund;
    allocationMap.set(f.id, Math.round(alloc * 10) / 10);
  });

  satFunds.forEach((f, i) => {
    const alloc = i === 0 ? satPerFund + satRemainder : satPerFund;
    allocationMap.set(f.id, Math.round(alloc * 10) / 10);
  });

  // Return new array with updated allocations (preserves all other fields)
  return funds.map((f) => ({
    ...f,
    allocation: allocationMap.get(f.id) ?? f.allocation,
  }));
}
