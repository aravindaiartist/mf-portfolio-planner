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
        <div className="relative flex flex-col h-full rounded-[2rem] p-6 overflow-visible transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl" style={{ border: '1px solid rgba(255,255,255,0.05)', boxShadow: '-2px -2px 6px rgba(255,255,255,0.04), 4px 4px 12px rgba(0,0,0,0.5), inset 1px 1px 3px rgba(255,255,255,0.08)', backdropFilter: 'blur(16px)' }}>
          {/* Internal clipping layer for background elements */}
          <div className="absolute inset-0 rounded-[2rem] overflow-hidden pointer-events-none">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/[0.05] to-transparent opacity-50" />
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-indigo-500 to-violet-500 opacity-60" />
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent" />
          </div>

          <div className="relative z-10 flex flex-col h-full">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-indigo-500/10 border border-indigo-500/20 shadow-lg">
                <Download size={16} className="text-indigo-400" />
              </div>
              <h3 className="text-[15px] font-bold text-slate-100 tracking-tight">Export Portfolio</h3>
            </div>
            <p className="text-[12px] text-slate-400 mb-6 leading-relaxed flex-grow">
              Download your entire portfolio data as a portable JSON file. Perfect for back-ups or moving to another device.
            </p>
            <button
              onClick={handleExport}
              className="w-full flex items-center justify-center gap-2.5 px-5 py-2.5 rounded-full text-white text-sm font-bold transition-all duration-300 group overflow-hidden relative"
              style={{
                background: "linear-gradient(145deg, rgba(99,102,241,0.2), rgba(0,0,0,0.3))",
                boxShadow: "-1px -1px 3px rgba(255,255,255,0.05), 3px 3px 8px rgba(0,0,0,0.4), inset 1px 1px 2px rgba(255,255,255,0.05)",
                border: "1px solid rgba(99,102,241,0.3)",
              }}
            >
              <FileJson size={15} className="transition-transform group-hover:scale-110" />
              <span>Export as JSON</span>
            </button>
            {exportStatus && (
              <p className="mt-3 text-[11px] text-indigo-400 font-medium flex items-center gap-1.5 justify-center">
                <CheckCircle2 size={12} /> {exportStatus}
              </p>
            )}
          </div>
        </div>

        {/* Import */}
        <div className="relative flex flex-col h-full rounded-[2rem] p-6 overflow-visible transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl" style={{ border: '1px solid rgba(255,255,255,0.05)', boxShadow: '-2px -2px 6px rgba(255,255,255,0.04), 4px 4px 12px rgba(0,0,0,0.5), inset 1px 1px 3px rgba(255,255,255,0.08)', backdropFilter: 'blur(16px)' }}>
          {/* Internal clipping layer for background elements */}
          <div className="absolute inset-0 rounded-[2rem] overflow-hidden pointer-events-none">
            <div className="absolute inset-0 bg-gradient-to-br from-sky-500/[0.05] to-transparent opacity-50" />
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-sky-500 to-cyan-500 opacity-60" />
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent" />
          </div>

          <div className="relative z-10 flex flex-col h-full">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-sky-500/10 border border-sky-500/20 shadow-lg">
                <Upload size={16} className="text-sky-400" />
              </div>
              <h3 className="text-[15px] font-bold text-slate-100 tracking-tight">Import Data</h3>
            </div>
            <p className="text-[12px] text-slate-400 mb-6 leading-relaxed flex-grow">
              Restore your dashboard from a previous JSON backup. This will replace all current funds and settings instantly.
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
              className="w-full flex items-center justify-center gap-2.5 px-5 py-2.5 rounded-full text-white text-sm font-bold transition-all duration-300 group overflow-hidden relative"
              style={{
                background: "linear-gradient(145deg, rgba(14,165,233,0.2), rgba(0,0,0,0.3))",
                boxShadow: "-1px -1px 3px rgba(255,255,255,0.05), 3px 3px 8px rgba(0,0,0,0.4), inset 1px 1px 2px rgba(255,255,255,0.05)",
                border: "1px solid rgba(14,165,233,0.3)",
              }}
            >
              <Upload size={15} className="transition-transform group-hover:scale-110" />
              <span>Import Backup</span>
            </button>
            {importStatus && (
              <p className="mt-3 text-[11px] text-amber-400 font-medium flex items-center gap-1.5 justify-center">
                <AlertTriangle size={12} /> {importStatus}
              </p>
            )}
          </div>
        </div>

        {/* Reset */}
        <div className="relative flex flex-col h-full rounded-[2rem] p-6 overflow-visible transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl" style={{ border: '1px solid rgba(255,255,255,0.05)', boxShadow: '-2px -2px 6px rgba(255,255,255,0.04), 4px 4px 12px rgba(0,0,0,0.5), inset 1px 1px 3px rgba(255,255,255,0.08)', backdropFilter: 'blur(16px)' }}>
          {/* Internal clipping layer for background elements */}
          <div className="absolute inset-0 rounded-[2rem] overflow-hidden pointer-events-none">
            <div className="absolute inset-0 bg-gradient-to-br from-rose-500/[0.05] to-transparent opacity-50" />
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-rose-500 to-pink-500 opacity-60" />
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent" />
          </div>

          <div className="relative z-10 flex flex-col h-full">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-rose-500/10 border border-rose-500/20 shadow-lg">
                <RotateCcw size={16} className="text-rose-400" />
              </div>
              <h3 className="text-[15px] font-bold text-slate-100 tracking-tight">Factory Reset</h3>
            </div>
            <p className="text-[12px] text-slate-400 mb-6 leading-relaxed flex-grow">
              Completely wipe all saved funds, history, and settings. This action is final and cannot be undone.
            </p>
            {!showResetConfirm ? (
              <button
                onClick={() => setShowResetConfirm(true)}
                className="w-full flex items-center justify-center gap-2.5 px-5 py-2.5 rounded-full text-white text-sm font-bold transition-all duration-300 group overflow-hidden relative"
                style={{
                  background: "linear-gradient(145deg, rgba(244,63,94,0.2), rgba(0,0,0,0.3))",
                  boxShadow: "-1px -1px 3px rgba(255,255,255,0.05), 3px 3px 8px rgba(0,0,0,0.4), inset 1px 1px 2px rgba(255,255,255,0.05)",
                  border: "1px solid rgba(244,63,94,0.3)",
                }}
              >
                <RotateCcw size={15} className="transition-transform group-hover:scale-110" />
                <span>Reset Everything</span>
              </button>
            ) : (
              <div className="flex flex-col gap-3 py-1">
                <p className="text-[11px] text-rose-400 font-bold text-center uppercase tracking-wider animate-pulse">Are you absolutely sure?</p>
                <div className="flex gap-2">
                  <button
                    onClick={handleReset}
                    className="flex-1 px-3 py-2 rounded-full bg-rose-500/30 text-rose-100 text-[11px] font-bold hover:bg-rose-500/40 transition-all border border-rose-500/40"
                  >
                    Yes, Reset
                  </button>
                  <button
                    onClick={() => setShowResetConfirm(false)}
                    className="flex-1 px-3 py-2 rounded-full bg-white/5 text-slate-400 text-[11px] font-bold hover:bg-white/10 transition-all border border-white/10"
                  >
                    No, Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
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
