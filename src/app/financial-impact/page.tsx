"use client";

import { useSteinwall } from "@/lib/context";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, CheckCircle2, DollarSign } from "lucide-react";
import { useState } from "react";
import type { FinancialImpactModel, FinancialImpactYear } from "@/lib/types";

const emptyYear = (year: number): FinancialImpactYear => ({
  year, capex: 0, opexChange: 0, revenueAtRisk: 0, strandedAssets: 0, dividendImpact: 0, debtCapacity: 0,
});

export default function FinancialImpactPage() {
  const { data, update, hydrated } = useSteinwall();
  const [step, setStep] = useState(0);
  const [newSource, setNewSource] = useState({ source: "", amount: "" });
  const [newFactor, setNewFactor] = useState({ factor: "", low: "", base: "", high: "" });

  const fi = data.financialImpact || {
    currentEbitda: 0,
    currency: "RM",
    projections: [emptyYear(2025), emptyYear(2030), emptyYear(2035), emptyYear(2040), emptyYear(2050)],
    transitionCostTotal: 0,
    roiOnGreenCapex: "",
    creditRatingImpact: "",
    fundingSources: [],
    sensitivityFactors: [],
    status: "draft" as const,
    updatedAt: new Date().toISOString(),
  };

  const save = (updated: FinancialImpactModel) => {
    const total = updated.projections.reduce((sum, p) => sum + p.capex, 0);
    update({ financialImpact: { ...updated, transitionCostTotal: total, updatedAt: new Date().toISOString() } });
  };

  if (!hydrated) return <div className="flex items-center justify-center h-64"><p className="text-text-secondary text-[14px]">Loading...</p></div>;

  const steps = ["Baseline & Projections", "Funding & ROI", "Sensitivity", "Board Approval"];
  const fmt = (n: number) => `${fi.currency} ${n.toLocaleString()}M`;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-[28px] text-primary">Financial Impact Quantification</h1>
        <p className="text-text-secondary text-[14px]">IFRS S2 Core — Capex, stranded assets, ROI, credit impact modeling</p>
      </div>

      <div className="flex gap-2 mb-6 flex-wrap">
        {steps.map((s, i) => (
          <button key={s} onClick={() => setStep(i)} className={`px-3 py-1.5 rounded-full text-[12px] font-medium cursor-pointer transition-colors ${step === i ? "bg-primary text-white" : i < step ? "bg-green-100 text-green-700" : "bg-neutral-light text-text-secondary"}`}>
            {i < step ? "✓ " : ""}{s}
          </button>
        ))}
      </div>

      {step === 0 && (
        <Card>
          <h2 className="text-[18px] text-primary mb-4">Baseline & Projections</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
            <Input label="Current EBITDA (RM millions)" type="number" value={fi.currentEbitda || ""} onChange={(e) => save({ ...fi, currentEbitda: parseFloat(e.target.value) || 0 })} />
            <Input label="Currency" value={fi.currency} onChange={(e) => save({ ...fi, currency: e.target.value })} />
          </div>

          <p className="text-[13px] text-text-secondary mb-3">Model financial impact by year (all values in {fi.currency} millions)</p>

          <div className="overflow-x-auto">
            <table className="w-full text-[13px] border border-neutral-lighter rounded-[var(--radius-sm)]">
              <thead className="bg-neutral-light">
                <tr>
                  <th className="px-3 py-2 text-left">Year</th>
                  <th className="px-3 py-2 text-left">Capex</th>
                  <th className="px-3 py-2 text-left">OpEx Change</th>
                  <th className="px-3 py-2 text-left">Revenue at Risk</th>
                  <th className="px-3 py-2 text-left">Stranded Assets</th>
                  <th className="px-3 py-2 text-left">Dividend Impact</th>
                  <th className="px-3 py-2 text-left">Debt Capacity</th>
                </tr>
              </thead>
              <tbody>
                {fi.projections.map((p, pi) => (
                  <tr key={p.year} className="border-t border-neutral-lighter">
                    <td className="px-3 py-2 font-medium">{p.year}</td>
                    {(["capex", "opexChange", "revenueAtRisk", "strandedAssets", "dividendImpact", "debtCapacity"] as const).map((field) => (
                      <td key={field} className="px-3 py-1">
                        <input type="number" className="w-full border border-neutral-lighter rounded px-2 py-1 text-[13px]" value={p[field] || ""} onChange={(e) => {
                          const u = [...fi.projections]; u[pi] = { ...p, [field]: parseFloat(e.target.value) || 0 }; save({ ...fi, projections: u });
                        }} />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 bg-amber-50 border border-amber-200 rounded-[var(--radius-sm)] p-3">
            <p className="text-[13px] text-amber-800"><DollarSign className="w-4 h-4 inline" /> Total Transition Capex: {fmt(fi.projections.reduce((sum, p) => sum + p.capex, 0))}</p>
          </div>

          <div className="flex justify-end mt-4">
            <Button variant="primary" onClick={() => setStep(1)}>Next: Funding & ROI →</Button>
          </div>
        </Card>
      )}

      {step === 1 && (
        <Card>
          <h2 className="text-[18px] text-primary mb-4">Funding Sources & ROI</h2>

          <div className="mb-4">
            <label className="text-[13px] font-medium text-text-primary mb-1 block">Funding Sources</label>
            <div className="border border-neutral-lighter rounded-[var(--radius-sm)] overflow-hidden mb-3">
              <table className="w-full text-[13px]">
                <thead className="bg-neutral-light"><tr><th className="px-4 py-2 text-left">Source</th><th className="px-4 py-2 text-left">Amount ({fi.currency}M)</th><th className="px-4 py-2 text-left">%</th><th className="w-10"></th></tr></thead>
                <tbody>
                  {fi.fundingSources.map((f, i) => (
                    <tr key={i} className="border-t border-neutral-lighter">
                      <td className="px-4 py-2">{f.source}</td><td className="px-4 py-2">{f.amount.toLocaleString()}</td><td className="px-4 py-2">{f.percentage}%</td>
                      <td className="px-4 py-2"><button className="cursor-pointer text-red-400" onClick={() => save({ ...fi, fundingSources: fi.fundingSources.filter((_, j) => j !== i) })}><Trash2 className="w-3 h-3" /></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex gap-2">
              <Input placeholder="Source (e.g. Retained earnings)" value={newSource.source} onChange={(e) => setNewSource({ ...newSource, source: e.target.value })} />
              <Input placeholder="Amount" type="number" value={newSource.amount} onChange={(e) => setNewSource({ ...newSource, amount: e.target.value })} />
              <Button variant="secondary" onClick={() => {
                if (newSource.source && newSource.amount) {
                  const amount = parseFloat(newSource.amount);
                  const total = fi.transitionCostTotal || 1;
                  save({ ...fi, fundingSources: [...fi.fundingSources, { source: newSource.source, amount, percentage: Math.round((amount / total) * 100) }] });
                  setNewSource({ source: "", amount: "" });
                }
              }}>Add</Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Input label="ROI on Green Capex" placeholder="e.g. 12% IRR over 15 years" value={fi.roiOnGreenCapex} onChange={(e) => save({ ...fi, roiOnGreenCapex: e.target.value })} />
            <Input label="Credit Rating Impact" placeholder="e.g. Maintain investment grade" value={fi.creditRatingImpact} onChange={(e) => save({ ...fi, creditRatingImpact: e.target.value })} />
          </div>

          <div className="flex justify-between mt-4">
            <Button variant="secondary" onClick={() => setStep(0)}>← Back</Button>
            <Button variant="primary" onClick={() => setStep(2)}>Next: Sensitivity →</Button>
          </div>
        </Card>
      )}

      {step === 2 && (
        <Card>
          <h2 className="text-[18px] text-primary mb-4">Sensitivity Analysis</h2>
          <p className="text-[13px] text-text-secondary mb-4">What if key assumptions change? Model low, base, and high cases.</p>

          <div className="border border-neutral-lighter rounded-[var(--radius-sm)] overflow-hidden mb-4">
            <table className="w-full text-[13px]">
              <thead className="bg-neutral-light"><tr><th className="px-4 py-2 text-left">Factor</th><th className="px-4 py-2 text-left">Low Case</th><th className="px-4 py-2 text-left">Base Case</th><th className="px-4 py-2 text-left">High Case</th><th className="w-10"></th></tr></thead>
              <tbody>
                {fi.sensitivityFactors.map((f, i) => (
                  <tr key={i} className="border-t border-neutral-lighter">
                    <td className="px-4 py-2">{f.factor}</td><td className="px-4 py-2">{f.lowCase}</td><td className="px-4 py-2">{f.baseCase}</td><td className="px-4 py-2">{f.highCase}</td>
                    <td className="px-4 py-2"><button className="cursor-pointer text-red-400" onClick={() => save({ ...fi, sensitivityFactors: fi.sensitivityFactors.filter((_, j) => j !== i) })}><Trash2 className="w-3 h-3" /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex gap-2 flex-wrap">
            <Input placeholder="Factor" value={newFactor.factor} onChange={(e) => setNewFactor({ ...newFactor, factor: e.target.value })} />
            <Input placeholder="Low" value={newFactor.low} onChange={(e) => setNewFactor({ ...newFactor, low: e.target.value })} />
            <Input placeholder="Base" value={newFactor.base} onChange={(e) => setNewFactor({ ...newFactor, base: e.target.value })} />
            <Input placeholder="High" value={newFactor.high} onChange={(e) => setNewFactor({ ...newFactor, high: e.target.value })} />
            <Button variant="secondary" onClick={() => {
              if (newFactor.factor) {
                save({ ...fi, sensitivityFactors: [...fi.sensitivityFactors, { factor: newFactor.factor, lowCase: newFactor.low, baseCase: newFactor.base, highCase: newFactor.high }] });
                setNewFactor({ factor: "", low: "", base: "", high: "" });
              }
            }}>Add</Button>
          </div>

          <div className="flex justify-between mt-4">
            <Button variant="secondary" onClick={() => setStep(1)}>← Back</Button>
            <Button variant="primary" onClick={() => setStep(3)}>Next: Board Approval →</Button>
          </div>
        </Card>
      )}

      {step === 3 && (
        <Card>
          <h2 className="text-[18px] text-primary mb-4">Board Approval</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
            <Input label="Meeting Date" type="date" value={fi.boardApproval?.date || ""} onChange={(e) => save({ ...fi, boardApproval: { date: e.target.value, approved: fi.boardApproval?.approved || false, attendees: fi.boardApproval?.attendees || "" } })} />
            <Input label="Attendees" value={fi.boardApproval?.attendees || ""} onChange={(e) => save({ ...fi, boardApproval: { ...fi.boardApproval!, attendees: e.target.value } })} />
          </div>
          <label className="flex items-center gap-2 text-[14px] cursor-pointer mb-4">
            <input type="checkbox" checked={fi.boardApproval?.approved || false} onChange={(e) => save({ ...fi, boardApproval: { ...fi.boardApproval!, approved: e.target.checked }, status: e.target.checked ? "board_approved" : "complete" })} />
            Board has approved this financial impact model
          </label>
          {fi.boardApproval?.approved && (
            <div className="bg-green-50 border border-green-200 rounded-[var(--radius-sm)] p-4 flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              <p className="text-[14px] text-green-700">Financial Impact Model approved on {fi.boardApproval.date}</p>
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-[var(--radius-sm)] p-4 mt-4">
            <p className="text-[13px] font-medium text-blue-800 mb-2">Summary</p>
            <p className="text-[13px] text-blue-700">
              Total Transition Capex: {fmt(fi.transitionCostTotal)} · {fi.projections.length} year(s) modeled ·{" "}
              {fi.fundingSources.length} funding source(s) · {fi.sensitivityFactors.length} sensitivity factor(s) ·{" "}
              ROI: {fi.roiOnGreenCapex || "Not set"} · Credit: {fi.creditRatingImpact || "Not set"}
            </p>
          </div>

          <div className="flex justify-between mt-4">
            <Button variant="secondary" onClick={() => setStep(2)}>← Back</Button>
            <Button variant="primary" onClick={() => save({ ...fi, status: fi.boardApproval?.approved ? "board_approved" : "complete" })}>Save Financial Impact Model</Button>
          </div>
        </Card>
      )}
    </div>
  );
}
