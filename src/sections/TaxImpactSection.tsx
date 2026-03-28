import { useState } from "react";
import { SECTION_IDS } from "@/lib/constants";
import { SectionWrapper } from "@/components/layout/SectionWrapper";
import { usePortfolio } from "@/hooks/usePortfolio";
import {
  formatCurrencyCompact,
  formatDecimalAsPercent,
  formatPercent,
} from "@/lib/formatters";
import { ChevronDown, ChevronUp, AlertTriangle } from "lucide-react";

export function TaxImpactSection() {
  const { state, ltcgResults, ltcgPerFundResults } = usePortfolio();

  const noData = state.monthlySip === 0 || state.funds.length === 0;
  const [showPerFund, setShowPerFund] = useState(false);

  return (
    <SectionWrapper
      id={SECTION_IDS.taxImpact}
      title="LTCG Tax Impact"
      description={`LTCG at ${state.ltcgTaxRate}% on equity gains above ₹${(state.ltcgExemptionPerYear / 1000).toFixed(0)}K per financial year.`}
    >
      {noData ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-sm text-slate-500">Set your monthly SIP and add funds to see LTCG tax impact.</p>
        </div>
      ) : (<>
      {/* Portfolio-level table — PRIMARY */}
      <div className="bg-glass-bg border border-glass-border rounded-xl p-4 mb-4">
        <h3 className="text-xs text-slate-400 uppercase tracking-wider mb-3">
          Portfolio-Level Tax Projection
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-glass-border text-xs text-slate-500 uppercase tracking-wider">
                <th className="py-2 px-2 font-medium">Horizon</th>
                <th className="py-2 px-2 font-medium text-right">Invested</th>
                <th className="py-2 px-2 font-medium text-right">Gross Value</th>
                <th className="py-2 px-2 font-medium text-right hidden sm:table-cell">Gross Gain</th>
                <th className="py-2 px-2 font-medium text-right hidden md:table-cell">Exempt</th>
                <th className="py-2 px-2 font-medium text-right hidden md:table-cell">Taxable</th>
                <th className="py-2 px-2 font-medium text-right">LTCG Tax</th>
                <th className="py-2 px-2 font-medium text-right">Net Corpus</th>
                <th className="py-2 px-2 font-medium text-right hidden lg:table-cell">Tax Drag</th>
                <th className="py-2 px-2 font-medium text-right hidden lg:table-cell">Net CAGR</th>
              </tr>
            </thead>
            <tbody>
              {ltcgResults.map((r) => (
                <tr
                  key={r.horizon}
                  className="border-b border-glass-border/50 hover:bg-white/[0.02]"
                >
                  <td className="py-2 px-2 text-sm font-medium text-slate-300">
                    {r.horizon} Years
                  </td>
                  <td className="py-2 px-2 text-sm text-right font-mono text-slate-400">
                    {formatCurrencyCompact(r.totalInvested)}
                  </td>
                  <td className="py-2 px-2 text-sm text-right font-mono text-slate-200">
                    {formatCurrencyCompact(r.grossValue)}
                  </td>
                  <td className="py-2 px-2 text-sm text-right font-mono text-emerald-400 hidden sm:table-cell">
                    {formatCurrencyCompact(r.grossGain)}
                  </td>
                  <td className="py-2 px-2 text-sm text-right font-mono text-slate-500 hidden md:table-cell">
                    {formatCurrencyCompact(r.exemptGain)}
                  </td>
                  <td className="py-2 px-2 text-sm text-right font-mono text-slate-400 hidden md:table-cell">
                    {formatCurrencyCompact(r.taxableGain)}
                  </td>
                  <td className="py-2 px-2 text-sm text-right font-mono text-rose-400">
                    {r.ltcgTax > 0 ? formatCurrencyCompact(r.ltcgTax) : "₹0"}
                  </td>
                  <td className="py-2 px-2 text-sm text-right font-mono text-slate-100 font-semibold">
                    {formatCurrencyCompact(r.netCorpus)}
                  </td>
                  <td className="py-2 px-2 text-sm text-right font-mono text-slate-500 hidden lg:table-cell">
                    {formatDecimalAsPercent(r.taxDrag)}
                  </td>
                  <td className="py-2 px-2 text-sm text-right font-mono text-slate-300 hidden lg:table-cell">
                    {formatDecimalAsPercent(r.netCAGR)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Per-fund toggle — ILLUSTRATIVE */}
      <div className="bg-glass-bg border border-glass-border rounded-xl overflow-hidden">
        <button
          onClick={() => setShowPerFund(!showPerFund)}
          className="w-full flex items-center justify-between p-4 text-left hover:bg-white/[0.02] transition-colors"
        >
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 uppercase tracking-wider font-medium">
              Per-Fund Breakdown (10Y)
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-warn/10 text-warn font-medium">
              Illustrative
            </span>
          </div>
          {showPerFund ? (
            <ChevronUp size={16} className="text-slate-500" />
          ) : (
            <ChevronDown size={16} className="text-slate-500" />
          )}
        </button>

        {showPerFund && (
          <div className="px-4 pb-4">
            {/* Disclaimer */}
            <div className="flex items-start gap-2 mb-4 p-3 rounded-lg bg-warn/5 border border-warn/10">
              <AlertTriangle size={14} className="text-warn mt-0.5 flex-shrink-0" />
              <p className="text-xs text-warn/80 leading-relaxed">
                This per-fund breakdown is an illustrative approximation. In reality,
                the ₹1.25L annual LTCG exemption applies at the investor level across
                all equity gains combined, not per fund. The portfolio-level calculation
                above is more accurate.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-glass-border text-xs text-slate-500 uppercase tracking-wider">
                    <th className="py-2 px-2 font-medium">Fund</th>
                    <th className="py-2 px-2 font-medium text-right">Alloc.</th>
                    <th className="py-2 px-2 font-medium text-right">Gross Value</th>
                    <th className="py-2 px-2 font-medium text-right hidden sm:table-cell">Gross Gain</th>
                    <th className="py-2 px-2 font-medium text-right">Est. Tax</th>
                    <th className="py-2 px-2 font-medium text-right">Net Value</th>
                  </tr>
                </thead>
                <tbody>
                  {ltcgPerFundResults.map((f) => (
                    <tr
                      key={f.fundId}
                      className="border-b border-glass-border/50 hover:bg-white/[0.02]"
                    >
                      <td className="py-1.5 px-2 text-sm text-slate-300 max-w-[180px] truncate">
                        {f.fundName}
                      </td>
                      <td className="py-1.5 px-2 text-sm text-right font-mono text-slate-500">
                        {formatPercent(f.allocation * 100, 0)}
                      </td>
                      <td className="py-1.5 px-2 text-sm text-right font-mono text-slate-200">
                        {formatCurrencyCompact(f.grossValue)}
                      </td>
                      <td className="py-1.5 px-2 text-sm text-right font-mono text-emerald-400 hidden sm:table-cell">
                        {formatCurrencyCompact(f.grossGain)}
                      </td>
                      <td className="py-1.5 px-2 text-sm text-right font-mono text-rose-400">
                        {f.estimatedTax > 0 ? formatCurrencyCompact(f.estimatedTax) : "₹0"}
                      </td>
                      <td className="py-1.5 px-2 text-sm text-right font-mono text-slate-100">
                        {formatCurrencyCompact(f.netValue)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </>)}
    </SectionWrapper>
  );
}
