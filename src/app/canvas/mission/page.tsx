"use client";

import { useSteinwall } from "@/lib/context";
import { Card, AlertCard } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useState, useCallback } from "react";
import { scope3Categories, type MissionCanvas } from "@/lib/types";
import { ArrowRight, ArrowLeft, CheckCircle, Plus, X } from "lucide-react";
import Link from "next/link";

const sbtOptions = [
  "SBTi Net Zero 2050 (1.5°C pathway)",
  "SBTi 1.5°C (interim + final targets aligned)",
  "Internal target (not externally validated, but defensible)",
  "Regulatory requirement (carbon tax, ETS compliance baseline)",
];

const methodologyOptions = [
  "Absolute reduction",
  "Intensity reduction (per unit output)",
  "Carbon neutrality via offsets (reduce + offset)",
  "Hybrid approach",
];

const supplierOptions = [
  "Require suppliers to set science-based targets",
  "Shift to renewable-energy-powered suppliers",
  "Phase out high-emission suppliers",
  "Provide financing/support for supplier decarbonization",
];

export default function MissionPage() {
  const { data, update, hydrated } = useSteinwall();
  const existing = data.strategicCanvas?.mission;

  const [mission, setMission] = useState(existing?.missionStatement || "");
  const [scope1, setScope1] = useState(existing?.scope1 || { included: true, target2030: "", target2050: "", baseline: "", baselineYear: "" });
  const [scope2, setScope2] = useState(existing?.scope2 || { included: true, target2030: "", target2050: "", baseline: "", baselineYear: "", methodology: "market" as const });
  const [scope3, setScope3] = useState(existing?.scope3 || { included: true, target2030: "", target2050: "", baseline: "", baselineYear: "", categories: [] as string[] });
  const [sbt, setSbt] = useState(existing?.sbtAlignment || "");
  const [methodology, setMethodology] = useState(existing?.targetMethodology || "");
  const [interim, setInterim] = useState(existing?.interimMilestone || "");
  const [supplierCommits, setSupplierCommits] = useState<string[]>(existing?.supplierCommitments || []);
  const [boardDate, setBoardDate] = useState(existing?.boardApproval?.date || "");
  const [boardAttendees, setBoardAttendees] = useState(existing?.boardApproval?.attendees || "");
  const [boardApproved, setBoardApproved] = useState(existing?.boardApproval?.approved || false);
  const [publicCommitment, setPublicCommitment] = useState(existing?.boardApproval?.publicCommitment || false);

  const save = useCallback(() => {
    const canvas: MissionCanvas = {
      missionStatement: mission,
      scope1,
      scope2,
      scope3,
      sbtAlignment: sbt,
      targetMethodology: methodology,
      interimMilestone: interim,
      supplierCommitments: supplierCommits,
      boardApproval: boardDate ? { date: boardDate, attendees: boardAttendees, approved: boardApproved, publicCommitment } : undefined,
      status: boardApproved ? "board_approved" : mission ? "complete" : "draft",
      updatedAt: new Date().toISOString(),
    };
    update({
      strategicCanvas: { ...data.strategicCanvas, mission: canvas },
    });
  }, [mission, scope1, scope2, scope3, sbt, methodology, interim, supplierCommits, boardDate, boardAttendees, boardApproved, publicCommitment, data.strategicCanvas, update]);

  if (!hydrated) {
    return <div className="flex items-center justify-center h-64"><p className="text-text-secondary">Loading...</p></div>;
  }

  const toggleS3Cat = (cat: string) => {
    setScope3((prev) => ({
      ...prev,
      categories: prev.categories.includes(cat) ? prev.categories.filter((c) => c !== cat) : [...prev.categories, cat],
    }));
  };

  const toggleSupplier = (commit: string) => {
    setSupplierCommits((prev) =>
      prev.includes(commit) ? prev.filter((c) => c !== commit) : [...prev, commit]
    );
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <p className="text-[13px] text-text-secondary mb-1">Strategic Planning Canvas — Layer 3 of 6</p>
        <h1 className="text-[24px] text-primary">Mission</h1>
        <p className="text-[14px] text-text-secondary">Define the commitment — specific, measurable, science-aligned</p>
      </div>

      <AlertCard variant="info" className="mb-6">
        <p className="text-[14px] text-primary">
          &ldquo;Net-zero by 2050&rdquo; is not a mission. A real mission specifies what (scopes), how much (% reduction),
          by when (interim milestones), and how (methodology).
        </p>
      </AlertCard>

      <div className="flex flex-col gap-6">
        <Card>
          <h2 className="text-[18px] text-primary mb-4">Mission Statement</h2>
          <Textarea
            placeholder="[Company] commits to [specific, measurable] emissions reduction in Scope [1/2/3] by [year], aligned with [methodology]."
            value={mission}
            onChange={(e) => setMission(e.target.value)}
            rows={4}
          />
          <p className="text-[12px] text-text-secondary mt-2">
            Example: &ldquo;Petronas commits to 45% Scope 1+2 emissions reduction by 2030 (vs. 2020 baseline),
            and 20% Scope 3 intensity reduction through supplier engagement, aligned with 1.5°C pathway (SBTi Net Zero 2050).&rdquo;
          </p>
        </Card>

        {/* Scope 1 */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[18px] text-primary">Scope 1 — Direct Operations</h2>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={scope1.included} onChange={(e) => setScope1({ ...scope1, included: e.target.checked })} className="w-4 h-4 accent-primary" />
              <span className="text-[13px] text-text-secondary">Include in commitment</span>
            </label>
          </div>
          {scope1.included && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Baseline Year" placeholder="e.g. 2024" value={scope1.baselineYear} onChange={(e) => setScope1({ ...scope1, baselineYear: e.target.value })} />
              <Input label="Baseline Emissions (tCO2e)" placeholder="e.g. 50000" value={scope1.baseline} onChange={(e) => setScope1({ ...scope1, baseline: e.target.value })} />
              <Input label="2030 Target (% reduction)" placeholder="e.g. 45%" value={scope1.target2030} onChange={(e) => setScope1({ ...scope1, target2030: e.target.value })} />
              <Input label="2050 Target (% reduction)" placeholder="e.g. 100%" value={scope1.target2050} onChange={(e) => setScope1({ ...scope1, target2050: e.target.value })} />
            </div>
          )}
        </Card>

        {/* Scope 2 */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[18px] text-primary">Scope 2 — Energy</h2>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={scope2.included} onChange={(e) => setScope2({ ...scope2, included: e.target.checked })} className="w-4 h-4 accent-primary" />
              <span className="text-[13px] text-text-secondary">Include in commitment</span>
            </label>
          </div>
          {scope2.included && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <Input label="Baseline Year" placeholder="e.g. 2024" value={scope2.baselineYear} onChange={(e) => setScope2({ ...scope2, baselineYear: e.target.value })} />
                <Input label="Baseline Emissions (tCO2e)" placeholder="e.g. 30000" value={scope2.baseline} onChange={(e) => setScope2({ ...scope2, baseline: e.target.value })} />
                <Input label="2030 Target (% reduction)" placeholder="e.g. 60%" value={scope2.target2030} onChange={(e) => setScope2({ ...scope2, target2030: e.target.value })} />
                <Input label="2050 Target (% reduction)" placeholder="e.g. 100%" value={scope2.target2050} onChange={(e) => setScope2({ ...scope2, target2050: e.target.value })} />
              </div>
              <div className="flex gap-3">
                <span className="text-[13px] text-text-secondary">Methodology:</span>
                {(["location", "market"] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => setScope2({ ...scope2, methodology: m })}
                    className={`px-3 py-1 rounded-full text-[12px] font-medium capitalize cursor-pointer transition-colors ${
                      scope2.methodology === m ? "bg-primary-light text-primary" : "text-text-secondary hover:bg-neutral-light"
                    }`}
                  >
                    {m}-based
                  </button>
                ))}
              </div>
            </>
          )}
        </Card>

        {/* Scope 3 */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[18px] text-primary">Scope 3 — Value Chain</h2>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={scope3.included} onChange={(e) => setScope3({ ...scope3, included: e.target.checked })} className="w-4 h-4 accent-primary" />
              <span className="text-[13px] text-text-secondary">Include in commitment</span>
            </label>
          </div>
          {scope3.included && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <Input label="Baseline Year" placeholder="e.g. 2024" value={scope3.baselineYear} onChange={(e) => setScope3({ ...scope3, baselineYear: e.target.value })} />
                <Input label="Baseline Emissions (tCO2e)" placeholder="e.g. 200000" value={scope3.baseline} onChange={(e) => setScope3({ ...scope3, baseline: e.target.value })} />
                <Input label="2030 Target (% reduction)" placeholder="e.g. 25%" value={scope3.target2030} onChange={(e) => setScope3({ ...scope3, target2030: e.target.value })} />
                <Input label="2050 Target (% reduction)" placeholder="e.g. 90%" value={scope3.target2050} onChange={(e) => setScope3({ ...scope3, target2050: e.target.value })} />
              </div>
              <p className="text-[13px] font-medium text-text-primary mb-2">Material Categories (select based on Layer 2):</p>
              <div className="flex flex-wrap gap-2 mb-4">
                {scope3Categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => toggleS3Cat(cat)}
                    className={`px-3 py-1.5 rounded-full text-[11px] font-medium cursor-pointer transition-colors ${
                      scope3.categories.includes(cat)
                        ? "bg-primary-light text-primary border border-primary"
                        : "bg-neutral-light text-text-secondary border border-transparent hover:border-neutral-lighter"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </>
          )}
        </Card>

        <Card>
          <h2 className="text-[18px] text-primary mb-4">Science-Based Target Alignment</h2>
          <div className="flex flex-col gap-2 mb-6">
            {sbtOptions.map((opt) => (
              <button
                key={opt}
                onClick={() => setSbt(opt)}
                className={`text-left px-4 py-3 rounded-[var(--radius-sm)] border text-[14px] font-medium cursor-pointer transition-colors ${
                  sbt === opt ? "border-primary bg-primary-light text-primary" : "border-neutral-lighter text-text-primary hover:border-primary/40"
                }`}
              >
                {opt}
              </button>
            ))}
          </div>

          <h2 className="text-[18px] text-primary mb-4">Target Methodology</h2>
          <div className="flex flex-col gap-2 mb-6">
            {methodologyOptions.map((opt) => (
              <button
                key={opt}
                onClick={() => setMethodology(opt)}
                className={`text-left px-4 py-3 rounded-[var(--radius-sm)] border text-[14px] font-medium cursor-pointer transition-colors ${
                  methodology === opt ? "border-primary bg-primary-light text-primary" : "border-neutral-lighter text-text-primary hover:border-primary/40"
                }`}
              >
                {opt}
              </button>
            ))}
          </div>

          <Input
            label="Interim Milestone"
            placeholder="e.g. We will achieve 25% reduction by 2028"
            value={interim}
            onChange={(e) => setInterim(e.target.value)}
          />
        </Card>

        {scope3.included && (
          <Card>
            <h2 className="text-[18px] text-primary mb-4">Supplier Commitments</h2>
            <div className="flex flex-col gap-2">
              {supplierOptions.map((opt) => (
                <label key={opt} className="flex items-center gap-3 cursor-pointer py-2">
                  <input
                    type="checkbox"
                    checked={supplierCommits.includes(opt)}
                    onChange={() => toggleSupplier(opt)}
                    className="w-4 h-4 accent-primary"
                  />
                  <span className="text-[14px] text-text-primary">{opt}</span>
                </label>
              ))}
            </div>
          </Card>
        )}

        <Card>
          <h2 className="text-[18px] text-primary mb-4">Board Approval & Stakeholder Communication</h2>
          <div className="flex flex-col gap-4">
            <Input label="Board Meeting Date" type="date" value={boardDate} onChange={(e) => setBoardDate(e.target.value)} />
            <Textarea label="Attendees" placeholder="Names and titles" value={boardAttendees} onChange={(e) => setBoardAttendees(e.target.value)} />
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={boardApproved} onChange={(e) => setBoardApproved(e.target.checked)} className="w-5 h-5 accent-primary" />
              <span className="text-[14px] font-medium text-text-primary">Board approved this Mission</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={publicCommitment} onChange={(e) => setPublicCommitment(e.target.checked)} className="w-4 h-4 accent-primary" />
              <span className="text-[14px] text-text-primary">This is a public commitment</span>
            </label>
          </div>
        </Card>

        {/* Visual summary */}
        {mission && (
          <Card>
            <h2 className="text-[18px] text-primary mb-4">Mission Summary</h2>
            <div className="bg-primary-light rounded-[var(--radius-md)] p-6 text-center mb-4">
              <p className="text-[16px] font-medium text-primary italic">&ldquo;{mission}&rdquo;</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {scope1.included && (
                <div className="bg-error-light rounded-[var(--radius-sm)] p-4 text-center">
                  <p className="text-[12px] text-error font-medium mb-1">Scope 1</p>
                  <p className="text-[18px] font-[family-name:var(--font-display)] font-semibold text-error">{scope1.target2030 || "—"}</p>
                  <p className="text-[11px] text-error/70">by 2030</p>
                </div>
              )}
              {scope2.included && (
                <div className="bg-primary-light rounded-[var(--radius-sm)] p-4 text-center">
                  <p className="text-[12px] text-primary font-medium mb-1">Scope 2</p>
                  <p className="text-[18px] font-[family-name:var(--font-display)] font-semibold text-primary">{scope2.target2030 || "—"}</p>
                  <p className="text-[11px] text-primary/70">by 2030</p>
                </div>
              )}
              {scope3.included && (
                <div className="bg-success-light rounded-[var(--radius-sm)] p-4 text-center">
                  <p className="text-[12px] text-success font-medium mb-1">Scope 3</p>
                  <p className="text-[18px] font-[family-name:var(--font-display)] font-semibold text-success">{scope3.target2030 || "—"}</p>
                  <p className="text-[11px] text-success/70">by 2030</p>
                </div>
              )}
            </div>
            {sbt && (
              <div className="mt-4 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-success" />
                <span className="text-[13px] text-text-primary">{sbt}</span>
              </div>
            )}
          </Card>
        )}

        <div className="flex justify-between">
          <Link href="/canvas/challenges">
            <Button variant="ghost"><ArrowLeft className="w-4 h-4" /> Previous: Challenges</Button>
          </Link>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={save}>Save Draft</Button>
            <Link href="/canvas/action-plans">
              <Button variant="primary" onClick={save}>
                Next: Action Plans <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
