"use client";

import { useSteinwall } from "@/lib/context";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Users, Shield, ChevronDown, ChevronRight, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { v4 as uuid } from "uuid";
import type { GovernanceFramework, GovernanceCommittee, GovernanceAccountability } from "@/lib/types";
import { governanceRoles, reportingCadenceOptions } from "@/lib/nfrs-gap-data";

const emptyCommittee = (): GovernanceCommittee => ({
  id: uuid(),
  name: "",
  chair: "",
  members: [],
  frequency: "quarterly",
  decisionRights: [],
  charter: "",
});

const emptyAccountability = (): GovernanceAccountability => ({
  id: uuid(),
  role: "",
  name: "",
  responsibilities: [],
  kpiLinked: false,
  compensationLinked: false,
  reportingTo: "",
});

export default function GovernancePage() {
  const { data, update, hydrated } = useSteinwall();
  const [step, setStep] = useState(0);
  const [expandedCommittee, setExpandedCommittee] = useState<string | null>(null);
  const [expandedRole, setExpandedRole] = useState<string | null>(null);
  const [newMember, setNewMember] = useState("");
  const [newRight, setNewRight] = useState("");
  const [newResp, setNewResp] = useState("");

  const gov = data.governance || {
    boardOversight: [],
    executiveAccountability: [],
    reportingCadence: "",
    integrationWithFinancialPlanning: "",
    status: "draft" as const,
    updatedAt: new Date().toISOString(),
  };

  const save = (updated: GovernanceFramework) => {
    update({ governance: { ...updated, updatedAt: new Date().toISOString() } });
  };

  if (!hydrated) return <div className="flex items-center justify-center h-64"><p className="text-text-secondary text-[14px]">Loading...</p></div>;

  const steps = ["Board Oversight", "Executive Accountability", "Reporting & Integration", "Board Approval"];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-[28px] text-primary">Governance Framework</h1>
        <p className="text-text-secondary text-[14px]">IFRS S1 Core — Board oversight, accountability structure, KPI linkage</p>
      </div>

      <div className="flex gap-2 mb-6 flex-wrap">
        {steps.map((s, i) => (
          <button
            key={s}
            onClick={() => setStep(i)}
            className={`px-3 py-1.5 rounded-full text-[12px] font-medium transition-colors cursor-pointer ${
              step === i ? "bg-primary text-white" : i < step ? "bg-green-100 text-green-700" : "bg-neutral-light text-text-secondary"
            }`}
          >
            {i < step ? "✓ " : ""}{s}
          </button>
        ))}
      </div>

      {step === 0 && (
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[18px] text-primary">Board Oversight Structure</h2>
            <Button variant="primary" size="sm" onClick={() => save({ ...gov, boardOversight: [...gov.boardOversight, emptyCommittee()] })}>
              <Plus className="w-4 h-4" /> Add Committee
            </Button>
          </div>
          <p className="text-[13px] text-text-secondary mb-4">Define board committees responsible for sustainability oversight. Auditors will ask: "Who governs climate strategy at board level?"</p>

          {gov.boardOversight.length === 0 && (
            <div className="text-center py-8 text-text-secondary text-[14px]">No committees defined yet. Add your first board committee.</div>
          )}

          {gov.boardOversight.map((c, ci) => {
            const expanded = expandedCommittee === c.id;
            return (
              <div key={c.id} className="border border-neutral-lighter rounded-[var(--radius-sm)] mb-3">
                <button
                  onClick={() => setExpandedCommittee(expanded ? null : c.id)}
                  className="w-full flex items-center justify-between p-4 text-left cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-primary" />
                    <span className="text-[14px] font-medium text-text-primary">{c.name || "Unnamed Committee"}</span>
                    {c.name && c.chair && <Badge variant="success">Configured</Badge>}
                  </div>
                  {expanded ? <ChevronDown className="w-4 h-4 text-text-secondary" /> : <ChevronRight className="w-4 h-4 text-text-secondary" />}
                </button>
                {expanded && (
                  <div className="px-4 pb-4 flex flex-col gap-3 border-t border-neutral-lighter pt-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <Input label="Committee Name" placeholder="e.g. Sustainability Committee" value={c.name} onChange={(e) => {
                        const updated = [...gov.boardOversight]; updated[ci] = { ...c, name: e.target.value }; save({ ...gov, boardOversight: updated });
                      }} />
                      <Input label="Chair" placeholder="e.g. Tan Sri Ahmad" value={c.chair} onChange={(e) => {
                        const updated = [...gov.boardOversight]; updated[ci] = { ...c, chair: e.target.value }; save({ ...gov, boardOversight: updated });
                      }} />
                    </div>
                    <div>
                      <label className="text-[13px] font-medium text-text-primary mb-1 block">Meeting Frequency</label>
                      <select className="w-full border border-neutral-lighter rounded-[var(--radius-sm)] px-3 py-2 text-[14px]" value={c.frequency} onChange={(e) => {
                        const updated = [...gov.boardOversight]; updated[ci] = { ...c, frequency: e.target.value as GovernanceCommittee["frequency"] }; save({ ...gov, boardOversight: updated });
                      }}>
                        <option value="monthly">Monthly</option>
                        <option value="quarterly">Quarterly</option>
                        <option value="biannual">Biannual</option>
                        <option value="annual">Annual</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[13px] font-medium text-text-primary mb-1 block">Members</label>
                      <div className="flex gap-2 flex-wrap mb-2">
                        {c.members.map((m, mi) => (
                          <Badge key={mi} variant="info" className="flex items-center gap-1">
                            {m}
                            <button className="cursor-pointer" onClick={() => {
                              const updated = [...gov.boardOversight]; updated[ci] = { ...c, members: c.members.filter((_, i) => i !== mi) }; save({ ...gov, boardOversight: updated });
                            }}><Trash2 className="w-3 h-3" /></button>
                          </Badge>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <Input placeholder="Add member name" value={newMember} onChange={(e) => setNewMember(e.target.value)} />
                        <Button variant="secondary" size="sm" onClick={() => { if (newMember.trim()) { const updated = [...gov.boardOversight]; updated[ci] = { ...c, members: [...c.members, newMember.trim()] }; save({ ...gov, boardOversight: updated }); setNewMember(""); } }}>Add</Button>
                      </div>
                    </div>
                    <div>
                      <label className="text-[13px] font-medium text-text-primary mb-1 block">Decision Rights</label>
                      <div className="flex gap-2 flex-wrap mb-2">
                        {c.decisionRights.map((r, ri) => (
                          <Badge key={ri} variant="neutral" className="flex items-center gap-1">
                            {r}
                            <button className="cursor-pointer" onClick={() => {
                              const updated = [...gov.boardOversight]; updated[ci] = { ...c, decisionRights: c.decisionRights.filter((_, i) => i !== ri) }; save({ ...gov, boardOversight: updated });
                            }}><Trash2 className="w-3 h-3" /></button>
                          </Badge>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <Input placeholder="e.g. Approve net-zero targets" value={newRight} onChange={(e) => setNewRight(e.target.value)} />
                        <Button variant="secondary" size="sm" onClick={() => { if (newRight.trim()) { const updated = [...gov.boardOversight]; updated[ci] = { ...c, decisionRights: [...c.decisionRights, newRight.trim()] }; save({ ...gov, boardOversight: updated }); setNewRight(""); } }}>Add</Button>
                      </div>
                    </div>
                    <Input label="Committee Charter (brief)" placeholder="Oversight of climate strategy, risk management, and target-setting" value={c.charter} onChange={(e) => {
                      const updated = [...gov.boardOversight]; updated[ci] = { ...c, charter: e.target.value }; save({ ...gov, boardOversight: updated });
                    }} />
                    <Button variant="ghost" size="sm" className="self-end text-red-500" onClick={() => save({ ...gov, boardOversight: gov.boardOversight.filter((_, i) => i !== ci) })}>
                      <Trash2 className="w-4 h-4" /> Remove Committee
                    </Button>
                  </div>
                )}
              </div>
            );
          })}

          <div className="flex justify-end mt-4">
            <Button variant="primary" onClick={() => setStep(1)}>Next: Executive Accountability →</Button>
          </div>
        </Card>
      )}

      {step === 1 && (
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[18px] text-primary">Executive Accountability</h2>
            <Button variant="primary" size="sm" onClick={() => save({ ...gov, executiveAccountability: [...gov.executiveAccountability, emptyAccountability()] })}>
              <Plus className="w-4 h-4" /> Add Role
            </Button>
          </div>
          <p className="text-[13px] text-text-secondary mb-2">Auditor question: "Who is accountable for meeting climate targets? Is it tied to compensation?"</p>
          <div className="flex gap-2 flex-wrap mb-4">
            {governanceRoles.map((gr) => {
              const exists = gov.executiveAccountability.some((a) => a.role === gr.role);
              return (
                <button key={gr.role} className={`px-3 py-1.5 rounded-full text-[11px] font-medium cursor-pointer transition-colors ${exists ? "bg-green-100 text-green-700" : "bg-neutral-light text-text-secondary hover:bg-primary-light hover:text-primary"}`}
                  onClick={() => { if (!exists) { save({ ...gov, executiveAccountability: [...gov.executiveAccountability, { ...emptyAccountability(), role: gr.role, responsibilities: [gr.typical] }] }); } }}>
                  {exists ? "✓ " : "+ "}{gr.role}
                </button>
              );
            })}
          </div>

          {gov.executiveAccountability.map((a, ai) => {
            const expanded = expandedRole === a.id;
            return (
              <div key={a.id} className="border border-neutral-lighter rounded-[var(--radius-sm)] mb-3">
                <button onClick={() => setExpandedRole(expanded ? null : a.id)} className="w-full flex items-center justify-between p-4 text-left cursor-pointer">
                  <div className="flex items-center gap-3">
                    <Shield className="w-5 h-5 text-primary" />
                    <span className="text-[14px] font-medium">{a.role || "Unnamed Role"}</span>
                    {a.name && <span className="text-[12px] text-text-secondary">— {a.name}</span>}
                    <div className="flex gap-1">
                      {a.kpiLinked && <Badge variant="success">KPI</Badge>}
                      {a.compensationLinked && <Badge variant="warning">Comp</Badge>}
                    </div>
                  </div>
                  {expanded ? <ChevronDown className="w-4 h-4 text-text-secondary" /> : <ChevronRight className="w-4 h-4 text-text-secondary" />}
                </button>
                {expanded && (
                  <div className="px-4 pb-4 flex flex-col gap-3 border-t border-neutral-lighter pt-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <Input label="Role Title" value={a.role} onChange={(e) => { const u = [...gov.executiveAccountability]; u[ai] = { ...a, role: e.target.value }; save({ ...gov, executiveAccountability: u }); }} />
                      <Input label="Name" placeholder="Person's name" value={a.name} onChange={(e) => { const u = [...gov.executiveAccountability]; u[ai] = { ...a, name: e.target.value }; save({ ...gov, executiveAccountability: u }); }} />
                    </div>
                    <Input label="Reports To" placeholder="e.g. Board Sustainability Committee" value={a.reportingTo} onChange={(e) => { const u = [...gov.executiveAccountability]; u[ai] = { ...a, reportingTo: e.target.value }; save({ ...gov, executiveAccountability: u }); }} />
                    <div>
                      <label className="text-[13px] font-medium text-text-primary mb-1 block">Responsibilities</label>
                      <div className="flex flex-col gap-1 mb-2">
                        {a.responsibilities.map((r, ri) => (
                          <div key={ri} className="flex items-center gap-2 text-[13px]">
                            <span className="flex-1">• {r}</span>
                            <button className="cursor-pointer text-red-400 hover:text-red-600" onClick={() => { const u = [...gov.executiveAccountability]; u[ai] = { ...a, responsibilities: a.responsibilities.filter((_, i) => i !== ri) }; save({ ...gov, executiveAccountability: u }); }}><Trash2 className="w-3 h-3" /></button>
                          </div>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <Input placeholder="Add responsibility" value={newResp} onChange={(e) => setNewResp(e.target.value)} />
                        <Button variant="secondary" size="sm" onClick={() => { if (newResp.trim()) { const u = [...gov.executiveAccountability]; u[ai] = { ...a, responsibilities: [...a.responsibilities, newResp.trim()] }; save({ ...gov, executiveAccountability: u }); setNewResp(""); } }}>Add</Button>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 text-[13px] cursor-pointer">
                        <input type="checkbox" checked={a.kpiLinked} onChange={(e) => { const u = [...gov.executiveAccountability]; u[ai] = { ...a, kpiLinked: e.target.checked }; save({ ...gov, executiveAccountability: u }); }} />
                        KPI-Linked
                      </label>
                      <label className="flex items-center gap-2 text-[13px] cursor-pointer">
                        <input type="checkbox" checked={a.compensationLinked} onChange={(e) => { const u = [...gov.executiveAccountability]; u[ai] = { ...a, compensationLinked: e.target.checked }; save({ ...gov, executiveAccountability: u }); }} />
                        Compensation-Linked
                      </label>
                    </div>
                    <Button variant="ghost" size="sm" className="self-end text-red-500" onClick={() => save({ ...gov, executiveAccountability: gov.executiveAccountability.filter((_, i) => i !== ai) })}>
                      <Trash2 className="w-4 h-4" /> Remove
                    </Button>
                  </div>
                )}
              </div>
            );
          })}

          <div className="flex justify-between mt-4">
            <Button variant="secondary" onClick={() => setStep(0)}>← Back</Button>
            <Button variant="primary" onClick={() => setStep(2)}>Next: Reporting & Integration →</Button>
          </div>
        </Card>
      )}

      {step === 2 && (
        <Card>
          <h2 className="text-[18px] text-primary mb-4">Reporting Cadence & Financial Integration</h2>
          <p className="text-[13px] text-text-secondary mb-4">Auditor question: "How often does the board review climate progress? Is it integrated with financial planning?"</p>

          <div className="mb-4">
            <label className="text-[13px] font-medium text-text-primary mb-1 block">Reporting Cadence</label>
            <div className="flex flex-col gap-2">
              {reportingCadenceOptions.map((opt) => (
                <label key={opt} className="flex items-center gap-2 text-[13px] cursor-pointer">
                  <input type="radio" name="cadence" checked={gov.reportingCadence === opt} onChange={() => save({ ...gov, reportingCadence: opt })} />
                  {opt}
                </label>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <label className="text-[13px] font-medium text-text-primary mb-1 block">Integration with Financial Planning</label>
            <textarea
              className="w-full border border-neutral-lighter rounded-[var(--radius-sm)] px-3 py-2 text-[14px] min-h-[100px]"
              placeholder="Describe how sustainability strategy is integrated with capital allocation, budgeting, and investment decisions..."
              value={gov.integrationWithFinancialPlanning}
              onChange={(e) => save({ ...gov, integrationWithFinancialPlanning: e.target.value })}
            />
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
          <p className="text-[13px] text-text-secondary mb-4">Record board approval of the governance framework for audit trail purposes.</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
            <Input label="Meeting Date" type="date" value={gov.boardApproval?.date || ""} onChange={(e) => save({ ...gov, boardApproval: { date: e.target.value, approved: gov.boardApproval?.approved || false, attendees: gov.boardApproval?.attendees || "" } })} />
            <Input label="Attendees" placeholder="List attendees" value={gov.boardApproval?.attendees || ""} onChange={(e) => save({ ...gov, boardApproval: { ...gov.boardApproval!, attendees: e.target.value } })} />
          </div>

          <label className="flex items-center gap-2 text-[14px] cursor-pointer mb-4">
            <input type="checkbox" checked={gov.boardApproval?.approved || false} onChange={(e) => save({ ...gov, boardApproval: { ...gov.boardApproval!, approved: e.target.checked }, status: e.target.checked ? "board_approved" : "complete" })} />
            Board has approved this governance framework
          </label>

          {gov.boardApproval?.approved && (
            <div className="bg-green-50 border border-green-200 rounded-[var(--radius-sm)] p-4 flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              <p className="text-[14px] text-green-700">Governance Framework approved by the Board on {gov.boardApproval.date}</p>
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-[var(--radius-sm)] p-4 mt-4">
            <p className="text-[13px] font-medium text-blue-800 mb-2">Summary</p>
            <p className="text-[13px] text-blue-700">
              {gov.boardOversight.length} committee(s) · {gov.executiveAccountability.length} executive role(s) ·{" "}
              {gov.executiveAccountability.filter((a) => a.kpiLinked).length} KPI-linked ·{" "}
              {gov.executiveAccountability.filter((a) => a.compensationLinked).length} compensation-linked
            </p>
          </div>

          <div className="flex justify-between mt-4">
            <Button variant="secondary" onClick={() => setStep(2)}>← Back</Button>
            <Button variant="primary" onClick={() => save({ ...gov, status: gov.boardApproval?.approved ? "board_approved" : "complete" })}>
              Save Governance Framework
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
