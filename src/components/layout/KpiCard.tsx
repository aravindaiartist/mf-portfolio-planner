import { cn } from "@/lib/utils";
import type { ReactNode } from "react";
import { HelpCircle } from "lucide-react";
import { useAnimatedNumber } from "@/hooks/useAnimatedNumber";

interface KpiCardProps {
  label: string;
  value: string;
  /** If provided, the numeric portion is animated. Pass the raw number. */
  animateValue?: number;
  /** Format function to display the animated number */
  formatAnimated?: (n: number) => string;
  subtitle?: string;
  icon?: ReactNode;
  polarity?: "positive" | "negative" | "neutral";
  tooltip?: string;
}

export function KpiCard({
  label,
  value,
  animateValue,
  formatAnimated,
  subtitle,
  icon,
  polarity = "neutral",
  tooltip,
}: KpiCardProps) {
  const animated = useAnimatedNumber(animateValue ?? 0);

  const borderColor = {
    positive: "from-emerald-500/60 to-teal-500/60",
    negative: "from-rose-500/60 to-rose-400/60",
    neutral: "from-slate-500/40 to-slate-400/40",
  }[polarity];

  const displayValue =
    animateValue !== undefined && formatAnimated
      ? formatAnimated(animated)
      : value;

  return (
    <div className="relative bg-glass-bg border border-glass-border rounded-xl p-4 overflow-visible group hover:bg-glass-hover transition-colors duration-200">
      {/* Bottom gradient border */}
      <div
        className={cn(
          "absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r rounded-b-xl",
          borderColor
        )}
      />

      <div className="flex items-start justify-between mb-2">
        <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
          {label}
        </span>
        <div className="flex items-center gap-1">
          {tooltip && (
            <div className="relative group/tip">
              <HelpCircle size={13} className="text-slate-600 hover:text-slate-400 cursor-help transition-colors" />
              <div className="invisible group-hover/tip:visible opacity-0 group-hover/tip:opacity-100 transition-all duration-200 absolute z-50 right-0 top-6 w-64 p-3 rounded-lg bg-navy-900 border border-glass-border shadow-2xl shadow-black/60">
                <p className="text-xs text-slate-300 leading-relaxed">{tooltip}</p>
              </div>
            </div>
          )}
          {icon && (
            <span className="text-slate-500">{icon}</span>
          )}
        </div>
      </div>

      <div className="font-mono text-2xl font-semibold text-slate-100 tracking-tight">
        {displayValue}
      </div>

      {subtitle && (
        <p className="mt-1 text-xs text-slate-500">{subtitle}</p>
      )}
    </div>
  );
}
