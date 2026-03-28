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
import { AlertTriangle } from "lucide-react";

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

      <main className="pt-14 pb-12">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
          <div className="flex flex-col gap-16 py-8">
            {/* Core Sections */}
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

      {/* Disclaimer */}
      <div className="border-t border-glass-border">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-8">
          <div className="bg-glass-bg border border-glass-border rounded-xl p-5">
            <div className="flex items-start gap-3">
              <AlertTriangle size={18} className="text-amber-400 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="text-sm font-semibold text-slate-200 mb-2">Disclaimer</h3>
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

      {/* Footer */}
      <footer className="border-t border-glass-border py-8">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 text-center">
          <p className="text-sm text-slate-300 font-display font-medium mb-2">
            Developed by Aravindan Natarajan
          </p>
          <p className="text-xs text-slate-500 leading-relaxed">
            Data sourced from AMFI via mfapi.in · Benchmarks per SEBI Circular Oct 2021
          </p>
          <p className="text-xs text-slate-600 mt-1">
            For Personal Use Only · Not for commercial distribution
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
