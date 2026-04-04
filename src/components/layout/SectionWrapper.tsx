import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SectionWrapperProps {
  id: string;
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
  icon?: ReactNode;
  accent?: "green" | "purple" | "blue" | "orange";
}

const ACCENT_MAP = {
  green: {
    bar: "from-emerald-500 to-teal-400",
    badge: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
    dot: "bg-emerald-400",
  },
  purple: {
    bar: "from-violet-500 to-purple-400",
    badge: "bg-violet-500/10 text-violet-400 border border-violet-500/20",
    dot: "bg-violet-400",
  },
  blue: {
    bar: "from-blue-500 to-indigo-400",
    badge: "bg-blue-500/10 text-blue-400 border border-blue-500/20",
    dot: "bg-blue-400",
  },
  orange: {
    bar: "from-amber-500 to-orange-400",
    badge: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
    dot: "bg-amber-400",
  },
};

export function SectionWrapper({
  id,
  title,
  description,
  children,
  className,
  icon,
  accent = "green",
}: SectionWrapperProps) {
  const colors = ACCENT_MAP[accent];

  return (
    <section
      id={id}
      className={cn("scroll-mt-20", className)}
    >
      {/* Section Header */}
      <div className="mb-7 flex items-start gap-4">
        {icon && (
          <div className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5",
            colors.badge
          )}>
            {icon}
          </div>
        )}
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-1">
            <span className={cn("w-1.5 h-5 rounded-full", colors.dot)} />
            <h2 className="section-title">{title}</h2>
          </div>
          {description && (
            <p className="text-sm text-slate-500 leading-relaxed pl-4">
              {description}
            </p>
          )}
        </div>
      </div>

      {/* Divider with gradient */}
      <div className={cn("h-px bg-gradient-to-r mb-7 opacity-30", colors.bar, "to-transparent")} />

      {children}
    </section>
  );
}
