import type { GovernanceModelType } from "./types";

export const governanceModelOptions: { value: GovernanceModelType; label: string; description: string; auditReady: boolean; recommended: boolean }[] = [
  { value: "dedicated_committee", label: "A. Dedicated Climate/Sustainability Committee", description: "Board-level ownership with quarterly meetings and clear decision authority. Recommended for companies with 5+ board members wanting formal governance.", auditReady: true, recommended: true },
  { value: "audit_committee", label: "B. Integrated into Audit Committee", description: "Uses existing board structure. Lower bureaucracy but ESG may be squeezed by audit items. Good for small boards.", auditReady: false, recommended: false },
  { value: "risk_committee", label: "C. Integrated into Risk Committee", description: "Climate treated as strategic risk within existing risk committee. Good for companies with strong risk management discipline.", auditReady: false, recommended: false },
  { value: "direct_board", label: "D. Direct Board-Level Oversight", description: "CEO & board own strategy directly. Highest visibility but requires board time sacrifice. Best for conglomerates.", auditReady: true, recommended: false },
  { value: "no_formal", label: "E. No Formal Governance Yet", description: "Red flag for 2027 NFRS compliance. We'll help you design a structure.", auditReady: false, recommended: false },
];

export const authorityLevelOptions = [
  { value: "advisory" as const, label: "Level 1: Advisory", description: "Committee proposes, board decides. Appropriate for strategy/targets." },
  { value: "limited" as const, label: "Level 2: Decide within Budget", description: "Committee approves capex within threshold, board approves above. Appropriate for operational decisions." },
  { value: "full" as const, label: "Level 3: Full Authority", description: "Committee approves all decisions, reports to board. Most audit-credible." },
];

export const committeeCanApproveDefaults = [
  "Annual climate targets (Scope 1, 2, 3)",
  "Capex below threshold for decarbonization",
  "Supplier engagement targets",
  "Reporting & disclosure decisions",
];

export const boardMustApproveDefaults = [
  "Capex above threshold",
  "Major strategy pivots (e.g., asset divestment)",
  "Long-term targets (2050 net-zero)",
  "Board compensation linkage changes",
  "M&A related to transition",
];

export const stressScenarioTypes = [
  { value: "technology" as const, label: "Technology Shock", description: "Breakthrough in renewable/battery tech happens faster than expected. Makes current strategy obsolete overnight.", example: "Battery cost drops to RM 50/kWh by 2032 (vs forecast 2040). EV adoption becomes unstoppable by 2030." },
  { value: "geopolitical" as const, label: "Geopolitical Shock", description: "Energy security crisis forces governments to de-carbonize faster OR creates oil price spike.", example: "Supply disruption causes oil spike to USD 200/bbl. Green energy suddenly becomes economical." },
  { value: "demand" as const, label: "Demand Shock", description: "Consumers suddenly shift preference. China dominates EV market and drives global transition.", example: "EV adoption hits 80% of new cars by 2032 (vs 40% forecast). Oil demand drops 80% by 2035." },
  { value: "financial" as const, label: "Financial Shock", description: "ESG investors divest fossil fuels en masse. Cost of capital rises, refinancing becomes impossible.", example: "Oil company bond yields spike to 10% (from 3%). Renewable bonds stay at 2%." },
  { value: "regulatory" as const, label: "Regulatory Shock", description: "Government suddenly implements carbon ban or phase-out. No gradual transition.", example: "New government mandates all fossil fuel operations must cease by 2035." },
  { value: "custom" as const, label: "Custom Stress Scenario", description: "Define your own company-specific risk scenario.", example: "" },
];

export const investorDisclosureOptions = [
  "Proxy statement / AGM materials",
  "Compensation disclosure",
  "Sustainability report",
  "Investor presentations",
  "Not yet disclosed (internal only)",
];

export const communicationMethodOptions = [
  "Written accountability letters from CEO to each owner",
  "Board-approved compensation disclosures filed with regulators",
  "Disclosed publicly in Sustainability Report",
  "Not yet formalized",
];

export const strandedAssetCategoryTemplates = [
  { name: "Oil & Gas Reserves", description: "Producing & undeveloped reserves at book value" },
  { name: "Fossil Fuel Plants & Infrastructure", description: "Coal plants, oil refineries, gas processing" },
  { name: "Vehicle Fleet", description: "Company-owned/leased ICE vehicles" },
  { name: "Property / Real Estate", description: "Facilities in carbon-heavy locations" },
  { name: "Supply Chain Assets", description: "Supplier assets that may become obsolete" },
];

export const mitigationStrategyOptions = [
  { value: "managed_divestiture" as const, label: "Managed Divestiture", description: "Sell assets early before stranding. Better to sell at 80% than lose 100% later." },
  { value: "early_retirement" as const, label: "Early Retirement with Planning", description: "Retire assets on planned schedule with environmental remediation." },
  { value: "asset_conversion" as const, label: "Asset Conversion", description: "Convert fossil assets to clean uses (e.g., coal plant to biomass)." },
  { value: "financial_hedging" as const, label: "Financial Hedging", description: "Use carbon futures, insurance products, or put options to hedge risk." },
  { value: "none" as const, label: "No Mitigation Yet", description: "Asset stranding risk is unmitigated." },
];

export const capexCategoryTemplates = [
  { category: "Renewable Energy Expansion", description: "Solar, wind, hydro capacity build-out", isTransition: true },
  { category: "Hydrogen / Carbon Capture", description: "Green hydrogen production, CCS infrastructure", isTransition: true },
  { category: "Energy Efficiency Retrofit", description: "Building and facility energy upgrades", isTransition: true },
  { category: "Grid / Battery Infrastructure", description: "Battery storage, grid reinforcement", isTransition: true },
  { category: "Supply Chain Decarbonization", description: "Supplier programs, alternative materials R&D", isTransition: true },
  { category: "Production Facilities Maintenance", description: "Existing facility maintenance & upgrades", isTransition: false },
  { category: "Traditional Energy Expansion", description: "Legacy operations expansion (if applicable)", isTransition: false },
  { category: "Infrastructure & IT", description: "General infrastructure and technology", isTransition: false },
];

export const climateHazards = [
  { type: "Flooding", icon: "Waves", category: "acute" },
  { type: "Cyclone / Typhoon", icon: "Wind", category: "acute" },
  { type: "Extreme Heat", icon: "Thermometer", category: "chronic" },
  { type: "Drought", icon: "CloudOff", category: "chronic" },
  { type: "Sea Level Rise", icon: "TrendingUp", category: "chronic" },
  { type: "Wildfire", icon: "Flame", category: "acute" },
  { type: "Landslide", icon: "Mountain", category: "acute" },
  { type: "Water Stress", icon: "Droplets", category: "chronic" },
] as const;

export const scenarioTemplates = [
  {
    id: "bau",
    name: "Business-as-Usual (4°C)",
    type: "bau" as const,
    description: "Current trajectory continues. Limited policy intervention, gradual transition.",
    defaultAssumptions: [
      { factor: "Carbon Price (2030)", value: "RM 50/tonne" },
      { factor: "Carbon Price (2050)", value: "RM 100/tonne" },
      { factor: "Oil Demand (2040 vs 2020)", value: "-10%" },
      { factor: "Renewable Cost Decline", value: "-30%" },
      { factor: "Regulatory Pressure", value: "Moderate" },
    ],
  },
  {
    id: "1.5c",
    name: "1.5°C Aligned (IEA NZE)",
    type: "1.5c" as const,
    description: "Aggressive decarbonization. Strong policy, rapid transition, stranded asset risk.",
    defaultAssumptions: [
      { factor: "Carbon Price (2030)", value: "RM 100/tonne" },
      { factor: "Carbon Price (2050)", value: "RM 200/tonne" },
      { factor: "Oil Demand (2040 vs 2020)", value: "-50%" },
      { factor: "Renewable Cost Decline", value: "-60%" },
      { factor: "Regulatory Pressure", value: "Very High" },
    ],
  },
  {
    id: "2c",
    name: "2°C Pathway",
    type: "2c" as const,
    description: "Moderate decarbonization. Policy alignment with Paris Agreement goals.",
    defaultAssumptions: [
      { factor: "Carbon Price (2030)", value: "RM 75/tonne" },
      { factor: "Carbon Price (2050)", value: "RM 150/tonne" },
      { factor: "Oil Demand (2040 vs 2020)", value: "-30%" },
      { factor: "Renewable Cost Decline", value: "-45%" },
      { factor: "Regulatory Pressure", value: "High" },
    ],
  },
  {
    id: "stress",
    name: "Stress Test (Supply-Constrained)",
    type: "stress" as const,
    description: "Supply shocks, technology delays, weak enforcement. Higher commodity prices but regulatory whiplash risk.",
    defaultAssumptions: [
      { factor: "Carbon Price (2030)", value: "RM 20-50/tonne" },
      { factor: "Carbon Price (2050)", value: "RM 50-100/tonne" },
      { factor: "Oil Demand (2040 vs 2020)", value: "+5% to -15%" },
      { factor: "Renewable Cost Decline", value: "-20%" },
      { factor: "Regulatory Pressure", value: "Low-Medium (volatile)" },
    ],
  },
];

export const stakeholderGroups = [
  { value: "investors", label: "Investors / Shareholders", weight: 30 },
  { value: "customers", label: "Customers / Buyers", weight: 25 },
  { value: "suppliers", label: "Suppliers / Supply Chain", weight: 10 },
  { value: "employees", label: "Employees / Workforce", weight: 10 },
  { value: "communities", label: "Local Communities", weight: 5 },
  { value: "regulators", label: "Regulators / Government", weight: 15 },
  { value: "ngos", label: "NGOs / Civil Society", weight: 5 },
] as const;

export const engagementMethods = [
  { value: "survey", label: "Survey / Questionnaire" },
  { value: "workshop", label: "Workshop / Focus Group" },
  { value: "interview", label: "Interview (1-on-1)" },
  { value: "roundtable", label: "Roundtable / Panel" },
  { value: "meeting", label: "Meeting / Presentation" },
  { value: "other", label: "Other" },
] as const;

export const governanceRoles = [
  { role: "Board Chair", typical: "Overall governance oversight" },
  { role: "Sustainability Committee Chair", typical: "Board-level sustainability oversight" },
  { role: "CEO", typical: "Strategic direction, net-zero commitment" },
  { role: "CFO", typical: "Financial planning, transition capex, green financing" },
  { role: "Chief Sustainability Officer", typical: "ESG strategy execution, reporting, stakeholder engagement" },
  { role: "Chief Risk Officer", typical: "Climate risk integration with enterprise risk management" },
  { role: "Head of Operations", typical: "Scope 1 & 2 reduction, facility management" },
  { role: "Head of Procurement", typical: "Scope 3 supplier engagement, green procurement" },
] as const;

export const reportingCadenceOptions = [
  "Monthly executive review + Quarterly board update",
  "Quarterly executive review + Biannual board update",
  "Monthly executive review + Quarterly board update + Annual strategy review",
] as const;

export const nfrsCompliancePhases = [
  { group: "Group 1", description: "Large-cap Main Market (>RM2B)", effective: "1 January 2025", requirements: "IFRS S1 + S2 (climate-first)", assurance: "Limited assurance by 2027" },
  { group: "Group 2", description: "Remaining Main Market (<RM2B)", effective: "1 January 2026", requirements: "Climate-first IFRS S2, phased S1", assurance: "Limited assurance 2-3 years post-start" },
  { group: "Group 3", description: "ACE Market + Large Non-Listed (>RM2B revenue)", effective: "1 January 2027", requirements: "Full IFRS S1 + S2", assurance: "Reasonable assurance on S1, S2" },
] as const;

export const defaultWorkpaperMetrics = [
  "Scope 1 Direct Emissions (tCO2e)",
  "Scope 2 Electricity Emissions (tCO2e)",
  "Scope 3 Value Chain Emissions (tCO2e)",
  "Total GHG Emissions (tCO2e)",
  "Energy Consumption (MWh)",
  "Renewable Energy Percentage (%)",
  "Water Withdrawal (m³)",
  "Waste Generated (tonnes)",
  "Methane Emissions (tCO2e)",
  "Emission Intensity (tCO2e/RM million revenue)",
] as const;
