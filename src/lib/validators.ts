// ──────────────────────────────────────────────────────────
// validators.ts — Pure validation functions
// Return { valid, warnings[] } — NEVER block the user
// ──────────────────────────────────────────────────────────

import type { Fund } from "./types";

export interface ValidationResult {
  valid: boolean;
  warnings: string[];
}

const ok = (): ValidationResult => ({ valid: true, warnings: [] });
const warn = (msgs: string[]): ValidationResult => ({
  valid: false,
  warnings: msgs,
});

/** Validate that fund allocations sum to ~100% */
export const validateAllocationTotal = (funds: Fund[]): ValidationResult => {
  if (funds.length === 0) {
    return warn(["Add at least one fund to begin."]);
  }
  const total = funds.reduce((s, f) => s + f.allocation, 0);
  if (Math.abs(total - 100) > 0.01) {
    return warn([`Allocation totals ${total.toFixed(1)}% — should be 100%.`]);
  }
  return ok();
};

/** Validate a single fund's allocation */
export const validateFundAllocation = (allocation: number): ValidationResult => {
  const w: string[] = [];
  if (allocation < 0) w.push("Allocation cannot be negative.");
  if (allocation > 100) w.push("Allocation cannot exceed 100%.");
  return w.length ? warn(w) : ok();
};

/** Validate expected return (UI percentage) */
export const validateExpectedReturn = (ret: number): ValidationResult => {
  const w: string[] = [];
  if (ret < 0) w.push("Expected return cannot be negative.");
  if (ret > 30) w.push("Return above 30% p.a. is unrealistic for long-term projections.");
  return w.length ? warn(w) : ok();
};

/** Validate monthly SIP (₹ absolute) */
export const validateMonthlySip = (sip: number): ValidationResult => {
  const w: string[] = [];
  if (sip <= 0) w.push("Monthly SIP must be positive.");
  if (sip > 10_000_000) w.push("Monthly SIP above ₹1 Cr — is this correct?");
  return w.length ? warn(w) : ok();
};

/** Validate step-up rate (UI percentage) */
export const validateStepUpRate = (rate: number): ValidationResult => {
  const w: string[] = [];
  if (rate < 0) w.push("Step-up rate cannot be negative.");
  if (rate > 50) w.push("Step-up above 50% p.a. is uncommon.");
  return w.length ? warn(w) : ok();
};

/** Validate inflation rate (UI percentage) */
export const validateInflationRate = (rate: number): ValidationResult => {
  const w: string[] = [];
  if (rate < 0) w.push("Inflation rate cannot be negative.");
  if (rate > 20) w.push("Inflation above 20% is unusually high.");
  return w.length ? warn(w) : ok();
};

/** Validate goal planner inputs */
export const validateGoalPlanner = (
  target: number,
  years: number
): ValidationResult => {
  const w: string[] = [];
  if (target <= 0) w.push("Enter a target amount.");
  if (years < 1 || years > 50) w.push("Timeline must be between 1 and 50 years.");
  if (!Number.isInteger(years)) w.push("Timeline must be a whole number of years.");
  return w.length ? warn(w) : ok();
};

/** Validate rebalance entries — check for zero-total edge case */
export const validateRebalanceEntries = (
  values: number[]
): ValidationResult => {
  const total = values.reduce((s, v) => s + v, 0);
  if (total === 0) {
    return warn(["Enter current values to see drift analysis."]);
  }
  const filledCount = values.filter((v) => v > 0).length;
  if (filledCount === 1 && values.length > 1) {
    return warn(["Enter values for all funds for meaningful drift analysis."]);
  }
  return ok();
};

/** Validate fund count */
export const validateFundCount = (count: number, max: number): ValidationResult => {
  if (count >= max) {
    return warn([`Maximum ${max} funds supported.`]);
  }
  return ok();
};

/** Clamp a number to a range */
export const clamp = (val: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, val));

/** Sanitize a numeric input — NaN becomes fallback */
export const sanitizeNumber = (val: number, fallback: number): number =>
  isFinite(val) ? val : fallback;
