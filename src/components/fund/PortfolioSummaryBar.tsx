import { cn } from "@/lib/utils";
import { formatPercent } from "@/lib/formatters";
import type { ValidationResult } from "@/lib/validators";
import { AlertTriangle, CheckCircle2 } from "lucide-react";

interface PortfolioSummaryBarProps {
  coreAllocation: number;
  satelliteAllocation: number;
  validation: ValidationResult;
}

export function PortfolioSummaryBar({
  coreAllocation,
  satelliteAllocation,
  validation,
}: PortfolioSummaryBarProps) {
  const total = coreAllocation + satelliteAllocation;
  const isValid = validation.valid;

  return (
    <div className="bg-glass-bg border border-glass-border rounded-xl p-4">
      {/* Split bar */}
      <div className="flex items-center gap-3 mb-3">
        <span className="text-xs text-slate-400 w-16">Core</span>
        <div className="flex-1 h-2 rounded-full bg-navy-800 overflow-hidden">
          <div className="flex h-full">
            <div
              className="bg-gradient-to-r from-accent to-accent-light transition-all duration-300"
              style={{ width: `${Math.min(coreAllocation, 100)}%` }}
            />
            <div
              className="bg-sky-500/60 transition-all duration-300"
              style={{ width: `${Math.min(satelliteAllocation, 100)}%` }}
            />
          </div>
        </div>
        <span className="text-xs text-slate-400 w-16 text-right">Satellite</span>
      </div>

      {/* Numbers */}
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-accent" />
            <span className="text-slate-300">Core {formatPercent(coreAllocation, 0)}</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-sky-500/60" />
            <span className="text-slate-300">Satellite {formatPercent(satelliteAllocation, 0)}</span>
          </span>
        </div>

        <div className={cn("flex items-center gap-1.5 text-xs font-medium", isValid ? "text-accent" : "text-warn")}>
          {isValid ? (
            <>
              <CheckCircle2 size={13} />
              <span>Total: {formatPercent(total, 0)}</span>
            </>
          ) : (
            <>
              <AlertTriangle size={13} />
              <span>{validation.warnings[0]}</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
