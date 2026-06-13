"use client";

import { Shell } from "@/components/shell";
import { useIncidents } from "@/hooks/use-incidents";
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";

const MOCK_TRENDS = [
  { name: "Mon", critical: 4, medium: 12, low: 24 },
  { name: "Tue", critical: 2, medium: 18, low: 30 },
  { name: "Wed", critical: 7, medium: 15, low: 22 },
  { name: "Thu", critical: 3, medium: 20, low: 28 },
  { name: "Fri", critical: 5, medium: 10, low: 18 },
  { name: "Sat", critical: 1, medium: 8, low: 12 },
  { name: "Sun", critical: 0, medium: 5, low: 15 },
];

const MOCK_PLATFORMS = [
  { name: "ChatGPT", value: 65 },
  { name: "Claude", value: 25 },
  { name: "Gemini", value: 10 },
];

const MOCK_CATEGORIES = [
  { name: "Cloud Keys", value: 42 },
  { name: "Credentials", value: 38 },
  { name: "PII", value: 15 },
  { name: "Financial", value: 5 },
];

export default function AnalyticsPage() {
  const { incidents } = useIncidents();

  const activeThreats = incidents.length;
  const avgRiskScore = incidents.length > 0 
    ? Math.round(incidents.reduce((acc, i) => acc + i.risk_score, 0) / incidents.length) 
    : 0;

  return (
    <Shell title="Analytics" subtitle="Security Intelligence">
      <div className="grid gap-6 md:grid-cols-4 mb-6">
        {[
          { label: "Active Threats", value: activeThreats.toString(), trend: "+12%" },
          { label: "Platform Coverage", value: "3", trend: "Stable" },
          { label: "Avg. Risk Score", value: avgRiskScore.toString(), trend: "-4%" },
          { label: "AI Leakage Events", value: "142", trend: "+2%" },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="panel p-5 flex flex-col justify-between"
          >
            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">{stat.label}</p>
            <div className="mt-4 flex items-baseline justify-between">
              <span className="text-3xl font-semibold text-zinc-100">{stat.value}</span>
              <span className={`text-xs font-medium ${stat.trend.startsWith('+') ? 'text-red-400' : 'text-primary'}`}>
                {stat.trend}
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3 mb-6">
        <motion.div 
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="panel p-5 lg:col-span-2 h-[400px]"
        >
          <h3 className="text-sm font-semibold text-zinc-100 mb-6">Threat Volume (7 Days)</h3>
          <ResponsiveContainer width="100%" height="100%" minHeight={0} minWidth={0}>
            <AreaChart data={MOCK_TRENDS} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorCritical" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorMedium" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
              <XAxis dataKey="name" stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px' }}
                itemStyle={{ color: '#e4e4e7' }}
              />
              <Area type="monotone" dataKey="critical" stroke="#ef4444" fillOpacity={1} fill="url(#colorCritical)" />
              <Area type="monotone" dataKey="medium" stroke="#f59e0b" fillOpacity={1} fill="url(#colorMedium)" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          className="panel p-5 h-[400px]"
        >
          <h3 className="text-sm font-semibold text-zinc-100 mb-6">Category Distribution</h3>
          <ResponsiveContainer width="100%" height="100%" minHeight={0} minWidth={0}>
            <BarChart data={MOCK_CATEGORIES} layout="vertical" margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" horizontal={true} vertical={false} />
              <XAxis type="number" stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis dataKey="name" type="category" stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} width={80} />
              <Tooltip 
                cursor={{ fill: '#27272a', opacity: 0.4 }}
                contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px' }}
              />
              <Bar dataKey="value" fill="#19e6c7" radius={[0, 4, 4, 0]} barSize={24} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>
    </Shell>
  );
}
