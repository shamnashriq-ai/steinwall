"use client";

import { useSteinwall } from "@/lib/context";
import { Card, AlertCard } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useState, useCallback } from "react";
import { defaultPurposeDrivers, type PurposeCanvas } from "@/lib/types";
import { ArrowRight, CheckCircle, GripVertical, Plus, X } from "lucide-react";
import Link from "next/link";

export default function PurposePage() {
  const { data, update, hydrated } = useSteinwall();
  const existing = data.strategicCanvas?.purpose;

  const [vision, setVision] = useState(existing?.visionStatement || "");
  const [drivers, setDrivers] = useState(existing?.drivers || defaultPurposeDrivers);
  const [impactType, setImpactType] = useState<"opportunity" | "risk" | "both">(existing?.financialImpact?.type || "both");
  const [revenue, setRevenue] = useState(existing?.financialImpact?.revenue || "");
  const [costs, setCosts] = useState(existing?.financialImpact?.costs || "");
  const [capitalAccess, setCapitalAccess] = useState(existing?.financialImpact?.capitalAccess || "");
  const [anchors, setAnchors] = useState<string[]>(existing?.strategicAnchors || [""]);
  const [boardDate, setBoardDate] = useState(existing?.boardApproval?.date || "");
  const [boardAttendees, setBoardAttendees] = useState(existing?.boardApproval?.attendees || "");
  const [boardApproved, setBoardApproved] = useState(existing?.boardApproval?.approved || false);

  const save = useCallback(() => {
    const canvas: PurposeCanvas = {
      visionStatement: vision,
      drivers,
      financialImpact: { type: impactType, revenue, costs, capitalAccess },
      strategicAnchors: anchors.filter(Boolean),
      boardApproval: boardDate ? { date: boardDate, attendees: boardAttendees, approved: boardApproved } : undefined,
      status: boardApproved ? "board_approved" : vision ? "complete" : "draft",
      updatedAt: new Date().toISOString(),
    };
    update({
      strategicCanvas: { ...data.strategicCanvas, purpose: canvas },
    });
  }, [vision, drivers, impactType, revenue, costs, capitalAccess, anchors, boardDate, boardAttendees, boardApproved, data.strategicCanvas, update]);

  if (!hydrated) {
    return <div className="flex items-center justify-center h-64"><p className="text-text-secondary">Loading...</p></div>;
  }

  const selectedDrivers = drivers.filter((d) => d.selected).sort((a, b) => a.rank - b.rank);

  const toggleDriver = (id: string) => {
    setDrivers((prev) =>
      prev.map((d) =>
        d.id === id ? { ...d, selected: !d.selected, rank: d.selected ? 0 : prev.filter((x) => x.selected).length + 1 } : d
      )
    );
  };

  const driverColors: Record<string, string> = {
    d1: "bg-error-light text-error",
    d2: "bg-success-light text-success",
    d3: "bg-error-light text-error",
    d4: "bg-warning-light text-warning",
    d5: "bg-success-light text-success",
    d6: "bg-primary-light text-primary",
    d7: "bg-success-light text-success",
    d8: "bg-primary-light text-primary",
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-[13px] text-text-secondary mb-1">Strategic Planning Canvas — Layer 1 of 6</p>
          <h1 className="text-[24px] text-primary">Purpose</h1>
          <p className="text-[14px] text-text-secondary">Why decarbonization matters to your company specifically</p>
        </div>
        {existing?.status === "board_approved" && <Badge variant="success">Board Approved</Badge>}
      </div>

      <div className="flex flex-col gap-6">
        <Card>
          <h2 className="text-[18px] text-primary mb-4">Vision Statement</h2>
          <p className="text-[14px] text-text-secondary mb-4">
            Describe where your company will be in 2050. Be specific — not aspirational platitudes.
          </p>
          <Textarea
            label="Vision"
            placeholder="In 2050, we will be a [industry] leader with zero emissions from our operations, 100% of suppliers aligned with 1.5°C pathway..."
            value={vision}
            onChange={(e) => setVision(e.target.value)}
            rows={4}
          />
        </Card>

        <Card>
          <h2 className="text-[18px] text-primary mb-4">Purpose Drivers</h2>
          <p className="text-[14px] text-text-secondary mb-4">
            Select all that apply. These are ranked by the order you select them — first selected = highest priority.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {drivers.map((driver) => (
              <button
                key={driver.id}
                onClick={() => toggleDriver(driver.id)}
                className={`flex items-center gap-3 px-4 py-3 rounded-[var(--radius-sm)] border text-left text-[14px] font-medium transition-colors cursor-pointer ${
                  driver.selected
                    ? "border-primary bg-primary-light text-primary"
                    : "border-neutral-lighter text-text-primary hover:border-primary/40"
                }`}
              >
                {driver.selected && (
                  <span className="w-5 h-5 bg-primary text-white rounded-full flex items-center justify-center text-[11px] font-semibold shrink-0">
                    {driver.rank}
                  </span>
                )}
                <span className="flex-1">{driver.label}</span>
                {driver.selected && (
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${driverColors[driver.id] || "bg-neutral-light text-neutral"}`}>
                    {["d1", "d3"].includes(driver.id) ? "Risk" : ["d2", "d5", "d7"].includes(driver.id) ? "Opportunity" : "Values"}
                  </span>
                )}
              </button>
            ))}
          </div>
          {selectedDrivers.length > 0 && (
            <div className="mt-4 pt-4 border-t border-neutral-lighter">
              <p className="text-[13px] font-medium text-text-primary mb-2">Priority Order:</p>
              <div className="flex flex-wrap gap-2">
                {selectedDrivers.map((d, i) => (
                  <Badge key={d.id} variant="info">{i + 1}. {d.label}</Badge>
                ))}
              </div>
            </div>
          )}
        </Card>

        <Card>
          <h2 className="text-[18px] text-primary mb-4">Financial Impact Assessment</h2>
          <p className="text-[14px] text-text-secondary mb-4">
            How will decarbonization impact your business financially?
          </p>
          <div className="flex gap-3 mb-4">
            {(["opportunity", "risk", "both"] as const).map((type) => (
              <button
                key={type}
                onClick={() => setImpactType(type)}
                className={`px-4 py-2 rounded-[var(--radius-sm)] border text-[13px] font-medium capitalize cursor-pointer transition-colors ${
                  impactType === type
                    ? "border-primary bg-primary-light text-primary"
                    : "border-neutral-lighter text-text-secondary hover:border-primary/40"
                }`}
              >
                {type}
              </button>
            ))}
          </div>
          <div className="flex flex-col gap-4">
            <Textarea
              label="Revenue Impact"
              placeholder="New green markets? Lost markets from stranded assets?"
              value={revenue}
              onChange={(e) => setRevenue(e.target.value)}
              rows={2}
            />
            <Textarea
              label="Cost Impact"
              placeholder="Upfront capex? Long-term savings?"
              value={costs}
              onChange={(e) => setCosts(e.target.value)}
              rows={2}
            />
            <Textarea
              label="Access to Capital"
              placeholder="Green financing benefits? Carbon pricing costs?"
              value={capitalAccess}
              onChange={(e) => setCapitalAccess(e.target.value)}
              rows={2}
            />
          </div>
        </Card>

        <Card>
          <h2 className="text-[18px] text-primary mb-4">Strategic Anchors</h2>
          <p className="text-[14px] text-text-secondary mb-4">
            What won&apos;t change? Regardless of decarbonization, what does your company commit to?
          </p>
          <div className="flex flex-col gap-3">
            {anchors.map((anchor, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <Input
                  placeholder={`e.g. "Maintaining profitability", "No capex above RM100M per initiative"`}
                  value={anchor}
                  onChange={(e) => {
                    const next = [...anchors];
                    next[idx] = e.target.value;
                    setAnchors(next);
                  }}
                />
                {anchors.length > 1 && (
                  <button
                    onClick={() => setAnchors(anchors.filter((_, i) => i !== idx))}
                    className="text-text-secondary hover:text-error cursor-pointer shrink-0"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
            <button
              onClick={() => setAnchors([...anchors, ""])}
              className="flex items-center gap-2 text-[13px] text-primary font-medium cursor-pointer hover:underline self-start"
            >
              <Plus className="w-4 h-4" /> Add anchor
            </button>
          </div>
        </Card>

        <Card>
          <h2 className="text-[18px] text-primary mb-4">Board Approval</h2>
          <p className="text-[14px] text-text-secondary mb-4">
            Log board meeting details to capture approval for the audit trail.
          </p>
          <div className="flex flex-col gap-4">
            <Input label="Board Meeting Date" type="date" value={boardDate} onChange={(e) => setBoardDate(e.target.value)} />
            <Textarea label="Attendees" placeholder="Names and titles of board members present" value={boardAttendees} onChange={(e) => setBoardAttendees(e.target.value)} />
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={boardApproved} onChange={(e) => setBoardApproved(e.target.checked)} className="w-5 h-5 accent-primary" />
              <span className="text-[14px] font-medium text-text-primary">Board approved this Purpose Canvas</span>
            </label>
          </div>
        </Card>

        <div className="flex justify-between">
          <Button variant="secondary" onClick={save}>Save Draft</Button>
          <Link href="/canvas/challenges">
            <Button variant="primary" onClick={save}>
              Next: Challenges <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
