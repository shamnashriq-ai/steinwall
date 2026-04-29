"use client";

import { useSteinwall } from "@/lib/context";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, ChevronDown, ChevronRight, CheckCircle2, Zap } from "lucide-react";
import { useState } from "react";
import { v4 as uuid } from "uuid";
import type { ScenarioAnalysis, ClimateScenario } from "@/lib/types";
import { scenarioTemplates } from "@/lib/nfrs-gap-data";

export default function ScenarioAnalysisPage() {
  const { data, update, hydrated } = useSteinwall();
  const [step, setStep] = useState(0);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [newSens, setNewSens] = useState({ price: "", impact: "" });

  const sa = data.scenarioAnalysis || {
    scenarios: [],
    carbonPriceSensitivity: [],
    selectedPathway: "",
    status: "draft" as const,
    updatedAt: new Date().toISOString(),
  };

  const save = (updated: ScenarioAnalysis) => {
    update({ scenarioAnalysis: { ...updated, updatedAt: new Date().toISOString() } });
  };

  if (!hydrated) return <div className="flex items-center justify-center h-64"><p className="text-text-secondary text-[14px]">Loading...</p></div>;

  const steps = ["Define Scenarios", "Carbon Price Sensitivity", "Select Pathway", "Board Approval"];
  const scenarioColors: Record<string, string> = { bau: "bg-amber-100 text-amber-800", "1.5c": "bg-green-100 text-green-800", "2c": "bg-blue-100 text-blue-800", stress: "bg-red-100 text-red-800" };

  const addFromTemplate = (t: typeof scenarioTemplates[number]) => {
    const exists = sa.scenarios.some((s) => s.type === t.type);
    if (exists) return;
    const scenario: ClimateScenario = {
      id: uuid(),
      name: t.name,
      type: t.type,
      description: t.description,
      assumptions: t.defaultAssumptions,
      revenueImpact: "",
      ebitdaImpact: "",
      capexRequired: "",
      strandedAssetRisk: "",
      timeline: "",
      strategyResponse: "",
      confidence: 50,
    };
    save({ ...sa, scenarios: [...sa.scenarios, scenario] });
    setExpanded(scenario.id);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-[28px] text-primary">Climate Scenario Analysis</h1>
        <p className="text-text-secondary text-[14px]">IFRS S2 Critical — Model 1.5°C, 2°C, BAU and stress scenarios with financial impact</p>
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
          <h2 className="text-[18px] text-primary mb-4">Define Climate Scenarios</h2>
          <p className="text-[13px] text-text-secondary mb-4">IFRS S2 requires at least 3 scenarios. Use templates below or create custom scenarios.</p>

          <div className="flex gap-2 flex-wrap mb-4">
            {scenarioTemplates.map((t) => {
              const exists = sa.scenarios.some((s) => s.type === t.type);
              return (
                <button key={t.id} onClick={() => addFromTemplate(t)} className={`px-3 py-1.5 rounded-full text-[12px] font-medium cursor-pointer transition-colors ${exists ? "bg-green-100 text-green-700" : "bg-neutral-light text-text-secondary hover:bg-primary-light hover:text-primary"}`}>
                  {exists ? "✓ " : "+ "}{t.name}
                </button>
              );
            })}
          </div>

          {sa.scenarios.map((s, si) => {
            const exp = expanded === s.id;
            return (
              <div key={s.id} className="border border-neutral-lighter rounded-[var(--radius-sm)] mb-3">
                <button onClick={() => setExpanded(exp ? null : s.id)} className="w-full flex items-center justify-between p-4 text-left cursor-pointer">
                  <div className="flex items-center gap-3">
                    <Zap className="w-5 h-5 text-primary" />
                    <span className="text-[14px] font-medium">{s.name}</span>
                    <Badge className={scenarioColors[s.type] || ""}>{s.type.toUpperCase()}</Badge>
                  </div>
                  {exp ? <ChevronDown className="w-4 h-4 text-text-secondary" /> : <ChevronRight className="w-4 h-4 text-text-secondary" />}
                </button>
                {exp && (
                  <div className="px-4 pb-4 flex flex-col gap-3 border-t border-neutral-lighter pt-3">
                    <p className="text-[13px] text-text-secondary italic">{s.description}</p>

                    <div>
                      <label className="text-[13px] font-medium text-text-primary mb-1 block">Key Assumptions</label>
                      {s.assumptions.map((a, ai) => (
                        <div key={ai} className="flex gap-2 mb-1">
                          <Input className="flex-1" value={a.factor} onChange={(e) => {
                            const u = [...sa.scenarios]; const assumptions = [...s.assumptions]; assumptions[ai] = { ...a, factor: e.target.value }; u[si] = { ...s, assumptions }; save({ ...sa, scenarios: u });
                          }} />
                          <Input className="flex-1" value={a.value} onChange={(e) => {
                            const u = [...sa.scenarios]; const assumptions = [...s.assumptions]; assumptions[ai] = { ...a, value: e.target.value }; u[si] = { ...s, assumptions }; save({ ...sa, scenarios: u });
                          }} />
                          <button className="cursor-pointer text-red-400" onClick={() => {
                            const u = [...sa.scenarios]; u[si] = { ...s, assumptions: s.assumptions.filter((_, i) => i !== ai) }; save({ ...sa, scenarios: u });
                          }}><Trash2 className="w-4 h-4" /></button>
                        </div>
                      ))}
                      <Button variant="ghost" size="sm" onClick={() => {
                        const u = [...sa.scenarios]; u[si] = { ...s, assumptions: [...s.assumptions, { factor: "", value: "" }] }; save({ ...sa, scenarios: u });
                      }}><Plus className="w-3 h-3" /> Add Assumption</Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <Input label="Revenue Impact" placeholder="e.g. -25% by 2040" value={s.revenueImpact} onChange={(e) => { const u = [...sa.scenarios]; u[si] = { ...s, revenueImpact: e.target.value }; save({ ...sa, scenarios: u }); }} />
                      <Input label="EBITDA Impact" placeholder="e.g. -15% of current" value={s.ebitdaImpact} onChange={(e) => { const u = [...sa.scenarios]; u[si] = { ...s, ebitdaImpact: e.target.value }; save({ ...sa, scenarios: u }); }} />
                      <Input label="Capex Required" placeholder="e.g. RM 50B" value={s.capexRequired} onChange={(e) => { const u = [...sa.scenarios]; u[si] = { ...s, capexRequired: e.target.value }; save({ ...sa, scenarios: u }); }} />
                      <Input label="Stranded Asset Risk" placeholder="e.g. RM 40B write-down" value={s.strandedAssetRisk} onChange={(e) => { const u = [...sa.scenarios]; u[si] = { ...s, strandedAssetRisk: e.target.value }; save({ ...sa, scenarios: u }); }} />
                    </div>

                    <Input label="Timeline" placeholder="e.g. Impacts materialize 2030-2040" value={s.timeline} onChange={(e) => { const u = [...sa.scenarios]; u[si] = { ...s, timeline: e.target.value }; save({ ...sa, scenarios: u }); }} />

                    <div>
                      <label className="text-[13px] font-medium text-text-primary mb-1 block">Strategy Response</label>
                      <textarea className="w-full border border-neutral-lighter rounded-[var(--radius-sm)] px-3 py-2 text-[14px] min-h-[80px]" placeholder="How would the company adapt if this scenario materializes?" value={s.strategyResponse} onChange={(e) => { const u = [...sa.scenarios]; u[si] = { ...s, strategyResponse: e.target.value }; save({ ...sa, scenarios: u }); }} />
                    </div>

                    <div>
                      <label className="text-[13px] font-medium text-text-primary mb-1 block">Confidence Level: {s.confidence}%</label>
                      <input type="range" min="0" max="100" value={s.confidence} className="w-full" onChange={(e) => { const u = [...sa.scenarios]; u[si] = { ...s, confidence: parseInt(e.target.value) }; save({ ...sa, scenarios: u }); }} />
                    </div>

                    <Button variant="ghost" size="sm" className="self-end text-red-500" onClick={() => save({ ...sa, scenarios: sa.scenarios.filter((_, i) => i !== si) })}>
                      <Trash2 className="w-4 h-4" /> Remove Scenario
                    </Button>
                  </div>
                )}
              </div>
            );
          })}

          <div className="flex justify-end mt-4">
            <Button variant="primary" onClick={() => setStep(1)}>Next: Carbon Price Sensitivity →</Button>
          </div>
        </Card>
      )}

      {step === 1 && (
        <Card>
          <h2 className="text-[18px] text-primary mb-4">Carbon Price Sensitivity</h2>
          <p className="text-[13px] text-text-secondary mb-4">Model the impact of different carbon prices on your business.</p>

          <div className="border border-neutral-lighter rounded-[var(--radius-sm)] overflow-hidden mb-4">
            <table className="w-full text-[13px]">
              <thead className="bg-neutral-light">
                <tr><th className="px-4 py-2 text-left">Carbon Price (RM/tonne)</th><th className="px-4 py-2 text-left">Financial Impact</th><th className="px-4 py-2 w-10"></th></tr>
              </thead>
              <tbody>
                {sa.carbonPriceSensitivity.map((cp, i) => (
                  <tr key={i} className="border-t border-neutral-lighter">
                    <td className="px-4 py-2">RM {cp.price}/tonne</td>
                    <td className="px-4 py-2">{cp.impact}</td>
                    <td className="px-4 py-2">
                      <button className="cursor-pointer text-red-400" onClick={() => save({ ...sa, carbonPriceSensitivity: sa.carbonPriceSensitivity.filter((_, j) => j !== i) })}><Trash2 className="w-3 h-3" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex gap-2">
            <Input placeholder="Price (e.g. 50)" value={newSens.price} onChange={(e) => setNewSens({ ...newSens, price: e.target.value })} />
            <Input placeholder="Impact (e.g. RM 500M annual exposure)" value={newSens.impact} onChange={(e) => setNewSens({ ...newSens, impact: e.target.value })} />
            <Button variant="secondary" onClick={() => { if (newSens.price && newSens.impact) { save({ ...sa, carbonPriceSensitivity: [...sa.carbonPriceSensitivity, { price: parseFloat(newSens.price), impact: newSens.impact }] }); setNewSens({ price: "", impact: "" }); } }}>Add</Button>
          </div>

          <div className="flex justify-between mt-4">
            <Button variant="secondary" onClick={() => setStep(0)}>← Back</Button>
            <Button variant="primary" onClick={() => setStep(2)}>Next: Select Pathway →</Button>
          </div>
        </Card>
      )}

      {step === 2 && (
        <Card>
          <h2 className="text-[18px] text-primary mb-4">Select Strategic Pathway</h2>
          <p className="text-[13px] text-text-secondary mb-4">Based on your scenario analysis, which pathway does the company commit to?</p>

          <div className="flex flex-col gap-3 mb-4">
            {sa.scenarios.map((s) => (
              <label key={s.id} className={`flex items-start gap-3 p-4 border rounded-[var(--radius-sm)] cursor-pointer transition-colors ${sa.selectedPathway === s.id ? "border-primary bg-primary-light" : "border-neutral-lighter hover:border-primary/40"}`}>
                <input type="radio" name="pathway" checked={sa.selectedPathway === s.id} onChange={() => save({ ...sa, selectedPathway: s.id })} className="mt-1" />
                <div>
                  <p className="text-[14px] font-medium">{s.name}</p>
                  <p className="text-[13px] text-text-secondary">{s.description}</p>
                  {s.ebitdaImpact && <p className="text-[12px] text-text-secondary mt-1">EBITDA Impact: {s.ebitdaImpact} · Capex: {s.capexRequired}</p>}
                </div>
              </label>
            ))}
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
            <Input label="Meeting Date" type="date" value={sa.boardApproval?.date || ""} onChange={(e) => save({ ...sa, boardApproval: { date: e.target.value, approved: sa.boardApproval?.approved || false, attendees: sa.boardApproval?.attendees || "" } })} />
            <Input label="Attendees" value={sa.boardApproval?.attendees || ""} onChange={(e) => save({ ...sa, boardApproval: { ...sa.boardApproval!, attendees: e.target.value } })} />
          </div>
          <label className="flex items-center gap-2 text-[14px] cursor-pointer mb-4">
            <input type="checkbox" checked={sa.boardApproval?.approved || false} onChange={(e) => save({ ...sa, boardApproval: { ...sa.boardApproval!, approved: e.target.checked }, status: e.target.checked ? "board_approved" : "complete" })} />
            Board has approved this scenario analysis
          </label>
          {sa.boardApproval?.approved && (
            <div className="bg-green-50 border border-green-200 rounded-[var(--radius-sm)] p-4 flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              <p className="text-[14px] text-green-700">Scenario Analysis approved on {sa.boardApproval.date}</p>
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-[var(--radius-sm)] p-4 mt-4">
            <p className="text-[13px] font-medium text-blue-800 mb-2">Summary</p>
            <p className="text-[13px] text-blue-700">
              {sa.scenarios.length} scenario(s) modeled · {sa.carbonPriceSensitivity.length} carbon price point(s) ·{" "}
              Pathway: {sa.scenarios.find((s) => s.id === sa.selectedPathway)?.name || "Not selected"}
            </p>
          </div>

          <div className="flex justify-between mt-4">
            <Button variant="secondary" onClick={() => setStep(2)}>← Back</Button>
            <Button variant="primary" onClick={() => save({ ...sa, status: sa.boardApproval?.approved ? "board_approved" : "complete" })}>Save Scenario Analysis</Button>
          </div>
        </Card>
      )}
    </div>
  );
}
