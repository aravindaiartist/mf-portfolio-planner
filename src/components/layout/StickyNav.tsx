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
          className="flex items-center gap-2 mr-4 flex-shrink-0 group"
        >
          <div className="w-8 h-8 rounded-xl flex items-center justify-center shadow-lg transition-all duration-300 group-hover:scale-110"
            style={{
              background: "linear-gradient(135deg, #10b981, #059669)",
              boxShadow: "0 0 16px rgba(16,185,129,0.35)",
            }}
          >
            <TrendingUp size={15} className="text-white" strokeWidth={2.5} />
          </div>
          <div className="flex flex-col text-left">
            <span className="font-display font-bold text-[13.5px] text-slate-100 tracking-tight leading-none mb-1">
              MF Portfolio <span className="text-emerald-400">Planner</span>
            </span>
            <span className="text-[8.5px] text-slate-500 tracking-widest uppercase leading-none font-medium">
              SMART SIP PLANNING
            </span>
          </div>
        </button>

        {/* Home button */}
        <button
          onClick={() => scrollTo(SECTION_IDS.dashboard)}
          className={cn(
            "flex items-center gap-1.5 px-4 py-2 rounded-full text-[11px] font-bold whitespace-nowrap transition-all duration-300 flex-shrink-0 group",
            activeId === SECTION_IDS.dashboard
              ? "text-emerald-400"
              : "text-slate-400 hover:text-slate-200"
          )}
          style={
            activeId === SECTION_IDS.dashboard
              ? {
                  background: "linear-gradient(145deg, rgba(6,11,24,0.95), rgba(16,185,129,0.12))",
                  boxShadow: "inset 1px 1px 3px rgba(255,255,255,0.12), inset -2px -2px 5px rgba(0,0,0,0.7), 0 4px 15px rgba(0,0,0,0.3)",
                  border: "1px solid rgba(16,185,129,0.4)",
                }
              : {
                  background: "linear-gradient(145deg, rgba(255,255,255,0.05), rgba(0,0,0,0.2))",
                  boxShadow: "2px 2px 6px rgba(0,0,0,0.4), inset 1px 1px 2px rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.03)",
                }
          }
        >
          <Home size={13} strokeWidth={2.5} />
          <span>Home</span>
        </button>

        <div className="w-px h-5 bg-white/[0.08] mx-2 flex-shrink-0" />

        {/* Section nav */}
        <nav className="flex items-center gap-2 py-1 overflow-x-auto scrollbar-hide no-scrollbar flex-1">
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
                  "flex items-center gap-1.5 px-4 py-2 rounded-full text-[11px] font-bold whitespace-nowrap transition-all duration-300 group flex-shrink-0",
                  isActive
                    ? "text-emerald-400"
                    : "text-slate-400 hover:text-slate-200"
                )}
                style={
                  isActive
                    ? {
                        background: "linear-gradient(145deg, rgba(6,11,24,0.95), rgba(16,185,129,0.12))",
                        boxShadow: "inset 1px 1px 3px rgba(255,255,255,0.12), inset -2px -2px 5px rgba(0,0,0,0.7), 0 4px 15px rgba(0,0,0,0.3)",
                        border: "1px solid rgba(16,185,129,0.4)",
                      }
                    : {
                        background: "linear-gradient(145deg, rgba(255,255,255,0.05), rgba(0,0,0,0.2))",
                        boxShadow: "2px 2px 6px rgba(0,0,0,0.4), inset 1px 1px 2px rgba(255,255,255,0.05)",
                        border: "1px solid rgba(255,255,255,0.03)",
                      }
                }
              >
                {IconComp && (
                  <IconComp
                    size={13}
                    strokeWidth={isActive ? 2.5 : 2}
                    className="flex-shrink-0"
                  />
                )}
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="w-px h-5 bg-white/[0.08] mx-2 flex-shrink-0" />

        {/* External analysis link */}
        <a
          href="https://mf-analysis-platform.vercel.app/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 flex-shrink-0 group px-4 py-2 rounded-full transition-all duration-300 text-[11px] font-bold whitespace-nowrap"
          style={{
            background: "linear-gradient(145deg, rgba(139,92,246,0.1), rgba(0,0,0,0.3))",
            boxShadow: "2px 2px 6px rgba(0,0,0,0.4), inset 1px 1px 2px rgba(255,255,255,0.05)",
            border: "1px solid rgba(139,92,246,0.3)",
            color: "#c4b5fd",
          }}
          title="Open Mutual Fund Analysis Platform"
        >
          <Sparkles size={13} strokeWidth={2.5} className="flex-shrink-0 group-hover:drop-shadow-[0_0_5px_rgba(168,85,247,0.5)] transition-all" />
          <span>MF Analysis</span>
          <ExternalLink size={11} className="opacity-60 group-hover:opacity-100 transition-opacity ml-0.5" />
        </a>
      </div>

      {/* Accent line */}
      <div className="h-[1px] bg-gradient-to-r from-transparent via-emerald-500/25 via-violet-500/15 to-transparent" />
    </header>
  );
}
