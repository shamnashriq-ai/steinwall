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
