"use client";

import { useSteinwall } from "@/lib/context";
import { Card, AlertCard } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Textarea, Select } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useState, useCallback } from "react";
import { v4 as uuid } from "uuid";
import type { Strategy, StrategyInitiative, StrategyProject } from "@/lib/types";
import { ArrowRight, ArrowLeft, Plus, Trash2, CheckCircle, Target, ArrowDown } from "lucide-react";

type WizardStep = "targets" | "priority" | "actions" | "canvas" | "approval";

export default function StrategyPage() {
  const { data, update, hydrated } = useSteinwall();

  const [step, setStep] = useState<WizardStep>("targets");
  const [target2030, setTarget2030] = useState(data.strategy?.target2030 || "");
  const [target2050, setTarget2050] = useState(data.strategy?.target2050 || "");
  const [priorityScope, setPriorityScope] = useState(data.strategy?.priorityScope || "");
  const [priorityCategory, setPriorityCategory] = useState(data.strategy?.priorityCategory || "");
  const [expectedReduction, setExpectedReduction] = useState(data.strategy?.expectedReduction?.toString() || "");
  const [initiatives, setInitiatives] = useState<StrategyInitiative[]>(
    data.strategy?.initiatives || []
  );

  const [boardDate, setBoardDate] = useState(data.strategy?.boardApproval?.meetingDate || "");
  const [boardAttendees, setBoardAttendees] = useState(data.strategy?.boardApproval?.attendees || "");
  const [boardApproved, setBoardApproved] = useState(data.strategy?.boardApproval?.approved || false);

  const [newInitName, setNewInitName] = useState("");

  const saveStrategy = useCallback(
    (overrides?: Partial<Strategy>) => {
      const strategy: Strategy = {
        id: data.strategy?.id || uuid(),
        target2030,
        target2050,
        priorityScope,
        priorityCategory,
        expectedReduction: Number(expectedReduction) || 0,
        initiatives,
        boardApproval: boardDate
          ? { meetingDate: boardDate, attendees: boardAttendees, approved: boardApproved, approvedDate: boardApproved ? new Date().toISOString() : undefined }
          : undefined,
        status: boardApproved ? "board_approved" : step === "approval" || step === "canvas" ? "complete" : "draft",
        createdAt: data.strategy?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...overrides,
      };
      update({ strategy });
    },
    [target2030, target2050, priorityScope, priorityCategory, expectedReduction, initiatives, boardDate, boardAttendees, boardApproved, step, data, update]
  );

  const addInitiative = () => {
    if (!newInitName.trim()) return;
    setInitiatives((prev) => [...prev, { id: uuid(), name: newInitName.trim(), projects: [] }]);
    setNewInitName("");
  };

  const removeInitiative = (id: string) => {
    setInitiatives((prev) => prev.filter((i) => i.id !== id));
  };

  const addProject = (initId: string) => {
    setInitiatives((prev) =>
      prev.map((init) =>
        init.id === initId
          ? {
              ...init,
              projects: [
                ...init.projects,
                { id: uuid(), name: "", owner: "", timeline: "", status: "planned" as const },
              ],
            }
          : init
      )
    );
  };

  const updateProject = (initId: string, projId: string, updates: Partial<StrategyProject>) => {
    setInitiatives((prev) =>
      prev.map((init) =>
        init.id === initId
          ? {
              ...init,
              projects: init.projects.map((p) => (p.id === projId ? { ...p, ...updates } : p)),
            }
          : init
      )
    );
  };

  const removeProject = (initId: string, projId: string) => {
    setInitiatives((prev) =>
      prev.map((init) =>
        init.id === initId
          ? { ...init, projects: init.projects.filter((p) => p.id !== projId) }
          : init
      )
    );
  };

  if (!hydrated) {
    return <div className="flex items-center justify-center h-64"><p className="text-text-secondary">Loading...</p></div>;
  }

  const stepLabels: Record<WizardStep, string> = {
    targets: "Set Targets",
    priority: "Prioritize Scope",
    actions: "Define Actions",
    canvas: "Action Plan Canvas",
    approval: "Board Approval",
  };
  const stepOrder: WizardStep[] = ["targets", "priority", "actions", "canvas", "approval"];
  const stepIndex = stepOrder.indexOf(step);
  const progress = Math.round(((stepIndex + 1) / stepOrder.length) * 100);

  const topS3Category = data.scopeData.scope3.length > 0
    ? data.scopeData.scope3.reduce(
        (max, p) => (p.emissionsTonneCO2e > max.emissionsTonneCO2e ? p : max),
        data.scopeData.scope3[0]
      ).category
    : "Supplier Operations";

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[24px] text-primary">Strategy Builder</h1>
          <p className="text-[14px] text-text-secondary">Step {stepIndex + 1}: {stepLabels[step]}</p>
        </div>
        {data.strategy?.status === "board_approved" && <Badge variant="success">Board Approved</Badge>}
      </div>

      <div className="w-full bg-neutral-light rounded-full h-2 mb-8">
        <div className="bg-primary h-2 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
      </div>

      <div className="flex gap-6 flex-col lg:flex-row">
        <div className="w-full lg:w-48 shrink-0">
          <div className="flex flex-row lg:flex-col gap-1">
            {stepOrder.map((s, i) => (
              <button
                key={s}
                onClick={() => { saveStrategy(); setStep(s); }}
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
          {step === "targets" && (
            <Card>
              <h2 className="text-[18px] text-primary mb-4">What are your targets?</h2>
              <p className="text-[14px] text-text-secondary mb-6">
                Set science-based targets aligned with SBTi pathways. Most companies target Net Zero by 2050 with interim 2030 goals.
              </p>
              <div className="flex flex-col gap-4">
                <Select
                  label="2030 Interim Target"
                  options={[
                    { value: "25_reduction", label: "25% reduction from baseline" },
                    { value: "30_reduction", label: "30% reduction from baseline" },
                    { value: "42_reduction", label: "42% reduction (SBTi 1.5°C aligned)" },
                    { value: "50_reduction", label: "50% reduction from baseline" },
                    { value: "custom", label: "Custom target" },
                  ]}
                  value={target2030}
                  onChange={(e) => setTarget2030(e.target.value)}
                />
                <Select
                  label="2050 Long-term Target"
                  options={[
                    { value: "net_zero_2050", label: "Net Zero by 2050 (SBTi aligned)" },
                    { value: "carbon_neutral_2050", label: "Carbon Neutral by 2050" },
                    { value: "90_reduction_2050", label: "90% reduction by 2050" },
                    { value: "custom", label: "Custom target" },
                  ]}
                  value={target2050}
                  onChange={(e) => setTarget2050(e.target.value)}
                />
                <AlertCard variant="info">
                  <p className="text-[14px] text-primary">
                    Based on your materiality assessment, your priority scope is{" "}
                    <strong>
                      {data.materiality?.scopePriorities
                        ? data.materiality.scopePriorities.scope3 >= data.materiality.scopePriorities.scope2
                          ? "Scope 3 (Value Chain)"
                          : "Scope 2 (Energy)"
                        : "not yet determined"}
                    </strong>
                  </p>
                </AlertCard>
              </div>
              <div className="flex justify-end mt-6">
                <Button variant="primary" disabled={!target2030 || !target2050} onClick={() => { saveStrategy(); setStep("priority"); }}>
                  Next <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          )}

          {step === "priority" && (
            <Card>
              <h2 className="text-[18px] text-primary mb-4">Which Scope 3 category will you address first?</h2>
              <p className="text-[14px] text-text-secondary mb-6">
                Your hotspot analysis suggests <strong>{topS3Category}</strong> drives the most Scope 3 emissions.
              </p>
              <div className="flex flex-col gap-4">
                <Select
                  label="Priority Scope"
                  options={[
                    { value: "scope1", label: "Scope 1 — Direct Emissions" },
                    { value: "scope2", label: "Scope 2 — Energy" },
                    { value: "scope3", label: "Scope 3 — Value Chain" },
                  ]}
                  value={priorityScope}
                  onChange={(e) => setPriorityScope(e.target.value)}
                />
                <Input
                  label="Priority Category"
                  placeholder="e.g. Supplier Operations, Purchased Electricity"
                  value={priorityCategory}
                  onChange={(e) => setPriorityCategory(e.target.value)}
                />
                <Input
                  label="Expected Reduction (%)"
                  type="number"
                  placeholder="e.g. 25"
                  value={expectedReduction}
                  onChange={(e) => setExpectedReduction(e.target.value)}
                  helperText="Percentage reduction target for this category"
                />
              </div>
              <div className="flex justify-between mt-6">
                <Button variant="ghost" onClick={() => { saveStrategy(); setStep("targets"); }}>
                  <ArrowLeft className="w-4 h-4" /> Previous
                </Button>
                <Button variant="primary" onClick={() => { saveStrategy(); setStep("actions"); }}>
                  Next <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          )}

          {step === "actions" && (
            <div className="flex flex-col gap-6">
              <Card>
                <h2 className="text-[18px] text-primary mb-4">Define Strategic Initiatives</h2>
                <p className="text-[14px] text-text-secondary mb-6">
                  Create initiatives and break them into actionable projects with owners and timelines.
                </p>

                {initiatives.map((init) => (
                  <div key={init.id} className="border border-neutral-lighter rounded-[var(--radius-sm)] p-4 mb-4">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-[14px] font-medium text-primary">{init.name}</p>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" onClick={() => addProject(init.id)}>
                          <Plus className="w-3 h-3" /> Project
                        </Button>
                        <button onClick={() => removeInitiative(init.id)} className="text-text-secondary hover:text-error cursor-pointer">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    {init.projects.map((proj) => (
                      <div key={proj.id} className="ml-4 border-l-2 border-primary-light pl-4 mb-3">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <Input
                            placeholder="Project name"
                            value={proj.name}
                            onChange={(e) => updateProject(init.id, proj.id, { name: e.target.value })}
                          />
                          <Input
                            placeholder="Owner (e.g. Procurement)"
                            value={proj.owner}
                            onChange={(e) => updateProject(init.id, proj.id, { owner: e.target.value })}
                          />
                          <div className="flex gap-2">
                            <Input
                              placeholder="Timeline (e.g. Q2 2025)"
                              value={proj.timeline}
                              onChange={(e) => updateProject(init.id, proj.id, { timeline: e.target.value })}
                            />
                            <button onClick={() => removeProject(init.id, proj.id)} className="text-text-secondary hover:text-error cursor-pointer shrink-0 self-center">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                    {init.projects.length === 0 && (
                      <p className="ml-4 text-[13px] text-text-secondary">No projects yet — click &quot;+ Project&quot; to add.</p>
                    )}
                  </div>
                ))}

                <div className="flex gap-2 mt-4">
                  <Input
                    placeholder="New initiative name"
                    value={newInitName}
                    onChange={(e) => setNewInitName(e.target.value)}
                  />
                  <Button variant="secondary" onClick={addInitiative} disabled={!newInitName.trim()}>
                    <Plus className="w-4 h-4" /> Add
                  </Button>
                </div>
              </Card>
              <div className="flex justify-between">
                <Button variant="ghost" onClick={() => { saveStrategy(); setStep("priority"); }}>
                  <ArrowLeft className="w-4 h-4" /> Previous
                </Button>
                <Button variant="primary" onClick={() => { saveStrategy(); setStep("canvas"); }}>
                  View Canvas <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {step === "canvas" && (
            <div className="flex flex-col gap-6">
              <Card>
                <h2 className="text-[18px] text-primary mb-6">Action Plan Canvas</h2>
                <div className="flex flex-col items-center">
                  <div className="bg-primary text-white rounded-[var(--radius-md)] px-6 py-4 text-center w-full max-w-lg">
                    <Target className="w-5 h-5 mx-auto mb-2" />
                    <p className="text-[16px] font-medium">
                      Reduce {priorityCategory || "emissions"} by {expectedReduction || "X"}% by 2030
                    </p>
                    <p className="text-[13px] opacity-80 mt-1">{target2030?.replace(/_/g, " ") || "Target not set"}</p>
                  </div>

                  {initiatives.length > 0 && <ArrowDown className="w-5 h-5 text-neutral-lighter my-3" />}

                  <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4">
                    {initiatives.map((init) => (
                      <div key={init.id} className="border border-primary/30 rounded-[var(--radius-md)] p-4 bg-primary-light/20">
                        <p className="text-[14px] font-medium text-primary mb-3">{init.name}</p>
                        {init.projects.map((proj) => (
                          <div key={proj.id} className="bg-surface rounded-[var(--radius-sm)] p-3 mb-2 border border-neutral-lighter">
                            <p className="text-[14px] font-medium">{proj.name || "Unnamed project"}</p>
                            <div className="flex gap-3 mt-1 text-[12px] text-text-secondary">
                              {proj.owner && <span>Owner: {proj.owner}</span>}
                              {proj.timeline && <span>Timeline: {proj.timeline}</span>}
                            </div>
                          </div>
                        ))}
                        {init.projects.length === 0 && (
                          <p className="text-[13px] text-text-secondary">No projects defined</p>
                        )}
                      </div>
                    ))}
                  </div>

                  {initiatives.length === 0 && (
                    <AlertCard variant="warning" className="w-full mt-4">
                      <p className="text-[14px]">No initiatives defined yet. Go back to &quot;Define Actions&quot; to add them.</p>
                    </AlertCard>
                  )}
                </div>
              </Card>
              <div className="flex justify-between">
                <Button variant="ghost" onClick={() => { saveStrategy(); setStep("actions"); }}>
                  <ArrowLeft className="w-4 h-4" /> Previous
                </Button>
                <Button variant="primary" onClick={() => { saveStrategy(); setStep("approval"); }}>
                  Board Approval <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {step === "approval" && (
            <div className="flex flex-col gap-6">
              <Card>
                <h2 className="text-[18px] text-primary mb-4">Strategy Summary</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                  <div className="bg-neutral-light rounded-[var(--radius-sm)] p-4">
                    <p className="text-[13px] text-text-secondary mb-1">2030 Target</p>
                    <p className="text-[14px] font-medium">{target2030?.replace(/_/g, " ") || "Not set"}</p>
                  </div>
                  <div className="bg-neutral-light rounded-[var(--radius-sm)] p-4">
                    <p className="text-[13px] text-text-secondary mb-1">Priority</p>
                    <p className="text-[14px] font-medium">{priorityCategory || priorityScope || "Not set"}</p>
                  </div>
                  <div className="bg-neutral-light rounded-[var(--radius-sm)] p-4">
                    <p className="text-[13px] text-text-secondary mb-1">Initiatives</p>
                    <p className="text-[14px] font-medium">{initiatives.length} defined</p>
                  </div>
                </div>
              </Card>

              <Card>
                <h2 className="text-[18px] text-primary mb-4">Board Approval</h2>
                <div className="flex flex-col gap-4">
                  <Input label="Board Meeting Date" type="date" value={boardDate} onChange={(e) => setBoardDate(e.target.value)} />
                  <Textarea label="Attendees" placeholder="Names and titles" value={boardAttendees} onChange={(e) => setBoardAttendees(e.target.value)} />
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={boardApproved} onChange={(e) => setBoardApproved(e.target.checked)} className="w-5 h-5 accent-primary" />
                    <span className="text-[14px] font-medium">Board approved this strategy on {boardDate || "[date]"}</span>
                  </label>
                </div>
              </Card>

              <div className="flex justify-between">
                <Button variant="ghost" onClick={() => { saveStrategy(); setStep("canvas"); }}>
                  <ArrowLeft className="w-4 h-4" /> Previous
                </Button>
                <Button
                  variant="primary"
                  onClick={() => {
                    saveStrategy();
                    if (boardApproved && boardDate) {
                      const decision = {
                        id: uuid(),
                        date: boardDate,
                        title: "Board approved decarbonization strategy",
                        description: `Strategy approved: ${expectedReduction}% reduction of ${priorityCategory}. ${initiatives.length} initiatives. Attendees: ${boardAttendees}`,
                        type: "board_decision" as const,
                      };
                      update({
                        auditDecisions: [...data.auditDecisions, decision],
                      });
                    }
                  }}
                >
                  <CheckCircle className="w-4 h-4" /> Finalize Strategy
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
