import { useCallback } from "react";
import { usePortfolioContext } from "@/context/PortfolioContext";
import { fetchNavHistory } from "@/lib/mfapi";
import { computeCagrFromNav } from "@/lib/calc/cagrFromNav";
import { toPercent } from "@/lib/formatters";
import type { Fund } from "@/lib/types";

/**
 * Hook to fetch real CAGR for a fund from mfapi.in NAV history.
 * Auto-sets expectedReturn to 3Y CAGR (or 5Y, or 1Y as fallback).
 * Returns a function you call with a fund object.
 */
export function useFetchCagr() {
  const { dispatch } = usePortfolioContext();

  const fetchCagrForFund = useCallback(async (fund: Fund) => {
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

      // Pick best available CAGR for expectedReturn: prefer 3Y, then 5Y, then 1Y
      let autoReturn: number | null = null;
      if (cagrResult.cagr3Y !== null) {
        autoReturn = Math.round(toPercent(cagrResult.cagr3Y) * 10) / 10; // UI percentage, 1 decimal
      } else if (cagrResult.cagr5Y !== null) {
        autoReturn = Math.round(toPercent(cagrResult.cagr5Y) * 10) / 10;
      } else if (cagrResult.cagr1Y !== null) {
        autoReturn = Math.round(toPercent(cagrResult.cagr1Y) * 10) / 10;
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
