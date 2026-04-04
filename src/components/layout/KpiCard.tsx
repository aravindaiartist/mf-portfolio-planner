import { cn } from "@/lib/utils";
import type { ReactNode } from "react";
import { HelpCircle } from "lucide-react";
import { useAnimatedNumber } from "@/hooks/useAnimatedNumber";

interface KpiCardProps {
  label: string;
  value: string;
  animateValue?: number;
  formatAnimated?: (n: number) => string;
  subtitle?: string;
  icon?: ReactNode;
  polarity?: "positive" | "negative" | "neutral";
  tooltip?: string;
  gradient?: "green" | "purple" | "blue" | "orange" | "rose";
}

const GRADIENTS = {
  green: {
    bg: "from-emerald-500/10 to-teal-500/5",
    border: "border-emerald-500/20",
    bar: "from-emerald-400 to-teal-400",
    icon: "bg-emerald-500/15 text-emerald-400",
    value: "text-emerald-300",
    glow: "shadow-emerald-900/30",
  },
  purple: {
    bg: "from-violet-500/10 to-purple-500/5",
    border: "border-violet-500/20",
    bar: "from-violet-400 to-purple-400",
    icon: "bg-violet-500/15 text-violet-400",
    value: "text-violet-300",
    glow: "shadow-violet-900/30",
  },
  blue: {
    bg: "from-blue-500/10 to-indigo-500/5",
    border: "border-blue-500/20",
    bar: "from-blue-400 to-indigo-400",
    icon: "bg-blue-500/15 text-blue-400",
    value: "text-blue-300",
    glow: "shadow-blue-900/30",
  },
  orange: {
    bg: "from-amber-500/10 to-orange-500/5",
    border: "border-amber-500/20",
    bar: "from-amber-400 to-orange-400",
    icon: "bg-amber-500/15 text-amber-400",
    value: "text-amber-300",
    glow: "shadow-amber-900/30",
  },
  rose: {
    bg: "from-rose-500/10 to-pink-500/5",
    border: "border-rose-500/20",
    bar: "from-rose-400 to-pink-400",
    icon: "bg-rose-500/15 text-rose-400",
    value: "text-rose-300",
    glow: "shadow-rose-900/30",
  },
};

const POLARITY_GRADIENT: Record<string, keyof typeof GRADIENTS> = {
  positive: "green",
  negative: "rose",
  neutral: "blue",
};

export function KpiCard({
  label,
  value,
  animateValue,
  formatAnimated,
  subtitle,
  icon,
  polarity = "neutral",
  tooltip,
  gradient,
}: KpiCardProps) {
  const animated = useAnimatedNumber(animateValue ?? 0);
  const colorKey = gradient ?? POLARITY_GRADIENT[polarity];
  const colors = GRADIENTS[colorKey];

  const displayValue =
    animateValue !== undefined && formatAnimated
      ? formatAnimated(animated)
      : value;

  return (
    <div
      className={cn(
        "relative rounded-2xl p-4 overflow-hidden group transition-all duration-300",
        "bg-gradient-to-br border",
        "hover:-translate-y-0.5 hover:shadow-xl",
        colors.bg,
        colors.border,
        colors.glow,
      )}
      style={{
        boxShadow: "0 4px 20px rgba(0,0,0,0.3), 0 1px 3px rgba(0,0,0,0.2)",
        backdropFilter: "blur(16px)",
      }}
    >
      {/* Top gradient bar */}
      <div
        className={cn(
          "absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r rounded-t-2xl",
          colors.bar
        )}
      />

      {/* Shine overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.04] to-transparent pointer-events-none rounded-2xl" />

      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {icon && (
            <span className={cn("w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0", colors.icon)}>
              {icon}
            </span>
          )}
          <span className="label-text truncate">{label}</span>
        </div>

        {tooltip && (
          <div className="relative group/tip flex-shrink-0 ml-1">
            <HelpCircle size={12} className="text-slate-600 hover:text-slate-400 cursor-help transition-colors" />
            <div className="invisible group-hover/tip:visible opacity-0 group-hover/tip:opacity-100 transition-all duration-200 absolute z-50 right-0 top-6 w-64 p-3 rounded-xl bg-navy-800 border border-glass-strong shadow-2xl shadow-black/60">
              <p className="text-xs text-slate-300 leading-relaxed">{tooltip}</p>
            </div>
          </div>
        )}
      </div>

      {/* Value */}
      <div className={cn("font-mono text-2xl font-bold tracking-tight", colors.value)}>
        {displayValue}
      </div>

      {subtitle && (
        <p className="mt-1.5 text-xs text-slate-500 font-mono">{subtitle}</p>
      )}
    </div>
  );
}
