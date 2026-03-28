import { useCallback } from "react";
import { usePortfolioContext } from "@/context/PortfolioContext";
import { fetchNavHistory } from "@/lib/mfapi";
import { computeCagrFromNav } from "@/lib/calc/cagrFromNav";
import { toPercent } from "@/lib/formatters";
import type { Fund } from "@/lib/types";

/**
 * Hook to fetch real CAGR for a fund from mfapi.in NAV history.
 * Auto-sets expectedReturn based on user's preferred period (with fallbacks).
 * Returns a function you call with a fund object.
 */
export function useFetchCagr() {
  const { dispatch } = usePortfolioContext();

  const fetchCagrForFund = useCallback(async (fund: Fund, preferredPeriod: string = "5") => {
    if (!fund.schemeCode) return;

    // Mark as fetching
    dispatch({ type: "SET_FUND_FETCHING", fundId: fund.id, fetching: true });

    try {
      const navResponse = await fetchNavHistory(fund.schemeCode);
      if (!navResponse || navResponse.navData.length < 30) {
        dispatch({ type: "SET_FUND_FETCHING", fundId: fund.id, fetching: false });
        return;
      }

      const cagrResult = computeCagrFromNav(navResponse.navData);

      // Build fallback chain based on user's preferred period
      // e.g., if user selects 10Y: try 10Y → 5Y → 3Y → 1Y
      // if user selects 5Y: try 5Y → 3Y → 10Y → 1Y
      // if user selects 3Y: try 3Y → 5Y → 10Y → 1Y
      const cagrMap: Record<string, number | null> = {
        "1": cagrResult.cagr1Y,
        "3": cagrResult.cagr3Y,
        "5": cagrResult.cagr5Y,
        "10": cagrResult.cagr10Y,
      };

      const fallbackOrder: Record<string, string[]> = {
        "1": ["1", "3", "5", "10"],
        "3": ["3", "5", "10", "1"],
        "5": ["5", "3", "10", "1"],
        "10": ["10", "5", "3", "1"],
      };

      const order = fallbackOrder[preferredPeriod] || fallbackOrder["5"];
      let autoReturn: number | null = null;

      for (const period of order) {
        const cagr = cagrMap[period];
        if (cagr !== null) {
          autoReturn = Math.round(toPercent(cagr) * 10) / 10; // UI percentage, 1 decimal
          break;
        }
      }

      dispatch({
        type: "SET_FUND_CAGR",
        fundId: fund.id,
        cagr: {
          cagr1Y: cagrResult.cagr1Y,
          cagr3Y: cagrResult.cagr3Y,
          cagr5Y: cagrResult.cagr5Y,
          cagr10Y: cagrResult.cagr10Y,
          latestNav: cagrResult.latestNav,
        },
        autoSetReturn: autoReturn,
      });
    } catch {
      dispatch({ type: "SET_FUND_FETCHING", fundId: fund.id, fetching: false });
    }
  }, [dispatch]);

  /** Fetch CAGR for all funds that have schemeCode but no fetched data */
  const fetchAllMissing = useCallback(async (funds: Fund[]) => {
    const toFetch = funds.filter(
      (f) => f.schemeCode && f.fetchedCagr3Y === undefined && !f.isFetchingCagr
    );
    // Fetch sequentially with small delay to avoid hammering API
    for (const fund of toFetch) {
      await fetchCagrForFund(fund);
      await new Promise((r) => setTimeout(r, 300));
    }
  }, [fetchCagrForFund]);

  return { fetchCagrForFund, fetchAllMissing };
}
