import { useCallback, useState, useRef } from "react";
import { SECTION_IDS } from "@/lib/constants";
import { SectionWrapper } from "@/components/layout/SectionWrapper";
import { FundAllocationPie } from "@/components/charts/FundAllocationPie";
import { FundAllocationTable } from "@/components/fund/FundAllocationTable";
import { PortfolioSummaryBar } from "@/components/fund/PortfolioSummaryBar";
import { usePortfolio } from "@/hooks/usePortfolio";
import { formatCurrency } from "@/lib/formatters";
import {
  validateMonthlySip,
  validateStepUpRate,
  sanitizeNumber,
} from "@/lib/validators";
import { RotateCcw, Pencil } from "lucide-react";
import type { Fund } from "@/lib/types";

export function SipCalculatorSection() {
  const { state, dispatch, allocationValidation, coreSatelliteSplit } = usePortfolio();

  const sipValidation = validateMonthlySip(state.monthlySip);
  const stepUpValidation = validateStepUpRate(state.stepUpRate);

  // Inline edit states
  const [editingSip, setEditingSip] = useState(false);
  const [editingStepUp, setEditingStepUp] = useState(false);
  const [tempSip, setTempSip] = useState(String(state.monthlySip));
  const [tempStepUp, setTempStepUp] = useState(String(state.stepUpRate));

  // Track if user has interacted with SIP input
  const [sipTouched, setSipTouched] = useState(state.monthlySip > 0);

  // Attention blink: step-up blinks after SIP is set, add-fund blinks after step-up is set
  const [blinkStepUp, setBlinkStepUp] = useState(false);
  const [blinkAddFund, setBlinkAddFund] = useState(false);

  // Ref to keep scroll position stable after SIP commit
  const sipSectionRef = useRef<HTMLDivElement>(null);

  const commitSip = useCallback(() => {
    const val = sanitizeNumber(parseFloat(tempSip), 0);
  const scrollY = window.scrollY;
    dispatch({ type: "SET_MONTHLY_SIP", value: Math.max(0, Math.round(val)) });
    requestAnimationFrame(() => { window.scrollTo(0, scrollY); });
    setEditingSip(false);

    // Blink step-up if it's still 0 and SIP was just set
    if (val > 0 && state.stepUpRate === 0) {
      setBlinkStepUp(true);
      setTimeout(() => setBlinkStepUp(false), 3000);
    }
    // Blink add fund if SIP set but no funds
    if (val > 0 && state.funds.length === 0) {
      setBlinkAddFund(true);
      setTimeout(() => setBlinkAddFund(false), 3000);
    }
  }, [tempSip, dispatch, state.stepUpRate, state.funds.length]);

  const commitStepUp = useCallback(() => {
    const val = sanitizeNumber(parseFloat(tempStepUp), 0);
    const scrollY = window.scrollY;
    dispatch({ type: "SET_STEP_UP_RATE", value: Math.max(0, val) });
    requestAnimationFrame(() => { window.scrollTo(0, scrollY); });
    setEditingStepUp(false);

    // Blink add fund after step-up is set
    if (state.funds.length === 0) {
      setBlinkAddFund(true);
      setTimeout(() => setBlinkAddFund(false), 3000);
    }
  }, [tempStepUp, dispatch, state.funds.length]);

  const handleUpdateFund = useCallback(
    (fund: Fund) => dispatch({ type: "UPDATE_FUND", fund }),
    [dispatch]
  );

  const handleRemoveFund = useCallback(
    (fundId: string) => dispatch({ type: "REMOVE_FUND", fundId }),
    [dispatch]
  );

  const handleAddFund = useCallback(
    (fund: Fund) => dispatch({ type: "ADD_FUND", fund }),
    [dispatch]
  );

  return (
    <SectionWrapper
      id={SECTION_IDS.sipCalculator}
      title="SIP Investment"
      description="Define your monthly SIP, step-up rate, and fund allocation."
    >
      <div ref={sipSectionRef}>
        {/* SIP + Step-Up inputs */}
        <div className="flex flex-wrap gap-4 mb-6">
          {/* Monthly SIP */}
          <div className="bg-glass-bg border border-glass-border rounded-xl p-4 min-w-[200px]">
            <label className="text-xs text-slate-400 uppercase tracking-wider block mb-1">
              Monthly SIP
            </label>
            {editingSip ? (
              <input
                autoFocus
                type="number"
                value={tempSip}
                onChange={(e) => setTempSip(e.target.value)}
                onBlur={commitSip}
                onKeyDown={(e) => {
                  if (e.key === "Enter") commitSip();
                  if (e.key === "Escape") setEditingSip(false);
                }}
                className="w-full bg-navy-800 border border-accent/40 rounded px-2 py-1 text-lg font-mono text-slate-100 outline-none focus:border-accent"
              />
            ) : (
              <button
                onClick={() => { setTempSip(String(state.monthlySip)); setEditingSip(true); setSipTouched(true); }}
                className="text-xl font-mono font-semibold text-slate-100 hover:text-accent transition-colors cursor-pointer flex items-center gap-2"
              >
                {formatCurrency(state.monthlySip)}
                <Pencil size={12} className="text-slate-500" />
              </button>
            )}
            {sipTouched && !sipValidation.valid && (
              <p className="mt-1 text-xs text-warn">{sipValidation.warnings[0]}</p>
            )}
            <button
              onClick={() => {
                dispatch({ type: "SET_MONTHLY_SIP", value: 0 });
              }}
              className="mt-2 flex items-center gap-1 text-[10px] text-slate-500 hover:text-slate-300 transition-colors"
              title="Clear SIP amount"
            >
              <RotateCcw size={10} />
              Clear SIP
            </button>
          </div>

          {/* Step-Up Rate */}
          <div className={
            "bg-glass-bg border rounded-xl p-4 min-w-[160px] transition-all duration-300 " +
            (blinkStepUp
              ? "border-accent shadow-lg shadow-accent/20 animate-pulse"
              : "border-glass-border")
          }>
            <label className="text-xs text-slate-400 uppercase tracking-wider block mb-1">
              Annual Step-Up
              {blinkStepUp && <span className="ml-2 text-accent text-[10px] font-normal">← Set this next</span>}
            </label>
            {editingStepUp ? (
              <div className="flex items-center">
                <input
                  autoFocus
                  type="number"
                  value={tempStepUp}
                  onChange={(e) => setTempStepUp(e.target.value)}
                  onBlur={commitStepUp}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") commitStepUp();
                    if (e.key === "Escape") setEditingStepUp(false);
                  }}
                  className="w-20 bg-navy-800 border border-accent/40 rounded px-2 py-1 text-lg font-mono text-slate-100 outline-none focus:border-accent"
                  step="1"
                />
                <span className="ml-1 text-lg text-slate-400">%</span>
              </div>
            ) : (
              <button
                onClick={() => { setTempStepUp(String(state.stepUpRate)); setEditingStepUp(true); }}
                className="text-xl font-mono font-semibold text-slate-100 hover:text-accent transition-colors cursor-pointer flex items-center gap-2"
              >
                {state.stepUpRate}%
                <Pencil size={12} className="text-slate-500" />
              </button>
            )}
            {!stepUpValidation.valid && (
              <p className="mt-1 text-xs text-warn">{stepUpValidation.warnings[0]}</p>
            )}
          </div>
        </div>

        {/* Fund Table - placed first so pie chart appearing below doesn't cause scroll jump */}
        <div className={
          "bg-glass-bg border rounded-xl p-4 mb-4 transition-all duration-300 " +
          (blinkAddFund
            ? "border-accent shadow-lg shadow-accent/20 animate-pulse"
            : "border-glass-border")
        }>
          {blinkAddFund && state.funds.length === 0 && (
            <p className="text-xs text-accent mb-2 font-medium">↓ Now add your funds below</p>
          )}
          <FundAllocationTable
            funds={state.funds}
            monthlySip={state.monthlySip}
            onUpdate={handleUpdateFund}
            onRemove={handleRemoveFund}
            onAdd={handleAddFund}
          />
        </div>

        {/* Allocation Chart - placed after fund table so it appears below */}
        {state.funds.length > 0 && (
          <div className="bg-glass-bg border border-glass-border rounded-xl p-5 mb-4">
            <h3 className="text-xs text-slate-400 uppercase tracking-wider mb-4">
              Fund Allocation Split
            </h3>
            <FundAllocationPie 
              funds={state.funds} 
              monthlySip={state.monthlySip}
              targetCoreSplit={state.targetCoreSplit}
              onCoreSplitChange={(value) => dispatch({ type: "SET_TARGET_CORE_SPLIT", value })}
            />
          </div>
        )}

        {/* Summary bar */}
        <PortfolioSummaryBar
          coreAllocation={coreSatelliteSplit.core}
          satelliteAllocation={coreSatelliteSplit.satellite}
          validation={allocationValidation}
        />
      </div>
    </SectionWrapper>
  );
}