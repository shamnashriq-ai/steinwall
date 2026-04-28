"use client";

import { useSteinwall } from "@/lib/context";
import { Card, AlertCard } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Textarea, Select } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useState, useCallback } from "react";
import { v4 as uuid } from "uuid";
import type { ActionPlansCanvas, ActionInitiative } from "@/lib/types";
import { ArrowRight, ArrowLeft, Plus, X, ChevronDown, ChevronRight } from "lucide-react";
import Link from "next/link";

const scopeLabels: Record<ActionInitiative["scope"], string> = {
  scope1: "Scope 1 — Direct Operations",
  scope2: "Scope 2 — Energy",
  scope3: "Scope 3 — Supply Chain",
  cross: "Cross-Functional",
};

const scopeColors: Record<ActionInitiative["scope"], string> = {
  scope1: "text-error",
  scope2: "text-primary",
  scope3: "text-success",
  cross: "text-warning",
};

const scopeBadge: Record<ActionInitiative["scope"], "error" | "info" | "success" | "warning"> = {
  scope1: "error",
  scope2: "info",
  scope3: "success",
  cross: "warning",
};

const priorityLabels: Record<ActionInitiative["priority"], string> = {
  high_quick: "High Impact, Quick Win (Do First)",
  high_long: "High Impact, Long Effort (Start Now)",
  medium_quick: "Medium Impact, Quick Win (When Capacity Allows)",
  medium_long: "Medium Impact, Long Effort (Revisit Later)",
};

export default function ActionPlansPage() {
  const { data, update, hydrated } = useSteinwall();
  const existing = data.strategicCanvas?.actionPlans;

  const [initiatives, setInitiatives] = useState<ActionInitiative[]>(existing?.initiatives || []);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const save = useCallback(() => {
    const canvas: ActionPlansCanvas = {
      initiatives,
      status: initiatives.length >= 2 ? "complete" : "draft",
      updatedAt: new Date().toISOString(),
    };
    update({
      strategicCanvas: { ...data.strategicCanvas, actionPlans: canvas },
    });
  }, [initiatives, data.strategicCanvas, update]);

  if (!hydrated) {
    return <div className="flex items-center justify-center h-64"><p className="text-text-secondary">Loading...</p></div>;
  }

  const addInitiative = (scope: ActionInitiative["scope"]) => {
    const newInit: ActionInitiative = {
      id: uuid(),
      scope,
      name: "",
      goal: "",
      rationale: "",
      phases: [{ name: "Phase 1", timeline: "", description: "" }],
      capex: "",
      owner: "",
      risks: [""],
      successMetrics: [""],
      priority: "high_quick",
    };
    setInitiatives([...initiatives, newInit]);
    setExpandedId(newInit.id);
  };

  const updateInit = (id: string, partial: Partial<ActionInitiative>) => {
    setInitiatives((prev) => prev.map((i) => (i.id === id ? { ...i, ...partial } : i)));
  };

  const removeInit = (id: string) => {
    setInitiatives((prev) => prev.filter((i) => i.id !== id));
    if (expandedId === id) setExpandedId(null);
  };

  const grouped = {
    scope1: initiatives.filter((i) => i.scope === "scope1"),
    scope2: initiatives.filter((i) => i.scope === "scope2"),
    scope3: initiatives.filter((i) => i.scope === "scope3"),
    cross: initiatives.filter((i) => i.scope === "cross"),
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <p className="text-[13px] text-text-secondary mb-1">Strategic Planning Canvas — Layer 4 of 6</p>
        <h1 className="text-[24px] text-primary">Action Plans</h1>
        <p className="text-[14px] text-text-secondary">What are you actually going to do to hit your targets?</p>
      </div>

      <AlertCard variant="info" className="mb-6">
        <p className="text-[14px] text-primary">
          Every initiative needs a clear owner, a specific timeline, a budget, a reason it matters, and success metrics.
          If you can&apos;t fill these fields, it&apos;s not real — it&apos;s wishful thinking.
        </p>
      </AlertCard>

      <div className="flex flex-col gap-6">
        {(Object.keys(scopeLabels) as ActionInitiative["scope"][]).map((scope) => (
          <Card key={scope}>
            <div className="flex items-center justify-between mb-4">
              <h2 className={`text-[18px] ${scopeColors[scope]}`}>{scopeLabels[scope]}</h2>
              <Badge variant={scopeBadge[scope]}>{grouped[scope].length} initiative{grouped[scope].length !== 1 ? "s" : ""}</Badge>
            </div>

            {grouped[scope].map((init) => {
              const isExpanded = expandedId === init.id;
              return (
                <div key={init.id} className="border border-neutral-lighter rounded-[var(--radius-sm)] mb-3 overflow-hidden">
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : init.id)}
                    className="flex items-center justify-between w-full px-4 py-3 text-left cursor-pointer hover:bg-neutral-light transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {isExpanded ? <ChevronDown className="w-4 h-4 text-text-secondary" /> : <ChevronRight className="w-4 h-4 text-text-secondary" />}
                      <span className="text-[14px] font-medium text-text-primary">{init.name || "(Unnamed initiative)"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="neutral">{priorityLabels[init.priority].split("(")[0].trim()}</Badge>
                      <button onClick={(e) => { e.stopPropagation(); removeInit(init.id); }} className="text-text-secondary hover:text-error cursor-pointer">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="px-4 pb-4 flex flex-col gap-4 border-t border-neutral-lighter pt-4">
                      <Input label="Initiative Name" placeholder='e.g. "Fleet Electrification"' value={init.name} onChange={(e) => updateInit(init.id, { name: e.target.value })} />
                      <Textarea label="Goal" placeholder='e.g. "Convert 80% of vehicles to electric by 2030"' value={init.goal} onChange={(e) => updateInit(init.id, { goal: e.target.value })} rows={2} />
                      <Textarea label="Rationale (Why this initiative?)" placeholder="Cost savings, emissions impact, risk mitigation..." value={init.rationale} onChange={(e) => updateInit(init.id, { rationale: e.target.value })} rows={2} />
                      <Input label="Owner" placeholder="Name, Title" value={init.owner} onChange={(e) => updateInit(init.id, { owner: e.target.value })} />
                      <Input label="Total Capex (RM)" placeholder="e.g. RM5M over 3 years" value={init.capex} onChange={(e) => updateInit(init.id, { capex: e.target.value })} />

                      <div>
                        <p className="text-[14px] font-medium text-neutral mb-2">Priority</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {(Object.entries(priorityLabels) as [ActionInitiative["priority"], string][]).map(([key, label]) => (
                            <button
                              key={key}
                              onClick={() => updateInit(init.id, { priority: key })}
                              className={`text-left px-3 py-2 rounded-[var(--radius-sm)] border text-[13px] font-medium cursor-pointer transition-colors ${
                                init.priority === key ? "border-primary bg-primary-light text-primary" : "border-neutral-lighter text-text-secondary hover:border-primary/40"
                              }`}
                            >
                              {label}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-[14px] font-medium text-neutral">Phases / Timeline</p>
                          <button
                            onClick={() => updateInit(init.id, { phases: [...init.phases, { name: `Phase ${init.phases.length + 1}`, timeline: "", description: "" }] })}
                            className="flex items-center gap-1 text-[12px] text-primary font-medium cursor-pointer hover:underline"
                          >
                            <Plus className="w-3 h-3" /> Add phase
                          </button>
                        </div>
                        {init.phases.map((phase, pi) => (
                          <div key={pi} className="grid grid-cols-3 gap-2 mb-2">
                            <Input placeholder="Phase name" value={phase.name} onChange={(e) => {
                              const phases = [...init.phases];
                              phases[pi] = { ...phases[pi], name: e.target.value };
                              updateInit(init.id, { phases });
                            }} />
                            <Input placeholder="Timeline (e.g. Q2 2025)" value={phase.timeline} onChange={(e) => {
                              const phases = [...init.phases];
                              phases[pi] = { ...phases[pi], timeline: e.target.value };
                              updateInit(init.id, { phases });
                            }} />
                            <Input placeholder="Description" value={phase.description} onChange={(e) => {
                              const phases = [...init.phases];
                              phases[pi] = { ...phases[pi], description: e.target.value };
                              updateInit(init.id, { phases });
                            }} />
                          </div>
                        ))}
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-[14px] font-medium text-neutral">Risks</p>
                          <button
                            onClick={() => updateInit(init.id, { risks: [...init.risks, ""] })}
                            className="flex items-center gap-1 text-[12px] text-primary font-medium cursor-pointer hover:underline"
                          >
                            <Plus className="w-3 h-3" /> Add risk
                          </button>
                        </div>
                        {init.risks.map((risk, ri) => (
                          <div key={ri} className="flex items-center gap-2 mb-2">
                            <Input placeholder="What could derail this?" value={risk} onChange={(e) => {
                              const risks = [...init.risks];
                              risks[ri] = e.target.value;
                              updateInit(init.id, { risks });
                            }} />
                            {init.risks.length > 1 && (
                              <button onClick={() => updateInit(init.id, { risks: init.risks.filter((_, i) => i !== ri) })} className="text-text-secondary hover:text-error cursor-pointer shrink-0">
                                <X className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-[14px] font-medium text-neutral">Success Metrics</p>
                          <button
                            onClick={() => updateInit(init.id, { successMetrics: [...init.successMetrics, ""] })}
                            className="flex items-center gap-1 text-[12px] text-primary font-medium cursor-pointer hover:underline"
                          >
                            <Plus className="w-3 h-3" /> Add metric
                          </button>
                        </div>
                        {init.successMetrics.map((metric, mi) => (
                          <div key={mi} className="flex items-center gap-2 mb-2">
                            <Input placeholder="e.g. By Q4 2026: 10 EVs operational" value={metric} onChange={(e) => {
                              const successMetrics = [...init.successMetrics];
                              successMetrics[mi] = e.target.value;
                              updateInit(init.id, { successMetrics });
                            }} />
                            {init.successMetrics.length > 1 && (
                              <button onClick={() => updateInit(init.id, { successMetrics: init.successMetrics.filter((_, i) => i !== mi) })} className="text-text-secondary hover:text-error cursor-pointer shrink-0">
                                <X className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            <button
              onClick={() => addInitiative(scope)}
              className="flex items-center gap-2 text-[13px] text-primary font-medium cursor-pointer hover:underline"
            >
              <Plus className="w-4 h-4" /> Add {scopeLabels[scope].split(" — ")[0].toLowerCase()} initiative
            </button>
          </Card>
        ))}

        {initiatives.length > 0 && (
          <Card>
            <h2 className="text-[18px] text-primary mb-4">Initiative Prioritization Matrix</h2>
            {(["high_quick", "high_long", "medium_quick", "medium_long"] as const).map((priority) => {
              const items = initiatives.filter((i) => i.priority === priority);
              if (items.length === 0) return null;
              return (
                <div key={priority} className="mb-4">
                  <p className="text-[13px] font-medium text-text-secondary mb-2">{priorityLabels[priority]}</p>
                  <div className="flex flex-col gap-1">
                    {items.map((i) => (
                      <div key={i.id} className="flex items-center gap-3 py-2 px-3 bg-neutral-light rounded-[var(--radius-sm)]">
                        <Badge variant={scopeBadge[i.scope]}>{i.scope.replace("scope", "S")}</Badge>
                        <span className="flex-1 text-[14px] text-text-primary">{i.name || "(Unnamed)"}</span>
                        <span className="text-[12px] text-text-secondary">{i.owner || "No owner"}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </Card>
        )}

        <div className="flex justify-between">
          <Link href="/canvas/mission">
            <Button variant="ghost"><ArrowLeft className="w-4 h-4" /> Previous: Mission</Button>
          </Link>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={save}>Save Draft</Button>
            <Link href="/canvas/procurement">
              <Button variant="primary" onClick={save}>
                Next: Procurement <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
