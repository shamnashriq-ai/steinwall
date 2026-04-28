"use client";

import { useSteinwall } from "@/lib/context";
import { Card, AlertCard } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useState, useCallback } from "react";
import { v4 as uuid } from "uuid";
import type { ProcurementCanvas, ProcurementCategory } from "@/lib/types";
import { ArrowRight, ArrowLeft, Plus, X, ChevronDown, ChevronRight } from "lucide-react";
import Link from "next/link";

const defaultCriteria = [
  "Science-based emissions targets (or commitment to set by target year)",
  "Annual emissions disclosure",
  "Energy efficiency certification (ISO 50001 or equivalent)",
  "Renewable energy usage above threshold (or commitment by target year)",
  "Low-carbon material sourcing where available",
];

const suggestedCategories = [
  { name: "Fleet Vehicles", placeholder: "Vehicles, fuel types, annual spend..." },
  { name: "Energy & Utilities", placeholder: "Electricity, gas, steam sources..." },
  { name: "Supply Chain / Procurement", placeholder: "Supplier base, top suppliers..." },
  { name: "Products & Services", placeholder: "Packaging, raw materials, outsourced manufacturing..." },
];

export default function ProcurementPage() {
  const { data, update, hydrated } = useSteinwall();
  const existing = data.strategicCanvas?.procurement;

  const [categories, setCategories] = useState<ProcurementCategory[]>(existing?.categories || []);
  const [greenPolicy, setGreenPolicy] = useState(existing?.greenPolicy || "");
  const [criteria, setCriteria] = useState<string[]>(existing?.supplierCriteria || []);
  const [annualBudget, setAnnualBudget] = useState(existing?.annualBudget || "");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const save = useCallback(() => {
    const canvas: ProcurementCanvas = {
      categories,
      greenPolicy,
      supplierCriteria: criteria,
      annualBudget,
      status: categories.length >= 1 && greenPolicy ? "complete" : "draft",
      updatedAt: new Date().toISOString(),
    };
    update({
      strategicCanvas: { ...data.strategicCanvas, procurement: canvas },
    });
  }, [categories, greenPolicy, criteria, annualBudget, data.strategicCanvas, update]);

  if (!hydrated) {
    return <div className="flex items-center justify-center h-64"><p className="text-text-secondary">Loading...</p></div>;
  }

  const addCategory = (name?: string) => {
    const newCat: ProcurementCategory = {
      id: uuid(),
      name: name || "",
      currentState: "",
      greenAlternative: "",
      procurementStrategy: "",
      costImpact: "",
      emissionsImpact: "",
    };
    setCategories([...categories, newCat]);
    setExpandedId(newCat.id);
  };

  const updateCat = (id: string, partial: Partial<ProcurementCategory>) => {
    setCategories((prev) => prev.map((c) => (c.id === id ? { ...c, ...partial } : c)));
  };

  const removeCat = (id: string) => {
    setCategories((prev) => prev.filter((c) => c.id !== id));
    if (expandedId === id) setExpandedId(null);
  };

  const toggleCriteria = (criterion: string) => {
    setCriteria((prev) =>
      prev.includes(criterion) ? prev.filter((c) => c !== criterion) : [...prev, criterion]
    );
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <p className="text-[13px] text-text-secondary mb-1">Strategic Planning Canvas — Layer 5 of 6</p>
        <h1 className="text-[24px] text-primary">Procurement Strategies</h1>
        <p className="text-[14px] text-text-secondary">How procurement dollars flow toward sustainability targets</p>
      </div>

      <AlertCard variant="info" className="mb-6">
        <p className="text-[14px] text-primary">
          Strategy only works if procurement supports it. If your strategy says &ldquo;shift to renewable suppliers&rdquo;
          but procurement still buys from the cheapest coal-powered supplier, you have a disconnect.
        </p>
      </AlertCard>

      <div className="flex flex-col gap-6">
        <Card>
          <h2 className="text-[18px] text-primary mb-4">Procurement Categories</h2>
          <p className="text-[14px] text-text-secondary mb-4">
            For each major capex initiative, define the procurement strategy. Start with a suggested category or add your own.
          </p>

          {categories.length === 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
              {suggestedCategories.map((sug) => (
                <button
                  key={sug.name}
                  onClick={() => addCategory(sug.name)}
                  className="text-left px-4 py-3 rounded-[var(--radius-sm)] border border-dashed border-neutral-lighter text-[14px] text-text-secondary hover:border-primary hover:text-primary cursor-pointer transition-colors"
                >
                  <Plus className="w-4 h-4 inline mr-2" />
                  {sug.name}
                </button>
              ))}
            </div>
          )}

          {categories.map((cat) => {
            const isExpanded = expandedId === cat.id;
            return (
              <div key={cat.id} className="border border-neutral-lighter rounded-[var(--radius-sm)] mb-3 overflow-hidden">
                <button
                  onClick={() => setExpandedId(isExpanded ? null : cat.id)}
                  className="flex items-center justify-between w-full px-4 py-3 text-left cursor-pointer hover:bg-neutral-light transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {isExpanded ? <ChevronDown className="w-4 h-4 text-text-secondary" /> : <ChevronRight className="w-4 h-4 text-text-secondary" />}
                    <span className="text-[14px] font-medium text-text-primary">{cat.name || "(Unnamed category)"}</span>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); removeCat(cat.id); }} className="text-text-secondary hover:text-error cursor-pointer">
                    <X className="w-4 h-4" />
                  </button>
                </button>

                {isExpanded && (
                  <div className="px-4 pb-4 flex flex-col gap-4 border-t border-neutral-lighter pt-4">
                    <Input label="Category Name" value={cat.name} onChange={(e) => updateCat(cat.id, { name: e.target.value })} />
                    <Textarea label="Current State" placeholder="Current suppliers, annual spend, volumes..." value={cat.currentState} onChange={(e) => updateCat(cat.id, { currentState: e.target.value })} rows={3} />
                    <Textarea label="Green Alternative" placeholder="Available alternatives, cost premiums, maturity level..." value={cat.greenAlternative} onChange={(e) => updateCat(cat.id, { greenAlternative: e.target.value })} rows={3} />
                    <Textarea label="Procurement Strategy" placeholder="Timeline for shifting, supplier criteria, milestones..." value={cat.procurementStrategy} onChange={(e) => updateCat(cat.id, { procurementStrategy: e.target.value })} rows={3} />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Textarea label="Cost Impact" placeholder="Upfront premium, long-term savings, net 5-year..." value={cat.costImpact} onChange={(e) => updateCat(cat.id, { costImpact: e.target.value })} rows={2} />
                      <Textarea label="Emissions Impact" placeholder="Baseline vs. target, % reduction..." value={cat.emissionsImpact} onChange={(e) => updateCat(cat.id, { emissionsImpact: e.target.value })} rows={2} />
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {categories.length > 0 && (
            <button
              onClick={() => addCategory()}
              className="flex items-center gap-2 text-[13px] text-primary font-medium cursor-pointer hover:underline mt-2"
            >
              <Plus className="w-4 h-4" /> Add procurement category
            </button>
          )}
        </Card>

        <Card>
          <h2 className="text-[18px] text-primary mb-4">Green Procurement Criteria</h2>
          <p className="text-[14px] text-text-secondary mb-4">
            What must all new (and existing top) suppliers meet?
          </p>
          <div className="flex flex-col gap-2">
            {defaultCriteria.map((criterion) => (
              <label key={criterion} className="flex items-center gap-3 cursor-pointer py-2">
                <input
                  type="checkbox"
                  checked={criteria.includes(criterion)}
                  onChange={() => toggleCriteria(criterion)}
                  className="w-4 h-4 accent-primary"
                />
                <span className="text-[14px] text-text-primary">{criterion}</span>
              </label>
            ))}
          </div>
        </Card>

        <Card>
          <h2 className="text-[18px] text-primary mb-4">Green Procurement Policy</h2>
          <Textarea
            label="Policy Statement"
            placeholder={`Effective [Date], [Company] adopts green procurement policy:\n1. All new suppliers must disclose emissions baseline + have reduction targets\n2. Top 50 suppliers must commit to science-based targets by [Year]\n3. All new procurement must favor low-carbon alternatives (within X% cost premium)`}
            value={greenPolicy}
            onChange={(e) => setGreenPolicy(e.target.value)}
            rows={6}
          />
          <Input
            label="Annual Green Procurement Budget"
            placeholder="e.g. RM5M (supplier engagement + financing + premiums)"
            value={annualBudget}
            onChange={(e) => setAnnualBudget(e.target.value)}
            className="mt-4"
          />
        </Card>

        {categories.length > 0 && (
          <Card>
            <h2 className="text-[18px] text-primary mb-4">Category Summary</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="bg-neutral-light">
                    <th className="text-left px-4 py-3 font-medium text-text-secondary">Category</th>
                    <th className="text-left px-4 py-3 font-medium text-text-secondary">Green Alternative</th>
                    <th className="text-left px-4 py-3 font-medium text-text-secondary">Cost Impact</th>
                    <th className="text-left px-4 py-3 font-medium text-text-secondary">Emissions Impact</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((cat) => (
                    <tr key={cat.id} className="border-b border-neutral-lighter">
                      <td className="px-4 py-3 font-medium text-text-primary">{cat.name || "—"}</td>
                      <td className="px-4 py-3 text-text-secondary">{cat.greenAlternative ? cat.greenAlternative.slice(0, 60) + (cat.greenAlternative.length > 60 ? "..." : "") : "—"}</td>
                      <td className="px-4 py-3 text-text-secondary">{cat.costImpact ? cat.costImpact.slice(0, 40) + (cat.costImpact.length > 40 ? "..." : "") : "—"}</td>
                      <td className="px-4 py-3 text-text-secondary">{cat.emissionsImpact ? cat.emissionsImpact.slice(0, 40) + (cat.emissionsImpact.length > 40 ? "..." : "") : "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        <div className="flex justify-between">
          <Link href="/canvas/action-plans">
            <Button variant="ghost"><ArrowLeft className="w-4 h-4" /> Previous: Action Plans</Button>
          </Link>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={save}>Save Draft</Button>
            <Link href="/canvas/kpis">
              <Button variant="primary" onClick={save}>
                Next: KPIs & OKRs <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
