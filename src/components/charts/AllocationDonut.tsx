import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { CHART_COLORS } from "@/lib/constants";
import { formatPercent } from "@/lib/formatters";

interface AllocationDonutProps {
  coreAllocation: number;
  satelliteAllocation: number;
}

const COLORS = [CHART_COLORS.emerald, CHART_COLORS.sky];

function CustomTooltip({ active, payload }: {
  active?: boolean;
  payload?: Array<{ name: string; value: number }>;
}) {
  if (!active || !payload?.[0]) return null;
  const entry = payload[0];
  return (
    <div className="bg-navy-800 border border-glass-border rounded-lg p-2 shadow-xl">
      <span className="text-xs text-slate-300">
        {entry.name}: {formatPercent(entry.value, 0)}
      </span>
    </div>
  );
}

export function AllocationDonut({ coreAllocation, satelliteAllocation }: AllocationDonutProps) {
  const data = [
    { name: "Core", value: coreAllocation },
    { name: "Satellite", value: satelliteAllocation },
  ].filter((d) => d.value > 0);

  if (data.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center text-sm text-slate-500">
        No allocation data.
      </div>
    );
  }

  return (
    <div className="h-48 relative">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={75}
            paddingAngle={3}
            dataKey="value"
            stroke="none"
          >
            {data.map((_entry, index) => (
              <Cell key={index} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>
      {/* Center label */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span className="text-lg font-mono font-semibold text-slate-100">
          {formatPercent(coreAllocation + satelliteAllocation, 0)}
        </span>
        <span className="text-[10px] text-slate-500 uppercase tracking-wider">Total</span>
      </div>
    </div>
  );
}
