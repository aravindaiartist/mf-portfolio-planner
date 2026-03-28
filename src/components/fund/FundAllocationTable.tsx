import { useState, useCallback } from "react";
import type { Fund } from "@/lib/types";
import { MAX_FUNDS } from "@/lib/constants";
import { toDecimal, formatCurrency, formatPercent } from "@/lib/formatters";
import { classifyFund } from "@/lib/calc/classifier";
import { validateFundCount } from "@/lib/validators";
import { FundRowEditor } from "./FundRowEditor";
import { FundSearchBox } from "./FundSearchBox";
import type { MfSearchResult } from "@/lib/mfapi";
import { useFetchCagr } from "@/hooks/useFetchCagr";
import { cn } from "@/lib/utils";
import { Plus, Search } from "lucide-react";

interface FundAllocationTableProps {
  funds: Fund[];
  monthlySip: number;
  onUpdate: (fund: Fund) => void;
  onRemove: (fundId: string) => void;
  onAdd: (fund: Fund) => void;
}

export function FundAllocationTable({
  funds,
  monthlySip,
  onUpdate,
  onRemove,
  onAdd,
}: FundAllocationTableProps) {
  const canAdd = validateFundCount(funds.length, MAX_FUNDS);
  const { fetchCagrForFund } = useFetchCagr();
  const [showSearch, setShowSearch] = useState(funds.length === 0);
  const [selectedPeriod, setSelectedPeriod] = useState("5");

  const totalAllocation = funds.reduce((s, f) => s + f.allocation, 0);
  const totalSip = funds.reduce((s, f) => s + Math.round(monthlySip * toDecimal(f.allocation)), 0);
  const allocationValid = Math.abs(totalAllocation - 100) < 0.01;

  const handleFundSelected = useCallback((result: MfSearchResult) => {
    if (!canAdd.valid) return;

    if (funds.some((f) => f.schemeCode === result.schemeCode)) {
      alert("This fund is already in your portfolio.");
      return;
    }

    const displayName = result.schemeName
      .replace(/\s*-\s*Direct Plan\s*/i, " ")
      .replace(/\s*-\s*Growth\s*(Option)?\s*/i, " ")
      .replace(/\s*-\s*Cumulative\s*(Option)?\s*/i, " ")
      .replace(/\s+/g, " ")
      .trim();

    const classification = classifyFund(result.schemeName);

    const newFund: Fund = {
      id: crypto.randomUUID(),
      schemeCode: result.schemeCode,
      name: displayName,
      bucket: classification.bucket,
      style: classification.style,
      category: classification.category,
      allocation: 0,
      expectedReturn: 12,
    };
    onAdd(newFund);
    setShowSearch(false);

    if (result.schemeCode) {
      // Pass selected period so the right CAGR is used as expectedReturn
      setTimeout(() => fetchCagrForFund(newFund, selectedPeriod), 100);
    }
  }, [canAdd.valid, funds, onAdd, fetchCagrForFund, selectedPeriod]);

  return (
    <div>
      {/* Header with Add Fund button */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs text-slate-400 uppercase tracking-wider">
          Fund Allocation ({funds.length} fund{funds.length !== 1 ? "s" : ""})
        </h3>
        {canAdd.valid && (
          <button
            onClick={() => setShowSearch(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-accent text-navy-950 text-sm font-semibold hover:bg-accent/90 transition-colors shadow-lg shadow-accent/20"
          >
            <Plus size={16} strokeWidth={2.5} />
            Add Fund
          </button>
        )}
      </div>

      {/* Search panel */}
      {showSearch && (
        <div className="mb-4 p-4 bg-accent/5 border border-accent/20 rounded-xl">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Search size={14} className="text-accent" />
              <span className="text-sm text-slate-200 font-medium">Search and add a fund</span>
            </div>
            {funds.length > 0 && (
              <button
                onClick={() => setShowSearch(false)}
                className="text-xs text-slate-500 hover:text-slate-300 transition-colors px-2 py-1 rounded hover:bg-white/5"
              >
                Cancel
              </button>
            )}
          </div>
          <FundSearchBox
            onSelect={handleFundSelected}
            onPeriodChange={setSelectedPeriod}
            selectedPeriod={selectedPeriod}
          />
        </div>
      )}

      {/* Table */}
      {funds.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-glass-border text-xs text-slate-500 uppercase tracking-wider">
                <th className="py-2 px-1 font-medium">Fund Name</th>
                <th className="py-2 px-1 font-medium w-24">Bucket</th>
                <th className="py-2 px-1 font-medium w-32 hidden lg:table-cell">Style</th>
                <th className="py-2 px-1 font-medium w-20 text-right">Alloc.</th>
                <th className="py-2 px-1 font-medium w-20 text-right hidden sm:table-cell">CAGR</th>
                <th className="py-2 px-1 font-medium w-24 text-right">SIP/mo</th>
                <th className="py-2 px-1 w-20 text-center">Remove</th>
              </tr>
            </thead>
            <tbody>
              {funds.map((fund) => (
                <FundRowEditor
                  key={fund.id}
                  fund={fund}
                  sipAmount={Math.round(monthlySip * toDecimal(fund.allocation))}
                  onUpdate={onUpdate}
                  onRemove={onRemove}
                />
              ))}

              {/* Total row */}
              <tr className="border-t-2 border-accent/20 bg-white/[0.02]">
                <td className="py-2.5 px-1 text-sm font-semibold text-slate-200 pl-3">
                  {"Total (" + funds.length + " fund" + (funds.length !== 1 ? "s" : "") + ")"}
                </td>
                <td className="py-2.5 px-1"></td>
                <td className="py-2.5 px-1 hidden lg:table-cell"></td>
                <td className="py-2.5 px-1 text-right">
                  <span className={cn(
                    "text-sm font-mono font-semibold",
                    allocationValid ? "text-accent" : "text-warn"
                  )}>
                    {formatPercent(totalAllocation, 1)}
                  </span>
                </td>
                <td className="py-2.5 px-1 hidden sm:table-cell"></td>
                <td className="py-2.5 px-1 text-right text-sm font-mono font-semibold text-accent">
                  {formatCurrency(totalSip)}
                </td>
                <td className="py-2.5 px-1"></td>
              </tr>
            </tbody>
          </table>
        </div>
      ) : !showSearch ? (
        <div className="flex flex-col items-center justify-center py-12 border border-dashed border-glass-border rounded-xl">
          <p className="text-sm text-slate-500 mb-3">No funds added yet</p>
          <button
            onClick={() => setShowSearch(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-accent text-navy-950 text-sm font-semibold hover:bg-accent/90 transition-colors"
          >
            <Plus size={16} strokeWidth={2.5} />
            Add Your First Fund
          </button>
        </div>
      ) : null}

      {!canAdd.valid && (
        <p className="mt-2 text-xs text-warn">{canAdd.warnings[0]}</p>
      )}
    </div>
  );
}
