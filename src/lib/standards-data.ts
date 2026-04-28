import type { BursaListingType, IndustryType } from "./types";

export interface StandardDefinition {
  id: string;
  name: string;
  shortName: string;
  description: string;
  scope1Required: boolean;
  scope2Required: boolean;
  scope3Required: boolean;
  assuranceRequired: boolean;
  assuranceTimeline?: string;
  focusAreas: string[];
}

export interface IndustryConfig {
  id: IndustryType;
  label: string;
  applicableStandards: string[];
  specialConsiderations: string[];
  scope1Emphasis: "critical" | "significant" | "moderate" | "minor";
  scope2Emphasis: "critical" | "significant" | "moderate" | "minor";
  scope3Emphasis: "critical" | "significant" | "moderate" | "minor";
  materialScope3Categories: string[];
  defaultEmissionFactorSource: string;
}

export interface BursaConfig {
  id: BursaListingType;
  label: string;
  mandatoryStandards: string[];
  description: string;
}

export const bursaConfigs: BursaConfig[] = [
  {
    id: "main_market",
    label: "Bursa Main Market (Listed)",
    mandatoryStandards: ["nfrs_main"],
    description: "NFRS compliance is mandatory starting 2025. Scope 1, 2, 3 baseline required. IFRS S1 & S2 aligned. Board governance required. External assurance required by 2027.",
  },
  {
    id: "ace_market",
    label: "Bursa ACE Market (Listed)",
    mandatoryStandards: ["nfrs_ace"],
    description: "Limited Scope 3 required starting 2027. IFRS S1 & S2 alignment expected.",
  },
  {
    id: "non_listed",
    label: "Large Non-Listed Company",
    mandatoryStandards: ["nfrs_non_listed"],
    description: "NFRS compliance expected (not mandatory, but market norm). Revenue >RM500M or other size threshold. Scope 1, 2 required; Scope 3 emerging.",
  },
  {
    id: "glc",
    label: "Government / GLC",
    mandatoryStandards: ["glc_standard"],
    description: "Government climate commitment reporting. Potentially NFRS + government-specific KPIs. Public accountability focus.",
  },
];

export const allStandards: StandardDefinition[] = [
  {
    id: "nfrs_main",
    name: "NFRS (Malaysia — Bursa Main Market)",
    shortName: "NFRS",
    description: "Mandatory disclosure for Bursa Main Market listed companies",
    scope1Required: true,
    scope2Required: true,
    scope3Required: true,
    assuranceRequired: true,
    assuranceTimeline: "External auditor by 2027",
    focusAreas: ["IFRS S1 & S2 aligned", "Board governance", "Scope 1, 2, 3 baseline"],
  },
  {
    id: "nfrs_ace",
    name: "NFRS (Bursa ACE Market)",
    shortName: "NFRS ACE",
    description: "Disclosure for Bursa ACE Market listed companies",
    scope1Required: true,
    scope2Required: true,
    scope3Required: false,
    assuranceRequired: false,
    assuranceTimeline: "Limited Scope 3 by 2027",
    focusAreas: ["IFRS S1 & S2 alignment expected", "Scope 3 emerging"],
  },
  {
    id: "nfrs_non_listed",
    name: "NFRS (Large Non-Listed)",
    shortName: "NFRS Non-Listed",
    description: "NFRS compliance expected for large non-listed companies",
    scope1Required: true,
    scope2Required: true,
    scope3Required: false,
    assuranceRequired: false,
    focusAreas: ["Market norm compliance", "Scope 1, 2 required", "Scope 3 emerging"],
  },
  {
    id: "glc_standard",
    name: "Government / GLC Standard",
    shortName: "GLC",
    description: "Government climate commitment reporting",
    scope1Required: true,
    scope2Required: true,
    scope3Required: false,
    assuranceRequired: false,
    focusAreas: ["Government KPIs", "Public accountability", "UN SDGs alignment"],
  },
  {
    id: "gri",
    name: "GRI (Global Reporting Initiative)",
    shortName: "GRI",
    description: "Comprehensive sustainability framework covering emissions + broader ESG",
    scope1Required: true,
    scope2Required: true,
    scope3Required: false,
    assuranceRequired: false,
    focusAreas: ["Comprehensive ESG reporting", "Materiality-driven", "Stakeholder engagement"],
  },
  {
    id: "tcfd",
    name: "TCFD (Task Force on Climate-related Financial Disclosures)",
    shortName: "TCFD",
    description: "Climate risk assessment framework (Governance, Strategy, Risk Management, Metrics)",
    scope1Required: true,
    scope2Required: true,
    scope3Required: false,
    assuranceRequired: false,
    focusAreas: ["Climate risk", "Scenario analysis", "Governance disclosure", "Portfolio risk"],
  },
  {
    id: "sbti",
    name: "Science Based Targets initiative (SBTi)",
    shortName: "SBTi",
    description: "Validates that your targets align with 1.5°C pathway",
    scope1Required: true,
    scope2Required: true,
    scope3Required: true,
    assuranceRequired: true,
    assuranceTimeline: "SBTi verifier (one-time validation)",
    focusAreas: ["1.5°C pathway alignment", "Net-zero validation", "Science-based targets"],
  },
  {
    id: "iso14064",
    name: "ISO 14064 (Quantification & Reporting of GHG)",
    shortName: "ISO 14064",
    description: "Technical standard for emissions calculation methodology",
    scope1Required: true,
    scope2Required: true,
    scope3Required: true,
    assuranceRequired: true,
    assuranceTimeline: "ISO auditor (on-demand)",
    focusAreas: ["Technical methodology", "Detailed quantification", "Auditable framework"],
  },
  {
    id: "ipieca",
    name: "IEA/IPIECA Oil Company Reporting",
    shortName: "IPIECA",
    description: "Best practice for E&P companies — detailed Scope 1 tracking",
    scope1Required: true,
    scope2Required: true,
    scope3Required: true,
    assuranceRequired: true,
    assuranceTimeline: "Third-party (annual)",
    focusAreas: ["Flaring & venting", "Methane tracking", "Product use emissions"],
  },
  {
    id: "cbam",
    name: "CBAM (Carbon Border Adjustment Mechanism)",
    shortName: "CBAM",
    description: "EU carbon pricing mechanism for imports to the EU",
    scope1Required: true,
    scope2Required: true,
    scope3Required: false,
    assuranceRequired: true,
    assuranceTimeline: "EU auditor (2025+ reporting)",
    focusAreas: ["Embedded carbon in exports", "EU compliance", "Carbon pricing"],
  },
  {
    id: "csrd",
    name: "CSRD (EU Corporate Sustainability Reporting Directive)",
    shortName: "CSRD",
    description: "EU-specific sustainability reporting for EU operations/investors",
    scope1Required: true,
    scope2Required: true,
    scope3Required: true,
    assuranceRequired: true,
    focusAreas: ["Double materiality", "EU operations", "Value chain"],
  },
  {
    id: "ungc",
    name: "UN Global Compact / UN SDGs",
    shortName: "UN SDGs",
    description: "Alignment with United Nations Sustainable Development Goals",
    scope1Required: false,
    scope2Required: false,
    scope3Required: false,
    assuranceRequired: false,
    focusAreas: ["SDG alignment", "Global sustainability agenda", "Public commitment"],
  },
  {
    id: "carbon_trust",
    name: "Carbon Trust / Carbon Footprint Standard",
    shortName: "Carbon Trust",
    description: "UK-based standard for measuring organizational carbon footprint",
    scope1Required: true,
    scope2Required: true,
    scope3Required: false,
    assuranceRequired: false,
    focusAreas: ["Carbon footprint measurement", "UK/international investors"],
  },
  {
    id: "gresb",
    name: "GRESB (Global Real Estate Sustainability Benchmark)",
    shortName: "GRESB",
    description: "Sustainability benchmark for real estate and REITs",
    scope1Required: true,
    scope2Required: true,
    scope3Required: false,
    assuranceRequired: true,
    assuranceTimeline: "GRESB assessor (annual)",
    focusAreas: ["Real estate benchmarking", "Building performance", "Climate risk"],
  },
  {
    id: "gstc",
    name: "GSTC (Global Sustainable Tourism Council)",
    shortName: "GSTC",
    description: "Industry-specific standard for tourism and hospitality",
    scope1Required: false,
    scope2Required: true,
    scope3Required: false,
    assuranceRequired: false,
    focusAreas: ["Sustainable tourism", "Energy efficiency", "Guest impact"],
  },
  {
    id: "financed_emissions",
    name: "Financed Emissions Framework",
    shortName: "Financed Emissions",
    description: "Scope 3 = financed investments for financial institutions",
    scope1Required: false,
    scope2Required: false,
    scope3Required: true,
    assuranceRequired: false,
    focusAreas: ["Portfolio emissions", "Client decarbonization", "Climate risk to loans"],
  },
];

export const industryConfigs: IndustryConfig[] = [
  {
    id: "energy_oil_gas",
    label: "Energy / Oil & Gas",
    applicableStandards: ["ipieca", "gri", "tcfd", "sbti"],
    specialConsiderations: [
      "Scope 1 (flaring, venting, methane) requires detailed tracking",
      "Scope 3 Category 11 (product use) is typically the dominant source",
      "Carbon tax incoming (2026), ETS possible (2027–2028)",
      "Methane intensity tracking and stranded asset risk assessment needed",
    ],
    scope1Emphasis: "critical",
    scope2Emphasis: "moderate",
    scope3Emphasis: "critical",
    materialScope3Categories: [
      "cat1_purchased_goods", "cat4_upstream_transport", "cat9_downstream_transport",
      "cat10_processing", "cat11_use_of_products", "cat15_investments",
    ],
    defaultEmissionFactorSource: "IEA / IPIECA",
  },
  {
    id: "manufacturing",
    label: "Manufacturing / Chemicals / Industrial",
    applicableStandards: ["iso14064", "gri", "tcfd", "sbti", "cbam"],
    specialConsiderations: [
      "Scope 1 & 2 usually significant (energy-intensive operations)",
      "Scope 3 (supplier emissions, product transport) is material",
      "Potential carbon tax impact on margins",
      "CBAM applies if exporting carbon-intensive products to EU",
    ],
    scope1Emphasis: "significant",
    scope2Emphasis: "significant",
    scope3Emphasis: "significant",
    materialScope3Categories: [
      "cat1_purchased_goods", "cat2_capital_goods", "cat3_fuel_energy",
      "cat4_upstream_transport", "cat5_waste", "cat9_downstream_transport",
    ],
    defaultEmissionFactorSource: "GHG Protocol / ADEME",
  },
  {
    id: "retail_consumer",
    label: "Retail / Consumer Goods / Fashion",
    applicableStandards: ["gri", "sbti", "tcfd", "ungc"],
    specialConsiderations: [
      "Scope 3 (supply chain, product transport) is typically >90% of footprint",
      "Scope 1 & 2 (retail operations, logistics hubs) are lower priority",
      "Customer expectations for sustainability are high",
      "Supplier engagement and circular economy potential are key levers",
    ],
    scope1Emphasis: "minor",
    scope2Emphasis: "moderate",
    scope3Emphasis: "critical",
    materialScope3Categories: [
      "cat1_purchased_goods", "cat4_upstream_transport", "cat9_downstream_transport",
      "cat11_use_of_products", "cat12_end_of_life",
    ],
    defaultEmissionFactorSource: "GHG Protocol / Ecoinvent",
  },
  {
    id: "financial_services",
    label: "Financial Services / Banking / Insurance",
    applicableStandards: ["tcfd", "gri", "financed_emissions"],
    specialConsiderations: [
      "Own emissions (Scope 1, 2) are relatively small",
      "Financed emissions (Scope 3 Category 15) can be 1000x direct emissions",
      "Climate risk reporting to regulators is critical",
      "Portfolio-level transition risk and stranded asset assessment needed",
    ],
    scope1Emphasis: "minor",
    scope2Emphasis: "minor",
    scope3Emphasis: "critical",
    materialScope3Categories: [
      "cat6_business_travel", "cat7_commuting", "cat15_investments",
    ],
    defaultEmissionFactorSource: "PCAF / GHG Protocol",
  },
  {
    id: "hospitality_tourism",
    label: "Hospitality / Hotels / Tourism",
    applicableStandards: ["gri", "gstc", "sbti"],
    specialConsiderations: [
      "Scope 2 (energy for HVAC, lighting) is the most significant source",
      "Scope 1 (fuel for kitchens, vehicles) is moderate",
      "Scope 3 (guest travel, supply chain) is moderate",
      "Energy efficiency and building performance are key optimization levers",
    ],
    scope1Emphasis: "moderate",
    scope2Emphasis: "significant",
    scope3Emphasis: "moderate",
    materialScope3Categories: [
      "cat1_purchased_goods", "cat5_waste", "cat6_business_travel",
    ],
    defaultEmissionFactorSource: "GHG Protocol / ADEME",
  },
  {
    id: "property_real_estate",
    label: "Property / Real Estate / Construction",
    applicableStandards: ["gri", "tcfd", "gresb"],
    specialConsiderations: [
      "Scope 2 (building energy) is the most significant source",
      "Scope 3 (embedded carbon in materials, construction transport) is emerging",
      "Climate risk (flooding, heat) is critical for property valuation",
      "GRESB benchmark is standard for REITs and institutional investors",
    ],
    scope1Emphasis: "moderate",
    scope2Emphasis: "significant",
    scope3Emphasis: "moderate",
    materialScope3Categories: [
      "cat1_purchased_goods", "cat2_capital_goods", "cat4_upstream_transport",
      "cat5_waste", "cat13_downstream_leased",
    ],
    defaultEmissionFactorSource: "GHG Protocol / RICS",
  },
  {
    id: "utilities_power",
    label: "Utilities / Power Generation",
    applicableStandards: ["gri", "tcfd", "sbti"],
    specialConsiderations: [
      "Scope 1 (fuel combustion for power generation) is the critical metric",
      "Scope 2 & 3 are relatively lower",
      "Grid decarbonization trajectory is key to long-term strategy",
      "Renewable portfolio standards and clean energy mix targets apply",
    ],
    scope1Emphasis: "critical",
    scope2Emphasis: "minor",
    scope3Emphasis: "moderate",
    materialScope3Categories: [
      "cat1_purchased_goods", "cat3_fuel_energy", "cat11_use_of_products",
    ],
    defaultEmissionFactorSource: "IEA / IRENA",
  },
  {
    id: "agriculture_food",
    label: "Agriculture / Food & Beverage",
    applicableStandards: ["gri", "sbti"],
    specialConsiderations: [
      "Scope 1 & 3 (land use, supply chain) typically >80% of footprint",
      "Methane emissions (livestock) are significant and require specific tracking",
      "Soil carbon sequestration presents unique offset potential",
      "Deforestation and land-use change are material considerations",
    ],
    scope1Emphasis: "significant",
    scope2Emphasis: "moderate",
    scope3Emphasis: "critical",
    materialScope3Categories: [
      "cat1_purchased_goods", "cat4_upstream_transport", "cat5_waste",
      "cat10_processing", "cat11_use_of_products", "cat12_end_of_life",
    ],
    defaultEmissionFactorSource: "GHG Protocol / FAO",
  },
  {
    id: "healthcare_pharma",
    label: "Healthcare / Pharmaceuticals",
    applicableStandards: ["gri", "tcfd", "sbti"],
    specialConsiderations: [
      "Scope 2 (hospital energy, cold chain) is the most significant source",
      "Scope 3 (pharmaceutical supply chain, waste) is material",
      "Climate risk to medicine supply is a critical consideration",
      "Regulatory compliance (cold chain, sterility) may conflict with efficiency measures",
    ],
    scope1Emphasis: "moderate",
    scope2Emphasis: "significant",
    scope3Emphasis: "significant",
    materialScope3Categories: [
      "cat1_purchased_goods", "cat4_upstream_transport", "cat5_waste",
      "cat6_business_travel", "cat9_downstream_transport",
    ],
    defaultEmissionFactorSource: "GHG Protocol / Ecoinvent",
  },
  {
    id: "other",
    label: "Other / General",
    applicableStandards: ["gri", "tcfd", "sbti"],
    specialConsiderations: [
      "Standard GHG Protocol methodology applies",
      "Conduct materiality assessment to determine priority scopes",
    ],
    scope1Emphasis: "moderate",
    scope2Emphasis: "moderate",
    scope3Emphasis: "moderate",
    materialScope3Categories: [
      "cat1_purchased_goods", "cat4_upstream_transport", "cat5_waste",
      "cat6_business_travel", "cat7_commuting",
    ],
    defaultEmissionFactorSource: "GHG Protocol / ADEME",
  },
];

export const voluntaryStandardIds = [
  "gri", "tcfd", "sbti", "iso14064", "carbon_trust", "ungc", "csrd", "cbam",
];

export const emissionFactorSources = [
  { value: "ghg_protocol", label: "GHG Protocol" },
  { value: "ademe", label: "ADEME (France)" },
  { value: "ecoinvent", label: "Ecoinvent" },
  { value: "ipcc", label: "IPCC" },
  { value: "iea", label: "IEA" },
  { value: "pcaf", label: "PCAF (Financial Sector)" },
  { value: "company_specific", label: "Company-Specific Factors" },
];

export const standardsMappingTable = [
  { id: "nfrs_main", industries: "All (listed)", focus: "Mandatory disclosure", s1: "Required", s2: "Required", s3: "Required", assurance: "External auditor", timeline: "Mandatory by 2026" },
  { id: "gri", industries: "All", focus: "Comprehensive ESG", s1: "Required", s2: "Required", s3: "Material only", assurance: "Optional", timeline: "Annual reporting" },
  { id: "ipieca", industries: "Energy/O&G", focus: "Technical rigor", s1: "Critical", s2: "Standard", s3: "Product use critical", assurance: "Third-party", timeline: "Annual" },
  { id: "tcfd", industries: "Finance/All", focus: "Climate risk", s1: "Standard", s2: "Standard", s3: "Portfolio-focused", assurance: "Optional", timeline: "Annual" },
  { id: "iso14064", industries: "All", focus: "Technical methodology", s1: "Detailed", s2: "Detailed", s3: "Detailed", assurance: "ISO auditor", timeline: "On-demand" },
  { id: "sbti", industries: "All (net-zero)", focus: "Target validation", s1: "Required", s2: "Required", s3: "Required", assurance: "SBTi verifier", timeline: "One-time validation" },
  { id: "gresb", industries: "Real Estate", focus: "RE benchmarking", s1: "Standard", s2: "Standard", s3: "Material only", assurance: "GRESB assessor", timeline: "Annual" },
  { id: "cbam", industries: "EU traders", focus: "Carbon border pricing", s1: "Critical", s2: "Standard", s3: "Product scope", assurance: "EU auditor", timeline: "2025+ reporting" },
];

export function getStandardById(id: string): StandardDefinition | undefined {
  return allStandards.find((s) => s.id === id);
}

export function getIndustryConfig(id: IndustryType): IndustryConfig | undefined {
  return industryConfigs.find((c) => c.id === id);
}

export function getBursaConfig(id: BursaListingType): BursaConfig | undefined {
  return bursaConfigs.find((c) => c.id === id);
}

export const emphasisLabels: Record<string, { label: string; color: string }> = {
  critical: { label: "Critical", color: "error" },
  significant: { label: "Significant", color: "warning" },
  moderate: { label: "Moderate", color: "info" },
  minor: { label: "Minor", color: "neutral" },
};
