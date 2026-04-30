"use client";

import { useSteinwall } from "@/lib/context";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, ChevronDown, ChevronRight, CheckCircle2, Zap, AlertTriangle, TrendingDown, TrendingUp } from "lucide-react";
import { useState } from "react";
import { v4 as uuid } from "uuid";
import type { ScenarioAnalysis, ClimateScenario, CarbonPriceTrajectory, ScenarioFinancials, ResilienceAssessment } from "@/lib/types";
import { scenarioTemplates, stressScenarioTypes } from "@/lib/nfrs-gap-data";
import { HelpField } from "@/components/ui/help-field";
import { scenarioHelp } from "@/lib/help-content";

const emptyCarbonPrice = (): CarbonPriceTrajectory => ({ year2025: "", year2030: "", year2040: "", year2050: "", basis: "" });
const emptyFinancials = (): ScenarioFinancials => ({
  revenueByProduct: [], totalRevenue: "", energyCosts: "", carbonCosts: "",
  carbonCalcEmissions: "", carbonCalcPrice: "", otherCosts: "", totalCosts: "",
  ebitda: "", ebitdaMargin: "", strandedAssetWritedown: "", annualCapex: "",
  dividendCapacity: "", creditRating: "",
});
const emptyResilience = (): ResilienceAssessment => ({
  worksInBAU: false, worksIn15C: false, worksInStress: false, score: 0, redFlags: [], contingenciesNeeded: [],
});

export default function ScenarioAnalysisPage() {
  const { data, update, hydrated } = useSteinwall();
  const [step, setStep] = useState(0);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [expandedFinancials, setExpandedFinancials] = useState<string | null>(null);
  const [newSens, setNewSens] = useState({ price: "", impact: "" });
  const [newProduct, setNewProduct] = useState("");
  const [newDemand, setNewDemand] = useState("");
  const [newTech, setNewTech] = useState("");
  const [newReg, setNewReg] = useState("");
  const [newDecision, setNewDecision] = useState("");
  const [newRedFlag, setNewRedFlag] = useState("");
  const [newContingency, setNewContingency] = useState("");

  const sa: ScenarioAnalysis = data.scenarioAnalysis || {
    scenarios: [],
    carbonPriceSensitivity: [],
    selectedPathway: "",
    resilience: emptyResilience(),
    status: "draft" as const,
    updatedAt: new Date().toISOString(),
  };

  const save = (updated: ScenarioAnalysis) => {
    update({ scenarioAnalysis: { ...updated, updatedAt: new Date().toISOString() } });
  };

  if (!hydrated) return <div className="flex items-center justify-center h-64"><p className="text-text-secondary text-[14px]">Loading...</p></div>;

  const steps = ["Define Scenarios", "Assumptions & Trajectories", "Financial Impact by Scenario", "Carbon Price Sensitivity", "Resilience Assessment", "Pathway & Approval"];
  const scenarioColors: Record<string, string> = { bau: "bg-amber-100 text-amber-800", "1.5c": "bg-green-100 text-green-800", "2c": "bg-blue-100 text-blue-800", stress: "bg-red-100 text-red-800" };

  const addFromTemplate = (t: typeof scenarioTemplates[number]) => {
    const exists = sa.scenarios.some((s) => s.type === t.type);
    if (exists) return;
    const scenario: ClimateScenario = {
      id: uuid(), name: t.name, type: t.type, description: t.description,
      probability: "possible",
      assumptions: t.defaultAssumptions,
      carbonPrice: emptyCarbonPrice(),
      demandForecasts: [], techForecasts: [], regulatoryForecasts: [],
      strategyDescription: "", keyDecisions: [],
      financials: emptyFinancials(),
      revenueImpact: "", ebitdaImpact: "", capexRequired: "",
      strandedAssetRisk: "", timeline: "", strategyResponse: "", confidence: 50,
    };
    save({ ...sa, scenarios: [...sa.scenarios, scenario] });
    setExpanded(scenario.id);
  };

  const updateScenario = (id: string, partial: Partial<ClimateScenario>) => {
    const scenarios = sa.scenarios.map((s) => s.id === id ? { ...s, ...partial } : s);
    save({ ...sa, scenarios });
  };

  const resilience = sa.resilience || emptyResilience();
  const resilientCount = [resilience.worksInBAU, resilience.worksIn15C, resilience.worksInStress].filter(Boolean).length;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-[28px] text-primary">Climate Scenario Analysis</h1>
        <p className="text-text-secondary text-[14px]">IFRS S2 Critical — Model climate futures with financial impact quantification and resilience testing</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="border border-neutral-lighter rounded-[var(--radius-sm)] p-3 text-center">
          <p className="text-[22px] font-semibold text-primary">{sa.scenarios.length}</p>
          <p className="text-[12px] text-text-secondary">Scenarios</p>
        </div>
        <div className="border border-neutral-lighter rounded-[var(--radius-sm)] p-3 text-center">
          <p className="text-[22px] font-semibold text-primary">{sa.carbonPriceSensitivity.length}</p>
          <p className="text-[12px] text-text-secondary">Price Points</p>
        </div>
        <div className="border border-neutral-lighter rounded-[var(--radius-sm)] p-3 text-center">
          <p className={`text-[22px] font-semibold ${resilientCount >= 2 ? "text-green-600" : resilientCount === 1 ? "text-amber-600" : "text-red-600"}`}>{resilientCount}/3</p>
          <p className="text-[12px] text-text-secondary">Scenarios Resilient</p>
        </div>
        <div className="border border-neutral-lighter rounded-[var(--radius-sm)] p-3 text-center">
          <p className="text-[22px] font-semibold text-primary">{sa.scenarios.filter((s) => s.financials.ebitda).length}</p>
          <p className="text-[12px] text-text-secondary">Financials Modeled</p>
        </div>
      </div>

      <div className="flex gap-2 mb-6 flex-wrap">
        {steps.map((s, i) => (
          <button key={s} onClick={() => setStep(i)} className={`px-3 py-1.5 rounded-full text-[12px] font-medium cursor-pointer transition-colors ${step === i ? "bg-primary text-white" : i < step ? "bg-green-100 text-green-700" : "bg-neutral-light text-text-secondary"}`}>
            {i < step ? "✓ " : ""}{s}
          </button>
        ))}
      </div>

      {/* Step 0: Define Scenarios */}
      {step === 0 && (
        <Card>
          <HelpField
            label="Define Climate Scenarios"
            tooltip={scenarioHelp.scenarioDefinition.tooltip}
            modal={scenarioHelp.scenarioDefinition.modal}
          >
            <p className="text-[13px] text-text-secondary mb-4">
              Your strategy might work fine if carbon prices stay low (BAU). But what if the world accelerates climate action (1.5°C)?
              IFRS S2 requires at least 3 scenarios. Use templates below or create custom.
            </p>
          </HelpField>

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

          {sa.scenarios.map((s) => {
            const exp = expanded === s.id;
            return (
              <div key={s.id} className="border border-neutral-lighter rounded-[var(--radius-sm)] mb-3">
                <button onClick={() => setExpanded(exp ? null : s.id)} className="w-full flex items-center justify-between p-4 text-left cursor-pointer">
                  <div className="flex items-center gap-3">
                    <Zap className="w-5 h-5 text-primary" />
                    <span className="text-[14px] font-medium">{s.name}</span>
                    <Badge className={scenarioColors[s.type] || ""}>{s.type.toUpperCase()}</Badge>
                    <Badge variant={s.probability === "most_likely" ? "success" : s.probability === "possible" ? "warning" : "neutral"}>{s.probability}</Badge>
                  </div>
                  {exp ? <ChevronDown className="w-4 h-4 text-text-secondary" /> : <ChevronRight className="w-4 h-4 text-text-secondary" />}
                </button>
                {exp && (
                  <div className="px-4 pb-4 flex flex-col gap-3 border-t border-neutral-lighter pt-3">
                    <p className="text-[13px] text-text-secondary italic">{s.description}</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <Input label="Scenario Name" value={s.name} onChange={(e) => updateScenario(s.id, { name: e.target.value })} />
                      <div>
                        <label className="text-[13px] font-medium text-text-primary mb-1 block">Probability</label>
                        <select className="w-full border border-neutral-lighter rounded-[var(--radius-sm)] px-3 py-2 text-[14px]" value={s.probability} onChange={(e) => updateScenario(s.id, { probability: e.target.value as ClimateScenario["probability"] })}>
                          <option value="most_likely">Most Likely (&gt;50%)</option>
                          <option value="possible">Possible</option>
                          <option value="unlikely">Unlikely</option>
                        </select>
                      </div>
                    </div>

                    {s.type === "stress" && (
                      <div>
                        <label className="text-[13px] font-medium text-text-primary mb-1 block">Stress Scenario Type</label>
                        {stressScenarioTypes.map((st) => (
                          <label key={st.value} className={`flex items-start gap-2 p-2 rounded text-[13px] cursor-pointer mb-1 ${s.stressType === st.value ? "bg-red-50 border border-red-200" : "hover:bg-neutral-light"}`}>
                            <input type="radio" name={`stress-${s.id}`} checked={s.stressType === st.value} onChange={() => updateScenario(s.id, { stressType: st.value })} className="mt-0.5" />
                            <div>
                              <span className="font-medium">{st.label}</span>
                              <p className="text-text-secondary">{st.description}</p>
                              {st.example && <p className="text-[12px] text-text-secondary mt-1 italic">{st.example}</p>}
                            </div>
                          </label>
                        ))}
                      </div>
                    )}

                    <div>
                      <label className="text-[13px] font-medium text-text-primary mb-1 block">Strategy Description</label>
                      <textarea className="w-full border border-neutral-lighter rounded-[var(--radius-sm)] px-3 py-2 text-[14px] min-h-[80px]" placeholder="e.g. We continue current operations with slow transition to renewables..." value={s.strategyDescription} onChange={(e) => updateScenario(s.id, { strategyDescription: e.target.value })} />
                    </div>

                    <div>
                      <label className="text-[13px] font-medium text-text-primary mb-1 block">Key Strategic Decisions</label>
                      <div className="flex flex-col gap-1 mb-2">
                        {s.keyDecisions.map((d, di) => (
                          <div key={di} className="flex items-center gap-2 text-[13px]">
                            <span className="flex-1">• {d}</span>
                            <button className="cursor-pointer text-red-400" onClick={() => updateScenario(s.id, { keyDecisions: s.keyDecisions.filter((_, i) => i !== di) })}><Trash2 className="w-3 h-3" /></button>
                          </div>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <Input placeholder="e.g. Divest high-carbon assets" value={newDecision} onChange={(e) => setNewDecision(e.target.value)} />
                        <Button variant="secondary" size="sm" onClick={() => { if (newDecision.trim()) { updateScenario(s.id, { keyDecisions: [...s.keyDecisions, newDecision.trim()] }); setNewDecision(""); } }}>Add</Button>
                      </div>
                    </div>

                    <div>
                      <label className="text-[13px] font-medium text-text-primary mb-1 block">Confidence Level: {s.confidence}%</label>
                      <input type="range" min="0" max="100" value={s.confidence} className="w-full" onChange={(e) => updateScenario(s.id, { confidence: parseInt(e.target.value) })} />
                    </div>

                    <Button variant="ghost" size="sm" className="self-end text-red-500" onClick={() => save({ ...sa, scenarios: sa.scenarios.filter((x) => x.id !== s.id) })}>
                      <Trash2 className="w-4 h-4" /> Remove Scenario
                    </Button>
                  </div>
                )}
              </div>
            );
          })}

          <div className="flex justify-end mt-4">
            <Button variant="primary" onClick={() => setStep(1)}>Next: Assumptions & Trajectories →</Button>
          </div>
        </Card>
      )}

      {/* Step 1: Assumptions & Trajectories */}
      {step === 1 && (
        <Card>
          <h2 className="text-[18px] text-primary mb-2">Assumptions & Trajectories</h2>
          <p className="text-[13px] text-text-secondary mb-4">For each scenario, set carbon price trajectory, demand forecasts, technology costs, and regulatory environment.</p>

          {sa.scenarios.map((s, si) => {
            const exp = expanded === s.id;
            return (
              <div key={s.id} className="border border-neutral-lighter rounded-[var(--radius-sm)] mb-4">
                <button onClick={() => setExpanded(exp ? null : s.id)} className="w-full flex items-center justify-between p-4 text-left cursor-pointer">
                  <div className="flex items-center gap-3">
                    <span className="text-[14px] font-medium">{s.name}</span>
                    <Badge className={scenarioColors[s.type] || ""}>{s.type.toUpperCase()}</Badge>
                    {s.carbonPrice.year2030 && <Badge variant="success">Carbon Price Set</Badge>}
                    {s.demandForecasts.length > 0 && <Badge variant="info">{s.demandForecasts.length} Products</Badge>}
                  </div>
                  {exp ? <ChevronDown className="w-4 h-4 text-text-secondary" /> : <ChevronRight className="w-4 h-4 text-text-secondary" />}
                </button>
                {exp && (
                  <div className="px-4 pb-4 flex flex-col gap-4 border-t border-neutral-lighter pt-3">
                    {/* Carbon Price */}
                    <div>
                      <p className="text-[13px] font-medium text-text-primary mb-2">Carbon Price Trajectory (RM/tonne)</p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        <Input label="2025" placeholder="e.g. RM 50" value={s.carbonPrice.year2025} onChange={(e) => updateScenario(s.id, { carbonPrice: { ...s.carbonPrice, year2025: e.target.value } })} />
                        <Input label="2030" placeholder="e.g. RM 100" value={s.carbonPrice.year2030} onChange={(e) => updateScenario(s.id, { carbonPrice: { ...s.carbonPrice, year2030: e.target.value } })} />
                        <Input label="2040" placeholder="e.g. RM 200" value={s.carbonPrice.year2040} onChange={(e) => updateScenario(s.id, { carbonPrice: { ...s.carbonPrice, year2040: e.target.value } })} />
                        <Input label="2050" placeholder="e.g. RM 300" value={s.carbonPrice.year2050} onChange={(e) => updateScenario(s.id, { carbonPrice: { ...s.carbonPrice, year2050: e.target.value } })} />
                      </div>
                      <Input label="Basis / Rationale" placeholder="e.g. IEA Net Zero scenario guidance" value={s.carbonPrice.basis} onChange={(e) => updateScenario(s.id, { carbonPrice: { ...s.carbonPrice, basis: e.target.value } })} />
                    </div>

                    {/* Demand Forecasts */}
                    <div>
                      <p className="text-[13px] font-medium text-text-primary mb-2">Product Demand Forecasts</p>
                      {s.demandForecasts.map((d, di) => (
                        <div key={di} className="border border-neutral-lighter rounded p-3 mb-2">
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-2">
                            <Input label="Product" value={d.product} onChange={(e) => { const f = [...s.demandForecasts]; f[di] = { ...d, product: e.target.value }; updateScenario(s.id, { demandForecasts: f }); }} />
                            <Input label="Current (2024)" value={d.current} onChange={(e) => { const f = [...s.demandForecasts]; f[di] = { ...d, current: e.target.value }; updateScenario(s.id, { demandForecasts: f }); }} />
                            <Input label="2030 Forecast" value={d.forecast2030} onChange={(e) => { const f = [...s.demandForecasts]; f[di] = { ...d, forecast2030: e.target.value }; updateScenario(s.id, { demandForecasts: f }); }} />
                            <Input label="2040 Forecast" value={d.forecast2040} onChange={(e) => { const f = [...s.demandForecasts]; f[di] = { ...d, forecast2040: e.target.value }; updateScenario(s.id, { demandForecasts: f }); }} />
                            <Input label="2050 Forecast" value={d.forecast2050} onChange={(e) => { const f = [...s.demandForecasts]; f[di] = { ...d, forecast2050: e.target.value }; updateScenario(s.id, { demandForecasts: f }); }} />
                            <Input label="Assumption" value={d.assumption} onChange={(e) => { const f = [...s.demandForecasts]; f[di] = { ...d, assumption: e.target.value }; updateScenario(s.id, { demandForecasts: f }); }} />
                          </div>
                          <button className="text-[12px] text-red-500 cursor-pointer" onClick={() => updateScenario(s.id, { demandForecasts: s.demandForecasts.filter((_, i) => i !== di) })}>Remove Product</button>
                        </div>
                      ))}
                      <div className="flex gap-2">
                        <Input placeholder="Product name (e.g. Crude Oil)" value={newDemand} onChange={(e) => setNewDemand(e.target.value)} />
                        <Button variant="secondary" size="sm" onClick={() => { if (newDemand.trim()) { updateScenario(s.id, { demandForecasts: [...s.demandForecasts, { product: newDemand.trim(), current: "", forecast2030: "", forecast2040: "", forecast2050: "", assumption: "" }] }); setNewDemand(""); } }}>Add Product</Button>
                      </div>
                    </div>

                    {/* Technology Cost */}
                    <div>
                      <p className="text-[13px] font-medium text-text-primary mb-2">Technology Cost Trends</p>
                      {s.techForecasts.map((t, ti) => (
                        <div key={ti} className="flex gap-2 mb-2 items-end">
                          <Input label="Technology" value={t.technology} onChange={(e) => { const f = [...s.techForecasts]; f[ti] = { ...t, technology: e.target.value }; updateScenario(s.id, { techForecasts: f }); }} />
                          <Input label="Current Cost" value={t.currentCost} onChange={(e) => { const f = [...s.techForecasts]; f[ti] = { ...t, currentCost: e.target.value }; updateScenario(s.id, { techForecasts: f }); }} />
                          <Input label="2030" value={t.cost2030} onChange={(e) => { const f = [...s.techForecasts]; f[ti] = { ...t, cost2030: e.target.value }; updateScenario(s.id, { techForecasts: f }); }} />
                          <Input label="2040" value={t.cost2040} onChange={(e) => { const f = [...s.techForecasts]; f[ti] = { ...t, cost2040: e.target.value }; updateScenario(s.id, { techForecasts: f }); }} />
                          <button className="cursor-pointer text-red-400 mb-1" onClick={() => updateScenario(s.id, { techForecasts: s.techForecasts.filter((_, i) => i !== ti) })}><Trash2 className="w-4 h-4" /></button>
                        </div>
                      ))}
                      <div className="flex gap-2">
                        <Input placeholder="e.g. Solar PV cost" value={newTech} onChange={(e) => setNewTech(e.target.value)} />
                        <Button variant="secondary" size="sm" onClick={() => { if (newTech.trim()) { updateScenario(s.id, { techForecasts: [...s.techForecasts, { technology: newTech.trim(), currentCost: "", cost2030: "", cost2040: "", assumption: "" }] }); setNewTech(""); } }}>Add Tech</Button>
                      </div>
                    </div>

                    {/* Regulatory */}
                    <div>
                      <p className="text-[13px] font-medium text-text-primary mb-2">Regulatory Environment</p>
                      {s.regulatoryForecasts.map((r, ri) => (
                        <div key={ri} className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-2">
                          <Input label="Regulation" value={r.regulation} onChange={(e) => { const f = [...s.regulatoryForecasts]; f[ri] = { ...r, regulation: e.target.value }; updateScenario(s.id, { regulatoryForecasts: f }); }} />
                          <Input label="Current Status" value={r.currentStatus} onChange={(e) => { const f = [...s.regulatoryForecasts]; f[ri] = { ...r, currentStatus: e.target.value }; updateScenario(s.id, { regulatoryForecasts: f }); }} />
                          <Input label="Evolution" value={r.evolution} onChange={(e) => { const f = [...s.regulatoryForecasts]; f[ri] = { ...r, evolution: e.target.value }; updateScenario(s.id, { regulatoryForecasts: f }); }} />
                          <div className="flex gap-1 items-end">
                            <Input label="Impact" value={r.impact} onChange={(e) => { const f = [...s.regulatoryForecasts]; f[ri] = { ...r, impact: e.target.value }; updateScenario(s.id, { regulatoryForecasts: f }); }} />
                            <button className="cursor-pointer text-red-400 mb-1" onClick={() => updateScenario(s.id, { regulatoryForecasts: s.regulatoryForecasts.filter((_, i) => i !== ri) })}><Trash2 className="w-4 h-4" /></button>
                          </div>
                        </div>
                      ))}
                      <div className="flex gap-2">
                        <Input placeholder="e.g. Malaysia Carbon Tax" value={newReg} onChange={(e) => setNewReg(e.target.value)} />
                        <Button variant="secondary" size="sm" onClick={() => { if (newReg.trim()) { updateScenario(s.id, { regulatoryForecasts: [...s.regulatoryForecasts, { regulation: newReg.trim(), currentStatus: "", evolution: "", impact: "" }] }); setNewReg(""); } }}>Add</Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          <div className="flex justify-between mt-4">
            <Button variant="secondary" onClick={() => setStep(0)}>← Back</Button>
            <Button variant="primary" onClick={() => setStep(2)}>Next: Financial Impact →</Button>
          </div>
        </Card>
      )}

      {/* Step 2: Financial Impact by Scenario */}
      {step === 2 && (
        <Card>
          <h2 className="text-[18px] text-primary mb-2">Financial Impact by Scenario</h2>
          <p className="text-[13px] text-text-secondary mb-4">This is the critical section for auditors. They want numbers, not narratives. Quantify revenue, cost, EBITDA impact for each scenario.</p>

          {sa.scenarios.map((s) => {
            const exp = expandedFinancials === s.id;
            const fin = s.financials;
            const updateFin = (partial: Partial<ScenarioFinancials>) => updateScenario(s.id, { financials: { ...fin, ...partial } });
            return (
              <div key={s.id} className="border border-neutral-lighter rounded-[var(--radius-sm)] mb-4">
                <button onClick={() => setExpandedFinancials(exp ? null : s.id)} className="w-full flex items-center justify-between p-4 text-left cursor-pointer">
                  <div className="flex items-center gap-3">
                    <span className="text-[14px] font-medium">{s.name}</span>
                    <Badge className={scenarioColors[s.type] || ""}>{s.type.toUpperCase()}</Badge>
                    {fin.ebitda ? <Badge variant="success">EBITDA: {fin.ebitda}</Badge> : <Badge variant="warning">Not modeled</Badge>}
                  </div>
                  {exp ? <ChevronDown className="w-4 h-4 text-text-secondary" /> : <ChevronRight className="w-4 h-4 text-text-secondary" />}
                </button>
                {exp && (
                  <div className="px-4 pb-4 flex flex-col gap-4 border-t border-neutral-lighter pt-3">
                    {/* Revenue by Product */}
                    <div>
                      <p className="text-[13px] font-medium text-text-primary mb-2">Revenue Impact by Product</p>
                      {fin.revenueByProduct.map((rp, ri) => (
                        <div key={ri} className="grid grid-cols-4 gap-2 mb-2 items-end">
                          <Input label="Product" value={rp.product} onChange={(e) => { const r = [...fin.revenueByProduct]; r[ri] = { ...rp, product: e.target.value }; updateFin({ revenueByProduct: r }); }} />
                          <Input label="Current Revenue" value={rp.current} onChange={(e) => { const r = [...fin.revenueByProduct]; r[ri] = { ...rp, current: e.target.value }; updateFin({ revenueByProduct: r }); }} />
                          <Input label="2040 Projected" value={rp.projected} onChange={(e) => { const r = [...fin.revenueByProduct]; r[ri] = { ...rp, projected: e.target.value }; updateFin({ revenueByProduct: r }); }} />
                          <div className="flex gap-1 items-end">
                            <Input label="Change %" value={rp.changePercent} onChange={(e) => { const r = [...fin.revenueByProduct]; r[ri] = { ...rp, changePercent: e.target.value }; updateFin({ revenueByProduct: r }); }} />
                            <button className="cursor-pointer text-red-400 mb-1" onClick={() => updateFin({ revenueByProduct: fin.revenueByProduct.filter((_, i) => i !== ri) })}><Trash2 className="w-4 h-4" /></button>
                          </div>
                        </div>
                      ))}
                      <div className="flex gap-2">
                        <Input placeholder="Product name" value={newProduct} onChange={(e) => setNewProduct(e.target.value)} />
                        <Button variant="secondary" size="sm" onClick={() => { if (newProduct.trim()) { updateFin({ revenueByProduct: [...fin.revenueByProduct, { product: newProduct.trim(), current: "", projected: "", changePercent: "" }] }); setNewProduct(""); } }}>Add</Button>
                      </div>
                    </div>

                    {/* Cost Impact */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <Input label="Total Revenue (2040)" placeholder="e.g. RM 230B" value={fin.totalRevenue} onChange={(e) => updateFin({ totalRevenue: e.target.value })} />
                      <Input label="Energy Costs (2040)" placeholder="e.g. RM 15B" value={fin.energyCosts} onChange={(e) => updateFin({ energyCosts: e.target.value })} />
                    </div>

                    <div className="bg-neutral-light rounded-[var(--radius-sm)] p-3">
                      <p className="text-[13px] font-medium mb-2">Carbon Cost Calculation</p>
                      <div className="grid grid-cols-3 gap-3">
                        <Input label="Emissions (M tonnes)" placeholder="S1+S2" value={fin.carbonCalcEmissions} onChange={(e) => updateFin({ carbonCalcEmissions: e.target.value })} />
                        <Input label="Carbon Price (RM/t)" value={fin.carbonCalcPrice} onChange={(e) => updateFin({ carbonCalcPrice: e.target.value })} />
                        <Input label="Annual Carbon Cost" value={fin.carbonCosts} onChange={(e) => updateFin({ carbonCosts: e.target.value })} />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <Input label="Other Costs" value={fin.otherCosts} onChange={(e) => updateFin({ otherCosts: e.target.value })} />
                      <Input label="Total Costs (2040)" value={fin.totalCosts} onChange={(e) => updateFin({ totalCosts: e.target.value })} />
                      <Input label="EBITDA (2040)" placeholder="Revenue - Costs" value={fin.ebitda} onChange={(e) => updateFin({ ebitda: e.target.value })} />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <Input label="EBITDA Margin (%)" value={fin.ebitdaMargin} onChange={(e) => updateFin({ ebitdaMargin: e.target.value })} />
                      <Input label="Stranded Asset Write-down" value={fin.strandedAssetWritedown} onChange={(e) => updateFin({ strandedAssetWritedown: e.target.value })} />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <Input label="Annual Capex Required" value={fin.annualCapex} onChange={(e) => updateFin({ annualCapex: e.target.value })} />
                      <Input label="Dividend Capacity" value={fin.dividendCapacity} onChange={(e) => updateFin({ dividendCapacity: e.target.value })} />
                      <Input label="Credit Rating" placeholder="e.g. A- / BBB+" value={fin.creditRating} onChange={(e) => updateFin({ creditRating: e.target.value })} />
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {/* Waterfall Chart */}
          {sa.scenarios.filter((s) => s.financials.totalRevenue && s.financials.ebitda).length >= 1 && (
            <div className="mt-4">
              <p className="text-[13px] font-medium text-text-primary mb-2">Revenue → EBITDA Waterfall</p>
              <div className="flex gap-3 overflow-x-auto pb-2">
                {sa.scenarios.filter((s) => s.financials.totalRevenue && s.financials.ebitda).map((s) => {
                  const rev = parseFloat(s.financials.totalRevenue.replace(/[^\d.-]/g, "")) || 0;
                  const energy = parseFloat(s.financials.energyCosts.replace(/[^\d.-]/g, "")) || 0;
                  const carbon = parseFloat(s.financials.carbonCosts.replace(/[^\d.-]/g, "")) || 0;
                  const other = parseFloat(s.financials.otherCosts.replace(/[^\d.-]/g, "")) || 0;
                  const ebitda = parseFloat(s.financials.ebitda.replace(/[^\d.-]/g, "")) || 0;
                  const maxVal = Math.max(rev, 1);
                  const pct = (v: number) => Math.max(2, Math.round((Math.abs(v) / maxVal) * 100));
                  return (
                    <div key={s.id} className="flex-1 min-w-[180px] border border-neutral-lighter rounded-[var(--radius-sm)] p-3">
                      <p className="text-[12px] font-medium text-primary mb-2">{s.name}</p>
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-2"><div className="bg-green-500 rounded h-4" style={{ width: `${pct(rev)}%` }} /><span className="text-[11px] text-text-secondary whitespace-nowrap">Revenue {s.financials.totalRevenue}</span></div>
                        {energy > 0 && <div className="flex items-center gap-2"><div className="bg-red-400 rounded h-4" style={{ width: `${pct(energy)}%` }} /><span className="text-[11px] text-text-secondary whitespace-nowrap">Energy -{s.financials.energyCosts}</span></div>}
                        {carbon > 0 && <div className="flex items-center gap-2"><div className="bg-orange-400 rounded h-4" style={{ width: `${pct(carbon)}%` }} /><span className="text-[11px] text-text-secondary whitespace-nowrap">Carbon -{s.financials.carbonCosts}</span></div>}
                        {other > 0 && <div className="flex items-center gap-2"><div className="bg-red-300 rounded h-4" style={{ width: `${pct(other)}%` }} /><span className="text-[11px] text-text-secondary whitespace-nowrap">Other -{s.financials.otherCosts}</span></div>}
                        <div className="flex items-center gap-2"><div className={`${ebitda >= 0 ? "bg-green-600" : "bg-red-600"} rounded h-4`} style={{ width: `${pct(ebitda)}%` }} /><span className="text-[11px] font-medium text-text-primary whitespace-nowrap">EBITDA {s.financials.ebitda}</span></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Comparison Table */}
          {sa.scenarios.filter((s) => s.financials.ebitda).length >= 2 && (
            <div className="mt-4">
              <p className="text-[13px] font-medium text-text-primary mb-2">Scenario Comparison</p>
              <div className="overflow-x-auto">
                <table className="w-full text-[12px] border border-neutral-lighter rounded">
                  <thead className="bg-neutral-light">
                    <tr>
                      <th className="px-3 py-2 text-left">Metric</th>
                      {sa.scenarios.filter((s) => s.financials.ebitda).map((s) => (
                        <th key={s.id} className="px-3 py-2 text-left">{s.name}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { label: "Revenue", key: "totalRevenue" as const },
                      { label: "EBITDA", key: "ebitda" as const },
                      { label: "EBITDA Margin", key: "ebitdaMargin" as const },
                      { label: "Carbon Cost/yr", key: "carbonCosts" as const },
                      { label: "Annual Capex", key: "annualCapex" as const },
                      { label: "Stranded Assets", key: "strandedAssetWritedown" as const },
                      { label: "Dividend", key: "dividendCapacity" as const },
                      { label: "Credit Rating", key: "creditRating" as const },
                    ].map((row) => (
                      <tr key={row.label} className="border-t border-neutral-lighter">
                        <td className="px-3 py-2 font-medium">{row.label}</td>
                        {sa.scenarios.filter((s) => s.financials.ebitda).map((s) => (
                          <td key={s.id} className="px-3 py-2">{s.financials[row.key] || "—"}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="flex justify-between mt-4">
            <Button variant="secondary" onClick={() => setStep(1)}>← Back</Button>
            <Button variant="primary" onClick={() => setStep(3)}>Next: Carbon Price Sensitivity →</Button>
          </div>
        </Card>
      )}

      {/* Step 3: Carbon Price Sensitivity */}
      {step === 3 && (
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
            <Button variant="secondary" onClick={() => setStep(2)}>← Back</Button>
            <Button variant="primary" onClick={() => setStep(4)}>Next: Resilience Assessment →</Button>
          </div>
        </Card>
      )}

      {/* Step 4: Resilience Assessment */}
      {step === 4 && (
        <Card>
          <HelpField
            label="Strategy Resilience Assessment"
            tooltip={scenarioHelp.resilience.tooltip}
            modal={scenarioHelp.resilience.modal}
          >
            <p className="text-[13px] text-text-secondary mb-4">Based on financial modeling, assess whether your strategy works across different climate futures.</p>
          </HelpField>

          <div className="flex flex-col gap-3 mb-6">
            {[
              { key: "worksInBAU" as const, label: "BAU Scenario", icon: TrendingUp, desc: "EBITDA remains strong, can service debt and maintain dividend" },
              { key: "worksIn15C" as const, label: "1.5°C Scenario", icon: TrendingDown, desc: "Early transition pays off — lower costs, avoid stranding cliff" },
              { key: "worksInStress" as const, label: "Stress Scenario", icon: AlertTriangle, desc: "Company can navigate shock without existential crisis" },
            ].map(({ key, label, icon: Icon, desc }) => (
              <label key={key} className={`flex items-start gap-3 p-4 border rounded-[var(--radius-sm)] cursor-pointer transition-colors ${resilience[key] ? "border-green-400 bg-green-50" : "border-neutral-lighter"}`}>
                <input type="checkbox" checked={resilience[key]} onChange={(e) => {
                  const updated = { ...resilience, [key]: e.target.checked };
                  const count = [updated.worksInBAU, updated.worksIn15C, updated.worksInStress].filter(Boolean).length;
                  updated.score = Math.round((count / 3) * 100);
                  save({ ...sa, resilience: updated });
                }} className="mt-1" />
                <Icon className={`w-5 h-5 mt-0.5 ${resilience[key] ? "text-green-600" : "text-text-secondary"}`} />
                <div>
                  <p className="text-[14px] font-medium">{label}: Strategy {resilience[key] ? "Works" : "At Risk"}</p>
                  <p className="text-[13px] text-text-secondary">{desc}</p>
                </div>
              </label>
            ))}
          </div>

          <div className={`p-4 rounded-[var(--radius-sm)] mb-4 ${resilientCount === 3 ? "bg-green-50 border border-green-200" : resilientCount >= 2 ? "bg-amber-50 border border-amber-200" : "bg-red-50 border border-red-200"}`}>
            <p className="text-[14px] font-medium">
              Strategy works in {resilientCount} out of 3 scenarios ({Math.round((resilientCount / 3) * 100)}%)
            </p>
            <p className="text-[13px] mt-1">
              {resilientCount === 3 && "Excellent — your strategy is resilient across all futures."}
              {resilientCount === 2 && "Acceptable but needs contingency for the failing scenario."}
              {resilientCount === 1 && "Warning — strategy only works in one future. High risk."}
              {resilientCount === 0 && "Critical — strategy fails in all scenarios. Fundamental redesign needed."}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-[13px] font-medium text-red-700 mb-2">Red Flags</p>
              {resilience.redFlags.map((f, i) => (
                <div key={i} className="flex items-center gap-2 text-[13px] mb-1">
                  <span className="flex-1">• {f}</span>
                  <button className="cursor-pointer text-red-400" onClick={() => save({ ...sa, resilience: { ...resilience, redFlags: resilience.redFlags.filter((_, j) => j !== i) } })}><Trash2 className="w-3 h-3" /></button>
                </div>
              ))}
              <div className="flex gap-2 mt-1">
                <Input placeholder="e.g. Strategy only works in BAU" value={newRedFlag} onChange={(e) => setNewRedFlag(e.target.value)} />
                <Button variant="secondary" size="sm" onClick={() => { if (newRedFlag.trim()) { save({ ...sa, resilience: { ...resilience, redFlags: [...resilience.redFlags, newRedFlag.trim()] } }); setNewRedFlag(""); } }}>Add</Button>
              </div>
            </div>
            <div>
              <p className="text-[13px] font-medium text-amber-700 mb-2">Contingencies Needed</p>
              {resilience.contingenciesNeeded.map((c, i) => (
                <div key={i} className="flex items-center gap-2 text-[13px] mb-1">
                  <span className="flex-1">• {c}</span>
                  <button className="cursor-pointer text-red-400" onClick={() => save({ ...sa, resilience: { ...resilience, contingenciesNeeded: resilience.contingenciesNeeded.filter((_, j) => j !== i) } })}><Trash2 className="w-3 h-3" /></button>
                </div>
              ))}
              <div className="flex gap-2 mt-1">
                <Input placeholder="e.g. Develop stress contingency plan" value={newContingency} onChange={(e) => setNewContingency(e.target.value)} />
                <Button variant="secondary" size="sm" onClick={() => { if (newContingency.trim()) { save({ ...sa, resilience: { ...resilience, contingenciesNeeded: [...resilience.contingenciesNeeded, newContingency.trim()] } }); setNewContingency(""); } }}>Add</Button>
              </div>
            </div>
          </div>

          <div className="flex justify-between mt-4">
            <Button variant="secondary" onClick={() => setStep(3)}>← Back</Button>
            <Button variant="primary" onClick={() => setStep(5)}>Next: Pathway & Approval →</Button>
          </div>
        </Card>
      )}

      {/* Step 5: Pathway Selection & Board Approval */}
      {step === 5 && (
        <Card>
          <h2 className="text-[18px] text-primary mb-4">Select Strategic Pathway & Board Approval</h2>
          <p className="text-[13px] text-text-secondary mb-4">Based on your scenario analysis, which pathway does the company commit to?</p>

          <div className="flex flex-col gap-3 mb-6">
            {sa.scenarios.map((s) => (
              <label key={s.id} className={`flex items-start gap-3 p-4 border rounded-[var(--radius-sm)] cursor-pointer transition-colors ${sa.selectedPathway === s.id ? "border-primary bg-primary-light" : "border-neutral-lighter hover:border-primary/40"}`}>
                <input type="radio" name="pathway" checked={sa.selectedPathway === s.id} onChange={() => save({ ...sa, selectedPathway: s.id })} className="mt-1" />
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-[14px] font-medium">{s.name}</p>
                    <Badge className={scenarioColors[s.type] || ""}>{s.type.toUpperCase()}</Badge>
                  </div>
                  <p className="text-[13px] text-text-secondary">{s.description}</p>
                  {s.financials.ebitda && <p className="text-[12px] text-text-secondary mt-1">EBITDA: {s.financials.ebitda} · Capex: {s.financials.annualCapex} · Credit: {s.financials.creditRating}</p>}
                </div>
              </label>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
            <Input label="Meeting Date" type="date" value={sa.boardApproval?.date || ""} onChange={(e) => save({ ...sa, boardApproval: { date: e.target.value, approved: sa.boardApproval?.approved || false, attendees: sa.boardApproval?.attendees || "" } })} />
            <Input label="Attendees" value={sa.boardApproval?.attendees || ""} onChange={(e) => save({ ...sa, boardApproval: { ...sa.boardApproval!, attendees: e.target.value } })} />
          </div>
          <label className="flex items-center gap-2 text-[14px] cursor-pointer mb-4">
            <input type="checkbox" checked={sa.boardApproval?.approved || false} onChange={(e) => save({ ...sa, boardApproval: { ...sa.boardApproval!, approved: e.target.checked }, status: e.target.checked ? "board_approved" : "complete" })} />
            Board has approved this scenario analysis and selected pathway
          </label>
          {sa.boardApproval?.approved && (
            <div className="bg-green-50 border border-green-200 rounded-[var(--radius-sm)] p-4 flex items-center gap-3 mb-4">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              <p className="text-[14px] text-green-700">Scenario Analysis approved on {sa.boardApproval.date}</p>
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-[var(--radius-sm)] p-4">
            <p className="text-[13px] font-medium text-blue-800 mb-2">Summary</p>
            <p className="text-[13px] text-blue-700">
              {sa.scenarios.length} scenario(s) · {sa.scenarios.filter((s) => s.financials.ebitda).length} financially modeled ·{" "}
              {sa.carbonPriceSensitivity.length} carbon price point(s) · Resilience: {resilientCount}/3 scenarios ·{" "}
              Pathway: {sa.scenarios.find((s) => s.id === sa.selectedPathway)?.name || "Not selected"}
            </p>
          </div>

          <div className="flex justify-between mt-4">
            <Button variant="secondary" onClick={() => setStep(4)}>← Back</Button>
            <Button variant="primary" onClick={() => save({ ...sa, status: sa.boardApproval?.approved ? "board_approved" : "complete" })}>Save Scenario Analysis</Button>
          </div>
        </Card>
      )}
    </div>
  );
}
