// ──────────────────────────────────────────────────────────
// staticFundIndex.ts — Combined static fund index from AMFI
// 14,331 funds · Source: AMFI NAVAll.txt — 2026-03-24
// ──────────────────────────────────────────────────────────

export interface StaticFundEntry {
  schemeCode: number;
  schemeName: string;
}

import { STATIC_FUND_INDEX_PART1 } from "./staticFundIndex_part1";
import { STATIC_FUND_INDEX_PART2 } from "./staticFundIndex_part2";
import { STATIC_FUND_INDEX_PART3 } from "./staticFundIndex_part3";
import { STATIC_FUND_INDEX_PART4 } from "./staticFundIndex_part4";

export const STATIC_FUND_INDEX: StaticFundEntry[] = [
  ...STATIC_FUND_INDEX_PART1,
  ...STATIC_FUND_INDEX_PART2,
  ...STATIC_FUND_INDEX_PART3,
  ...STATIC_FUND_INDEX_PART4,
];
