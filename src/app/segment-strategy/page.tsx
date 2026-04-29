"use client";

import { useSteinwall } from "@/lib/context";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, ChevronDown, ChevronRight, CheckCircle2, Layers } from "lucide-react";
import { useState } from "react";
import { v4 as uuid } from "uuid";
import type { SegmentStrategy, BusinessSegment } from "@/lib/types";

const emptySegment = (): BusinessSegment => ({
  id: uuid(), name: "", revenueContribution: 0,
  emissionsScope1: 0, emissionsScope2: 0, emissionsScope3: 0, percentOfGroupEmissions: 0,
  climateRisks: [], climateOpportunities: [], strategy: "",
  targetReduction2030: "", targetReduction2050: "", capexAllocated: 0, milestones: [],
});

export default function SegmentStrategyPage() {
  const { data, update, hydrated } = useSteinwall();
  const [expanded, setExpanded] = useState<string | null>(null);
  const [newRisk, setNewRisk] = useState("");
  const [newOpp, setNewOpp] = useState("");

  const ss = data.segmentStrategy || {
    segments: [], totalGroupEmissions: 0,
    status: "draft" as const, updatedAt: new Date().toISOString(),
  };

  const save = (updated: SegmentStrategy) => {
    const totalGroupEmissions = updated.segments.reduce((sum, s) => sum + s.emissionsScope1 + s.emissionsScope2 + s.emissionsScope3, 0);
    const segments = updated.segments.map((s) => ({
      ...s,
      percentOfGroupEmissions: totalGroupEmissions > 0 ? Math.round(((s.emissionsScope1 + s.emissionsScope2 + s.emissionsScope3) / totalGroupEmissions) * 100) : 0,
    }));
    update({ segmentStrategy: { ...updated, segments, totalGroupEmissions, updatedAt: new Date().toISOString() } });
  };

  if (!hydrated) return <div className="flex items-center justify-center h-64"><p className="text-text-secondary text-[14px]">Loading...</p></div>;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-[28px] text-primary">Segment-Level Climate Strategy</h1>
        <p className="text-text-secondary text-[14px]">Bursa Listing Rule — Climate strategy by principal business segment (required 2026+)</p>
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
          <p className="text-[22px] font-semibold text-primary">{ss.segments.filter((s) => s.strategy).length}/{ss.segments.length}</p>
          <p className="text-[12px] text-text-secondary">Strategies Set</p>
        </div>
      </div>

      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[18px] text-primary">Business Segments</h2>
          <Button variant="primary" size="sm" onClick={() => { const s = emptySegment(); save({ ...ss, segments: [...ss.segments, s] }); setExpanded(s.id); }}>
            <Plus className="w-4 h-4" /> Add Segment
          </Button>
        </div>
        <p className="text-[13px] text-text-secondary mb-4">Auditor question: "What's your decarbonization strategy for each business segment? Is upstream aligned with 2050 net-zero?"</p>

        {ss.segments.length === 0 && (
          <div className="text-center py-8 text-text-secondary text-[14px]">No segments defined. Add your principal business segments.</div>
        )}

        {ss.segments.map((s, si) => {
          const exp = expanded === s.id;
          const segTotal = s.emissionsScope1 + s.emissionsScope2 + s.emissionsScope3;
          return (
            <div key={s.id} className="border border-neutral-lighter rounded-[var(--radius-sm)] mb-3">
              <button onClick={() => setExpanded(exp ? null : s.id)} className="w-full flex items-center justify-between p-4 text-left cursor-pointer">
                <div className="flex items-center gap-3">
                  <Layers className="w-5 h-5 text-primary" />
                  <span className="text-[14px] font-medium">{s.name || "Unnamed Segment"}</span>
                  {s.percentOfGroupEmissions > 0 && <Badge variant="warning">{s.percentOfGroupEmissions}% of emissions</Badge>}
                  {s.revenueContribution > 0 && <span className="text-[12px] text-text-secondary">{s.revenueContribution}% revenue</span>}
                </div>
                {exp ? <ChevronDown className="w-4 h-4 text-text-secondary" /> : <ChevronRight className="w-4 h-4 text-text-secondary" />}
              </button>
              {exp && (
                <div className="px-4 pb-4 flex flex-col gap-3 border-t border-neutral-lighter pt-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <Input label="Segment Name" placeholder="e.g. Upstream Oil & Gas" value={s.name} onChange={(e) => { const u = [...ss.segments]; u[si] = { ...s, name: e.target.value }; save({ ...ss, segments: u }); }} />
                    <Input label="Revenue Contribution (%)" type="number" value={s.revenueContribution || ""} onChange={(e) => { const u = [...ss.segments]; u[si] = { ...s, revenueContribution: parseFloat(e.target.value) || 0 }; save({ ...ss, segments: u }); }} />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <Input label="Scope 1 (tCO2e)" type="number" value={s.emissionsScope1 || ""} onChange={(e) => { const u = [...ss.segments]; u[si] = { ...s, emissionsScope1: parseFloat(e.target.value) || 0 }; save({ ...ss, segments: u }); }} />
                    <Input label="Scope 2 (tCO2e)" type="number" value={s.emissionsScope2 || ""} onChange={(e) => { const u = [...ss.segments]; u[si] = { ...s, emissionsScope2: parseFloat(e.target.value) || 0 }; save({ ...ss, segments: u }); }} />
                    <Input label="Scope 3 (tCO2e)" type="number" value={s.emissionsScope3 || ""} onChange={(e) => { const u = [...ss.segments]; u[si] = { ...s, emissionsScope3: parseFloat(e.target.value) || 0 }; save({ ...ss, segments: u }); }} />
                  </div>

                  <div className="bg-neutral-light rounded-[var(--radius-sm)] p-3 text-[13px]">
                    Segment Total: {segTotal.toLocaleString()} tCO2e ({s.percentOfGroupEmissions}% of group)
                  </div>

                  <div>
                    <label className="text-[13px] font-medium text-text-primary mb-1 block">Climate Risks</label>
                    <div className="flex gap-2 flex-wrap mb-2">
                      {s.climateRisks.map((r, ri) => (
                        <Badge key={ri} variant="error" className="flex items-center gap-1">{r}
                          <button className="cursor-pointer" onClick={() => { const u = [...ss.segments]; u[si] = { ...s, climateRisks: s.climateRisks.filter((_, i) => i !== ri) }; save({ ...ss, segments: u }); }}><Trash2 className="w-3 h-3" /></button>
                        </Badge>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Input placeholder="e.g. Stranded assets from oil decline" value={newRisk} onChange={(e) => setNewRisk(e.target.value)} />
                      <Button variant="secondary" size="sm" onClick={() => { if (newRisk.trim()) { const u = [...ss.segments]; u[si] = { ...s, climateRisks: [...s.climateRisks, newRisk.trim()] }; save({ ...ss, segments: u }); setNewRisk(""); } }}>Add</Button>
                    </div>
                  </div>

                  <div>
                    <label className="text-[13px] font-medium text-text-primary mb-1 block">Climate Opportunities</label>
                    <div className="flex gap-2 flex-wrap mb-2">
                      {s.climateOpportunities.map((o, oi) => (
                        <Badge key={oi} variant="success" className="flex items-center gap-1">{o}
                          <button className="cursor-pointer" onClick={() => { const u = [...ss.segments]; u[si] = { ...s, climateOpportunities: s.climateOpportunities.filter((_, i) => i !== oi) }; save({ ...ss, segments: u }); }}><Trash2 className="w-3 h-3" /></button>
                        </Badge>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Input placeholder="e.g. Transition to renewable-powered operations" value={newOpp} onChange={(e) => setNewOpp(e.target.value)} />
                      <Button variant="secondary" size="sm" onClick={() => { if (newOpp.trim()) { const u = [...ss.segments]; u[si] = { ...s, climateOpportunities: [...s.climateOpportunities, newOpp.trim()] }; save({ ...ss, segments: u }); setNewOpp(""); } }}>Add</Button>
                    </div>
                  </div>

                  <div>
                    <label className="text-[13px] font-medium text-text-primary mb-1 block">Segment Strategy</label>
                    <textarea className="w-full border border-neutral-lighter rounded-[var(--radius-sm)] px-3 py-2 text-[14px] min-h-[80px]" placeholder="e.g. Managed decline pathway — shift RM 20B capex from oil to renewables by 2035" value={s.strategy} onChange={(e) => { const u = [...ss.segments]; u[si] = { ...s, strategy: e.target.value }; save({ ...ss, segments: u }); }} />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <Input label="Target Reduction 2030" placeholder="e.g. -50% vs baseline" value={s.targetReduction2030} onChange={(e) => { const u = [...ss.segments]; u[si] = { ...s, targetReduction2030: e.target.value }; save({ ...ss, segments: u }); }} />
                    <Input label="Target Reduction 2050" placeholder="e.g. Net-zero" value={s.targetReduction2050} onChange={(e) => { const u = [...ss.segments]; u[si] = { ...s, targetReduction2050: e.target.value }; save({ ...ss, segments: u }); }} />
                    <Input label="Capex Allocated (RM M)" type="number" value={s.capexAllocated || ""} onChange={(e) => { const u = [...ss.segments]; u[si] = { ...s, capexAllocated: parseFloat(e.target.value) || 0 }; save({ ...ss, segments: u }); }} />
                  </div>

                  <Button variant="ghost" size="sm" className="self-end text-red-500" onClick={() => save({ ...ss, segments: ss.segments.filter((_, i) => i !== si) })}>
                    <Trash2 className="w-4 h-4" /> Remove Segment
                  </Button>
                </div>
              )}
            </div>
          );
        })}
      </Card>

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
