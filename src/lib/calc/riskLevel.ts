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
