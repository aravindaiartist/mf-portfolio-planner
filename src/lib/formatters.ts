// ──────────────────────────────────────────────────────────
// formatters.ts — Display formatting + unit conversion
// ──────────────────────────────────────────────────────────

/** Convert UI percentage (e.g. 18.8) to decimal (e.g. 0.188) */
export const toDecimal = (pct: number): number => pct / 100;

/** Convert decimal (e.g. 0.188) to UI percentage (e.g. 18.8) */
export const toPercent = (dec: number): number => dec * 100;

/** Format number in Indian locale (en-IN) with commas */
export const formatNumber = (
  n: number,
  decimals: number = 0
): string => {
  if (!isFinite(n)) return "—";
  return new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: decimals,
    minimumFractionDigits: decimals,
  }).format(n);
};

/** Format as ₹ with Indian grouping */
export const formatCurrency = (
  n: number,
  decimals: number = 0
): string => {
  if (!isFinite(n)) return "—";
  return `₹${formatNumber(n, decimals)}`;
};

/** Format large amounts as ₹X.XX Cr or ₹X.XX L — always use compact notation */
export const formatCurrencyCompact = (n: number): string => {
  if (!isFinite(n)) return "—";
  if (n === 0) return "₹0";
  if (Math.abs(n) >= 1e7) return `₹${(n / 1e7).toFixed(2)} Cr`;
  if (Math.abs(n) >= 1e5) return `₹${(n / 1e5).toFixed(2)} L`;
  // For values below 1L, show as decimal lakhs (e.g., ₹28,527 → ₹0.29 L)
  if (Math.abs(n) >= 1000) return `₹${(n / 1e5).toFixed(2)} L`;
  return formatCurrency(n);
};

/** Format a UI percentage value for display: "18.8%" */
export const formatPercent = (
  uiPct: number,
  decimals: number = 1
): string => {
  if (!isFinite(uiPct)) return "—";
  return `${uiPct.toFixed(decimals)}%`;
};

/** Format a decimal value as percentage for display: 0.188 → "18.8%" */
export const formatDecimalAsPercent = (
  dec: number,
  decimals: number = 1
): string => {
  if (!isFinite(dec)) return "—";
  return `${(dec * 100).toFixed(decimals)}%`;
};
