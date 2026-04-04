// ──────────────────────────────────────────────────────────
// autoAllocate.ts — Auto-distribute allocation across funds
// Rule: User-defined Core/Satellite split, equal within each bucket
// Called on ADD_FUND, REMOVE_FUND, and when Core/Satellite slider changes
// ──────────────────────────────────────────────────────────

import type { Fund } from "../types";

const DEFAULT_CORE_SHARE = 60;

/**
 * Recalculate fund allocations using the Core/Satellite rule.
 * Distributes equally within each bucket.
 * Handles rounding so total is exactly 100%.
 *
 * @param funds Current fund array
 * @param targetCoreSplit UI percentage for Core allocation (default 60)
 * @returns New fund array with updated allocation values (UI percentages)
 */
export function autoAllocate(funds: Fund[], targetCoreSplit: number = DEFAULT_CORE_SHARE): Fund[] {
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
    // Use the user-defined split
    corePool = targetCoreSplit;
    satPool = 100 - targetCoreSplit;
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
  // Clear sipOverride when reallocating since allocation changed
  return funds.map((f) => ({
    ...f,
    allocation: allocationMap.get(f.id) ?? f.allocation,
    sipOverride: null, // Clear manual SIP when allocation changes
  }));
}
