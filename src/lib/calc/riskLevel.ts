// ──────────────────────────────────────────────────────────
// riskLevel.ts — Risk classification based on fund category
// ──────────────────────────────────────────────────────────

export type RiskLevel = "Low" | "Moderate" | "High" | "Very High";

export interface RiskInfo {
  level: RiskLevel;
  color: string;       // Tailwind text color class
  bgColor: string;     // Tailwind bg color class
  description: string; // One-line explanation
}

/**
 * Classify a fund's risk level based on its category.
 * @param category Fund category string (e.g. "Flexi Cap", "Small Cap")
 * @returns RiskInfo object
 */
export function getRiskLevel(category: string): RiskInfo {
  const lower = category.toLowerCase();

  // Low risk: Index funds, liquid, debt, gilt
  if (/index|nifty 50|sensex|liquid|debt|gilt|money market|overnight/i.test(lower)) {
    return {
      level: "Low",
      color: "text-emerald-400",
      bgColor: "bg-emerald-400/10",
      description: "Tracks an index or invests in low-volatility instruments",
    };
  }

  // Moderate: Large cap, flexi cap, balanced, hybrid, FoF
  if (/large cap|flexi|multi|balanced|hybrid|conservative|fof|fund of fund|international|global/i.test(lower)) {
    return {
      level: "Moderate",
      color: "text-sky-400",
      bgColor: "bg-sky-400/10",
      description: "Diversified across large companies or multiple asset classes",
    };
  }

  // High: Mid cap, contra, value, ELSS, sectoral, thematic
  if (/mid cap|contra|value|elss|tax|sectoral|thematic|focused|dividend yield/i.test(lower)) {
    return {
      level: "High",
      color: "text-amber-400",
      bgColor: "bg-amber-400/10",
      description: "Concentrated bets or mid-sized companies — higher volatility",
    };
  }

  // Very High: Small cap, micro cap, momentum
  if (/small cap|micro|momentum/i.test(lower)) {
    return {
      level: "Very High",
      color: "text-rose-400",
      bgColor: "bg-rose-400/10",
      description: "Smallest companies — highest returns potential but most volatile",
    };
  }

  // Default: Moderate
  return {
    level: "Moderate",
    color: "text-sky-400",
    bgColor: "bg-sky-400/10",
    description: "General equity fund",
  };
}

/** Category badge color mapping */
export function getCategoryColor(category: string): { text: string; bg: string } {
  const lower = category.toLowerCase();
  if (/index/i.test(lower)) return { text: "text-emerald-300", bg: "bg-emerald-400/10" };
  if (/flexi/i.test(lower)) return { text: "text-sky-300", bg: "bg-sky-400/10" };
  if (/large/i.test(lower)) return { text: "text-blue-300", bg: "bg-blue-400/10" };
  if (/mid/i.test(lower)) return { text: "text-amber-300", bg: "bg-amber-400/10" };
  if (/small/i.test(lower)) return { text: "text-rose-300", bg: "bg-rose-400/10" };
  if (/contra|value/i.test(lower)) return { text: "text-purple-300", bg: "bg-purple-400/10" };
  if (/international|global|fof/i.test(lower)) return { text: "text-teal-300", bg: "bg-teal-400/10" };
  if (/elss|tax/i.test(lower)) return { text: "text-green-300", bg: "bg-green-400/10" };
  if (/sectoral|thematic/i.test(lower)) return { text: "text-orange-300", bg: "bg-orange-400/10" };
  return { text: "text-slate-300", bg: "bg-slate-400/10" };
}

/**
 * Get category average 5Y CAGR (industry benchmark).
 * Based on historical category averages as of March 2026.
 * Returns null if category not recognized.
 * Source: Value Research / Morningstar category averages
 */
export function getCategoryAvgCagr(category: string): number | null {
  const lower = category.toLowerCase();
  
  // Index funds - track benchmark returns
  if (/nifty 50 index|sensex index/i.test(lower)) return 14.5;
  if (/nifty next 50|nifty 100/i.test(lower)) return 16.0;
  if (/nifty midcap|midcap index/i.test(lower)) return 20.0;
  if (/nifty smallcap|smallcap index/i.test(lower)) return 22.0;
  if (/index/i.test(lower)) return 14.0; // Generic index
  
  // Large Cap
  if (/large cap|largecap/i.test(lower)) return 14.5;
  if (/large.*mid|large and mid/i.test(lower)) return 16.5;
  
  // Flexi / Multi Cap
  if (/flexi cap|flexicap/i.test(lower)) return 16.0;
  if (/multi cap|multicap/i.test(lower)) return 17.0;
  
  // Mid Cap
  if (/mid cap|midcap/i.test(lower)) return 20.0;
  
  // Small Cap
  if (/small cap|smallcap/i.test(lower)) return 22.0;
  
  // Value / Contra
  if (/contra/i.test(lower)) return 18.0;
  if (/value/i.test(lower)) return 16.5;
  if (/dividend yield/i.test(lower)) return 15.0;
  
  // Focused / ELSS
  if (/focused/i.test(lower)) return 17.0;
  if (/elss|tax sav/i.test(lower)) return 17.5;
  
  // Sectoral / Thematic
  if (/banking|financial|psu bank/i.test(lower)) return 14.0;
  if (/pharma|health/i.test(lower)) return 15.0;
  if (/technology|tech|it/i.test(lower)) return 18.0;
  if (/infrastructure|infra/i.test(lower)) return 18.0;
  if (/consumption|fmcg|consumer/i.test(lower)) return 14.0;
  if (/manufacturing|mnc/i.test(lower)) return 16.0;
  if (/energy|power/i.test(lower)) return 20.0;
  if (/sectoral|thematic/i.test(lower)) return 16.0; // Generic
  
  // Hybrid / Balanced
  if (/aggressive hybrid|balanced advantage/i.test(lower)) return 13.0;
  if (/conservative hybrid|hybrid/i.test(lower)) return 10.0;
  if (/equity savings/i.test(lower)) return 9.0;
  if (/arbitrage/i.test(lower)) return 6.5;
  
  // International
  if (/international|global|us equity|nasdaq|world/i.test(lower)) return 12.0;
  if (/fof|fund of fund/i.test(lower)) return 12.0;
  
  // Debt / Fixed Income (low returns)
  if (/liquid|money market|overnight/i.test(lower)) return 6.0;
  if (/debt|gilt|bond|corporate/i.test(lower)) return 7.0;
  
  // Default for unrecognized categories
  return null;
}
