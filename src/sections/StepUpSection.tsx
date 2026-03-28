import { SECTION_IDS } from "@/lib/constants";
import { SectionWrapper } from "@/components/layout/SectionWrapper";
import { WealthGrowthChart } from "@/components/charts/WealthGrowthChart";
import { usePortfolio } from "@/hooks/usePortfolio";
import {
  formatCurrency,
  formatCurrencyCompact,
} from "@/lib/formatters";

export function StepUpSection() {
  const { state, stepUpRows, flatVsStepUp, portfolioTotals } = usePortfolio();

  const noData = state.monthlySip === 0 || state.funds.length === 0;

  const lastStepUp = stepUpRows.length > 0 ? stepUpRows[stepUpRows.length - 1] : null;
  const flatInvested = portfolioTotals.investedTenYear;
  const flatValue = portfolioTotals.tenYear;
  const flatGain = flatValue - flatInvested;

  const stepUpInvested = lastStepUp?.totalInvested ?? 0;
  const stepUpValue = lastStepUp?.portfolioValue ?? 0;
  const stepUpGain = stepUpValue - stepUpInvested;

  return (
    <SectionWrapper
      id={SECTION_IDS.stepUp}
      title="Step-Up vs Flat SIP"
      description={`Annual ${state.stepUpRate}% step-up vs flat ₹${state.monthlySip.toLocaleString("en-IN")}/mo — 10 year comparison.`}
    >
      {noData ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-sm text-slate-500">Set your monthly SIP and add funds to see step-up comparison.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Year-by-year table */}
          <div className="bg-glass-bg border border-glass-border rounded-xl p-4">
            <h3 className="text-xs text-slate-400 uppercase tracking-wider mb-3">
              Year-by-Year Step-Up Projection
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-glass-border text-xs text-slate-500 uppercase tracking-wider">
                    <th className="py-2 px-1 font-medium">Yr</th>
                    <th className="py-2 px-1 font-medium text-right">SIP/mo</th>
                    <th className="py-2 px-1 font-medium text-right hidden sm:table-cell">Yearly</th>
                    <th className="py-2 px-1 font-medium text-right">Invested</th>
                    <th className="py-2 px-1 font-medium text-right">Value</th>
                  </tr>
                </thead>
                <tbody>
                  {stepUpRows.map((row) => (
                    <tr
                      key={row.year}
                      className="border-b border-glass-border/50 hover:bg-white/[0.02]"
                    >
                      <td className="py-1.5 px-1 text-sm font-mono text-slate-400">
                        {row.year}
                      </td>
                      <td className="py-1.5 px-1 text-sm text-right font-mono text-slate-300">
                        {formatCurrency(row.monthlySip)}
                      </td>
                      <td className="py-1.5 px-1 text-sm text-right font-mono text-slate-400 hidden sm:table-cell">
                        {formatCurrencyCompact(row.yearlyInvestment)}
                      </td>
                      <td className="py-1.5 px-1 text-sm text-right font-mono text-slate-400">
                        {formatCurrencyCompact(row.totalInvested)}
                      </td>
                      <td className="py-1.5 px-1 text-sm text-right font-mono text-slate-100">
                        {formatCurrencyCompact(row.portfolioValue)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 10-Year summary comparison */}
          <div className="bg-glass-bg border border-glass-border rounded-xl p-4">
            <h3 className="text-xs text-slate-400 uppercase tracking-wider mb-4">
              10-Year Summary
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-glass-border text-xs text-slate-500 uppercase tracking-wider">
                    <th className="py-2 px-1 font-medium"></th>
                    <th className="py-2 px-1 font-medium text-right">Flat SIP</th>
                    <th className="py-2 px-1 font-medium text-right">With Step-Up</th>
                    <th className="py-2 px-1 font-medium text-right">Extra</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-glass-border/50">
                    <td className="py-2 px-1 text-sm text-slate-400">Invested</td>
                    <td className="py-2 px-1 text-sm text-right font-mono text-slate-300">
                      {formatCurrencyCompact(flatInvested)}
                    </td>
                    <td className="py-2 px-1 text-sm text-right font-mono text-slate-300">
                      {formatCurrencyCompact(stepUpInvested)}
                    </td>
                    <td className="py-2 px-1 text-sm text-right font-mono text-sky-400">
                      {formatCurrencyCompact(stepUpInvested - flatInvested)}
                    </td>
                  </tr>
                  <tr className="border-b border-glass-border/50">
                    <td className="py-2 px-1 text-sm text-slate-400">Portfolio Value</td>
                    <td className="py-2 px-1 text-sm text-right font-mono text-slate-200">
                      {formatCurrencyCompact(flatValue)}
                    </td>
                    <td className="py-2 px-1 text-sm text-right font-mono text-slate-100">
                      {formatCurrencyCompact(stepUpValue)}
                    </td>
                    <td className="py-2 px-1 text-sm text-right font-mono text-accent">
                      {formatCurrencyCompact(stepUpValue - flatValue)}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 px-1 text-sm text-slate-400">Wealth Gain</td>
                    <td className="py-2 px-1 text-sm text-right font-mono text-emerald-400">
                      {formatCurrencyCompact(flatGain)}
                    </td>
                    <td className="py-2 px-1 text-sm text-right font-mono text-emerald-300">
                      {formatCurrencyCompact(stepUpGain)}
                    </td>
                    <td className="py-2 px-1 text-sm text-right font-mono text-accent">
                      {formatCurrencyCompact(stepUpGain - flatGain)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Chart inline */}
            <div className="mt-6">
              <h4 className="text-xs text-slate-500 mb-2">Growth Curve</h4>
              <WealthGrowthChart data={flatVsStepUp} />
            </div>
          </div>
        </div>
      )}
    </SectionWrapper>
  );
}