import { useState, useCallback } from "react";
import { SECTION_IDS } from "@/lib/constants";
import { SectionWrapper } from "@/components/layout/SectionWrapper";
import { ProjectionBarChart } from "@/components/charts/ProjectionBarChart";
import { usePortfolio } from "@/hooks/usePortfolio";
import { Pencil, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { getRiskLevel, getCategoryColor } from "@/lib/calc/riskLevel";
import { sanitizeNumber } from "@/lib/validators";
import {
  formatCurrencyCompact,
  formatPercent,
  formatDecimalAsPercent,
} from "@/lib/formatters";

export function EstimatedReturnsSection() {
  const {
    state,
    dispatch,
    fundProjections,
    portfolioTotals,
    wtdAvgCagrDecimal,
    computedWtdAvgCagr,
    isUsingCagrOverride,
  } = usePortfolio();

  // Editable CAGR state
  const [editingCagr, setEditingCagr] = useState(false);
  const [tempCagr, setTempCagr] = useState("");

  const cagrDisplayPct = wtdAvgCagrDecimal * 100;

  const startEditCagr = useCallback(() => {
    setTempCagr(cagrDisplayPct.toFixed(1));
    setEditingCagr(true);
  }, [cagrDisplayPct]);

  const commitCagr = useCallback(() => {
    const val = sanitizeNumber(parseFloat(tempCagr), cagrDisplayPct);
    if (val >= 0 && val <= 50) {
      dispatch({ type: "SET_CAGR_OVERRIDE", value: val });
    }
    setEditingCagr(false);
  }, [tempCagr, cagrDisplayPct, dispatch]);

  const resetCagr = useCallback(() => {
    dispatch({ type: "SET_CAGR_OVERRIDE", value: null });
  }, [dispatch]);

  const noFunds = state.funds.length === 0;

  const barData = [
    {
      label: "3 Years",
      invested: portfolioTotals.investedThreeYear,
      value: portfolioTotals.threeYear,
    },
    {
      label: "5 Years",
      invested: portfolioTotals.investedFiveYear,
      value: portfolioTotals.fiveYear,
    },
    {
      label: "10 Years",
      invested: portfolioTotals.investedTenYear,
      value: portfolioTotals.tenYear,
    },
  ];

  return (
    <SectionWrapper
      id={SECTION_IDS.estimatedReturns}
      title="Estimated Returns"
      description="Projected portfolio value at 3, 5, and 10 year horizons. Returns are estimates based on assumed CAGR."
    >
      {noFunds ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-sm text-slate-500">Add funds in the SIP Investment section above to see projections.</p>
        </div>
      ) : (<>
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Table */}
        <div className="lg:col-span-3 bg-glass-bg border border-glass-border rounded-xl p-4">
          <h3 className="text-xs text-slate-400 uppercase tracking-wider mb-3">
            Per-Fund Projections (Flat SIP)
          </h3>

          {/* Editable CAGR */}
          <div className="flex items-center gap-3 mb-4 p-3 bg-white/[0.02] rounded-lg border border-glass-border/50">
            <span className="text-xs text-slate-400 uppercase tracking-wider">Wtd. Avg CAGR:</span>
            {editingCagr ? (
              <div className="flex items-center gap-1">
                <input
                  autoFocus
                  type="number"
                  value={tempCagr}
                  onChange={(e) => setTempCagr(e.target.value)}
                  onBlur={commitCagr}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") commitCagr();
                    if (e.key === "Escape") setEditingCagr(false);
                  }}
                  className="w-16 bg-navy-800 border border-accent/40 rounded px-2 py-1 text-sm font-mono text-slate-100 outline-none focus:border-accent"
                  step="0.5"
                  min="0"
                  max="50"
                />
                <span className="text-sm text-slate-400">%</span>
              </div>
            ) : (
              <button
                onClick={startEditCagr}
                className="text-sm font-mono font-semibold text-slate-100 hover:text-accent transition-colors cursor-pointer flex items-center gap-1"
                title="Click to set custom CAGR for projections"
              >
                {formatDecimalAsPercent(wtdAvgCagrDecimal)}
                <Pencil size={11} className="text-slate-500" />
              </button>
            )}
            {isUsingCagrOverride && (
              <>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-400/10 text-amber-400 font-medium">Custom</span>
                <span className="text-[10px] text-slate-500">
                  (Computed: {formatDecimalAsPercent(computedWtdAvgCagr)})
                </span>
                <button
                  onClick={resetCagr}
                  className="flex items-center gap-0.5 text-[10px] text-slate-500 hover:text-accent transition-colors"
                >
                  <RotateCcw size={9} /> Reset
                </button>
              </>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-glass-border text-xs text-slate-500 uppercase tracking-wider">
                  <th className="py-2 px-1 font-medium">Fund</th>
                  <th className="py-2 px-1 font-medium text-right hidden sm:table-cell">CAGR</th>
                  <th className="py-2 px-1 font-medium text-right">3Y</th>
                  <th className="py-2 px-1 font-medium text-right">5Y</th>
                  <th className="py-2 px-1 font-medium text-right">10Y</th>
                </tr>
              </thead>
              <tbody>
                {fundProjections.map((fp) => {
                  const fund = state.funds.find((f) => f.id === fp.fundId);
                  return (
                    <tr
                      key={fp.fundId}
                      className="border-b border-glass-border/50 hover:bg-white/[0.02]"
                    >
                      <td className="py-2 px-1 max-w-[220px]">
                        <div className="text-sm text-slate-300 truncate">{fp.fundName}</div>
                        {fund && (
                          <div className="flex items-center gap-1 mt-0.5">
                            <span className={cn("text-[9px] px-1 py-0.5 rounded font-medium", getCategoryColor(fund.category).text, getCategoryColor(fund.category).bg)}>
                              {fund.category}
                            </span>
                            <span className={cn("text-[9px] px-1 py-0.5 rounded font-medium", getRiskLevel(fund.category).color, getRiskLevel(fund.category).bgColor)}>
                              {getRiskLevel(fund.category).level}
                            </span>
                          </div>
                        )}
                      </td>
                      <td className="py-2 px-1 text-sm text-right font-mono text-slate-400 hidden sm:table-cell">
                        <div className="flex items-center justify-end gap-1">
                          <span>{fund ? formatPercent(fund.expectedReturn) : "—"}</span>
                          {fund?.isReturnFromApi && (
                            <span className="text-[8px] px-1 py-0.5 rounded bg-accent/10 text-accent font-semibold uppercase tracking-wider">
                              Live
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-2 px-1 text-sm text-right font-mono text-slate-200">
                        {formatCurrencyCompact(fp.threeYearValue)}
                      </td>
                      <td className="py-2 px-1 text-sm text-right font-mono text-slate-200">
                        {formatCurrencyCompact(fp.fiveYearValue)}
                      </td>
                      <td className="py-2 px-1 text-sm text-right font-mono text-slate-100">
                        {formatCurrencyCompact(fp.tenYearValue)}
                      </td>
                    </tr>
                  );
                })}

                {/* Totals row */}
                <tr className="border-t-2 border-glass-border font-semibold">
                  <td className="py-2 px-1 text-sm text-slate-200">TOTAL PORTFOLIO</td>
                  <td className="py-2 px-1 hidden sm:table-cell"></td>
                  <td className="py-2 px-1 text-sm text-right font-mono text-accent">
                    {formatCurrencyCompact(portfolioTotals.threeYear)}
                  </td>
                  <td className="py-2 px-1 text-sm text-right font-mono text-accent">
                    {formatCurrencyCompact(portfolioTotals.fiveYear)}
                  </td>
                  <td className="py-2 px-1 text-sm text-right font-mono text-accent">
                    {formatCurrencyCompact(portfolioTotals.tenYear)}
                  </td>
                </tr>

                {/* Invested row */}
                <tr>
                  <td className="py-1 px-1 text-xs text-slate-500">Invested</td>
                  <td className="py-1 px-1 hidden sm:table-cell"></td>
                  <td className="py-1 px-1 text-xs text-right font-mono text-slate-500">
                    {formatCurrencyCompact(portfolioTotals.investedThreeYear)}
                  </td>
                  <td className="py-1 px-1 text-xs text-right font-mono text-slate-500">
                    {formatCurrencyCompact(portfolioTotals.investedFiveYear)}
                  </td>
                  <td className="py-1 px-1 text-xs text-right font-mono text-slate-500">
                    {formatCurrencyCompact(portfolioTotals.investedTenYear)}
                  </td>
                </tr>

                {/* Gain row */}
                <tr>
                  <td className="py-1 px-1 text-xs text-slate-500">Gain</td>
                  <td className="py-1 px-1 hidden sm:table-cell"></td>
                  <td className="py-1 px-1 text-xs text-right font-mono text-emerald-400">
                    {formatCurrencyCompact(portfolioTotals.threeYear - portfolioTotals.investedThreeYear)}
                  </td>
                  <td className="py-1 px-1 text-xs text-right font-mono text-emerald-400">
                    {formatCurrencyCompact(portfolioTotals.fiveYear - portfolioTotals.investedFiveYear)}
                  </td>
                  <td className="py-1 px-1 text-xs text-right font-mono text-emerald-400">
                    {formatCurrencyCompact(portfolioTotals.tenYear - portfolioTotals.investedTenYear)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Bar chart */}
        <div className="lg:col-span-2 bg-glass-bg border border-glass-border rounded-xl p-4">
          <h3 className="text-xs text-slate-400 uppercase tracking-wider mb-2">
            Invested vs Estimated Value
          </h3>
          <ProjectionBarChart data={barData} />
        </div>
      </div>
    </>)}
    </SectionWrapper>
  );
}