// ──────────────────────────────────────────────────────────
// storage.ts — All localStorage access goes through here
// Components NEVER read/write localStorage directly.
// ──────────────────────────────────────────────────────────

import type { PortfolioState } from "./types";
import { DEFAULT_PORTFOLIO_STATE } from "./constants";

const KEYS = {
  portfolio: "mf-planner-portfolio",
  tracker: "mf-planner-tracker",
  rebalance: "mf-planner-rebalance",
  goals: "mf-planner-goals",
  scenarios: "mf-planner-scenarios",
  version: "mf-planner-version",
} as const;

const CURRENT_VERSION = 1;

function safeGet<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function safeSet(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn("localStorage write failed:", e);
  }
}

/** Load portfolio state from storage, falling back to defaults */
export function loadPortfolioState(): PortfolioState {
  const version = safeGet<number>(KEYS.version, 0);
  if (version < CURRENT_VERSION) {
    // Future migration logic goes here
    safeSet(KEYS.version, CURRENT_VERSION);
  }
  return safeGet<PortfolioState>(KEYS.portfolio, DEFAULT_PORTFOLIO_STATE);
}

/** Save portfolio state to storage */
export function savePortfolioState(state: PortfolioState): void {
  safeSet(KEYS.portfolio, state);
  safeSet(KEYS.version, CURRENT_VERSION);
}

/** Export all user data as a single JSON object */
export function exportAllData(): string {
  const data = {
    version: CURRENT_VERSION,
    portfolio: safeGet(KEYS.portfolio, null),
    tracker: safeGet(KEYS.tracker, null),
    rebalance: safeGet(KEYS.rebalance, null),
    goals: safeGet(KEYS.goals, null),
    scenarios: safeGet(KEYS.scenarios, null),
  };
  return JSON.stringify(data, null, 2);
}

/** Clear all app data and reset to defaults */
export function resetAllData(): void {
  Object.values(KEYS).forEach((key) => {
    try {
      localStorage.removeItem(key);
    } catch {
      // silent
    }
  });
}
