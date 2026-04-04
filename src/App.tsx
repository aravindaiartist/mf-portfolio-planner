import { useEffect } from "react";
import { PortfolioProvider, usePortfolioContext } from "@/context/PortfolioContext";
import { prewarmLiveIndex } from "@/lib/mfapi";
import { useFetchCagr } from "@/hooks/useFetchCagr";
import { StickyNav } from "@/components/layout/StickyNav";
import { DashboardSection } from "@/sections/DashboardSection";
import { SipCalculatorSection } from "@/sections/SipCalculatorSection";
import { EstimatedReturnsSection } from "@/sections/EstimatedReturnsSection";
import { StepUpSection } from "@/sections/StepUpSection";
import { TaxImpactSection } from "@/sections/TaxImpactSection";
import { InflationSection } from "@/sections/InflationSection";
import { RebalancingSection } from "@/sections/RebalancingSection";
import { SettingsSection } from "@/sections/SettingsSection";
import { AlertTriangle, TrendingUp, Sparkles, ChevronDown, Users, Briefcase, Activity, Banknote, RefreshCcw } from "lucide-react";

function AppInner() {
  const { state } = usePortfolioContext();
  const { fetchAllMissing } = useFetchCagr();

  useEffect(() => {
    if (state.funds.length > 0) {
      fetchAllMissing(state.funds);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <StickyNav />

      <main className="pt-14 pb-12 overflow-x-clip">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6">

          {/* ══════ HERO SECTION ══════ */}
          <div className="relative pt-14 pb-16 mb-14">
            {/* Ambient glow orbs */}
            <div className="hero-orb w-72 h-72 top-0 -left-20 bg-emerald-500/[0.07]" style={{ animationDelay: "0s" }} />
            <div className="hero-orb w-56 h-56 top-10 right-0 bg-blue-500/[0.06]" style={{ animationDelay: "2s" }} />
            <div className="hero-orb w-40 h-40 bottom-0 left-1/3 bg-violet-500/[0.05]" style={{ animationDelay: "4s" }} />

            <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center gap-10 lg:gap-16">
              {/* Left — Text content */}
              <div className="flex-1 min-w-0">
                {/* Badge */}
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium mb-6"
                  style={{
                    background: "rgba(16, 185, 129, 0.08)",
                    border: "1px solid rgba(16, 185, 129, 0.2)",
                    color: "#34d399",
                  }}
                >
                  <Sparkles size={12} />
                  Smart Investment Planning for Beginners
                </div>

                {/* Hero title */}
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-extrabold tracking-tight leading-[1.1] mb-5">
                  <span className="text-white">Plan Your</span>
                  <br />
                  <span className="gradient-text-green">Wealth Growth</span>
                  <span className="text-white"> Journey</span>
                </h1>

                <p className="text-slate-400 text-base sm:text-lg max-w-lg leading-relaxed mb-8">
                  Visualize your mutual fund investments, project returns with
                  step-up SIPs, and understand tax & inflation impact — all in one place.
                </p>

                {/* CTA */}
                <button
                  onClick={() => {
                    const el = document.getElementById("sip-investment");
                    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
                  }}
                  className="vibrant-btn inline-flex items-center gap-2 text-base px-6 py-3"
                >
                  <TrendingUp size={16} />
                  Start Planning
                  <ChevronDown size={14} className="animate-bounce" />
                </button>
              </div>

              {/* Right — Animated Mutual Fund Cycle Visual */}
              <div className="hidden lg:flex relative w-[320px] h-[320px] flex-shrink-0 items-center justify-center mt-8 lg:mt-0">
                {/* Central animated halo */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-[200px] h-[200px] rounded-full border border-sky-500/20"
                    style={{
                      animation: "spin-slow 20s linear infinite",
                    }}
                  >
                    {/* Particles around the central halo to show movement direction */}
                    <div className="absolute top-[-4px] left-1/2 w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
                    <div className="absolute bottom-[-4px] left-1/2 w-2 h-2 rounded-full bg-sky-400 shadow-[0_0_8px_#38bdf8]" />
                    <div className="absolute top-1/2 left-[-4px] w-2 h-2 rounded-full bg-violet-400 shadow-[0_0_8px_#a78bfa]" />
                    <div className="absolute top-1/2 right-[-4px] w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_8px_#fbbf24]" />
                  </div>
                </div>
                
                {/* Dashed outer ring */}
                 <div className="absolute inset-0 flex items-center justify-center">
                  <svg className="w-[280px] h-[280px] opacity-30" style={{ animation: "spin-slow 30s linear infinite reverse" }} viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="48" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="3 4" className="text-emerald-400" />
                  </svg>
                </div>

                {/* Central Node: Mutual Funds */}
                <div className="relative z-10 w-24 h-24 rounded-full flex flex-col items-center justify-center"
                   style={{
                    background: "linear-gradient(135deg, rgba(11, 15, 30, 0.9), rgba(16, 25, 45, 0.9))",
                    border: "1px solid rgba(56, 189, 248, 0.3)",
                    boxShadow: "0 0 30px rgba(56, 189, 248, 0.15), inset 0 0 20px rgba(56, 189, 248, 0.1)",
                    backdropFilter: "blur(12px)",
                  }}
                >
                  <RefreshCcw size={20} className="text-sky-400 mb-1" style={{ animation: "spin-slow 15s linear infinite reverse" }} />
                  <span className="text-[11px] font-bold text-slate-100 leading-tight text-center">Mutual<br/>Funds</span>
                </div>

                {/* Top Node: Investors */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/4 flex flex-col items-center gap-2 group z-20">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                    style={{
                      background: "linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(16, 185, 129, 0.05))",
                      border: "1px solid rgba(16, 185, 129, 0.3)",
                      boxShadow: "0 0 15px rgba(16, 185, 129, 0.2)",
                    }}
                  >
                    <Users size={20} className="text-emerald-400" />
                  </div>
                  <span className="text-xs font-semibold text-emerald-300 tracking-wide uppercase">Investors</span>
                </div>

                {/* Right Node: Fund Managers */}
                <div className="absolute right-0 top-1/2 translate-x-1/4 -translate-y-1/2 flex flex-col items-center gap-2 z-20">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                    style={{
                      background: "linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(99, 102, 241, 0.05))",
                      border: "1px solid rgba(99, 102, 241, 0.3)",
                      boxShadow: "0 0 15px rgba(99, 102, 241, 0.2)",
                    }}
                  >
                    <Briefcase size={20} className="text-indigo-400" />
                  </div>
                  <span className="text-xs font-semibold text-indigo-300 tracking-wide uppercase">Managers</span>
                </div>

                {/* Bottom Node: Portfolio */}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/4 flex flex-col items-center gap-2 z-20">
                  <span className="text-xs font-semibold text-violet-300 tracking-wide uppercase">Portfolio</span>
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                    style={{
                      background: "linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(139, 92, 246, 0.05))",
                      border: "1px solid rgba(139, 92, 246, 0.3)",
                      boxShadow: "0 0 15px rgba(139, 92, 246, 0.2)",
                    }}
                  >
                    <Activity size={20} className="text-violet-400" />
                  </div>
                </div>

                {/* Left Node: Returns */}
                <div className="absolute left-0 top-1/2 -translate-x-1/4 -translate-y-1/2 flex flex-col items-center gap-2 z-20">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                    style={{
                      background: "linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(245, 158, 11, 0.05))",
                      border: "1px solid rgba(245, 158, 11, 0.3)",
                      boxShadow: "0 0 15px rgba(245, 158, 11, 0.2)",
                    }}
                  >
                    <Banknote size={20} className="text-amber-400" />
                  </div>
                  <span className="text-xs font-semibold text-amber-300 tracking-wide uppercase">Returns</span>
                </div>

                {/* Arrow overlays matching the connection points (Top-Right, Right-Bottom, Bottom-Left, Left-Top) */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ filter: "drop-shadow(0 0 6px rgba(255,255,255,0.1))" }}>
                   {/* Investors -> Managers (Top -> Right) */}
                   <path d="M 190 70 Q 230 100 250 140" fill="none" stroke="rgba(16, 185, 129, 0.4)" strokeWidth="2" strokeLinecap="round" strokeDasharray="4 4" className="animate-dash" />
                   
                   {/* Managers -> Portfolio (Right -> Bottom) */}
                   <path d="M 250 180 Q 230 220 190 250" fill="none" stroke="rgba(99, 102, 241, 0.4)" strokeWidth="2" strokeLinecap="round" strokeDasharray="4 4" className="animate-dash" />
                   
                   {/* Portfolio -> Returns (Bottom -> Left) */}
                   <path d="M 130 250 Q 90 220 70 180" fill="none" stroke="rgba(139, 92, 246, 0.4)" strokeWidth="2" strokeLinecap="round" strokeDasharray="4 4" className="animate-dash" />

                   {/* Returns -> Investors (Left -> Top) */}
                   <path d="M 70 140 Q 90 100 130 70" fill="none" stroke="rgba(245, 158, 11, 0.4)" strokeWidth="2" strokeLinecap="round" strokeDasharray="4 4" className="animate-dash" />
                </svg>
              </div>
            </div>

            {/* Quick stats strip — separated with spacing */}
            <div className="relative z-10 flex flex-wrap items-center gap-6 mt-12 pt-6 border-t border-white/[0.06]">
              {[
                { label: "Sections", value: "8", sub: "Comprehensive analysis" },
                { label: "Data Source", value: "AMFI", sub: "Official NAV data" },
                { label: "Tax Engine", value: "LTCG", sub: "FY2024 rules" },
              ].map((stat) => (
                <div key={stat.label} className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="font-mono text-lg font-bold text-white">{stat.value}</div>
                    <div className="text-[10px] text-slate-500 uppercase tracking-wider">{stat.label}</div>
                  </div>
                  <div className="w-px h-8 bg-white/[0.06]" />
                  <div className="text-xs text-slate-500">{stat.sub}</div>
                </div>
              ))}
            </div>
          </div>

          {/* ══════ CONTENT SECTIONS ══════ */}
          <div className="flex flex-col gap-16">
            <DashboardSection />
            <SipCalculatorSection />
            <EstimatedReturnsSection />
            <StepUpSection />
            <TaxImpactSection />
            <InflationSection />
            <RebalancingSection />
            <SettingsSection />
          </div>
        </div>
      </main>

      {/* ══════ DISCLAIMER ══════ */}
      <div className="border-t border-white/[0.06]">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-8">
          <div className="rounded-2xl p-5 border"
            style={{
              background: "rgba(245, 158, 11, 0.04)",
              borderColor: "rgba(245, 158, 11, 0.15)",
            }}
          >
            <div className="flex items-start gap-3">
              <AlertTriangle size={18} className="text-amber-400 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="text-sm font-semibold text-amber-300 mb-2 font-display">Disclaimer</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  This tool is built for personal research and educational purposes only.
                  The analysis, scores, verdicts and buy zone signals displayed here are
                  data-driven indicators — not financial advice. Do not treat any output
                  as a buy/sell recommendation. Always consult a SEBI-registered investment
                  advisor before making investment decisions. Past performance is not
                  indicative of future returns. Mutual fund investments are subject to
                  market risks — read all scheme-related documents carefully.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ══════ FOOTER ══════ */}
      <footer className="border-t border-white/[0.06] py-10">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 mb-3">
            <div className="w-6 h-6 rounded-lg flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #10b981, #059669)" }}
            >
              <TrendingUp size={12} className="text-white" />
            </div>
            <span className="font-display font-bold text-sm text-slate-300">MF Portfolio Planner</span>
          </div>
          <p className="text-sm text-slate-400 font-display font-medium mb-1">
            Developed by Aravindan Natarajan
          </p>
          <p className="text-xs text-slate-600 leading-relaxed">
            Data sourced from AMFI via mfapi.in · Benchmarks per SEBI Circular Oct 2021
          </p>
          <p className="text-xs text-slate-600 mt-3">
            © 2026 Aravindan Natarajan. All rights reserved.
          </p>
        </div>
      </footer>
    </>
  );
}

export default function App() {
  useEffect(() => {
    prewarmLiveIndex();
  }, []);

  return (
    <PortfolioProvider>
      <AppInner />
    </PortfolioProvider>
  );
}
