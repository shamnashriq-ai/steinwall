"use client";

import { useSteinwall } from "@/lib/context";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, ChevronDown, ChevronRight, Users2 } from "lucide-react";
import { useState } from "react";
import { v4 as uuid } from "uuid";
import type { StakeholderEngagementRecord, StakeholderEngagement } from "@/lib/types";
import { stakeholderGroups, engagementMethods } from "@/lib/nfrs-gap-data";

const emptyEngagement = (): StakeholderEngagement => ({
  id: uuid(), stakeholderGroup: "investors", engagementMethod: "meeting", date: "",
  participants: "", topConcerns: [], response: "", evidenceRef: "", influencedMateriality: false,
});

export default function StakeholderEngagementPage() {
  const { data, update, hydrated } = useSteinwall();
  const [expanded, setExpanded] = useState<string | null>(null);
  const [newConcern, setNewConcern] = useState("");
  const [newTopic, setNewTopic] = useState("");

  const se = data.stakeholderEngagement || {
    engagements: [], totalEngaged: 0, materialTopicsInfluenced: [],
    status: "draft" as const, updatedAt: new Date().toISOString(),
  };

  const save = (updated: StakeholderEngagementRecord) => {
    const totalEngaged = updated.engagements.length;
    update({ stakeholderEngagement: { ...updated, totalEngaged, updatedAt: new Date().toISOString() } });
  };

  if (!hydrated) return <div className="flex items-center justify-center h-64"><p className="text-text-secondary text-[14px]">Loading...</p></div>;

  const groupColors: Record<string, string> = {
    investors: "bg-blue-100 text-blue-800", customers: "bg-green-100 text-green-800",
    suppliers: "bg-amber-100 text-amber-800", employees: "bg-purple-100 text-purple-800",
    communities: "bg-pink-100 text-pink-800", regulators: "bg-red-100 text-red-800",
    ngos: "bg-teal-100 text-teal-800", other: "bg-gray-100 text-gray-800",
  };

  const groupCounts = stakeholderGroups.map((g) => ({
    ...g,
    count: se.engagements.filter((e) => e.stakeholderGroup === g.value).length,
  }));

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-[28px] text-primary">Stakeholder Engagement Record</h1>
        <p className="text-text-secondary text-[14px]">IFRS S1 — Document consultation process, feedback, and how it shaped materiality</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {groupCounts.map((g) => (
          <div key={g.value} className="border border-neutral-lighter rounded-[var(--radius-sm)] p-3 text-center">
            <p className="text-[22px] font-semibold text-primary">{g.count}</p>
            <p className="text-[12px] text-text-secondary">{g.label}</p>
          </div>
        ))}
      </div>

      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[18px] text-primary">Engagement Log</h2>
          <Button variant="primary" size="sm" onClick={() => { const e = emptyEngagement(); save({ ...se, engagements: [...se.engagements, e] }); setExpanded(e.id); }}>
            <Plus className="w-4 h-4" /> Add Engagement
          </Button>
        </div>
        <p className="text-[13px] text-text-secondary mb-4">Auditor question: "How do you know these material topics are actually material? Who did you ask? What evidence do you have?"</p>

        {se.engagements.length === 0 && (
          <div className="text-center py-8 text-text-secondary text-[14px]">No engagements recorded yet. Document how you consulted stakeholders.</div>
        )}

        {se.engagements.map((e, ei) => {
          const exp = expanded === e.id;
          const groupLabel = stakeholderGroups.find((g) => g.value === e.stakeholderGroup)?.label || e.stakeholderGroup;
          return (
            <div key={e.id} className="border border-neutral-lighter rounded-[var(--radius-sm)] mb-3">
              <button onClick={() => setExpanded(exp ? null : e.id)} className="w-full flex items-center justify-between p-4 text-left cursor-pointer">
                <div className="flex items-center gap-3">
                  <Users2 className="w-5 h-5 text-primary" />
                  <Badge className={groupColors[e.stakeholderGroup] || ""}>{groupLabel}</Badge>
                  {e.date && <span className="text-[12px] text-text-secondary">{e.date}</span>}
                  {e.topConcerns.length > 0 && <span className="text-[12px] text-text-secondary">· {e.topConcerns.length} concern(s)</span>}
                </div>
                {exp ? <ChevronDown className="w-4 h-4 text-text-secondary" /> : <ChevronRight className="w-4 h-4 text-text-secondary" />}
              </button>
              {exp && (
                <div className="px-4 pb-4 flex flex-col gap-3 border-t border-neutral-lighter pt-3">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="text-[13px] font-medium text-text-primary mb-1 block">Stakeholder Group</label>
                      <select className="w-full border border-neutral-lighter rounded-[var(--radius-sm)] px-3 py-2 text-[14px]" value={e.stakeholderGroup} onChange={(ev) => {
                        const u = [...se.engagements]; u[ei] = { ...e, stakeholderGroup: ev.target.value as StakeholderEngagement["stakeholderGroup"] }; save({ ...se, engagements: u });
                      }}>
                        {stakeholderGroups.map((g) => <option key={g.value} value={g.value}>{g.label}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-[13px] font-medium text-text-primary mb-1 block">Method</label>
                      <select className="w-full border border-neutral-lighter rounded-[var(--radius-sm)] px-3 py-2 text-[14px]" value={e.engagementMethod} onChange={(ev) => {
                        const u = [...se.engagements]; u[ei] = { ...e, engagementMethod: ev.target.value as StakeholderEngagement["engagementMethod"] }; save({ ...se, engagements: u });
                      }}>
                        {engagementMethods.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
                      </select>
                    </div>
                    <Input label="Date" type="date" value={e.date} onChange={(ev) => { const u = [...se.engagements]; u[ei] = { ...e, date: ev.target.value }; save({ ...se, engagements: u }); }} />
                  </div>

                  <Input label="Participants" placeholder="e.g. 20 institutional investors, ESG roadshow" value={e.participants} onChange={(ev) => { const u = [...se.engagements]; u[ei] = { ...e, participants: ev.target.value }; save({ ...se, engagements: u }); }} />

                  <div>
                    <label className="text-[13px] font-medium text-text-primary mb-1 block">Top Concerns Raised</label>
                    <div className="flex flex-col gap-1 mb-2">
                      {e.topConcerns.map((c, ci) => (
                        <div key={ci} className="flex items-center gap-2 text-[13px]">
                          <span className="flex-1">• {c}</span>
                          <button className="cursor-pointer text-red-400" onClick={() => { const u = [...se.engagements]; u[ei] = { ...e, topConcerns: e.topConcerns.filter((_, i) => i !== ci) }; save({ ...se, engagements: u }); }}><Trash2 className="w-3 h-3" /></button>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Input placeholder="Add concern" value={newConcern} onChange={(ev) => setNewConcern(ev.target.value)} />
                      <Button variant="secondary" size="sm" onClick={() => { if (newConcern.trim()) { const u = [...se.engagements]; u[ei] = { ...e, topConcerns: [...e.topConcerns, newConcern.trim()] }; save({ ...se, engagements: u }); setNewConcern(""); } }}>Add</Button>
                    </div>
                  </div>

                  <div>
                    <label className="text-[13px] font-medium text-text-primary mb-1 block">Company Response</label>
                    <textarea className="w-full border border-neutral-lighter rounded-[var(--radius-sm)] px-3 py-2 text-[14px] min-h-[60px]" placeholder="How did the company respond to these concerns?" value={e.response} onChange={(ev) => { const u = [...se.engagements]; u[ei] = { ...e, response: ev.target.value }; save({ ...se, engagements: u }); }} />
                  </div>

                  <Input label="Evidence Reference" placeholder="e.g. Workshop notes file, survey results PDF" value={e.evidenceRef} onChange={(ev) => { const u = [...se.engagements]; u[ei] = { ...e, evidenceRef: ev.target.value }; save({ ...se, engagements: u }); }} />

                  <label className="flex items-center gap-2 text-[13px] cursor-pointer">
                    <input type="checkbox" checked={e.influencedMateriality} onChange={(ev) => { const u = [...se.engagements]; u[ei] = { ...e, influencedMateriality: ev.target.checked }; save({ ...se, engagements: u }); }} />
                    This engagement influenced the materiality assessment
                  </label>

                  <Button variant="ghost" size="sm" className="self-end text-red-500" onClick={() => save({ ...se, engagements: se.engagements.filter((_, i) => i !== ei) })}>
                    <Trash2 className="w-4 h-4" /> Remove
                  </Button>
                </div>
              )}
            </div>
          );
        })}
      </Card>

      <Card className="mt-6">
        <h2 className="text-[18px] text-primary mb-4">Material Topics Influenced</h2>
        <p className="text-[13px] text-text-secondary mb-3">Which material topics were shaped by stakeholder feedback?</p>
        <div className="flex gap-2 flex-wrap mb-3">
          {se.materialTopicsInfluenced.map((t, i) => (
            <Badge key={i} variant="info" className="flex items-center gap-1">
              {t}
              <button className="cursor-pointer" onClick={() => save({ ...se, materialTopicsInfluenced: se.materialTopicsInfluenced.filter((_, j) => j !== i) })}><Trash2 className="w-3 h-3" /></button>
            </Badge>
          ))}
        </div>
        <div className="flex gap-2">
          <Input placeholder="e.g. Scope 3 supplier emissions" value={newTopic} onChange={(e) => setNewTopic(e.target.value)} />
          <Button variant="secondary" size="sm" onClick={() => { if (newTopic.trim()) { save({ ...se, materialTopicsInfluenced: [...se.materialTopicsInfluenced, newTopic.trim()] }); setNewTopic(""); } }}>Add</Button>
        </div>

        <div className="flex justify-end mt-4">
          <Button variant="primary" onClick={() => save({ ...se, status: "complete" })}>Save Stakeholder Record</Button>
        </div>
      </Card>
    </div>
  );
}
