import { useCallback } from "react";
import { cn } from "@/lib/utils";
import { NAV_ITEMS, SECTION_IDS } from "@/lib/constants";
import { useActiveSection } from "@/hooks/useActiveSection";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { type LucideIcon, LayoutDashboard, Calculator, TrendingUp, ArrowUpRight, Receipt, TrendingDown, Scale, Settings, Home, ExternalLink } from "lucide-react";

const ICON_MAP: Record<string, LucideIcon> = {
  LayoutDashboard, Calculator, TrendingUp, ArrowUpRight,
  Receipt, TrendingDown, Scale, Settings,
};

const ALL_IDS = Object.values(SECTION_IDS);

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
    <header className="fixed top-0 left-0 right-0 z-50 bg-navy-950/90 backdrop-blur-2xl border-b border-white/[0.06]">
      <div className="max-w-[1280px] mx-auto h-14 flex items-center px-4 gap-2">

        {/* Logo + Brand */}
        <button
          onClick={scrollToTop}
          className="flex items-center gap-2.5 mr-2 flex-shrink-0 group"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent to-teal-400 flex items-center justify-center shadow-lg shadow-accent/20 group-hover:shadow-accent/40 transition-shadow">
            <TrendingUp size={15} className="text-navy-950" strokeWidth={2.5} />
          </div>
          <span className="font-display font-bold text-[15px] text-slate-100 hidden sm:block tracking-tight">
            Mutual Fund Investment Planner
          </span>
        </button>

        <div className="w-px h-6 bg-white/[0.08] mr-1 flex-shrink-0" />

        {/* Home button */}
        <button
          onClick={scrollToTop}
          className={cn(
            "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 flex-shrink-0",
            activeId === SECTION_IDS.dashboard
              ? "bg-accent/12 text-accent"
              : "text-slate-500 hover:text-slate-200 hover:bg-white/[0.04]"
          )}
          title="Scroll to top"
        >
          <Home size={14} strokeWidth={2} />
          <span className="hidden lg:inline">Home</span>
        </button>

        <div className="w-px h-4 bg-white/[0.06] flex-shrink-0" />

        {/* Section nav pills */}
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
                      ? "bg-accent/12 text-accent"
                      : "text-slate-500 hover:text-slate-200 hover:bg-white/[0.04]"
                  )}
                >
                  {IconComp && (
                    <IconComp
                      size={13}
                      strokeWidth={isActive ? 2.5 : 1.8}
                      className="flex-shrink-0"
                    />
                  )}
                  <span className="hidden md:inline">{item.label}</span>

                  {isActive && (
                    <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-accent md:hidden" />
                  )}
                </button>
              );
            })}
          </div>
        </nav>

        {/* Divider before analysis link */}
        <div className="w-px h-6 bg-white/[0.08] mx-1 flex-shrink-0 hidden md:block" />

        {/* MF Analysis Platform — external link with distinct styling */}
        <a
          href="https://mf-analysis-platform.vercel.app/"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden md:flex items-center gap-2 flex-shrink-0 group px-3 py-1.5 rounded-lg border border-white/[0.08] hover:border-accent/30 hover:bg-accent/5 transition-all"
          title="Open Mutual Fund Analysis Platform (opens in new tab)"
        >
          <span className="font-display font-bold text-[14px] text-slate-300 tracking-tight group-hover:text-accent transition-colors">
            Mutual Fund Analysis
          </span>
          <ExternalLink size={12} className="text-slate-500 group-hover:text-accent transition-colors" />
        </a>
      </div>

      <div className="h-px bg-gradient-to-r from-transparent via-accent/20 to-transparent" />
    </header>
  );
}
