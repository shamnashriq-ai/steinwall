"use client";

import { useSteinwall } from "@/lib/context";
import { Card, MetricCard } from "@/components/ui/card";
import { ProgressSteps, type StepStatus } from "@/components/ui/progress-step";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, ClipboardList, Database, Map, FileCheck } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function DashboardPage() {
  const { data, update, hydrated } = useSteinwall();
  const [showSetup, setShowSetup] = useState(false);
  const [companyName, setCompanyName] = useState("");
  const [industry, setIndustry] = useState("");

  if (!hydrated) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-text-secondary text-[14px]">Loading...</p>
      </div>
    );
  }

  const needsSetup = !data.companyName;

  if (needsSetup && !showSetup) {
    return (
      <div className="max-w-lg mx-auto mt-20 text-center">
        <h1 className="text-[32px] text-primary mb-2">Welcome to Steinwall</h1>
        <p className="text-text-secondary text-[16px] mb-8">
          Governance-first NFRS compliance. Let&apos;s set up your company profile to get started.
        </p>
        <Button variant="primary" size="lg" onClick={() => setShowSetup(true)}>
          Get Started <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    );
  }

  if (needsSetup && showSetup) {
    return (
      <div className="max-w-md mx-auto mt-16">
        <h1 className="text-[24px] text-primary mb-6">Company Setup</h1>
        <div className="flex flex-col gap-4">
          <Input
            label="Company Name"
            placeholder="e.g. Acme Manufacturing Sdn Bhd"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
          />
          <Input
            label="Industry"
            placeholder="e.g. Manufacturing, Energy, Retail"
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
          />
          <Input
            label="Audit Due Date (optional)"
            type="date"
            onChange={(e) => update({ auditDueDate: e.target.value })}
          />
          <Button
            variant="primary"
            disabled={!companyName.trim() || !industry.trim()}
            onClick={() => update({ companyName: companyName.trim(), industry: industry.trim() })}
          >
            Save & Continue <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    );
  }

  const materialityStatus: StepStatus = data.materiality?.status === "board_approved"
    ? "approved"
    : data.materiality?.status === "complete"
    ? "complete"
    : data.materiality
    ? "in_progress"
    : "not_started";

  const dataStatus: StepStatus =
    data.scopeData.dataQualityScore >= 75 ? "complete" :
    data.scopeData.scope1.length + data.scopeData.scope2.length + data.scopeData.scope3.length > 0 ? "in_progress" :
    "not_started";

  const strategyStatus: StepStatus = data.strategy?.status === "board_approved"
    ? "approved"
    : data.strategy?.status === "complete"
    ? "complete"
    : data.strategy
    ? "in_progress"
    : "not_started";

  const boardStatus: StepStatus =
    data.materiality?.boardMemo?.approved && data.strategy?.boardApproval?.approved
      ? "approved"
      : data.materiality?.boardMemo?.approved || data.strategy?.boardApproval?.approved
      ? "pending_approval"
      : "not_started";

  const auditReady = materialityStatus === "approved" && dataStatus === "complete" && strategyStatus === "approved";

  const totalEmissions = data.scopeData.totalS1 + data.scopeData.totalS2 + data.scopeData.totalS3;

  const stepsComplete = [materialityStatus, dataStatus, strategyStatus, boardStatus].filter(
    (s) => s === "complete" || s === "approved"
  ).length;
  const percentComplete = Math.round((stepsComplete / 4) * 100);

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-[32px] text-primary">{data.companyName}</h1>
        <p className="text-text-secondary text-[16px]">NFRS Compliance Dashboard</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <MetricCard
          label="Total Emissions"
          value={totalEmissions > 0 ? totalEmissions.toLocaleString() : "—"}
          unit={totalEmissions > 0 ? "tCO₂e" : ""}
          status="neutral"
        />
        <MetricCard
          label="Progress"
          value={`${percentComplete}%`}
          status={percentComplete >= 75 ? "success" : percentComplete >= 50 ? "warning" : "neutral"}
        />
        <MetricCard
          label="Compliance"
          value={auditReady ? "Ready" : "In Progress"}
          status={auditReady ? "success" : "warning"}
        />
        <MetricCard
          label="Data Quality"
          value={data.scopeData.dataQualityScore > 0 ? `${data.scopeData.dataQualityScore}%` : "—"}
          status={
            data.scopeData.dataQualityScore >= 75 ? "success" :
            data.scopeData.dataQualityScore >= 50 ? "warning" :
            "neutral"
          }
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <h2 className="text-[18px] text-primary mb-4">Compliance Journey</h2>
          <ProgressSteps
            steps={[
              { label: "Materiality Assessment", status: materialityStatus, detail: materialityStatus === "approved" ? "Board approved" : undefined },
              { label: "Scope 1, 2, 3 Data Collection", status: dataStatus, detail: dataStatus === "complete" ? `Quality: ${data.scopeData.dataQualityScore}%` : undefined },
              { label: "Decarbonization Strategy", status: strategyStatus },
              { label: "Board Approval", status: boardStatus },
              { label: "Audit-Ready Export", status: auditReady ? "complete" : "not_started" },
            ]}
          />
        </Card>

        <Card>
          <h2 className="text-[18px] text-primary mb-4">Quick Actions</h2>
          <div className="flex flex-col gap-2">
            <Link href="/materiality">
              <Button variant="secondary" className="w-full justify-start">
                <ClipboardList className="w-4 h-4" /> Materiality Assessment
              </Button>
            </Link>
            <Link href="/data-collection">
              <Button variant="secondary" className="w-full justify-start">
                <Database className="w-4 h-4" /> Collect Emissions Data
              </Button>
            </Link>
            <Link href="/strategy">
              <Button variant="secondary" className="w-full justify-start">
                <Map className="w-4 h-4" /> Build Strategy
              </Button>
            </Link>
            <Link href="/audit-trail">
              <Button variant="secondary" className="w-full justify-start">
                <FileCheck className="w-4 h-4" /> Audit Trail
              </Button>
            </Link>
          </div>
        </Card>
      </div>

      {data.auditDecisions.length > 0 && (
        <Card className="mt-6">
          <h2 className="text-[18px] text-primary mb-4">Recent Activity</h2>
          <div className="flex flex-col gap-2">
            {data.auditDecisions.slice(-5).reverse().map((d) => (
              <div key={d.id} className="flex items-center gap-3 text-[14px]">
                <span className="text-text-secondary w-24 shrink-0">
                  {new Date(d.date).toLocaleDateString()}
                </span>
                <span className="text-text-primary">{d.title}</span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
