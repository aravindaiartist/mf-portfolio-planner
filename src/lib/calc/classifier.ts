// ──────────────────────────────────────────────────────────
// classifier.ts — Auto-classify fund bucket and style
// Called ONCE on fund creation as a prefill default.
// User can always override via dropdown. Never re-applied.
// ──────────────────────────────────────────────────────────

import type { FundBucket, FundStyle } from "../types";

export interface ClassificationResult {
  bucket: FundBucket;
  style: FundStyle;
  category: string;
}

/**
 * Classify a mutual fund by name into bucket, style, and category.
 * @param name Fund display name
 * @returns ClassificationResult with sensible defaults
 */
export function classifyFund(name: string): ClassificationResult {
  const lower = name.toLowerCase();

  // Bucket: Core if flexi/large/index/nifty 50/sensex
  const isCore = /flexi|large\s*cap|index|nifty\s*50|sensex/.test(lower);
  const bucket: FundBucket = isCore ? "Core" : "Satellite";

  // Style
  let style: FundStyle = "Growth";
  if (/value|contra/.test(lower)) {
    style = "Value";
  } else if (/momentum/.test(lower)) {
    style = "Momentum";
  } else if (/index|nifty\s*50|sensex/.test(lower)) {
    style = "Blend / Market Beta";
  }

  // Category
  let category = "Other";
  if (/flexi/i.test(lower)) category = "Flexi Cap";
  else if (/small\s*cap/i.test(lower)) category = "Small Cap";
  else if (/mid\s*cap/i.test(lower)) category = "Mid Cap";
  else if (/large\s*cap/i.test(lower)) category = "Large Cap";
  else if (/index|nifty|sensex/i.test(lower)) category = "Index Fund";
  else if (/contra|value/i.test(lower)) category = "Contra / Value";
  else if (/international|global|fof|overseas/i.test(lower)) category = "International FoF";
  else if (/sectoral|thematic/i.test(lower)) category = "Sectoral / Thematic";
  else if (/elss|tax/i.test(lower)) category = "ELSS";
  else if (/balanced|hybrid|aggressive/i.test(lower)) category = "Hybrid";

  return { bucket, style, category };
}
