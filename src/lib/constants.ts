import type { Fund, PortfolioState } from "./types";

export const DEFAULT_FUNDS: Fund[] = [];

export const DEFAULT_PORTFOLIO_STATE: PortfolioState = {
  funds: DEFAULT_FUNDS,
  monthlySip: 0,
  stepUpRate: 0,
  inflationRate: 6,
  ltcgExemptionPerYear: 125000,
  ltcgTaxRate: 12.5,
  targetCoreSplit: 60,
  rebalanceEntries: {},
};

export const PROJECTION_HORIZONS = [3, 5, 10] as const;

export const MAX_FUNDS = 15;

export const SECTION_IDS = {
  dashboard: "dashboard",
  sipCalculator: "sip-investment",
  estimatedReturns: "estimated-returns",
  stepUp: "step-up-comparison",
  taxImpact: "tax-impact",
  inflation: "inflation-view",
  rebalancing: "rebalancing",
  settings: "settings",
} as const;

export const NAV_ITEMS = [
  { id: SECTION_IDS.dashboard, label: "Dashboard", icon: "LayoutDashboard" },
  { id: SECTION_IDS.sipCalculator, label: "SIP Investment", icon: "Calculator" },
  { id: SECTION_IDS.estimatedReturns, label: "Returns", icon: "TrendingUp" },
  { id: SECTION_IDS.stepUp, label: "Step-Up", icon: "ArrowUpRight" },
  { id: SECTION_IDS.taxImpact, label: "Tax", icon: "Receipt" },
  { id: SECTION_IDS.inflation, label: "Inflation", icon: "TrendingDown" },
  { id: SECTION_IDS.rebalancing, label: "Rebalance", icon: "Scale" },
  { id: SECTION_IDS.settings, label: "Settings", icon: "Settings" },
] as const;

export const CHART_COLORS = {
  emerald: "#10b981",
  teal: "#14b8a6",
  rose: "#f43f5e",
  amber: "#f59e0b",
  sky: "#38bdf8",
  violet: "#8b5cf6",
  slate: "#64748b",
  investedLine: "#64748b",
  valueLine: "#10b981",
  stepUpLine: "#38bdf8",
  stepUpInvested: "#8b5cf6",
};
