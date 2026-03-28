import { useState, useCallback } from "react";
import { SECTION_IDS } from "@/lib/constants";
import { SectionWrapper } from "@/components/layout/SectionWrapper";
import { KpiCard } from "@/components/layout/KpiCard";
import { usePortfolio } from "@/hooks/usePortfolio";
import {
  formatCurrency,
  formatCurrencyCompact,
  formatPercent,
} from "@/lib/formatters";
import { sanitizeNumber } from "@/lib/validators";
import { cn } from "@/lib/utils";
import {
  Scale,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  Minus,
} from "lucide-react";

// ── Helpers ───────────────────────────────────────────────

/** Colour classes for BUY / SELL / HOLD action badges */
function actionBadgeClass(action: "BUY" | "SELL" | "HOLD"): string {
  switch (action) {
    case "BUY":
      return "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30";
    case "SELL":
      return "bg-rose-500/15 text-rose-400 border border-rose-500/30";
    case "HOLD":
    default:
      return "bg-slate-500/15 text-slate-400 border border-slate-500/30";
  }
}

/** Colour classes for the drift bar fill */
function driftBarClass(action: "BUY" | "SELL" | "HOLD"): string {
  switch (action) {
    case "BUY":
      return "bg-emerald-500";
    case "SELL":
      return "bg-rose-500";
    case "HOLD":
    default:
      return "bg-slate-500";
  }
}

/** Health badge colour — returns the KpiCard polarity literal */
function healthClass(
  health: "Healthy" | "Needs Attention" | "Critical"
): "positive" | "negative" | "neutral" {
  switch (health) {
    case "Healthy":
      return "positive";
    case "Needs Attention":
      return "neutral";
    case "Critical":
      return "negative";
  }
}

/** Health icon */
function HealthIcon({
  health,
}: {
  health: "Healthy" | "Needs Attention" | "Critical";
}) {
  if (health === "Healthy")
    return <CheckCircle2 size={15} className="text-emerald-400" />;
  if (health === "Critical")
    return <AlertTriangle size={15} className="text-rose-400" />;
  return <AlertTriangle size={15} className="text-amber-400" />;
}

// ── Component ─────────────────────────────────────────────

export function RebalancingSection() {
  const { state, dispatch, rebalanceFundRows, rebalanceSnapshot } =
    usePortfolio();

  // Local inline-edit state — tracks which fund is being edited and the raw
  // string value while typing. Committed on blur or Enter.
  const [editingFundId, setEditingFundId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>("");

  const startEdit = useCallback((fundId: string, currentValue: number) => {
    setEditingFundId(fundId);
    setEditValue(currentValue > 0 ? String(currentValue) : "");
  }, []);

  const commitEdit = useCallback(
    (fundId: string) => {
      const parsed = parseFloat(editValue);
      const safe = sanitizeNumber(parsed, 0);
      dispatch({
        type: "SET_REBALANCE_ENTRY",
        fundId,
        value: Math.max(0, safe),
      });
      setEditingFundId(null);
    },
    [editValue, dispatch]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent, fundId: string) => {
      if (e.key === "Enter") commitEdit(fundId);
      if (e.key === "Escape") setEditingFundId(null);
    },
    [commitEdit]
  );

  // Whether any current values have been entered at all
  const hasAnyValues = rebalanceFundRows.some((r) => r.currentValue > 0);

  const { totalValue, fundsNeedingRebalance, maxDriftPct, portfolioHealth } =
    rebalanceSnapshot;

  // ── Render ──────────────────────────────────────────────

  return (
    <SectionWrapper
      id={SECTION_IDS.rebalancing}
      title="Rebalancing Alerts"
      description="Enter current fund values to detect allocation drift and get BUY / SELL / HOLD signals."
    >
      {/* ── Snapshot KPI cards ─────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        <KpiCard
          label="Total Portfolio Value"
          value={
            hasAnyValues ? formatCurrencyCompact(totalValue) : "—"
          }
          subtitle={
            hasAnyValues
              ? `${state.funds.length} fund${state.funds.length !== 1 ? "s" : ""} tracked`
              : "Enter current values below"
          }
          icon={<Scale size={15} />}
          polarity="neutral"
        />
        <KpiCard
          label="Funds Needing Rebalance"
          value={hasAnyValues ? String(fundsNeedingRebalance) : "—"}
          subtitle={
            hasAnyValues
              ? fundsNeedingRebalance === 0
                ? "All funds within ±5%"
                : `of ${state.funds.length} total`
              : undefined
          }
          icon={
            fundsNeedingRebalance > 0 ? (
              <TrendingUp size={15} />
            ) : (
              <Minus size={15} />
            )
          }
          polarity={
            !hasAnyValues
              ? "neutral"
              : fundsNeedingRebalance === 0
              ? "positive"
              : "negative"
          }
        />
        <KpiCard
          label="Max Drift"
          value={hasAnyValues ? formatPercent(maxDriftPct, 1) : "—"}
          subtitle={hasAnyValues ? "Highest |drift| across funds" : undefined}
          icon={
            maxDriftPct > 10 ? (
              <TrendingDown size={15} />
            ) : (
              <TrendingUp size={15} />
            )
          }
          polarity={
            !hasAnyValues
              ? "neutral"
              : maxDriftPct < 5
              ? "positive"
              : maxDriftPct <= 10
              ? "neutral"
              : "negative"
          }
        />
        <KpiCard
          label="Portfolio Health"
          value={hasAnyValues ? portfolioHealth : "—"}
          subtitle={
            hasAnyValues ? `Drift threshold: ±5%` : "Enter values to assess"
          }
          icon={
            hasAnyValues ? (
              <HealthIcon health={portfolioHealth} />
            ) : (
              <Scale size={15} />
            )
          }
          polarity={
            hasAnyValues ? healthClass(portfolioHealth) : "neutral"
          }
        />
      </div>

      {/* ── Fund-level tracker table ───────────────────── */}
      <div className="bg-glass-bg border border-glass-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-glass-border bg-white/[0.02]">
                <th className="py-3 px-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Fund
                </th>
                <th className="py-3 px-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider hidden md:table-cell">
                  Bucket
                </th>
                <th className="py-3 px-3 text-right text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Current Value (₹)
                </th>
                <th className="py-3 px-3 text-right text-xs font-medium text-slate-400 uppercase tracking-wider hidden sm:table-cell">
                  Target %
                </th>
                <th className="py-3 px-3 text-right text-xs font-medium text-slate-400 uppercase tracking-wider hidden sm:table-cell">
                  Current %
                </th>
                <th className="py-3 px-3 text-right text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Drift %
                </th>
                <th className="py-3 px-3 text-center text-xs font-medium text-slate-400 uppercase tracking-wider hidden lg:table-cell">
                  Drift Bar
                </th>
                <th className="py-3 px-3 text-center text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Action
                </th>
                <th className="py-3 px-3 text-right text-xs font-medium text-slate-400 uppercase tracking-wider hidden md:table-cell">
                  To Rebalance (₹)
                </th>
                <th className="py-3 px-3 text-right text-xs font-medium text-slate-400 uppercase tracking-wider hidden xl:table-cell">
                  Units
                </th>
                <th className="py-3 px-3 text-right text-xs font-medium text-slate-400 uppercase tracking-wider hidden xl:table-cell">
                  Live NAV
                </th>
              </tr>
            </thead>
            <tbody>
              {rebalanceFundRows.map((row) => {
                const isEditing = editingFundId === row.fundId;
                // Cap drift bar at ±20% for visual clarity
                const barWidthPct = Math.min(
                  Math.abs(row.driftPct) / 20,
                  1
                ) * 100;

                return (
                  <tr
                    key={row.fundId}
                    className="border-b border-glass-border/50 hover:bg-white/[0.02] transition-colors"
                  >
                    {/* Fund Name */}
                    <td className="py-3 px-3 max-w-[180px]">
                      <span
                        className="text-slate-200 font-medium text-sm leading-tight line-clamp-2"
                        title={row.fundName}
                      >
                        {row.fundName}
                      </span>
                    </td>

                    {/* Bucket */}
                    <td className="py-3 px-3 hidden md:table-cell">
                      <span
                        className={cn(
                          "text-xs px-2 py-0.5 rounded-full font-medium",
                          row.bucket === "Core"
                            ? "bg-accent/10 text-accent"
                            : "bg-sky-500/10 text-sky-400"
                        )}
                      >
                        {row.bucket}
                      </span>
                    </td>

                    {/* Current Value — inline editable */}
                    <td className="py-3 px-3 text-right w-36">
                      {isEditing ? (
                        <input
                          autoFocus
                          type="number"
                          min="0"
                          step="1000"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onBlur={() => commitEdit(row.fundId)}
                          onKeyDown={(e) => handleKeyDown(e, row.fundId)}
                          className="w-full bg-navy-800 border border-accent/40 rounded px-2 py-1 text-sm text-slate-100 font-mono outline-none focus:border-accent text-right"
                          placeholder="0"
                        />
                      ) : (
                        <button
                          onClick={() =>
                            startEdit(row.fundId, row.currentValue)
                          }
                          className={cn(
                            "w-full text-right font-mono text-sm px-2 py-1 rounded hover:bg-white/5 transition-colors cursor-pointer",
                            row.currentValue > 0
                              ? "text-slate-200 hover:text-accent"
                              : "text-slate-600 hover:text-slate-400"
                          )}
                          title="Click to enter current value"
                        >
                          {row.currentValue > 0
                            ? formatCurrency(row.currentValue)
                            : "Click to enter"}
                        </button>
                      )}
                    </td>

                    {/* Target % */}
                    <td className="py-3 px-3 text-right font-mono text-slate-300 text-sm hidden sm:table-cell">
                      {formatPercent(row.targetPct, 1)}
                    </td>

                    {/* Current % */}
                    <td className="py-3 px-3 text-right font-mono text-sm hidden sm:table-cell">
                      <span
                        className={
                          row.currentValue > 0
                            ? "text-slate-200"
                            : "text-slate-600"
                        }
                      >
                        {row.currentValue > 0
                          ? formatPercent(row.currentPct, 1)
                          : "—"}
                      </span>
                    </td>

                    {/* Drift % */}
                    <td className="py-3 px-3 text-right font-mono text-sm">
                      {row.currentValue > 0 ? (
                        <span
                          className={cn(
                            "font-semibold",
                            row.action === "BUY"
                              ? "text-emerald-400"
                              : row.action === "SELL"
                              ? "text-rose-400"
                              : "text-slate-400"
                          )}
                        >
                          {row.driftPct > 0 ? "+" : ""}
                          {formatPercent(row.driftPct, 1)}
                        </span>
                      ) : (
                        <span className="text-slate-600">—</span>
                      )}
                    </td>

                    {/* Drift Bar */}
                    <td className="py-3 px-3 hidden lg:table-cell w-28">
                      {row.currentValue > 0 ? (
                        <div className="flex items-center gap-1">
                          {/* Left side (negative drift = underweight = BUY) */}
                          <div className="w-12 flex justify-end">
                            {row.driftPct < 0 && (
                              <div
                                className={cn(
                                  "h-2 rounded-l",
                                  driftBarClass(row.action)
                                )}
                                style={{ width: `${barWidthPct}%`, minWidth: 2 }}
                              />
                            )}
                          </div>
                          {/* Centre tick */}
                          <div className="w-px h-3 bg-slate-600 flex-shrink-0" />
                          {/* Right side (positive drift = overweight = SELL) */}
                          <div className="w-12">
                            {row.driftPct > 0 && (
                              <div
                                className={cn(
                                  "h-2 rounded-r",
                                  driftBarClass(row.action)
                                )}
                                style={{ width: `${barWidthPct}%`, minWidth: 2 }}
                              />
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center">
                          <div className="w-px h-3 bg-slate-700" />
                        </div>
                      )}
                    </td>

                    {/* Action badge */}
                    <td className="py-3 px-3 text-center">
                      {row.currentValue > 0 ? (
                        <span
                          className={cn(
                            "inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded uppercase tracking-wider",
                            actionBadgeClass(row.action)
                          )}
                        >
                          {row.action === "BUY" && (
                            <TrendingUp size={10} />
                          )}
                          {row.action === "SELL" && (
                            <TrendingDown size={10} />
                          )}
                          {row.action === "HOLD" && <Minus size={10} />}
                          {row.action}
                        </span>
                      ) : (
                        <span className="text-slate-600 text-xs">—</span>
                      )}
                    </td>

                    {/* Amount to Rebalance */}
                    <td className="py-3 px-3 text-right font-mono text-sm hidden md:table-cell">
                      {row.currentValue > 0 && row.action !== "HOLD" ? (
                        <span
                          className={
                            row.action === "BUY"
                              ? "text-emerald-400"
                              : "text-rose-400"
                          }
                        >
                          {formatCurrency(row.rebalanceAmount)}
                        </span>
                      ) : (
                        <span className="text-slate-600">—</span>
                      )}
                    </td>

                    {/* Implied Units */}
                    <td className="py-3 px-3 text-right font-mono text-sm hidden xl:table-cell">
                      {row.impliedUnits !== null ? (
                        <span className="text-slate-300">
                          {row.impliedUnits.toLocaleString("en-IN", {
                            maximumFractionDigits: 3,
                          })}
                        </span>
                      ) : (
                        <span className="text-slate-600">—</span>
                      )}
                    </td>

                    {/* Live NAV */}
                    <td className="py-3 px-3 text-right font-mono text-sm hidden xl:table-cell">
                      {row.latestNav !== null ? (
                        <span className="text-slate-300">
                          ₹{row.latestNav.toFixed(2)}
                        </span>
                      ) : (
                        <span className="text-slate-600">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Empty-state hint ──────────────────────────── */}
      {!hasAnyValues && (
        <p className="mt-4 text-xs text-slate-500 text-center">
          Click any value in the <span className="text-slate-400 font-medium">Current Value (₹)</span> column to enter your fund's current market value.
          Drift and signals will compute automatically.
        </p>
      )}

      {/* ── Methodology note ─────────────────────────── */}
      {hasAnyValues && (
        <div className="mt-4 bg-glass-bg border border-glass-border rounded-lg px-4 py-3 text-xs text-slate-500">
          <span className="text-slate-400 font-medium">Methodology: </span>
          Drift = Current % − Target %. Action signals: drift within ±5% → HOLD;
          overweight (&gt;+5%) → SELL; underweight (&lt;−5%) → BUY.
          Rebalance amount = |drift| × total portfolio value.
          Units = Current Value ÷ Live NAV (shown only when NAV is available).
        </div>
      )}
    </SectionWrapper>
  );
}
