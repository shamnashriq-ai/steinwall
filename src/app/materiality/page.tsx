"use client";

import { useSteinwall } from "@/lib/context";
import { Card, AlertCard } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useState, useCallback, useMemo } from "react";
import { v4 as uuid } from "uuid";
import { defaultIssues, industryOptions } from "@/lib/materiality-issues";
import {
  financialScaleDefinitions,
  stakeholderScaleDefinitions,
  stakeholderChecks,
  verdictDefinitions,
  computeCombinedScore,
  getVerdict,
  computeStakeholderScore,
  getEbitdaImpact,
  getMatrixColor,
  nfrsThresholds,
  scoringMistakes,
} from "@/lib/materiality-scale";
import type { MaterialityAssessment, MaterialityIssue } from "@/lib/types";
import {
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  Download,
  Info,
  AlertTriangle,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  FileText,
} from "lucide-react";

type Step = "industry" | "issues" | "scoring" | "matrix" | "scope" | "review";

function formatCurrency(val: number, currency: string): string {
  if (val >= 1_000_000_000) return `${currency} ${(val / 1_000_000_000).toFixed(1)}B`;
  if (val >= 1_000_000) return `${currency} ${(val / 1_000_000).toFixed(1)}M`;
  if (val >= 1_000) return `${currency} ${(val / 1_000).toFixed(0)}K`;
  return `${currency} ${val.toLocaleString()}`;
}

export default function MaterialityPage() {
  const { data, update, hydrated } = useSteinwall();
  const [step, setStep] = useState<Step>("industry");
  const [selectedIndustry, setSelectedIndustry] = useState(
    data.materiality?.industry || data.industry || ""
  );
  const [ebitda, setEbitda] = useState<string>(
    data.materiality?.ebitda ? String(data.materiality.ebitda) : ""
  );
  const [currency, setCurrency] = useState(data.materiality?.currency || "RM");
  const [issues, setIssues] = useState<MaterialityIssue[]>(() => {
    if (data.materiality?.issues?.length) return data.materiality.issues;
    return defaultIssues.map((iss) => ({
      id: uuid(),
      name: iss.name,
      category: iss.category,
      businessImpact: 5,
      stakeholderConcern: 5,
      stakeholderChecks: {},
      combinedScore: 5,
      verdict: "material",
      isMaterial: false,
    }));
  });
  const [scopePriorities, setScopePriorities] = useState(
    data.materiality?.scopePriorities || { scope1: 5, scope2: 5, scope3: 5 }
  );
  const [boardDate, setBoardDate] = useState(data.materiality?.boardMemo?.meetingDate || "");
  const [boardAttendees, setBoardAttendees] = useState(data.materiality?.boardMemo?.attendees || "");
  const [boardApproved, setBoardApproved] = useState(data.materiality?.boardMemo?.approved || false);
  const [expandedIssue, setExpandedIssue] = useState<string | null>(null);
  const [showScaleGuide, setShowScaleGuide] = useState(false);
  const [newIssueName, setNewIssueName] = useState("");

  const ebitdaNum = parseFloat(ebitda) || 0;

  const scoredIssues = useMemo(
    () =>
      issues.map((iss) => {
        const combined = computeCombinedScore(iss.businessImpact, iss.stakeholderConcern);
        const verdict = getVerdict(combined);
        return {
          ...iss,
          combinedScore: combined,
          verdict: verdict.key,
          isMaterial: combined >= 5,
        };
      }),
    [issues]
  );

  const materialIssues = scoredIssues.filter((i) => i.combinedScore! >= 5);
  const highlyMaterialIssues = scoredIssues.filter((i) => i.combinedScore! >= 7);
  const criticalIssues = scoredIssues.filter((i) => i.combinedScore! >= 9);

  const saveAssessment = useCallback(
    (overrides?: Partial<MaterialityAssessment>) => {
      const finalIssues = scoredIssues;
      const memoLines = materialIssues.map(
        (iss) =>
          `- ${iss.name} (Score ${iss.combinedScore}): ${
            getVerdict(iss.combinedScore!).label
          } — Financial Impact ${iss.businessImpact}/10, Stakeholder Concern ${iss.stakeholderConcern}/10`
      );
      const memoText = `MATERIALITY ASSESSMENT — BOARD MEMO\n\nCompany: ${data.companyName}\nIndustry: ${selectedIndustry}\nEBITDA: ${ebitdaNum > 0 ? formatCurrency(ebitdaNum, currency) : "Not provided"}\nDate: ${boardDate || "Pending"}\n\nMATERIAL ISSUES (${materialIssues.length} of ${issues.length}):\n${memoLines.join("\n")}\n\nSCOPE PRIORITIES:\n- Scope 1: ${scopePriorities.scope1}/10\n- Scope 2: ${scopePriorities.scope2}/10\n- Scope 3: ${scopePriorities.scope3}/10\n\nBOARD DECISION: ${boardApproved ? "APPROVED" : "Pending"}`;

      const assessment: MaterialityAssessment = {
        id: data.materiality?.id || uuid(),
        industry: selectedIndustry,
        companyName: data.companyName,
        ebitda: ebitdaNum || undefined,
        currency,
        issues: finalIssues,
        scopePriorities,
        boardMemo: boardDate
          ? {
              meetingDate: boardDate,
              attendees: boardAttendees,
              approved: boardApproved,
              approvedDate: boardApproved ? new Date().toISOString() : undefined,
              memoText,
            }
          : undefined,
        status: boardApproved ? "board_approved" : step === "review" ? "complete" : "draft",
        createdAt: data.materiality?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...overrides,
      };
      update({ materiality: assessment });
    },
    [
      scoredIssues,
      materialIssues,
      selectedIndustry,
      ebitdaNum,
      currency,
      scopePriorities,
      boardDate,
      boardAttendees,
      boardApproved,
      step,
      data,
      update,
      issues.length,
    ]
  );

  if (!hydrated) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-text-secondary">Loading...</p>
      </div>
    );
  }

  const stepLabels: Record<Step, string> = {
    industry: "Company Context",
    issues: "Select Issues",
    scoring: "Score Each Issue",
    matrix: "Materiality Matrix",
    scope: "Scope Prioritization",
    review: "Board Approval",
  };

  const stepOrder: Step[] = ["industry", "issues", "scoring", "matrix", "scope", "review"];
  const stepIndex = stepOrder.indexOf(step);
  const progress = Math.round(((stepIndex + 1) / stepOrder.length) * 100);

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[24px] text-primary">Materiality Assessment</h1>
          <p className="text-[14px] text-text-secondary">
            Step {stepIndex + 1} of {stepOrder.length}: {stepLabels[step]}
          </p>
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
        <div className="w-full lg:w-52 shrink-0">
          <div className="flex flex-row lg:flex-col gap-1 flex-wrap">
            {stepOrder.map((s, i) => (
              <button
                key={s}
                onClick={() => {
                  saveAssessment();
                  setStep(s);
                }}
                className={`text-left px-3 py-2 rounded-[var(--radius-sm)] text-[13px] font-medium transition-colors cursor-pointer ${
                  step === s
                    ? "bg-primary-light text-primary"
                    : "text-text-secondary hover:bg-neutral-light"
                }`}
              >
                {i < stepIndex ? "✓ " : ""}
                {stepLabels[s]}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 min-w-0">
          {/* STEP 1: COMPANY CONTEXT */}
          {step === "industry" && (
            <div className="flex flex-col gap-6">
              <Card>
                <h2 className="text-[18px] text-primary mb-2">Company Context</h2>
                <p className="text-[14px] text-text-secondary mb-6">
                  Your industry and financial profile determine how we calculate materiality
                  thresholds. EBITDA is used to translate scores into actual financial impact.
                </p>

                <div className="mb-6">
                  <p className="text-[14px] font-medium text-text-primary mb-3">Select Your Industry</p>
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
                </div>

                <div className="border-t border-neutral-lighter pt-6">
                  <p className="text-[14px] font-medium text-text-primary mb-3">
                    Financial Profile (for contextual scoring)
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Annual EBITDA"
                      type="number"
                      placeholder="e.g. 100000000"
                      value={ebitda}
                      onChange={(e) => setEbitda(e.target.value)}
                      helperText={
                        ebitdaNum > 0
                          ? `${formatCurrency(ebitdaNum, currency)} — 5% = ${formatCurrency(
                              ebitdaNum * 0.05,
                              currency
                            )}`
                          : "Used to show real financial impact at each score level"
                      }
                    />
                    <div className="flex flex-col gap-1">
                      <label className="text-[14px] font-medium text-neutral">Currency</label>
                      <select
                        value={currency}
                        onChange={(e) => setCurrency(e.target.value)}
                        className="w-full bg-surface border border-neutral-lighter rounded-[var(--radius-sm)] px-4 py-3 text-[16px] text-text-primary outline-none"
                      >
                        <option value="RM">RM (Malaysian Ringgit)</option>
                        <option value="USD">USD (US Dollar)</option>
                        <option value="SGD">SGD (Singapore Dollar)</option>
                        <option value="EUR">EUR (Euro)</option>
                        <option value="GBP">GBP (British Pound)</option>
                      </select>
                    </div>
                  </div>
                </div>

                {ebitdaNum > 0 && (
                  <AlertCard variant="info" className="mt-6">
                    <p className="text-[14px] text-primary font-medium mb-2">
                      Your Financial Thresholds
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[13px]">
                      <div>
                        <p className="text-text-secondary">Score 5 (Material)</p>
                        <p className="font-medium">
                          {formatCurrency(ebitdaNum * 0.02, currency)} –{" "}
                          {formatCurrency(ebitdaNum * 0.05, currency)}
                        </p>
                      </div>
                      <div>
                        <p className="text-text-secondary">Score 6-7 (High)</p>
                        <p className="font-medium">
                          {formatCurrency(ebitdaNum * 0.05, currency)} –{" "}
                          {formatCurrency(ebitdaNum * 0.2, currency)}
                        </p>
                      </div>
                      <div>
                        <p className="text-text-secondary">Score 8 (Very High)</p>
                        <p className="font-medium">
                          {formatCurrency(ebitdaNum * 0.2, currency)} –{" "}
                          {formatCurrency(ebitdaNum * 0.5, currency)}
                        </p>
                      </div>
                      <div>
                        <p className="text-text-secondary">Score 9-10 (Critical)</p>
                        <p className="font-medium">
                          {formatCurrency(ebitdaNum * 0.5, currency)}+
                        </p>
                      </div>
                    </div>
                  </AlertCard>
                )}
              </Card>

              <div className="flex justify-end">
                <Button
                  variant="primary"
                  disabled={!selectedIndustry}
                  onClick={() => {
                    saveAssessment();
                    setStep("issues");
                  }}
                >
                  Next: Select Issues <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {/* STEP 2: ISSUE SELECTION */}
          {step === "issues" && (
            <div className="flex flex-col gap-6">
              <Card>
                <h2 className="text-[18px] text-primary mb-2">Sustainability Issues</h2>
                <p className="text-[14px] text-text-secondary mb-4">
                  Review the default issues for your industry and add any custom issues. Each will
                  be scored in the next step.
                </p>
                <div className="flex flex-col gap-2">
                  {issues.map((issue, idx) => (
                    <div
                      key={issue.id}
                      className="flex items-center justify-between border border-neutral-lighter rounded-[var(--radius-sm)] px-4 py-3"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-[13px] text-text-secondary w-6">{idx + 1}.</span>
                        <span className="text-[14px] text-text-primary">{issue.name}</span>
                        {issue.category && (
                          <Badge variant="neutral" className="text-[11px]">
                            {issue.category}
                          </Badge>
                        )}
                      </div>
                      {issues.length > 3 && (
                        <button
                          onClick={() => setIssues((prev) => prev.filter((i) => i.id !== issue.id))}
                          className="text-text-secondary hover:text-error transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <div className="flex gap-3 mt-4">
                  <Input
                    placeholder="Add custom issue (e.g. Carbon Tax Exposure)"
                    value={newIssueName}
                    onChange={(e) => setNewIssueName(e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={!newIssueName.trim()}
                    onClick={() => {
                      setIssues((prev) => [
                        ...prev,
                        {
                          id: uuid(),
                          name: newIssueName.trim(),
                          category: "Custom",
                          businessImpact: 5,
                          stakeholderConcern: 5,
                          stakeholderChecks: {},
                          isMaterial: false,
                        },
                      ]);
                      setNewIssueName("");
                    }}
                  >
                    <Plus className="w-4 h-4" /> Add
                  </Button>
                </div>
              </Card>

              <div className="flex justify-between">
                <Button
                  variant="ghost"
                  onClick={() => {
                    saveAssessment();
                    setStep("industry");
                  }}
                >
                  <ArrowLeft className="w-4 h-4" /> Previous
                </Button>
                <Button
                  variant="primary"
                  onClick={() => {
                    saveAssessment();
                    setStep("scoring");
                  }}
                >
                  Next: Score Issues <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {/* STEP 3: SCORING */}
          {step === "scoring" && (
            <div className="flex flex-col gap-6">
              <Card>
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-[18px] text-primary">Score Each Issue (1-10)</h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowScaleGuide(!showScaleGuide)}
                  >
                    <Info className="w-4 h-4" /> Scale Guide
                  </Button>
                </div>
                <p className="text-[14px] text-text-secondary mb-4">
                  For each issue, set the Financial Impact score and Stakeholder Concern score.
                  {ebitdaNum > 0 &&
                    ` Your EBITDA (${formatCurrency(ebitdaNum, currency)}) is shown as context.`}
                </p>

                {showScaleGuide && (
                  <div className="mb-6 border border-neutral-lighter rounded-[var(--radius-sm)] overflow-hidden">
                    <div className="grid grid-cols-2 gap-0">
                      <div className="p-4 border-r border-neutral-lighter">
                        <p className="text-[13px] font-medium text-primary mb-3">
                          Financial Impact Scale
                        </p>
                        {financialScaleDefinitions.map((def) => (
                          <div key={def.score} className="flex gap-2 text-[12px] mb-1.5">
                            <span className="font-medium w-4 shrink-0">{def.score}</span>
                            <span className="text-text-secondary">
                              {def.label} ({def.ebitdaRange} EBITDA)
                            </span>
                          </div>
                        ))}
                      </div>
                      <div className="p-4">
                        <p className="text-[13px] font-medium text-primary mb-3">
                          Stakeholder Concern Scale
                        </p>
                        {stakeholderScaleDefinitions.map((def) => (
                          <div key={def.score} className="flex gap-2 text-[12px] mb-1.5">
                            <span className="font-medium w-4 shrink-0">{def.score}</span>
                            <span className="text-text-secondary">
                              {def.label} ({def.percentCare} care)
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex flex-col gap-4">
                  {issues.map((issue, idx) => {
                    const combined = computeCombinedScore(
                      issue.businessImpact,
                      issue.stakeholderConcern
                    );
                    const verdict = getVerdict(combined);
                    const isExpanded = expandedIssue === issue.id;
                    const financialDef = financialScaleDefinitions[issue.businessImpact - 1];
                    const stakeholderDef =
                      stakeholderScaleDefinitions[issue.stakeholderConcern - 1];
                    const impact =
                      ebitdaNum > 0
                        ? getEbitdaImpact(issue.businessImpact, ebitdaNum)
                        : null;

                    return (
                      <div
                        key={issue.id}
                        className="border border-neutral-lighter rounded-[var(--radius-sm)] overflow-hidden"
                      >
                        <button
                          onClick={() => setExpandedIssue(isExpanded ? null : issue.id)}
                          className="w-full flex items-center justify-between p-4 hover:bg-neutral-light/50 transition-colors cursor-pointer"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-[13px] text-text-secondary w-6">
                              {idx + 1}.
                            </span>
                            <span className="text-[14px] font-medium text-text-primary">
                              {issue.name}
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span
                              className={`text-[12px] font-medium px-2.5 py-0.5 rounded-full ${verdict.bgColor} ${verdict.color}`}
                            >
                              {combined} — {verdict.label}
                            </span>
                            {isExpanded ? (
                              <ChevronUp className="w-4 h-4 text-text-secondary" />
                            ) : (
                              <ChevronDown className="w-4 h-4 text-text-secondary" />
                            )}
                          </div>
                        </button>

                        {isExpanded && (
                          <div className="border-t border-neutral-lighter p-4 bg-neutral-light/30">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                              {/* Financial Impact */}
                              <div>
                                <div className="flex items-center justify-between mb-2">
                                  <label className="text-[13px] font-medium text-text-primary">
                                    Financial Impact
                                  </label>
                                  <span className="text-[14px] font-medium text-primary">
                                    {issue.businessImpact}/10
                                  </span>
                                </div>
                                <input
                                  type="range"
                                  min={1}
                                  max={10}
                                  value={issue.businessImpact}
                                  onChange={(e) => {
                                    const next = [...issues];
                                    next[idx] = {
                                      ...next[idx],
                                      businessImpact: Number(e.target.value),
                                    };
                                    setIssues(next);
                                  }}
                                  className="w-full accent-primary"
                                />
                                <div className="flex justify-between text-[10px] text-text-secondary mb-2">
                                  <span>Negligible</span>
                                  <span>Material (5)</span>
                                  <span>Existential</span>
                                </div>
                                <div className="bg-surface rounded-[var(--radius-sm)] p-3 text-[12px]">
                                  <p className="font-medium text-text-primary">
                                    {financialDef.label} — {financialDef.ebitdaRange} of EBITDA
                                  </p>
                                  <p className="text-text-secondary mt-1">
                                    {financialDef.description}
                                  </p>
                                  {impact && (
                                    <p className="text-primary mt-1 font-medium">
                                      Your impact: {formatCurrency(impact.low, currency)} –{" "}
                                      {formatCurrency(impact.high, currency)}
                                    </p>
                                  )}
                                </div>
                              </div>

                              {/* Stakeholder Concern */}
                              <div>
                                <div className="flex items-center justify-between mb-2">
                                  <label className="text-[13px] font-medium text-text-primary">
                                    Stakeholder Concern
                                  </label>
                                  <span className="text-[14px] font-medium text-primary">
                                    {issue.stakeholderConcern}/10
                                  </span>
                                </div>
                                <input
                                  type="range"
                                  min={1}
                                  max={10}
                                  value={issue.stakeholderConcern}
                                  onChange={(e) => {
                                    const next = [...issues];
                                    next[idx] = {
                                      ...next[idx],
                                      stakeholderConcern: Number(e.target.value),
                                    };
                                    setIssues(next);
                                  }}
                                  className="w-full accent-primary"
                                />
                                <div className="flex justify-between text-[10px] text-text-secondary mb-2">
                                  <span>No Concern</span>
                                  <span>Material (5)</span>
                                  <span>Existential</span>
                                </div>
                                <div className="bg-surface rounded-[var(--radius-sm)] p-3 text-[12px]">
                                  <p className="font-medium text-text-primary">
                                    {stakeholderDef.label} — {stakeholderDef.percentCare} of
                                    stakeholders
                                  </p>
                                  <p className="text-text-secondary mt-1">
                                    {stakeholderDef.description}
                                  </p>
                                </div>

                                <p className="text-[12px] font-medium text-text-primary mt-3 mb-2">
                                  Which stakeholders care?
                                </p>
                                <div className="flex flex-col gap-1.5">
                                  {stakeholderChecks.map((check) => (
                                    <label
                                      key={check.id}
                                      className="flex items-start gap-2 cursor-pointer"
                                    >
                                      <input
                                        type="checkbox"
                                        checked={issue.stakeholderChecks?.[check.id] || false}
                                        onChange={(e) => {
                                          const next = [...issues];
                                          const newChecks = {
                                            ...(next[idx].stakeholderChecks || {}),
                                            [check.id]: e.target.checked,
                                          };
                                          const suggestedScore =
                                            computeStakeholderScore(newChecks);
                                          next[idx] = {
                                            ...next[idx],
                                            stakeholderChecks: newChecks,
                                            stakeholderConcern: suggestedScore,
                                          };
                                          setIssues(next);
                                        }}
                                        className="w-4 h-4 accent-primary mt-0.5"
                                      />
                                      <span className="text-[12px] text-text-secondary">
                                        {check.label}
                                      </span>
                                    </label>
                                  ))}
                                </div>
                              </div>
                            </div>

                            {/* Combined result */}
                            <div
                              className={`mt-4 rounded-[var(--radius-sm)] p-3 ${verdict.bgColor}`}
                            >
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className={`text-[13px] font-medium ${verdict.color}`}>
                                    Combined Score: {combined} — {verdict.label}
                                  </p>
                                  <p className="text-[12px] text-text-secondary mt-0.5">
                                    {verdict.description}
                                  </p>
                                </div>
                              </div>
                              <div className="flex flex-wrap gap-2 mt-2">
                                {verdict.actions.map((action) => (
                                  <span
                                    key={action}
                                    className="text-[11px] bg-surface/70 px-2 py-0.5 rounded-full text-text-secondary"
                                  >
                                    {action}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </Card>

              <AlertCard variant="warning">
                <p className="text-[14px] font-medium text-text-primary mb-1">
                  Common Scoring Mistakes
                </p>
                {scoringMistakes.map((m, i) => (
                  <div key={i} className="text-[12px] text-text-secondary mt-2">
                    <p className="font-medium">{m.title}</p>
                    <p>Fix: {m.fix}</p>
                  </div>
                ))}
              </AlertCard>

              <div className="flex justify-between">
                <Button
                  variant="ghost"
                  onClick={() => {
                    saveAssessment();
                    setStep("issues");
                  }}
                >
                  <ArrowLeft className="w-4 h-4" /> Previous
                </Button>
                <Button
                  variant="primary"
                  onClick={() => {
                    saveAssessment();
                    setStep("matrix");
                  }}
                >
                  Next: Materiality Matrix <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {/* STEP 4: MATERIALITY MATRIX */}
          {step === "matrix" && (
            <div className="flex flex-col gap-6">
              <Card>
                <h2 className="text-[18px] text-primary mb-4">Materiality Matrix</h2>
                <p className="text-[14px] text-text-secondary mb-4">
                  Issues plotted by Financial Impact (X) vs. Stakeholder Concern (Y). Score 5+ on
                  both axes = Material.
                </p>

                <div className="relative w-full aspect-square max-w-[560px] mx-auto">
                  {/* Quadrant labels */}
                  <div className="absolute top-2 left-10 text-[10px] text-text-secondary">
                    High Concern / Low Impact
                  </div>
                  <div className="absolute top-2 right-2 text-[10px] text-error font-medium">
                    MATERIAL
                  </div>
                  <div className="absolute bottom-10 left-10 text-[10px] text-text-secondary">
                    Low / Low
                  </div>
                  <div className="absolute bottom-10 right-2 text-[10px] text-text-secondary">
                    High Impact / Low Concern
                  </div>

                  {/* Axis labels */}
                  <div className="absolute left-0 top-0 bottom-0 w-8 flex items-center justify-center">
                    <span className="text-[11px] text-text-secondary -rotate-90 whitespace-nowrap">
                      Stakeholder Concern →
                    </span>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 h-8 flex items-center justify-center">
                    <span className="text-[11px] text-text-secondary">Financial Impact →</span>
                  </div>

                  {/* Quadrant shading */}
                  <div className="absolute top-0 right-0 w-[calc(50%-16px)] h-[50%] bg-error/5 rounded-tr-[var(--radius-sm)]" />

                  {/* Grid lines */}
                  <div className="absolute top-[50%] left-8 right-0 border-t border-dashed border-neutral-lighter" />
                  <div className="absolute left-[calc(50%+16px)] top-0 bottom-8 border-l border-dashed border-neutral-lighter" />

                  {/* Score labels on axes */}
                  <div className="absolute left-8 bottom-9 text-[9px] text-text-secondary">1</div>
                  <div className="absolute left-[calc(50%+16px)] bottom-9 text-[9px] text-text-secondary">
                    5
                  </div>
                  <div className="absolute right-0 bottom-9 text-[9px] text-text-secondary">10</div>
                  <div className="absolute left-9 bottom-8 text-[9px] text-text-secondary">1</div>
                  <div className="absolute left-9 top-[50%] text-[9px] text-text-secondary">5</div>
                  <div className="absolute left-9 top-0 text-[9px] text-text-secondary">10</div>

                  <svg viewBox="0 0 100 100" className="absolute inset-8 inset-b-8">
                    {scoredIssues.map((issue) => {
                      const x = ((issue.businessImpact - 1) / 9) * 100;
                      const y = 100 - ((issue.stakeholderConcern - 1) / 9) * 100;
                      const color = getMatrixColor(
                        issue.businessImpact,
                        issue.stakeholderConcern
                      );
                      return (
                        <g key={issue.id}>
                          <circle cx={x} cy={y} r={3.5} fill={color} opacity={0.85} />
                          <title>
                            {issue.name}: Impact {issue.businessImpact}, Concern{" "}
                            {issue.stakeholderConcern} → Combined {issue.combinedScore} (
                            {getVerdict(issue.combinedScore!).label})
                          </title>
                        </g>
                      );
                    })}
                  </svg>
                </div>

                {/* Legend */}
                <div className="flex flex-wrap gap-4 mt-4 justify-center">
                  {verdictDefinitions.map((v) => (
                    <div key={v.key} className="flex items-center gap-1.5">
                      <div
                        className={`w-3 h-3 rounded-full ${v.bgColor}`}
                        style={{
                          backgroundColor:
                            v.key === "critical"
                              ? "#DC2626"
                              : v.key === "highly_material"
                              ? "#EA580C"
                              : v.key === "material"
                              ? "#D97706"
                              : v.key === "operational"
                              ? "#2563EB"
                              : "#6B7280",
                        }}
                      />
                      <span className="text-[11px] text-text-secondary">
                        {v.label} ({v.range})
                      </span>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Scorecard table */}
              <Card>
                <h2 className="text-[18px] text-primary mb-4">Materiality Scorecard</h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-[13px]">
                    <thead>
                      <tr className="border-b border-neutral-lighter text-left">
                        <th className="py-2 pr-3 text-text-secondary font-medium">Issue</th>
                        <th className="py-2 px-3 text-text-secondary font-medium text-center">
                          Financial
                        </th>
                        <th className="py-2 px-3 text-text-secondary font-medium text-center">
                          Stakeholder
                        </th>
                        <th className="py-2 px-3 text-text-secondary font-medium text-center">
                          Combined
                        </th>
                        <th className="py-2 pl-3 text-text-secondary font-medium">Verdict</th>
                      </tr>
                    </thead>
                    <tbody>
                      {scoredIssues
                        .sort((a, b) => (b.combinedScore || 0) - (a.combinedScore || 0))
                        .map((issue) => {
                          const verdict = getVerdict(issue.combinedScore!);
                          return (
                            <tr
                              key={issue.id}
                              className="border-b border-neutral-lighter/50"
                            >
                              <td className="py-2.5 pr-3 text-text-primary">{issue.name}</td>
                              <td className="py-2.5 px-3 text-center font-medium">
                                {issue.businessImpact}
                              </td>
                              <td className="py-2.5 px-3 text-center font-medium">
                                {issue.stakeholderConcern}
                              </td>
                              <td className="py-2.5 px-3 text-center font-medium">
                                {issue.combinedScore}
                              </td>
                              <td className="py-2.5 pl-3">
                                <span
                                  className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${verdict.bgColor} ${verdict.color}`}
                                >
                                  {verdict.label}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              </Card>

              {/* NFRS thresholds */}
              <Card>
                <h2 className="text-[18px] text-primary mb-4">NFRS Compliance Thresholds</h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-[13px]">
                    <thead>
                      <tr className="border-b border-neutral-lighter text-left">
                        <th className="py-2 pr-3 text-text-secondary font-medium">Score</th>
                        <th className="py-2 px-3 text-text-secondary font-medium">Status</th>
                        <th className="py-2 px-3 text-text-secondary font-medium">Disclosure</th>
                        <th className="py-2 pl-3 text-text-secondary font-medium">Auditor</th>
                      </tr>
                    </thead>
                    <tbody>
                      {nfrsThresholds.map((t, i) => (
                        <tr key={i} className="border-b border-neutral-lighter/50">
                          <td className="py-2.5 pr-3 font-medium">{t.scoreRange}</td>
                          <td className="py-2.5 px-3">{t.status}</td>
                          <td className="py-2.5 px-3">{t.disclosure}</td>
                          <td className="py-2.5 pl-3">{t.auditorReview}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>

              {/* Summary stats */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-warning-light rounded-[var(--radius-sm)] p-4 text-center">
                  <p className="text-[28px] font-semibold text-warning">{materialIssues.length}</p>
                  <p className="text-[13px] text-text-secondary">Material Issues (5+)</p>
                </div>
                <div className="bg-error-light rounded-[var(--radius-sm)] p-4 text-center">
                  <p className="text-[28px] font-semibold text-error">
                    {highlyMaterialIssues.length}
                  </p>
                  <p className="text-[13px] text-text-secondary">Highly Material (7+)</p>
                </div>
                <div className="bg-error-light rounded-[var(--radius-sm)] p-4 text-center">
                  <p className="text-[28px] font-semibold text-error">{criticalIssues.length}</p>
                  <p className="text-[13px] text-text-secondary">Critical (9+)</p>
                </div>
              </div>

              <div className="flex justify-between">
                <Button
                  variant="ghost"
                  onClick={() => {
                    saveAssessment();
                    setStep("scoring");
                  }}
                >
                  <ArrowLeft className="w-4 h-4" /> Previous
                </Button>
                <Button
                  variant="primary"
                  onClick={() => {
                    saveAssessment();
                    setStep("scope");
                  }}
                >
                  Next: Scope Prioritization <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {/* STEP 5: SCOPE PRIORITIZATION */}
          {step === "scope" && (
            <div className="flex flex-col gap-6">
              <Card>
                <h2 className="text-[18px] text-primary mb-2">Scope Prioritization</h2>
                <p className="text-[14px] text-text-secondary mb-6">
                  Based on your materiality assessment, prioritize which emission scopes matter most.
                </p>
                {[
                  {
                    key: "scope1" as const,
                    label: "Scope 1 — Direct Emissions",
                    desc: "Fuel combustion, process emissions, fleet vehicles",
                  },
                  {
                    key: "scope2" as const,
                    label: "Scope 2 — Energy",
                    desc: "Purchased electricity, steam, cooling",
                  },
                  {
                    key: "scope3" as const,
                    label: "Scope 3 — Value Chain",
                    desc: "Suppliers, travel, waste, logistics, purchased goods",
                  },
                ].map((scope) => (
                  <div
                    key={scope.key}
                    className="border border-neutral-lighter rounded-[var(--radius-sm)] p-4 mb-3"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="text-[14px] font-medium text-text-primary">{scope.label}</p>
                        <p className="text-[13px] text-text-secondary">{scope.desc}</p>
                      </div>
                      <span className="text-[14px] font-medium text-primary">
                        {scopePriorities[scope.key]}/10
                      </span>
                    </div>
                    <input
                      type="range"
                      min={1}
                      max={10}
                      value={scopePriorities[scope.key]}
                      onChange={(e) =>
                        setScopePriorities((prev) => ({
                          ...prev,
                          [scope.key]: Number(e.target.value),
                        }))
                      }
                      className="w-full accent-primary"
                    />
                    <div className="flex justify-between text-[11px] text-text-secondary">
                      <span>Low priority</span>
                      <span>High priority</span>
                    </div>
                  </div>
                ))}
                <AlertCard variant="info" className="mt-4">
                  <p className="text-[14px] text-primary">
                    Your material emissions:{" "}
                    {[
                      scopePriorities.scope3 >= 7 && "Scope 3 (Value Chain)",
                      scopePriorities.scope2 >= 7 && "Scope 2 (Energy)",
                      scopePriorities.scope1 >= 7 && "Scope 1 (Direct)",
                    ]
                      .filter(Boolean)
                      .join(" + ") ||
                      "Not yet determined — score at least one scope 7+"}
                  </p>
                </AlertCard>
              </Card>
              <div className="flex justify-between">
                <Button
                  variant="ghost"
                  onClick={() => {
                    saveAssessment();
                    setStep("matrix");
                  }}
                >
                  <ArrowLeft className="w-4 h-4" /> Previous
                </Button>
                <Button
                  variant="primary"
                  onClick={() => {
                    saveAssessment();
                    setStep("review");
                  }}
                >
                  Next: Board Approval <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {/* STEP 6: REVIEW & BOARD APPROVAL */}
          {step === "review" && (
            <div className="flex flex-col gap-6">
              <Card>
                <h2 className="text-[18px] text-primary mb-4">Assessment Summary</h2>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
                  <div className="bg-neutral-light rounded-[var(--radius-sm)] p-4">
                    <p className="text-[13px] text-text-secondary mb-1">Industry</p>
                    <p className="text-[14px] font-medium">{selectedIndustry}</p>
                  </div>
                  <div className="bg-neutral-light rounded-[var(--radius-sm)] p-4">
                    <p className="text-[13px] text-text-secondary mb-1">EBITDA</p>
                    <p className="text-[14px] font-medium">
                      {ebitdaNum > 0 ? formatCurrency(ebitdaNum, currency) : "Not provided"}
                    </p>
                  </div>
                  <div className="bg-neutral-light rounded-[var(--radius-sm)] p-4">
                    <p className="text-[13px] text-text-secondary mb-1">Total Issues</p>
                    <p className="text-[14px] font-medium">{issues.length}</p>
                  </div>
                  <div className="bg-warning-light rounded-[var(--radius-sm)] p-4">
                    <p className="text-[13px] text-text-secondary mb-1">Material (5+)</p>
                    <p className="text-[14px] font-medium text-warning">
                      {materialIssues.length}
                    </p>
                  </div>
                </div>

                {materialIssues.length > 0 && (
                  <div className="mb-6">
                    <p className="text-[14px] font-medium text-text-primary mb-3">
                      Material Issues for Board Disclosure:
                    </p>
                    <div className="flex flex-col gap-2">
                      {scoredIssues
                        .filter((i) => i.combinedScore! >= 5)
                        .sort((a, b) => (b.combinedScore || 0) - (a.combinedScore || 0))
                        .map((iss) => {
                          const verdict = getVerdict(iss.combinedScore!);
                          return (
                            <div
                              key={iss.id}
                              className="flex items-center gap-3 text-[14px] border border-neutral-lighter rounded-[var(--radius-sm)] px-4 py-2.5"
                            >
                              <CheckCircle className="w-4 h-4 text-warning shrink-0" />
                              <span className="flex-1">{iss.name}</span>
                              <span
                                className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${verdict.bgColor} ${verdict.color}`}
                              >
                                {iss.combinedScore} — {verdict.label}
                              </span>
                              {ebitdaNum > 0 && (
                                <span className="text-[12px] text-text-secondary">
                                  {formatCurrency(
                                    getEbitdaImpact(iss.businessImpact, ebitdaNum).low,
                                    currency
                                  )}{" "}
                                  –{" "}
                                  {formatCurrency(
                                    getEbitdaImpact(iss.businessImpact, ebitdaNum).high,
                                    currency
                                  )}
                                </span>
                              )}
                            </div>
                          );
                        })}
                    </div>
                  </div>
                )}

                <div className="border-t border-neutral-lighter pt-4">
                  <p className="text-[14px] font-medium text-text-primary mb-2">
                    Scope Priorities
                  </p>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { key: "scope1" as const, label: "Scope 1" },
                      { key: "scope2" as const, label: "Scope 2" },
                      { key: "scope3" as const, label: "Scope 3" },
                    ].map((s) => (
                      <div
                        key={s.key}
                        className={`rounded-[var(--radius-sm)] p-3 text-center ${
                          scopePriorities[s.key] >= 7 ? "bg-primary-light" : "bg-neutral-light"
                        }`}
                      >
                        <p className="text-[13px] text-text-secondary">{s.label}</p>
                        <p
                          className={`text-[18px] font-semibold ${
                            scopePriorities[s.key] >= 7 ? "text-primary" : "text-text-primary"
                          }`}
                        >
                          {scopePriorities[s.key]}/10
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>

              {/* Board Memo Preview */}
              <Card>
                <div className="flex items-center gap-2 mb-4">
                  <FileText className="w-5 h-5 text-primary" />
                  <h2 className="text-[18px] text-primary">Board Memo</h2>
                </div>
                <div className="bg-neutral-light rounded-[var(--radius-sm)] p-5 text-[13px] font-mono whitespace-pre-wrap mb-6">
                  {`MATERIALITY ASSESSMENT — BOARD MEMO

Company: ${data.companyName}
Industry: ${selectedIndustry}
EBITDA: ${ebitdaNum > 0 ? formatCurrency(ebitdaNum, currency) : "Not provided"}
Date: ${boardDate || "[Pending]"}

MATERIAL ISSUES (${materialIssues.length} of ${issues.length}):
${materialIssues
  .sort((a, b) => (b.combinedScore || 0) - (a.combinedScore || 0))
  .map(
    (iss) =>
      `  ${iss.name} (Score ${iss.combinedScore}) — ${getVerdict(iss.combinedScore!).label}
    Financial Impact: ${iss.businessImpact}/10${
        ebitdaNum > 0
          ? ` (${formatCurrency(
              getEbitdaImpact(iss.businessImpact, ebitdaNum).low,
              currency
            )} – ${formatCurrency(
              getEbitdaImpact(iss.businessImpact, ebitdaNum).high,
              currency
            )})`
          : ""
      }
    Stakeholder Concern: ${iss.stakeholderConcern}/10`
  )
  .join("\n\n")}

SCOPE PRIORITIES:
  Scope 1 (Direct): ${scopePriorities.scope1}/10
  Scope 2 (Energy): ${scopePriorities.scope2}/10
  Scope 3 (Value Chain): ${scopePriorities.scope3}/10

BOARD DECISION: ${boardApproved ? "APPROVED" : "[Pending]"}`}
                </div>
              </Card>

              {/* Board Approval */}
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
                <Button
                  variant="ghost"
                  onClick={() => {
                    saveAssessment();
                    setStep("scope");
                  }}
                >
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
                          description: `Materiality assessment approved. ${materialIssues.length} material issues identified (Score 5+). ${highlyMaterialIssues.length} highly material (7+). ${criticalIssues.length} critical (9+). Attendees: ${boardAttendees}`,
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
