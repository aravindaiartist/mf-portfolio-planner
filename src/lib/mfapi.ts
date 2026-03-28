// ──────────────────────────────────────────────────────────
// mfapi.ts — AMFI data fetcher via mfapi.in
// Fetches fund list + NAV history · Falls back to static index
// ──────────────────────────────────────────────────────────

import { STATIC_FUND_INDEX, type StaticFundEntry } from "./data/staticFundIndex";

export interface MfSearchResult {
  schemeCode: number;
  schemeName: string;
  /** true if this is a Direct plan */
  isDirect: boolean;
  /** true if this is a Growth option */
  isGrowth: boolean;
}

export interface NavDataPoint {
  date: string;
  nav: number;
}

export interface FundNavResponse {
  schemeCode: number;
  schemeName: string;
  navData: NavDataPoint[];
}

// ── Fund Search ──

let cachedLiveIndex: StaticFundEntry[] | null = null;

/**
 * Search funds by name. Uses live API first, falls back to static index.
 * Returns max 50 results, Direct-Growth plans sorted first.
 */
export async function searchFunds(query: string): Promise<MfSearchResult[]> {
  if (query.trim().length < 2) return [];

  const index = cachedLiveIndex ?? STATIC_FUND_INDEX;
  const lower = query.toLowerCase();

  // Split query into words for multi-word matching
  const words = lower.split(/\s+/).filter(Boolean);

  const matches = index
    .filter((f) => {
      const name = f.schemeName.toLowerCase();
      return words.every((w) => name.includes(w));
    })
    .map((f) => ({
      schemeCode: f.schemeCode,
      schemeName: f.schemeName,
      isDirect: /direct/i.test(f.schemeName),
      isGrowth: /growth/i.test(f.schemeName),
    }))
    // Sort: Direct Growth first, then Direct others, then Regular
    .sort((a, b) => {
      const aScore = (a.isDirect ? 2 : 0) + (a.isGrowth ? 1 : 0);
      const bScore = (b.isDirect ? 2 : 0) + (b.isGrowth ? 1 : 0);
      return bScore - aScore;
    })
    .slice(0, 50);

  return matches;
}

/**
 * Try to warm the live fund index from mfapi.in.
 * Called once on app load. Falls back silently to static index.
 */
export async function prewarmLiveIndex(): Promise<void> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    const resp = await fetch("https://api.mfapi.in/mf", { signal: controller.signal });
    clearTimeout(timeout);
    if (resp.ok) {
      const data = await resp.json();
      if (Array.isArray(data) && data.length > 1000) {
        cachedLiveIndex = data.map((d: { schemeCode: number; schemeName: string }) => ({
          schemeCode: d.schemeCode,
          schemeName: d.schemeName,
        }));
      }
    }
  } catch {
    // Silent fallback to static index
  }
}

/**
 * Fetch full NAV history for a fund by scheme code.
 * @returns NavDataPoint[] sorted oldest-first, or empty array on failure
 */
export async function fetchNavHistory(schemeCode: number): Promise<FundNavResponse | null> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    const resp = await fetch(`https://api.mfapi.in/mf/${schemeCode}`, { signal: controller.signal });
    clearTimeout(timeout);

    if (!resp.ok) return null;
    const raw = await resp.json();

    if (raw.status !== "SUCCESS" || !Array.isArray(raw.data)) return null;

    const navData: NavDataPoint[] = raw.data
      .map((d: { date: string; nav: string }) => ({
        date: d.date,
        nav: parseFloat(d.nav),
      }))
      .filter((d: NavDataPoint) => !isNaN(d.nav))
      .reverse(); // API returns newest-first; we want oldest-first

    return {
      schemeCode: raw.meta?.scheme_code ?? schemeCode,
      schemeName: raw.meta?.scheme_name ?? "Unknown",
      navData,
    };
  } catch {
    return null;
  }
}
