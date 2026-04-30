"use client";

import { useSteinwall } from "@/lib/context";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, CheckCircle2, DollarSign, AlertTriangle, Shield } from "lucide-react";
import { useState } from "react";
import { v4 as uuid } from "uuid";
import type { FinancialImpactModel, FinancialImpactYear, CapexBreakdown, StrandedAssetCategory, FundingGapAnalysis } from "@/lib/types";
import { capexCategoryTemplates, strandedAssetCategoryTemplates, mitigationStrategyOptions } from "@/lib/nfrs-gap-data";
import { HelpField } from "@/components/ui/help-field";
import { financialHelp } from "@/lib/help-content";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";

const emptyYear = (year: number): FinancialImpactYear => ({
  year, capex: 0, opexChange: 0, revenueAtRisk: 0, strandedAssets: 0, dividendImpact: 0, debtCapacity: 0,
});

const emptyCapex = (cat: string, desc: string, isTransition: boolean): CapexBreakdown => ({
  id: uuid(), category: cat, description: desc, annualAmount: 0, isTransition,
});

const emptyStrandedAsset = (name: string): StrandedAssetCategory => ({
  id: uuid(), name, bookValue: 0, bauWritedown: 0, bauProbability: 40,
  aligned15cWritedown: 0, aligned15cProbability: 50, stressWritedown: 0, stressProbability: 10,
  probabilityWeightedRisk: 0, mitigationStrategy: "none", mitigationDescription: "", mitigationSalvageValue: 0,
});

const emptyFundingGap = (): FundingGapAnalysis => ({
  totalCapexNeeded: 0, operatingCashFlow: 0, greenBonds: 0, assetSales: 0,
  govIncentives: 0, debtCapacity: 0, fundingGap: 0, gapStrategy: "",
});

function calcProbabilityWeighted(asset: StrandedAssetCategory): number {
  return Math.round(
    (asset.bauProbability / 100 * asset.bauWritedown) +
    (asset.aligned15cProbability / 100 * asset.aligned15cWritedown) +
    (asset.stressProbability / 100 * asset.stressWritedown)
  );
}

export default function FinancialImpactPage() {
  const { data, update, hydrated } = useSteinwall();
  const [step, setStep] = useState(0);
  const [newSource, setNewSource] = useState({ source: "", amount: "" });
  const [newFactor, setNewFactor] = useState({ factor: "", low: "", base: "", high: "" });

  const fi: FinancialImpactModel = data.financialImpact || {
    currentEbitda: 0, currentRevenue: 0, currency: "RM",
    projections: [emptyYear(2025), emptyYear(2030), emptyYear(2035), emptyYear(2040), emptyYear(2050)],
    bauCapex: [], transitionCapex: [], transitionCostTotal: 0,
    strandedAssets: [], totalStrandedRisk: 0,
    fundingGap: emptyFundingGap(),
    roiOnGreenCapex: "", creditRatingImpact: "",
    fundingSources: [], sensitivityFactors: [],
    status: "draft" as const, updatedAt: new Date().toISOString(),
  };

  const save = (updated: FinancialImpactModel) => {
    const totalBau = updated.bauCapex.reduce((s, c) => s + c.annualAmount, 0);
    const totalTransition = updated.transitionCapex.reduce((s, c) => s + c.annualAmount, 0);
    const strandedAssets = updated.strandedAssets.map((a) => ({ ...a, probabilityWeightedRisk: calcProbabilityWeighted(a) }));
    const totalStrandedRisk = strandedAssets.reduce((s, a) => s + a.probabilityWeightedRisk, 0);
    const totalCapexNeeded = totalBau + totalTransition;
    const fg = updated.fundingGap;
    const totalFunding = fg.operatingCashFlow + fg.greenBonds + fg.assetSales + fg.govIncentives + fg.debtCapacity;
    const fundingGap = { ...fg, totalCapexNeeded, fundingGap: totalCapexNeeded - totalFunding };
    update({
      financialImpact: {
        ...updated, transitionCostTotal: totalTransition, strandedAssets,
        totalStrandedRisk, fundingGap, updatedAt: new Date().toISOString(),
      },
    });
  };

  if (!hydrated) return <div className="flex items-center justify-center h-64"><p className="text-text-secondary text-[14px]">Loading...</p></div>;

  const steps = ["Baseline", "BAU vs Transition Capex", "Year-by-Year Projections", "Stranded Assets", "Funding & ROI", "Sensitivity & Approval"];
  const fmt = (n: number) => `${fi.currency} ${n.toLocaleString()}M`;
  const totalBau = fi.bauCapex.reduce((s, c) => s + c.annualAmount, 0);
  const totalTransition = fi.transitionCapex.reduce((s, c) => s + c.annualAmount, 0);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-[28px] text-primary">Financial Impact Quantification</h1>
        <p className="text-text-secondary text-[14px]">IFRS S2 Core — Capex modeling, stranded asset assessment, funding gap analysis, ROI</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="border border-neutral-lighter rounded-[var(--radius-sm)] p-3 text-center">
          <p className="text-[22px] font-semibold text-primary">{fmt(totalBau)}</p>
          <p className="text-[12px] text-text-secondary">BAU Capex/yr</p>
        </div>
        <div className="border border-neutral-lighter rounded-[var(--radius-sm)] p-3 text-center">
          <p className="text-[22px] font-semibold text-green-600">{fmt(totalTransition)}</p>
          <p className="text-[12px] text-text-secondary">Transition Capex/yr</p>
        </div>
        <div className="border border-neutral-lighter rounded-[var(--radius-sm)] p-3 text-center">
          <p className="text-[22px] font-semibold text-red-600">{fmt(fi.totalStrandedRisk)}</p>
          <p className="text-[12px] text-text-secondary">Stranded Risk (Weighted)</p>
        </div>
        <div className="border border-neutral-lighter rounded-[var(--radius-sm)] p-3 text-center">
          <p className={`text-[22px] font-semibold ${fi.fundingGap.fundingGap > 0 ? "text-red-600" : "text-green-600"}`}>
            {fi.fundingGap.fundingGap > 0 ? fmt(fi.fundingGap.fundingGap) : "Covered"}
          </p>
          <p className="text-[12px] text-text-secondary">Funding Gap</p>
        </div>
      </div>

      <div className="flex gap-2 mb-6 flex-wrap">
        {steps.map((s, i) => (
          <button key={s} onClick={() => setStep(i)} className={`px-3 py-1.5 rounded-full text-[12px] font-medium cursor-pointer transition-colors ${step === i ? "bg-primary text-white" : i < step ? "bg-green-100 text-green-700" : "bg-neutral-light text-text-secondary"}`}>
            {i < step ? "✓ " : ""}{s}
          </button>
        ))}
      </div>

      {/* Step 0: Baseline */}
      {step === 0 && (
        <Card>
          <h2 className="text-[18px] text-primary mb-4">Financial Baseline (Current State)</h2>
          <p className="text-[13px] text-text-secondary mb-4">Auditors want to see your starting position before modeling transition impact.</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
            <Input label={`Current Revenue (${fi.currency} millions)`} type="number" value={fi.currentRevenue || ""} onChange={(e) => save({ ...fi, currentRevenue: parseFloat(e.target.value) || 0 })} />
            <Input label={`Current EBITDA (${fi.currency} millions)`} type="number" value={fi.currentEbitda || ""} onChange={(e) => save({ ...fi, currentEbitda: parseFloat(e.target.value) || 0 })} />
            <Input label="Currency" value={fi.currency} onChange={(e) => save({ ...fi, currency: e.target.value })} />
          </div>

          {fi.currentEbitda > 0 && fi.currentRevenue > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-[var(--radius-sm)] p-3">
              <p className="text-[13px] text-blue-700">EBITDA Margin: {((fi.currentEbitda / fi.currentRevenue) * 100).toFixed(1)}%</p>
            </div>
          )}

          <div className="flex justify-end mt-4">
            <Button variant="primary" onClick={() => setStep(1)}>Next: Capex Breakdown →</Button>
          </div>
        </Card>
      )}

      {/* Step 1: BAU vs Transition Capex */}
      {step === 1 && (
        <Card>
          <HelpField
            label="Capex Breakdown: BAU vs Transition"
            tooltip={financialHelp.capexBreakdown.tooltip}
            modal={financialHelp.capexBreakdown.modal}
          >
            <p className="text-[13px] text-text-secondary mb-4">&ldquo;If you do nothing vs. if you transition — how much capex do you need?&rdquo;</p>
          </HelpField>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* BAU Capex */}
            <div>
              <p className="text-[14px] font-medium text-text-primary mb-2">BAU Capex (Maintenance / No Transition)</p>
              {fi.bauCapex.map((c, ci) => (
                <div key={c.id} className="flex gap-2 mb-2 items-end">
                  <Input label={ci === 0 ? "Category" : undefined} className="flex-1" value={c.category} onChange={(e) => { const u = [...fi.bauCapex]; u[ci] = { ...c, category: e.target.value }; save({ ...fi, bauCapex: u }); }} />
                  <Input label={ci === 0 ? `${fi.currency}M/yr` : undefined} type="number" className="w-24" value={c.annualAmount || ""} onChange={(e) => { const u = [...fi.bauCapex]; u[ci] = { ...c, annualAmount: parseFloat(e.target.value) || 0 }; save({ ...fi, bauCapex: u }); }} />
                  <button className="cursor-pointer text-red-400 mb-1" onClick={() => save({ ...fi, bauCapex: fi.bauCapex.filter((_, i) => i !== ci) })}><Trash2 className="w-4 h-4" /></button>
                </div>
              ))}
              <div className="flex gap-2 flex-wrap mt-2">
                {capexCategoryTemplates.filter((t) => !t.isTransition).map((t) => {
                  const exists = fi.bauCapex.some((c) => c.category === t.category);
                  return (
                    <button key={t.category} className={`text-[11px] px-2 py-1 rounded cursor-pointer ${exists ? "bg-green-100 text-green-700" : "bg-neutral-light text-text-secondary hover:bg-primary-light"}`}
                      onClick={() => { if (!exists) save({ ...fi, bauCapex: [...fi.bauCapex, emptyCapex(t.category, t.description, false)] }); }}>
                      {exists ? "✓ " : "+ "}{t.category}
                    </button>
                  );
                })}
              </div>
              <div className="bg-neutral-light rounded p-2 mt-2 text-[13px] font-medium">Total BAU: {fmt(totalBau)}/year</div>
            </div>

            {/* Transition Capex */}
            <div>
              <p className="text-[14px] font-medium text-green-700 mb-2">Transition Capex (Decarbonization)</p>
              {fi.transitionCapex.map((c, ci) => (
                <div key={c.id} className="flex gap-2 mb-2 items-end">
                  <Input label={ci === 0 ? "Category" : undefined} className="flex-1" value={c.category} onChange={(e) => { const u = [...fi.transitionCapex]; u[ci] = { ...c, category: e.target.value }; save({ ...fi, transitionCapex: u }); }} />
                  <Input label={ci === 0 ? `${fi.currency}M/yr` : undefined} type="number" className="w-24" value={c.annualAmount || ""} onChange={(e) => { const u = [...fi.transitionCapex]; u[ci] = { ...c, annualAmount: parseFloat(e.target.value) || 0 }; save({ ...fi, transitionCapex: u }); }} />
                  <button className="cursor-pointer text-red-400 mb-1" onClick={() => save({ ...fi, transitionCapex: fi.transitionCapex.filter((_, i) => i !== ci) })}><Trash2 className="w-4 h-4" /></button>
                </div>
              ))}
              <div className="flex gap-2 flex-wrap mt-2">
                {capexCategoryTemplates.filter((t) => t.isTransition).map((t) => {
                  const exists = fi.transitionCapex.some((c) => c.category === t.category);
                  return (
                    <button key={t.category} className={`text-[11px] px-2 py-1 rounded cursor-pointer ${exists ? "bg-green-100 text-green-700" : "bg-neutral-light text-text-secondary hover:bg-primary-light"}`}
                      onClick={() => { if (!exists) save({ ...fi, transitionCapex: [...fi.transitionCapex, emptyCapex(t.category, t.description, true)] }); }}>
                      {exists ? "✓ " : "+ "}{t.category}
                    </button>
                  );
                })}
              </div>
              <div className="bg-green-50 border border-green-200 rounded p-2 mt-2 text-[13px] font-medium text-green-700">Total Transition: {fmt(totalTransition)}/year</div>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-[var(--radius-sm)] p-3 mt-4">
            <p className="text-[13px] text-amber-800">
              <DollarSign className="w-4 h-4 inline" /> Additional capex needed above BAU: {fmt(totalTransition)} /year
              {totalTransition > 0 && fi.currentEbitda > 0 && <span> ({((totalTransition / fi.currentEbitda) * 100).toFixed(1)}% of EBITDA)</span>}
            </p>
          </div>

          <div className="flex justify-between mt-4">
            <Button variant="secondary" onClick={() => setStep(0)}>← Back</Button>
            <Button variant="primary" onClick={() => setStep(2)}>Next: Year-by-Year Projections →</Button>
          </div>
        </Card>
      )}

      {/* Step 2: Year-by-Year Projections */}
      {step === 2 && (
        <Card>
          <h2 className="text-[18px] text-primary mb-4">Year-by-Year Financial Projections</h2>
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

          <div className="flex gap-2 mt-3">
            <Button variant="secondary" size="sm" onClick={() => {
              const lastYear = fi.projections.length > 0 ? fi.projections[fi.projections.length - 1].year + 5 : 2025;
              save({ ...fi, projections: [...fi.projections, emptyYear(lastYear)] });
            }}><Plus className="w-3 h-3" /> Add Year</Button>
          </div>

          {/* Capex Roadmap Chart */}
          {fi.projections.some((p) => p.capex > 0) && (
            <div className="mt-4">
              <p className="text-[13px] font-medium text-text-primary mb-2">Capex Roadmap</p>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={fi.projections.filter((p) => p.capex > 0 || p.opexChange > 0 || p.revenueAtRisk > 0)} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                    <XAxis dataKey="year" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 11 }} label={{ value: `${fi.currency}M`, angle: -90, position: "insideLeft", style: { fontSize: 11 } }} />
                    <Tooltip formatter={(value) => `${fi.currency} ${Number(value).toLocaleString()}M`} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Bar dataKey="capex" stackId="costs" fill="#3b82f6" name="Capex" />
                    <Bar dataKey="opexChange" stackId="costs" fill="#f59e0b" name="OpEx Change" />
                    <Bar dataKey="revenueAtRisk" stackId="costs" fill="#ef4444" name="Revenue at Risk" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Funding Waterfall */}
          {(totalBau > 0 || totalTransition > 0) && (
            <div className="mt-4">
              <p className="text-[13px] font-medium text-text-primary mb-2">Funding vs Capex Need</p>
              <div className="flex items-end gap-2 h-[120px]">
                {(() => {
                  const totalNeeded = totalBau + totalTransition;
                  const fg = fi.fundingGap;
                  const totalFunding = fg.operatingCashFlow + fg.greenBonds + fg.assetSales + fg.govIncentives + fg.debtCapacity;
                  const maxH = Math.max(totalNeeded, totalFunding, 1);
                  const bar = (val: number, color: string, label: string) => (
                    <div className="flex flex-col items-center flex-1">
                      <div className={`${color} rounded-t w-full`} style={{ height: `${Math.max(4, (val / maxH) * 100)}px` }} />
                      <p className="text-[10px] text-text-secondary mt-1 text-center">{label}</p>
                      <p className="text-[11px] font-medium">{fmt(val)}</p>
                    </div>
                  );
                  return (
                    <>
                      {bar(totalNeeded, "bg-red-400", "Total Capex")}
                      {fg.operatingCashFlow > 0 && bar(fg.operatingCashFlow, "bg-green-400", "Cash Flow")}
                      {fg.greenBonds > 0 && bar(fg.greenBonds, "bg-green-500", "Green Bonds")}
                      {fg.assetSales > 0 && bar(fg.assetSales, "bg-blue-400", "Asset Sales")}
                      {fg.govIncentives > 0 && bar(fg.govIncentives, "bg-blue-500", "Gov Incentives")}
                      {fg.debtCapacity > 0 && bar(fg.debtCapacity, "bg-purple-400", "Debt")}
                      {fi.fundingGap.fundingGap > 0 && bar(fi.fundingGap.fundingGap, "bg-red-600", "GAP")}
                    </>
                  );
                })()}
              </div>
            </div>
          )}

          <div className="flex justify-between mt-4">
            <Button variant="secondary" onClick={() => setStep(1)}>← Back</Button>
            <Button variant="primary" onClick={() => setStep(3)}>Next: Stranded Assets →</Button>
          </div>
        </Card>
      )}

      {/* Step 3: Stranded Asset Assessment */}
      {step === 3 && (
        <Card>
          <HelpField
            label="Stranded Asset Assessment"
            tooltip={financialHelp.strandedAssets.tooltip}
            modal={financialHelp.strandedAssets.modal}
          >
            <p className="text-[13px] text-text-secondary mb-4">
              &ldquo;Stranded assets&rdquo; = assets that become worthless due to climate transition. Auditors ask: &ldquo;Do you have a realistic estimate?&rdquo;
            </p>
          </HelpField>

          <div className="flex gap-2 flex-wrap mb-4">
            {strandedAssetCategoryTemplates.map((t) => {
              const exists = fi.strandedAssets.some((a) => a.name === t.name);
              return (
                <button key={t.name} className={`text-[11px] px-2 py-1 rounded cursor-pointer ${exists ? "bg-green-100 text-green-700" : "bg-neutral-light text-text-secondary hover:bg-primary-light"}`}
                  onClick={() => { if (!exists) save({ ...fi, strandedAssets: [...fi.strandedAssets, emptyStrandedAsset(t.name)] }); }}>
                  {exists ? "✓ " : "+ "}{t.name}
                </button>
              );
            })}
          </div>

          {fi.strandedAssets.map((asset, ai) => (
            <div key={asset.id} className="border border-neutral-lighter rounded-[var(--radius-sm)] p-4 mb-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-primary" />
                  <span className="text-[14px] font-medium">{asset.name}</span>
                  <Badge variant={asset.probabilityWeightedRisk > 0 ? "error" : "neutral"}>Risk: {fmt(asset.probabilityWeightedRisk)}</Badge>
                </div>
                <button className="cursor-pointer text-red-400" onClick={() => save({ ...fi, strandedAssets: fi.strandedAssets.filter((_, i) => i !== ai) })}><Trash2 className="w-4 h-4" /></button>
              </div>

              <Input label={`Book Value (${fi.currency}M)`} type="number" value={asset.bookValue || ""} onChange={(e) => { const u = [...fi.strandedAssets]; u[ai] = { ...asset, bookValue: parseFloat(e.target.value) || 0 }; save({ ...fi, strandedAssets: u }); }} />

              <p className="text-[13px] font-medium text-text-primary mt-3 mb-2">Write-down Risk by Scenario</p>
              <div className="overflow-x-auto">
                <table className="w-full text-[12px] border border-neutral-lighter rounded">
                  <thead className="bg-neutral-light">
                    <tr>
                      <th className="px-3 py-1 text-left">Scenario</th>
                      <th className="px-3 py-1 text-left">Probability (%)</th>
                      <th className="px-3 py-1 text-left">Write-down ({fi.currency}M)</th>
                      <th className="px-3 py-1 text-left">Weighted Risk</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-t border-neutral-lighter">
                      <td className="px-3 py-1"><Badge className="bg-amber-100 text-amber-800">BAU</Badge></td>
                      <td className="px-3 py-1"><input type="number" className="w-16 border rounded px-1 text-[12px]" value={asset.bauProbability} onChange={(e) => { const u = [...fi.strandedAssets]; u[ai] = { ...asset, bauProbability: parseFloat(e.target.value) || 0 }; save({ ...fi, strandedAssets: u }); }} /></td>
                      <td className="px-3 py-1"><input type="number" className="w-20 border rounded px-1 text-[12px]" value={asset.bauWritedown || ""} onChange={(e) => { const u = [...fi.strandedAssets]; u[ai] = { ...asset, bauWritedown: parseFloat(e.target.value) || 0 }; save({ ...fi, strandedAssets: u }); }} /></td>
                      <td className="px-3 py-1 text-text-secondary">{fmt(Math.round(asset.bauProbability / 100 * asset.bauWritedown))}</td>
                    </tr>
                    <tr className="border-t border-neutral-lighter">
                      <td className="px-3 py-1"><Badge className="bg-green-100 text-green-800">1.5°C</Badge></td>
                      <td className="px-3 py-1"><input type="number" className="w-16 border rounded px-1 text-[12px]" value={asset.aligned15cProbability} onChange={(e) => { const u = [...fi.strandedAssets]; u[ai] = { ...asset, aligned15cProbability: parseFloat(e.target.value) || 0 }; save({ ...fi, strandedAssets: u }); }} /></td>
                      <td className="px-3 py-1"><input type="number" className="w-20 border rounded px-1 text-[12px]" value={asset.aligned15cWritedown || ""} onChange={(e) => { const u = [...fi.strandedAssets]; u[ai] = { ...asset, aligned15cWritedown: parseFloat(e.target.value) || 0 }; save({ ...fi, strandedAssets: u }); }} /></td>
                      <td className="px-3 py-1 text-text-secondary">{fmt(Math.round(asset.aligned15cProbability / 100 * asset.aligned15cWritedown))}</td>
                    </tr>
                    <tr className="border-t border-neutral-lighter">
                      <td className="px-3 py-1"><Badge className="bg-red-100 text-red-800">Stress</Badge></td>
                      <td className="px-3 py-1"><input type="number" className="w-16 border rounded px-1 text-[12px]" value={asset.stressProbability} onChange={(e) => { const u = [...fi.strandedAssets]; u[ai] = { ...asset, stressProbability: parseFloat(e.target.value) || 0 }; save({ ...fi, strandedAssets: u }); }} /></td>
                      <td className="px-3 py-1"><input type="number" className="w-20 border rounded px-1 text-[12px]" value={asset.stressWritedown || ""} onChange={(e) => { const u = [...fi.strandedAssets]; u[ai] = { ...asset, stressWritedown: parseFloat(e.target.value) || 0 }; save({ ...fi, strandedAssets: u }); }} /></td>
                      <td className="px-3 py-1 text-text-secondary">{fmt(Math.round(asset.stressProbability / 100 * asset.stressWritedown))}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="bg-red-50 border border-red-200 rounded p-2 mt-2 text-[13px]">
                <AlertTriangle className="w-4 h-4 inline text-red-600 mr-1" />
                Probability-Weighted Risk: <span className="font-medium">{fmt(asset.probabilityWeightedRisk)}</span>
                {asset.bookValue > 0 && <span className="text-text-secondary"> ({((asset.probabilityWeightedRisk / asset.bookValue) * 100).toFixed(0)}% of book value)</span>}
              </div>

              <p className="text-[13px] font-medium text-text-primary mt-3 mb-2">Mitigation Strategy</p>
              <div className="flex flex-col gap-1 mb-2">
                {mitigationStrategyOptions.map((opt) => (
                  <label key={opt.value} className={`flex items-start gap-2 p-2 rounded text-[13px] cursor-pointer ${asset.mitigationStrategy === opt.value ? "bg-blue-50 border border-blue-200" : "hover:bg-neutral-light"}`}>
                    <input type="radio" name={`mit-${asset.id}`} checked={asset.mitigationStrategy === opt.value} onChange={() => { const u = [...fi.strandedAssets]; u[ai] = { ...asset, mitigationStrategy: opt.value }; save({ ...fi, strandedAssets: u }); }} className="mt-0.5" />
                    <div>
                      <span className="font-medium">{opt.label}</span>
                      <p className="text-text-secondary">{opt.description}</p>
                    </div>
                  </label>
                ))}
              </div>
              {asset.mitigationStrategy !== "none" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                  <div>
                    <label className="text-[13px] font-medium text-text-primary mb-1 block">Mitigation Description</label>
                    <textarea className="w-full border border-neutral-lighter rounded px-2 py-1 text-[13px] min-h-[60px]" placeholder="Describe your mitigation plan..." value={asset.mitigationDescription} onChange={(e) => { const u = [...fi.strandedAssets]; u[ai] = { ...asset, mitigationDescription: e.target.value }; save({ ...fi, strandedAssets: u }); }} />
                  </div>
                  <Input label={`Salvage Value (${fi.currency}M)`} type="number" placeholder="Expected recovery" value={asset.mitigationSalvageValue || ""} onChange={(e) => { const u = [...fi.strandedAssets]; u[ai] = { ...asset, mitigationSalvageValue: parseFloat(e.target.value) || 0 }; save({ ...fi, strandedAssets: u }); }} />
                </div>
              )}
            </div>
          ))}

          {fi.strandedAssets.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-[var(--radius-sm)] p-4">
              <p className="text-[14px] font-medium text-red-800 mb-2">Total Stranded Asset Exposure</p>
              <p className="text-[13px] text-red-700">
                Total Book Value: {fmt(fi.strandedAssets.reduce((s, a) => s + a.bookValue, 0))} ·{" "}
                Probability-Weighted Risk: {fmt(fi.totalStrandedRisk)} ·{" "}
                After Mitigation Salvage: {fmt(fi.totalStrandedRisk - fi.strandedAssets.reduce((s, a) => s + a.mitigationSalvageValue, 0))}
              </p>
            </div>
          )}

          <div className="flex justify-between mt-4">
            <Button variant="secondary" onClick={() => setStep(2)}>← Back</Button>
            <Button variant="primary" onClick={() => setStep(4)}>Next: Funding & ROI →</Button>
          </div>
        </Card>
      )}

      {/* Step 4: Funding Sources & ROI */}
      {step === 4 && (
        <Card>
          <h2 className="text-[18px] text-primary mb-4">Funding Sources, Gap Analysis & ROI</h2>

          <div className="bg-neutral-light rounded-[var(--radius-sm)] p-4 mb-6">
            <p className="text-[13px] font-medium mb-2">Funding Gap Analysis</p>
            <p className="text-[13px] text-text-secondary mb-3">Annual transition capex needed: {fmt(totalBau + totalTransition)}</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <Input label={`Operating Cash Flow (${fi.currency}M/yr)`} type="number" value={fi.fundingGap.operatingCashFlow || ""} onChange={(e) => save({ ...fi, fundingGap: { ...fi.fundingGap, operatingCashFlow: parseFloat(e.target.value) || 0 } })} />
              <Input label={`Green Bonds (${fi.currency}M/yr)`} type="number" value={fi.fundingGap.greenBonds || ""} onChange={(e) => save({ ...fi, fundingGap: { ...fi.fundingGap, greenBonds: parseFloat(e.target.value) || 0 } })} />
              <Input label={`Asset Sales (${fi.currency}M/yr)`} type="number" value={fi.fundingGap.assetSales || ""} onChange={(e) => save({ ...fi, fundingGap: { ...fi.fundingGap, assetSales: parseFloat(e.target.value) || 0 } })} />
              <Input label={`Gov Incentives (${fi.currency}M/yr)`} type="number" value={fi.fundingGap.govIncentives || ""} onChange={(e) => save({ ...fi, fundingGap: { ...fi.fundingGap, govIncentives: parseFloat(e.target.value) || 0 } })} />
              <Input label={`Debt Capacity (${fi.currency}M/yr)`} type="number" value={fi.fundingGap.debtCapacity || ""} onChange={(e) => save({ ...fi, fundingGap: { ...fi.fundingGap, debtCapacity: parseFloat(e.target.value) || 0 } })} />
            </div>
            <div className={`rounded p-2 mt-3 text-[13px] font-medium ${fi.fundingGap.fundingGap <= 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
              {fi.fundingGap.fundingGap <= 0
                ? `Fully funded — ${fmt(Math.abs(fi.fundingGap.fundingGap))} surplus`
                : `Funding gap: ${fmt(fi.fundingGap.fundingGap)} — need additional sources`}
            </div>
            {fi.fundingGap.fundingGap > 0 && (
              <div className="mt-2">
                <label className="text-[13px] font-medium text-text-primary mb-1 block">Gap Strategy</label>
                <textarea className="w-full border border-neutral-lighter rounded px-2 py-1 text-[13px] min-h-[60px]" placeholder="e.g. Reduce dividend from RM 40B to RM 30B, issue RM 5B green bonds..." value={fi.fundingGap.gapStrategy} onChange={(e) => save({ ...fi, fundingGap: { ...fi.fundingGap, gapStrategy: e.target.value } })} />
              </div>
            )}
          </div>

          <div className="mb-6">
            <label className="text-[13px] font-medium text-text-primary mb-1 block">Additional Funding Sources</label>
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
              <Input placeholder="Source" value={newSource.source} onChange={(e) => setNewSource({ ...newSource, source: e.target.value })} />
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
            <Button variant="secondary" onClick={() => setStep(3)}>← Back</Button>
            <Button variant="primary" onClick={() => setStep(5)}>Next: Sensitivity & Approval →</Button>
          </div>
        </Card>
      )}

      {/* Step 5: Sensitivity & Board Approval */}
      {step === 5 && (
        <Card>
          <h2 className="text-[18px] text-primary mb-4">Sensitivity Analysis & Board Approval</h2>
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

          <div className="flex gap-2 flex-wrap mb-6">
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
            <Input label="Meeting Date" type="date" value={fi.boardApproval?.date || ""} onChange={(e) => save({ ...fi, boardApproval: { date: e.target.value, approved: fi.boardApproval?.approved || false, attendees: fi.boardApproval?.attendees || "" } })} />
            <Input label="Attendees" value={fi.boardApproval?.attendees || ""} onChange={(e) => save({ ...fi, boardApproval: { ...fi.boardApproval!, attendees: e.target.value } })} />
          </div>
          <label className="flex items-center gap-2 text-[14px] cursor-pointer mb-4">
            <input type="checkbox" checked={fi.boardApproval?.approved || false} onChange={(e) => save({ ...fi, boardApproval: { ...fi.boardApproval!, approved: e.target.checked }, status: e.target.checked ? "board_approved" : "complete" })} />
            Board has approved this financial impact model
          </label>
          {fi.boardApproval?.approved && (
            <div className="bg-green-50 border border-green-200 rounded-[var(--radius-sm)] p-4 flex items-center gap-3 mb-4">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              <p className="text-[14px] text-green-700">Financial Impact Model approved on {fi.boardApproval.date}</p>
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-[var(--radius-sm)] p-4">
            <p className="text-[13px] font-medium text-blue-800 mb-2">Summary</p>
            <p className="text-[13px] text-blue-700">
              BAU Capex: {fmt(totalBau)}/yr · Transition Capex: {fmt(totalTransition)}/yr ·{" "}
              Stranded Risk: {fmt(fi.totalStrandedRisk)} · Funding: {fi.fundingGap.fundingGap <= 0 ? "Covered" : `Gap ${fmt(fi.fundingGap.fundingGap)}`} ·{" "}
              ROI: {fi.roiOnGreenCapex || "Not set"} · Credit: {fi.creditRatingImpact || "Not set"} ·{" "}
              {fi.sensitivityFactors.length} sensitivity factor(s)
            </p>
          </div>

          <div className="flex justify-between mt-4">
            <Button variant="secondary" onClick={() => setStep(4)}>← Back</Button>
            <Button variant="primary" onClick={() => save({ ...fi, status: fi.boardApproval?.approved ? "board_approved" : "complete" })}>Save Financial Impact Model</Button>
          </div>
        </Card>
      )}
    </div>
  );
}
