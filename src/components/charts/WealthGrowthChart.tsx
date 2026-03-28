import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";
import type { FlatVsStepUpRow } from "@/lib/types";
import { formatCurrencyCompact } from "@/lib/formatters";
import { CHART_COLORS } from "@/lib/constants";

interface WealthGrowthChartProps {
  data: FlatVsStepUpRow[];
}

function CustomTooltip({ active, payload, label }: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: number;
}) {
  if (!active || !payload) return null;
  return (
    <div className="bg-navy-800 border border-glass-border rounded-lg p-3 shadow-xl">
      <p className="text-xs text-slate-400 mb-2">Year {label}</p>
      {payload.map((entry) => (
        <div key={entry.name} className="flex items-center gap-2 text-xs">
          <span
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-slate-400">{entry.name}:</span>
          <span className="text-slate-100 font-mono">{formatCurrencyCompact(entry.value)}</span>
        </div>
      ))}
    </div>
  );
}

export function WealthGrowthChart({ data }: WealthGrowthChartProps) {
  if (data.length === 0) {
    return (
      <div className="h-80 flex items-center justify-center text-sm text-slate-500">
        No projection data available.
      </div>
    );
  }

  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="gradValue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={CHART_COLORS.valueLine} stopOpacity={0.3} />
              <stop offset="95%" stopColor={CHART_COLORS.valueLine} stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gradStepUp" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={CHART_COLORS.stepUpLine} stopOpacity={0.3} />
              <stop offset="95%" stopColor={CHART_COLORS.stepUpLine} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
          <XAxis
            dataKey="year"
            tick={{ fill: "#94a3b8", fontSize: 11 }}
            axisLine={{ stroke: "rgba(255,255,255,0.08)" }}
            tickLine={false}
            label={{ value: "Year", position: "insideBottomRight", offset: -5, fill: "#64748b", fontSize: 10 }}
          />
          <YAxis
            tick={{ fill: "#94a3b8", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v: number) => formatCurrencyCompact(v)}
            width={70}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            verticalAlign="top"
            height={30}
            formatter={(value: string) => (
              <span className="text-xs text-slate-400">{value}</span>
            )}
          />
          <Area
            type="monotone"
            dataKey="investedFlat"
            name="Invested (Flat)"
            stroke={CHART_COLORS.investedLine}
            fill="none"
            strokeWidth={1.5}
            strokeDasharray="4 4"
            dot={false}
          />
          <Area
            type="monotone"
            dataKey="valueFlat"
            name="Value (Flat)"
            stroke={CHART_COLORS.valueLine}
            fill="url(#gradValue)"
            strokeWidth={2}
            dot={false}
          />
          <Area
            type="monotone"
            dataKey="investedStepUp"
            name="Invested (Step-Up)"
            stroke={CHART_COLORS.stepUpInvested}
            fill="none"
            strokeWidth={1.5}
            strokeDasharray="4 4"
            dot={false}
          />
          <Area
            type="monotone"
            dataKey="valueStepUp"
            name="Value (Step-Up)"
            stroke={CHART_COLORS.stepUpLine}
            fill="url(#gradStepUp)"
            strokeWidth={2}
            dot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
