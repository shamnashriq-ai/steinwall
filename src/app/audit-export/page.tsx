"use client";

import { useSteinwall } from "@/lib/context";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Download, FileText, CheckCircle2, ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";
import { v4 as uuid } from "uuid";
import type { AuditExportConfig, AuditWorkpaper } from "@/lib/types";
import { defaultWorkpaperMetrics } from "@/lib/nfrs-gap-data";

const emptyWorkpaper = (name?: string): AuditWorkpaper => ({
  id: uuid(), metricName: name || "", currentValue: "", priorYear1: "", priorYear2: "",
  calculationMethod: "", dataSource: "", assumptions: "",
  preparer: "", preparerDate: "", reviewer: "", reviewerDate: "",
});

export default function AuditExportPage() {
  const { data, update, hydrated } = useSteinwall();
  const [step, setStep] = useState(0);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [newSource, setNewSource] = useState({ document: "", location: "", maintainer: "" });

  const ae = data.auditExport || {
    workpapers: [],
    methodologyDoc: { standard: "", scope: "", emissionFactors: "", boundary: "", limitations: "" },
    sourceDocIndex: [],
    auditorSummary: { materialMetrics: [], riskAreas: [], limitations: [], priorFindings: [] },
    exportFormat: "pdf" as const,
    status: "draft" as const,
    updatedAt: new Date().toISOString(),
  };

  const save = (updated: AuditExportConfig) => {
    update({ auditExport: { ...updated, updatedAt: new Date().toISOString() } });
  };

  if (!hydrated) return <div className="flex items-center justify-center h-64"><p className="text-text-secondary text-[14px]">Loading...</p></div>;

  const steps = ["Workpapers", "Methodology", "Source Docs", "Auditor Summary"];
  const completedWorkpapers = ae.workpapers.filter((w) => w.currentValue && w.calculationMethod && w.preparer).length;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-[28px] text-primary">Audit-Ready Export</h1>
        <p className="text-text-secondary text-[14px]">External auditor requirement (2027+) — Workpapers, methodology, source docs, sign-off</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="border border-neutral-lighter rounded-[var(--radius-sm)] p-3 text-center">
          <p className="text-[22px] font-semibold text-primary">{ae.workpapers.length}</p>
          <p className="text-[12px] text-text-secondary">Workpapers</p>
        </div>
        <div className="border border-neutral-lighter rounded-[var(--radius-sm)] p-3 text-center">
          <p className="text-[22px] font-semibold text-primary">{completedWorkpapers}/{ae.workpapers.length}</p>
          <p className="text-[12px] text-text-secondary">Complete</p>
        </div>
        <div className="border border-neutral-lighter rounded-[var(--radius-sm)] p-3 text-center">
          <p className="text-[22px] font-semibold text-primary">{ae.sourceDocIndex.length}</p>
          <p className="text-[12px] text-text-secondary">Source Docs</p>
        </div>
        <div className="border border-neutral-lighter rounded-[var(--radius-sm)] p-3 text-center">
          <p className="text-[22px] font-semibold text-primary">{ae.workpapers.length > 0 ? Math.round((completedWorkpapers / ae.workpapers.length) * 100) : 0}%</p>
          <p className="text-[12px] text-text-secondary">Ready</p>
        </div>
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
            <h2 className="text-[18px] text-primary">Data Workpapers</h2>
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" onClick={() => {
                const existing = ae.workpapers.map((w) => w.metricName);
                const toAdd = defaultWorkpaperMetrics.filter((m) => !existing.includes(m));
                if (toAdd.length > 0) save({ ...ae, workpapers: [...ae.workpapers, ...toAdd.map((m) => emptyWorkpaper(m))] });
              }}>Load Defaults</Button>
              <Button variant="primary" size="sm" onClick={() => { const w = emptyWorkpaper(); save({ ...ae, workpapers: [...ae.workpapers, w] }); setExpanded(w.id); }}>
                <Plus className="w-4 h-4" /> Add Metric
              </Button>
            </div>
          </div>
          <p className="text-[13px] text-text-secondary mb-4">One workpaper per metric — the auditor will verify each number. Include current year + 2 prior years for comparison.</p>

          {ae.workpapers.map((w, wi) => {
            const exp = expanded === w.id;
            const complete = w.currentValue && w.calculationMethod && w.preparer;
            return (
              <div key={w.id} className="border border-neutral-lighter rounded-[var(--radius-sm)] mb-2">
                <button onClick={() => setExpanded(exp ? null : w.id)} className="w-full flex items-center justify-between p-3 text-left cursor-pointer">
                  <div className="flex items-center gap-3">
                    <FileText className="w-4 h-4 text-primary" />
                    <span className="text-[13px] font-medium">{w.metricName || "Unnamed Metric"}</span>
                    {complete ? <Badge variant="success">Complete</Badge> : <Badge variant="warning">Incomplete</Badge>}
                  </div>
                  {exp ? <ChevronDown className="w-4 h-4 text-text-secondary" /> : <ChevronRight className="w-4 h-4 text-text-secondary" />}
                </button>
                {exp && (
                  <div className="px-4 pb-4 flex flex-col gap-3 border-t border-neutral-lighter pt-3">
                    <Input label="Metric Name" value={w.metricName} onChange={(e) => { const u = [...ae.workpapers]; u[wi] = { ...w, metricName: e.target.value }; save({ ...ae, workpapers: u }); }} />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <Input label="Current Year Value" value={w.currentValue} onChange={(e) => { const u = [...ae.workpapers]; u[wi] = { ...w, currentValue: e.target.value }; save({ ...ae, workpapers: u }); }} />
                      <Input label="Prior Year 1" value={w.priorYear1} onChange={(e) => { const u = [...ae.workpapers]; u[wi] = { ...w, priorYear1: e.target.value }; save({ ...ae, workpapers: u }); }} />
                      <Input label="Prior Year 2" value={w.priorYear2} onChange={(e) => { const u = [...ae.workpapers]; u[wi] = { ...w, priorYear2: e.target.value }; save({ ...ae, workpapers: u }); }} />
                    </div>
                    <Input label="Calculation Method" placeholder="e.g. Activity x Emission Factor (GHG Protocol)" value={w.calculationMethod} onChange={(e) => { const u = [...ae.workpapers]; u[wi] = { ...w, calculationMethod: e.target.value }; save({ ...ae, workpapers: u }); }} />
                    <Input label="Data Source" placeholder="e.g. TNB invoices, SAP CO_REC module" value={w.dataSource} onChange={(e) => { const u = [...ae.workpapers]; u[wi] = { ...w, dataSource: e.target.value }; save({ ...ae, workpapers: u }); }} />
                    <Input label="Assumptions" placeholder="e.g. Grid mix factor stable, 98% invoices received" value={w.assumptions} onChange={(e) => { const u = [...ae.workpapers]; u[wi] = { ...w, assumptions: e.target.value }; save({ ...ae, workpapers: u }); }} />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <Input label="Preparer" value={w.preparer} onChange={(e) => { const u = [...ae.workpapers]; u[wi] = { ...w, preparer: e.target.value }; save({ ...ae, workpapers: u }); }} />
                      <Input label="Preparer Date" type="date" value={w.preparerDate} onChange={(e) => { const u = [...ae.workpapers]; u[wi] = { ...w, preparerDate: e.target.value }; save({ ...ae, workpapers: u }); }} />
                      <Input label="Reviewer" value={w.reviewer} onChange={(e) => { const u = [...ae.workpapers]; u[wi] = { ...w, reviewer: e.target.value }; save({ ...ae, workpapers: u }); }} />
                      <Input label="Reviewer Date" type="date" value={w.reviewerDate} onChange={(e) => { const u = [...ae.workpapers]; u[wi] = { ...w, reviewerDate: e.target.value }; save({ ...ae, workpapers: u }); }} />
                    </div>
                    <Button variant="ghost" size="sm" className="self-end text-red-500" onClick={() => save({ ...ae, workpapers: ae.workpapers.filter((_, i) => i !== wi) })}>
                      <Trash2 className="w-4 h-4" /> Remove
                    </Button>
                  </div>
                )}
              </div>
            );
          })}

          <div className="flex justify-end mt-4">
            <Button variant="primary" onClick={() => setStep(1)}>Next: Methodology →</Button>
          </div>
        </Card>
      )}

      {step === 1 && (
        <Card>
          <h2 className="text-[18px] text-primary mb-4">Methodology Documentation</h2>
          <p className="text-[13px] text-text-secondary mb-4">The auditor will challenge your methodology. Document it clearly.</p>

          <div className="flex flex-col gap-3">
            <Input label="Standard Used" placeholder="e.g. GHG Protocol Corporate Standard, NFRS/IFRS S2" value={ae.methodologyDoc.standard} onChange={(e) => save({ ...ae, methodologyDoc: { ...ae.methodologyDoc, standard: e.target.value } })} />
            <Input label="Organizational Boundary" placeholder="e.g. Operational control, all owned facilities in Malaysia" value={ae.methodologyDoc.scope} onChange={(e) => save({ ...ae, methodologyDoc: { ...ae.methodologyDoc, scope: e.target.value } })} />
            <Input label="Emission Factors" placeholder="e.g. ADEME for Scope 1, TNB Grid Mix for Scope 2, PCAF for financed emissions" value={ae.methodologyDoc.emissionFactors} onChange={(e) => save({ ...ae, methodologyDoc: { ...ae.methodologyDoc, emissionFactors: e.target.value } })} />
            <Input label="Boundary Decisions" placeholder="e.g. Includes: all owned + leased >1000sqm. Excludes: non-operational" value={ae.methodologyDoc.boundary} onChange={(e) => save({ ...ae, methodologyDoc: { ...ae.methodologyDoc, boundary: e.target.value } })} />
            <div>
              <label className="text-[13px] font-medium text-text-primary mb-1 block">Limitations & Uncertainties</label>
              <textarea className="w-full border border-neutral-lighter rounded-[var(--radius-sm)] px-3 py-2 text-[14px] min-h-[80px]" placeholder="e.g. Scope 3 based on spend-based estimates (±20% uncertainty). 2% of invoices estimated." value={ae.methodologyDoc.limitations} onChange={(e) => save({ ...ae, methodologyDoc: { ...ae.methodologyDoc, limitations: e.target.value } })} />
            </div>
          </div>

          <div className="flex justify-between mt-4">
            <Button variant="secondary" onClick={() => setStep(0)}>← Back</Button>
            <Button variant="primary" onClick={() => setStep(2)}>Next: Source Docs →</Button>
          </div>
        </Card>
      )}

      {step === 2 && (
        <Card>
          <h2 className="text-[18px] text-primary mb-4">Source Documentation Index</h2>
          <p className="text-[13px] text-text-secondary mb-4">Index of source documents the auditor can request to verify each metric.</p>

          <div className="border border-neutral-lighter rounded-[var(--radius-sm)] overflow-hidden mb-4">
            <table className="w-full text-[13px]">
              <thead className="bg-neutral-light"><tr><th className="px-4 py-2 text-left">Document</th><th className="px-4 py-2 text-left">Location</th><th className="px-4 py-2 text-left">Maintainer</th><th className="w-10"></th></tr></thead>
              <tbody>
                {ae.sourceDocIndex.map((s, i) => (
                  <tr key={i} className="border-t border-neutral-lighter">
                    <td className="px-4 py-2">{s.document}</td><td className="px-4 py-2">{s.location}</td><td className="px-4 py-2">{s.maintainer}</td>
                    <td className="px-4 py-2"><button className="cursor-pointer text-red-400" onClick={() => save({ ...ae, sourceDocIndex: ae.sourceDocIndex.filter((_, j) => j !== i) })}><Trash2 className="w-3 h-3" /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex gap-2 flex-wrap">
            <Input placeholder="Document" value={newSource.document} onChange={(e) => setNewSource({ ...newSource, document: e.target.value })} />
            <Input placeholder="Location" value={newSource.location} onChange={(e) => setNewSource({ ...newSource, location: e.target.value })} />
            <Input placeholder="Maintainer" value={newSource.maintainer} onChange={(e) => setNewSource({ ...newSource, maintainer: e.target.value })} />
            <Button variant="secondary" onClick={() => {
              if (newSource.document) { save({ ...ae, sourceDocIndex: [...ae.sourceDocIndex, { ...newSource }] }); setNewSource({ document: "", location: "", maintainer: "" }); }
            }}>Add</Button>
          </div>

          <div className="flex justify-between mt-4">
            <Button variant="secondary" onClick={() => setStep(1)}>← Back</Button>
            <Button variant="primary" onClick={() => setStep(3)}>Next: Auditor Summary →</Button>
          </div>
        </Card>
      )}

      {step === 3 && (
        <Card>
          <h2 className="text-[18px] text-primary mb-4">Auditor Summary</h2>
          <p className="text-[13px] text-text-secondary mb-4">Executive summary for the auditor: what matters most, where risk is, and known gaps.</p>

          {(["materialMetrics", "riskAreas", "limitations", "priorFindings"] as const).map((field) => {
            const labels: Record<string, { label: string; placeholder: string }> = {
              materialMetrics: { label: "Material Metrics (most important for audit)", placeholder: "e.g. Scope 1+2 total emissions" },
              riskAreas: { label: "Risk Areas (where auditor should focus)", placeholder: "e.g. Scope 3 spend-based estimates" },
              limitations: { label: "Known Limitations", placeholder: "e.g. 2% of electricity invoices estimated" },
              priorFindings: { label: "Prior Year Findings", placeholder: "e.g. Scope 3 methodology inconsistency" },
            };
            const { label, placeholder } = labels[field];
            return (
              <div key={field} className="mb-4">
                <label className="text-[13px] font-medium text-text-primary mb-1 block">{label}</label>
                <div className="flex flex-col gap-1 mb-2">
                  {ae.auditorSummary[field].map((item, i) => (
                    <div key={i} className="flex items-center gap-2 text-[13px]">
                      <span className="flex-1">• {item}</span>
                      <button className="cursor-pointer text-red-400" onClick={() => {
                        save({ ...ae, auditorSummary: { ...ae.auditorSummary, [field]: ae.auditorSummary[field].filter((_: string, j: number) => j !== i) } });
                      }}><Trash2 className="w-3 h-3" /></button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input placeholder={placeholder} id={`${field}-input`} />
                  <Button variant="secondary" size="sm" onClick={() => {
                    const input = document.getElementById(`${field}-input`) as HTMLInputElement;
                    if (input?.value.trim()) {
                      save({ ...ae, auditorSummary: { ...ae.auditorSummary, [field]: [...ae.auditorSummary[field], input.value.trim()] } });
                      input.value = "";
                    }
                  }}>Add</Button>
                </div>
              </div>
            );
          })}

          <div className="mb-4">
            <label className="text-[13px] font-medium text-text-primary mb-1 block">Export Format</label>
            <select className="border border-neutral-lighter rounded-[var(--radius-sm)] px-3 py-2 text-[14px]" value={ae.exportFormat} onChange={(e) => save({ ...ae, exportFormat: e.target.value as "pdf" | "excel" | "xbrl" })}>
              <option value="pdf">PDF (Narrative format)</option>
              <option value="excel">Excel (Workpaper format)</option>
              <option value="xbrl">XBRL (Bursa LINK electronic filing)</option>
            </select>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-[var(--radius-sm)] p-4 mt-4 mb-4">
            <p className="text-[13px] font-medium text-blue-800 mb-2">Audit Readiness Summary</p>
            <p className="text-[13px] text-blue-700">
              {completedWorkpapers}/{ae.workpapers.length} workpapers complete ·{" "}
              {ae.sourceDocIndex.length} source documents indexed ·{" "}
              Methodology: {ae.methodologyDoc.standard || "Not set"} ·{" "}
              Format: {ae.exportFormat.toUpperCase()}
            </p>
          </div>

          <div className="flex justify-between mt-4">
            <Button variant="secondary" onClick={() => setStep(2)}>← Back</Button>
            <Button variant="primary" onClick={() => save({ ...ae, status: "complete" })}>
              <Download className="w-4 h-4" /> Save & Mark Ready
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
