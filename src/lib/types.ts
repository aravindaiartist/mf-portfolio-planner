// ──────────────────────────────────────────────────────────
// types.ts — All data model types for MF Portfolio Planner
// UNIT CONVENTION:
//   "₹ absolute"     = rupees, e.g. 50000
//   "UI percentage"   = shown in UI, e.g. 18.8 means 18.8%
//   "decimal"         = used in calc, e.g. 0.188
//   "integer"         = whole number
// ──────────────────────────────────────────────────────────

export type FundBucket = "Core" | "Satellite";

export type FundStyle =
  | "Growth"
  | "Value"
  | "Momentum"
  | "Blend / Market Beta";

export interface Fund {
  /** Unique ID (crypto.randomUUID) */
  id: string;
  /** AMFI scheme code for API lookups */
  schemeCode?: number;
  /** Fund display name */
  name: string;
  /** Core or Satellite — auto-classified on add, always editable */
  bucket: FundBucket;
  /** Investment style — auto-classified on add, always editable */
  style: FundStyle;
  /** Category label, e.g. "Flexi Cap", "Mid Cap" */
  category: string;
  /** UI percentage: 25 means 25% of portfolio */
  allocation: number;
  /** UI percentage: 18.8 means 18.8% p.a. expected CAGR */
  expectedReturn: number;
  /** ISIN code, optional */
  isin?: string;
  /** UI percentage: 0.58 means 0.58% expense ratio */
  expenseRatio?: number;
  /** decimal: fetched 1Y CAGR from NAV data (null = not fetched) */
  fetchedCagr1Y?: number | null;
  /** decimal: fetched 3Y CAGR from NAV data (null = not fetched) */
  fetchedCagr3Y?: number | null;
  /** decimal: fetched 5Y CAGR from NAV data (null = not fetched) */
  fetchedCagr5Y?: number | null;
  /** decimal: fetched 10Y CAGR from NAV data (null = not fetched) */
  fetchedCagr10Y?: number | null;
  /** Whether the expectedReturn was auto-set from fetched data (vs manual) */
  isReturnFromApi?: boolean;
  /** Whether CAGR fetch is in progress */
  isFetchingCagr?: boolean;
  /** Latest NAV value */
  latestNav?: number | null;
}

export interface PortfolioState {
  funds: Fund[];
  /** ₹ absolute: monthly SIP amount */
  monthlySip: number;
  /** UI percentage: 10 means 10% annual step-up */
  stepUpRate: number;
  /** UI percentage: 6 means 6% annual inflation */
  inflationRate: number;
  /** ₹ absolute: LTCG exemption per financial year */
  ltcgExemptionPerYear: number;
  /** UI percentage: 12.5 means 12.5% tax rate */
  ltcgTaxRate: number;
  /** UI percentage: manual CAGR override — null means use computed wtd avg */
  cagrOverride?: number | null;
  /** Map of fundId → user-entered current market value (₹ absolute). V1B rebalancing. */
  rebalanceEntries: Record<string, number>;
}

export interface GoalPlannerInputs {
  /** ₹ absolute: target corpus */
  targetCorpus: number;
  /** integer: number of years */
  timelineYears: number;
  /** UI percentage: auto-linked to portfolio wtd avg, editable */
  expectedReturn: number;
}

export interface TrackerEntry {
  /** Unique ID */
  id: string;
  /** Display label, e.g. "Mar 2026" */
  month: string;
  /** integer: 1-based month index since first SIP month */
  monthIndex: number;
  /** ₹ absolute: cumulative investment */
  totalInvested: number;
  /** ₹ absolute or null if not yet entered */
  actualValue: number | null;
}

export interface RebalanceEntry {
  /** References Fund.id */
  fundId: string;
  /** ₹ absolute: user-entered current value */
  currentValue: number;
}

export interface ScenarioTier {
  /** ₹ absolute: monthly SIP for this scenario */
  monthlySip: number;
}

// ── Derived / Computed types (not stored in state) ──

export interface FundProjection {
  fundId: string;
  fundName: string;
  /** ₹ absolute */
  threeYearValue: number;
  /** ₹ absolute */
  fiveYearValue: number;
  /** ₹ absolute */
  tenYearValue: number;
}

export interface StepUpRow {
  /** integer: 1–10 */
  year: number;
  /** ₹ absolute */
  monthlySip: number;
  /** ₹ absolute */
  yearlyInvestment: number;
  /** ₹ absolute: cumulative */
  totalInvested: number;
  /** ₹ absolute */
  portfolioValue: number;
}

export interface FlatVsStepUpRow {
  /** integer: 0–10 */
  year: number;
  /** ₹ absolute */
  investedFlat: number;
  /** ₹ absolute */
  valueFlat: number;
  /** ₹ absolute */
  investedStepUp: number;
  /** ₹ absolute */
  valueStepUp: number;
}

export interface LtcgHorizonResult {
  /** integer: 3, 5, or 10 */
  horizon: number;
  /** ₹ absolute */
  totalInvested: number;
  /** ₹ absolute */
  grossValue: number;
  /** ₹ absolute */
  grossGain: number;
  /** ₹ absolute */
  exemptGain: number;
  /** ₹ absolute */
  taxableGain: number;
  /** ₹ absolute */
  ltcgTax: number;
  /** ₹ absolute */
  netCorpus: number;
  /** decimal: tax as fraction of gross value */
  taxDrag: number;
  /** decimal: net CAGR after tax */
  netCAGR: number;
}

export interface LtcgPerFundResult {
  fundId: string;
  fundName: string;
  /** decimal: allocation as fraction */
  allocation: number;
  /** ₹ absolute */
  grossValue: number;
  /** ₹ absolute */
  grossGain: number;
  /** ₹ absolute */
  estimatedTax: number;
  /** ₹ absolute */
  netValue: number;
}

export interface InflationRow {
  /** integer: 1–10 */
  year: number;
  /** ₹ absolute */
  nominalCorpus: number;
  /** ₹ absolute */
  totalInvested: number;
  /** decimal: discount factor */
  discountFactor: number;
  /** ₹ absolute: real value in today's rupees */
  realValue: number;
  /** ₹ absolute */
  purchasingPowerLoss: number;
  /** decimal */
  realCAGR: number;
  /** decimal */
  inflationErosion: number;
}

export interface ScenarioFundRow {
  fundName: string;
  /** decimal: allocation fraction */
  allocation: number;
  /** ₹ absolute per scenario tier */
  amounts: number[];
}

// ── Derived type for the rebalancing section ──

export interface RebalanceFundRow {
  fundId: string;
  fundName: string;
  bucket: FundBucket;
  /** ₹ absolute: user-entered current market value */
  currentValue: number;
  /** UI percentage: e.g. 30 means 30% */
  targetPct: number;
  /** UI percentage: actual current allocation */
  currentPct: number;
  /** UI percentage: currentPct − targetPct (signed) */
  driftPct: number;
  /** "BUY" | "SELL" | "HOLD" */
  action: "BUY" | "SELL" | "HOLD";
  /** ₹ absolute: amount to transact to return to target */
  rebalanceAmount: number;
  /** Latest NAV from API (null if not fetched) */
  latestNav: number | null;
  /** Units implied by currentValue ÷ latestNav (null if NAV unavailable) */
  impliedUnits: number | null;
}

export interface RebalanceSnapshot {
  /** ₹ absolute: sum of all current values */
  totalValue: number;
  /** integer: count of funds with action BUY or SELL */
  fundsNeedingRebalance: number;
  /** UI percentage: highest |driftPct| across all funds */
  maxDriftPct: number;
  /** "Healthy" | "Needs Attention" | "Critical" */
  portfolioHealth: "Healthy" | "Needs Attention" | "Critical";
}

// ── Action types for useReducer ──

export type PortfolioAction =
  | { type: "SET_FUNDS"; funds: Fund[] }
  | { type: "ADD_FUND"; fund: Fund }
  | { type: "UPDATE_FUND"; fund: Fund }
  | { type: "REMOVE_FUND"; fundId: string }
  | { type: "SET_MONTHLY_SIP"; value: number }
  | { type: "SET_STEP_UP_RATE"; value: number }
  | { type: "SET_INFLATION_RATE"; value: number }
  | { type: "SET_LTCG_EXEMPTION"; value: number }
  | { type: "SET_LTCG_TAX_RATE"; value: number }
  | { type: "SET_CAGR_OVERRIDE"; value: number | null }
  | { type: "SET_FUND_CAGR"; fundId: string; cagr: { cagr1Y: number | null; cagr3Y: number | null; cagr5Y: number | null; cagr10Y: number | null; latestNav: number | null }; autoSetReturn: number | null }
  | { type: "SET_FUND_FETCHING"; fundId: string; fetching: boolean }
  | { type: "SET_FUND_CAGR"; fundId: string; cagr: { cagr1Y: number | null; cagr3Y: number | null; cagr5Y: number | null; cagr10Y: number | null; latestNav: number | null }; autoSetReturn: number | null }
  | { type: "SET_FUND_FETCHING"; fundId: string; fetching: boolean }
  | { type: "LOAD_STATE"; state: PortfolioState }
  | { type: "RESET" }
  | { type: "SET_REBALANCE_ENTRY"; fundId: string; value: number };
