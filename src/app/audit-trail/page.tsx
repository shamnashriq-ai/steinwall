"use client";

import { useSteinwall } from "@/lib/context";
import { Card, AlertCard } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState, useMemo } from "react";
import {
  FileText,
  Download,
  CheckCircle,
  AlertCircle,
  Clock,
  Database,
  ClipboardCheck,
} from "lucide-react";

type AuditTab = "timeline" | "provenance" | "methodology" | "export";

export default function AuditTrailPage() {
  const { data, update, hydrated } = useSteinwall();
  const [tab, setTab] = useState<AuditTab>("timeline");

  const allDataPoints = useMemo(() => {
    return [...data.scopeData.scope1, ...data.scopeData.scope2, ...data.scopeData.scope3];
  }, [data.scopeData]);

  const methodologyScore = useMemo(() => {
    const checked = data.methodologyChecks.filter((c) => c.checked).length;
    return Math.round((checked / data.methodologyChecks.length) * 100);
  }, [data.methodologyChecks]);

  const toggleMethodology = (id: string) => {
    const next = data.methodologyChecks.map((c) =>
      c.id === id ? { ...c, checked: !c.checked } : c
    );
    update({ methodologyChecks: next });
  };

  const materialityReady = data.materiality?.status === "board_approved";
  const dataReady = data.scopeData.dataQualityScore >= 50;
  const strategyReady = data.strategy?.status === "board_approved";
  const auditPackReady = materialityReady && dataReady && strategyReady;

  if (!hydrated) {
    return <div className="flex items-center justify-center h-64"><p className="text-text-secondary">Loading...</p></div>;
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-[24px] text-primary">Audit Trail & Documentation</h1>
        <p className="text-[14px] text-text-secondary">Document every decision so auditors can verify compliance quickly</p>
      </div>

      <div className="flex gap-1 mb-6 border-b border-neutral-lighter">
        {(["timeline", "provenance", "methodology", "export"] as AuditTab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2.5 text-[14px] font-medium border-b-2 transition-colors cursor-pointer ${
              tab === t ? "border-primary text-primary" : "border-transparent text-text-secondary hover:text-text-primary"
            }`}
          >
            {t === "timeline" ? "Decision Timeline" : t === "provenance" ? "Data Provenance" : t === "methodology" ? "Methodology" : "Audit Pack"}
          </button>
        ))}
      </div>

      {tab === "timeline" && (
        <Card>
          <h2 className="text-[18px] text-primary mb-6">Decision Timeline</h2>
          {data.auditDecisions.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="w-10 h-10 text-neutral-lighter mx-auto mb-3" />
              <p className="text-[14px] text-text-secondary">
                No decisions logged yet. Complete your materiality assessment and strategy to start building the audit trail.
              </p>
            </div>
          ) : (
            <div className="relative pl-8 border-l-2 border-primary-light">
              {data.auditDecisions
                .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                .map((d) => (
                  <div key={d.id} className="mb-6 relative">
                    <div className="absolute -left-[25px] w-4 h-4 rounded-full bg-primary border-2 border-surface" />
                    <div className="bg-neutral-light rounded-[var(--radius-sm)] p-4">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[13px] text-text-secondary">
                          {new Date(d.date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                        </span>
                        <Badge variant={d.type === "board_decision" ? "info" : "neutral"}>
                          {d.type.replace(/_/g, " ")}
                        </Badge>
                      </div>
                      <p className="text-[14px] font-medium text-text-primary">{d.title}</p>
                      {d.description && <p className="text-[13px] text-text-secondary mt-1">{d.description}</p>}
                    </div>
                  </div>
                ))}
            </div>
          )}
        </Card>
      )}

      {tab === "provenance" && (
        <Card>
          <h2 className="text-[18px] text-primary mb-4">Data Provenance Report</h2>
          <p className="text-[14px] text-text-secondary mb-6">
            For each data point: source, method, confidence, and last update.
          </p>
          {allDataPoints.length === 0 ? (
            <div className="text-center py-12">
              <Database className="w-10 h-10 text-neutral-lighter mx-auto mb-3" />
              <p className="text-[14px] text-text-secondary">No emissions data collected yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-[14px]">
                <thead>
                  <tr className="bg-neutral-light">
                    <th className="text-left px-4 py-3 font-medium text-neutral">Input</th>
                    <th className="text-right px-4 py-3 font-medium text-neutral">Value</th>
                    <th className="text-left px-4 py-3 font-medium text-neutral">Source</th>
                    <th className="text-left px-4 py-3 font-medium text-neutral">Method</th>
                    <th className="text-center px-4 py-3 font-medium text-neutral">Confidence</th>
                    <th className="text-left px-4 py-3 font-medium text-neutral">Last Updated</th>
                  </tr>
                </thead>
                <tbody>
                  {allDataPoints.map((point) => (
                    <tr key={point.id} className="border-b border-neutral-lighter">
                      <td className="px-4 py-3">
                        <p className="font-medium">Scope {point.scope}: {point.description || point.category}</p>
                      </td>
                      <td className="px-4 py-3 text-right font-[family-name:var(--font-mono)]">
                        {point.emissionsTonneCO2e.toLocaleString()} tCO₂e
                      </td>
                      <td className="px-4 py-3">{point.source}</td>
                      <td className="px-4 py-3 text-[13px] text-text-secondary">{point.methodology || "—"}</td>
                      <td className="px-4 py-3 text-center">
                        <Badge variant={point.confidence === "100%" ? "success" : point.confidence === "75%" ? "warning" : "error"}>
                          {point.confidence}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-[13px] text-text-secondary">
                        {new Date(point.lastUpdated).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {tab === "methodology" && (
        <Card>
          <h2 className="text-[18px] text-primary mb-2">Methodology Scorecard</h2>
          <p className="text-[14px] text-text-secondary mb-6">
            Does your data follow GHG Protocol standards?
          </p>

          <div className="flex items-center gap-4 mb-6">
            <div className={`text-[32px] font-[family-name:var(--font-display)] font-semibold ${
              methodologyScore >= 80 ? "text-success" : methodologyScore >= 60 ? "text-warning" : "text-error"
            }`}>
              {methodologyScore}%
            </div>
            <div>
              <p className="text-[14px] font-medium text-text-primary">GHG Protocol Compliant</p>
              <p className="text-[13px] text-text-secondary">
                {methodologyScore >= 80 ? "Strong compliance" : methodologyScore >= 60 ? "Review needed" : "Significant gaps"}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            {data.methodologyChecks.map((check) => (
              <label
                key={check.id}
                className="flex items-center gap-3 p-3 rounded-[var(--radius-sm)] border border-neutral-lighter hover:bg-neutral-light cursor-pointer transition-colors"
              >
                <input
                  type="checkbox"
                  checked={check.checked}
                  onChange={() => toggleMethodology(check.id)}
                  className="w-5 h-5 accent-success"
                />
                <span className={`text-[14px] ${check.checked ? "text-text-primary" : "text-text-secondary"}`}>
                  {check.label}
                </span>
                {check.checked ? (
                  <CheckCircle className="w-4 h-4 text-success ml-auto" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-warning ml-auto" />
                )}
              </label>
            ))}
          </div>

          {methodologyScore < 100 && (
            <AlertCard variant="warning" className="mt-6">
              <p className="text-[14px] text-warning">
                To reach 100% compliance, complete the unchecked items above. Each represents a GHG Protocol requirement.
              </p>
            </AlertCard>
          )}
        </Card>
      )}

      {tab === "export" && (
        <Card>
          <h2 className="text-[18px] text-primary mb-4">Audit-Ready Export</h2>
          <p className="text-[14px] text-text-secondary mb-6">
            Generate a complete documentation package for external auditor review.
          </p>

          <div className="flex flex-col gap-3 mb-6">
            {[
              { label: "Executive Summary", ready: !!data.companyName, icon: FileText },
              { label: "Materiality Assessment (Board Approved)", ready: materialityReady, icon: ClipboardCheck },
              { label: "Scope 1, 2, 3 Baseline Data", ready: dataReady, icon: Database },
              { label: "Decarbonization Strategy (Board Approved)", ready: strategyReady, icon: FileText },
              { label: "Data Provenance Report", ready: allDataPoints.length > 0, icon: Database },
              { label: "Methodology Scorecard", ready: methodologyScore >= 60, icon: ClipboardCheck },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-[var(--radius-sm)] border border-neutral-lighter">
                <item.icon className={`w-5 h-5 ${item.ready ? "text-success" : "text-neutral-lighter"}`} />
                <span className="text-[14px] flex-1">{item.label}</span>
                <Badge variant={item.ready ? "success" : "error"}>
                  {item.ready ? "Ready" : "Missing"}
                </Badge>
              </div>
            ))}
          </div>

          {auditPackReady ? (
            <AlertCard variant="success">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[14px] font-medium text-success">Your audit pack is ready for export</p>
                  <p className="text-[13px] text-success/80 mt-1">All required documents are complete and board-approved.</p>
                </div>
                <Button variant="success" size="sm">
                  <Download className="w-4 h-4" /> Download ZIP
                </Button>
              </div>
            </AlertCard>
          ) : (
            <AlertCard variant="warning">
              <p className="text-[14px] text-warning">
                Complete all missing items above before generating the audit pack.
                {!materialityReady && " Complete and get board approval for your materiality assessment."}
                {!dataReady && " Collect emissions data with at least 50% quality score."}
                {!strategyReady && " Build and get board approval for your strategy."}
              </p>
            </AlertCard>
          )}
        </Card>
      )}
    </div>
  );
}
