"use client";

import { useSteinwall } from "@/lib/context";
import { Card, AlertCard } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useState, useCallback } from "react";
import { v4 as uuid } from "uuid";
import { defaultIssues, industryOptions } from "@/lib/materiality-issues";
import type { MaterialityAssessment, MaterialityIssue } from "@/lib/types";
import { ArrowRight, ArrowLeft, CheckCircle, Download } from "lucide-react";

type Step = "industry" | "scoring" | "scope" | "review";

export default function MaterialityPage() {
  const { data, update, hydrated } = useSteinwall();
  const [step, setStep] = useState<Step>("industry");
  const [selectedIndustry, setSelectedIndustry] = useState(data.materiality?.industry || data.industry || "");
  const [issues, setIssues] = useState<MaterialityIssue[]>(() => {
    if (data.materiality?.issues?.length) return data.materiality.issues;
    return defaultIssues.map((iss) => ({
      id: uuid(),
      name: iss.name,
      businessImpact: 5,
      stakeholderConcern: 5,
      isMaterial: false,
    }));
  });
  const [scopePriorities, setScopePriorities] = useState(
    data.materiality?.scopePriorities || { scope1: 5, scope2: 5, scope3: 5 }
  );
  const [boardDate, setBoardDate] = useState(data.materiality?.boardMemo?.meetingDate || "");
  const [boardAttendees, setBoardAttendees] = useState(data.materiality?.boardMemo?.attendees || "");
  const [boardApproved, setBoardApproved] = useState(data.materiality?.boardMemo?.approved || false);

  const saveAssessment = useCallback(
    (overrides?: Partial<MaterialityAssessment>) => {
      const materialIssues = issues.map((iss) => ({
        ...iss,
        isMaterial: iss.businessImpact >= 6 && iss.stakeholderConcern >= 6,
      }));
      const assessment: MaterialityAssessment = {
        id: data.materiality?.id || uuid(),
        industry: selectedIndustry,
        companyName: data.companyName,
        issues: materialIssues,
        scopePriorities,
        boardMemo: boardDate
          ? {
              meetingDate: boardDate,
              attendees: boardAttendees,
              approved: boardApproved,
              approvedDate: boardApproved ? new Date().toISOString() : undefined,
            }
          : undefined,
        status: boardApproved ? "board_approved" : step === "review" ? "complete" : "draft",
        createdAt: data.materiality?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...overrides,
      };
      update({ materiality: assessment });
    },
    [issues, selectedIndustry, scopePriorities, boardDate, boardAttendees, boardApproved, step, data, update]
  );

  if (!hydrated) {
    return <div className="flex items-center justify-center h-64"><p className="text-text-secondary">Loading...</p></div>;
  }

  const materialIssues = issues.filter((i) => i.businessImpact >= 6 && i.stakeholderConcern >= 6);

  const stepLabels: Record<Step, string> = {
    industry: "Industry Selection",
    scoring: "Materiality Scoring",
    scope: "Scope Prioritization",
    review: "Review & Board Approval",
  };

  const stepOrder: Step[] = ["industry", "scoring", "scope", "review"];
  const stepIndex = stepOrder.indexOf(step);
  const progress = Math.round(((stepIndex + 1) / stepOrder.length) * 100);

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[24px] text-primary">Materiality Assessment</h1>
          <p className="text-[14px] text-text-secondary">Step {stepIndex + 1}: {stepLabels[step]}</p>
        </div>
        {data.materiality?.status === "board_approved" && (
          <Badge variant="success">Board Approved</Badge>
        )}
      </div>

      <div className="w-full bg-neutral-light rounded-full h-2 mb-8">
        <div
          className="bg-primary h-2 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="flex gap-6 flex-col lg:flex-row">
        <div className="w-full lg:w-48 shrink-0">
          <div className="flex flex-row lg:flex-col gap-1">
            {stepOrder.map((s, i) => (
              <button
                key={s}
                onClick={() => { saveAssessment(); setStep(s); }}
                className={`text-left px-3 py-2 rounded-[var(--radius-sm)] text-[13px] font-medium transition-colors cursor-pointer ${
                  step === s ? "bg-primary-light text-primary" : "text-text-secondary hover:bg-neutral-light"
                }`}
              >
                {i < stepIndex ? "✓ " : ""}{stepLabels[s]}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 min-w-0">
          {step === "industry" && (
            <Card>
              <h2 className="text-[18px] text-primary mb-4">Select Your Industry</h2>
              <p className="text-[14px] text-text-secondary mb-6">
                Your industry determines which sustainability issues are most likely to be material to your business.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {industryOptions.map((ind) => (
                  <button
                    key={ind}
                    onClick={() => setSelectedIndustry(ind)}
                    className={`text-left px-4 py-3 rounded-[var(--radius-sm)] border text-[14px] font-medium transition-colors cursor-pointer ${
                      selectedIndustry === ind
                        ? "border-primary bg-primary-light text-primary"
                        : "border-neutral-lighter text-text-primary hover:border-primary/40"
                    }`}
                  >
                    {ind}
                  </button>
                ))}
              </div>
              <div className="flex justify-end mt-6">
                <Button
                  variant="primary"
                  disabled={!selectedIndustry}
                  onClick={() => { saveAssessment(); setStep("scoring"); }}
                >
                  Next: Materiality Scoring <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          )}

          {step === "scoring" && (
            <div className="flex flex-col gap-6">
              <Card>
                <h2 className="text-[18px] text-primary mb-2">Rate Each Issue</h2>
                <p className="text-[14px] text-text-secondary mb-6">
                  Score each issue on Business Impact (financial materiality) and Stakeholder Concern (regulatory + investor).
                  Issues scoring 6+ on both dimensions are flagged as material.
                </p>
                <div className="flex flex-col gap-4">
                  {issues.map((issue, idx) => (
                    <div key={issue.id} className="border border-neutral-lighter rounded-[var(--radius-sm)] p-4">
                      <div className="flex items-start justify-between mb-3">
                        <p className="text-[14px] font-medium text-text-primary">{issue.name}</p>
                        {issue.businessImpact >= 6 && issue.stakeholderConcern >= 6 && (
                          <Badge variant="success">Material</Badge>
                        )}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="text-[13px] text-text-secondary block mb-1">
                            Business Impact: {issue.businessImpact}/10
                          </label>
                          <input
                            type="range"
                            min={1}
                            max={10}
                            value={issue.businessImpact}
                            onChange={(e) => {
                              const next = [...issues];
                              next[idx] = { ...next[idx], businessImpact: Number(e.target.value) };
                              setIssues(next);
                            }}
                            className="w-full accent-primary"
                          />
                          <div className="flex justify-between text-[11px] text-text-secondary">
                            <span>Low</span><span>High</span>
                          </div>
                        </div>
                        <div>
                          <label className="text-[13px] text-text-secondary block mb-1">
                            Stakeholder Concern: {issue.stakeholderConcern}/10
                          </label>
                          <input
                            type="range"
                            min={1}
                            max={10}
                            value={issue.stakeholderConcern}
                            onChange={(e) => {
                              const next = [...issues];
                              next[idx] = { ...next[idx], stakeholderConcern: Number(e.target.value) };
                              setIssues(next);
                            }}
                            className="w-full accent-primary"
                          />
                          <div className="flex justify-between text-[11px] text-text-secondary">
                            <span>Low</span><span>High</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              <Card>
                <h2 className="text-[18px] text-primary mb-4">Materiality Matrix</h2>
                <div className="relative w-full aspect-square max-w-[500px] mx-auto border border-neutral-lighter rounded-[var(--radius-sm)] bg-surface">
                  <div className="absolute left-0 top-0 bottom-0 w-8 flex items-center justify-center">
                    <span className="text-[11px] text-text-secondary -rotate-90 whitespace-nowrap">Stakeholder Concern →</span>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 h-8 flex items-center justify-center">
                    <span className="text-[11px] text-text-secondary">Business Impact →</span>
                  </div>
                  <div className="absolute top-[50%] left-8 right-0 border-t border-dashed border-neutral-lighter" />
                  <div className="absolute left-[calc(50%+16px)] top-0 bottom-8 border-l border-dashed border-neutral-lighter" />
                  <div className="absolute top-2 right-2 bg-success-light text-success text-[10px] px-2 py-0.5 rounded">
                    Material
                  </div>
                  <svg viewBox="0 0 100 100" className="absolute inset-8 inset-b-8">
                    {issues.map((issue, i) => {
                      const x = (issue.businessImpact / 10) * 100;
                      const y = 100 - (issue.stakeholderConcern / 10) * 100;
                      const isMaterial = issue.businessImpact >= 6 && issue.stakeholderConcern >= 6;
                      return (
                        <g key={issue.id}>
                          <circle
                            cx={x}
                            cy={y}
                            r={3}
                            fill={isMaterial ? "#0F6E56" : "#5F5E5A"}
                            opacity={0.8}
                          />
                          <title>{issue.name}: Impact {issue.businessImpact}, Concern {issue.stakeholderConcern}</title>
                        </g>
                      );
                    })}
                  </svg>
                </div>
                {materialIssues.length > 0 && (
                  <div className="mt-4">
                    <p className="text-[13px] font-medium text-text-primary mb-2">Material Issues ({materialIssues.length}):</p>
                    <div className="flex flex-wrap gap-2">
                      {materialIssues.map((i) => (
                        <Badge key={i.id} variant="success">{i.name}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </Card>

              <div className="flex justify-between">
                <Button variant="ghost" onClick={() => { saveAssessment(); setStep("industry"); }}>
                  <ArrowLeft className="w-4 h-4" /> Previous
                </Button>
                <Button variant="primary" onClick={() => { saveAssessment(); setStep("scope"); }}>
                  Next: Scope Prioritization <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {step === "scope" && (
            <div className="flex flex-col gap-6">
              <Card>
                <h2 className="text-[18px] text-primary mb-2">Scope Prioritization</h2>
                <p className="text-[14px] text-text-secondary mb-6">
                  Based on your materiality assessment, prioritize which emission scopes matter most for your company.
                </p>
                {[
                  { key: "scope1" as const, label: "Scope 1 — Direct Emissions", desc: "Fuel combustion, process emissions, fleet vehicles" },
                  { key: "scope2" as const, label: "Scope 2 — Energy", desc: "Purchased electricity, steam, cooling" },
                  { key: "scope3" as const, label: "Scope 3 — Value Chain", desc: "Suppliers, travel, waste, logistics, purchased goods" },
                ].map((scope) => (
                  <div key={scope.key} className="border border-neutral-lighter rounded-[var(--radius-sm)] p-4 mb-3">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="text-[14px] font-medium text-text-primary">{scope.label}</p>
                        <p className="text-[13px] text-text-secondary">{scope.desc}</p>
                      </div>
                      <span className="text-[14px] font-medium text-primary">{scopePriorities[scope.key]}/10</span>
                    </div>
                    <input
                      type="range"
                      min={1}
                      max={10}
                      value={scopePriorities[scope.key]}
                      onChange={(e) =>
                        setScopePriorities((prev) => ({ ...prev, [scope.key]: Number(e.target.value) }))
                      }
                      className="w-full accent-primary"
                    />
                    <div className="flex justify-between text-[11px] text-text-secondary">
                      <span>Low priority</span><span>High priority</span>
                    </div>
                  </div>
                ))}
                <AlertCard variant="info" className="mt-4">
                  <p className="text-[14px] text-primary">
                    Your material emissions are: {" "}
                    {[
                      scopePriorities.scope3 >= 7 && "Scope 3 (Value Chain)",
                      scopePriorities.scope2 >= 7 && "Scope 2 (Energy)",
                      scopePriorities.scope1 >= 7 && "Scope 1 (Direct)",
                    ].filter(Boolean).join(" + ") || "Not yet determined — score at least one scope 7+"}
                  </p>
                </AlertCard>
              </Card>
              <div className="flex justify-between">
                <Button variant="ghost" onClick={() => { saveAssessment(); setStep("scoring"); }}>
                  <ArrowLeft className="w-4 h-4" /> Previous
                </Button>
                <Button variant="primary" onClick={() => { saveAssessment(); setStep("review"); }}>
                  Next: Review & Approve <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {step === "review" && (
            <div className="flex flex-col gap-6">
              <Card>
                <h2 className="text-[18px] text-primary mb-4">Assessment Summary</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                  <div className="bg-neutral-light rounded-[var(--radius-sm)] p-4">
                    <p className="text-[13px] text-text-secondary mb-1">Industry</p>
                    <p className="text-[14px] font-medium">{selectedIndustry}</p>
                  </div>
                  <div className="bg-neutral-light rounded-[var(--radius-sm)] p-4">
                    <p className="text-[13px] text-text-secondary mb-1">Material Issues</p>
                    <p className="text-[14px] font-medium">{materialIssues.length} of {issues.length}</p>
                  </div>
                  <div className="bg-neutral-light rounded-[var(--radius-sm)] p-4">
                    <p className="text-[13px] text-text-secondary mb-1">Priority Scope</p>
                    <p className="text-[14px] font-medium">
                      {scopePriorities.scope3 >= scopePriorities.scope2 && scopePriorities.scope3 >= scopePriorities.scope1
                        ? "Scope 3"
                        : scopePriorities.scope2 >= scopePriorities.scope1
                        ? "Scope 2"
                        : "Scope 1"}
                    </p>
                  </div>
                </div>
                {materialIssues.length > 0 && (
                  <div className="mb-6">
                    <p className="text-[14px] font-medium text-text-primary mb-2">Material Issues to Address:</p>
                    <div className="flex flex-col gap-2">
                      {materialIssues.map((iss) => (
                        <div key={iss.id} className="flex items-center gap-2 text-[14px]">
                          <CheckCircle className="w-4 h-4 text-success" />
                          <span>{iss.name}</span>
                          <span className="text-text-secondary text-[12px]">
                            (Impact: {iss.businessImpact}, Concern: {iss.stakeholderConcern})
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </Card>

              <Card>
                <h2 className="text-[18px] text-primary mb-4">Board Approval</h2>
                <p className="text-[14px] text-text-secondary mb-4">
                  Log the board meeting details and capture approval for the audit trail.
                </p>
                <div className="flex flex-col gap-4">
                  <Input
                    label="Board Meeting Date"
                    type="date"
                    value={boardDate}
                    onChange={(e) => setBoardDate(e.target.value)}
                  />
                  <Textarea
                    label="Attendees"
                    placeholder="Names and titles of board members present"
                    value={boardAttendees}
                    onChange={(e) => setBoardAttendees(e.target.value)}
                  />
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={boardApproved}
                      onChange={(e) => setBoardApproved(e.target.checked)}
                      className="w-5 h-5 accent-primary"
                    />
                    <span className="text-[14px] font-medium text-text-primary">
                      Board approved this assessment on {boardDate || "[date]"}
                    </span>
                  </label>
                </div>
              </Card>

              <div className="flex justify-between">
                <Button variant="ghost" onClick={() => { saveAssessment(); setStep("scope"); }}>
                  <ArrowLeft className="w-4 h-4" /> Previous
                </Button>
                <div className="flex gap-3">
                  <Button variant="secondary" onClick={() => saveAssessment()}>
                    <Download className="w-4 h-4" /> Save as Draft
                  </Button>
                  <Button
                    variant="primary"
                    onClick={() => {
                      saveAssessment();
                      if (boardApproved && boardDate) {
                        const decision = {
                          id: uuid(),
                          date: boardDate,
                          title: "Board approved materiality assessment",
                          description: `Materiality assessment approved. ${materialIssues.length} material issues identified. Attendees: ${boardAttendees}`,
                          type: "board_decision" as const,
                        };
                        update({
                          auditDecisions: [...data.auditDecisions, decision],
                        });
                      }
                    }}
                  >
                    <CheckCircle className="w-4 h-4" /> Finalize Assessment
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
