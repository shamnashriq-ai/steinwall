"use client";

import { useSteinwall } from "@/lib/context";
import { Card, AlertCard } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Textarea, Select } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useState, useCallback } from "react";
import { v4 as uuid } from "uuid";
import type { KPIsCanvas, KPI, OKR } from "@/lib/types";
import { ArrowRight, ArrowLeft, Plus, X, ChevronDown, ChevronRight, CheckCircle } from "lucide-react";
import Link from "next/link";

const defaultBoardKPIs: Omit<KPI, "id">[] = [
  { level: "board", name: "Emissions Baseline vs. Target", metric: "Total Scope 1+2+3 emissions (tCO2e)", current: "", target2026: "", target2030: "", owner: "", frequency: "quarterly" },
  { level: "board", name: "Emissions Intensity Trend", metric: "Emissions per RM million revenue", current: "", target2026: "", target2030: "", owner: "", frequency: "quarterly" },
  { level: "board", name: "Science-Based Target Alignment", metric: "% of scopes covered by approved SBT", current: "", target2026: "", target2030: "", owner: "", frequency: "quarterly" },
  { level: "board", name: "Green Procurement Penetration", metric: "% of spend from suppliers with SBTs", current: "", target2026: "", target2030: "", owner: "", frequency: "quarterly" },
  { level: "board", name: "Capital Allocation to Decarbonization", metric: "RM million/year allocated to climate initiatives", current: "", target2026: "", target2030: "", owner: "", frequency: "quarterly" },
];

const defaultOKRs: Omit<OKR, "id">[] = [
  {
    department: "Operations",
    objective: "Scope 1+2 emissions down by 2030 target",
    keyResults: [
      { id: uuid(), description: "Fleet electrification milestone", timeline: "", status: "not_started" },
      { id: uuid(), description: "Energy efficiency completion", timeline: "", status: "not_started" },
      { id: uuid(), description: "Renewable energy operational", timeline: "", status: "not_started" },
    ],
  },
  {
    department: "Supply Chain",
    objective: "Shift procurement to green suppliers",
    keyResults: [
      { id: uuid(), description: "Supplier target-setting workshops", timeline: "", status: "not_started" },
      { id: uuid(), description: "Procurement contracts with green criteria", timeline: "", status: "not_started" },
    ],
  },
  {
    department: "Finance & Reporting",
    objective: "Build audit-ready sustainability reporting infrastructure",
    keyResults: [
      { id: uuid(), description: "Emissions data infrastructure live", timeline: "", status: "not_started" },
      { id: uuid(), description: "NFRS disclosures drafted", timeline: "", status: "not_started" },
    ],
  },
];

const statusColors: Record<string, "success" | "warning" | "error" | "neutral"> = {
  on_track: "success",
  at_risk: "warning",
  off_track: "error",
  not_started: "neutral",
};

export default function KPIsPage() {
  const { data, update, hydrated } = useSteinwall();
  const existing = data.strategicCanvas?.kpis;

  const [kpis, setKpis] = useState<KPI[]>(() => {
    if (existing?.kpis?.length) return existing.kpis;
    return defaultBoardKPIs.map((k) => ({ ...k, id: uuid() }));
  });
  const [okrs, setOkrs] = useState<OKR[]>(() => {
    if (existing?.okrs?.length) return existing.okrs;
    return defaultOKRs.map((o) => ({ ...o, id: uuid() }));
  });
  const [expandedKPI, setExpandedKPI] = useState<string | null>(null);
  const [expandedOKR, setExpandedOKR] = useState<string | null>(null);

  const save = useCallback(() => {
    const canvas: KPIsCanvas = {
      kpis,
      okrs,
      status: kpis.some((k) => k.current && k.target2030) ? "complete" : "draft",
      updatedAt: new Date().toISOString(),
    };
    update({
      strategicCanvas: { ...data.strategicCanvas, kpis: canvas },
    });
  }, [kpis, okrs, data.strategicCanvas, update]);

  if (!hydrated) {
    return <div className="flex items-center justify-center h-64"><p className="text-text-secondary">Loading...</p></div>;
  }

  const updateKPI = (id: string, partial: Partial<KPI>) => {
    setKpis((prev) => prev.map((k) => (k.id === id ? { ...k, ...partial } : k)));
  };

  const addKPI = () => {
    const newKPI: KPI = { id: uuid(), level: "board", name: "", metric: "", current: "", target2026: "", target2030: "", owner: "", frequency: "quarterly" };
    setKpis([...kpis, newKPI]);
    setExpandedKPI(newKPI.id);
  };

  const updateOKR = (id: string, partial: Partial<OKR>) => {
    setOkrs((prev) => prev.map((o) => (o.id === id ? { ...o, ...partial } : o)));
  };

  const addOKR = () => {
    const newOKR: OKR = { id: uuid(), department: "", objective: "", keyResults: [{ id: uuid(), description: "", timeline: "", status: "not_started" }] };
    setOkrs([...okrs, newOKR]);
    setExpandedOKR(newOKR.id);
  };

  const addKeyResult = (okrId: string) => {
    setOkrs((prev) =>
      prev.map((o) =>
        o.id === okrId
          ? { ...o, keyResults: [...o.keyResults, { id: uuid(), description: "", timeline: "", status: "not_started" }] }
          : o
      )
    );
  };

  const updateKeyResult = (okrId: string, krId: string, partial: Partial<OKR["keyResults"][0]>) => {
    setOkrs((prev) =>
      prev.map((o) =>
        o.id === okrId
          ? { ...o, keyResults: o.keyResults.map((kr) => (kr.id === krId ? { ...kr, ...partial } : kr)) }
          : o
      )
    );
  };

  const boardKPIs = kpis.filter((k) => k.level === "board");
  const deptKPIs = kpis.filter((k) => k.level === "department");
  const opsKPIs = kpis.filter((k) => k.level === "operational");

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <p className="text-[13px] text-text-secondary mb-1">Strategic Planning Canvas — Layer 6 of 6</p>
        <h1 className="text-[24px] text-primary">KPIs & OKRs</h1>
        <p className="text-[14px] text-text-secondary">Measurement framework connecting board targets to daily work</p>
      </div>

      <AlertCard variant="info" className="mb-6">
        <p className="text-[14px] text-primary">
          Strategy without measurement is wishes. When someone asks &ldquo;are we executing on decarbonization?&rdquo;
          the answer should be in the dashboard, not in a story.
        </p>
      </AlertCard>

      <div className="flex flex-col gap-6">
        {/* Board-Level KPIs */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[18px] text-primary">Board-Level KPIs</h2>
            <Badge variant="info">Quarterly / Executive</Badge>
          </div>
          <p className="text-[14px] text-text-secondary mb-4">
            These are reported to the board quarterly. Each KPI needs a current baseline, targets, and an owner.
          </p>

          {boardKPIs.map((kpi) => {
            const isExpanded = expandedKPI === kpi.id;
            return (
              <div key={kpi.id} className="border border-neutral-lighter rounded-[var(--radius-sm)] mb-3 overflow-hidden">
                <button
                  onClick={() => setExpandedKPI(isExpanded ? null : kpi.id)}
                  className="flex items-center justify-between w-full px-4 py-3 text-left cursor-pointer hover:bg-neutral-light transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {isExpanded ? <ChevronDown className="w-4 h-4 text-text-secondary" /> : <ChevronRight className="w-4 h-4 text-text-secondary" />}
                    <div>
                      <span className="text-[14px] font-medium text-text-primary">{kpi.name || "(Unnamed KPI)"}</span>
                      {kpi.metric && <p className="text-[12px] text-text-secondary">{kpi.metric}</p>}
                    </div>
                  </div>
                  {kpi.current && kpi.target2030 && (
                    <span className="text-[12px] text-text-secondary">{kpi.current} → {kpi.target2030}</span>
                  )}
                </button>

                {isExpanded && (
                  <div className="px-4 pb-4 flex flex-col gap-4 border-t border-neutral-lighter pt-4">
                    <Input label="KPI Name" value={kpi.name} onChange={(e) => updateKPI(kpi.id, { name: e.target.value })} />
                    <Input label="Metric" placeholder="What exactly is measured?" value={kpi.metric} onChange={(e) => updateKPI(kpi.id, { metric: e.target.value })} />
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <Input label="Current Baseline" value={kpi.current} onChange={(e) => updateKPI(kpi.id, { current: e.target.value })} />
                      <Input label="2026 Target" value={kpi.target2026} onChange={(e) => updateKPI(kpi.id, { target2026: e.target.value })} />
                      <Input label="2030 Target" value={kpi.target2030} onChange={(e) => updateKPI(kpi.id, { target2030: e.target.value })} />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Input label="Owner" placeholder="Name, Title" value={kpi.owner} onChange={(e) => updateKPI(kpi.id, { owner: e.target.value })} />
                      <Select
                        label="Reporting Frequency"
                        options={[
                          { value: "monthly", label: "Monthly" },
                          { value: "quarterly", label: "Quarterly" },
                          { value: "annual", label: "Annual" },
                        ]}
                        value={kpi.frequency}
                        onChange={(e) => updateKPI(kpi.id, { frequency: e.target.value as KPI["frequency"] })}
                      />
                    </div>
                    <button
                      onClick={() => setKpis((prev) => prev.filter((k) => k.id !== kpi.id))}
                      className="flex items-center gap-1 text-[12px] text-error font-medium cursor-pointer hover:underline self-start"
                    >
                      <X className="w-3 h-3" /> Remove KPI
                    </button>
                  </div>
                )}
              </div>
            );
          })}

          <button onClick={addKPI} className="flex items-center gap-2 text-[13px] text-primary font-medium cursor-pointer hover:underline mt-2">
            <Plus className="w-4 h-4" /> Add board KPI
          </button>
        </Card>

        {/* Departmental OKRs */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[18px] text-primary">Departmental OKRs</h2>
            <Badge variant="warning">Quarterly Reviews</Badge>
          </div>
          <p className="text-[14px] text-text-secondary mb-4">
            Each department owns an objective with measurable key results. OKRs connect board strategy to actual team work.
          </p>

          {okrs.map((okr) => {
            const isExpanded = expandedOKR === okr.id;
            return (
              <div key={okr.id} className="border border-neutral-lighter rounded-[var(--radius-sm)] mb-3 overflow-hidden">
                <button
                  onClick={() => setExpandedOKR(isExpanded ? null : okr.id)}
                  className="flex items-center justify-between w-full px-4 py-3 text-left cursor-pointer hover:bg-neutral-light transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {isExpanded ? <ChevronDown className="w-4 h-4 text-text-secondary" /> : <ChevronRight className="w-4 h-4 text-text-secondary" />}
                    <div>
                      <span className="text-[14px] font-medium text-text-primary">{okr.department || "(Department)"}: {okr.objective || "(Objective)"}</span>
                      <p className="text-[12px] text-text-secondary">{okr.keyResults.length} key result{okr.keyResults.length !== 1 ? "s" : ""}</p>
                    </div>
                  </div>
                </button>

                {isExpanded && (
                  <div className="px-4 pb-4 flex flex-col gap-4 border-t border-neutral-lighter pt-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Input label="Department" placeholder="e.g. Operations, Supply Chain, Finance" value={okr.department} onChange={(e) => updateOKR(okr.id, { department: e.target.value })} />
                      <Input label="Objective" placeholder="What does this dept commit to?" value={okr.objective} onChange={(e) => updateOKR(okr.id, { objective: e.target.value })} />
                    </div>

                    <div>
                      <p className="text-[14px] font-medium text-neutral mb-2">Key Results</p>
                      {okr.keyResults.map((kr) => (
                        <div key={kr.id} className="grid grid-cols-[1fr_auto_auto_auto] gap-2 mb-2 items-center">
                          <Input placeholder="Key result description" value={kr.description} onChange={(e) => updateKeyResult(okr.id, kr.id, { description: e.target.value })} />
                          <Input placeholder="Timeline" value={kr.timeline} onChange={(e) => updateKeyResult(okr.id, kr.id, { timeline: e.target.value })} className="w-32" />
                          <select
                            value={kr.status}
                            onChange={(e) => updateKeyResult(okr.id, kr.id, { status: e.target.value as typeof kr.status })}
                            className="bg-surface border border-neutral-lighter rounded-[var(--radius-sm)] px-2 py-3 text-[13px] w-28"
                          >
                            <option value="not_started">Not Started</option>
                            <option value="on_track">On Track</option>
                            <option value="at_risk">At Risk</option>
                            <option value="off_track">Off Track</option>
                          </select>
                          <button
                            onClick={() => updateOKR(okr.id, { keyResults: okr.keyResults.filter((k) => k.id !== kr.id) })}
                            className="text-text-secondary hover:text-error cursor-pointer"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                      <button
                        onClick={() => addKeyResult(okr.id)}
                        className="flex items-center gap-1 text-[12px] text-primary font-medium cursor-pointer hover:underline mt-1"
                      >
                        <Plus className="w-3 h-3" /> Add key result
                      </button>
                    </div>

                    <button
                      onClick={() => setOkrs((prev) => prev.filter((o) => o.id !== okr.id))}
                      className="flex items-center gap-1 text-[12px] text-error font-medium cursor-pointer hover:underline self-start"
                    >
                      <X className="w-3 h-3" /> Remove OKR
                    </button>
                  </div>
                )}
              </div>
            );
          })}

          <button onClick={addOKR} className="flex items-center gap-2 text-[13px] text-primary font-medium cursor-pointer hover:underline mt-2">
            <Plus className="w-4 h-4" /> Add departmental OKR
          </button>
        </Card>

        {/* Summary Dashboard Preview */}
        <Card>
          <h2 className="text-[18px] text-primary mb-4">Dashboard Hierarchy</h2>
          <div className="flex flex-col gap-3">
            <div className="bg-primary-light rounded-[var(--radius-sm)] p-4">
              <p className="text-[12px] text-primary font-semibold uppercase tracking-wider mb-2">Board Level — Quarterly</p>
              <div className="flex flex-wrap gap-2">
                {boardKPIs.map((k) => (
                  <span key={k.id} className="text-[12px] bg-surface text-primary px-3 py-1 rounded-full">{k.name || "Unnamed"}</span>
                ))}
              </div>
            </div>
            <div className="bg-warning-light rounded-[var(--radius-sm)] p-4">
              <p className="text-[12px] text-warning font-semibold uppercase tracking-wider mb-2">Department Level — Quarterly OKRs</p>
              <div className="flex flex-wrap gap-2">
                {okrs.map((o) => (
                  <span key={o.id} className="text-[12px] bg-surface text-warning px-3 py-1 rounded-full">{o.department || "Dept"}: {o.objective ? o.objective.slice(0, 30) + "..." : "Objective"}</span>
                ))}
              </div>
            </div>
            <div className="bg-success-light rounded-[var(--radius-sm)] p-4">
              <p className="text-[12px] text-success font-semibold uppercase tracking-wider mb-2">Operational — Daily/Weekly Tracking</p>
              <p className="text-[12px] text-success">MWh consumption, vehicle fuel usage, supplier delivery emissions, waste generation, RFQ compliance, cost per tonne avoided</p>
            </div>
          </div>
        </Card>

        <AlertCard variant="success" className="mb-2">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-success shrink-0" />
            <p className="text-[14px] text-success font-medium">
              You&apos;ve completed all 6 layers of the Strategic Planning Canvas.
              The next step is to validate your strategic priorities through Materiality Assessment and baseline data collection.
            </p>
          </div>
        </AlertCard>

        <div className="flex justify-between">
          <Link href="/canvas/procurement">
            <Button variant="ghost"><ArrowLeft className="w-4 h-4" /> Previous: Procurement</Button>
          </Link>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={save}>Save Draft</Button>
            <Link href="/materiality">
              <Button variant="primary" onClick={save}>
                Continue to Materiality Assessment <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

