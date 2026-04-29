"use client";

import { useSteinwall } from "@/lib/context";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, ChevronDown, ChevronRight, CheckCircle2, MapPin } from "lucide-react";
import { useState } from "react";
import { v4 as uuid } from "uuid";
import type { PhysicalRiskAssessment, Facility } from "@/lib/types";
import { climateHazards } from "@/lib/nfrs-gap-data";

const emptyFacility = (): Facility => ({
  id: uuid(), name: "", location: "", assetValue: 0,
  hazards: [], mitigationCapex: 0, mitigationPlan: "", businessContinuityPlan: "",
});

export default function PhysicalRiskPage() {
  const { data, update, hydrated } = useSteinwall();
  const [expanded, setExpanded] = useState<string | null>(null);
  const [step, setStep] = useState(0);

  const pr = data.physicalRisk || {
    facilities: [], scenarioUsed: "2c", totalExposure: 0, totalMitigationCapex: 0,
    status: "draft" as const, updatedAt: new Date().toISOString(),
  };

  const save = (updated: PhysicalRiskAssessment) => {
    const totalExposure = updated.facilities.reduce((sum, f) => sum + f.hazards.reduce((hs, h) => hs + h.financialExposure, 0), 0);
    const totalMitigationCapex = updated.facilities.reduce((sum, f) => sum + f.mitigationCapex, 0);
    update({ physicalRisk: { ...updated, totalExposure, totalMitigationCapex, updatedAt: new Date().toISOString() } });
  };

  if (!hydrated) return <div className="flex items-center justify-center h-64"><p className="text-text-secondary text-[14px]">Loading...</p></div>;

  const steps = ["Facility Inventory", "Hazard Assessment", "Board Approval"];
  const severityColors = { high: "bg-red-100 text-red-800", medium: "bg-amber-100 text-amber-800", low: "bg-green-100 text-green-800" };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-[28px] text-primary">Physical Risk Assessment</h1>
        <p className="text-text-secondary text-[14px]">NSRF Emerging — Facility-level climate hazard mapping, resilience capex planning</p>
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
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[18px] text-primary">Facility Inventory</h2>
            <Button variant="primary" size="sm" onClick={() => { const f = emptyFacility(); save({ ...pr, facilities: [...pr.facilities, f] }); setExpanded(f.id); }}>
              <Plus className="w-4 h-4" /> Add Facility
            </Button>
          </div>

          <div className="mb-4">
            <label className="text-[13px] font-medium text-text-primary mb-1 block">Scenario Used for Assessment</label>
            <select className="border border-neutral-lighter rounded-[var(--radius-sm)] px-3 py-2 text-[14px]" value={pr.scenarioUsed} onChange={(e) => save({ ...pr, scenarioUsed: e.target.value })}>
              <option value="1.5c">1.5°C Pathway</option>
              <option value="2c">2°C Pathway</option>
              <option value="4c">4°C (Business-as-Usual)</option>
            </select>
          </div>

          {pr.facilities.length === 0 && (
            <div className="text-center py-8 text-text-secondary text-[14px]">No facilities added yet. Add your operating facilities for risk mapping.</div>
          )}

          {pr.facilities.map((f, fi_idx) => {
            const exp = expanded === f.id;
            return (
              <div key={f.id} className="border border-neutral-lighter rounded-[var(--radius-sm)] mb-3">
                <button onClick={() => setExpanded(exp ? null : f.id)} className="w-full flex items-center justify-between p-4 text-left cursor-pointer">
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-primary" />
                    <span className="text-[14px] font-medium">{f.name || "Unnamed Facility"}</span>
                    {f.location && <span className="text-[12px] text-text-secondary">— {f.location}</span>}
                    {f.hazards.length > 0 && <Badge variant="warning">{f.hazards.length} hazard(s)</Badge>}
                  </div>
                  {exp ? <ChevronDown className="w-4 h-4 text-text-secondary" /> : <ChevronRight className="w-4 h-4 text-text-secondary" />}
                </button>
                {exp && (
                  <div className="px-4 pb-4 flex flex-col gap-3 border-t border-neutral-lighter pt-3">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <Input label="Facility Name" value={f.name} onChange={(e) => { const u = [...pr.facilities]; u[fi_idx] = { ...f, name: e.target.value }; save({ ...pr, facilities: u }); }} />
                      <Input label="Location" placeholder="e.g. Pengerang, Johor" value={f.location} onChange={(e) => { const u = [...pr.facilities]; u[fi_idx] = { ...f, location: e.target.value }; save({ ...pr, facilities: u }); }} />
                      <Input label="Asset Value (RM M)" type="number" value={f.assetValue || ""} onChange={(e) => { const u = [...pr.facilities]; u[fi_idx] = { ...f, assetValue: parseFloat(e.target.value) || 0 }; save({ ...pr, facilities: u }); }} />
                    </div>

                    <div>
                      <label className="text-[13px] font-medium text-text-primary mb-2 block">Climate Hazards</label>
                      <div className="flex gap-2 flex-wrap mb-3">
                        {climateHazards.map((h) => {
                          const exists = f.hazards.some((fh) => fh.type === h.type);
                          return (
                            <button key={h.type} className={`px-3 py-1.5 rounded-full text-[11px] font-medium cursor-pointer transition-colors ${exists ? "bg-red-100 text-red-700" : "bg-neutral-light text-text-secondary hover:bg-amber-100 hover:text-amber-700"}`}
                              onClick={() => {
                                const u = [...pr.facilities];
                                if (exists) {
                                  u[fi_idx] = { ...f, hazards: f.hazards.filter((fh) => fh.type !== h.type) };
                                } else {
                                  u[fi_idx] = { ...f, hazards: [...f.hazards, { type: h.type, severity: "medium", likelihood: "", financialExposure: 0 }] };
                                }
                                save({ ...pr, facilities: u });
                              }}>
                              {exists ? "✓ " : "+ "}{h.type}
                            </button>
                          );
                        })}
                      </div>

                      {f.hazards.map((h, hi) => (
                        <div key={hi} className="flex gap-2 items-center mb-2 bg-neutral-light rounded-[var(--radius-sm)] p-2">
                          <Badge className={severityColors[h.severity]}>{h.type}</Badge>
                          <select className="border border-neutral-lighter rounded px-2 py-1 text-[12px]" value={h.severity} onChange={(e) => {
                            const u = [...pr.facilities]; const hazards = [...f.hazards]; hazards[hi] = { ...h, severity: e.target.value as "high" | "medium" | "low" }; u[fi_idx] = { ...f, hazards }; save({ ...pr, facilities: u });
                          }}>
                            <option value="high">High</option><option value="medium">Medium</option><option value="low">Low</option>
                          </select>
                          <input className="border border-neutral-lighter rounded px-2 py-1 text-[12px] flex-1" placeholder="Likelihood" value={h.likelihood} onChange={(e) => {
                            const u = [...pr.facilities]; const hazards = [...f.hazards]; hazards[hi] = { ...h, likelihood: e.target.value }; u[fi_idx] = { ...f, hazards }; save({ ...pr, facilities: u });
                          }} />
                          <input type="number" className="border border-neutral-lighter rounded px-2 py-1 text-[12px] w-24" placeholder="RM M" value={h.financialExposure || ""} onChange={(e) => {
                            const u = [...pr.facilities]; const hazards = [...f.hazards]; hazards[hi] = { ...h, financialExposure: parseFloat(e.target.value) || 0 }; u[fi_idx] = { ...f, hazards }; save({ ...pr, facilities: u });
                          }} />
                        </div>
                      ))}
                    </div>

                    <Input label="Mitigation Capex (RM M)" type="number" value={f.mitigationCapex || ""} onChange={(e) => { const u = [...pr.facilities]; u[fi_idx] = { ...f, mitigationCapex: parseFloat(e.target.value) || 0 }; save({ ...pr, facilities: u }); }} />

                    <div>
                      <label className="text-[13px] font-medium text-text-primary mb-1 block">Mitigation Plan</label>
                      <textarea className="w-full border border-neutral-lighter rounded-[var(--radius-sm)] px-3 py-2 text-[14px] min-h-[60px]" value={f.mitigationPlan} onChange={(e) => { const u = [...pr.facilities]; u[fi_idx] = { ...f, mitigationPlan: e.target.value }; save({ ...pr, facilities: u }); }} />
                    </div>
                    <div>
                      <label className="text-[13px] font-medium text-text-primary mb-1 block">Business Continuity Plan</label>
                      <textarea className="w-full border border-neutral-lighter rounded-[var(--radius-sm)] px-3 py-2 text-[14px] min-h-[60px]" value={f.businessContinuityPlan} onChange={(e) => { const u = [...pr.facilities]; u[fi_idx] = { ...f, businessContinuityPlan: e.target.value }; save({ ...pr, facilities: u }); }} />
                    </div>

                    <Button variant="ghost" size="sm" className="self-end text-red-500" onClick={() => save({ ...pr, facilities: pr.facilities.filter((_, i) => i !== fi_idx) })}>
                      <Trash2 className="w-4 h-4" /> Remove Facility
                    </Button>
                  </div>
                )}
              </div>
            );
          })}

          <div className="flex justify-end mt-4">
            <Button variant="primary" onClick={() => setStep(2)}>Next: Board Approval →</Button>
          </div>
        </Card>
      )}

      {step === 2 && (
        <Card>
          <h2 className="text-[18px] text-primary mb-4">Board Approval</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
            <Input label="Meeting Date" type="date" value={pr.boardApproval?.date || ""} onChange={(e) => save({ ...pr, boardApproval: { date: e.target.value, approved: pr.boardApproval?.approved || false, attendees: pr.boardApproval?.attendees || "" } })} />
            <Input label="Attendees" value={pr.boardApproval?.attendees || ""} onChange={(e) => save({ ...pr, boardApproval: { ...pr.boardApproval!, attendees: e.target.value } })} />
          </div>
          <label className="flex items-center gap-2 text-[14px] cursor-pointer mb-4">
            <input type="checkbox" checked={pr.boardApproval?.approved || false} onChange={(e) => save({ ...pr, boardApproval: { ...pr.boardApproval!, approved: e.target.checked }, status: e.target.checked ? "board_approved" : "complete" })} />
            Board has approved this physical risk assessment
          </label>
          {pr.boardApproval?.approved && (
            <div className="bg-green-50 border border-green-200 rounded-[var(--radius-sm)] p-4 flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              <p className="text-[14px] text-green-700">Physical Risk Assessment approved on {pr.boardApproval.date}</p>
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-[var(--radius-sm)] p-4 mt-4">
            <p className="text-[13px] font-medium text-blue-800 mb-2">Summary</p>
            <p className="text-[13px] text-blue-700">
              {pr.facilities.length} facilit{pr.facilities.length === 1 ? "y" : "ies"} assessed ·{" "}
              Total Exposure: RM {pr.totalExposure.toLocaleString()}M ·{" "}
              Total Mitigation Capex: RM {pr.totalMitigationCapex.toLocaleString()}M ·{" "}
              Scenario: {pr.scenarioUsed}
            </p>
          </div>

          <div className="flex justify-between mt-4">
            <Button variant="secondary" onClick={() => setStep(0)}>← Back</Button>
            <Button variant="primary" onClick={() => save({ ...pr, status: pr.boardApproval?.approved ? "board_approved" : "complete" })}>Save Physical Risk Assessment</Button>
          </div>
        </Card>
      )}
    </div>
  );
}
