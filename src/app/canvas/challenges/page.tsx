"use client";

import { useSteinwall } from "@/lib/context";
import { Card, AlertCard } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Textarea, Select } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useState, useCallback } from "react";
import { v4 as uuid } from "uuid";
import type { ChallengesCanvas, ChallengeItem } from "@/lib/types";
import { ArrowRight, ArrowLeft, Plus, X, AlertTriangle } from "lucide-react";
import Link from "next/link";

const categoryLabels: Record<ChallengeItem["category"], string> = {
  operational: "Operational Realities",
  market: "Market Constraints",
  organizational: "Organizational Barriers",
  external: "External Pressures",
};

const categoryColors: Record<ChallengeItem["category"], string> = {
  operational: "text-error",
  market: "text-primary",
  organizational: "text-warning",
  external: "text-success",
};

const severityBadge: Record<ChallengeItem["severity"], "error" | "warning" | "neutral"> = {
  high: "error",
  medium: "warning",
  low: "neutral",
};

const defaultBarriers: Record<ChallengeItem["category"], string[]> = {
  operational: [
    "High capex to retrofit/replace",
    "No available alternatives",
    "Supplier dependency (landlord controls systems)",
    "Performance risk (can't compromise quality)",
    "Regulatory/safety compliance conflict",
  ],
  market: [
    "Competitors decarbonizing faster",
    "Customers price-sensitive, won't pay premium",
    "Dependent on few suppliers, locked in",
    "Decarbonization is table stakes, not differentiator",
  ],
  organizational: [
    "No in-house sustainability expertise",
    "Finance team doesn't understand carbon risk",
    "Operations sees this as a distraction",
    "No data infrastructure to measure/track",
    "Insufficient capex budget",
  ],
  external: [
    "Carbon tax incoming (2026)",
    "ETS timeline (2027-2028)",
    "NFRS compliance deadline",
    "Investors pushing ESG mandates",
    "Customers specifying decarbonization requirements",
  ],
};

export default function ChallengesPage() {
  const { data, update, hydrated } = useSteinwall();
  const existing = data.strategicCanvas?.challenges;

  const [challenges, setChallenges] = useState<ChallengeItem[]>(existing?.challenges || []);
  const [capexRange, setCapexRange] = useState(existing?.capexRange || "");
  const [externalFinancing, setExternalFinancing] = useState(existing?.externalFinancing || "");
  const [leadershipDriver, setLeadershipDriver] = useState(existing?.leadershipDriver || "");
  const [addingCategory, setAddingCategory] = useState<ChallengeItem["category"] | "">("");

  const save = useCallback(() => {
    const canvas: ChallengesCanvas = {
      challenges,
      capexRange,
      externalFinancing,
      leadershipDriver,
      status: challenges.length >= 3 ? "complete" : "draft",
      updatedAt: new Date().toISOString(),
    };
    update({
      strategicCanvas: { ...data.strategicCanvas, challenges: canvas },
    });
  }, [challenges, capexRange, externalFinancing, leadershipDriver, data.strategicCanvas, update]);

  if (!hydrated) {
    return <div className="flex items-center justify-center h-64"><p className="text-text-secondary">Loading...</p></div>;
  }

  const addChallenge = (category: ChallengeItem["category"]) => {
    setChallenges([
      ...challenges,
      { id: uuid(), category, description: "", barriers: [], severity: "medium" },
    ]);
    setAddingCategory("");
  };

  const updateChallenge = (id: string, partial: Partial<ChallengeItem>) => {
    setChallenges((prev) => prev.map((c) => (c.id === id ? { ...c, ...partial } : c)));
  };

  const removeChallenge = (id: string) => {
    setChallenges((prev) => prev.filter((c) => c.id !== id));
  };

  const toggleBarrier = (challengeId: string, barrier: string) => {
    setChallenges((prev) =>
      prev.map((c) => {
        if (c.id !== challengeId) return c;
        const has = c.barriers.includes(barrier);
        return { ...c, barriers: has ? c.barriers.filter((b) => b !== barrier) : [...c.barriers, barrier] };
      })
    );
  };

  const grouped = {
    operational: challenges.filter((c) => c.category === "operational"),
    market: challenges.filter((c) => c.category === "market"),
    organizational: challenges.filter((c) => c.category === "organizational"),
    external: challenges.filter((c) => c.category === "external"),
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <p className="text-[13px] text-text-secondary mb-1">Strategic Planning Canvas — Layer 2 of 6</p>
        <h1 className="text-[24px] text-primary">Challenges</h1>
        <p className="text-[14px] text-text-secondary">What makes decarbonization hard for your company specifically</p>
      </div>

      <AlertCard variant="info" className="mb-6">
        <p className="text-[14px] text-primary">
          This isn&apos;t pessimism — it&apos;s realism. Strategy that ignores constraints is fantasy.
          A company that acknowledges &ldquo;we have zero power to move our suppliers&rdquo; will make different, better decisions.
        </p>
      </AlertCard>

      <div className="flex flex-col gap-6">
        {(Object.keys(categoryLabels) as ChallengeItem["category"][]).map((cat) => (
          <Card key={cat}>
            <div className="flex items-center justify-between mb-4">
              <h2 className={`text-[18px] ${categoryColors[cat]}`}>{categoryLabels[cat]}</h2>
              <Badge variant="neutral">{grouped[cat].length} challenge{grouped[cat].length !== 1 ? "s" : ""}</Badge>
            </div>

            {grouped[cat].map((challenge) => (
              <div key={challenge.id} className="border border-neutral-lighter rounded-[var(--radius-sm)] p-4 mb-3">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <Textarea
                    placeholder={`Describe the ${categoryLabels[cat].toLowerCase()} challenge...`}
                    value={challenge.description}
                    onChange={(e) => updateChallenge(challenge.id, { description: e.target.value })}
                    rows={2}
                  />
                  <button onClick={() => removeChallenge(challenge.id)} className="text-text-secondary hover:text-error cursor-pointer shrink-0 mt-1">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="mb-3">
                  <p className="text-[13px] font-medium text-text-secondary mb-2">Barriers (select all that apply):</p>
                  <div className="flex flex-wrap gap-2">
                    {defaultBarriers[cat].map((barrier) => (
                      <button
                        key={barrier}
                        onClick={() => toggleBarrier(challenge.id, barrier)}
                        className={`px-3 py-1.5 rounded-full text-[12px] font-medium cursor-pointer transition-colors ${
                          challenge.barriers.includes(barrier)
                            ? "bg-primary-light text-primary border border-primary"
                            : "bg-neutral-light text-text-secondary border border-transparent hover:border-neutral-lighter"
                        }`}
                      >
                        {barrier}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-[13px] text-text-secondary">Severity:</span>
                  {(["high", "medium", "low"] as const).map((sev) => (
                    <button
                      key={sev}
                      onClick={() => updateChallenge(challenge.id, { severity: sev })}
                      className={`px-3 py-1 rounded-full text-[12px] font-medium capitalize cursor-pointer transition-colors ${
                        challenge.severity === sev
                          ? sev === "high" ? "bg-error-light text-error" : sev === "medium" ? "bg-warning-light text-warning" : "bg-neutral-light text-neutral"
                          : "text-text-secondary hover:bg-neutral-light"
                      }`}
                    >
                      {sev}
                    </button>
                  ))}
                </div>
              </div>
            ))}

            <button
              onClick={() => addChallenge(cat)}
              className="flex items-center gap-2 text-[13px] text-primary font-medium cursor-pointer hover:underline"
            >
              <Plus className="w-4 h-4" /> Add {categoryLabels[cat].toLowerCase()} challenge
            </button>
          </Card>
        ))}

        <Card>
          <h2 className="text-[18px] text-primary mb-4">Financial Constraints</h2>
          <div className="flex flex-col gap-4">
            <Select
              label="Available capex for decarbonization"
              options={[
                { value: "under_10m", label: "Under RM10M/year (tight)" },
                { value: "10m_50m", label: "RM10-50M/year (moderate)" },
                { value: "over_50m", label: "Over RM50M/year (flexible)" },
              ]}
              value={capexRange}
              onChange={(e) => setCapexRange(e.target.value)}
            />
            <Select
              label="Can you finance externally (green bonds, sustainability-linked loans)?"
              options={[
                { value: "yes", label: "Yes, we have strong credit" },
                { value: "probably", label: "Probably, with some effort" },
                { value: "unlikely", label: "Unlikely, already leveraged" },
              ]}
              value={externalFinancing}
              onChange={(e) => setExternalFinancing(e.target.value)}
            />
            <Input
              label="Who in leadership drives this?"
              placeholder="e.g. CEO, CFO, Sustainability Officer"
              value={leadershipDriver}
              onChange={(e) => setLeadershipDriver(e.target.value)}
            />
          </div>
        </Card>

        {challenges.length > 0 && (
          <Card>
            <h2 className="text-[18px] text-primary mb-4">Challenge Prioritization</h2>
            <div className="flex flex-col gap-2">
              {challenges
                .sort((a, b) => {
                  const order = { high: 0, medium: 1, low: 2 };
                  return order[a.severity] - order[b.severity];
                })
                .map((c, i) => (
                  <div key={c.id} className="flex items-center gap-3 py-2 px-3 bg-neutral-light rounded-[var(--radius-sm)]">
                    <span className="text-[13px] font-medium text-text-secondary w-6">{i + 1}.</span>
                    <span className="flex-1 text-[14px] text-text-primary">{c.description || "(No description)"}</span>
                    <Badge variant={severityBadge[c.severity]}>{c.severity}</Badge>
                    <Badge variant="neutral">{categoryLabels[c.category]}</Badge>
                  </div>
                ))}
            </div>
          </Card>
        )}

        <div className="flex justify-between">
          <Link href="/canvas/purpose">
            <Button variant="ghost"><ArrowLeft className="w-4 h-4" /> Previous: Purpose</Button>
          </Link>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={save}>Save Draft</Button>
            <Link href="/canvas/mission">
              <Button variant="primary" onClick={save}>
                Next: Mission <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
