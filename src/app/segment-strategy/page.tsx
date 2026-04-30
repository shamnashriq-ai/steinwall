"use client";

import { useSteinwall } from "@/lib/context";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, ChevronDown, ChevronRight, CheckCircle2, Layers, Target } from "lucide-react";
import { useState } from "react";
import { v4 as uuid } from "uuid";
import type { SegmentStrategy, BusinessSegment, SegmentOwnership, SegmentFinancials } from "@/lib/types";
import { HelpField } from "@/components/ui/help-field";
import { segmentHelp } from "@/lib/help-content";

const emptyOwnership = (): SegmentOwnership => ({
  ownerTitle: "", ownerName: "", reportsTo: "", bonusTiedToClimate: false,
  climateCompPercent: 0, capexApprovalAuthority: "", reportingFrequency: "quarterly",
  boardApprovalDate: "",
});

const emptyFinancials = (): SegmentFinancials => ({
  currentRevenue: 0, revenue2030: 0, revenue2040: 0, currentEbitda: 0,
  ebitda2030: 0, ebitda2040: 0, annualCapex2025_2030: 0, annualCapex2030_2040: 0,
  totalCapex15Year: 0, renewableROI: "", efficiencyROI: "",
});

const emptySegment = (): BusinessSegment => ({
  id: uuid(), name: "", revenueContribution: 0,
  emissionsScope1: 0, emissionsScope2: 0, emissionsScope3: 0, percentOfGroupEmissions: 0,
  majorSources: [],
  climateRisks: [], climateOpportunities: [],
  strategy: "",
  targetReduction2030: "", targetReduction2040: "", targetReduction2050: "",
  renewablePercent2030: "", renewablePercent2050: "",
  capexAllocated: 0,
  milestones: [],
  ownership: emptyOwnership(),
  financials: emptyFinancials(),
});

export default function SegmentStrategyPage() {
  const { data, update, hydrated } = useSteinwall();
  const [expanded, setExpanded] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Record<string, string>>({});
  const [newSource, setNewSource] = useState("");
  const [newRiskDesc, setNewRiskDesc] = useState("");
  const [newOppDesc, setNewOppDesc] = useState("");

  const ss: SegmentStrategy = data.segmentStrategy || {
    segments: [], totalGroupEmissions: 0,
    status: "draft" as const, updatedAt: new Date().toISOString(),
  };

  const save = (updated: SegmentStrategy) => {
    const totalGroupEmissions = updated.segments.reduce((sum, s) => sum + s.emissionsScope1 + s.emissionsScope2 + s.emissionsScope3, 0);
    const segments = updated.segments.map((s) => {
      const segTotal = s.emissionsScope1 + s.emissionsScope2 + s.emissionsScope3;
      const totalCapex15Year = (s.financials.annualCapex2025_2030 * 5) + (s.financials.annualCapex2030_2040 * 10);
      return {
        ...s,
        percentOfGroupEmissions: totalGroupEmissions > 0 ? Math.round((segTotal / totalGroupEmissions) * 100) : 0,
        financials: { ...s.financials, totalCapex15Year },
      };
    });
    update({ segmentStrategy: { ...updated, segments, totalGroupEmissions, updatedAt: new Date().toISOString() } });
  };

  const updateSegment = (id: string, partial: Partial<BusinessSegment>) => {
    const segments = ss.segments.map((s) => s.id === id ? { ...s, ...partial } : s);
    save({ ...ss, segments });
  };

  if (!hydrated) return <div className="flex items-center justify-center h-64"><p className="text-text-secondary text-[14px]">Loading...</p></div>;

  const getTab = (segId: string) => activeTab[segId] || "emissions";

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-[28px] text-primary">Segment-Level Climate Strategy</h1>
        <p className="text-text-secondary text-[14px]">Bursa Listing Rule — Climate strategy by principal business segment (required 2026+, mandatory 2027)</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="border border-neutral-lighter rounded-[var(--radius-sm)] p-3 text-center">
          <p className="text-[22px] font-semibold text-primary">{ss.segments.length}</p>
          <p className="text-[12px] text-text-secondary">Segments</p>
        </div>
        <div className="border border-neutral-lighter rounded-[var(--radius-sm)] p-3 text-center">
          <p className="text-[22px] font-semibold text-primary">{ss.totalGroupEmissions.toLocaleString()}</p>
          <p className="text-[12px] text-text-secondary">Total tCO2e</p>
        </div>
        <div className="border border-neutral-lighter rounded-[var(--radius-sm)] p-3 text-center">
          <p className="text-[22px] font-semibold text-primary">RM {ss.segments.reduce((s, seg) => s + seg.capexAllocated, 0).toLocaleString()}M</p>
          <p className="text-[12px] text-text-secondary">Total Capex</p>
        </div>
        <div className="border border-neutral-lighter rounded-[var(--radius-sm)] p-3 text-center">
          <p className="text-[22px] font-semibold text-primary">{ss.segments.filter((s) => s.ownership.ownerName).length}/{ss.segments.length}</p>
          <p className="text-[12px] text-text-secondary">Owners Assigned</p>
        </div>
      </div>

      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[18px] text-primary">Business Segments</h2>
          <Button variant="primary" size="sm" onClick={() => { const s = emptySegment(); save({ ...ss, segments: [...ss.segments, s] }); setExpanded(s.id); }}>
            <Plus className="w-4 h-4" /> Add Segment
          </Button>
        </div>
        <HelpField
          label=""
          tooltip="Each segment needs its own climate strategy with named owner and capex allocation. Auditors check this segment by segment."
          modal={segmentHelp.climateRisks.modal}
        >
          <p className="text-[13px] text-text-secondary mb-4">Auditor question: &ldquo;What&apos;s your decarbonization strategy for each business segment? Who owns it? What&apos;s the capex? Is upstream aligned with 2050 net-zero?&rdquo;</p>
        </HelpField>

        {ss.segments.length === 0 && (
          <div className="text-center py-8 text-text-secondary text-[14px]">No segments defined. Add your principal business segments.</div>
        )}

        {ss.segments.map((s) => {
          const exp = expanded === s.id;
          const segTotal = s.emissionsScope1 + s.emissionsScope2 + s.emissionsScope3;
          const tab = getTab(s.id);
          const setTab = (t: string) => setActiveTab((prev) => ({ ...prev, [s.id]: t }));

          return (
            <div key={s.id} className="border border-neutral-lighter rounded-[var(--radius-sm)] mb-3">
              <button onClick={() => setExpanded(exp ? null : s.id)} className="w-full flex items-center justify-between p-4 text-left cursor-pointer">
                <div className="flex items-center gap-3">
                  <Layers className="w-5 h-5 text-primary" />
                  <span className="text-[14px] font-medium">{s.name || "Unnamed Segment"}</span>
                  {s.percentOfGroupEmissions > 0 && <Badge variant="warning">{s.percentOfGroupEmissions}% emissions</Badge>}
                  {s.revenueContribution > 0 && <span className="text-[12px] text-text-secondary">{s.revenueContribution}% revenue</span>}
                  {s.ownership.ownerName && <Badge variant="info">{s.ownership.ownerName}</Badge>}
                </div>
                {exp ? <ChevronDown className="w-4 h-4 text-text-secondary" /> : <ChevronRight className="w-4 h-4 text-text-secondary" />}
              </button>

              {exp && (
                <div className="px-4 pb-4 border-t border-neutral-lighter pt-3">
                  {/* Tabs */}
                  <div className="flex gap-1 mb-4 flex-wrap">
                    {[
                      { key: "emissions", label: "Emissions" },
                      { key: "risks", label: "Risks & Opportunities" },
                      { key: "strategy", label: "Strategy & Targets" },
                      { key: "financials", label: "Financials & Capex" },
                      { key: "milestones", label: "Milestones" },
                      { key: "ownership", label: "Ownership" },
                    ].map((t) => (
                      <button key={t.key} onClick={() => setTab(t.key)} className={`px-3 py-1.5 rounded text-[12px] font-medium cursor-pointer transition-colors ${tab === t.key ? "bg-primary text-white" : "bg-neutral-light text-text-secondary hover:bg-primary-light"}`}>
                        {t.label}
                      </button>
                    ))}
                  </div>

                  {/* Emissions Tab */}
                  {tab === "emissions" && (
                    <div className="flex flex-col gap-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <Input label="Segment Name" placeholder="e.g. Upstream Oil & Gas" value={s.name} onChange={(e) => updateSegment(s.id, { name: e.target.value })} />
                        <Input label="Revenue Contribution (%)" type="number" value={s.revenueContribution || ""} onChange={(e) => updateSegment(s.id, { revenueContribution: parseFloat(e.target.value) || 0 })} />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <Input label="Scope 1 (tCO2e)" type="number" value={s.emissionsScope1 || ""} onChange={(e) => updateSegment(s.id, { emissionsScope1: parseFloat(e.target.value) || 0 })} />
                        <Input label="Scope 2 (tCO2e)" type="number" value={s.emissionsScope2 || ""} onChange={(e) => updateSegment(s.id, { emissionsScope2: parseFloat(e.target.value) || 0 })} />
                        <Input label="Scope 3 (tCO2e)" type="number" value={s.emissionsScope3 || ""} onChange={(e) => updateSegment(s.id, { emissionsScope3: parseFloat(e.target.value) || 0 })} />
                      </div>

                      <div className="bg-neutral-light rounded-[var(--radius-sm)] p-3 text-[13px]">
                        Segment Total: {segTotal.toLocaleString()} tCO2e ({s.percentOfGroupEmissions}% of group)
                      </div>

                      <div>
                        <label className="text-[13px] font-medium text-text-primary mb-1 block">Major Emission Sources</label>
                        <div className="flex gap-2 flex-wrap mb-2">
                          {s.majorSources.map((src, si) => (
                            <Badge key={si} variant="neutral" className="flex items-center gap-1">{src}
                              <button className="cursor-pointer" onClick={() => updateSegment(s.id, { majorSources: s.majorSources.filter((_, i) => i !== si) })}><Trash2 className="w-3 h-3" /></button>
                            </Badge>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <Input placeholder="e.g. Fuel combustion (flaring)" value={newSource} onChange={(e) => setNewSource(e.target.value)} />
                          <Button variant="secondary" size="sm" onClick={() => { if (newSource.trim()) { updateSegment(s.id, { majorSources: [...s.majorSources, newSource.trim()] }); setNewSource(""); } }}>Add</Button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Risks & Opportunities Tab */}
                  {tab === "risks" && (
                    <div className="flex flex-col gap-4">
                      <div>
                        <p className="text-[13px] font-medium text-red-700 mb-2">Climate Risks</p>
                        {s.climateRisks.map((r, ri) => (
                          <div key={ri} className="border border-neutral-lighter rounded p-3 mb-2">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                              <Input label="Risk" value={r.risk} onChange={(e) => { const risks = [...s.climateRisks]; risks[ri] = { ...r, risk: e.target.value }; updateSegment(s.id, { climateRisks: risks }); }} />
                              <Input label="Impact (RM)" value={r.impactRM} onChange={(e) => { const risks = [...s.climateRisks]; risks[ri] = { ...r, impactRM: e.target.value }; updateSegment(s.id, { climateRisks: risks }); }} />
                              <Input label="Probability" value={r.probability} onChange={(e) => { const risks = [...s.climateRisks]; risks[ri] = { ...r, probability: e.target.value }; updateSegment(s.id, { climateRisks: risks }); }} />
                              <div className="flex gap-1 items-end">
                                <Input label="Mitigation" value={r.mitigation} onChange={(e) => { const risks = [...s.climateRisks]; risks[ri] = { ...r, mitigation: e.target.value }; updateSegment(s.id, { climateRisks: risks }); }} />
                                <button className="cursor-pointer text-red-400 mb-1" onClick={() => updateSegment(s.id, { climateRisks: s.climateRisks.filter((_, i) => i !== ri) })}><Trash2 className="w-4 h-4" /></button>
                              </div>
                            </div>
                          </div>
                        ))}
                        <div className="flex gap-2">
                          <Input placeholder="e.g. Stranded assets from oil demand decline" value={newRiskDesc} onChange={(e) => setNewRiskDesc(e.target.value)} />
                          <Button variant="secondary" size="sm" onClick={() => { if (newRiskDesc.trim()) { updateSegment(s.id, { climateRisks: [...s.climateRisks, { risk: newRiskDesc.trim(), impactRM: "", probability: "", mitigation: "" }] }); setNewRiskDesc(""); } }}>Add Risk</Button>
                        </div>
                      </div>

                      <div>
                        <p className="text-[13px] font-medium text-green-700 mb-2">Climate Opportunities</p>
                        {s.climateOpportunities.map((o, oi) => (
                          <div key={oi} className="border border-neutral-lighter rounded p-3 mb-2">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                              <Input label="Opportunity" value={o.opportunity} onChange={(e) => { const opps = [...s.climateOpportunities]; opps[oi] = { ...o, opportunity: e.target.value }; updateSegment(s.id, { climateOpportunities: opps }); }} />
                              <Input label="Potential (RM)" value={o.potentialRM} onChange={(e) => { const opps = [...s.climateOpportunities]; opps[oi] = { ...o, potentialRM: e.target.value }; updateSegment(s.id, { climateOpportunities: opps }); }} />
                              <Input label="Capex Required" value={o.capexRequired} onChange={(e) => { const opps = [...s.climateOpportunities]; opps[oi] = { ...o, capexRequired: e.target.value }; updateSegment(s.id, { climateOpportunities: opps }); }} />
                              <div className="flex gap-1 items-end">
                                <Input label="ROI" value={o.roi} onChange={(e) => { const opps = [...s.climateOpportunities]; opps[oi] = { ...o, roi: e.target.value }; updateSegment(s.id, { climateOpportunities: opps }); }} />
                                <button className="cursor-pointer text-red-400 mb-1" onClick={() => updateSegment(s.id, { climateOpportunities: s.climateOpportunities.filter((_, i) => i !== oi) })}><Trash2 className="w-4 h-4" /></button>
                              </div>
                            </div>
                          </div>
                        ))}
                        <div className="flex gap-2">
                          <Input placeholder="e.g. Transition to renewable-powered operations" value={newOppDesc} onChange={(e) => setNewOppDesc(e.target.value)} />
                          <Button variant="secondary" size="sm" onClick={() => { if (newOppDesc.trim()) { updateSegment(s.id, { climateOpportunities: [...s.climateOpportunities, { opportunity: newOppDesc.trim(), potentialRM: "", capexRequired: "", roi: "" }] }); setNewOppDesc(""); } }}>Add Opportunity</Button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Strategy & Targets Tab */}
                  {tab === "strategy" && (
                    <div className="flex flex-col gap-3">
                      <div>
                        <label className="text-[13px] font-medium text-text-primary mb-1 block">Segment Strategy</label>
                        <textarea className="w-full border border-neutral-lighter rounded-[var(--radius-sm)] px-3 py-2 text-[14px] min-h-[100px]" placeholder="e.g. Managed decline pathway — shift RM 20B capex from oil to renewables by 2035. Exit thermal oil by 2050, keep only carbon-capture." value={s.strategy} onChange={(e) => updateSegment(s.id, { strategy: e.target.value })} />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <Input label="Reduction Target 2030" placeholder="e.g. -50% vs baseline" value={s.targetReduction2030} onChange={(e) => updateSegment(s.id, { targetReduction2030: e.target.value })} />
                        <Input label="Reduction Target 2040" placeholder="e.g. -75% vs baseline" value={s.targetReduction2040} onChange={(e) => updateSegment(s.id, { targetReduction2040: e.target.value })} />
                        <Input label="Reduction Target 2050" placeholder="e.g. Net-zero" value={s.targetReduction2050} onChange={(e) => updateSegment(s.id, { targetReduction2050: e.target.value })} />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <Input label="Renewable % by 2030" placeholder="e.g. 40%" value={s.renewablePercent2030} onChange={(e) => updateSegment(s.id, { renewablePercent2030: e.target.value })} />
                        <Input label="Renewable % by 2050" placeholder="e.g. 100%" value={s.renewablePercent2050} onChange={(e) => updateSegment(s.id, { renewablePercent2050: e.target.value })} />
                        <Input label="Capex Allocated (RM M)" type="number" value={s.capexAllocated || ""} onChange={(e) => updateSegment(s.id, { capexAllocated: parseFloat(e.target.value) || 0 })} />
                      </div>
                    </div>
                  )}

                  {/* Financials & Capex Tab */}
                  {tab === "financials" && (
                    <div className="flex flex-col gap-3">
                      <p className="text-[13px] font-medium text-text-primary">Segment Financial Projections (RM M)</p>

                      <div className="overflow-x-auto">
                        <table className="w-full text-[12px] border border-neutral-lighter rounded">
                          <thead className="bg-neutral-light">
                            <tr><th className="px-3 py-2 text-left">Metric</th><th className="px-3 py-2">Current</th><th className="px-3 py-2">2030</th><th className="px-3 py-2">2040</th></tr>
                          </thead>
                          <tbody>
                            <tr className="border-t border-neutral-lighter">
                              <td className="px-3 py-1 font-medium">Revenue</td>
                              <td className="px-3 py-1"><input type="number" className="w-20 border rounded px-1 text-[12px]" value={s.financials.currentRevenue || ""} onChange={(e) => updateSegment(s.id, { financials: { ...s.financials, currentRevenue: parseFloat(e.target.value) || 0 } })} /></td>
                              <td className="px-3 py-1"><input type="number" className="w-20 border rounded px-1 text-[12px]" value={s.financials.revenue2030 || ""} onChange={(e) => updateSegment(s.id, { financials: { ...s.financials, revenue2030: parseFloat(e.target.value) || 0 } })} /></td>
                              <td className="px-3 py-1"><input type="number" className="w-20 border rounded px-1 text-[12px]" value={s.financials.revenue2040 || ""} onChange={(e) => updateSegment(s.id, { financials: { ...s.financials, revenue2040: parseFloat(e.target.value) || 0 } })} /></td>
                            </tr>
                            <tr className="border-t border-neutral-lighter">
                              <td className="px-3 py-1 font-medium">EBITDA</td>
                              <td className="px-3 py-1"><input type="number" className="w-20 border rounded px-1 text-[12px]" value={s.financials.currentEbitda || ""} onChange={(e) => updateSegment(s.id, { financials: { ...s.financials, currentEbitda: parseFloat(e.target.value) || 0 } })} /></td>
                              <td className="px-3 py-1"><input type="number" className="w-20 border rounded px-1 text-[12px]" value={s.financials.ebitda2030 || ""} onChange={(e) => updateSegment(s.id, { financials: { ...s.financials, ebitda2030: parseFloat(e.target.value) || 0 } })} /></td>
                              <td className="px-3 py-1"><input type="number" className="w-20 border rounded px-1 text-[12px]" value={s.financials.ebitda2040 || ""} onChange={(e) => updateSegment(s.id, { financials: { ...s.financials, ebitda2040: parseFloat(e.target.value) || 0 } })} /></td>
                            </tr>
                          </tbody>
                        </table>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <Input label="Annual Capex 2025-2030 (RM M/yr)" type="number" value={s.financials.annualCapex2025_2030 || ""} onChange={(e) => updateSegment(s.id, { financials: { ...s.financials, annualCapex2025_2030: parseFloat(e.target.value) || 0 } })} />
                        <Input label="Annual Capex 2030-2040 (RM M/yr)" type="number" value={s.financials.annualCapex2030_2040 || ""} onChange={(e) => updateSegment(s.id, { financials: { ...s.financials, annualCapex2030_2040: parseFloat(e.target.value) || 0 } })} />
                      </div>

                      {s.financials.totalCapex15Year > 0 && (
                        <div className="bg-blue-50 border border-blue-200 rounded p-2 text-[13px] text-blue-700">
                          Total 15-Year Capex: RM {s.financials.totalCapex15Year.toLocaleString()}M
                        </div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <Input label="Renewable Projects ROI" placeholder="e.g. 12% IRR" value={s.financials.renewableROI} onChange={(e) => updateSegment(s.id, { financials: { ...s.financials, renewableROI: e.target.value } })} />
                        <Input label="Efficiency Projects ROI" placeholder="e.g. 18% IRR" value={s.financials.efficiencyROI} onChange={(e) => updateSegment(s.id, { financials: { ...s.financials, efficiencyROI: e.target.value } })} />
                      </div>
                    </div>
                  )}

                  {/* Milestones Tab */}
                  {tab === "milestones" && (
                    <div className="flex flex-col gap-3">
                      <p className="text-[13px] font-medium text-text-primary">Transition Milestones</p>
                      {s.milestones.map((m, mi) => (
                        <div key={mi} className="flex gap-2 items-center">
                          <input type="number" className="w-16 border border-neutral-lighter rounded px-2 py-1 text-[13px]" placeholder="Year" value={m.year || ""} onChange={(e) => {
                            const milestones = [...s.milestones]; milestones[mi] = { ...m, year: parseInt(e.target.value) || 0 }; updateSegment(s.id, { milestones });
                          }} />
                          <Input className="flex-1" placeholder="Milestone description" value={m.description} onChange={(e) => {
                            const milestones = [...s.milestones]; milestones[mi] = { ...m, description: e.target.value }; updateSegment(s.id, { milestones });
                          }} />
                          <select className="border border-neutral-lighter rounded px-2 py-1 text-[13px]" value={m.status} onChange={(e) => {
                            const milestones = [...s.milestones]; milestones[mi] = { ...m, status: e.target.value as "planned" | "in_progress" | "complete" }; updateSegment(s.id, { milestones });
                          }}>
                            <option value="planned">Planned</option>
                            <option value="in_progress">In Progress</option>
                            <option value="complete">Complete</option>
                          </select>
                          <button className="cursor-pointer text-red-400" onClick={() => updateSegment(s.id, { milestones: s.milestones.filter((_, i) => i !== mi) })}><Trash2 className="w-4 h-4" /></button>
                        </div>
                      ))}
                      <Button variant="secondary" size="sm" className="self-start" onClick={() => updateSegment(s.id, { milestones: [...s.milestones, { year: 2025, description: "", status: "planned" as const }] })}>
                        <Plus className="w-3 h-3" /> Add Milestone
                      </Button>

                      {s.milestones.length > 0 && (
                        <div className="bg-neutral-light rounded p-3 text-[13px]">
                          <div className="flex gap-3">
                            <span className="text-green-600">{s.milestones.filter((m) => m.status === "complete").length} complete</span>
                            <span className="text-amber-600">{s.milestones.filter((m) => m.status === "in_progress").length} in progress</span>
                            <span className="text-text-secondary">{s.milestones.filter((m) => m.status === "planned").length} planned</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Ownership Tab */}
                  {tab === "ownership" && (
                    <div className="flex flex-col gap-3">
                      <p className="text-[13px] font-medium text-text-primary">Segment Owner & Accountability</p>
                      <p className="text-[13px] text-text-secondary">Auditor question: "Who is accountable for this segment's decarbonization? Is their bonus tied to it?"</p>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <Input label="Owner Title" placeholder="e.g. Head of Upstream" value={s.ownership.ownerTitle} onChange={(e) => updateSegment(s.id, { ownership: { ...s.ownership, ownerTitle: e.target.value } })} />
                        <Input label="Owner Name" value={s.ownership.ownerName} onChange={(e) => updateSegment(s.id, { ownership: { ...s.ownership, ownerName: e.target.value } })} />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <Input label="Reports To" placeholder="e.g. CEO / Group CFO" value={s.ownership.reportsTo} onChange={(e) => updateSegment(s.id, { ownership: { ...s.ownership, reportsTo: e.target.value } })} />
                        <Input label="Capex Approval Authority" placeholder="e.g. Approves <RM 50M, escalates above" value={s.ownership.capexApprovalAuthority} onChange={(e) => updateSegment(s.id, { ownership: { ...s.ownership, capexApprovalAuthority: e.target.value } })} />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="text-[13px] font-medium text-text-primary mb-1 block">Reporting Frequency</label>
                          <select className="w-full border border-neutral-lighter rounded-[var(--radius-sm)] px-3 py-2 text-[14px]" value={s.ownership.reportingFrequency} onChange={(e) => updateSegment(s.id, { ownership: { ...s.ownership, reportingFrequency: e.target.value as "monthly" | "quarterly" } })}>
                            <option value="monthly">Monthly to Group CFO</option>
                            <option value="quarterly">Quarterly to Board</option>
                          </select>
                        </div>
                        <Input label="Board Approval Date" type="date" value={s.ownership.boardApprovalDate} onChange={(e) => updateSegment(s.id, { ownership: { ...s.ownership, boardApprovalDate: e.target.value } })} />
                      </div>

                      <div className="flex gap-4">
                        <label className="flex items-center gap-2 text-[13px] cursor-pointer">
                          <input type="checkbox" checked={s.ownership.bonusTiedToClimate} onChange={(e) => updateSegment(s.id, { ownership: { ...s.ownership, bonusTiedToClimate: e.target.checked } })} />
                          Bonus tied to climate targets
                        </label>
                        {s.ownership.bonusTiedToClimate && (
                          <Input label="Climate % of Bonus" type="number" placeholder="e.g. 15" className="w-32" value={s.ownership.climateCompPercent || ""} onChange={(e) => updateSegment(s.id, { ownership: { ...s.ownership, climateCompPercent: parseInt(e.target.value) || 0 } })} />
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end mt-4">
                    <Button variant="ghost" size="sm" className="text-red-500" onClick={() => save({ ...ss, segments: ss.segments.filter((x) => x.id !== s.id) })}>
                      <Trash2 className="w-4 h-4" /> Remove Segment
                    </Button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </Card>

      {/* Segment Summary Table */}
      {ss.segments.length >= 2 && (
        <Card className="mt-6">
          <h2 className="text-[18px] text-primary mb-4">Segment Summary</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-[12px] border border-neutral-lighter rounded">
              <thead className="bg-neutral-light">
                <tr>
                  <th className="px-3 py-2 text-left">Segment</th>
                  <th className="px-3 py-2">Revenue %</th>
                  <th className="px-3 py-2">Emissions %</th>
                  <th className="px-3 py-2">Target 2030</th>
                  <th className="px-3 py-2">Capex (RM M)</th>
                  <th className="px-3 py-2">Owner</th>
                  <th className="px-3 py-2">Milestones</th>
                </tr>
              </thead>
              <tbody>
                {ss.segments.map((s) => (
                  <tr key={s.id} className="border-t border-neutral-lighter">
                    <td className="px-3 py-2 font-medium">{s.name || "—"}</td>
                    <td className="px-3 py-2 text-center">{s.revenueContribution}%</td>
                    <td className="px-3 py-2 text-center">{s.percentOfGroupEmissions}%</td>
                    <td className="px-3 py-2 text-center">{s.targetReduction2030 || "—"}</td>
                    <td className="px-3 py-2 text-center">{s.capexAllocated.toLocaleString()}</td>
                    <td className="px-3 py-2 text-center">{s.ownership.ownerName || "—"}</td>
                    <td className="px-3 py-2 text-center">
                      <span className="text-green-600">{s.milestones.filter((m) => m.status === "complete").length}</span>/
                      {s.milestones.length}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Board Approval */}
      <Card className="mt-6">
        <h2 className="text-[18px] text-primary mb-4">Board Approval</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
          <Input label="Meeting Date" type="date" value={ss.boardApproval?.date || ""} onChange={(e) => save({ ...ss, boardApproval: { date: e.target.value, approved: ss.boardApproval?.approved || false, attendees: ss.boardApproval?.attendees || "" } })} />
          <Input label="Attendees" value={ss.boardApproval?.attendees || ""} onChange={(e) => save({ ...ss, boardApproval: { ...ss.boardApproval!, attendees: e.target.value } })} />
        </div>
        <label className="flex items-center gap-2 text-[14px] cursor-pointer mb-4">
          <input type="checkbox" checked={ss.boardApproval?.approved || false} onChange={(e) => save({ ...ss, boardApproval: { ...ss.boardApproval!, approved: e.target.checked }, status: e.target.checked ? "board_approved" : "complete" })} />
          Board has approved segment-level climate strategies
        </label>
        {ss.boardApproval?.approved && (
          <div className="bg-green-50 border border-green-200 rounded-[var(--radius-sm)] p-4 flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            <p className="text-[14px] text-green-700">Segment Strategy approved on {ss.boardApproval.date}</p>
          </div>
        )}

        <div className="flex justify-end mt-4">
          <Button variant="primary" onClick={() => save({ ...ss, status: ss.boardApproval?.approved ? "board_approved" : "complete" })}>Save Segment Strategy</Button>
        </div>
      </Card>
    </div>
  );
}
