"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export function AnalyticsCharts({
  verificationSeries,
  pipelineSeries,
}: {
  verificationSeries: { status: string; count: number }[];
  pipelineSeries: { stage: string; count: number }[];
}) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="h-72 rounded-xl border border-[var(--border)] bg-white p-4">
        <p className="mb-2 text-sm font-semibold text-[var(--navy)]">Verification status</p>
        <ResponsiveContainer width="100%" height="90%">
          <BarChart data={verificationSeries}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="status" tick={{ fontSize: 11 }} />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="count" fill="var(--emerald)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="h-72 rounded-xl border border-[var(--border)] bg-white p-4">
        <p className="mb-2 text-sm font-semibold text-[var(--navy)]">Pipeline stages</p>
        <ResponsiveContainer width="100%" height="90%">
          <BarChart data={pipelineSeries}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="stage" tick={{ fontSize: 11 }} />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="count" fill="#1e3a5f" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}