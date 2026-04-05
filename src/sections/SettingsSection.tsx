import { useState, useCallback, useRef } from "react";
import { SECTION_IDS } from "@/lib/constants";
import { SectionWrapper } from "@/components/layout/SectionWrapper";
import { usePortfolioContext } from "@/context/PortfolioContext";
import { exportAllData, resetAllData } from "@/lib/storage";
import {
  Download,
  Upload,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  FileJson,
  Settings,
} from "lucide-react";

export function SettingsSection() {
  const { dispatch } = usePortfolioContext();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [exportStatus, setExportStatus] = useState<string | null>(null);
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // ── Export ──
  const handleExport = useCallback(() => {
    try {
      const json = exportAllData();
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `mf-investment-planner-backup-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setExportStatus("Data exported successfully.");
      setTimeout(() => setExportStatus(null), 3000);
    } catch {
      setExportStatus("Export failed.");
    }
  }, []);

  // ── Import ──
  const handleImport = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileSelected = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = event.target?.result as string;
        const data = JSON.parse(json);

        if (data.portfolio && data.portfolio.funds) {
          dispatch({ type: "LOAD_STATE", state: data.portfolio });
          setImportStatus("Data imported successfully. Page will refresh.");
          setTimeout(() => window.location.reload(), 1500);
        } else {
          setImportStatus("Invalid file format. Expected MF Planner backup JSON.");
        }
      } catch {
        setImportStatus("Failed to read file. Is it a valid JSON?");
      }
    };
    reader.readAsText(file);
    // Reset input so same file can be re-selected
    e.target.value = "";
  }, [dispatch]);

  // ── Reset ──
  const handleReset = useCallback(() => {
    resetAllData();
    dispatch({ type: "RESET" });
    setShowResetConfirm(false);
    window.location.reload();
  }, [dispatch]);

  return (
    <SectionWrapper
      id={SECTION_IDS.settings}
      title="Settings"
      description="Export your data for backup, import a previous backup, or reset to defaults."
      icon={<Settings size={20} />}
      accent="purple"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Export */}
        <div className="relative flex flex-col h-full rounded-[2rem] p-6 overflow-visible transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', boxShadow: '-2px -2px 6px rgba(255,255,255,0.04), 4px 4px 12px rgba(0,0,0,0.5), inset 1px 1px 3px rgba(255,255,255,0.08)', backdropFilter: 'blur(16px)' }}>
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-accent rounded-t-[2rem] opacity-30" />
          <div className="flex items-center gap-2 mb-3">
            <Download size={18} className="text-accent" />
            <h3 className="text-sm font-semibold text-slate-200">Export Data</h3>
          </div>
          <p className="text-xs text-slate-500 mb-4 leading-relaxed flex-grow">
            Download all your portfolio data as a JSON file. Use this to back up
            your funds, allocations, rebalancing values, and settings.
          </p>
          <button
            onClick={handleExport}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-accent/10 text-accent text-sm font-medium hover:bg-accent/20 transition-colors"
          >
            <FileJson size={14} />
            Export as JSON
          </button>
          {exportStatus && (
            <p className="mt-2 text-xs text-accent flex items-center gap-1">
              <CheckCircle2 size={12} /> {exportStatus}
            </p>
          )}
        </div>

        {/* Import */}
        <div className="relative flex flex-col h-full rounded-[2rem] p-6 overflow-visible transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', boxShadow: '-2px -2px 6px rgba(255,255,255,0.04), 4px 4px 12px rgba(0,0,0,0.5), inset 1px 1px 3px rgba(255,255,255,0.08)', backdropFilter: 'blur(16px)' }}>
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-sky-500 rounded-t-[2rem] opacity-30" />
          <div className="flex items-center gap-2 mb-3">
            <Upload size={18} className="text-sky-400" />
            <h3 className="text-sm font-semibold text-slate-200">Import Data</h3>
          </div>
          <p className="text-xs text-slate-500 mb-4 leading-relaxed flex-grow">
            Restore from a previously exported JSON backup file. This will
            replace all current data with the imported data.
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileSelected}
            className="hidden"
          />
          <button
            onClick={handleImport}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-sky-500/10 text-sky-400 text-sm font-medium hover:bg-sky-500/20 transition-colors"
          >
            <Upload size={14} />
            Import JSON Backup
          </button>
          {importStatus && (
            <p className="mt-2 text-xs text-amber-400 flex items-center gap-1">
              <AlertTriangle size={12} /> {importStatus}
            </p>
          )}
        </div>

        {/* Reset */}
        <div className="relative flex flex-col h-full rounded-[2rem] p-6 overflow-visible transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', boxShadow: '-2px -2px 6px rgba(255,255,255,0.04), 4px 4px 12px rgba(0,0,0,0.5), inset 1px 1px 3px rgba(255,255,255,0.08)', backdropFilter: 'blur(16px)' }}>
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-rose-500 rounded-t-[2rem] opacity-30" />
          <div className="flex items-center gap-2 mb-3">
            <RotateCcw size={18} className="text-rose-400" />
            <h3 className="text-sm font-semibold text-slate-200">Reset All Data</h3>
          </div>
          <p className="text-xs text-slate-500 mb-4 leading-relaxed flex-grow">
            Completely clear all funds, settings, and allocations. Warning: This
            action is permanent and cannot be undone.
          </p>
          {!showResetConfirm ? (
            <button
              onClick={() => setShowResetConfirm(true)}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-rose-500/10 text-rose-400 text-sm font-medium hover:bg-rose-500/20 transition-colors"
            >
              <RotateCcw size={14} />
              Reset Everything
            </button>
          ) : (
            <div className="flex flex-col gap-2">
              <p className="text-xs text-rose-400 font-medium">Are you sure? This deletes all your data.</p>
              <div className="flex gap-2">
                <button
                  onClick={handleReset}
                  className="flex-1 px-3 py-2 rounded-lg bg-rose-500/20 text-rose-400 text-xs font-semibold hover:bg-rose-500/30 transition-colors"
                >
                  Yes, Reset
                </button>
                <button
                  onClick={() => setShowResetConfirm(false)}
                  className="flex-1 px-3 py-2 rounded-lg bg-glass-bg text-slate-400 text-xs font-medium hover:bg-white/5 transition-colors border border-glass-border"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* App info */}
      <div className="bg-glass-bg border border-glass-border rounded-xl p-4 text-xs text-slate-500">
        <div className="flex flex-wrap gap-x-6 gap-y-1">
          <span>App: Mutual Fund Investment Planner</span>
          <span>Version: 1.0</span>
          <span>Data stored: Browser localStorage only</span>
          <span>No server, no tracking, no cookies</span>
        </div>
      </div>
    </SectionWrapper>
  );
}
