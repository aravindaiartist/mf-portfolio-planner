import { useState, useCallback, useRef, useEffect } from "react";
import { searchFunds, type MfSearchResult } from "@/lib/mfapi";
import { Search, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface FundSearchBoxProps {
  onSelect: (result: MfSearchResult) => void;
  placeholder?: string;
}

export function FundSearchBox({ onSelect, placeholder = "Search funds (e.g. Parag Parikh, SBI Small Cap)..." }: FundSearchBoxProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<MfSearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [highlightIdx, setHighlightIdx] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  // Debounced search
  const doSearch = useCallback(async (q: string) => {
    if (q.trim().length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }
    setIsSearching(true);
    const res = await searchFunds(q);
    setResults(res);
    setIsOpen(res.length > 0);
    setHighlightIdx(-1);
    setIsSearching(false);
  }, []);

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
    setIsOpen(false);
    inputRef.current?.blur();
  }, [onSelect]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!isOpen) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightIdx((prev) => Math.min(prev + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightIdx((prev) => Math.max(prev - 1, 0));
    } else if (e.key === "Enter" && highlightIdx >= 0) {
      e.preventDefault();
      handleSelect(results[highlightIdx]);
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  }, [isOpen, results, highlightIdx, handleSelect]);

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
    <div className="relative">
      {/* Search input */}
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => { if (results.length > 0) setIsOpen(true); }}
          placeholder={placeholder}
          className="w-full bg-navy-800/50 border border-glass-border rounded-lg pl-9 pr-9 py-2.5 text-sm text-slate-200 placeholder:text-slate-600 outline-none focus:border-accent/50 transition-colors"
        />
        {isSearching && (
          <Loader2 size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-accent animate-spin" />
        )}
        {!isSearching && query && (
          <button
            onClick={() => { setQuery(""); setResults([]); setIsOpen(false); }}
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
          {results.map((r, idx) => (
            <button
              key={r.schemeCode}
              data-fund-item
              onClick={() => handleSelect(r)}
              className={cn(
                "w-full text-left px-3 py-2 flex items-center justify-between gap-2 text-sm transition-colors",
                idx === highlightIdx
                  ? "bg-accent/10 text-slate-100"
                  : "text-slate-300 hover:bg-white/[0.04]",
                idx !== results.length - 1 && "border-b border-glass-border/50"
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
          ))}
        </div>
      )}
    </div>
  );
}
