// ─────────────────────────────────────────────────
// scan-final.mjs — Complete line-by-line project scan
// Run: node scan-final.mjs
// READ-ONLY — does not modify any files.
// ─────────────────────────────────────────────────

import { readFileSync, existsSync, readdirSync } from "fs";
import { join } from "path";

let passed = 0;
let failed = 0;
const issues = [];

function check(label, condition) {
  if (condition) { passed++; }
  else { failed++; issues.push(label); console.log("  X " + label); }
}

function exists(p) { return existsSync(p); }
function read(p) { return existsSync(p) ? readFileSync(p, "utf-8") : ""; }
function has(p, t) { return read(p).includes(t); }
function notHas(p, t) { return !read(p).includes(t); }

console.log("\n=== COMPLETE PROJECT SCAN ===\n");

// ══════════════════════════════════════
// A. FILES THAT MUST EXIST
// ══════════════════════════════════════
console.log("-- A. Required Files --");
const requiredFiles = [
  "index.html", "package.json", "tsconfig.json", "vite.config.ts",
  "tailwind.config.ts", "postcss.config.js", "vercel.json", "README.md",
  "src/App.tsx", "src/main.tsx", "src/index.css",
  "src/lib/types.ts", "src/lib/constants.ts", "src/lib/formatters.ts",
  "src/lib/validators.ts", "src/lib/storage.ts", "src/lib/utils.ts", "src/lib/mfapi.ts",
  "src/lib/calc/autoAllocate.ts", "src/lib/calc/cagrFromNav.ts",
  "src/lib/calc/classifier.ts", "src/lib/calc/inflation.ts",
  "src/lib/calc/ltcgTax.ts", "src/lib/calc/rebalancing.ts",
  "src/lib/calc/reverseSip.ts", "src/lib/calc/riskLevel.ts",
  "src/lib/calc/sipFV.ts", "src/lib/calc/weightedCagr.ts",
  "src/lib/data/staticFundIndex.ts",
  "src/lib/data/staticFundIndex_part1.ts", "src/lib/data/staticFundIndex_part2.ts",
  "src/lib/data/staticFundIndex_part3.ts", "src/lib/data/staticFundIndex_part4.ts",
  "src/context/PortfolioContext.tsx",
  "src/hooks/usePortfolio.ts", "src/hooks/useActiveSection.ts",
  "src/hooks/useFetchCagr.ts", "src/hooks/useAnimatedNumber.ts",
  "src/components/layout/StickyNav.tsx", "src/components/layout/SectionWrapper.tsx",
  "src/components/layout/KpiCard.tsx",
  "src/components/fund/FundAllocationTable.tsx", "src/components/fund/FundRowEditor.tsx",
  "src/components/fund/FundSearchBox.tsx", "src/components/fund/PortfolioSummaryBar.tsx",
  "src/components/charts/AllocationDonut.tsx", "src/components/charts/WealthGrowthChart.tsx",
  "src/components/charts/ProjectionBarChart.tsx", "src/components/charts/FundAllocationPie.tsx",
  "src/sections/DashboardSection.tsx", "src/sections/SipCalculatorSection.tsx",
  "src/sections/EstimatedReturnsSection.tsx", "src/sections/StepUpSection.tsx",
  "src/sections/TaxImpactSection.tsx", "src/sections/InflationSection.tsx",
  "src/sections/RebalancingSection.tsx", "src/sections/SettingsSection.tsx",
];
requiredFiles.forEach(f => check(f, exists(f)));

// ══════════════════════════════════════
// B. FILES THAT MUST NOT EXIST
// ══════════════════════════════════════
console.log("\n-- B. Deleted Files --");
const deletedFiles = [
  "src/sections/GoalPlannerSection.tsx",
  "src/sections/TrackerSection.tsx",
  "src/sections/FundDetailsSection.tsx",
  "src/sections/ScenariosSection.tsx",
];
deletedFiles.forEach(f => check(f + " DELETED", !exists(f)));

// ══════════════════════════════════════
// C. DUPLICATE CASE STATEMENTS IN REDUCER
// ══════════════════════════════════════
console.log("\n-- C. Reducer Duplicate Check --");
const ctx = read("src/context/PortfolioContext.tsx");
const caseMatches = ctx.match(/case "([^"]+)":/g) || [];
const caseCounts = {};
caseMatches.forEach(c => { caseCounts[c] = (caseCounts[c] || 0) + 1; });
Object.entries(caseCounts).forEach(([caseName, count]) => {
  check("Reducer: " + caseName + " appears exactly once", count === 1);
});

// ══════════════════════════════════════
// D. TYPES — ALL REQUIRED FIELDS
// ══════════════════════════════════════
console.log("\n-- D. Types --");
const types = read("src/lib/types.ts");
[
  ["Fund: schemeCode", "schemeCode?:"],
  ["Fund: fetchedCagr1Y", "fetchedCagr1Y?:"],
  ["Fund: fetchedCagr3Y", "fetchedCagr3Y?:"],
  ["Fund: fetchedCagr5Y", "fetchedCagr5Y?:"],
  ["Fund: fetchedCagr10Y", "fetchedCagr10Y?:"],
  ["Fund: isReturnFromApi", "isReturnFromApi?:"],
  ["Fund: isFetchingCagr", "isFetchingCagr?:"],
  ["Fund: latestNav", "latestNav?:"],
  ["PortfolioState: cagrOverride", "cagrOverride?:"],
  ["PortfolioState: rebalanceEntries", "rebalanceEntries:"],
  ["RebalanceFundRow type", "export interface RebalanceFundRow"],
  ["RebalanceSnapshot type", "export interface RebalanceSnapshot"],
  ["Action: SET_FUND_CAGR", "SET_FUND_CAGR"],
  ["Action: SET_FUND_FETCHING", "SET_FUND_FETCHING"],
  ["Action: SET_CAGR_OVERRIDE", "SET_CAGR_OVERRIDE"],
  ["Action: SET_REBALANCE_ENTRY", "SET_REBALANCE_ENTRY"],
].forEach(([label, text]) => check(label, types.includes(text)));

// ══════════════════════════════════════
// E. CONSTANTS — CLEAN STATE
// ══════════════════════════════════════
console.log("\n-- E. Constants --");
const cnst = read("src/lib/constants.ts");
check("Has rebalanceEntries: {}", cnst.includes("rebalanceEntries: {},"));
check("Has schemeCode in default funds", cnst.includes("schemeCode: 122639"));
check("NO goalPlanner", !cnst.includes("goalPlanner"));
check("NO tracker:", !cnst.includes('tracker:'));
check("NO fundDetails", !cnst.includes("fundDetails"));
check("NO ScenarioTier", !cnst.includes("ScenarioTier"));
check("NO Goal in NAV_ITEMS", !cnst.includes('"Goal"'));
check("NO Tracker in NAV_ITEMS", !cnst.includes('"Tracker"'));
check("NO Fund Info in NAV_ITEMS", !cnst.includes('"Fund Info"'));

// ══════════════════════════════════════
// F. REDUCER — ALL HANDLERS (NO DUPLICATES)
// ══════════════════════════════════════
console.log("\n-- F. Reducer Handlers --");
const requiredCases = [
  "SET_FUNDS", "ADD_FUND", "UPDATE_FUND", "REMOVE_FUND",
  "SET_MONTHLY_SIP", "SET_STEP_UP_RATE", "SET_INFLATION_RATE",
  "SET_LTCG_EXEMPTION", "SET_LTCG_TAX_RATE",
  "SET_REBALANCE_ENTRY", "SET_CAGR_OVERRIDE",
  "SET_FUND_CAGR", "SET_FUND_FETCHING",
  "LOAD_STATE", "RESET",
];
requiredCases.forEach(c => check("Reducer has " + c, ctx.includes('case "' + c + '"')));
check("Reducer: autoAllocate imported", ctx.includes("autoAllocate"));
check("Reducer: hydrateState function", ctx.includes("hydrateState"));
check("Reducer: REMOVE_FUND cleans rebalanceEntries", ctx.includes("_removed"));
check("Reducer: LOAD_STATE uses hydrateState", ctx.includes("hydrateState(action.state)"));
check("Reducer: UPDATE_FUND detects bucket change", ctx.includes("bucketChanged"));

// ══════════════════════════════════════
// G. usePortfolio HOOK
// ══════════════════════════════════════
console.log("\n-- G. usePortfolio Hook --");
const hook = read("src/hooks/usePortfolio.ts");
check("Hook: destructures cagrOverride", hook.includes("cagrOverride"));
check("Hook: destructures rebalanceEntries", hook.includes("rebalanceEntries"));
check("Hook: computedWtdAvgCagr", hook.includes("computedWtdAvgCagr"));
check("Hook: isUsingCagrOverride", hook.includes("isUsingCagrOverride"));
check("Hook: cagrOverrideDecimal", hook.includes("cagrOverrideDecimal"));
check("Hook: fundProjections uses cagrOverrideDecimal", hook.includes("cagrOverrideDecimal ?? toDecimal(f.expectedReturn)"));
check("Hook: ltcgPerFund uses cagrOverrideDecimal", hook.includes("cagrOverrideDecimal ?? toDecimal(f.expectedReturn)"));
check("Hook: rebalanceFundRows", hook.includes("const rebalanceFundRows: RebalanceFundRow[]"));
check("Hook: rebalanceSnapshot", hook.includes("const rebalanceSnapshot: RebalanceSnapshot"));
check("Hook: imports computeRebalancing", hook.includes("computeRebalancing"));
check("Hook: imports toPercent", hook.includes("toPercent"));
check("Hook: NO duplicate toPercent", !hook.includes("toPercent, toPercent"));
check("Hook: returns computedWtdAvgCagr", hook.includes("computedWtdAvgCagr,"));
check("Hook: returns isUsingCagrOverride", hook.includes("isUsingCagrOverride,"));
check("Hook: returns rebalanceFundRows", hook.includes("rebalanceFundRows,"));
check("Hook: returns rebalanceSnapshot", hook.includes("rebalanceSnapshot,"));

// Check only 1 return { state, dispatch...
const hookReturns = hook.match(/return \{\s*\n\s*state,/g) || [];
check("Hook: exactly 1 main return statement", hookReturns.length === 1);

// ══════════════════════════════════════
// H. APP.TSX
// ══════════════════════════════════════
console.log("\n-- H. App.tsx --");
const app = read("src/App.tsx");
check("App: AppInner component", app.includes("function AppInner"));
check("App: prewarmLiveIndex", app.includes("prewarmLiveIndex"));
check("App: useFetchCagr", app.includes("useFetchCagr"));
check("App: DashboardSection", app.includes("DashboardSection"));
check("App: SipCalculatorSection", app.includes("SipCalculatorSection"));
check("App: EstimatedReturnsSection", app.includes("EstimatedReturnsSection"));
check("App: StepUpSection", app.includes("StepUpSection"));
check("App: TaxImpactSection", app.includes("TaxImpactSection"));
check("App: InflationSection", app.includes("InflationSection"));
check("App: RebalancingSection", app.includes("RebalancingSection"));
check("App: SettingsSection", app.includes("SettingsSection"));
check("App: NO GoalPlannerSection", !app.includes("GoalPlannerSection"));
check("App: NO TrackerSection", !app.includes("TrackerSection"));
check("App: NO FundDetailsSection", !app.includes("FundDetailsSection"));
check("App: NO ScenariosSection", !app.includes("ScenariosSection"));
check("App: Disclaimer text", app.includes("SEBI-registered investment"));
check("App: Footer Aravindan", app.includes("Aravindan Natarajan"));
check("App: Footer mfapi.in", app.includes("mfapi.in"));
check("App: Footer Personal Use", app.includes("Personal Use Only"));

// ══════════════════════════════════════
// I. STICKYNAV
// ══════════════════════════════════════
console.log("\n-- I. StickyNav --");
const navFile = read("src/components/layout/StickyNav.tsx");
check("Nav: brand name 'Mutual Fund Investment Planner'", navFile.includes("Mutual Fund Investment Planner"));
check("Nav: Home button", navFile.includes("Home"));
check("Nav: ExternalLink import", navFile.includes("ExternalLink"));
check("Nav: Analysis link URL", navFile.includes("mf-analysis-platform.vercel.app"));
check("Nav: Analysis text 'Mutual Fund Analysis'", navFile.includes("Mutual Fund Analysis"));
check("Nav: same font as brand (font-display font-bold text-[15px])", navFile.includes('font-display font-bold text-[15px]'));
check("Nav: NO Pencil import", !navFile.includes("Pencil"));
check("Nav: NO duplicate case", (() => {
  const cases = navFile.match(/case "/g) || [];
  return cases.length === 0; // nav has no switch cases
})());

// ══════════════════════════════════════
// J. FUND COMPONENTS
// ══════════════════════════════════════
console.log("\n-- J. Fund Components --");
const editor = read("src/components/fund/FundRowEditor.tsx");
check("FundRowEditor: Pencil import", editor.includes("Pencil"));
check("FundRowEditor: ExternalLink import", editor.includes("ExternalLink"));
check("FundRowEditor: Analyze link", editor.includes("Analyze"));
check("FundRowEditor: mf-analysis-platform URL", editor.includes("mf-analysis-platform.vercel.app"));
check("FundRowEditor: getRiskLevel import", editor.includes("getRiskLevel"));
check("FundRowEditor: getCategoryColor import", editor.includes("getCategoryColor"));
check("FundRowEditor: Live badge", editor.includes("Live"));
check("FundRowEditor: Loader2 spinner", editor.includes("Loader2"));
check("FundRowEditor: fund name NOT editable (no renderEditableCell for name)", !editor.includes('renderEditableCell("name"'));
check("FundRowEditor: group/row for hover", editor.includes("group/row"));

const table = read("src/components/fund/FundAllocationTable.tsx");
check("FundAllocationTable: FundSearchBox import", table.includes("FundSearchBox"));
check("FundAllocationTable: useFetchCagr import", table.includes("useFetchCagr"));
check("FundAllocationTable: totalAllocation", table.includes("totalAllocation"));
check("FundAllocationTable: totalSip", table.includes("totalSip"));
check("FundAllocationTable: Total row", table.includes("Total ("));
check("FundAllocationTable: 'Add or replace funds' label", table.includes("Add or replace funds"));

check("FundSearchBox exists", exists("src/components/fund/FundSearchBox.tsx"));
check("FundAllocationPie exists", exists("src/components/charts/FundAllocationPie.tsx"));

// ══════════════════════════════════════
// K. KPI + ANIMATION
// ══════════════════════════════════════
console.log("\n-- K. KPI Cards + Animation --");
const kpi = read("src/components/layout/KpiCard.tsx");
check("KpiCard: tooltip prop", kpi.includes("tooltip?:"));
check("KpiCard: group-hover tooltip", kpi.includes("group-hover/tip"));
check("KpiCard: animateValue prop", kpi.includes("animateValue?:"));
check("KpiCard: useAnimatedNumber import", kpi.includes("useAnimatedNumber"));
check("useAnimatedNumber hook exists", has("src/hooks/useAnimatedNumber.ts", "export function useAnimatedNumber"));

// ══════════════════════════════════════
// L. DASHBOARD
// ══════════════════════════════════════
console.log("\n-- L. Dashboard --");
const dash = read("src/sections/DashboardSection.tsx");
check("Dashboard: editingCagr state", dash.includes("editingCagr"));
check("Dashboard: Custom badge", dash.includes("Custom"));
check("Dashboard: resetCagr", dash.includes("resetCagr"));
check("Dashboard: SET_CAGR_OVERRIDE dispatch", dash.includes("SET_CAGR_OVERRIDE"));
check("Dashboard: Pencil import", dash.includes("Pencil"));
check("Dashboard: tooltip on Monthly SIP", dash.includes("tooltip="));
check("Dashboard: animateValue on KPI", dash.includes("animateValue="));
check("Dashboard: 10Y Corpus (Flat SIP) card", dash.includes("10Y Corpus (Flat SIP)"));
check("Dashboard: 10Y Corpus (Step-Up) card", dash.includes("10Y Corpus (Step-Up)"));
check("Dashboard: Lightbulb summary", dash.includes("What this means for you"));
check("Dashboard: isUsingCagrOverride in summary", dash.includes("isUsingCagrOverride"));

// ══════════════════════════════════════
// M. ESTIMATED RETURNS
// ══════════════════════════════════════
console.log("\n-- M. Estimated Returns --");
const est = read("src/sections/EstimatedReturnsSection.tsx");
check("EstReturns: editable CAGR state", est.includes("editingCagr"));
check("EstReturns: dispatch imported", est.includes("dispatch"));
check("EstReturns: isUsingCagrOverride", est.includes("isUsingCagrOverride"));
check("EstReturns: computedWtdAvgCagr", est.includes("computedWtdAvgCagr"));
check("EstReturns: SET_CAGR_OVERRIDE", est.includes("SET_CAGR_OVERRIDE"));
check("EstReturns: Pencil icon", est.includes("Pencil"));
check("EstReturns: category tags", est.includes("getCategoryColor"));
check("EstReturns: risk tags", est.includes("getRiskLevel"));
check("EstReturns: NO Analyze link (removed)", !est.includes("mf-analysis-platform"));

// ══════════════════════════════════════
// N. SIP CALCULATOR
// ══════════════════════════════════════
console.log("\n-- N. SIP Calculator --");
const sip = read("src/sections/SipCalculatorSection.tsx");
check("SipCalc: Pencil import", sip.includes("Pencil"));
check("SipCalc: Clear SIP button", sip.includes("Clear SIP"));
check("SipCalc: FundAllocationPie import", sip.includes("FundAllocationPie"));
check("SipCalc: Pie chart rendered", sip.includes("<FundAllocationPie"));

// ══════════════════════════════════════
// O. REBALANCING
// ══════════════════════════════════════
console.log("\n-- O. Rebalancing --");
const reb = read("src/sections/RebalancingSection.tsx");
check("Rebalancing: usePortfolio import", reb.includes("usePortfolio"));
check("Rebalancing: KPI cards", reb.includes("Total Portfolio Value"));
check("Rebalancing: BUY/SELL/HOLD", reb.includes("actionBadgeClass"));
check("Rebalancing: drift bar", reb.includes("driftBarClass"));
check("Rebalancing: SET_REBALANCE_ENTRY", reb.includes("SET_REBALANCE_ENTRY"));
check("Rebalancing: methodology note", reb.includes("Methodology"));

// ══════════════════════════════════════
// P. SETTINGS
// ══════════════════════════════════════
console.log("\n-- P. Settings --");
const settings = read("src/sections/SettingsSection.tsx");
check("Settings: Export button", settings.includes("Export as JSON"));
check("Settings: Import button", settings.includes("Import JSON Backup"));
check("Settings: Reset button", settings.includes("Reset Everything"));
check("Settings: Reset confirmation", settings.includes("Are you sure"));
check("Settings: exportAllData", settings.includes("exportAllData"));

// ══════════════════════════════════════
// Q. STORAGE — EXPORT/RESET FUNCTIONS
// ══════════════════════════════════════
console.log("\n-- Q. Storage --");
const storage = read("src/lib/storage.ts");
check("Storage: exportAllData function", storage.includes("exportAllData"));
check("Storage: resetAllData function", storage.includes("resetAllData"));
check("Storage: loadPortfolioState function", storage.includes("loadPortfolioState"));
check("Storage: savePortfolioState function", storage.includes("savePortfolioState"));

// ══════════════════════════════════════
// R. CROSS-FILE IMPORT SCAN
// ══════════════════════════════════════
console.log("\n-- R. Orphaned Imports --");
const allSrcFiles = [];
function walkDir(dir) {
  if (!existsSync(dir)) return;
  const entries = readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = join(dir, e.name);
    if (e.isDirectory() && e.name !== "node_modules" && e.name !== "data") {
      walkDir(full);
    } else if (e.isFile() && (e.name.endsWith(".ts") || e.name.endsWith(".tsx"))) {
      allSrcFiles.push(full);
    }
  }
}
walkDir("src");

const deletedModules = ["GoalPlannerSection", "TrackerSection", "FundDetailsSection", "ScenariosSection"];
for (const f of allSrcFiles) {
  const content = read(f);
  for (const mod of deletedModules) {
    check(f + ": no import of " + mod, !content.includes(mod));
  }
}

// ══════════════════════════════════════
// S. SYNTAX RED FLAGS
// ══════════════════════════════════════
console.log("\n-- S. Syntax Checks --");

// Check for duplicate imports in any file
for (const f of allSrcFiles) {
  const content = read(f);
  const importLines = content.match(/^import .+ from .+;$/gm) || [];
  const seen = new Set();
  for (const imp of importLines) {
    if (seen.has(imp)) {
      check(f + ": no duplicate import (" + imp.slice(0, 50) + "...)", false);
    }
    seen.add(imp);
  }
}

// Check no "Coming soon" or "Coming in V1B" text
for (const f of allSrcFiles) {
  const content = read(f);
  check(f + ": no 'Coming soon'", !content.includes("Coming soon") && !content.includes("coming soon"));
  check(f + ": no 'Coming in V1B'", !content.includes("Coming in V1B"));
}

// ══════════════════════════════════════
// T. DEPLOYMENT
// ══════════════════════════════════════
console.log("\n-- T. Deployment --");
check("vercel.json: SPA rewrite", has("vercel.json", '"destination": "/index.html"'));
check("package.json: build script", has("package.json", '"build"'));
check("package.json: dev script", has("package.json", '"dev"'));
check("index.html: title", has("index.html", "Mutual Fund Investment Planner") || has("index.html", "MF Investment Planner"));

// ══════════════════════════════════════
// U. APP NAME CONSISTENCY
// ══════════════════════════════════════
console.log("\n-- U. App Name --");
check("Nav: Mutual Fund Investment Planner", navFile.includes("Mutual Fund Investment Planner"));
check("Nav: Mutual Fund Analysis link", navFile.includes("Mutual Fund Analysis"));
check("Settings: correct app name", settings.includes("Mutual Fund Investment Planner") || settings.includes("MF Investment Planner"));

// ══════════════════════════════════════
// SUMMARY
// ══════════════════════════════════════
console.log("\n" + "=".repeat(55));
console.log("  PASSED: " + passed);
console.log("  FAILED: " + failed);
console.log("=".repeat(55));

if (failed > 0) {
  console.log("\nISSUES FOUND:");
  issues.forEach((issue, i) => {
    console.log("  " + (i + 1) + ". " + issue);
  });
  console.log("\nFix these before deploying.\n");
} else {
  console.log("\nALL CHECKS PASSED — Ready to deploy!\n");
  console.log("Next steps:");
  console.log("  1. pnpm build");
  console.log("  2. git init");
  console.log("  3. git add .");
  console.log('  4. git commit -m "V1: Mutual Fund Investment Planner"');
  console.log("  5. Create repo on github.com -> copy URL");
  console.log("  6. git remote add origin <url>");
  console.log("  7. git branch -M main");
  console.log("  8. git push -u origin main");
  console.log("  9. vercel.com -> Import from GitHub -> Deploy");
  console.log("");
}

console.log("Delete this script: Remove-Item scan-final.mjs\n");
