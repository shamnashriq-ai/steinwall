"use client";

import { useSteinwall } from "@/lib/context";
import { Card, AlertCard } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Textarea, Select } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useState, useCallback, useMemo } from "react";
import { v4 as uuid } from "uuid";
import {
  scope1Categories,
  scope2Categories,
  scope3Categories,
  units,
  sectorEmissionFactors,
} from "@/lib/emission-factors";
import {
  getIndustryConfig,
  getStandardById,
  emphasisLabels,
} from "@/lib/standards-data";
import type { EmissionDataPoint, Supplier, ScopeData, ConfidenceLevel, DataSource } from "@/lib/types";
import Link from "next/link";
import { Plus, Trash2, Upload, AlertCircle, CheckCircle, Settings2, ArrowRight } from "lucide-react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  Tooltip,
} from "recharts";

type ActiveTab = "scope1" | "scope2" | "scope3" | "suppliers";

const PIE_COLORS = ["#185FA5", "#0F6E56", "#854F0B", "#A32D2D", "#5F5E5A", "#0C447C", "#4A8C75", "#B8860B"];

export default function DataCollectionPage() {
  const { data, update, hydrated } = useSteinwall();
  const [tab, setTab] = useState<ActiveTab>("scope1");
  const [showForm, setShowForm] = useState(false);

  const [formCategory, setFormCategory] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formValue, setFormValue] = useState("");
  const [formUnit, setFormUnit] = useState("");
  const [formEmissions, setFormEmissions] = useState("");
  const [formSource, setFormSource] = useState<DataSource>("invoice");
  const [formConfidence, setFormConfidence] = useState<ConfidenceLevel>("100%");
  const [formMethodology, setFormMethodology] = useState("");

  const [supplierName, setSupplierName] = useState("");
  const [supplierRevPct, setSupplierRevPct] = useState("");
  const [supplierSector, setSupplierSector] = useState("");
  const [supplierSource, setSupplierSource] = useState<"cdp" | "industry_average" | "spend_based">("industry_average");
  const [supplierEmissions, setSupplierEmissions] = useState("");

  const scopeData = data.scopeData;
  const standards = data.standardsSelection;
  const industryConfig = standards?.industry ? getIndustryConfig(standards.industry) : null;

  const saveScopeData = useCallback(
    (partial: Partial<ScopeData>) => {
      const next = { ...scopeData, ...partial, updatedAt: new Date().toISOString() };
      const allPoints = [...next.scope1, ...next.scope2, ...next.scope3];
      next.totalS1 = next.scope1.reduce((s, d) => s + d.emissionsTonneCO2e, 0);
      next.totalS2 = next.scope2.reduce((s, d) => s + d.emissionsTonneCO2e, 0);
      next.totalS3 = next.scope3.reduce((s, d) => s + d.emissionsTonneCO2e, 0) +
        next.suppliers.reduce((s, d) => s + d.emissionsTonneCO2e, 0);
      const verified = allPoints.filter((p) => p.confidence === "100%").length;
      next.dataQualityScore = allPoints.length > 0 ? Math.round((verified / allPoints.length) * 100) : 0;
      update({ scopeData: next });
    },
    [scopeData, update]
  );

  const resetForm = () => {
    setFormCategory("");
    setFormDesc("");
    setFormValue("");
    setFormUnit("");
    setFormEmissions("");
    setFormSource("invoice");
    setFormConfidence("100%");
    setFormMethodology("");
    setShowForm(false);
  };

  const addDataPoint = () => {
    const point: EmissionDataPoint = {
      id: uuid(),
      scope: tab === "scope1" ? 1 : tab === "scope2" ? 2 : 3,
      category: formCategory,
      description: formDesc,
      value: Number(formValue),
      unit: formUnit,
      emissionsTonneCO2e: Number(formEmissions),
      source: formSource,
      confidence: formConfidence,
      methodology: formMethodology,
      lastUpdated: new Date().toISOString(),
      updatedBy: "Admin",
    };
    const key = tab as "scope1" | "scope2" | "scope3";
    saveScopeData({ [key]: [...scopeData[key], point] });
    resetForm();
  };

  const deletePoint = (scope: "scope1" | "scope2" | "scope3", id: string) => {
    saveScopeData({ [scope]: scopeData[scope].filter((p) => p.id !== id) });
  };

  const addSupplier = () => {
    const factor = sectorEmissionFactors[supplierSector] || 0.3;
    const emissions = supplierSource === "spend_based"
      ? Number(supplierEmissions) * factor
      : Number(supplierEmissions);
    const supplier: Supplier = {
      id: uuid(),
      name: supplierName,
      revenuePercent: Number(supplierRevPct),
      sector: supplierSector,
      dataSource: supplierSource,
      emissionsTonneCO2e: Math.round(emissions),
      status: supplierSource === "cdp" ? "verified" : supplierSource === "industry_average" ? "estimated" : "estimated",
    };
    saveScopeData({ suppliers: [...scopeData.suppliers, supplier] });
    setSupplierName("");
    setSupplierRevPct("");
    setSupplierSector("");
    setSupplierEmissions("");
  };

  const deleteSupplier = (id: string) => {
    saveScopeData({ suppliers: scopeData.suppliers.filter((s) => s.id !== id) });
  };

  const categories = tab === "scope1" ? scope1Categories : tab === "scope2" ? scope2Categories : scope3Categories;
  const currentPoints = tab === "scope1" ? scopeData.scope1 : tab === "scope2" ? scopeData.scope2 : scopeData.scope3;

  const hotspotData = useMemo(() => {
    const byCategory: Record<string, number> = {};
    [...scopeData.scope3, ...scopeData.suppliers.map((s) => ({ category: s.sector, emissionsTonneCO2e: s.emissionsTonneCO2e }))].forEach((p) => {
      byCategory[p.category] = (byCategory[p.category] || 0) + p.emissionsTonneCO2e;
    });
    return Object.entries(byCategory)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [scopeData.scope3, scopeData.suppliers]);

  const totalAll = scopeData.totalS1 + scopeData.totalS2 + scopeData.totalS3;

  if (!hydrated) {
    return <div className="flex items-center justify-center h-64"><p className="text-text-secondary">Loading...</p></div>;
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[24px] text-primary">Scope 1, 2, 3 Data Collection</h1>
          <p className="text-[14px] text-text-secondary">Systematize emissions data from every department</p>
        </div>
        <div className="flex items-center gap-3">
          {totalAll > 0 && (
            <Badge variant={scopeData.dataQualityScore >= 75 ? "success" : scopeData.dataQualityScore >= 50 ? "warning" : "error"}>
              Quality: {scopeData.dataQualityScore}%
            </Badge>
          )}
        </div>
      </div>

      {totalAll > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
          <Card>
            <p className="text-[13px] uppercase tracking-wider text-text-secondary mb-1">Scope 1</p>
            <p className="text-[22px] font-[family-name:var(--font-display)] text-primary">{scopeData.totalS1.toLocaleString()} <span className="text-[13px] text-text-secondary">tCO₂e</span></p>
          </Card>
          <Card>
            <p className="text-[13px] uppercase tracking-wider text-text-secondary mb-1">Scope 2</p>
            <p className="text-[22px] font-[family-name:var(--font-display)] text-primary">{scopeData.totalS2.toLocaleString()} <span className="text-[13px] text-text-secondary">tCO₂e</span></p>
          </Card>
          <Card>
            <p className="text-[13px] uppercase tracking-wider text-text-secondary mb-1">Scope 3</p>
            <p className="text-[22px] font-[family-name:var(--font-display)] text-primary">{scopeData.totalS3.toLocaleString()} <span className="text-[13px] text-text-secondary">tCO₂e</span></p>
          </Card>
          <Card>
            <p className="text-[13px] uppercase tracking-wider text-text-secondary mb-1">Total</p>
            <p className="text-[22px] font-[family-name:var(--font-display)] text-success">{totalAll.toLocaleString()} <span className="text-[13px] text-text-secondary">tCO₂e</span></p>
          </Card>
        </div>
      )}

      {/* Standards-aware guidance */}
      {standards && industryConfig ? (
        <div className="bg-primary-light/40 border border-primary/20 rounded-[var(--radius-md)] p-4 mb-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Settings2 className="w-4 h-4 text-primary" />
              <p className="text-[14px] font-medium text-primary">
                {industryConfig.label} — {standards.mandatoryStandards.concat(standards.industryStandards).map((id) => getStandardById(id)?.shortName).filter(Boolean).join(" + ")}
              </p>
            </div>
            <Link href="/data-collection/standards">
              <Badge variant="info">Edit Standards</Badge>
            </Link>
          </div>
          <div className="flex flex-wrap gap-3 text-[13px] text-text-secondary">
            <span>Scope 1: <Badge variant={emphasisLabels[industryConfig.scope1Emphasis].color as "error" | "warning" | "info" | "neutral"}>{emphasisLabels[industryConfig.scope1Emphasis].label}</Badge></span>
            <span>Scope 2: <Badge variant={emphasisLabels[industryConfig.scope2Emphasis].color as "error" | "warning" | "info" | "neutral"}>{emphasisLabels[industryConfig.scope2Emphasis].label}</Badge></span>
            <span>Scope 3: <Badge variant={emphasisLabels[industryConfig.scope3Emphasis].color as "error" | "warning" | "info" | "neutral"}>{emphasisLabels[industryConfig.scope3Emphasis].label}</Badge></span>
          </div>
          {tab === "scope3" && industryConfig.materialScope3Categories.length > 0 && (
            <div className="mt-2 pt-2 border-t border-primary/10">
              <p className="text-[12px] text-text-secondary mb-1">Material Scope 3 categories for your industry:</p>
              <div className="flex flex-wrap gap-1.5">
                {industryConfig.materialScope3Categories.map((cat) => (
                  <Badge key={cat} variant="warning">
                    {cat.replace("cat", "Cat ").replace(/_/g, " ")}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-warning-light border border-warning/20 rounded-[var(--radius-md)] p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-warning" />
              <p className="text-[14px] text-warning font-medium">No audit standards selected yet</p>
            </div>
            <Link href="/data-collection/standards">
              <Button variant="secondary" size="sm">
                Select Standards <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
          <p className="text-[13px] text-text-secondary mt-1">
            Select your audit standards first to get industry-specific guidance and adaptive data collection.
          </p>
        </div>
      )}

      <div className="flex gap-1 mb-6 border-b border-neutral-lighter">
        {(["scope1", "scope2", "scope3", "suppliers"] as ActiveTab[]).map((t) => (
          <button
            key={t}
            onClick={() => { setTab(t); setShowForm(false); }}
            className={`px-4 py-2.5 text-[14px] font-medium border-b-2 transition-colors cursor-pointer ${
              tab === t ? "border-primary text-primary" : "border-transparent text-text-secondary hover:text-text-primary"
            }`}
          >
            {t === "scope1" ? "Scope 1" : t === "scope2" ? "Scope 2" : t === "scope3" ? "Scope 3" : "Suppliers"}
          </button>
        ))}
      </div>

      {tab !== "suppliers" ? (
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1 min-w-0">
            <Card>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-[18px] text-primary">
                  {tab === "scope1" ? "Scope 1" : tab === "scope2" ? "Scope 2" : "Scope 3"} Data Points
                </h2>
                <Button variant="secondary" size="sm" onClick={() => setShowForm(!showForm)}>
                  <Plus className="w-4 h-4" /> Add Data
                </Button>
              </div>

              {showForm && (
                <div className="border border-primary-light bg-primary-light/30 rounded-[var(--radius-sm)] p-4 mb-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Select
                      label="Category"
                      options={categories}
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value)}
                    />
                    <Input
                      label="Description"
                      placeholder="e.g. Monthly electricity usage"
                      value={formDesc}
                      onChange={(e) => setFormDesc(e.target.value)}
                    />
                    <Input
                      label="Value"
                      type="number"
                      placeholder="e.g. 5000"
                      value={formValue}
                      onChange={(e) => setFormValue(e.target.value)}
                    />
                    <Select
                      label="Unit"
                      options={units}
                      value={formUnit}
                      onChange={(e) => setFormUnit(e.target.value)}
                    />
                    <Input
                      label="Emissions (tCO₂e)"
                      type="number"
                      placeholder="Calculated or entered"
                      value={formEmissions}
                      onChange={(e) => setFormEmissions(e.target.value)}
                    />
                    <Select
                      label="Data Source"
                      options={[
                        { value: "invoice", label: "Invoice / Bill" },
                        { value: "supplier_report", label: "Supplier Report" },
                        { value: "cdp", label: "CDP Data" },
                        { value: "estimate", label: "Estimate" },
                        { value: "industry_average", label: "Industry Average" },
                        { value: "spend_based", label: "Spend-Based" },
                      ]}
                      value={formSource}
                      onChange={(e) => setFormSource(e.target.value as DataSource)}
                    />
                    <div>
                      <p className="text-[14px] font-medium text-neutral mb-1">Confidence Level</p>
                      <div className="flex gap-3">
                        {(["100%", "75%", "50%"] as ConfidenceLevel[]).map((c) => (
                          <label key={c} className="flex items-center gap-1.5 cursor-pointer">
                            <input
                              type="radio"
                              name="confidence"
                              checked={formConfidence === c}
                              onChange={() => setFormConfidence(c)}
                              className="accent-primary"
                            />
                            <span className="text-[14px]">{c}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    <Textarea
                      label="Methodology Note"
                      placeholder="How was this calculated?"
                      value={formMethodology}
                      onChange={(e) => setFormMethodology(e.target.value)}
                    />
                  </div>
                  <div className="flex justify-end gap-2 mt-4">
                    <Button variant="ghost" size="sm" onClick={resetForm}>Cancel</Button>
                    <Button
                      variant="primary"
                      size="sm"
                      disabled={!formCategory || !formValue || !formEmissions}
                      onClick={addDataPoint}
                    >
                      Save Data Point
                    </Button>
                  </div>
                </div>
              )}

              {currentPoints.length === 0 ? (
                <p className="text-[14px] text-text-secondary py-8 text-center">
                  No data points yet. Click &quot;Add Data&quot; to start collecting.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-[14px]">
                    <thead>
                      <tr className="bg-neutral-light">
                        <th className="text-left px-4 py-3 font-medium text-neutral">Category</th>
                        <th className="text-left px-4 py-3 font-medium text-neutral">Value</th>
                        <th className="text-right px-4 py-3 font-medium text-neutral">tCO₂e</th>
                        <th className="text-center px-4 py-3 font-medium text-neutral">Source</th>
                        <th className="text-center px-4 py-3 font-medium text-neutral">Confidence</th>
                        <th className="px-4 py-3"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentPoints.map((point) => (
                        <tr key={point.id} className="border-b border-neutral-lighter">
                          <td className="px-4 py-3">
                            <p className="font-medium">{point.description || point.category}</p>
                          </td>
                          <td className="px-4 py-3">{point.value.toLocaleString()} {point.unit}</td>
                          <td className="px-4 py-3 text-right font-[family-name:var(--font-mono)]">
                            {point.emissionsTonneCO2e.toLocaleString()}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <Badge variant={point.source === "cdp" || point.source === "invoice" ? "success" : "warning"}>
                              {point.source}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <Badge variant={point.confidence === "100%" ? "success" : point.confidence === "75%" ? "warning" : "error"}>
                              {point.confidence}
                            </Badge>
                          </td>
                          <td className="px-4 py-3">
                            <button
                              onClick={() => deletePoint(tab as "scope1" | "scope2" | "scope3", point.id)}
                              className="text-text-secondary hover:text-error cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          </div>

          {tab === "scope3" && hotspotData.length > 0 && (
            <div className="w-full lg:w-80 shrink-0">
              <Card>
                <h3 className="text-[16px] text-primary mb-3">Hotspot Analysis</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie data={hotspotData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={80}>
                      {hotspotData.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
                <p className="text-[13px] text-text-secondary mt-2">
                  Highest priority: {hotspotData[0]?.name} ({Math.round((hotspotData[0]?.value / scopeData.totalS3) * 100) || 0}% of Scope 3)
                </p>
              </Card>
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[18px] text-primary">Supplier Emissions (Scope 3)</h2>
            </div>
            <div className="border border-primary-light bg-primary-light/30 rounded-[var(--radius-sm)] p-4 mb-4">
              <p className="text-[14px] font-medium text-primary mb-3">Add Supplier</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <Input
                  label="Supplier Name"
                  placeholder="e.g. Acme Manufacturing"
                  value={supplierName}
                  onChange={(e) => setSupplierName(e.target.value)}
                />
                <Input
                  label="% of Procurement"
                  type="number"
                  placeholder="e.g. 35"
                  value={supplierRevPct}
                  onChange={(e) => setSupplierRevPct(e.target.value)}
                />
                <Input
                  label="Sector"
                  placeholder="e.g. Manufacturing"
                  value={supplierSector}
                  onChange={(e) => setSupplierSector(e.target.value)}
                />
                <Select
                  label="Data Source"
                  options={[
                    { value: "cdp", label: "CDP (verified)" },
                    { value: "industry_average", label: "Industry Average" },
                    { value: "spend_based", label: "Spend-Based" },
                  ]}
                  value={supplierSource}
                  onChange={(e) => setSupplierSource(e.target.value as "cdp" | "industry_average" | "spend_based")}
                />
                <Input
                  label={supplierSource === "spend_based" ? "Total Spend (RM)" : "Emissions (tCO₂e)"}
                  type="number"
                  placeholder={supplierSource === "spend_based" ? "e.g. 500000" : "e.g. 1200"}
                  value={supplierEmissions}
                  onChange={(e) => setSupplierEmissions(e.target.value)}
                />
              </div>
              <div className="flex justify-end mt-4">
                <Button
                  variant="primary"
                  size="sm"
                  disabled={!supplierName || !supplierEmissions}
                  onClick={addSupplier}
                >
                  <Plus className="w-4 h-4" /> Add Supplier
                </Button>
              </div>
            </div>

            {scopeData.suppliers.length === 0 ? (
              <p className="text-[14px] text-text-secondary py-8 text-center">No suppliers added yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-[14px]">
                  <thead>
                    <tr className="bg-neutral-light">
                      <th className="text-left px-4 py-3 font-medium text-neutral">Supplier</th>
                      <th className="text-right px-4 py-3 font-medium text-neutral">% Procurement</th>
                      <th className="text-left px-4 py-3 font-medium text-neutral">Source</th>
                      <th className="text-center px-4 py-3 font-medium text-neutral">Status</th>
                      <th className="text-right px-4 py-3 font-medium text-neutral">tCO₂e</th>
                      <th className="px-4 py-3"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {scopeData.suppliers.map((s) => (
                      <tr key={s.id} className="border-b border-neutral-lighter">
                        <td className="px-4 py-3 font-medium">{s.name}</td>
                        <td className="px-4 py-3 text-right">{s.revenuePercent}%</td>
                        <td className="px-4 py-3">{s.dataSource}</td>
                        <td className="px-4 py-3 text-center">
                          <Badge variant={s.status === "verified" ? "success" : s.status === "estimated" ? "warning" : "error"}>
                            {s.status === "verified" ? <><CheckCircle className="w-3 h-3 inline mr-1" />Verified</> :
                             s.status === "estimated" ? <><AlertCircle className="w-3 h-3 inline mr-1" />Estimated</> :
                             "Missing"}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-right font-[family-name:var(--font-mono)]">
                          {s.emissionsTonneCO2e.toLocaleString()}
                        </td>
                        <td className="px-4 py-3">
                          <button onClick={() => deleteSupplier(s.id)} className="text-text-secondary hover:text-error cursor-pointer">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}
