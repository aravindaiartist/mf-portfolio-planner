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
        "relative flex flex-col h-full rounded-[2rem] p-5 overflow-visible group transition-all duration-300",
        "hover:-translate-y-1 hover:shadow-2xl"
      )}
      style={{
        boxShadow: "-2px -2px 6px rgba(255,255,255,0.04), 4px 4px 12px rgba(0,0,0,0.5), inset 1px 1px 3px rgba(255,255,255,0.08)",
        border: "1px solid rgba(255,255,255,0.05)",
        backdropFilter: "blur(16px)",
      }}
    >
      {/* Inner clipping layer to mathematically perfectly cut the top gradient line and background against the curved border */}
      <div className={cn("absolute inset-0 rounded-[2rem] overflow-hidden pointer-events-none bg-gradient-to-br", colors.bg, colors.glow)}>
        {/* Top gradient bar */}
        <div className={cn("absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r", colors.bar)} />
        {/* Shine overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.04] to-transparent pointer-events-none" />
      </div>

      <div className="flex flex-col items-center justify-center flex-1 w-full gap-2 relative z-10 text-center">
        {/* Header: Icon + Label + Tooltip */}
        <div className="flex items-center justify-center gap-2 max-w-full relative">
          {icon && (
            <span className={cn("w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0", colors.icon)}>
              {icon}
            </span>
          )}
          <span className="label-text truncate max-w-[120px] sm:max-w-full">{label}</span>
          
          {tooltip && (
            <div className="relative group/tip flex-shrink-0">
              <HelpCircle size={12} className="text-slate-600 hover:text-slate-400 cursor-help transition-colors" />
              <div className="invisible group-hover/tip:visible opacity-0 group-hover/tip:opacity-100 transition-all duration-200 absolute z-50 left-1/2 -translate-x-1/2 bottom-full mb-2 w-64 p-3 rounded-xl bg-navy-800 border border-glass-strong shadow-2xl shadow-black/60 pointer-events-none">
                <p className="text-xs text-slate-300 leading-relaxed text-left">{tooltip}</p>
              </div>
            </div>
          )}
        </div>

        {/* Value */}
        <div className={cn("font-mono text-3xl font-bold tracking-tight", colors.value)}>
          {displayValue}
        </div>

        {/* Subtitle - Fixed min-height guarantees strict horizontal alignment of the Value above it across cards */}
        <div className="min-h-[16px] w-full flex items-center justify-center mt-1">
          {subtitle && (
            <p className="text-[11px] text-slate-500 font-mono tracking-wide">{subtitle}</p>
          )}
        </div>
      </div>
    </div>
  );
}
