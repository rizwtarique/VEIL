"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { Incident } from "@/types/incident";

interface RiskChartProps {
  incidents: Incident[];
}

function buildChartData(incidents: Incident[]) {
  const slots = Array.from({ length: 7 }, (_, index) => {
    const date = new Date();
    date.setHours(date.getHours() - (6 - index) * 4, 0, 0, 0);
    return {
      timestamp: date.getTime(),
      label: date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      risk: 0,
      count: 0,
    };
  });

  for (const incident of incidents) {
    const incidentTime = new Date(incident.created_at).getTime();
    const nearest = slots.reduce((best, slot) =>
      Math.abs(slot.timestamp - incidentTime) <
      Math.abs(best.timestamp - incidentTime)
        ? slot
        : best,
    );
    nearest.risk += Number(incident.risk_score) || 0;
    nearest.count += 1;
  }

  return slots.map((slot) => ({
    ...slot,
    risk: slot.count ? Math.round(slot.risk / slot.count) : 0,
  }));
}

export function RiskChart({ incidents }: RiskChartProps) {
  const data = buildChartData(incidents);

  return (
    <section className="panel rounded-2xl p-5 lg:col-span-7">
      <div className="mb-7 flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            Risk distribution
          </p>
          <h2 className="mt-2 text-lg font-medium text-white">
            Threat pressure / 24h
          </h2>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-cyan/15 bg-cyan/5 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-cyan">
          <span className="h-1.5 w-1.5 rounded-full bg-cyan" />
          Live signal
        </div>
      </div>

      <div className="h-72 w-full">
        <ResponsiveContainer
          height="100%"
          initialDimension={{ width: 700, height: 288 }}
          minWidth={0}
          width="100%"
        >
          <AreaChart data={data} margin={{ top: 8, right: 6, left: -25, bottom: 0 }}>
            <defs>
              <linearGradient id="riskGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#19e6c7" stopOpacity={0.3} />
                <stop offset="90%" stopColor="#19e6c7" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#17202b" strokeDasharray="3 5" vertical={false} />
            <XAxis
              axisLine={false}
              dataKey="label"
              tick={{ fill: "#536172", fontSize: 11 }}
              tickLine={false}
            />
            <YAxis
              axisLine={false}
              domain={[0, 100]}
              tick={{ fill: "#536172", fontSize: 11 }}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                background: "#0a111b",
                border: "1px solid #22303d",
                borderRadius: 10,
                boxShadow: "0 12px 30px rgba(0,0,0,.35)",
              }}
              itemStyle={{ color: "#19e6c7", fontSize: 12 }}
              labelStyle={{ color: "#76869a", fontSize: 11, marginBottom: 4 }}
              formatter={(value) => [`${value ?? 0}/100`, "Risk score"]}
            />
            <Area
              activeDot={{ fill: "#05080d", stroke: "#19e6c7", strokeWidth: 2, r: 5 }}
              dataKey="risk"
              fill="url(#riskGradient)"
              stroke="#19e6c7"
              strokeWidth={2}
              type="monotone"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
