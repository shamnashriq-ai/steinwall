"use client";

import { useSteinwall } from "@/lib/context";
import { Card, MetricCard } from "@/components/ui/card";
import { ProgressSteps, type StepStatus } from "@/components/ui/progress-step";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, Compass, AlertTriangle, Flag, Rocket, ShoppingCart, TrendingUp, Target, Database, Map, FileCheck, ClipboardCheck, Shield, Zap, DollarSign, MapPin, Users2, Layers, GitCompare, Download } from "lucide-react";
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
        <p className="text-text-secondary text-[16px] mb-2">
          Strategy-first NFRS compliance.
        </p>
        <p className="text-text-secondary text-[14px] mb-8">
          Start with your strategic vision, then validate with data and audits.
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

  const sc = data.strategicCanvas;

  const purposeStatus: StepStatus = sc?.purpose?.status === "board_approved" ? "approved" : sc?.purpose?.status === "complete" ? "complete" : sc?.purpose ? "in_progress" : "not_started";
  const challengesStatus: StepStatus = sc?.challenges?.status === "complete" ? "complete" : sc?.challenges ? "in_progress" : "not_started";
  const missionStatus: StepStatus = sc?.mission?.status === "board_approved" ? "approved" : sc?.mission?.status === "complete" ? "complete" : sc?.mission ? "in_progress" : "not_started";
  const actionStatus: StepStatus = sc?.actionPlans?.status === "complete" ? "complete" : sc?.actionPlans ? "in_progress" : "not_started";
  const procurementStatus: StepStatus = sc?.procurement?.status === "complete" ? "complete" : sc?.procurement ? "in_progress" : "not_started";
  const kpiStatus: StepStatus = sc?.kpis?.status === "complete" ? "complete" : sc?.kpis ? "in_progress" : "not_started";

  const canvasSteps = [purposeStatus, challengesStatus, missionStatus, actionStatus, procurementStatus, kpiStatus];
  const canvasComplete = canvasSteps.filter((s) => s === "complete" || s === "approved").length;
  const canvasPercent = Math.round((canvasComplete / 6) * 100);
  const canvasLocked = canvasComplete === 6;

  const standardsStatus: StepStatus = data.standardsSelection?.status === "board_approved"
    ? "approved"
    : data.standardsSelection?.status === "complete"
    ? "complete"
    : data.standardsSelection
    ? "in_progress"
    : "not_started";

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

  const governanceStatus: StepStatus = data.governance?.status === "board_approved" ? "approved" : data.governance?.status === "complete" ? "complete" : data.governance ? "in_progress" : "not_started";
  const scenarioStatus: StepStatus = data.scenarioAnalysis?.status === "board_approved" ? "approved" : data.scenarioAnalysis?.status === "complete" ? "complete" : data.scenarioAnalysis ? "in_progress" : "not_started";
  const financialStatus: StepStatus = data.financialImpact?.status === "board_approved" ? "approved" : data.financialImpact?.status === "complete" ? "complete" : data.financialImpact ? "in_progress" : "not_started";
  const physicalRiskStatus: StepStatus = data.physicalRisk?.status === "board_approved" ? "approved" : data.physicalRisk?.status === "complete" ? "complete" : data.physicalRisk ? "in_progress" : "not_started";
  const stakeholderStatus: StepStatus = data.stakeholderEngagement?.status === "complete" ? "complete" : data.stakeholderEngagement ? "in_progress" : "not_started";
  const segmentStatus: StepStatus = data.segmentStrategy?.status === "board_approved" ? "approved" : data.segmentStrategy?.status === "complete" ? "complete" : data.segmentStrategy ? "in_progress" : "not_started";
  const comparativeStatus: StepStatus = data.comparativeData?.status === "complete" ? "complete" : data.comparativeData ? "in_progress" : "not_started";
  const auditExportStatus: StepStatus = data.auditExport?.status === "complete" ? "complete" : data.auditExport ? "in_progress" : "not_started";

  const complianceSteps = [governanceStatus, scenarioStatus, financialStatus, physicalRiskStatus, stakeholderStatus, segmentStatus, comparativeStatus, auditExportStatus];
  const complianceComplete = complianceSteps.filter((s) => s === "complete" || s === "approved").length;

  const auditReady = materialityStatus === "approved" && dataStatus === "complete" && strategyStatus === "approved";

  const totalEmissions = data.scopeData.totalS1 + data.scopeData.totalS2 + data.scopeData.totalS3;

  const allSteps = [...canvasSteps, materialityStatus, standardsStatus, dataStatus, strategyStatus, ...complianceSteps];
  const totalComplete = allSteps.filter((s) => s === "complete" || s === "approved").length;
  const overallPercent = Math.round((totalComplete / allSteps.length) * 100);

  const nextAction = !sc?.purpose ? { label: "Start: Define Your Purpose", href: "/canvas/purpose", icon: Compass } :
    purposeStatus !== "complete" && purposeStatus !== "approved" ? { label: "Continue: Purpose Canvas", href: "/canvas/purpose", icon: Compass } :
    !sc?.challenges ? { label: "Next: Identify Challenges", href: "/canvas/challenges", icon: AlertTriangle } :
    challengesStatus !== "complete" ? { label: "Continue: Challenges Canvas", href: "/canvas/challenges", icon: AlertTriangle } :
    !sc?.mission ? { label: "Next: Define Mission", href: "/canvas/mission", icon: Flag } :
    missionStatus !== "complete" && missionStatus !== "approved" ? { label: "Continue: Mission Canvas", href: "/canvas/mission", icon: Flag } :
    !sc?.actionPlans ? { label: "Next: Build Action Plans", href: "/canvas/action-plans", icon: Rocket } :
    actionStatus !== "complete" ? { label: "Continue: Action Plans", href: "/canvas/action-plans", icon: Rocket } :
    !sc?.procurement ? { label: "Next: Procurement Strategy", href: "/canvas/procurement", icon: ShoppingCart } :
    procurementStatus !== "complete" ? { label: "Continue: Procurement", href: "/canvas/procurement", icon: ShoppingCart } :
    !sc?.kpis ? { label: "Next: Set KPIs & OKRs", href: "/canvas/kpis", icon: TrendingUp } :
    kpiStatus !== "complete" ? { label: "Continue: KPIs & OKRs", href: "/canvas/kpis", icon: TrendingUp } :
    materialityStatus === "not_started" ? { label: "Next: Materiality Assessment", href: "/materiality", icon: Target } :
    standardsStatus === "not_started" ? { label: "Next: Select Audit Standards", href: "/data-collection/standards", icon: ClipboardCheck } :
    standardsStatus !== "complete" && standardsStatus !== "approved" ? { label: "Continue: Audit Standards", href: "/data-collection/standards", icon: ClipboardCheck } :
    dataStatus === "not_started" ? { label: "Next: Collect Emissions Data", href: "/data-collection", icon: Database } :
    strategyStatus === "not_started" ? { label: "Next: Build Tactical Strategy", href: "/strategy", icon: Map } :
    { label: "View Audit Trail", href: "/audit-trail", icon: FileCheck };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-[32px] text-primary">{data.companyName}</h1>
        <p className="text-text-secondary text-[16px]">Strategy-First NFRS Compliance</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <MetricCard
          label="Overall Progress"
          value={`${overallPercent}%`}
          status={overallPercent >= 75 ? "success" : overallPercent >= 40 ? "warning" : "neutral"}
        />
        <MetricCard
          label="Strategic Canvas"
          value={`${canvasComplete}/6`}
          status={canvasLocked ? "success" : canvasComplete >= 3 ? "warning" : "neutral"}
        />
        <MetricCard
          label="Total Emissions"
          value={totalEmissions > 0 ? totalEmissions.toLocaleString() : "—"}
          unit={totalEmissions > 0 ? "tCO₂e" : ""}
          status="neutral"
        />
        <MetricCard
          label="NFRS Compliance"
          value={`${complianceComplete}/8`}
          status={complianceComplete >= 6 ? "success" : complianceComplete >= 3 ? "warning" : "neutral"}
        />
      </div>

      {/* Next action CTA */}
      <Link href={nextAction.href}>
        <Card className="mb-6 hover:border-primary/40 transition-colors cursor-pointer">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-primary-light rounded-[var(--radius-sm)] flex items-center justify-center shrink-0">
              <nextAction.icon className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-[14px] font-medium text-primary">{nextAction.label}</p>
              <p className="text-[13px] text-text-secondary">
                {!canvasLocked ? "Complete your strategic foundation before moving to compliance" : "Validate strategic priorities with data"}
              </p>
            </div>
            <ArrowRight className="w-5 h-5 text-primary shrink-0" />
          </div>
        </Card>
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <h2 className="text-[18px] text-primary mb-4">Strategic Planning Canvas</h2>
          <p className="text-[13px] text-text-secondary mb-4">Strategy comes first — compliance validates it</p>
          <ProgressSteps
            steps={[
              { label: "Purpose", status: purposeStatus, detail: purposeStatus === "approved" ? "Board approved" : undefined },
              { label: "Challenges", status: challengesStatus },
              { label: "Mission", status: missionStatus, detail: missionStatus === "approved" ? "Board approved" : undefined },
              { label: "Action Plans", status: actionStatus },
              { label: "Procurement Strategies", status: procurementStatus },
              { label: "KPIs & OKRs", status: kpiStatus },
            ]}
          />

          {canvasLocked && (
            <>
              <div className="border-t border-neutral-lighter mt-4 pt-4">
                <p className="text-[13px] text-text-secondary mb-3">Assessments & Execution</p>
                <ProgressSteps
                  steps={[
                    { label: "Materiality Assessment", status: materialityStatus, detail: materialityStatus === "approved" ? "Board approved" : undefined },
                    { label: "Audit Standards Selection", status: standardsStatus, detail: standardsStatus === "approved" ? "Board approved" : undefined },
                    { label: "Scope 1, 2, 3 Data Collection", status: dataStatus, detail: dataStatus === "complete" ? `Quality: ${data.scopeData.dataQualityScore}%` : undefined },
                    { label: "Decarbonization Strategy", status: strategyStatus },
                  ]}
                />
              </div>
              <div className="border-t border-neutral-lighter mt-4 pt-4">
                <p className="text-[13px] text-text-secondary mb-3">NFRS Compliance ({complianceComplete}/8)</p>
                <ProgressSteps
                  steps={[
                    { label: "Governance Framework", status: governanceStatus },
                    { label: "Scenario Analysis", status: scenarioStatus },
                    { label: "Financial Impact", status: financialStatus },
                    { label: "Physical Risk", status: physicalRiskStatus },
                    { label: "Stakeholder Engagement", status: stakeholderStatus },
                    { label: "Segment Strategy", status: segmentStatus },
                    { label: "Multi-Year Data", status: comparativeStatus },
                    { label: "Audit Export", status: auditExportStatus },
                  ]}
                />
              </div>
            </>
          )}
        </Card>

        <Card>
          <h2 className="text-[18px] text-primary mb-4">Quick Actions</h2>
          <div className="flex flex-col gap-2">
            <p className="text-[11px] uppercase tracking-widest font-semibold text-text-secondary mb-1">Strategic Planning</p>
            <Link href="/canvas/purpose">
              <Button variant="secondary" className="w-full justify-start" size="sm">
                <Compass className="w-4 h-4" /> Purpose
              </Button>
            </Link>
            <Link href="/canvas/challenges">
              <Button variant="secondary" className="w-full justify-start" size="sm">
                <AlertTriangle className="w-4 h-4" /> Challenges
              </Button>
            </Link>
            <Link href="/canvas/mission">
              <Button variant="secondary" className="w-full justify-start" size="sm">
                <Flag className="w-4 h-4" /> Mission
              </Button>
            </Link>
            <Link href="/canvas/action-plans">
              <Button variant="secondary" className="w-full justify-start" size="sm">
                <Rocket className="w-4 h-4" /> Action Plans
              </Button>
            </Link>
            <Link href="/canvas/procurement">
              <Button variant="secondary" className="w-full justify-start" size="sm">
                <ShoppingCart className="w-4 h-4" /> Procurement
              </Button>
            </Link>
            <Link href="/canvas/kpis">
              <Button variant="secondary" className="w-full justify-start" size="sm">
                <TrendingUp className="w-4 h-4" /> KPIs & OKRs
              </Button>
            </Link>

            <p className="text-[11px] uppercase tracking-widest font-semibold text-text-secondary mt-3 mb-1">Assessments</p>
            <Link href="/materiality">
              <Button variant="secondary" className="w-full justify-start" size="sm">
                <Target className="w-4 h-4" /> Materiality
              </Button>
            </Link>
            <Link href="/data-collection/standards">
              <Button variant="secondary" className="w-full justify-start" size="sm">
                <ClipboardCheck className="w-4 h-4" /> Audit Standards
              </Button>
            </Link>
            <Link href="/data-collection">
              <Button variant="secondary" className="w-full justify-start" size="sm">
                <Database className="w-4 h-4" /> Emissions Data
              </Button>
            </Link>
            <Link href="/strategy">
              <Button variant="secondary" className="w-full justify-start" size="sm">
                <Map className="w-4 h-4" /> Strategy Builder
              </Button>
            </Link>
            <Link href="/audit-trail">
              <Button variant="secondary" className="w-full justify-start" size="sm">
                <FileCheck className="w-4 h-4" /> Audit Trail
              </Button>
            </Link>

            <p className="text-[11px] uppercase tracking-widest font-semibold text-text-secondary mt-3 mb-1">NFRS Compliance</p>
            <Link href="/governance">
              <Button variant="secondary" className="w-full justify-start" size="sm">
                <Shield className="w-4 h-4" /> Governance
              </Button>
            </Link>
            <Link href="/scenario-analysis">
              <Button variant="secondary" className="w-full justify-start" size="sm">
                <Zap className="w-4 h-4" /> Scenarios
              </Button>
            </Link>
            <Link href="/financial-impact">
              <Button variant="secondary" className="w-full justify-start" size="sm">
                <DollarSign className="w-4 h-4" /> Financial Impact
              </Button>
            </Link>
            <Link href="/physical-risk">
              <Button variant="secondary" className="w-full justify-start" size="sm">
                <MapPin className="w-4 h-4" /> Physical Risk
              </Button>
            </Link>
            <Link href="/stakeholder-engagement">
              <Button variant="secondary" className="w-full justify-start" size="sm">
                <Users2 className="w-4 h-4" /> Stakeholders
              </Button>
            </Link>
            <Link href="/segment-strategy">
              <Button variant="secondary" className="w-full justify-start" size="sm">
                <Layers className="w-4 h-4" /> Segments
              </Button>
            </Link>
            <Link href="/comparatives">
              <Button variant="secondary" className="w-full justify-start" size="sm">
                <GitCompare className="w-4 h-4" /> Comparatives
              </Button>
            </Link>
            <Link href="/audit-export">
              <Button variant="secondary" className="w-full justify-start" size="sm">
                <Download className="w-4 h-4" /> Audit Export
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
