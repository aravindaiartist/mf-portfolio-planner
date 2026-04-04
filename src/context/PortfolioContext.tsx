import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  type ReactNode,
} from "react";
import type { PortfolioState, PortfolioAction, Fund } from "@/lib/types";
import { DEFAULT_PORTFOLIO_STATE } from "@/lib/constants";
import { autoAllocate } from "@/lib/calc/autoAllocate";
import { loadPortfolioState, savePortfolioState } from "@/lib/storage";

function hydrateState(raw: PortfolioState): PortfolioState {
  return {
    ...raw,
    rebalanceEntries: raw.rebalanceEntries ?? {},
    targetCoreSplit: raw.targetCoreSplit ?? 60,
  };
}

function portfolioReducer(
  state: PortfolioState,
  action: PortfolioAction
): PortfolioState {
  switch (action.type) {
    case "SET_FUNDS":
      return { ...state, funds: action.funds };

    case "ADD_FUND":
      return { ...state, funds: autoAllocate([...state.funds, action.fund], state.targetCoreSplit) };

    case "UPDATE_FUND": {
      const oldFund = state.funds.find((f: Fund) => f.id === action.fund.id);
      const bucketChanged = oldFund && oldFund.bucket !== action.fund.bucket;
      const updatedFunds = state.funds.map((f: Fund) =>
        f.id === action.fund.id ? action.fund : f
      );
      return {
        ...state,
        funds: bucketChanged ? autoAllocate(updatedFunds, state.targetCoreSplit) : updatedFunds,
      };
    }

    case "REMOVE_FUND": {
      const { [action.fundId]: _removed, ...remainingEntries } =
        state.rebalanceEntries ?? {};
      return {
        ...state,
        funds: autoAllocate(state.funds.filter((f: Fund) => f.id !== action.fundId), state.targetCoreSplit),
        rebalanceEntries: remainingEntries,
      };
    }

    case "SET_MONTHLY_SIP":
      return { ...state, monthlySip: action.value };

    case "SET_STEP_UP_RATE":
      return { ...state, stepUpRate: action.value };

    case "SET_INFLATION_RATE":
      return { ...state, inflationRate: action.value };

    case "SET_LTCG_EXEMPTION":
      return { ...state, ltcgExemptionPerYear: action.value };

    case "SET_LTCG_TAX_RATE":
      return { ...state, ltcgTaxRate: action.value };

    case "SET_REBALANCE_ENTRY":
      return {
        ...state,
        rebalanceEntries: {
          ...(state.rebalanceEntries ?? {}),
          [action.fundId]: action.value,
        },
      };

    case "SET_CAGR_OVERRIDE":
      return { ...state, cagrOverride: action.value };

    case "SET_TARGET_CORE_SPLIT":
      // Re-allocate all funds when Core/Satellite split changes
      return {
        ...state,
        targetCoreSplit: action.value,
        funds: autoAllocate(state.funds, action.value),
      };

    case "SET_FUND_SIP_OVERRIDE": {
      // When user manually sets SIP amount, recalculate allocation
      const updatedFunds = state.funds.map((f: Fund) => {
        if (f.id !== action.fundId) return f;
        if (action.sipAmount === null) {
          // Clear override, revert to auto-calculated
          return { ...f, sipOverride: null };
        }
        // Set manual SIP and calculate new allocation
        const newAllocation = state.monthlySip > 0 
          ? (action.sipAmount / state.monthlySip) * 100 
          : f.allocation;
        return { 
          ...f, 
          sipOverride: action.sipAmount,
          allocation: Math.round(newAllocation * 100) / 100,
        };
      });
      return { ...state, funds: updatedFunds };
    }

    case "SET_FUND_CAGR":
      return {
        ...state,
        funds: state.funds.map((f: Fund) =>
          f.id === action.fundId
            ? {
                ...f,
                fetchedCagr1Y: action.cagr.cagr1Y,
                fetchedCagr3Y: action.cagr.cagr3Y,
                fetchedCagr5Y: action.cagr.cagr5Y,
                fetchedCagr10Y: action.cagr.cagr10Y,
                latestNav: action.cagr.latestNav,
                isFetchingCagr: false,
                isReturnFromApi: action.autoSetReturn !== null,
                expectedReturn: action.autoSetReturn !== null ? action.autoSetReturn : f.expectedReturn,
              }
            : f
        ),
      };

    case "SET_FUND_FETCHING":
      return {
        ...state,
        funds: state.funds.map((f: Fund) =>
          f.id === action.fundId ? { ...f, isFetchingCagr: action.fetching } : f
        ),
      };

    case "LOAD_STATE":
      return hydrateState(action.state);

    case "RESET":
      return DEFAULT_PORTFOLIO_STATE;

    default:
      return state;
  }
}

interface PortfolioContextValue {
  state: PortfolioState;
  dispatch: React.Dispatch<PortfolioAction>;
}

const PortfolioContext = createContext<PortfolioContextValue | null>(null);

export function PortfolioProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(
    portfolioReducer,
    undefined,
    () => hydrateState(loadPortfolioState())
  );

  useEffect(() => {
    savePortfolioState(state);
  }, [state]);

  return (
    <PortfolioContext.Provider value={{ state, dispatch }}>
      {children}
    </PortfolioContext.Provider>
  );
}

export function usePortfolioContext(): PortfolioContextValue {
  const ctx = useContext(PortfolioContext);
  if (!ctx) {
    throw new Error("usePortfolioContext must be used within PortfolioProvider");
  }
  return ctx;
}
