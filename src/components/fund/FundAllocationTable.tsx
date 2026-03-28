import { useCallback } from "react";
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

    if (result.schemeCode) {
      setTimeout(() => fetchCagrForFund(newFund), 100);
    }
  }, [canAdd.valid, funds, onAdd, fetchCagrForFund]);

  return (
    <div>
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
              <th className="py-2 px-1 w-10"></th>
            </tr>
          </thead>
          <tbody>
            {funds.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-sm text-slate-500">
                  Search and add funds below to begin.
                </td>
              </tr>
            ) : (
              <>
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
              </>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 pt-3 border-t border-glass-border/50">
        <p className="text-xs text-slate-500 mb-2">
          <span className="text-slate-400 font-medium">Add or replace funds</span> — search by name to add a new fund to your portfolio
        </p>
        <FundSearchBox onSelect={handleFundSelected} />
      </div>
      {!canAdd.valid && (
        <p className="mt-1 text-xs text-warn">{canAdd.warnings[0]}</p>
      )}
    </div>
  );
}