import { useState, useCallback } from "react";
import type { Fund, FundBucket, FundStyle } from "@/lib/types";
import { formatCurrency, formatPercent, toPercent } from "@/lib/formatters";
import { validateFundAllocation, validateExpectedReturn } from "@/lib/validators";
import { getRiskLevel, getCategoryColor, getCategoryAvgCagr } from "@/lib/calc/riskLevel";
import { Trash2, Loader2, Pencil, ExternalLink, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

interface FundRowEditorProps {
  fund: Fund;
  sipAmount: number;
  monthlySip: number; // Total monthly SIP for recalculating allocation
  onUpdate: (fund: Fund) => void;
  onRemove: (fundId: string) => void;
 }

const BUCKET_OPTIONS: FundBucket[] = ["Core", "Satellite"];
const STYLE_OPTIONS: FundStyle[] = ["Growth", "Value", "Momentum", "Blend / Market Beta"];

export function FundRowEditor({ fund, sipAmount, monthlySip, onUpdate, onRemove }: FundRowEditorProps) {
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  const allocWarning = validateFundAllocation(fund.allocation);
  const returnWarning = validateExpectedReturn(fund.expectedReturn);
  const risk = getRiskLevel(fund.category);
  const catColor = getCategoryColor(fund.category);

  // Check if this fund has a manual SIP override
  const hasManualSip = fund.sipOverride != null;

  const startEdit = useCallback((field: string, currentValue: string | number) => {
    setEditingField(field);
    setEditValue(String(currentValue));
  }, []);

  const commitEdit = useCallback((field: string) => {
    const num = parseFloat(editValue);
    if (field === "allocation" && isFinite(num)) {
      onUpdate({ ...fund, allocation: Math.max(0, Math.min(100, num)), sipOverride: null });
    } else if (field === "expectedReturn" && isFinite(num)) {
      onUpdate({ ...fund, expectedReturn: Math.max(0, num), isReturnFromApi: false });
    } else if (field === "sipAmount" && isFinite(num) && num >= 0) {
      // When user edits SIP amount, recalculate allocation
      if (monthlySip > 0) {
        const newAllocation = (num / monthlySip) * 100;
        onUpdate({ 
          ...fund, 
          sipOverride: num,
          allocation: Math.round(newAllocation * 100) / 100,
        });
      }
    }
    setEditingField(null);
  }, [editValue, fund, onUpdate, monthlySip]);

  const resetSipToAuto = useCallback(() => {
    // Clear manual override, revert to auto-calculated
    onUpdate({ ...fund, sipOverride: null });
  }, [fund, onUpdate]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent, field: string) => {
    if (e.key === "Enter") commitEdit(field);
    if (e.key === "Escape") setEditingField(null);
  }, [commitEdit]);

  const renderEditableNumber = (
    field: string,
    displayValue: string,
    rawValue: number,
    hasWarning: boolean = false,
  ) => {
    if (editingField === field) {
      return (
        <input
          autoFocus
          type="number"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={() => commitEdit(field)}
          onKeyDown={(e) => handleKeyDown(e, field)}
          className="w-full bg-navy-800 border border-accent/40 rounded px-2 py-1 text-sm text-slate-100 font-mono outline-none focus:border-accent text-right"
          step="0.1"
        />
      );
    }
    return (
      <button
        onClick={() => startEdit(field, rawValue)}
        className={cn(
          "w-full text-right text-sm cursor-pointer hover:text-accent transition-colors px-2 py-1 rounded hover:bg-white/5 font-mono",
          hasWarning ? "text-warn" : "text-slate-200"
        )}
        title="Click to edit"
      >
        <span className="inline-flex items-center gap-1">
          {displayValue}
          <Pencil size={9} className="text-slate-600 opacity-0 group-hover/row:opacity-100 transition-opacity" />
        </span>
      </button>
    );
  };

  const renderCagrCell = () => {
    const categoryAvg = getCategoryAvgCagr(fund.category);
    
    if (fund.isFetchingCagr) {
      return (
        <div className="flex flex-col items-end gap-0.5 px-2 py-1">
          <div className="flex items-center gap-1">
            <Loader2 size={12} className="text-accent animate-spin" />
            <span className="text-xs text-slate-500">Fetching...</span>
          </div>
          {categoryAvg !== null && (
            <span className="text-[9px] text-slate-500" title="Category average 5Y CAGR">
              Cat. avg: {categoryAvg}%
            </span>
          )}
        </div>
      );
    }

    const displayValue = formatPercent(fund.expectedReturn, 1);

    if (editingField === "expectedReturn") {
      return (
        <input
          autoFocus
          type="number"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={() => commitEdit("expectedReturn")}
          onKeyDown={(e) => handleKeyDown(e, "expectedReturn")}
          className="w-full bg-navy-800 border border-accent/40 rounded px-2 py-1 text-sm text-slate-100 font-mono outline-none focus:border-accent text-right"
          step="0.1"
        />
      );
    }

    // Determine if fund is above/below category average
    const diff = categoryAvg !== null ? fund.expectedReturn - categoryAvg : null;
    const diffColor = diff !== null 
      ? (diff >= 2 ? "text-emerald-400" : diff <= -2 ? "text-rose-400" : "text-slate-500")
      : "text-slate-500";

    // Determine which CAGR period was used (for display)
    const getUsedPeriod = (): string | null => {
      if (!fund.isReturnFromApi) return null;
      // Check which fetched CAGR matches the expectedReturn (with tolerance)
      const tolerance = 0.5; // 0.5% tolerance for rounding
      if (fund.fetchedCagr5Y != null && Math.abs(toPercent(fund.fetchedCagr5Y) - fund.expectedReturn) < tolerance) return "5Y";
      if (fund.fetchedCagr3Y != null && Math.abs(toPercent(fund.fetchedCagr3Y) - fund.expectedReturn) < tolerance) return "3Y";
      if (fund.fetchedCagr10Y != null && Math.abs(toPercent(fund.fetchedCagr10Y) - fund.expectedReturn) < tolerance) return "10Y";
      if (fund.fetchedCagr1Y != null && Math.abs(toPercent(fund.fetchedCagr1Y) - fund.expectedReturn) < tolerance) return "1Y";
      return null;
    };
    const usedPeriod = getUsedPeriod();

    return (
      <div className="flex flex-col items-end gap-0.5">
        <div className="flex items-center gap-1">
          <button
            onClick={() => startEdit("expectedReturn", fund.expectedReturn)}
            className={cn(
              "text-sm cursor-pointer hover:text-accent transition-colors px-2 py-1 rounded hover:bg-white/5 text-right font-mono",
              !returnWarning.valid ? "text-warn" : "text-slate-200"
            )}
            title="Click to edit (overrides live data)"
          >
            <span className="inline-flex items-center gap-1">
              {displayValue}
              <Pencil size={9} className="text-slate-600 opacity-0 group-hover/row:opacity-100 transition-opacity" />
            </span>
          </button>
          {fund.isReturnFromApi && (
            <span
              className="text-[8px] px-1 py-0.5 rounded bg-accent/10 text-accent font-semibold uppercase tracking-wider flex-shrink-0"
              title={usedPeriod ? `Using ${usedPeriod} CAGR from live data` : "Live CAGR"}
            >
              {usedPeriod || "Live"}
            </span>
          )}
        </div>
        {categoryAvg !== null && (
          <span 
            className={cn("text-[9px] px-2", diffColor)} 
            title={`Category average 5Y CAGR: ${categoryAvg}%`}
          >
            Cat: {categoryAvg}%
            {diff !== null && diff !== 0 && (
              <span className="ml-0.5">
                ({diff > 0 ? "+" : ""}{diff.toFixed(1)}%)
              </span>
            )}
          </span>
        )}
      </div>
    );
  };

  return (
    <tr className="border-b border-glass-border/50 hover:bg-white/[0.02] transition-colors group/row">
      {/* Fund Name — read-only display with category + risk badges */}
      <td className="py-2 px-1 max-w-[280px]">
        <div className="flex flex-col gap-1">
          <span className="text-sm text-slate-200 px-2 py-1 truncate" title={fund.name}>
            {fund.name}
          </span>
          <div className="flex items-center gap-1.5 px-2">
            <span className={cn("text-[9px] px-1.5 py-0.5 rounded font-medium", catColor.text, catColor.bg)}>
              {fund.category}
            </span>
            <span
              className={cn("text-[9px] px-1.5 py-0.5 rounded font-medium", risk.color, risk.bgColor)}
              title={risk.description}
            >
              {risk.level} Risk
            </span>
            {fund.schemeCode && (
              <a
                href={"https://mf-analysis-platform.vercel.app/"}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[9px] px-1.5 py-0.5 rounded font-medium bg-accent/10 text-accent hover:bg-accent/20 transition-colors inline-flex items-center gap-0.5"
                title={"Analyze " + fund.name + " on MF Analysis Platform"}
              >
                Analyze <ExternalLink size={8} />
              </a>
            )}
          </div>
        </div>
      </td>

      {/* Bucket dropdown */}
      <td className="py-2 px-1">
        <select
          value={fund.bucket}
          onChange={(e) =>
            onUpdate({ ...fund, bucket: e.target.value as FundBucket })
          }
          className="bg-transparent border border-glass-border rounded px-2 py-1 text-xs text-slate-300 outline-none focus:border-accent cursor-pointer"
        >
          {BUCKET_OPTIONS.map((b) => (
            <option key={b} value={b} className="bg-navy-800">
              {b}
            </option>
          ))}
        </select>
      </td>

      {/* Style dropdown */}
      <td className="py-2 px-1 hidden lg:table-cell">
        <select
          value={fund.style}
          onChange={(e) =>
            onUpdate({ ...fund, style: e.target.value as FundStyle })
          }
          className="bg-transparent border border-glass-border rounded px-2 py-1 text-xs text-slate-300 outline-none focus:border-accent cursor-pointer"
        >
          {STYLE_OPTIONS.map((s) => (
            <option key={s} value={s} className="bg-navy-800">
              {s}
            </option>
          ))}
        </select>
      </td>

      {/* Allocation */}
      <td className="py-2 px-1 w-20">
        {renderEditableNumber("allocation", formatPercent(fund.allocation, 0), fund.allocation, !allocWarning.valid)}
      </td>

      {/* Expected Return — with live badge */}
      <td className="py-2 px-1 w-28 hidden sm:table-cell">
        {renderCagrCell()}
      </td>

      {/* Monthly SIP — editable with manual override indicator */}
      <td className="py-2 px-1 text-right">
        {editingField === "sipAmount" ? (
          <input
            autoFocus
            type="number"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={() => commitEdit("sipAmount")}
            onKeyDown={(e) => handleKeyDown(e, "sipAmount")}
            className="w-full bg-navy-800 border border-accent/40 rounded px-2 py-1 text-sm text-slate-100 font-mono outline-none focus:border-accent text-right"
            step="500"
            min="0"
          />
        ) : (
          <div className="flex flex-col items-end gap-0.5">
            <button
              onClick={() => startEdit("sipAmount", sipAmount)}
              className={cn(
                "text-sm font-mono cursor-pointer hover:text-accent transition-colors px-2 py-0.5 rounded hover:bg-white/5",
                hasManualSip ? "text-amber-400" : "text-slate-300"
              )}
              title={hasManualSip ? "Manual SIP (click to edit)" : "Click to set custom SIP amount"}
            >
              <span className="inline-flex items-center gap-1">
                {formatCurrency(sipAmount)}
                <Pencil size={9} className="text-slate-600 opacity-0 group-hover/row:opacity-100 transition-opacity" />
              </span>
            </button>
            <div className="flex items-center gap-1">
              <span className="text-[10px] font-mono text-slate-500">{formatPercent(fund.allocation, 1)}</span>
              {hasManualSip && (
                <button
                  onClick={resetSipToAuto}
                  className="text-[9px] px-1 py-0.5 rounded bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 transition-colors inline-flex items-center gap-0.5"
                  title="Reset to auto-calculated SIP"
                >
                  <RotateCcw size={8} /> Auto
                </button>
              )}
            </div>
          </div>
        )}
      </td>

      {/* Remove */}
      <td className="py-2 px-1 text-center">
        <button
          onClick={() => onRemove(fund.id)}
          className="flex items-center gap-1 px-2 py-1 rounded text-xs font-medium text-slate-500 hover:text-rose-400 hover:bg-rose-400/10 transition-colors"
          title="Remove fund"
        >
          <Trash2 size={12} />
          <span className="hidden sm:inline">Remove</span>
        </button>
      </td>
    </tr>
  );
}
