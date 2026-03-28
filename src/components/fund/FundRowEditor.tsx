import { useState, useCallback } from "react";
import type { Fund, FundBucket, FundStyle } from "@/lib/types";
import { formatCurrency, formatPercent, formatDecimalAsPercent } from "@/lib/formatters";
import { validateFundAllocation, validateExpectedReturn } from "@/lib/validators";
import { getRiskLevel, getCategoryColor } from "@/lib/calc/riskLevel";
import { Trash2, Loader2, Pencil, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

interface FundRowEditorProps {
  fund: Fund;
  sipAmount: number;
  onUpdate: (fund: Fund) => void;
  onRemove: (fundId: string) => void;
}

const BUCKET_OPTIONS: FundBucket[] = ["Core", "Satellite"];
const STYLE_OPTIONS: FundStyle[] = ["Growth", "Value", "Momentum", "Blend / Market Beta"];

export function FundRowEditor({ fund, sipAmount, onUpdate, onRemove }: FundRowEditorProps) {
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  const allocWarning = validateFundAllocation(fund.allocation);
  const returnWarning = validateExpectedReturn(fund.expectedReturn);
  const risk = getRiskLevel(fund.category);
  const catColor = getCategoryColor(fund.category);

  const startEdit = useCallback((field: string, currentValue: string | number) => {
    setEditingField(field);
    setEditValue(String(currentValue));
  }, []);

  const commitEdit = useCallback((field: string) => {
    const num = parseFloat(editValue);
    if (field === "allocation" && isFinite(num)) {
      onUpdate({ ...fund, allocation: Math.max(0, Math.min(100, num)) });
    } else if (field === "expectedReturn" && isFinite(num)) {
      onUpdate({ ...fund, expectedReturn: Math.max(0, num), isReturnFromApi: false });
    }
    setEditingField(null);
  }, [editValue, fund, onUpdate]);

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
    if (fund.isFetchingCagr) {
      return (
        <div className="flex items-center justify-end gap-1 px-2 py-1">
          <Loader2 size={12} className="text-accent animate-spin" />
          <span className="text-xs text-slate-500">Fetching...</span>
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

    return (
      <div className="flex items-center justify-end gap-1">
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
            title={fund.fetchedCagr3Y != null ? "Live 3Y CAGR: " + formatDecimalAsPercent(fund.fetchedCagr3Y) : "Live CAGR"}
          >
            Live
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

      {/* Monthly SIP — shows ₹ + % */}
      <td className="py-2 px-1 text-right">
        <div className="text-sm font-mono text-slate-300">{formatCurrency(sipAmount)}</div>
        <div className="text-[10px] font-mono text-slate-500">{formatPercent(fund.allocation, 0)}</div>
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
