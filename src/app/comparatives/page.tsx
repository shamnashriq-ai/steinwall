"use client";

import { useSteinwall } from "@/lib/context";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, TrendingUp, TrendingDown, Minus, AlertTriangle } from "lucide-react";
import { useState } from "react";
import type { ComparativeData, YearlyMetric } from "@/lib/types";

const emptyYear = (year: number): YearlyMetric => ({
  year, scope1: 0, scope2: 0, scope3: 0, total: 0,
  energyConsumption: 0, waterWithdrawal: 0, wasteGenerated: 0,
  methodology: "", notes: "",
});

export default function ComparativesPage() {
  const { data, update, hydrated } = useSteinwall();
  const [newYear, setNewYear] = useState("");
  const [newAnomaly, setNewAnomaly] = useState({ year: "", metric: "", description: "" });

  const cd = data.comparativeData || {
    metrics: [], baselineYear: 2020, trends: [], anomalies: [],
    status: "draft" as const, updatedAt: new Date().toISOString(),
  };

  const save = (updated: ComparativeData) => {
    const metrics = updated.metrics.map((m) => ({ ...m, total: m.scope1 + m.scope2 + m.scope3 })).sort((a, b) => a.year - b.year);

    const trends: ComparativeData["trends"] = [];
    if (metrics.length >= 2) {
      const latest = metrics[metrics.length - 1];
      const prev = metrics[metrics.length - 2];
      const calcTrend = (metric: string, curr: number, previous: number) => {
        if (previous === 0) return;
        const change = ((curr - previous) / previous) * 100;
        trends.push({
          metric,
          direction: change < -1 ? "improving" : change > 1 ? "declining" : "stable",
          annualChange: `${change > 0 ? "+" : ""}${change.toFixed(1)}%`,
        });
      };
      calcTrend("Scope 1", latest.scope1, prev.scope1);
      calcTrend("Scope 2", latest.scope2, prev.scope2);
      calcTrend("Scope 3", latest.scope3, prev.scope3);
      calcTrend("Total Emissions", latest.total, prev.total);
      calcTrend("Energy Consumption", latest.energyConsumption, prev.energyConsumption);
      calcTrend("Water Withdrawal", latest.waterWithdrawal, prev.waterWithdrawal);
      calcTrend("Waste Generated", latest.wasteGenerated, prev.wasteGenerated);
    }

    update({ comparativeData: { ...updated, metrics, trends, updatedAt: new Date().toISOString() } });
  };

  if (!hydrated) return <div className="flex items-center justify-center h-64"><p className="text-text-secondary text-[14px]">Loading...</p></div>;

  const TrendIcon = ({ dir }: { dir: string }) => {
    if (dir === "improving") return <TrendingDown className="w-4 h-4 text-green-600" />;
    if (dir === "declining") return <TrendingUp className="w-4 h-4 text-red-600" />;
    return <Minus className="w-4 h-4 text-amber-600" />;
  };

  const trendColor = (dir: string) => dir === "improving" ? "text-green-700 bg-green-50" : dir === "declining" ? "text-red-700 bg-red-50" : "text-amber-700 bg-amber-50";

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-[28px] text-primary">Multi-Year Comparatives</h1>
        <p className="text-text-secondary text-[14px]">NFRS Requirement (2027+) — 3-year trend tracking, variance analysis, anomaly detection</p>
      </div>

      <Card className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[18px] text-primary">Yearly Data</h2>
          <div className="flex gap-2">
            <Input placeholder="Year" type="number" value={newYear} onChange={(e) => setNewYear(e.target.value)} className="w-24" />
            <Button variant="primary" size="sm" onClick={() => {
              const y = parseInt(newYear);
              if (y && !cd.metrics.some((m) => m.year === y)) { save({ ...cd, metrics: [...cd.metrics, emptyYear(y)] }); setNewYear(""); }
            }}><Plus className="w-4 h-4" /> Add Year</Button>
          </div>
        </div>

        <div className="mb-3">
          <Input label="Baseline Year" type="number" value={cd.baselineYear || ""} onChange={(e) => save({ ...cd, baselineYear: parseInt(e.target.value) || 2020 })} className="w-32" />
        </div>

        {cd.metrics.length === 0 ? (
          <div className="text-center py-8 text-text-secondary text-[14px]">No years added yet. Start with your baseline year and add subsequent years.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[13px] border border-neutral-lighter rounded-[var(--radius-sm)]">
              <thead className="bg-neutral-light">
                <tr>
                  <th className="px-3 py-2 text-left">Year</th>
                  <th className="px-3 py-2 text-left">Scope 1</th>
                  <th className="px-3 py-2 text-left">Scope 2</th>
                  <th className="px-3 py-2 text-left">Scope 3</th>
                  <th className="px-3 py-2 text-left">Total</th>
                  <th className="px-3 py-2 text-left">Energy (MWh)</th>
                  <th className="px-3 py-2 text-left">Water (m³)</th>
                  <th className="px-3 py-2 text-left">Waste (t)</th>
                  <th className="px-3 py-2 text-left">Notes</th>
                  <th className="w-10"></th>
                </tr>
              </thead>
              <tbody>
                {cd.metrics.map((m, mi) => (
                  <tr key={m.year} className={`border-t border-neutral-lighter ${m.year === cd.baselineYear ? "bg-primary-light" : ""}`}>
                    <td className="px-3 py-2 font-medium">
                      {m.year}
                      {m.year === cd.baselineYear && <Badge variant="info" className="ml-1 text-[10px]">Baseline</Badge>}
                    </td>
                    {(["scope1", "scope2", "scope3"] as const).map((f) => (
                      <td key={f} className="px-3 py-1">
                        <input type="number" className="w-full border border-neutral-lighter rounded px-2 py-1 text-[13px]" value={m[f] || ""} onChange={(e) => {
                          const u = [...cd.metrics]; u[mi] = { ...m, [f]: parseFloat(e.target.value) || 0 }; save({ ...cd, metrics: u });
                        }} />
                      </td>
                    ))}
                    <td className="px-3 py-2 font-medium">{(m.scope1 + m.scope2 + m.scope3).toLocaleString()}</td>
                    {(["energyConsumption", "waterWithdrawal", "wasteGenerated"] as const).map((f) => (
                      <td key={f} className="px-3 py-1">
                        <input type="number" className="w-full border border-neutral-lighter rounded px-2 py-1 text-[13px]" value={m[f] || ""} onChange={(e) => {
                          const u = [...cd.metrics]; u[mi] = { ...m, [f]: parseFloat(e.target.value) || 0 }; save({ ...cd, metrics: u });
                        }} />
                      </td>
                    ))}
                    <td className="px-3 py-1">
                      <input className="w-full border border-neutral-lighter rounded px-2 py-1 text-[12px]" placeholder="Notes" value={m.notes} onChange={(e) => {
                        const u = [...cd.metrics]; u[mi] = { ...m, notes: e.target.value }; save({ ...cd, metrics: u });
                      }} />
                    </td>
                    <td className="px-3 py-2">
                      <button className="cursor-pointer text-red-400" onClick={() => save({ ...cd, metrics: cd.metrics.filter((_, i) => i !== mi) })}><Trash2 className="w-3 h-3" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {cd.trends.length > 0 && (
        <Card className="mb-6">
          <h2 className="text-[18px] text-primary mb-4">Trend Analysis (Latest Year-over-Year)</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {cd.trends.map((t) => (
              <div key={t.metric} className={`rounded-[var(--radius-sm)] p-3 ${trendColor(t.direction)}`}>
                <div className="flex items-center gap-2 mb-1">
                  <TrendIcon dir={t.direction} />
                  <span className="text-[12px] font-medium">{t.metric}</span>
                </div>
                <p className="text-[18px] font-semibold">{t.annualChange}</p>
                <p className="text-[11px] capitalize">{t.direction}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Card>
        <h2 className="text-[18px] text-primary mb-4">Anomalies & Methodology Changes</h2>
        <p className="text-[13px] text-text-secondary mb-3">Flag unexpected changes or methodology shifts for auditor transparency.</p>

        {cd.anomalies.map((a, i) => (
          <div key={i} className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-200 rounded-[var(--radius-sm)] mb-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5" />
            <div className="flex-1 text-[13px]">
              <span className="font-medium">{a.year} — {a.metric}:</span> {a.description}
            </div>
            <button className="cursor-pointer text-red-400" onClick={() => save({ ...cd, anomalies: cd.anomalies.filter((_, j) => j !== i) })}><Trash2 className="w-3 h-3" /></button>
          </div>
        ))}

        <div className="flex gap-2 mt-3 flex-wrap">
          <Input placeholder="Year" type="number" value={newAnomaly.year} onChange={(e) => setNewAnomaly({ ...newAnomaly, year: e.target.value })} className="w-24" />
          <Input placeholder="Metric" value={newAnomaly.metric} onChange={(e) => setNewAnomaly({ ...newAnomaly, metric: e.target.value })} />
          <Input placeholder="Description" value={newAnomaly.description} onChange={(e) => setNewAnomaly({ ...newAnomaly, description: e.target.value })} className="flex-1" />
          <Button variant="secondary" onClick={() => {
            if (newAnomaly.year && newAnomaly.metric && newAnomaly.description) {
              save({ ...cd, anomalies: [...cd.anomalies, { year: parseInt(newAnomaly.year), metric: newAnomaly.metric, description: newAnomaly.description }] });
              setNewAnomaly({ year: "", metric: "", description: "" });
            }
          }}>Add</Button>
        </div>

        <div className="flex justify-end mt-4">
          <Button variant="primary" onClick={() => save({ ...cd, status: "complete" })}>Save Comparative Data</Button>
        </div>
      </Card>
    </div>
  );
}
