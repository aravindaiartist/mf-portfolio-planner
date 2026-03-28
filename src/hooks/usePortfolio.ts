import { useMemo } from "react";
import { usePortfolioContext } from "@/context/PortfolioContext";
import { toDecimal, toPercent } from "@/lib/formatters";
import { weightedCagr } from "@/lib/calc/weightedCagr";
import { sipFV, stepUpProjection, flatVsStepUpData } from "@/lib/calc/sipFV";
import { ltcgPortfolio, ltcgPerFund } from "@/lib/calc/ltcgTax";
import { inflationProjection } from "@/lib/calc/inflation";
import { validateAllocationTotal } from "@/lib/validators";
import { computeRebalancing } from "@/lib/calc/rebalancing";
import type { FundProjection, RebalanceFundRow, RebalanceSnapshot } from "@/lib/types";

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

  // Computed weighted avg CAGR (decimal) — from individual fund returns
  const computedWtdAvgCagr = useMemo(() => {
    return weightedCagr(
      funds.map((f) => ({
        allocation: toDecimal(f.allocation),
        expectedReturn: toDecimal(f.expectedReturn),
      }))
    );
  }, [funds]);

  // Effective CAGR: use manual override if set, otherwise computed
  const cagrOverrideDecimal = cagrOverride != null ? toDecimal(cagrOverride) : null;
  const wtdAvgCagrDecimal = cagrOverrideDecimal ?? computedWtdAvgCagr;
  const isUsingCagrOverride = cagrOverride != null;

  // Per-fund SIP amounts
  const fundSipAmounts = useMemo(() => {
    return funds.map((f) => ({
      fundId: f.id,
      fundName: f.name,
      sipAmount: Math.round(monthlySip * toDecimal(f.allocation)),
    }));
  }, [funds, monthlySip]);

  // Per-fund projections (3Y/5Y/10Y)
  // IMPORTANT: When cagrOverride is set, ALL funds use the override CAGR.
  // This ensures flat SIP projections match the user's custom CAGR assumption.
  // When no override, each fund uses its own expectedReturn.
  const fundProjections: FundProjection[] = useMemo(() => {
    return funds.map((f) => {
      const sip = monthlySip * toDecimal(f.allocation);
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
      investedThreeYear: monthlySip * 36,
      investedFiveYear: monthlySip * 60,
      investedTenYear: monthlySip * 120,
    };
  }, [fundProjections, monthlySip]);

  // Step-up projection (always uses wtdAvgCagrDecimal which respects override)
  const stepUpRows = useMemo(
    () =>
      stepUpProjection(
        monthlySip,
        wtdAvgCagrDecimal,
        toDecimal(stepUpRate),
        10
      ),
    [monthlySip, wtdAvgCagrDecimal, stepUpRate]
  );

  // Flat vs step-up chart data (uses wtdAvgCagrDecimal — respects override)
  const flatVsStepUp = useMemo(
    () =>
      flatVsStepUpData(
        monthlySip,
        wtdAvgCagrDecimal,
        toDecimal(stepUpRate),
        10
      ),
    [monthlySip, wtdAvgCagrDecimal, stepUpRate]
  );

  // LTCG portfolio-level (uses wtdAvgCagrDecimal — respects override)
  const ltcgResults = useMemo(
    () =>
      ltcgPortfolio(
        monthlySip,
        wtdAvgCagrDecimal,
        ltcgExemptionPerYear,
        toDecimal(ltcgTaxRate)
      ),
    [monthlySip, wtdAvgCagrDecimal, ltcgExemptionPerYear, ltcgTaxRate]
  );

  // LTCG per-fund (illustrative)
  // Also uses override CAGR when set, so per-fund breakdown stays consistent
  const ltcgPerFundResults = useMemo(
    () =>
      ltcgPerFund(
        funds.map((f) => ({
          fundId: f.id,
          fundName: f.name,
          sipAmount: monthlySip * toDecimal(f.allocation),
          expectedReturn: cagrOverrideDecimal ?? toDecimal(f.expectedReturn),
          allocation: toDecimal(f.allocation),
        })),
        ltcgExemptionPerYear,
        toDecimal(ltcgTaxRate),
        10
      ),
    [funds, monthlySip, ltcgExemptionPerYear, ltcgTaxRate, cagrOverrideDecimal]
  );

  // Inflation projection (uses wtdAvgCagrDecimal — respects override)
  const inflationRows = useMemo(
    () =>
      inflationProjection(
        monthlySip,
        wtdAvgCagrDecimal,
        toDecimal(inflationRate),
        10
      ),
    [monthlySip, wtdAvgCagrDecimal, inflationRate]
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