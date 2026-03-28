import { useState, useCallback } from "react";
import { SECTION_IDS } from "@/lib/constants";
import { SectionWrapper } from "@/components/layout/SectionWrapper";
import { KpiCard } from "@/components/layout/KpiCard";
import { AllocationDonut } from "@/components/charts/AllocationDonut";
import { WealthGrowthChart } from "@/components/charts/WealthGrowthChart";
import { usePortfolio } from "@/hooks/usePortfolio";
import {
  formatCurrency,
  formatCurrencyCompact,
  formatDecimalAsPercent,
} from "@/lib/formatters";
import { sanitizeNumber } from "@/lib/validators";
import {
  Wallet,
  TrendingUp,
  PiggyBank,
  BarChart3,
  Lightbulb,
  RotateCcw,
  Pencil,
} from "lucide-react";

export function DashboardSection() {
  const {
    state,
    dispatch,
    wtdAvgCagrDecimal,
    computedWtdAvgCagr,
    isUsingCagrOverride,
    portfolioTotals,
    flatVsStepUp,
    coreSatelliteSplit,
    stepUpRows,
    ltcgResults,
    inflationRows,
  } = usePortfolio();

  const tenYearStepUp = stepUpRows.length > 0 ? stepUpRows[stepUpRows.length - 1] : null;
  
  // When step-up is 0%, use flat SIP values for wealth gain calculation
  const tenYearGain = state.stepUpRate === 0
    ? portfolioTotals.tenYear - portfolioTotals.investedTenYear
    : (tenYearStepUp ? tenYearStepUp.portfolioValue - tenYearStepUp.totalInvested : 0);

  const taxDrag10Y = ltcgResults.find((r) => r.horizon === 10);
  const inflation10Y = inflationRows.length > 0 ? inflationRows[inflationRows.length - 1] : null;

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

  // Empty state check
  const isEmpty = state.funds.length === 0;

  return (
    <SectionWrapper
      id={SECTION_IDS.dashboard}
      title="Dashboard"
      description="Portfolio overview and key projections"
    >
      {isEmpty && (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mb-4">
            <Wallet size={28} className="text-accent" />
          </div>
          <h3 className="text-lg font-display font-semibold text-slate-200 mb-2">
            Welcome to your Investment Planner
          </h3>
          <p className="text-sm text-slate-400 max-w-md leading-relaxed mb-6">
            Start by scrolling down to the <span className="text-slate-200 font-medium">SIP Investment</span> section.
            Set your monthly SIP amount, add your funds, and watch your projections come alive.
          </p>
          <button
            onClick={() => {
              const el = document.getElementById("sip-investment");
              if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
            }}
            className="px-5 py-2.5 rounded-lg bg-accent/10 text-accent text-sm font-medium hover:bg-accent/20 transition-colors mb-8"
          >
            Get Started
          </button>

          {/* Placeholder dashboard preview */}
          <div className="w-full max-w-3xl">
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-4">
              Your dashboard will show
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
              {/* Placeholder KPI cards */}
              <div className="bg-glass-bg border border-glass-border rounded-xl p-4">
                <div className="text-xs text-slate-500 mb-1">Monthly SIP</div>
                <div className="text-lg font-mono text-slate-600">₹—</div>
              </div>
              <div className="bg-glass-bg border border-glass-border rounded-xl p-4">
                <div className="text-xs text-slate-500 mb-1">10Y Corpus</div>
                <div className="text-lg font-mono text-slate-600">₹— L</div>
              </div>
              <div className="bg-glass-bg border border-glass-border rounded-xl p-4">
                <div className="text-xs text-slate-500 mb-1">Wealth Gain</div>
                <div className="text-lg font-mono text-slate-600">₹— L</div>
              </div>
              <div className="bg-glass-bg border border-glass-border rounded-xl p-4">
                <div className="text-xs text-slate-500 mb-1">Avg CAGR</div>
                <div className="text-lg font-mono text-slate-600">—%</div>
              </div>
            </div>

            {/* Placeholder chart area */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-glass-bg border border-glass-border rounded-xl p-4 flex flex-col items-center justify-center h-32">
                <div className="w-16 h-16 rounded-full border-4 border-slate-700 border-t-accent/30 mb-2" />
                <span className="text-xs text-slate-600">Allocation Split</span>
              </div>
              <div className="md:col-span-2 bg-glass-bg border border-glass-border rounded-xl p-4 flex items-end justify-center gap-2 h-32">
                {[20, 35, 28, 45, 38, 52, 48, 60, 55, 70].map((h, i) => (
                  <div
                    key={i}
                    className="w-4 bg-slate-700/50 rounded-t"
                    style={{ height: `${h}%` }}
                  />
                ))}
              </div>
            </div>
            <p className="text-xs text-slate-600 mt-4">
              Real projections will appear once you add funds and set your SIP
            </p>
          </div>
        </div>
      )}

      {!isEmpty && (<>
      {/* KPI row — reordered: SIP | 10Y Flat Corpus/Invested | 10Y Gain | 10Y StepUp Corpus/Invested | Editable CAGR */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-8">

        {/* 1. Monthly SIP */}
        <KpiCard
          label="Monthly SIP"
          value={formatCurrency(state.monthlySip)}
          animateValue={state.monthlySip}
          formatAnimated={(n) => formatCurrency(Math.round(n))}
          icon={<Wallet size={15} />}
          polarity="neutral"
          tooltip="The total amount you invest every month across all your mutual funds. This is split across your funds based on the allocation percentages you set."
        />

        {/* 2. 10Y Corpus (Flat SIP) — per-fund projections summed */}
        <KpiCard
          label="10Y Corpus (Flat SIP)"
          value={formatCurrencyCompact(portfolioTotals.tenYear)}
          animateValue={portfolioTotals.tenYear}
          formatAnimated={(n) => formatCurrencyCompact(Math.round(n))}
          subtitle={`Invested: ${formatCurrencyCompact(portfolioTotals.investedTenYear)}`}
          icon={<BarChart3 size={15} />}
          polarity="positive"
          tooltip="Your estimated portfolio value after 10 years if you keep the same SIP amount every month (no annual increase). Each fund is projected at its own CAGR and then summed."
        />

        {/* 3. 10Y Wealth Gain */}
        <KpiCard
          label="10Y Wealth Gain"
          value={formatCurrencyCompact(tenYearGain)}
          animateValue={tenYearGain}
          formatAnimated={(n) => formatCurrencyCompact(Math.round(n))}
          icon={<TrendingUp size={15} />}
          polarity="positive"
          tooltip="The profit your investments earn — the difference between your total portfolio value and the total money you put in. This is your real wealth creation."
        />

        {/* 4. 10Y Corpus (Step-Up SIP) — only show when step-up > 0 */}
        {state.stepUpRate > 0 && (
          <KpiCard
            label="10Y Corpus (Step-Up)"
            value={tenYearStepUp ? formatCurrencyCompact(tenYearStepUp.portfolioValue) : "—"}
            animateValue={tenYearStepUp?.portfolioValue ?? 0}
            formatAnimated={(n) => formatCurrencyCompact(Math.round(n))}
            subtitle={tenYearStepUp ? `Invested: ${formatCurrencyCompact(tenYearStepUp.totalInvested)}` : undefined}
            icon={<PiggyBank size={15} />}
            polarity="positive"
            tooltip="Your estimated portfolio value after 10 years if you increase your SIP by the step-up % every year."
          />
        )}

        {/* 5. Editable CAGR */}
        <div className="relative bg-glass-bg border border-glass-border rounded-xl p-4 overflow-visible hover:bg-glass-hover transition-colors duration-200">
          <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-emerald-500/60 to-teal-500/60 rounded-b-xl" />

          <div className="flex items-start justify-between mb-2">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
              Wtd. Avg CAGR
            </span>
            <div className="relative group/tip">
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-600 hover:text-slate-400 cursor-help transition-colors">
                <circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/>
              </svg>
              <div className="invisible group-hover/tip:visible opacity-0 group-hover/tip:opacity-100 transition-all duration-200 absolute z-50 right-0 top-6 w-64 p-3 rounded-lg bg-navy-900 border border-glass-border shadow-2xl shadow-black/60">
                <p className="text-xs text-slate-300 leading-relaxed">
                  Weighted average annual return. Click the number to set a custom CAGR for what-if analysis. All projections will update. Click "Reset" to go back to the computed value.
                </p>
              </div>
            </div>
          </div>

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
                className="w-20 bg-navy-800 border border-accent/40 rounded px-2 py-1 text-xl font-mono text-slate-100 outline-none focus:border-accent"
                step="0.5"
                min="0"
                max="50"
              />
              <span className="text-xl text-slate-400">%</span>
            </div>
          ) : (
            <button
              onClick={startEditCagr}
              className="font-mono text-2xl font-semibold text-slate-100 tracking-tight hover:text-accent transition-colors cursor-pointer flex items-center gap-2"
              title="Click to set custom CAGR"
            >
              {formatDecimalAsPercent(wtdAvgCagrDecimal)}
              <Pencil size={13} className="text-slate-500" />
            </button>
          )}

          {isUsingCagrOverride ? (
            <div className="mt-1 flex items-center gap-2">
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-400/10 text-amber-400 font-medium">
                Custom
              </span>
              <span className="text-[10px] text-slate-500">
                (Computed: {formatDecimalAsPercent(computedWtdAvgCagr)})
              </span>
              <button
                onClick={resetCagr}
                className="flex items-center gap-0.5 text-[10px] text-slate-500 hover:text-accent transition-colors"
                title="Reset to computed value"
              >
                <RotateCcw size={9} />
                Reset
              </button>
            </div>
          ) : (
            <p className="mt-1 text-[10px] text-slate-600">Click to edit</p>
          )}
        </div>
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="bg-glass-bg border border-glass-border rounded-xl p-4">
          <h3 className="text-xs text-slate-400 uppercase tracking-wider mb-2">
            Allocation Split
          </h3>
          <AllocationDonut
            coreAllocation={coreSatelliteSplit.core}
            satelliteAllocation={coreSatelliteSplit.satellite}
          />
          <div className="flex justify-center gap-4 mt-2">
            <span className="flex items-center gap-1.5 text-xs text-slate-400">
              <span className="w-2 h-2 rounded-full bg-accent" />
              Core
            </span>
            <span className="flex items-center gap-1.5 text-xs text-slate-400">
              <span className="w-2 h-2 rounded-full bg-sky-500/60" />
              Satellite
            </span>
          </div>
        </div>

        <div className="lg:col-span-2 bg-glass-bg border border-glass-border rounded-xl p-4">
          <h3 className="text-xs text-slate-400 uppercase tracking-wider mb-2">
            10-Year Wealth Growth — Flat vs Step-Up
          </h3>
          <WealthGrowthChart data={flatVsStepUp} />
        </div>
      </div>

      {/* Plain English summary */}
      {tenYearStepUp && inflation10Y && taxDrag10Y && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-glass-bg border border-glass-border">
          <Lightbulb size={18} className="text-accent mt-0.5 flex-shrink-0" />
          <div className="text-sm text-slate-300 leading-relaxed">
            <strong className="text-slate-100">What this means for you:</strong>{" "}
            You're investing{" "}
            <span className="font-mono font-semibold text-slate-100">
              {formatCurrency(state.monthlySip)}
            </span>{" "}
            per month across {state.funds.length} funds
            {isUsingCagrOverride && " (using your custom CAGR of " + formatDecimalAsPercent(wtdAvgCagrDecimal) + ")"}. In 10 years with{" "}
            {state.stepUpRate > 0 ? `a ${state.stepUpRate}% annual step-up` : "no step-up"},{" "}
            your portfolio could grow to{" "}
            <span className="font-mono font-semibold text-accent">
              {formatCurrencyCompact(tenYearStepUp.portfolioValue)}
            </span>{" "}
            — that's{" "}
            <span className="font-mono font-semibold text-emerald-400">
              {formatCurrencyCompact(tenYearGain)}
            </span>{" "}
            of wealth gain on{" "}
            <span className="font-mono text-slate-400">
              {formatCurrencyCompact(tenYearStepUp.totalInvested)}
            </span>{" "}
            invested.
            {taxDrag10Y.ltcgTax > 0 && (
              <span>
                {" "}After LTCG tax of{" "}
                <span className="font-mono text-rose-400">
                  {formatCurrencyCompact(taxDrag10Y.ltcgTax)}
                </span>{" "}
                ({formatDecimalAsPercent(taxDrag10Y.taxDrag)} drag), your net corpus would be{" "}
                <span className="font-mono text-slate-100">
                  {formatCurrencyCompact(taxDrag10Y.netCorpus)}
                </span>.
              </span>
            )}
            {" "}However, at {state.inflationRate}% inflation, the real purchasing power
            of your corpus would be roughly{" "}
            <span className="font-mono font-semibold text-warn">
              {formatCurrencyCompact(inflation10Y.realValue)}
            </span>{" "}
            in today's rupees — an erosion of {formatDecimalAsPercent(inflation10Y.inflationErosion)}.
          </div>
        </div>
      )}
    </>)}
    </SectionWrapper>
  );
}