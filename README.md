# Mutual Fund Investment Planner

Personal SIP portfolio calculator and financial planning dashboard for Indian mutual fund investors. Built with React 18, TypeScript, Tailwind CSS, and Recharts.

**Live URL:** *(deploy to Vercel — see instructions below)*
**Status:** V1A complete · V1B in progress

---

## What This App Does

Define your mutual fund portfolio with allocation percentages, enter a monthly SIP amount, and instantly see:

- **Dashboard** — 5 KPI cards, allocation donut, 10-year wealth growth chart
- **SIP Calculator** — Editable fund table, auto-classification, core/satellite split
- **Estimated Returns** — Per-fund 3Y/5Y/10Y projections with portfolio totals
- **Step-Up vs Flat** — Year-by-year comparison table and chart showing step-up advantage
- **Scenarios** — Compare allocations across different SIP amounts (₹20K/30K/40K/50K)
- **LTCG Tax Impact** — Portfolio-level tax projection + illustrative per-fund breakdown
- **Inflation View** — Real purchasing power erosion year-by-year

All computation happens client-side. No backend, no database, no API keys. Your data is saved in your browser's localStorage.

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | React 18 |
| Language | TypeScript (strict) |
| Build | Vite |
| Styling | Tailwind CSS 3.x |
| Charts | Recharts |
| Icons | Lucide React |
| State | React Context + useReducer |
| Persistence | localStorage |
| Deployment | Vercel |

---

## Prerequisites

| Tool | Version |
|---|---|
| Node.js | ≥ 18.x |
| pnpm | ≥ 8.x |

Install pnpm if you don't have it:
```bash
npm install -g pnpm
```

---

## Local Development

### Step 1: Clone / download the project
```bash
cd mf-investment-planner
```

### Step 2: Install dependencies
```bash
pnpm install
```

### Step 3: Start the dev server
```bash
pnpm dev
```

Open `http://localhost:5173` in your browser.

---

## Build for Production

```bash
pnpm build
```

Output lands in `dist/`. It's a standard Vite SPA build.

---

## Deploy to Vercel

### Option A: Via GitHub (recommended)

1. Push this repo to GitHub
2. Go to [vercel.com](https://vercel.com) → Import Project → Select your repo
3. Vercel auto-detects Vite. Click Deploy.
4. Done. Your app is live.

### Option B: Via Vercel CLI

```bash
npm i -g vercel
vercel
```

The `vercel.json` file is already configured with the SPA rewrite rule.

---

## Project Structure

```
src/
├── sections/           # Each section = one scrollable block
│   ├── DashboardSection.tsx
│   ├── SipCalculatorSection.tsx
│   ├── EstimatedReturnsSection.tsx
│   ├── StepUpSection.tsx
│   ├── ScenariosSection.tsx
│   ├── TaxImpactSection.tsx
│   ├── InflationSection.tsx
│   └── (V1B stubs: Goal, Tracker, Rebalancing, Details, Settings)
├── components/
│   ├── layout/         # StickyNav, SectionWrapper, KpiCard
│   ├── fund/           # FundAllocationTable, FundRowEditor, SummaryBar
│   └── charts/         # WealthGrowthChart, AllocationDonut, ProjectionBarChart
├── lib/
│   ├── calc/           # Pure calculation functions (sipFV, ltcgTax, inflation, etc.)
│   ├── types.ts        # All TypeScript interfaces with unit annotations
│   ├── constants.ts    # Default funds, section IDs, chart colors
│   ├── formatters.ts   # ₹ formatting, toDecimal/toPercent conversions
│   ├── validators.ts   # Input validation rules
│   └── storage.ts      # localStorage read/write
├── hooks/
│   ├── usePortfolio.ts # Central derived computations
│   └── useActiveSection.ts # IntersectionObserver for nav
├── context/
│   └── PortfolioContext.tsx # State provider + reducer
├── App.tsx             # Layout — renders all sections
├── main.tsx            # React entry
└── index.css           # Tailwind + design tokens
```

---

## Key Design Decisions

- **Single-page dashboard** — no router. All sections scroll vertically with sticky nav.
- **UI percentages vs decimal internals** — user sees 18.8%, code computes with 0.188. Conversion happens at call boundary via `toDecimal()`.
- **Chart totals = sum of per-fund** — never the weighted-average shortcut. Avoids mismatch.
- **LTCG primary = portfolio-level** — single exemption pool. Per-fund is labeled illustrative.
- **Auto-classifier is prefill only** — bucket/style are always manually editable dropdowns.
- **Validation is non-blocking** — amber warnings, never prevents the user from seeing results.

---

## V1B Roadmap

Features with "Coming Soon" stubs, to be built next:

- Goal Planner (reverse SIP calculator)
- Portfolio Tracker (monthly performance log with localStorage)
- Rebalancing Alerts (drift detection with BUY/SELL/HOLD signals)
- Fund Details (ISINs, expense ratios, platform links)
- Settings (JSON export/import, reset)

---

## License

Personal use. Not yet publicly licensed.
