import type { Fund, PortfolioState } from "./types";

export const DEFAULT_FUNDS: Fund[] = [
  {
    id: "fund-ppfc",
    schemeCode: 122639,
    name: "Parag Parikh Flexi Cap Fund",
    bucket: "Core",
    style: "Growth",
    category: "Flexi Cap",
    allocation: 30,
    expectedReturn: 18.8,
    isin: "INF133U01DY9",
    expenseRatio: 0.58,
  },
  {
    id: "fund-icici-n50",
    schemeCode: 120620,
    name: "ICICI Pru Nifty 50 Index Fund",
    bucket: "Core",
    style: "Blend / Market Beta",
    category: "Index Fund",
    allocation: 30,
    expectedReturn: 12.1,
    isin: "INF109K01D56",
    expenseRatio: 0.19,
  },
  {
    id: "fund-sbi-contra",
    schemeCode: 119835,
    name: "SBI Contra Fund",
    bucket: "Satellite",
    style: "Value",
    category: "Contra / Value",
    allocation: 10,
    expectedReturn: 18.5,
    isin: "INF174K01AB9",
    expenseRatio: 0.67,
  },
  {
    id: "fund-mo-midcap",
    schemeCode: 127042,
    name: "Motilal Oswal Midcap Fund",
    bucket: "Satellite",
    style: "Growth",
    category: "Mid Cap",
    allocation: 10,
    expectedReturn: 22.0,
    isin: "INF581K01D35",
    expenseRatio: 0.58,
  },
  {
    id: "fund-bandhan-sc",
    schemeCode: 147946,
    name: "Bandhan Small Cap Fund",
    bucket: "Satellite",
    style: "Growth",
    category: "Small Cap",
    allocation: 10,
    expectedReturn: 20.6,
    isin: "INF194K01E88",
    expenseRatio: 0.55,
  },
  {
    id: "fund-axis-global",
    schemeCode: 148485,
    name: "Axis Global Equity Alpha FoF",
    bucket: "Satellite",
    style: "Growth",
    category: "International FoF",
    allocation: 10,
    expectedReturn: 22.0,
    isin: "INF846K01D55",
    expenseRatio: 1.47,
  },
];

export const DEFAULT_PORTFOLIO_STATE: PortfolioState = {
  funds: DEFAULT_FUNDS,
  monthlySip: 50000,
  stepUpRate: 10,
  inflationRate: 6,
  ltcgExemptionPerYear: 125000,
  ltcgTaxRate: 12.5,
  rebalanceEntries: {},
};

export const PROJECTION_HORIZONS = [3, 5, 10] as const;

export const MAX_FUNDS = 15;

export const SECTION_IDS = {
  dashboard: "dashboard",
  sipCalculator: "sip-calculator",
  estimatedReturns: "estimated-returns",
  stepUp: "step-up-comparison",
  taxImpact: "tax-impact",
  inflation: "inflation-view",
  rebalancing: "rebalancing",
  settings: "settings",
} as const;

export const NAV_ITEMS = [
  { id: SECTION_IDS.dashboard, label: "Dashboard", icon: "LayoutDashboard" },
  { id: SECTION_IDS.sipCalculator, label: "SIP Calculator", icon: "Calculator" },
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
