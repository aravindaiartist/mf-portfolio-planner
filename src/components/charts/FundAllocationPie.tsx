import { useMemo } from "react";
import type { Fund } from "@/lib/types";
import { formatCurrency } from "@/lib/formatters";

interface FundAllocationPieProps {
  funds: Fund[];
  monthlySip?: number;
}

const COLORS = [
  "#10b981", "#38bdf8", "#8b5cf6", "#f59e0b", "#f43f5e",
  "#14b8a6", "#ec4899", "#6366f1", "#84cc16", "#06b6d4",
  "#e879f9", "#fb923c", "#22d3ee", "#a3e635", "#f472b6",
];

interface SliceData {
  fund: Fund;
  startAngle: number;
  endAngle: number;
  color: string;
  percent: number;
}

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

export function FundAllocationPie({ funds, monthlySip = 0 }: FundAllocationPieProps) {
  const slices: SliceData[] = useMemo(() => {
    const total = funds.reduce((s, f) => s + f.allocation, 0);
    if (total === 0) return [];

    let currentAngle = 0;
    return funds.map((fund, i) => {
      const percent = fund.allocation / total;
      const angle = percent * 360;
      const slice: SliceData = {
        fund,
        startAngle: currentAngle,
        endAngle: currentAngle + angle,
        color: COLORS[i % COLORS.length],
        percent: fund.allocation,
      };
      currentAngle += angle;
      return slice;
    });
  }, [funds]);

  // Calculate Core vs Satellite split
  const coreSatellite = useMemo(() => {
    const core = funds.filter(f => f.bucket === "Core");
    const satellite = funds.filter(f => f.bucket === "Satellite");
    
    const coreAlloc = core.reduce((s, f) => s + f.allocation, 0);
    const satAlloc = satellite.reduce((s, f) => s + f.allocation, 0);
    const total = coreAlloc + satAlloc;
    
    const coreAmount = Math.round(monthlySip * (coreAlloc / 100));
    const satAmount = Math.round(monthlySip * (satAlloc / 100));
    
    return {
      coreAlloc,
      satAlloc,
      coreAmount,
      satAmount,
      corePercent: total > 0 ? (coreAlloc / total) * 100 : 0,
      satPercent: total > 0 ? (satAlloc / total) * 100 : 0,
      coreCount: core.length,
      satCount: satellite.length,
    };
  }, [funds, monthlySip]);

  if (funds.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-sm text-slate-500">
        Add funds to see allocation chart
      </div>
    );
  }

  const cx = 120;
  const cy = 120;
  const outerR = 110;
  const innerR = 55;

  return (
    <div className="flex flex-col lg:flex-row items-start gap-6">
      {/* SVG Donut */}
      <div className="flex-shrink-0">
        <svg width="240" height="240" viewBox="0 0 240 240">
          {slices.map((s, i) => {
            const gap = s.endAngle - s.startAngle > 1 ? 0.5 : 0;
            
            if (s.endAngle - s.startAngle < 0.5) return null;

            // Outer arc
            const outerStart = polarToCartesian(cx, cy, outerR, s.endAngle - gap);
            const outerEnd = polarToCartesian(cx, cy, outerR, s.startAngle + gap);
            const innerStart = polarToCartesian(cx, cy, innerR, s.startAngle + gap);
            const innerEnd = polarToCartesian(cx, cy, innerR, s.endAngle - gap);
            const largeArc = (s.endAngle - s.startAngle - gap * 2) > 180 ? 1 : 0;

            const d = [
              "M", outerStart.x, outerStart.y,
              "A", outerR, outerR, 0, largeArc, 0, outerEnd.x, outerEnd.y,
              "L", innerStart.x, innerStart.y,
              "A", innerR, innerR, 0, largeArc, 1, innerEnd.x, innerEnd.y,
              "Z",
            ].join(" ");

            return (
              <path
                key={i}
                d={d}
                fill={s.color}
                opacity={0.85}
                className="hover:opacity-100 transition-opacity cursor-default"
              >
                <title>{s.fund.name}: {s.percent}%</title>
              </path>
            );
          })}

          {/* Center text */}
          <text x={cx} y={cy - 6} textAnchor="middle" className="fill-slate-300 text-xs font-medium">
            {funds.length} Fund{funds.length !== 1 ? "s" : ""}
          </text>
          <text x={cx} y={cy + 12} textAnchor="middle" className="fill-slate-500 text-[10px]">
            Allocation
          </text>
        </svg>
      </div>

      {/* Right side: Legend + Core/Satellite breakdown */}
      <div className="flex flex-col gap-4 min-w-0 flex-1">
        {/* Fund Legend */}
        <div className="flex flex-col gap-1.5 min-w-0">
          {slices.map((s, i) => (
            <div key={i} className="flex items-center gap-2 min-w-0">
              <span
                className="w-2.5 h-2.5 rounded-sm flex-shrink-0"
                style={{ backgroundColor: s.color }}
              />
              <span className="text-xs text-slate-300 truncate max-w-[180px]" title={s.fund.name}>
                {s.fund.name}
              </span>
              <span className="text-xs font-mono text-slate-500 ml-auto flex-shrink-0">
                {s.percent}%
              </span>
            </div>
          ))}
        </div>

        {/* Core vs Satellite Breakdown */}
        {monthlySip > 0 && (
          <div className="pt-3 border-t border-glass-border">
            <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-2">
              Monthly SIP Split
            </div>
            
            {/* Stacked horizontal bar */}
            <div className="h-3 rounded-full overflow-hidden flex bg-navy-800 mb-3">
              {coreSatellite.corePercent > 0 && (
                <div 
                  className="h-full bg-emerald-500/80 transition-all duration-300"
                  style={{ width: `${coreSatellite.corePercent}%` }}
                  title={`Core: ${coreSatellite.coreAlloc}%`}
                />
              )}
              {coreSatellite.satPercent > 0 && (
                <div 
                  className="h-full bg-sky-500/80 transition-all duration-300"
                  style={{ width: `${coreSatellite.satPercent}%` }}
                  title={`Satellite: ${coreSatellite.satAlloc}%`}
                />
              )}
            </div>

            {/* Core row */}
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500/80 flex-shrink-0" />
                <span className="text-xs text-slate-300">Core</span>
                <span className="text-[10px] text-slate-500">
                  ({coreSatellite.coreCount} fund{coreSatellite.coreCount !== 1 ? "s" : ""})
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-emerald-400">
                  {formatCurrency(coreSatellite.coreAmount)}
                </span>
                <span className="text-[10px] font-mono text-slate-500">
                  {coreSatellite.coreAlloc}%
                </span>
              </div>
            </div>

            {/* Satellite row */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-sm bg-sky-500/80 flex-shrink-0" />
                <span className="text-xs text-slate-300">Satellite</span>
                <span className="text-[10px] text-slate-500">
                  ({coreSatellite.satCount} fund{coreSatellite.satCount !== 1 ? "s" : ""})
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-sky-400">
                  {formatCurrency(coreSatellite.satAmount)}
                </span>
                <span className="text-[10px] font-mono text-slate-500">
                  {coreSatellite.satAlloc}%
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
