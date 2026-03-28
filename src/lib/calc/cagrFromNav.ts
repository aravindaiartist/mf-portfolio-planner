// ──────────────────────────────────────────────────────────
// cagrFromNav.ts — Compute real CAGR from daily NAV data
// Formula: CAGR = (endNAV / startNAV)^(1/years) - 1
// NAV data must be sorted oldest-first
// Returns decimals (0.188 = 18.8%)
// ──────────────────────────────────────────────────────────

interface NavPoint {
  date: string; // "DD-MM-YYYY"
  nav: number;
}

/** Parse "DD-MM-YYYY" to Date object */
function parseNavDate(dateStr: string): Date {
  const parts = dateStr.split("-");
  if (parts.length !== 3) return new Date(NaN);
  return new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
}

/** Find the NAV closest to a target date (on or before) using binary search */
function navAtDate(data: NavPoint[], targetDate: Date): NavPoint | null {
  if (data.length === 0) return null;

  const targetTime = targetDate.getTime();
  let lo = 0;
  let hi = data.length - 1;
  let best: NavPoint | null = null;

  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2);
    const midDate = parseNavDate(data[mid].date);
    const midTime = midDate.getTime();

    if (midTime <= targetTime) {
      best = data[mid];
      lo = mid + 1;
    } else {
      hi = mid - 1;
    }
  }

  // Allow up to 7 days tolerance
  if (best) {
    const bestTime = parseNavDate(best.date).getTime();
    if (targetTime - bestTime > 7 * 86400000) return null;
  }

  return best;
}

export interface CagrResult {
  /** decimal: 0.188 = 18.8% — null if insufficient data */
  cagr1Y: number | null;
  cagr3Y: number | null;
  cagr5Y: number | null;
  cagr10Y: number | null;
  /** Latest NAV value */
  latestNav: number | null;
  /** Date of latest NAV */
  latestDate: string | null;
  /** Total trading days available */
  totalRecords: number;
}

/**
 * Compute trailing CAGR from NAV history.
 * @param navData Array of { date: "DD-MM-YYYY", nav: number } sorted oldest-first
 * @returns CagrResult with decimal CAGR values
 */
export function computeCagrFromNav(navData: NavPoint[]): CagrResult {
  const result: CagrResult = {
    cagr1Y: null,
    cagr3Y: null,
    cagr5Y: null,
    cagr10Y: null,
    latestNav: null,
    latestDate: null,
    totalRecords: navData.length,
  };

  if (navData.length < 30) return result;

  const latest = navData[navData.length - 1];
  result.latestNav = latest.nav;
  result.latestDate = latest.date;

  const latestDate = parseNavDate(latest.date);
  if (isNaN(latestDate.getTime())) return result;

  const periods: Array<{ key: keyof CagrResult; years: number; minDays: number }> = [
    { key: "cagr1Y", years: 1, minDays: 200 },
    { key: "cagr3Y", years: 3, minDays: 700 },
    { key: "cagr5Y", years: 5, minDays: 1200 },
    { key: "cagr10Y", years: 10, minDays: 2400 },
  ];

  for (const period of periods) {
    const targetDate = new Date(latestDate);
    targetDate.setDate(targetDate.getDate() - Math.round(period.years * 365.25));

    // Check if we have enough data
    const firstDate = parseNavDate(navData[0].date);
    const daysCovered = (latestDate.getTime() - firstDate.getTime()) / 86400000;
    if (daysCovered < period.minDays) continue;

    const startNav = navAtDate(navData, targetDate);
    if (!startNav || startNav.nav <= 0) continue;

    const cagr = Math.pow(latest.nav / startNav.nav, 1 / period.years) - 1;

    // Sanity check: CAGR between -50% and +100%
    if (cagr >= -0.5 && cagr <= 1.0) {
      ((result as unknown) as Record<string, number | null | string>)[period.key] = cagr;
    }
  }

  return result;
}
