import { useMemo } from "react";
import { usePortfolioContext } from "@/context/PortfolioContext";
import { toDecimal, toPercent } from "@/lib/formatters";
import { sipFV, stepUpProjection, flatVsStepUpData } from "@/lib/calc/sipFV";
import { ltcgPortfolio, ltcgPerFund } from "@/lib/calc/ltcgTax";
import { inflationProjection } from "@/lib/calc/inflation";
import { validateAllocationTotal } from "@/lib/validators";
import { computeRebalancing } from "@/lib/calc/rebalancing";
import type { FundProjection, RebalanceFundRow, RebalanceSnapshot } from "@/lib/types";

/**
 * Helper to get actual SIP for a fund (uses override if set, otherwise calculates from allocation)
 */
function getFundSip(fund: { allocation: number; sipOverride?: number | null }, monthlySip: number): number {
  if (fund.sipOverride != null) {
    return fund.sipOverride;
  }
  return Math.round(monthlySip * toDecimal(fund.allocation));
}

export function usePortfolio() {
  const { state, dispatch } = usePortfolioContext();
  const {
    funds,
    monthlySip,
    stepUpRate,
    inflationRate,
    ltcgExemptionPerYear,
    ltcgTaxRate,
    cagrOverride,
    rebalanceEntries,
  } = state;

  // Allocation validation
  const allocationValidation = useMemo(
    () => validateAllocationTotal(funds),
    [funds]
  );

  // Calculate actual total SIP (respecting sipOverride)
  const actualTotalSip = useMemo(() => {
    return funds.reduce((sum, f) => sum + getFundSip(f, monthlySip), 0);
  }, [funds, monthlySip]);

  // Computed weighted avg CAGR (decimal) — from individual fund returns
  // Uses actual SIP amounts (with overrides) for weighting
  const computedWtdAvgCagr = useMemo(() => {
    const totalSip = actualTotalSip;
    if (totalSip <= 0) return 0;
    
    return funds.reduce((sum, f) => {
      const fundSip = getFundSip(f, monthlySip);
      const weight = fundSip / totalSip;
      return sum + weight * toDecimal(f.expectedReturn);
    }, 0);
  }, [funds, monthlySip, actualTotalSip]);

  // Effective CAGR: use manual override if set, otherwise computed
  const cagrOverrideDecimal = cagrOverride != null ? toDecimal(cagrOverride) : null;
  const wtdAvgCagrDecimal = cagrOverrideDecimal ?? computedWtdAvgCagr;
  const isUsingCagrOverride = cagrOverride != null;

  // Per-fund SIP amounts (respecting sipOverride)
  const fundSipAmounts = useMemo(() => {
    return funds.map((f) => ({
      fundId: f.id,
      fundName: f.name,
      sipAmount: getFundSip(f, monthlySip),
    }));
  }, [funds, monthlySip]);

  // Per-fund projections (3Y/5Y/10Y)
  // IMPORTANT: Uses actual SIP amounts (with overrides)
  const fundProjections: FundProjection[] = useMemo(() => {
    return funds.map((f) => {
      const sip = getFundSip(f, monthlySip);
      const ret = cagrOverrideDecimal ?? toDecimal(f.expectedReturn);
      return {
        fundId: f.id,
        fundName: f.name,
        threeYearValue: Math.round(sipFV(sip, ret, 36)),
        fiveYearValue: Math.round(sipFV(sip, ret, 60)),
        tenYearValue: Math.round(sipFV(sip, ret, 120)),
      };
    });
  }, [funds, monthlySip, cagrOverrideDecimal]);

  // Portfolio totals (sum of per-fund)
  const portfolioTotals = useMemo(() => {
    const sum = (key: keyof FundProjection) =>
      fundProjections.reduce((s, fp) => s + (fp[key] as number), 0);
    return {
      threeYear: sum("threeYearValue"),
      fiveYear: sum("fiveYearValue"),
      tenYear: sum("tenYearValue"),
      investedThreeYear: actualTotalSip * 36,
      investedFiveYear: actualTotalSip * 60,
      investedTenYear: actualTotalSip * 120,
    };
  }, [fundProjections, actualTotalSip]);

  // Step-up projection (uses actual total SIP)
  const stepUpRows = useMemo(
    () =>
      stepUpProjection(
        actualTotalSip,
        wtdAvgCagrDecimal,
        toDecimal(stepUpRate),
        10
      ),
    [actualTotalSip, wtdAvgCagrDecimal, stepUpRate]
  );

  // Flat vs step-up chart data (uses actual total SIP)
  const flatVsStepUp = useMemo(
    () =>
      flatVsStepUpData(
        actualTotalSip,
        wtdAvgCagrDecimal,
        toDecimal(stepUpRate),
        10
      ),
    [actualTotalSip, wtdAvgCagrDecimal, stepUpRate]
  );

  // LTCG portfolio-level (uses actual total SIP)
  const ltcgResults = useMemo(
    () =>
      ltcgPortfolio(
        actualTotalSip,
        wtdAvgCagrDecimal,
        ltcgExemptionPerYear,
        toDecimal(ltcgTaxRate)
      ),
    [actualTotalSip, wtdAvgCagrDecimal, ltcgExemptionPerYear, ltcgTaxRate]
  );

  // LTCG per-fund (uses actual SIP amounts with overrides)
  const ltcgPerFundResults = useMemo(
    () =>
      ltcgPerFund(
        funds.map((f) => ({
          fundId: f.id,
          fundName: f.name,
          sipAmount: getFundSip(f, monthlySip),
          expectedReturn: cagrOverrideDecimal ?? toDecimal(f.expectedReturn),
          allocation: toDecimal(f.allocation),
        })),
        ltcgExemptionPerYear,
        toDecimal(ltcgTaxRate),
        10
      ),
    [funds, monthlySip, ltcgExemptionPerYear, ltcgTaxRate, cagrOverrideDecimal]
  );

  // Inflation projection (uses actual total SIP)
  const inflationRows = useMemo(
    () =>
      inflationProjection(
        actualTotalSip,
        wtdAvgCagrDecimal,
        toDecimal(inflationRate),
        10
      ),
    [actualTotalSip, wtdAvgCagrDecimal, inflationRate]
  );

  // Core/Satellite split
  const coreSatelliteSplit = useMemo(() => {
    const core = funds
      .filter((f) => f.bucket === "Core")
      .reduce((s, f) => s + f.allocation, 0);
    const satellite = funds
      .filter((f) => f.bucket === "Satellite")
      .reduce((s, f) => s + f.allocation, 0);
    return { core, satellite };
  }, [funds]);

  // ── V1B: Rebalancing derived state ──

  const rebalanceFundRows: RebalanceFundRow[] = useMemo(() => {
    const entries = rebalanceEntries ?? {};
    const input = funds.map((f) => ({
      fundId: f.id,
      currentValue: entries[f.id] ?? 0,
      targetAllocation: toDecimal(f.allocation),
    }));
    const results = computeRebalancing(input);
    return funds.map((f, i) => {
      const r = results[i];
      const nav = f.latestNav ?? null;
      const currentValue = entries[f.id] ?? 0;
      const impliedUnits = nav !== null && nav > 0 ? currentValue / nav : null;
      return {
        fundId: f.id,
        fundName: f.name,
        bucket: f.bucket,
        currentValue,
        targetPct: Math.round(f.allocation * 100) / 100,
        currentPct: Math.round(toPercent(r.currentPct) * 100) / 100,
        driftPct: Math.round(toPercent(r.drift) * 100) / 100,
        action: r.action,
        rebalanceAmount: r.rebalanceAmount,
        latestNav: nav,
        impliedUnits: impliedUnits !== null ? Math.round(impliedUnits * 1000) / 1000 : null,
      };
    });
  }, [funds, rebalanceEntries]);

  const rebalanceSnapshot: RebalanceSnapshot = useMemo(() => {
    const totalValue = rebalanceFundRows.reduce((s, r) => s + r.currentValue, 0);
    const fundsNeedingRebalance = rebalanceFundRows.filter((r) => r.action !== "HOLD").length;
    const maxDriftPct = rebalanceFundRows.length > 0
      ? Math.max(...rebalanceFundRows.map((r) => Math.abs(r.driftPct)))
      : 0;
    let portfolioHealth: RebalanceSnapshot["portfolioHealth"];
    if (maxDriftPct < 5) portfolioHealth = "Healthy";
    else if (maxDriftPct <= 10) portfolioHealth = "Needs Attention";
    else portfolioHealth = "Critical";
    return {
      totalValue,
      fundsNeedingRebalance,
      maxDriftPct: Math.round(maxDriftPct * 100) / 100,
      portfolioHealth,
    };
  }, [rebalanceFundRows]);

  // ── Return ──

  return {
    state,
    dispatch,
    allocationValidation,
    wtdAvgCagrDecimal,
    computedWtdAvgCagr,
    isUsingCagrOverride,
    actualTotalSip,
    fundSipAmounts,
    fundProjections,
    portfolioTotals,
    stepUpRows,
    flatVsStepUp,
    ltcgResults,
    ltcgPerFundResults,
    inflationRows,
    coreSatelliteSplit,
    rebalanceFundRows,
    rebalanceSnapshot,
  };
}