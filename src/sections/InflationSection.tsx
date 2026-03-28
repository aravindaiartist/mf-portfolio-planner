import { useCallback, useState } from "react";
import { SECTION_IDS } from "@/lib/constants";
import { SectionWrapper } from "@/components/layout/SectionWrapper";
import { usePortfolio } from "@/hooks/usePortfolio";
import {
  formatCurrencyCompact,
  formatDecimalAsPercent,
} from "@/lib/formatters";
import { validateInflationRate, sanitizeNumber } from "@/lib/validators";
import { Lightbulb, Pencil } from "lucide-react";

export function InflationSection() {
  const { state, dispatch, inflationRows } = usePortfolio();

  const inflationValidation = validateInflationRate(state.inflationRate);
  const [editing, setEditing] = useState(false);
  const [tempVal, setTempVal] = useState(String(state.inflationRate));

  const commit = useCallback(() => {
    const val = sanitizeNumber(parseFloat(tempVal), 6);
    dispatch({ type: "SET_INFLATION_RATE", value: Math.max(0, val) });
    setEditing(false);
  }, [tempVal, dispatch]);

  const last = inflationRows.length > 0 ? inflationRows[inflationRows.length - 1] : null;

  return (
    <SectionWrapper
      id={SECTION_IDS.inflation}
      title="Inflation-Adjusted View"
      description="Real purchasing power of your projected corpus after inflation erosion."
    >
      {/* Inflation rate input */}
      <div className="flex items-center gap-3 mb-4">
        <span className="text-sm text-slate-400">Assumed Inflation Rate:</span>
        {editing ? (
          <div className="flex items-center gap-1">
            <input
              autoFocus
              type="number"
              value={tempVal}
              onChange={(e) => setTempVal(e.target.value)}
              onBlur={commit}
              onKeyDown={(e) => {
                if (e.key === "Enter") commit();
                if (e.key === "Escape") setEditing(false);
              }}
              className="w-16 bg-navy-800 border border-accent/40 rounded px-2 py-1 text-sm font-mono text-slate-100 outline-none text-right"
              step="0.5"
            />
            <span className="text-sm text-slate-400">%</span>
          </div>
        ) : (
          <button
            onClick={() => { setTempVal(String(state.inflationRate)); setEditing(true); }}
            className="text-sm font-mono font-semibold text-slate-100 hover:text-accent transition-colors cursor-pointer px-2 py-1 rounded hover:bg-white/5 flex items-center gap-1"
          >
            {state.inflationRate}%
            <Pencil size={10} className="text-slate-500" />
          </button>
        )}
        {!inflationValidation.valid && (
          <span className="text-xs text-warn">{inflationValidation.warnings[0]}</span>
        )}
      </div>

      {/* Table */}
      <div className="bg-glass-bg border border-glass-border rounded-xl p-4 mb-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-glass-border text-xs text-slate-500 uppercase tracking-wider">
                <th className="py-2 px-2 font-medium">Year</th>
                <th className="py-2 px-2 font-medium text-right">Nominal Corpus</th>
                <th className="py-2 px-2 font-medium text-right hidden sm:table-cell">Invested</th>
                <th className="py-2 px-2 font-medium text-right hidden md:table-cell">Discount</th>
                <th className="py-2 px-2 font-medium text-right">Real Value (Today's ₹)</th>
                <th className="py-2 px-2 font-medium text-right hidden sm:table-cell">PP Loss</th>
                <th className="py-2 px-2 font-medium text-right hidden lg:table-cell">Real CAGR</th>
                <th className="py-2 px-2 font-medium text-right hidden lg:table-cell">Erosion</th>
              </tr>
            </thead>
            <tbody>
              {inflationRows.map((row) => (
                <tr
                  key={row.year}
                  className="border-b border-glass-border/50 hover:bg-white/[0.02]"
                >
                  <td className="py-1.5 px-2 text-sm font-mono text-slate-400">
                    {row.year}
                  </td>
                  <td className="py-1.5 px-2 text-sm text-right font-mono text-slate-200">
                    {formatCurrencyCompact(row.nominalCorpus)}
                  </td>
                  <td className="py-1.5 px-2 text-sm text-right font-mono text-slate-500 hidden sm:table-cell">
                    {formatCurrencyCompact(row.totalInvested)}
                  </td>
                  <td className="py-1.5 px-2 text-sm text-right font-mono text-slate-500 hidden md:table-cell">
                    {row.discountFactor.toFixed(4)}
                  </td>
                  <td className="py-1.5 px-2 text-sm text-right font-mono text-slate-100 font-semibold">
                    {formatCurrencyCompact(row.realValue)}
                  </td>
                  <td className="py-1.5 px-2 text-sm text-right font-mono text-rose-400 hidden sm:table-cell">
                    {formatCurrencyCompact(row.purchasingPowerLoss)}
                  </td>
                  <td className="py-1.5 px-2 text-sm text-right font-mono text-slate-400 hidden lg:table-cell">
                    {formatDecimalAsPercent(row.realCAGR)}
                  </td>
                  <td className="py-1.5 px-2 text-sm text-right font-mono text-warn hidden lg:table-cell">
                    {formatDecimalAsPercent(row.inflationErosion)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Insight callout */}
      {last && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-accent/5 border border-accent/10">
          <Lightbulb size={18} className="text-accent mt-0.5 flex-shrink-0" />
          <div className="text-sm text-slate-300 leading-relaxed">
            <strong className="text-slate-100">Key Insight:</strong> At{" "}
            {state.inflationRate}% inflation, your{" "}
            {formatCurrencyCompact(last.nominalCorpus)} corpus in 10 years has the
            purchasing power of roughly{" "}
            <span className="font-mono font-semibold text-accent">
              {formatCurrencyCompact(last.realValue)}
            </span>{" "}
            in today's rupees — an erosion of{" "}
            <span className="font-mono text-warn">
              {formatDecimalAsPercent(last.inflationErosion)}
            </span>
            . Your real CAGR target should be at least 8% above inflation to
            meaningfully grow wealth.
          </div>
        </div>
      )}
    </SectionWrapper>
  );
}
