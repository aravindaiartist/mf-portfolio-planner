import { useCallback } from "react";
import { cn } from "@/lib/utils";
import { NAV_ITEMS, SECTION_IDS } from "@/lib/constants";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { type LucideIcon, LayoutDashboard, Calculator, TrendingUp, ArrowUpRight, Receipt, TrendingDown, Scale, Settings, Home, ExternalLink, Sparkles } from "lucide-react";

const ICON_MAP: Record<string, LucideIcon> = {
  LayoutDashboard, Calculator, TrendingUp, ArrowUpRight,
  Receipt, TrendingDown, Scale, Settings,
};

const ALL_IDS = Object.values(SECTION_IDS);

// Simple hook inline — avoids import issues
import { useActiveSection } from "@/hooks/useActiveSection";

export function StickyNav() {
  const activeId = useActiveSection(ALL_IDS);

  const scrollTo = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-50"
      style={{
        background: "rgba(11, 15, 30, 0.85)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        borderBottom: "1px solid rgba(255,255,255,0.07)",
      }}
    >
      <div className="max-w-[1280px] mx-auto h-14 flex items-center px-4 gap-2">

        {/* Logo + Brand */}
        <button
          onClick={scrollToTop}
          className="flex items-center gap-2.5 mr-2 flex-shrink-0 group"
        >
          <div className="w-8 h-8 rounded-xl flex items-center justify-center shadow-lg transition-all duration-300 group-hover:scale-105"
            style={{
              background: "linear-gradient(135deg, #10b981, #059669)",
              boxShadow: "0 0 16px rgba(16,185,129,0.35)",
            }}
          >
            <TrendingUp size={15} className="text-white" strokeWidth={2.5} />
          </div>
          <div className="hidden sm:flex flex-col">
            <span className="font-display font-bold text-[14px] text-slate-100 tracking-tight leading-none mb-1.5">
              Mutual Fund Portfolio Planner
            </span>
            <span className="text-[9px] text-slate-500 tracking-widest uppercase leading-none">
              Smart SIP Planning
            </span>
          </div>
        </button>

        <div className="w-px h-6 bg-white/[0.07] mr-1 flex-shrink-0" />

        {/* Home button */}
        <button
          onClick={() => scrollTo(SECTION_IDS.dashboard)}
          className={cn(
            "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 flex-shrink-0",
            activeId === SECTION_IDS.dashboard
              ? "bg-emerald-500/12 text-emerald-400"
              : "text-slate-500 hover:text-slate-200 hover:bg-white/[0.05]"
          )}
        >
          <Home size={13} strokeWidth={2} />
          <span className="hidden lg:inline">Home</span>
        </button>

        <div className="w-px h-4 bg-white/[0.06] flex-shrink-0" />

        {/* Section nav */}
        <nav className="flex-1 overflow-x-auto scrollbar-hide">
          <div className="flex items-center gap-0.5 px-1">
            {NAV_ITEMS.map((item) => {
              const IconComp = ICON_MAP[item.icon];
              const isActive = activeId === item.id;
              const isDashboard = item.id === SECTION_IDS.dashboard;

              if (isDashboard) return null;

              return (
                <button
                  key={item.id}
                  onClick={() => scrollTo(item.id)}
                  className={cn(
                    "relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all duration-200",
                    isActive
                      ? "text-emerald-400 bg-emerald-500/10"
                      : "text-slate-500 hover:text-slate-200 hover:bg-white/[0.05]"
                  )}
                >
                  {IconComp && (
                    <IconComp
                      size={12}
                      strokeWidth={isActive ? 2.5 : 1.8}
                      className="flex-shrink-0"
                    />
                  )}
                  <span className="hidden md:inline">{item.label}</span>

                  {isActive && (
                    <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-emerald-400 md:hidden" />
                  )}
                </button>
              );
            })}
          </div>
        </nav>

        <div className="w-px h-6 bg-white/[0.07] mx-1 flex-shrink-0 hidden md:block" />

        {/* External analysis link */}
        <a
          href="https://mf-analysis-platform.vercel.app/"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden md:flex items-center gap-1.5 flex-shrink-0 group px-3 py-1.5 rounded-lg transition-all duration-200 text-xs font-medium"
          style={{
            background: "rgba(139,92,246,0.08)",
            border: "1px solid rgba(139,92,246,0.2)",
            color: "#a78bfa",
          }}
          title="Open Mutual Fund Analysis Platform"
        >
          <Sparkles size={11} className="flex-shrink-0" />
          <span>MF Analysis</span>
          <ExternalLink size={10} className="opacity-60" />
        </a>
      </div>

      {/* Accent line */}
      <div className="h-[1px] bg-gradient-to-r from-transparent via-emerald-500/25 via-violet-500/15 to-transparent" />
    </header>
  );
}
