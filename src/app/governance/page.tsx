"use client";

import { useSteinwall } from "@/lib/context";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Users, Shield, ChevronDown, ChevronRight, CheckCircle2, AlertTriangle } from "lucide-react";
import { useState } from "react";
import { v4 as uuid } from "uuid";
import type { GovernanceFramework, GovernanceCommittee, GovernanceAccountability, GovernanceModelType, DecisionAuthority, CompensationLinkage } from "@/lib/types";
import {
  governanceRoles, reportingCadenceOptions, governanceModelOptions,
  authorityLevelOptions, committeeCanApproveDefaults, boardMustApproveDefaults,
  investorDisclosureOptions, communicationMethodOptions,
} from "@/lib/nfrs-gap-data";
import { HelpField } from "@/components/ui/help-field";
import { governanceHelp } from "@/lib/help-content";

const emptyCommittee = (): GovernanceCommittee => ({
  id: uuid(), name: "", chair: "", members: [], frequency: "quarterly",
  decisionRights: [], charter: "", includeIndependentDirectors: false,
  includeAuditChair: false, includeRiskChair: false, authorityLevel: "limited",
  esgAgendaMinutes: 30, charterApproved: false, charterApprovedDate: "",
  minutesDocumented: false, minutesStorage: "",
});

const emptyCompensation = (): CompensationLinkage => ({
  baseSalary: "", bonusPotentialPercent: 100, financialPercent: 50,
  strategicPercent: 30, climatePercent: 20, climateMetrics: [],
});

const emptyAccountability = (): GovernanceAccountability => ({
  id: uuid(), role: "", name: "", yearsInRole: "", responsibilities: [],
  successMetrics: [], consequences: "", kpiLinked: false,
  compensationLinked: false, compensation: null, reportingTo: "",
  boardApprovalDate: "", mandate: "",
});

const emptyAuthority = (): DecisionAuthority => ({
  committeeCanApprove: [], boardMustApprove: [], capexThreshold: "50",
});

function calcGovernanceMaturity(gov: GovernanceFramework): number {
  let score = 0;
  if (gov.governanceModel === "dedicated_committee" || gov.governanceModel === "direct_board") score += 3;
  else if (gov.governanceModel === "audit_committee" || gov.governanceModel === "risk_committee") score += 2;
  if (gov.boardOversight.length > 0) score += 1;
  const c = gov.boardOversight[0];
  if (c) {
    if (c.frequency === "monthly") score += 2;
    else if (c.frequency === "quarterly") score += 1;
    if (c.charterApproved) score += 1;
    if (c.minutesDocumented) score += 1;
    if (c.authorityLevel === "full") score += 1;
    else if (c.authorityLevel === "limited") score += 0.5;
  }
  return Math.min(10, Math.round(score));
}

function calcAccountabilityMaturity(gov: GovernanceFramework): number {
  let score = 0;
  const a = gov.executiveAccountability;
  if (a.length === 0) return 0;
  if (a.length >= 1) score += 2;
  if (a.length >= 3) score += 1;
  if (a.length >= 5) score += 1;
  if (a.some(r => r.name)) score += 1;
  if (a.some(r => r.kpiLinked)) score += 1;
  if (a.some(r => r.compensationLinked)) score += 2;
  if (a.some(r => r.boardApprovalDate)) score += 1;
  if (a.some(r => r.mandate)) score += 1;
  return Math.min(10, score);
}

function maturityLabel(score: number): { label: string; color: string } {
  if (score <= 2) return { label: "No formal structure (Red Flag)", color: "text-red-600" };
  if (score <= 4) return { label: "Ad-hoc oversight (Minimal)", color: "text-amber-600" };
  if (score <= 6) return { label: "Structured governance (Material)", color: "text-blue-600" };
  if (score <= 8) return { label: "Strategic integration", color: "text-green-600" };
  return { label: "Board-primary excellence", color: "text-green-700" };
}

export default function GovernancePage() {
  const { data, update, hydrated } = useSteinwall();
  const [step, setStep] = useState(0);
  const [expandedCommittee, setExpandedCommittee] = useState<string | null>(null);
  const [expandedRole, setExpandedRole] = useState<string | null>(null);
  const [newMember, setNewMember] = useState("");
  const [newRight, setNewRight] = useState("");
  const [newResp, setNewResp] = useState("");
  const [newMetric, setNewMetric] = useState("");
  const [newSuccessMetric, setNewSuccessMetric] = useState("");

  const gov: GovernanceFramework = data.governance || {
    governanceModel: "no_formal" as GovernanceModelType,
    boardOversight: [],
    executiveAccountability: [],
    decisionAuthority: emptyAuthority(),
    reportingCadence: "",
    integrationWithFinancialPlanning: "",
    investorDisclosure: [],
    communicationMethod: "",
    governanceMaturityScore: 0,
    accountabilityMaturityScore: 0,
    status: "draft" as const,
    updatedAt: new Date().toISOString(),
  };

  const save = (updated: GovernanceFramework) => {
    const gScore = calcGovernanceMaturity(updated);
    const aScore = calcAccountabilityMaturity(updated);
    update({ governance: { ...updated, governanceMaturityScore: gScore, accountabilityMaturityScore: aScore, updatedAt: new Date().toISOString() } });
  };

  if (!hydrated) return <div className="flex items-center justify-center h-64"><p className="text-text-secondary text-[14px]">Loading...</p></div>;

  const steps = ["Governance Model", "Board Structure", "Executive Accountability", "Compensation Linkage", "Decision Authority", "Documentation & Approval"];
  const gMat = maturityLabel(gov.governanceMaturityScore);
  const aMat = maturityLabel(gov.accountabilityMaturityScore);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-[28px] text-primary">Governance Framework</h1>
        <p className="text-text-secondary text-[14px]">IFRS S1 Core — Board oversight, accountability structure, compensation linkage, decision authority</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="border border-neutral-lighter rounded-[var(--radius-sm)] p-3 text-center">
          <p className="text-[22px] font-semibold text-primary">{gov.boardOversight.length}</p>
          <p className="text-[12px] text-text-secondary">Committees</p>
        </div>
        <div className="border border-neutral-lighter rounded-[var(--radius-sm)] p-3 text-center">
          <p className="text-[22px] font-semibold text-primary">{gov.executiveAccountability.length}</p>
          <p className="text-[12px] text-text-secondary">Exec Roles</p>
        </div>
        <div className="border border-neutral-lighter rounded-[var(--radius-sm)] p-3 text-center">
          <p className={`text-[22px] font-semibold ${gMat.color}`}>{gov.governanceMaturityScore}/10</p>
          <p className="text-[12px] text-text-secondary">Gov. Maturity</p>
        </div>
        <div className="border border-neutral-lighter rounded-[var(--radius-sm)] p-3 text-center">
          <p className={`text-[22px] font-semibold ${aMat.color}`}>{gov.accountabilityMaturityScore}/10</p>
          <p className="text-[12px] text-text-secondary">Acct. Maturity</p>
        </div>
      </div>

      <div className="flex gap-2 mb-6 flex-wrap">
        {steps.map((s, i) => (
          <button key={s} onClick={() => setStep(i)} className={`px-3 py-1.5 rounded-full text-[12px] font-medium transition-colors cursor-pointer ${step === i ? "bg-primary text-white" : i < step ? "bg-green-100 text-green-700" : "bg-neutral-light text-text-secondary"}`}>
            {i < step ? "✓ " : ""}{s}
          </button>
        ))}
      </div>

      {/* Step 0: Governance Model Selection */}
      {step === 0 && (
        <Card>
          <HelpField
            label="Step 1: Select Your Governance Model"
            tooltip={governanceHelp.governanceModel.tooltip}
            modal={governanceHelp.governanceModel.modal}
            guide={governanceHelp.governanceModel.guide}
          >
            <p className="text-[13px] text-text-secondary mb-4">
              Your climate strategy won't survive if it lives in one person's mind. When a board committee owns it, it survives leadership changes.
              Auditors will ask (2027): &ldquo;Who approved your 2050 net-zero target?&rdquo;
            </p>
          </HelpField>

          <div className="flex flex-col gap-3 mb-4">
            {governanceModelOptions.map((opt) => (
              <label key={opt.value} className={`flex items-start gap-3 p-4 border rounded-[var(--radius-sm)] cursor-pointer transition-colors ${gov.governanceModel === opt.value ? "border-primary bg-primary-light" : "border-neutral-lighter hover:border-primary/40"}`}>
                <input type="radio" name="govModel" checked={gov.governanceModel === opt.value} onChange={() => save({ ...gov, governanceModel: opt.value })} className="mt-1" />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-[14px] font-medium">{opt.label}</p>
                    {opt.recommended && <Badge variant="success">Recommended</Badge>}
                    {opt.auditReady && <Badge variant="info">Audit-Ready</Badge>}
                    {opt.value === "no_formal" && <Badge variant="error">Red Flag</Badge>}
                  </div>
                  <p className="text-[13px] text-text-secondary mt-1">{opt.description}</p>
                </div>
              </label>
            ))}
          </div>

          {gov.governanceModel === "no_formal" && (
            <div className="bg-red-50 border border-red-200 rounded-[var(--radius-sm)] p-4 mb-4 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
              <div>
                <p className="text-[14px] font-medium text-red-700">Action Required</p>
                <p className="text-[13px] text-red-600">No formal governance is a red flag for 2027 NFRS compliance. Continue to Step 2 to design a governance structure.</p>
              </div>
            </div>
          )}

          <div className="flex justify-end mt-4">
            <Button variant="primary" onClick={() => setStep(1)}>Next: Board Structure →</Button>
          </div>
        </Card>
      )}

      {/* Step 1: Board Oversight Structure */}
      {step === 1 && (
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[18px] text-primary">Board Oversight Structure</h2>
            <Button variant="primary" size="sm" onClick={() => { const c = emptyCommittee(); save({ ...gov, boardOversight: [...gov.boardOversight, c] }); setExpandedCommittee(c.id); }}>
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
                <button onClick={() => setExpandedCommittee(expanded ? null : c.id)} className="w-full flex items-center justify-between p-4 text-left cursor-pointer">
                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-primary" />
                    <span className="text-[14px] font-medium text-text-primary">{c.name || "Unnamed Committee"}</span>
                    {c.name && c.chair && <Badge variant="success">Configured</Badge>}
                    {c.authorityLevel === "full" && <Badge variant="info">Full Authority</Badge>}
                  </div>
                  {expanded ? <ChevronDown className="w-4 h-4 text-text-secondary" /> : <ChevronRight className="w-4 h-4 text-text-secondary" />}
                </button>
                {expanded && (
                  <div className="px-4 pb-4 flex flex-col gap-3 border-t border-neutral-lighter pt-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <Input label="Committee Name" placeholder="e.g. Sustainability & Climate Committee" value={c.name} onChange={(e) => {
                        const updated = [...gov.boardOversight]; updated[ci] = { ...c, name: e.target.value }; save({ ...gov, boardOversight: updated });
                      }} />
                      <Input label="Chair" placeholder="e.g. Tan Sri Ahmad" value={c.chair} onChange={(e) => {
                        const updated = [...gov.boardOversight]; updated[ci] = { ...c, chair: e.target.value }; save({ ...gov, boardOversight: updated });
                      }} />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[13px] font-medium text-text-primary mb-1 block">Meeting Frequency</label>
                        <select className="w-full border border-neutral-lighter rounded-[var(--radius-sm)] px-3 py-2 text-[14px]" value={c.frequency} onChange={(e) => {
                          const updated = [...gov.boardOversight]; updated[ci] = { ...c, frequency: e.target.value as GovernanceCommittee["frequency"] }; save({ ...gov, boardOversight: updated });
                        }}>
                          <option value="monthly">Monthly (12/year) — Most rigorous</option>
                          <option value="quarterly">Quarterly (4/year) — Material minimum</option>
                          <option value="biannual">Biannual (2/year) — Minimal for NFRS</option>
                          <option value="annual">Annual (1/year)</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[13px] font-medium text-text-primary mb-1 block">Authority Level</label>
                        {authorityLevelOptions.map((opt) => (
                          <label key={opt.value} className="flex items-start gap-2 text-[13px] cursor-pointer mb-1">
                            <input type="radio" name={`auth-${c.id}`} checked={c.authorityLevel === opt.value} onChange={() => {
                              const updated = [...gov.boardOversight]; updated[ci] = { ...c, authorityLevel: opt.value }; save({ ...gov, boardOversight: updated });
                            }} className="mt-0.5" />
                            <span><span className="font-medium">{opt.label}</span> — {opt.description}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {(gov.governanceModel === "audit_committee" || gov.governanceModel === "risk_committee") && (
                      <Input label="ESG Agenda Allocation (minutes per meeting)" type="number" placeholder="e.g. 45" value={c.esgAgendaMinutes || ""} onChange={(e) => {
                        const updated = [...gov.boardOversight]; updated[ci] = { ...c, esgAgendaMinutes: parseInt(e.target.value) || 0 }; save({ ...gov, boardOversight: updated });
                      }} />
                    )}

                    <div className="flex gap-4 flex-wrap">
                      <label className="flex items-center gap-2 text-[13px] cursor-pointer">
                        <input type="checkbox" checked={c.includeIndependentDirectors} onChange={(e) => { const u = [...gov.boardOversight]; u[ci] = { ...c, includeIndependentDirectors: e.target.checked }; save({ ...gov, boardOversight: u }); }} />
                        Include independent directors
                      </label>
                      <label className="flex items-center gap-2 text-[13px] cursor-pointer">
                        <input type="checkbox" checked={c.includeAuditChair} onChange={(e) => { const u = [...gov.boardOversight]; u[ci] = { ...c, includeAuditChair: e.target.checked }; save({ ...gov, boardOversight: u }); }} />
                        Include audit committee chair
                      </label>
                      <label className="flex items-center gap-2 text-[13px] cursor-pointer">
                        <input type="checkbox" checked={c.includeRiskChair} onChange={(e) => { const u = [...gov.boardOversight]; u[ci] = { ...c, includeRiskChair: e.target.checked }; save({ ...gov, boardOversight: u }); }} />
                        Include risk committee chair
                      </label>
                    </div>

                    <div>
                      <label className="text-[13px] font-medium text-text-primary mb-1 block">Members</label>
                      <div className="flex gap-2 flex-wrap mb-2">
                        {c.members.map((m, mi) => (
                          <Badge key={mi} variant="info" className="flex items-center gap-1">
                            {m}
                            <button className="cursor-pointer" onClick={() => { const u = [...gov.boardOversight]; u[ci] = { ...c, members: c.members.filter((_, i) => i !== mi) }; save({ ...gov, boardOversight: u }); }}><Trash2 className="w-3 h-3" /></button>
                          </Badge>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <Input placeholder="Add member name" value={newMember} onChange={(e) => setNewMember(e.target.value)} />
                        <Button variant="secondary" size="sm" onClick={() => { if (newMember.trim()) { const u = [...gov.boardOversight]; u[ci] = { ...c, members: [...c.members, newMember.trim()] }; save({ ...gov, boardOversight: u }); setNewMember(""); } }}>Add</Button>
                      </div>
                    </div>

                    <div>
                      <label className="text-[13px] font-medium text-text-primary mb-1 block">Decision Rights</label>
                      <div className="flex gap-2 flex-wrap mb-2">
                        {c.decisionRights.map((r, ri) => (
                          <Badge key={ri} variant="neutral" className="flex items-center gap-1">
                            {r}
                            <button className="cursor-pointer" onClick={() => { const u = [...gov.boardOversight]; u[ci] = { ...c, decisionRights: c.decisionRights.filter((_, i) => i !== ri) }; save({ ...gov, boardOversight: u }); }}><Trash2 className="w-3 h-3" /></button>
                          </Badge>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <Input placeholder="e.g. Approve net-zero targets" value={newRight} onChange={(e) => setNewRight(e.target.value)} />
                        <Button variant="secondary" size="sm" onClick={() => { if (newRight.trim()) { const u = [...gov.boardOversight]; u[ci] = { ...c, decisionRights: [...c.decisionRights, newRight.trim()] }; save({ ...gov, boardOversight: u }); setNewRight(""); } }}>Add</Button>
                      </div>
                    </div>

                    <Input label="Committee Charter (brief)" placeholder="Oversight of climate strategy, risk management, and target-setting" value={c.charter} onChange={(e) => {
                      const u = [...gov.boardOversight]; u[ci] = { ...c, charter: e.target.value }; save({ ...gov, boardOversight: u });
                    }} />

                    <div className="flex gap-4 flex-wrap">
                      <label className="flex items-center gap-2 text-[13px] cursor-pointer">
                        <input type="checkbox" checked={c.charterApproved} onChange={(e) => { const u = [...gov.boardOversight]; u[ci] = { ...c, charterApproved: e.target.checked }; save({ ...gov, boardOversight: u }); }} />
                        Charter formally approved
                      </label>
                      <label className="flex items-center gap-2 text-[13px] cursor-pointer">
                        <input type="checkbox" checked={c.minutesDocumented} onChange={(e) => { const u = [...gov.boardOversight]; u[ci] = { ...c, minutesDocumented: e.target.checked }; save({ ...gov, boardOversight: u }); }} />
                        Meeting minutes documented
                      </label>
                    </div>

                    {c.minutesDocumented && (
                      <Input label="Minutes Storage Location" placeholder="e.g. Board portal, secure server" value={c.minutesStorage} onChange={(e) => {
                        const u = [...gov.boardOversight]; u[ci] = { ...c, minutesStorage: e.target.value }; save({ ...gov, boardOversight: u });
                      }} />
                    )}

                    <Button variant="ghost" size="sm" className="self-end text-red-500" onClick={() => save({ ...gov, boardOversight: gov.boardOversight.filter((_, i) => i !== ci) })}>
                      <Trash2 className="w-4 h-4" /> Remove Committee
                    </Button>
                  </div>
                )}
              </div>
            );
          })}

          <div className="flex justify-between mt-4">
            <Button variant="secondary" onClick={() => setStep(0)}>← Back</Button>
            <Button variant="primary" onClick={() => setStep(2)}>Next: Executive Accountability →</Button>
          </div>
        </Card>
      )}

      {/* Step 2: Executive Accountability */}
      {step === 2 && (
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[18px] text-primary">Executive Accountability</h2>
            <Button variant="primary" size="sm" onClick={() => { const a = emptyAccountability(); save({ ...gov, executiveAccountability: [...gov.executiveAccountability, a] }); setExpandedRole(a.id); }}>
              <Plus className="w-4 h-4" /> Add Role
            </Button>
          </div>
          <HelpField
            label=""
            tooltip={governanceHelp.executiveAccountability.tooltip}
            modal={governanceHelp.executiveAccountability.modal}
          >
            <p className="text-[13px] text-text-secondary mb-2">&ldquo;Who is accountable if you miss your emissions targets?&rdquo; If the answer is &ldquo;committee,&rdquo; still not clear enough. Who specifically? Name them.</p>
          </HelpField>

          <div className="flex gap-2 flex-wrap mb-4">
            {governanceRoles.map((gr) => {
              const exists = gov.executiveAccountability.some((a) => a.role === gr.role);
              return (
                <button key={gr.role} className={`px-3 py-1.5 rounded-full text-[11px] font-medium cursor-pointer transition-colors ${exists ? "bg-green-100 text-green-700" : "bg-neutral-light text-text-secondary hover:bg-primary-light hover:text-primary"}`}
                  onClick={() => {
                    if (!exists) {
                      const a = { ...emptyAccountability(), role: gr.role, responsibilities: [gr.typical] };
                      save({ ...gov, executiveAccountability: [...gov.executiveAccountability, a] });
                      setExpandedRole(a.id);
                    }
                  }}>
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
                      {a.boardApprovalDate && <Badge variant="info">Approved</Badge>}
                    </div>
                  </div>
                  {expanded ? <ChevronDown className="w-4 h-4 text-text-secondary" /> : <ChevronRight className="w-4 h-4 text-text-secondary" />}
                </button>
                {expanded && (
                  <div className="px-4 pb-4 flex flex-col gap-3 border-t border-neutral-lighter pt-3">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <Input label="Role Title" value={a.role} onChange={(e) => { const u = [...gov.executiveAccountability]; u[ai] = { ...a, role: e.target.value }; save({ ...gov, executiveAccountability: u }); }} />
                      <Input label="Name" placeholder="Person's name" value={a.name} onChange={(e) => { const u = [...gov.executiveAccountability]; u[ai] = { ...a, name: e.target.value }; save({ ...gov, executiveAccountability: u }); }} />
                      <Input label="Years in Role" placeholder="e.g. 3" value={a.yearsInRole} onChange={(e) => { const u = [...gov.executiveAccountability]; u[ai] = { ...a, yearsInRole: e.target.value }; save({ ...gov, executiveAccountability: u }); }} />
                    </div>
                    <Input label="Reports To" placeholder="e.g. Board Sustainability Committee" value={a.reportingTo} onChange={(e) => { const u = [...gov.executiveAccountability]; u[ai] = { ...a, reportingTo: e.target.value }; save({ ...gov, executiveAccountability: u }); }} />
                    <div>
                      <label className="text-[13px] font-medium text-text-primary mb-1 block">Board Mandate</label>
                      <textarea className="w-full border border-neutral-lighter rounded-[var(--radius-sm)] px-3 py-2 text-[14px] min-h-[60px]" placeholder="e.g. CEO approved to develop and execute Net Zero by 2050 strategy with quarterly progress reporting" value={a.mandate} onChange={(e) => { const u = [...gov.executiveAccountability]; u[ai] = { ...a, mandate: e.target.value }; save({ ...gov, executiveAccountability: u }); }} />
                    </div>
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
                    <div>
                      <label className="text-[13px] font-medium text-text-primary mb-1 block">Success Metrics</label>
                      <div className="flex flex-col gap-1 mb-2">
                        {a.successMetrics.map((m, mi) => (
                          <div key={mi} className="flex items-center gap-2 text-[13px]">
                            <span className="flex-1">• {m}</span>
                            <button className="cursor-pointer text-red-400" onClick={() => { const u = [...gov.executiveAccountability]; u[ai] = { ...a, successMetrics: a.successMetrics.filter((_, i) => i !== mi) }; save({ ...gov, executiveAccountability: u }); }}><Trash2 className="w-3 h-3" /></button>
                          </div>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <Input placeholder="e.g. Zero audit findings on data quality" value={newSuccessMetric} onChange={(e) => setNewSuccessMetric(e.target.value)} />
                        <Button variant="secondary" size="sm" onClick={() => { if (newSuccessMetric.trim()) { const u = [...gov.executiveAccountability]; u[ai] = { ...a, successMetrics: [...a.successMetrics, newSuccessMetric.trim()] }; save({ ...gov, executiveAccountability: u }); setNewSuccessMetric(""); } }}>Add</Button>
                      </div>
                    </div>
                    <Input label="Consequences (if target missed)" placeholder="e.g. Bonus reduction 15% if data quality below 80%" value={a.consequences} onChange={(e) => { const u = [...gov.executiveAccountability]; u[ai] = { ...a, consequences: e.target.value }; save({ ...gov, executiveAccountability: u }); }} />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <Input label="Board Approval Date" type="date" value={a.boardApprovalDate} onChange={(e) => { const u = [...gov.executiveAccountability]; u[ai] = { ...a, boardApprovalDate: e.target.value }; save({ ...gov, executiveAccountability: u }); }} />
                      <div className="flex gap-4 items-end pb-1">
                        <label className="flex items-center gap-2 text-[13px] cursor-pointer">
                          <input type="checkbox" checked={a.kpiLinked} onChange={(e) => { const u = [...gov.executiveAccountability]; u[ai] = { ...a, kpiLinked: e.target.checked }; save({ ...gov, executiveAccountability: u }); }} />
                          KPI-Linked
                        </label>
                        <label className="flex items-center gap-2 text-[13px] cursor-pointer">
                          <input type="checkbox" checked={a.compensationLinked} onChange={(e) => {
                            const u = [...gov.executiveAccountability];
                            u[ai] = { ...a, compensationLinked: e.target.checked, compensation: e.target.checked ? (a.compensation || emptyCompensation()) : null };
                            save({ ...gov, executiveAccountability: u });
                          }} />
                          Compensation-Linked
                        </label>
                      </div>
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
            <Button variant="secondary" onClick={() => setStep(1)}>← Back</Button>
            <Button variant="primary" onClick={() => setStep(3)}>Next: Compensation Linkage →</Button>
          </div>
        </Card>
      )}

      {/* Step 3: Compensation Linkage */}
      {step === 3 && (
        <Card>
          <h2 className="text-[18px] text-primary mb-2">Compensation Linkage</h2>
          <HelpField
            label=""
            tooltip={governanceHelp.compensationLinkage.tooltip}
            modal={governanceHelp.compensationLinkage.modal}
          >
            <p className="text-[13px] text-text-secondary mb-4">
              Here&apos;s where climate strategy becomes real: Money. If executives&apos; bonuses aren&apos;t tied to climate targets, it&apos;s theater.
            </p>
          </HelpField>

          {gov.executiveAccountability.filter((a) => a.compensationLinked).length === 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-[var(--radius-sm)] p-4 text-[13px] text-amber-700 mb-4">
              <AlertTriangle className="w-4 h-4 inline mr-2" />
              No executives have compensation linked to climate targets. Go back to Step 3 and enable "Compensation-Linked" for relevant roles.
            </div>
          )}

          {gov.executiveAccountability.filter((a) => a.compensationLinked && a.compensation).map((a, ai) => {
            const comp = a.compensation!;
            const realIdx = gov.executiveAccountability.findIndex((x) => x.id === a.id);
            const updateComp = (c: CompensationLinkage) => {
              const u = [...gov.executiveAccountability]; u[realIdx] = { ...a, compensation: c }; save({ ...gov, executiveAccountability: u });
            };
            return (
              <div key={a.id} className="border border-neutral-lighter rounded-[var(--radius-sm)] p-4 mb-4">
                <p className="text-[15px] font-medium text-primary mb-3">{a.role} — {a.name || "Unnamed"}</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                  <Input label="Annual Base Salary" placeholder="e.g. RM 2,000,000" value={comp.baseSalary} onChange={(e) => updateComp({ ...comp, baseSalary: e.target.value })} />
                  <Input label="Annual Bonus Potential (%)" type="number" value={comp.bonusPotentialPercent || ""} onChange={(e) => updateComp({ ...comp, bonusPotentialPercent: parseInt(e.target.value) || 0 })} />
                </div>

                <p className="text-[13px] font-medium text-text-primary mb-2">Bonus Breakdown by Category</p>
                <div className="grid grid-cols-3 gap-3 mb-3">
                  <div>
                    <label className="text-[12px] text-text-secondary">Financial Performance (%)</label>
                    <input type="number" className="w-full border border-neutral-lighter rounded px-2 py-1 text-[13px]" value={comp.financialPercent || ""} onChange={(e) => updateComp({ ...comp, financialPercent: parseInt(e.target.value) || 0 })} />
                  </div>
                  <div>
                    <label className="text-[12px] text-text-secondary">Strategic Initiatives (%)</label>
                    <input type="number" className="w-full border border-neutral-lighter rounded px-2 py-1 text-[13px]" value={comp.strategicPercent || ""} onChange={(e) => updateComp({ ...comp, strategicPercent: parseInt(e.target.value) || 0 })} />
                  </div>
                  <div>
                    <label className="text-[12px] text-text-secondary">Climate Targets (%) — CRITICAL</label>
                    <input type="number" className="w-full border border-primary rounded px-2 py-1 text-[13px] font-medium" value={comp.climatePercent || ""} onChange={(e) => updateComp({ ...comp, climatePercent: parseInt(e.target.value) || 0 })} />
                  </div>
                </div>
                {(comp.financialPercent + comp.strategicPercent + comp.climatePercent) !== 100 && (
                  <p className="text-[12px] text-amber-600 mb-3">Total: {comp.financialPercent + comp.strategicPercent + comp.climatePercent}% (should equal 100%)</p>
                )}

                <p className="text-[13px] font-medium text-text-primary mb-2">Climate Metrics (what drives the climate portion)</p>
                {comp.climateMetrics.map((m, mi) => (
                  <div key={mi} className="flex gap-2 mb-2 items-center">
                    <Input className="flex-1" placeholder="Metric" value={m.metric} onChange={(e) => { const metrics = [...comp.climateMetrics]; metrics[mi] = { ...m, metric: e.target.value }; updateComp({ ...comp, climateMetrics: metrics }); }} />
                    <input type="number" className="w-16 border border-neutral-lighter rounded px-2 py-1 text-[13px]" placeholder="%" value={m.weight || ""} onChange={(e) => { const metrics = [...comp.climateMetrics]; metrics[mi] = { ...m, weight: parseInt(e.target.value) || 0 }; updateComp({ ...comp, climateMetrics: metrics }); }} />
                    <Input className="flex-1" placeholder="Target" value={m.target} onChange={(e) => { const metrics = [...comp.climateMetrics]; metrics[mi] = { ...m, target: e.target.value }; updateComp({ ...comp, climateMetrics: metrics }); }} />
                    <button className="cursor-pointer text-red-400" onClick={() => updateComp({ ...comp, climateMetrics: comp.climateMetrics.filter((_, i) => i !== mi) })}><Trash2 className="w-4 h-4" /></button>
                  </div>
                ))}
                <div className="flex gap-2">
                  <Input placeholder="e.g. Scope 1+2 reduction" value={newMetric} onChange={(e) => setNewMetric(e.target.value)} />
                  <Button variant="secondary" size="sm" onClick={() => {
                    if (newMetric.trim()) { updateComp({ ...comp, climateMetrics: [...comp.climateMetrics, { metric: newMetric.trim(), weight: 0, target: "" }] }); setNewMetric(""); }
                  }}>Add Metric</Button>
                </div>
              </div>
            );
          })}

          <div className="flex justify-between mt-4">
            <Button variant="secondary" onClick={() => setStep(2)}>← Back</Button>
            <Button variant="primary" onClick={() => setStep(4)}>Next: Decision Authority →</Button>
          </div>
        </Card>
      )}

      {/* Step 4: Decision Authority */}
      {step === 4 && (
        <Card>
          <h2 className="text-[18px] text-primary mb-2">Decision Authority Matrix</h2>
          <p className="text-[13px] text-text-secondary mb-4">What can the committee approve without board sign-off? What requires escalation?</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <p className="text-[13px] font-medium text-green-700 mb-2">Committee Can Approve</p>
              {committeeCanApproveDefaults.map((item) => {
                const checked = gov.decisionAuthority.committeeCanApprove.includes(item);
                return (
                  <label key={item} className="flex items-center gap-2 text-[13px] cursor-pointer mb-1">
                    <input type="checkbox" checked={checked} onChange={(e) => {
                      const list = e.target.checked ? [...gov.decisionAuthority.committeeCanApprove, item] : gov.decisionAuthority.committeeCanApprove.filter((i) => i !== item);
                      save({ ...gov, decisionAuthority: { ...gov.decisionAuthority, committeeCanApprove: list } });
                    }} />
                    {item}
                  </label>
                );
              })}
            </div>
            <div>
              <p className="text-[13px] font-medium text-amber-700 mb-2">Board Must Approve</p>
              {boardMustApproveDefaults.map((item) => {
                const checked = gov.decisionAuthority.boardMustApprove.includes(item);
                return (
                  <label key={item} className="flex items-center gap-2 text-[13px] cursor-pointer mb-1">
                    <input type="checkbox" checked={checked} onChange={(e) => {
                      const list = e.target.checked ? [...gov.decisionAuthority.boardMustApprove, item] : gov.decisionAuthority.boardMustApprove.filter((i) => i !== item);
                      save({ ...gov, decisionAuthority: { ...gov.decisionAuthority, boardMustApprove: list } });
                    }} />
                    {item}
                  </label>
                );
              })}
            </div>
          </div>

          <Input label="Capex Threshold (RM M) — Committee approves below, board above" placeholder="e.g. 50" value={gov.decisionAuthority.capexThreshold} onChange={(e) => save({ ...gov, decisionAuthority: { ...gov.decisionAuthority, capexThreshold: e.target.value } })} />

          <div className="mt-6 mb-4">
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

          <div>
            <label className="text-[13px] font-medium text-text-primary mb-1 block">Integration with Financial Planning</label>
            <textarea className="w-full border border-neutral-lighter rounded-[var(--radius-sm)] px-3 py-2 text-[14px] min-h-[100px]" placeholder="Describe how sustainability strategy is integrated with capital allocation, budgeting, and investment decisions..." value={gov.integrationWithFinancialPlanning} onChange={(e) => save({ ...gov, integrationWithFinancialPlanning: e.target.value })} />
          </div>

          <div className="flex justify-between mt-4">
            <Button variant="secondary" onClick={() => setStep(3)}>← Back</Button>
            <Button variant="primary" onClick={() => setStep(5)}>Next: Documentation & Approval →</Button>
          </div>
        </Card>
      )}

      {/* Step 5: Documentation & Board Approval */}
      {step === 5 && (
        <Card>
          <h2 className="text-[18px] text-primary mb-4">Documentation & Board Approval</h2>

          <div className="mb-6">
            <p className="text-[13px] font-medium text-text-primary mb-2">Investor Disclosure</p>
            <p className="text-[13px] text-text-secondary mb-2">Is this accountability structure disclosed?</p>
            {investorDisclosureOptions.map((opt) => {
              const checked = gov.investorDisclosure.includes(opt);
              return (
                <label key={opt} className="flex items-center gap-2 text-[13px] cursor-pointer mb-1">
                  <input type="checkbox" checked={checked} onChange={(e) => {
                    const list = e.target.checked ? [...gov.investorDisclosure, opt] : gov.investorDisclosure.filter((i) => i !== opt);
                    save({ ...gov, investorDisclosure: list });
                  }} />
                  {opt}
                </label>
              );
            })}
          </div>

          <div className="mb-6">
            <p className="text-[13px] font-medium text-text-primary mb-2">Communication Method</p>
            {communicationMethodOptions.map((opt) => (
              <label key={opt} className="flex items-center gap-2 text-[13px] cursor-pointer mb-1">
                <input type="radio" name="commMethod" checked={gov.communicationMethod === opt} onChange={() => save({ ...gov, communicationMethod: opt })} />
                {opt}
              </label>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
            <Input label="Board Meeting Date" type="date" value={gov.boardApproval?.date || ""} onChange={(e) => save({ ...gov, boardApproval: { date: e.target.value, approved: gov.boardApproval?.approved || false, attendees: gov.boardApproval?.attendees || "", resolutionRef: gov.boardApproval?.resolutionRef || "" } })} />
            <Input label="Attendees" placeholder="List attendees" value={gov.boardApproval?.attendees || ""} onChange={(e) => save({ ...gov, boardApproval: { ...gov.boardApproval!, attendees: e.target.value } })} />
          </div>
          <Input label="Board Resolution Reference" placeholder="e.g. Resolution 2024-03-15, Item 5.2" value={gov.boardApproval?.resolutionRef || ""} onChange={(e) => save({ ...gov, boardApproval: { ...gov.boardApproval!, resolutionRef: e.target.value } })} />

          <label className="flex items-center gap-2 text-[14px] cursor-pointer my-4">
            <input type="checkbox" checked={gov.boardApproval?.approved || false} onChange={(e) => save({ ...gov, boardApproval: { ...gov.boardApproval!, approved: e.target.checked }, status: e.target.checked ? "board_approved" : "complete" })} />
            Board has approved this governance framework
          </label>

          {gov.boardApproval?.approved && (
            <div className="bg-green-50 border border-green-200 rounded-[var(--radius-sm)] p-4 flex items-center gap-3 mb-4">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              <p className="text-[14px] text-green-700">Governance Framework approved on {gov.boardApproval.date}</p>
            </div>
          )}

          {/* Maturity Scores */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="bg-blue-50 border border-blue-200 rounded-[var(--radius-sm)] p-4">
              <p className="text-[13px] font-medium text-blue-800 mb-1">Governance Maturity: {gov.governanceMaturityScore}/10</p>
              <p className={`text-[13px] ${gMat.color}`}>{gMat.label}</p>
              {gov.governanceMaturityScore < 5 && <p className="text-[12px] text-blue-600 mt-1">Action: Formalize governance before 2027</p>}
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-[var(--radius-sm)] p-4">
              <p className="text-[13px] font-medium text-blue-800 mb-1">Accountability Maturity: {gov.accountabilityMaturityScore}/10</p>
              <p className={`text-[13px] ${aMat.color}`}>{aMat.label}</p>
              {gov.accountabilityMaturityScore < 5 && <p className="text-[12px] text-blue-600 mt-1">Action: Name owners and tie to compensation</p>}
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-[var(--radius-sm)] p-4">
            <p className="text-[13px] font-medium text-blue-800 mb-2">Summary</p>
            <p className="text-[13px] text-blue-700">
              Model: {governanceModelOptions.find((o) => o.value === gov.governanceModel)?.label.split(".")[0] || "Not set"} ·{" "}
              {gov.boardOversight.length} committee(s) · {gov.executiveAccountability.length} executive role(s) ·{" "}
              {gov.executiveAccountability.filter((a) => a.kpiLinked).length} KPI-linked ·{" "}
              {gov.executiveAccountability.filter((a) => a.compensationLinked).length} compensation-linked ·{" "}
              Capex threshold: RM {gov.decisionAuthority.capexThreshold || "?"}M
            </p>
          </div>

          <div className="flex justify-between mt-4">
            <Button variant="secondary" onClick={() => setStep(4)}>← Back</Button>
            <Button variant="primary" onClick={() => save({ ...gov, status: gov.boardApproval?.approved ? "board_approved" : "complete" })}>
              Save Governance Framework
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
