import { useState, useCallback, useRef, useEffect } from "react";
import { searchFunds, type MfSearchResult } from "@/lib/mfapi";
import { Search, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const CATEGORY_OPTIONS = [
  { value: "", label: "All Categories" },
  { value: "large cap", label: "Large Cap" },
  { value: "mid cap", label: "Mid Cap" },
  { value: "small cap", label: "Small Cap" },
  { value: "flexi", label: "Flexi Cap" },
  { value: "multi", label: "Multi Cap" },
  { value: "index", label: "Index Fund" },
  { value: "debt", label: "Debt Fund" },
  { value: "elss", label: "ELSS / Tax Saver" },
  { value: "hybrid", label: "Hybrid / Balanced" },
  { value: "international", label: "International" },
  { value: "sectoral", label: "Sectoral / Thematic" },
];

const PLAN_OPTIONS = [
  { value: "", label: "All Plans" },
  { value: "direct", label: "Direct" },
  { value: "regular", label: "Regular" },
];

const PERIOD_OPTIONS = [
  { value: "3", label: "3Y CAGR" },
  { value: "5", label: "5Y CAGR" },
  { value: "10", label: "10Y CAGR" },
];

interface FundSearchBoxProps {
  onSelect: (result: MfSearchResult) => void;
  placeholder?: string;
  onPeriodChange?: (period: string) => void;
  selectedPeriod?: string;
}

export function FundSearchBox({
  onSelect,
  placeholder = "Search funds (e.g. Parag Parikh, SBI Small Cap)...",
  onPeriodChange,
  selectedPeriod = "5",
}: FundSearchBoxProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<MfSearchResult[]>([]);
  const [filteredResults, setFilteredResults] = useState<MfSearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [highlightIdx, setHighlightIdx] = useState(-1);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [planFilter, setPlanFilter] = useState("direct");
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  // Apply filters to results
  const applyFilters = useCallback((rawResults: MfSearchResult[], cat: string, plan: string) => {
    let filtered = rawResults;

    // Category filter
    if (cat) {
      filtered = filtered.filter((r) => {
        const name = r.schemeName.toLowerCase();
        return name.includes(cat.toLowerCase());
      });
    }

    // Plan type filter
    if (plan === "direct") {
      filtered = filtered.filter((r) => r.isDirect || /direct/i.test(r.schemeName));
    } else if (plan === "regular") {
      filtered = filtered.filter((r) => !r.isDirect && !/direct/i.test(r.schemeName));
    }

    return filtered;
  }, []);

  // Debounced search
  const doSearch = useCallback(async (q: string) => {
    if (q.trim().length < 2) {
      setResults([]);
      setFilteredResults([]);
      setIsOpen(false);
      return;
    }
    setIsSearching(true);
    const res = await searchFunds(q);
    setResults(res);
    const filtered = applyFilters(res, categoryFilter, planFilter);
    setFilteredResults(filtered);
    setIsOpen(filtered.length > 0);
    setHighlightIdx(-1);
    setIsSearching(false);
  }, [applyFilters, categoryFilter, planFilter]);

  // Re-filter when category or plan changes
  useEffect(() => {
    if (results.length > 0) {
      const filtered = applyFilters(results, categoryFilter, planFilter);
      setFilteredResults(filtered);
      setIsOpen(filtered.length > 0);
      setHighlightIdx(-1);
    }
  }, [categoryFilter, planFilter, results, applyFilters]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(val), 150);
  }, [doSearch]);

  const handleSelect = useCallback((result: MfSearchResult) => {
    onSelect(result);
    setQuery("");
    setResults([]);
    setFilteredResults([]);
    setIsOpen(false);
    inputRef.current?.blur();
  }, [onSelect]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!isOpen) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightIdx((prev) => Math.min(prev + 1, filteredResults.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightIdx((prev) => Math.max(prev - 1, 0));
    } else if (e.key === "Enter" && highlightIdx >= 0) {
      e.preventDefault();
      handleSelect(filteredResults[highlightIdx]);
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  }, [isOpen, filteredResults, highlightIdx, handleSelect]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node) &&
          inputRef.current && !inputRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Scroll highlighted item into view
  useEffect(() => {
    if (highlightIdx >= 0 && dropdownRef.current) {
      const items = dropdownRef.current.querySelectorAll("[data-fund-item]");
      items[highlightIdx]?.scrollIntoView({ block: "nearest" });
    }
  }, [highlightIdx]);

  return (
    <div>
      {/* Filter controls */}
      <div className="flex flex-wrap gap-2 mb-3">
        {/* Category */}
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="bg-navy-800/60 border border-glass-border rounded-lg px-3 py-1.5 text-xs text-slate-300 outline-none focus:border-accent/50 cursor-pointer"
        >
          {CATEGORY_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-navy-800">
              {opt.label}
            </option>
          ))}
        </select>

        {/* Plan Type */}
        <div className="flex items-center gap-0.5 bg-navy-800/60 border border-glass-border rounded-lg p-0.5">
          {PLAN_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setPlanFilter(opt.value)}
              className={cn(
                "px-3 py-1 rounded-md text-xs font-medium transition-colors",
                planFilter === opt.value
                  ? "bg-accent/15 text-accent"
                  : "text-slate-500 hover:text-slate-300"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Period */}
        <div className="flex items-center gap-0.5 bg-navy-800/60 border border-glass-border rounded-lg p-0.5">
          {PERIOD_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => onPeriodChange?.(opt.value)}
              className={cn(
                "px-3 py-1 rounded-md text-xs font-medium transition-colors",
                selectedPeriod === opt.value
                  ? "bg-sky-500/15 text-sky-400"
                  : "text-slate-500 hover:text-slate-300"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Search input */}
      <div className="relative">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => { if (filteredResults.length > 0) setIsOpen(true); }}
            placeholder={placeholder}
            className="w-full bg-navy-800/50 border border-glass-border rounded-lg pl-9 pr-9 py-2.5 text-sm text-slate-200 placeholder:text-slate-600 outline-none focus:border-accent/50 transition-colors"
          />
          {isSearching && (
            <Loader2 size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-accent animate-spin" />
          )}
          {!isSearching && query && (
            <button
              onClick={() => { setQuery(""); setResults([]); setFilteredResults([]); setIsOpen(false); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Dropdown results */}
        {isOpen && (
          <div
            ref={dropdownRef}
            className="absolute z-50 top-full left-0 right-0 mt-1 bg-navy-800 border border-glass-border rounded-lg shadow-2xl shadow-black/40 max-h-72 overflow-y-auto"
          >
            {filteredResults.length === 0 ? (
              <div className="px-3 py-4 text-center text-xs text-slate-500">
                No funds match your filters. Try changing category or plan type.
              </div>
            ) : (
              filteredResults.map((r, idx) => (
                <button
                  key={r.schemeCode}
                  data-fund-item
                  onClick={() => handleSelect(r)}
                  className={cn(
                    "w-full text-left px-3 py-2 flex items-center justify-between gap-2 text-sm transition-colors",
                    idx === highlightIdx
                      ? "bg-accent/10 text-slate-100"
                      : "text-slate-300 hover:bg-white/[0.04]",
                    idx !== filteredResults.length - 1 && "border-b border-glass-border/50"
                  )}
                >
                  <div className="flex-1 min-w-0">
                    <span className="block truncate">{r.schemeName}</span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      Code: {r.schemeCode}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    {r.isDirect && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-accent/10 text-accent font-medium">
                        Direct
                      </span>
                    )}
                    {r.isGrowth && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-sky-500/10 text-sky-400 font-medium">
                        Growth
                      </span>
                    )}
                  </div>
                </button>
              ))
            )}
          </div>
        )}
      </div>

      {/* Active filter summary */}
      {(categoryFilter || planFilter) && (
        <div className="flex items-center gap-2 mt-2">
          <span className="text-[10px] text-slate-600">Filters:</span>
          {categoryFilter && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-accent/10 text-accent">
              {CATEGORY_OPTIONS.find((c) => c.value === categoryFilter)?.label}
            </span>
          )}
          {planFilter && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-sky-500/10 text-sky-400">
              {PLAN_OPTIONS.find((p) => p.value === planFilter)?.label}
            </span>
          )}
          <button
            onClick={() => { setCategoryFilter(""); setPlanFilter(""); }}
            className="text-[10px] text-slate-600 hover:text-slate-400 transition-colors"
          >
            Clear all
          </button>
        </div>
      )}
    </div>
  );
}
