"use client";

import { useSteinwall } from "@/lib/context";
import { Card, AlertCard } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useState, useCallback } from "react";
import Link from "next/link";
import {
  bursaConfigs,
  industryConfigs,
  allStandards,
  voluntaryStandardIds,
  emissionFactorSources,
  getIndustryConfig,
  getStandardById,
  emphasisLabels,
} from "@/lib/standards-data";
import type { BursaListingType, IndustryType, StandardsSelection } from "@/lib/types";
import {
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Shield,
  Building2,
  Factory,
  FileCheck,
  AlertTriangle,
  Info,
  ChevronDown,
  ChevronRight,
} from "lucide-react";

type Section = "listing" | "industry" | "voluntary" | "summary";

const sections: { id: Section; label: string; number: number }[] = [
  { id: "listing", label: "Company Type", number: 1 },
  { id: "industry", label: "Industry Standards", number: 2 },
  { id: "voluntary", label: "Supplementary", number: 3 },
  { id: "summary", label: "Configuration", number: 4 },
];

export default function StandardsSelectionPage() {
  const { data, update, hydrated } = useSteinwall();
  const existing = data.standardsSelection;

  const [activeSection, setActiveSection] = useState<Section>("listing");
  const [bursaListing, setBursaListing] = useState<BursaListingType>(existing?.bursaListing ?? "main_market");
  const [industry, setIndustry] = useState<IndustryType>(existing?.industry ?? "manufacturing");
  const [industryStandards, setIndustryStandards] = useState<string[]>(existing?.industryStandards ?? []);
  const [voluntaryStandards, setVoluntaryStandards] = useState<string[]>(existing?.voluntaryStandards ?? []);
  const [primaryStandard, setPrimaryStandard] = useState(existing?.primaryStandard ?? "nfrs_main");
  const [emissionFactorSource, setEmissionFactorSource] = useState(existing?.emissionFactorSource ?? "ghg_protocol");
  const [baselineYear, setBaselineYear] = useState(existing?.baselineYear ?? "2024");
  const [reportingYear, setReportingYear] = useState(existing?.reportingYear ?? "2025");
  const [boardDate, setBoardDate] = useState(existing?.boardApproval?.date ?? "");
  const [boardApproved, setBoardApproved] = useState(existing?.boardApproval?.approved ?? false);

  const [expandedIndustry, setExpandedIndustry] = useState(true);

  const selectedBursa = bursaConfigs.find((b) => b.id === bursaListing);
  const selectedIndustryConfig = getIndustryConfig(industry);

  const toggleIndustryStandard = (id: string) => {
    setIndustryStandards((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const toggleVoluntaryStandard = (id: string) => {
    setVoluntaryStandards((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const mandatoryStandards = selectedBursa?.mandatoryStandards ?? [];

  const allSelectedStandards = [
    ...mandatoryStandards,
    ...industryStandards,
    ...voluntaryStandards,
  ];

  const save = useCallback(
    (status: StandardsSelection["status"]) => {
      const selection: StandardsSelection = {
        bursaListing,
        industry,
        mandatoryStandards,
        industryStandards,
        voluntaryStandards,
        primaryStandard,
        emissionFactorSource,
        baselineYear,
        reportingYear,
        boardApproval: boardDate ? { date: boardDate, approved: boardApproved } : undefined,
        status,
        updatedAt: new Date().toISOString(),
      };
      update({ standardsSelection: selection });
    },
    [bursaListing, industry, mandatoryStandards, industryStandards, voluntaryStandards, primaryStandard, emissionFactorSource, baselineYear, reportingYear, boardDate, boardApproved, update]
  );

  const goNext = () => {
    const idx = sections.findIndex((s) => s.id === activeSection);
    if (idx < sections.length - 1) {
      setActiveSection(sections[idx + 1].id);
    }
  };

  const goPrev = () => {
    const idx = sections.findIndex((s) => s.id === activeSection);
    if (idx > 0) {
      setActiveSection(sections[idx - 1].id);
    }
  };

  if (!hydrated) {
    return <div className="flex items-center justify-center h-64"><p className="text-text-secondary">Loading...</p></div>;
  }

  const primaryOptions = allSelectedStandards
    .map((id) => getStandardById(id))
    .filter(Boolean)
    .map((s) => ({ value: s!.id, label: s!.shortName }));

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[24px] text-primary">Audit Standards Selection</h1>
          <p className="text-[14px] text-text-secondary">
            Select your applicable audit standards — the platform adapts data collection accordingly
          </p>
        </div>
        {existing?.status && (
          <Badge variant={existing.status === "complete" || existing.status === "board_approved" ? "success" : "warning"}>
            {existing.status === "board_approved" ? "Board Approved" : existing.status === "complete" ? "Complete" : "Draft"}
          </Badge>
        )}
      </div>

      {/* Section navigation */}
      <div className="flex gap-1 mb-6 border-b border-neutral-lighter overflow-x-auto">
        {sections.map((s) => (
          <button
            key={s.id}
            onClick={() => setActiveSection(s.id)}
            className={`px-4 py-2.5 text-[14px] font-medium border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeSection === s.id
                ? "border-primary text-primary"
                : "border-transparent text-text-secondary hover:text-text-primary"
            }`}
          >
            <span className="text-[12px] mr-1.5 opacity-60">{s.number}.</span>
            {s.label}
          </button>
        ))}
      </div>

      {/* Section 1: Company Type / Bursa Listing */}
      {activeSection === "listing" && (
        <div className="flex flex-col gap-5">
          <AlertCard variant="info">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="text-[14px] font-medium text-primary">Mandatory Standards</p>
                <p className="text-[13px] text-text-secondary mt-1">
                  Based on your company type, certain audit standards are automatically required. Select the category that best describes your organization.
                </p>
              </div>
            </div>
          </AlertCard>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {bursaConfigs.map((config) => {
              const selected = bursaListing === config.id;
              return (
                <button
                  key={config.id}
                  onClick={() => setBursaListing(config.id)}
                  className={`text-left p-5 rounded-[var(--radius-md)] border-2 transition-all cursor-pointer ${
                    selected
                      ? "border-primary bg-primary-light/40"
                      : "border-neutral-lighter bg-surface hover:border-primary/30"
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <Building2 className={`w-5 h-5 ${selected ? "text-primary" : "text-text-secondary"}`} />
                    <span className={`text-[15px] font-medium ${selected ? "text-primary" : "text-text-primary"}`}>
                      {config.label}
                    </span>
                    {selected && <CheckCircle className="w-4 h-4 text-primary ml-auto" />}
                  </div>
                  <p className="text-[13px] text-text-secondary leading-relaxed">{config.description}</p>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {config.mandatoryStandards.map((stdId) => {
                      const std = getStandardById(stdId);
                      return std ? (
                        <Badge key={stdId} variant="info">{std.shortName}</Badge>
                      ) : null;
                    })}
                  </div>
                </button>
              );
            })}
          </div>

          {selectedBursa && (
            <Card>
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle className="w-4 h-4 text-success" />
                <p className="text-[14px] font-medium text-text-primary">Selected: {selectedBursa.label}</p>
              </div>
              <p className="text-[13px] text-text-secondary">
                Mandatory standards auto-applied:{" "}
                {selectedBursa.mandatoryStandards.map((id) => getStandardById(id)?.shortName).join(", ")}
              </p>
            </Card>
          )}

          <div className="flex justify-end">
            <Button variant="primary" onClick={goNext}>
              Next: Industry Standards <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Section 2: Industry-Specific Standards */}
      {activeSection === "industry" && (
        <div className="flex flex-col gap-5">
          <AlertCard variant="info">
            <div className="flex items-start gap-3">
              <Factory className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="text-[14px] font-medium text-primary">Industry-Specific Standards</p>
                <p className="text-[13px] text-text-secondary mt-1">
                  Different industries have different reporting requirements. Select your industry to see recommended standards and how the platform adapts scope calculations.
                </p>
              </div>
            </div>
          </AlertCard>

          <Card>
            <p className="text-[14px] font-medium text-neutral mb-3">Select your primary industry</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {industryConfigs.map((config) => {
                const selected = industry === config.id;
                return (
                  <button
                    key={config.id}
                    onClick={() => {
                      setIndustry(config.id);
                      setIndustryStandards([]);
                    }}
                    className={`text-left px-4 py-3 rounded-[var(--radius-sm)] border transition-all cursor-pointer ${
                      selected
                        ? "border-primary bg-primary-light/40"
                        : "border-neutral-lighter hover:border-primary/30"
                    }`}
                  >
                    <span className={`text-[14px] font-medium ${selected ? "text-primary" : "text-text-primary"}`}>
                      {config.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </Card>

          {selectedIndustryConfig && (
            <>
              <Card>
                <button
                  onClick={() => setExpandedIndustry(!expandedIndustry)}
                  className="flex items-center justify-between w-full cursor-pointer"
                >
                  <p className="text-[16px] font-medium text-primary">
                    {selectedIndustryConfig.label} — Scope Emphasis
                  </p>
                  {expandedIndustry ? <ChevronDown className="w-4 h-4 text-text-secondary" /> : <ChevronRight className="w-4 h-4 text-text-secondary" />}
                </button>
                {expandedIndustry && (
                  <div className="mt-4 flex flex-col gap-4">
                    <div className="grid grid-cols-3 gap-3">
                      {(["scope1Emphasis", "scope2Emphasis", "scope3Emphasis"] as const).map((key) => {
                        const val = selectedIndustryConfig[key];
                        const e = emphasisLabels[val];
                        const scopeLabel = key === "scope1Emphasis" ? "Scope 1" : key === "scope2Emphasis" ? "Scope 2" : "Scope 3";
                        return (
                          <div key={key} className="bg-neutral-light rounded-[var(--radius-sm)] p-3 text-center">
                            <p className="text-[12px] uppercase tracking-wider text-text-secondary mb-1">{scopeLabel}</p>
                            <Badge variant={e.color as "error" | "warning" | "info" | "neutral"}>{e.label}</Badge>
                          </div>
                        );
                      })}
                    </div>

                    <div>
                      <p className="text-[13px] font-medium text-neutral mb-2">Special Considerations</p>
                      <div className="flex flex-col gap-1.5">
                        {selectedIndustryConfig.specialConsiderations.map((note, i) => (
                          <div key={i} className="flex items-start gap-2">
                            <AlertTriangle className="w-3.5 h-3.5 text-warning shrink-0 mt-0.5" />
                            <p className="text-[13px] text-text-secondary">{note}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className="text-[13px] font-medium text-neutral mb-2">Material Scope 3 Categories</p>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedIndustryConfig.materialScope3Categories.map((cat) => (
                          <Badge key={cat} variant="warning">
                            {cat.replace("cat", "Cat ").replace("_", " ").replace(/_/g, " ")}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </Card>

              <Card>
                <p className="text-[14px] font-medium text-neutral mb-3">Applicable Standards for {selectedIndustryConfig.label}</p>
                <p className="text-[13px] text-text-secondary mb-4">Select additional standards relevant to your industry</p>
                <div className="flex flex-col gap-2">
                  {selectedIndustryConfig.applicableStandards.map((stdId) => {
                    const std = getStandardById(stdId);
                    if (!std) return null;
                    const checked = industryStandards.includes(stdId);
                    return (
                      <label
                        key={stdId}
                        className={`flex items-start gap-3 p-3 rounded-[var(--radius-sm)] border cursor-pointer transition-all ${
                          checked
                            ? "border-primary bg-primary-light/30"
                            : "border-neutral-lighter hover:border-primary/30"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleIndustryStandard(stdId)}
                          className="accent-primary mt-0.5"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[14px] font-medium text-text-primary">{std.shortName}</span>
                            <span className="text-[12px] text-text-secondary">— {std.name}</span>
                          </div>
                          <p className="text-[13px] text-text-secondary mt-0.5">{std.description}</p>
                          <div className="flex gap-2 mt-2">
                            {std.scope1Required && <Badge variant="info">S1</Badge>}
                            {std.scope2Required && <Badge variant="info">S2</Badge>}
                            {std.scope3Required && <Badge variant="info">S3</Badge>}
                            {std.assuranceRequired && <Badge variant="warning">Assurance Required</Badge>}
                          </div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </Card>
            </>
          )}

          <div className="flex justify-between">
            <Button variant="ghost" onClick={goPrev}>
              <ArrowLeft className="w-4 h-4" /> Previous
            </Button>
            <Button variant="primary" onClick={goNext}>
              Next: Supplementary Standards <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Section 3: Voluntary / Supplementary Standards */}
      {activeSection === "voluntary" && (
        <div className="flex flex-col gap-5">
          <AlertCard variant="info">
            <div className="flex items-start gap-3">
              <FileCheck className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="text-[14px] font-medium text-primary">Voluntary / Supplementary Standards</p>
                <p className="text-[13px] text-text-secondary mt-1">
                  These are optional frameworks that add depth to your reporting. Steinwall will find overlaps and avoid duplicate data collection.
                </p>
              </div>
            </div>
          </AlertCard>

          <Card>
            <div className="flex flex-col gap-2">
              {voluntaryStandardIds
                .filter((id) => !mandatoryStandards.includes(id) && !industryStandards.includes(id))
                .map((stdId) => {
                  const std = getStandardById(stdId);
                  if (!std) return null;
                  const checked = voluntaryStandards.includes(stdId);
                  return (
                    <label
                      key={stdId}
                      className={`flex items-start gap-3 p-3 rounded-[var(--radius-sm)] border cursor-pointer transition-all ${
                        checked
                          ? "border-primary bg-primary-light/30"
                          : "border-neutral-lighter hover:border-primary/30"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleVoluntaryStandard(stdId)}
                        className="accent-primary mt-0.5"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[14px] font-medium text-text-primary">{std.shortName}</span>
                          <span className="text-[12px] text-text-secondary">— {std.name}</span>
                        </div>
                        <p className="text-[13px] text-text-secondary mt-0.5">{std.description}</p>
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {std.focusAreas.map((area, i) => (
                            <Badge key={i} variant="neutral">{area}</Badge>
                          ))}
                        </div>
                      </div>
                    </label>
                  );
                })}
            </div>
          </Card>

          <div className="flex justify-between">
            <Button variant="ghost" onClick={goPrev}>
              <ArrowLeft className="w-4 h-4" /> Previous
            </Button>
            <Button variant="primary" onClick={goNext}>
              Next: Configuration <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Section 4: Summary & Configuration */}
      {activeSection === "summary" && (
        <div className="flex flex-col gap-5">
          <Card>
            <p className="text-[16px] font-medium text-primary mb-4">Selected Standards Summary</p>
            <div className="flex flex-col gap-3">
              <div>
                <p className="text-[12px] uppercase tracking-wider text-text-secondary font-semibold mb-2">Mandatory</p>
                <div className="flex flex-wrap gap-2">
                  {mandatoryStandards.map((id) => {
                    const std = getStandardById(id);
                    return std ? (
                      <Badge key={id} variant="info">{std.shortName}</Badge>
                    ) : null;
                  })}
                </div>
              </div>
              {industryStandards.length > 0 && (
                <div>
                  <p className="text-[12px] uppercase tracking-wider text-text-secondary font-semibold mb-2">Industry-Specific</p>
                  <div className="flex flex-wrap gap-2">
                    {industryStandards.map((id) => {
                      const std = getStandardById(id);
                      return std ? (
                        <Badge key={id} variant="warning">{std.shortName}</Badge>
                      ) : null;
                    })}
                  </div>
                </div>
              )}
              {voluntaryStandards.length > 0 && (
                <div>
                  <p className="text-[12px] uppercase tracking-wider text-text-secondary font-semibold mb-2">Supplementary</p>
                  <div className="flex flex-wrap gap-2">
                    {voluntaryStandards.map((id) => {
                      const std = getStandardById(id);
                      return std ? (
                        <Badge key={id} variant="neutral">{std.shortName}</Badge>
                      ) : null;
                    })}
                  </div>
                </div>
              )}
            </div>
          </Card>

          <Card>
            <p className="text-[16px] font-medium text-primary mb-4">Calculation Configuration</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="Primary Standard (for scope calculation)"
                options={primaryOptions.length > 0 ? primaryOptions : [{ value: "nfrs_main", label: "NFRS" }]}
                value={primaryStandard}
                onChange={(e) => setPrimaryStandard(e.target.value)}
              />
              <Select
                label="Emission Factor Source"
                options={emissionFactorSources}
                value={emissionFactorSource}
                onChange={(e) => setEmissionFactorSource(e.target.value)}
              />
              <Select
                label="Baseline Year"
                options={[
                  { value: "2020", label: "2020" },
                  { value: "2021", label: "2021" },
                  { value: "2022", label: "2022" },
                  { value: "2023", label: "2023" },
                  { value: "2024", label: "2024" },
                ]}
                value={baselineYear}
                onChange={(e) => setBaselineYear(e.target.value)}
              />
              <Select
                label="Reporting Year"
                options={[
                  { value: "2024", label: "2024" },
                  { value: "2025", label: "2025" },
                  { value: "2026", label: "2026" },
                ]}
                value={reportingYear}
                onChange={(e) => setReportingYear(e.target.value)}
              />
            </div>
          </Card>

          {selectedIndustryConfig && (
            <AlertCard variant="info">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="text-[14px] font-medium text-primary">Platform will adapt to your selections</p>
                  <p className="text-[13px] text-text-secondary mt-1">
                    Your primary standard is <span className="font-medium">{getStandardById(primaryStandard)?.shortName ?? primaryStandard}</span>.
                    Scope calculations will use <span className="font-medium">{selectedIndustryConfig.defaultEmissionFactorSource}</span> emission factors by default.
                    Baseline year: <span className="font-medium">{baselineYear}</span>. Reporting year: <span className="font-medium">{reportingYear}</span>.
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {allSelectedStandards.map((id) => {
                      const std = getStandardById(id);
                      return std ? (
                        <span key={id} className="text-[12px] text-text-secondary">
                          {std.scope1Required && "S1"}
                          {std.scope2Required && "+S2"}
                          {std.scope3Required && "+S3"}
                          {" "}({std.shortName})
                        </span>
                      ) : null;
                    })}
                  </div>
                </div>
              </div>
            </AlertCard>
          )}

          <Card>
            <p className="text-[16px] font-medium text-primary mb-4">Board Approval</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-[14px] font-medium text-neutral">Approval Date</label>
                <input
                  type="date"
                  value={boardDate}
                  onChange={(e) => setBoardDate(e.target.value)}
                  className="w-full bg-surface border border-neutral-lighter rounded-[var(--radius-sm)] px-4 py-3 text-[16px] text-text-primary focus:border-primary focus:ring-3 focus:ring-primary-light outline-none transition-colors"
                />
              </div>
              <div className="flex items-end">
                <label className="flex items-center gap-2 cursor-pointer pb-3">
                  <input
                    type="checkbox"
                    checked={boardApproved}
                    onChange={(e) => setBoardApproved(e.target.checked)}
                    className="accent-primary w-4 h-4"
                  />
                  <span className="text-[14px] text-text-primary">Board has approved these standards</span>
                </label>
              </div>
            </div>
          </Card>

          <div className="flex justify-between items-center">
            <Button variant="ghost" onClick={goPrev}>
              <ArrowLeft className="w-4 h-4" /> Previous
            </Button>
            <div className="flex gap-3">
              <Button
                variant="secondary"
                onClick={() => save("draft")}
              >
                Save as Draft
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  save(boardApproved ? "board_approved" : "complete");
                }}
              >
                <CheckCircle className="w-4 h-4" />
                {boardApproved ? "Save & Approve" : "Save & Complete"}
              </Button>
            </div>
          </div>

          {(existing?.status === "complete" || existing?.status === "board_approved") && (
            <div className="flex justify-end mt-2">
              <Link href="/data-collection">
                <Button variant="primary">
                  Continue to Data Collection <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
