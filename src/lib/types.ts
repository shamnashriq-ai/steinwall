// ========== Strategic Planning Canvas (6 Layers) ==========

export interface PurposeCanvas {
  visionStatement: string;
  drivers: { id: string; label: string; selected: boolean; rank: number }[];
  financialImpact: { type: "opportunity" | "risk" | "both"; revenue: string; costs: string; capitalAccess: string };
  strategicAnchors: string[];
  boardApproval?: { date: string; attendees: string; approved: boolean };
  status: "draft" | "complete" | "board_approved";
  updatedAt: string;
}

export const defaultPurposeDrivers = [
  { id: "d1", label: "Investor/Stakeholder Pressure", selected: false, rank: 0 },
  { id: "d2", label: "Customer Demand", selected: false, rank: 0 },
  { id: "d3", label: "Supply Chain Risk", selected: false, rank: 0 },
  { id: "d4", label: "Regulatory Requirement", selected: false, rank: 0 },
  { id: "d5", label: "Competitive Positioning", selected: false, rank: 0 },
  { id: "d6", label: "Workforce Attraction", selected: false, rank: 0 },
  { id: "d7", label: "Cost Reduction", selected: false, rank: 0 },
  { id: "d8", label: "Brand/Values", selected: false, rank: 0 },
];

export interface ChallengeItem {
  id: string;
  category: "operational" | "market" | "organizational" | "external";
  description: string;
  barriers: string[];
  severity: "high" | "medium" | "low";
}

export interface ChallengesCanvas {
  challenges: ChallengeItem[];
  capexRange: string;
  externalFinancing: string;
  leadershipDriver: string;
  status: "draft" | "complete";
  updatedAt: string;
}

export interface MissionCanvas {
  missionStatement: string;
  scope1: { included: boolean; target2030: string; target2050: string; baseline: string; baselineYear: string };
  scope2: { included: boolean; target2030: string; target2050: string; baseline: string; baselineYear: string; methodology: "location" | "market" };
  scope3: { included: boolean; target2030: string; target2050: string; baseline: string; baselineYear: string; categories: string[] };
  sbtAlignment: string;
  targetMethodology: string;
  interimMilestone: string;
  supplierCommitments: string[];
  boardApproval?: { date: string; attendees: string; approved: boolean; publicCommitment: boolean };
  status: "draft" | "complete" | "board_approved";
  updatedAt: string;
}

export const scope3Categories = [
  "1. Purchased goods & services",
  "2. Capital goods",
  "3. Fuel/energy-related activities",
  "4. Upstream transport",
  "5. Waste from operations",
  "6. Business travel",
  "7. Employee commuting",
  "8. Upstream leased assets",
  "9. Downstream transport",
  "10. Processing of sold products",
  "11. Use of sold products",
  "12. End-of-life treatment",
  "13. Downstream leased assets",
  "14. Franchises",
  "15. Investments",
];

export interface ActionInitiative {
  id: string;
  scope: "scope1" | "scope2" | "scope3" | "cross";
  name: string;
  goal: string;
  rationale: string;
  phases: { name: string; timeline: string; description: string }[];
  capex: string;
  owner: string;
  risks: string[];
  successMetrics: string[];
  priority: "high_quick" | "high_long" | "medium_quick" | "medium_long";
}

export interface ActionPlansCanvas {
  initiatives: ActionInitiative[];
  status: "draft" | "complete";
  updatedAt: string;
}

export interface ProcurementCategory {
  id: string;
  name: string;
  currentState: string;
  greenAlternative: string;
  procurementStrategy: string;
  costImpact: string;
  emissionsImpact: string;
}

export interface ProcurementCanvas {
  categories: ProcurementCategory[];
  greenPolicy: string;
  supplierCriteria: string[];
  annualBudget: string;
  status: "draft" | "complete";
  updatedAt: string;
}

export interface KPI {
  id: string;
  level: "board" | "department" | "operational";
  name: string;
  metric: string;
  current: string;
  target2026: string;
  target2030: string;
  owner: string;
  frequency: "daily" | "weekly" | "monthly" | "quarterly" | "annual";
}

export interface OKR {
  id: string;
  department: string;
  objective: string;
  keyResults: { id: string; description: string; timeline: string; status: "on_track" | "at_risk" | "off_track" | "not_started" }[];
}

export interface KPIsCanvas {
  kpis: KPI[];
  okrs: OKR[];
  status: "draft" | "complete";
  updatedAt: string;
}

export interface StrategicCanvas {
  purpose: PurposeCanvas | null;
  challenges: ChallengesCanvas | null;
  mission: MissionCanvas | null;
  actionPlans: ActionPlansCanvas | null;
  procurement: ProcurementCanvas | null;
  kpis: KPIsCanvas | null;
}

// ========== Audit Standards Framework ==========

export type BursaListingType = "main_market" | "ace_market" | "non_listed" | "glc";

export type IndustryType =
  | "energy_oil_gas"
  | "manufacturing"
  | "retail_consumer"
  | "financial_services"
  | "hospitality_tourism"
  | "property_real_estate"
  | "utilities_power"
  | "agriculture_food"
  | "healthcare_pharma"
  | "other";

export interface StandardsSelection {
  bursaListing: BursaListingType;
  industry: IndustryType;
  mandatoryStandards: string[];
  industryStandards: string[];
  voluntaryStandards: string[];
  primaryStandard: string;
  emissionFactorSource: string;
  baselineYear: string;
  reportingYear: string;
  boardApproval?: { date: string; approved: boolean };
  status: "draft" | "complete" | "board_approved";
  updatedAt: string;
}

// ========== Materiality Assessment ==========

export interface MaterialityIssue {
  id: string;
  name: string;
  category?: string;
  businessImpact: number;
  stakeholderConcern: number;
  stakeholderChecks?: Record<string, boolean>;
  combinedScore?: number;
  verdict?: string;
  isMaterial: boolean;
}

export interface MaterialityAssessment {
  id: string;
  industry: string;
  companyName: string;
  ebitda?: number;
  currency?: string;
  issues: MaterialityIssue[];
  scopePriorities: { scope1: number; scope2: number; scope3: number };
  boardMemo?: {
    meetingDate: string;
    attendees: string;
    approved: boolean;
    approvedDate?: string;
    memoText?: string;
  };
  status: "draft" | "complete" | "board_approved";
  createdAt: string;
  updatedAt: string;
}

// ========== Scope 1, 2, 3 Data ==========

export type ConfidenceLevel = "100%" | "75%" | "50%";
export type DataSource = "invoice" | "supplier_report" | "cdp" | "estimate" | "industry_average" | "spend_based";

export interface EmissionDataPoint {
  id: string;
  scope: 1 | 2 | 3;
  category: string;
  description: string;
  value: number;
  unit: string;
  emissionsTonneCO2e: number;
  source: DataSource;
  confidence: ConfidenceLevel;
  methodology: string;
  lastUpdated: string;
  updatedBy: string;
}

export interface Supplier {
  id: string;
  name: string;
  revenuePercent: number;
  sector: string;
  dataSource: "cdp" | "industry_average" | "spend_based";
  emissionsTonneCO2e: number;
  status: "verified" | "estimated" | "missing";
}

export interface ScopeData {
  scope1: EmissionDataPoint[];
  scope2: EmissionDataPoint[];
  scope3: EmissionDataPoint[];
  suppliers: Supplier[];
  totalS1: number;
  totalS2: number;
  totalS3: number;
  dataQualityScore: number;
  updatedAt: string;
}

// ========== Strategy Builder ==========

export interface StrategyProject {
  id: string;
  name: string;
  owner: string;
  timeline: string;
  status: "planned" | "in_progress" | "complete";
}

export interface StrategyInitiative {
  id: string;
  name: string;
  projects: StrategyProject[];
}

export interface Strategy {
  id: string;
  target2030: string;
  target2050: string;
  priorityScope: string;
  priorityCategory: string;
  expectedReduction: number;
  initiatives: StrategyInitiative[];
  boardApproval?: {
    meetingDate: string;
    attendees: string;
    approved: boolean;
    approvedDate?: string;
  };
  status: "draft" | "complete" | "board_approved";
  createdAt: string;
  updatedAt: string;
}

// ========== Audit Trail ==========

export interface AuditDecision {
  id: string;
  date: string;
  title: string;
  description: string;
  linkedDocument?: string;
  type: "board_decision" | "data_collection" | "methodology" | "strategy" | "execution";
}

export interface MethodologyCheck {
  id: string;
  label: string;
  checked: boolean;
  note?: string;
}

// ========== Governance Framework ==========

export type GovernanceModelType = "dedicated_committee" | "audit_committee" | "risk_committee" | "direct_board" | "no_formal";

export interface GovernanceCommittee {
  id: string;
  name: string;
  chair: string;
  members: string[];
  frequency: "monthly" | "quarterly" | "biannual" | "annual";
  decisionRights: string[];
  charter: string;
  includeIndependentDirectors: boolean;
  includeAuditChair: boolean;
  includeRiskChair: boolean;
  authorityLevel: "advisory" | "limited" | "full";
  esgAgendaMinutes: number;
  charterApproved: boolean;
  charterApprovedDate: string;
  minutesDocumented: boolean;
  minutesStorage: string;
}

export interface CompensationLinkage {
  baseSalary: string;
  bonusPotentialPercent: number;
  financialPercent: number;
  strategicPercent: number;
  climatePercent: number;
  climateMetrics: { metric: string; weight: number; target: string }[];
}

export interface GovernanceAccountability {
  id: string;
  role: string;
  name: string;
  yearsInRole: string;
  responsibilities: string[];
  successMetrics: string[];
  consequences: string;
  kpiLinked: boolean;
  compensationLinked: boolean;
  compensation: CompensationLinkage | null;
  reportingTo: string;
  boardApprovalDate: string;
  mandate: string;
}

export interface DecisionAuthority {
  committeeCanApprove: string[];
  boardMustApprove: string[];
  capexThreshold: string;
}

export interface GovernanceFramework {
  governanceModel: GovernanceModelType;
  boardOversight: GovernanceCommittee[];
  executiveAccountability: GovernanceAccountability[];
  decisionAuthority: DecisionAuthority;
  reportingCadence: string;
  integrationWithFinancialPlanning: string;
  investorDisclosure: string[];
  communicationMethod: string;
  governanceMaturityScore: number;
  accountabilityMaturityScore: number;
  boardApproval?: { date: string; approved: boolean; attendees: string; resolutionRef: string };
  status: "draft" | "complete" | "board_approved";
  updatedAt: string;
}

// ========== Climate Scenario Analysis ==========

export interface CarbonPriceTrajectory {
  year2025: string;
  year2030: string;
  year2040: string;
  year2050: string;
  basis: string;
}

export interface DemandForecast {
  product: string;
  current: string;
  forecast2030: string;
  forecast2040: string;
  forecast2050: string;
  assumption: string;
}

export interface TechnologyCostForecast {
  technology: string;
  currentCost: string;
  cost2030: string;
  cost2040: string;
  assumption: string;
}

export interface RegulatoryForecast {
  regulation: string;
  currentStatus: string;
  evolution: string;
  impact: string;
}

export interface ScenarioFinancials {
  revenueByProduct: { product: string; current: string; projected: string; changePercent: string }[];
  totalRevenue: string;
  energyCosts: string;
  carbonCosts: string;
  carbonCalcEmissions: string;
  carbonCalcPrice: string;
  otherCosts: string;
  totalCosts: string;
  ebitda: string;
  ebitdaMargin: string;
  strandedAssetWritedown: string;
  annualCapex: string;
  dividendCapacity: string;
  creditRating: string;
}

export interface ClimateScenario {
  id: string;
  name: string;
  type: "bau" | "1.5c" | "2c" | "stress";
  description: string;
  probability: "most_likely" | "possible" | "unlikely";
  stressType?: "technology" | "geopolitical" | "demand" | "financial" | "regulatory" | "custom";
  assumptions: { factor: string; value: string }[];
  carbonPrice: CarbonPriceTrajectory;
  demandForecasts: DemandForecast[];
  techForecasts: TechnologyCostForecast[];
  regulatoryForecasts: RegulatoryForecast[];
  strategyDescription: string;
  keyDecisions: string[];
  financials: ScenarioFinancials;
  revenueImpact: string;
  ebitdaImpact: string;
  capexRequired: string;
  strandedAssetRisk: string;
  timeline: string;
  strategyResponse: string;
  confidence: number;
}

export interface ResilienceAssessment {
  worksInBAU: boolean;
  worksIn15C: boolean;
  worksInStress: boolean;
  score: number;
  redFlags: string[];
  contingenciesNeeded: string[];
}

export interface ScenarioAnalysis {
  scenarios: ClimateScenario[];
  carbonPriceSensitivity: { price: number; impact: string }[];
  selectedPathway: string;
  resilience: ResilienceAssessment;
  boardApproval?: { date: string; approved: boolean; attendees: string };
  status: "draft" | "complete" | "board_approved";
  updatedAt: string;
}

// ========== Financial Impact Quantification ==========

export interface FinancialImpactYear {
  year: number;
  capex: number;
  opexChange: number;
  revenueAtRisk: number;
  strandedAssets: number;
  dividendImpact: number;
  debtCapacity: number;
}

export interface CapexBreakdown {
  id: string;
  category: string;
  description: string;
  annualAmount: number;
  isTransition: boolean;
}

export interface StrandedAssetCategory {
  id: string;
  name: string;
  bookValue: number;
  bauWritedown: number;
  bauProbability: number;
  aligned15cWritedown: number;
  aligned15cProbability: number;
  stressWritedown: number;
  stressProbability: number;
  probabilityWeightedRisk: number;
  mitigationStrategy: "managed_divestiture" | "early_retirement" | "asset_conversion" | "financial_hedging" | "none";
  mitigationDescription: string;
  mitigationSalvageValue: number;
}

export interface FundingGapAnalysis {
  totalCapexNeeded: number;
  operatingCashFlow: number;
  greenBonds: number;
  assetSales: number;
  govIncentives: number;
  debtCapacity: number;
  fundingGap: number;
  gapStrategy: string;
}

export interface FinancialImpactModel {
  currentEbitda: number;
  currentRevenue: number;
  currency: string;
  projections: FinancialImpactYear[];
  bauCapex: CapexBreakdown[];
  transitionCapex: CapexBreakdown[];
  transitionCostTotal: number;
  strandedAssets: StrandedAssetCategory[];
  totalStrandedRisk: number;
  fundingGap: FundingGapAnalysis;
  roiOnGreenCapex: string;
  creditRatingImpact: string;
  fundingSources: { source: string; amount: number; percentage: number }[];
  sensitivityFactors: { factor: string; lowCase: string; baseCase: string; highCase: string }[];
  boardApproval?: { date: string; approved: boolean; attendees: string };
  status: "draft" | "complete" | "board_approved";
  updatedAt: string;
}

// ========== Physical Risk Assessment ==========

export interface Facility {
  id: string;
  name: string;
  location: string;
  coordinates?: { lat: number; lng: number };
  assetValue: number;
  hazards: { type: string; severity: "high" | "medium" | "low"; likelihood: string; financialExposure: number }[];
  mitigationCapex: number;
  mitigationPlan: string;
  businessContinuityPlan: string;
}

export interface PhysicalRiskAssessment {
  facilities: Facility[];
  scenarioUsed: string;
  totalExposure: number;
  totalMitigationCapex: number;
  boardApproval?: { date: string; approved: boolean; attendees: string };
  status: "draft" | "complete" | "board_approved";
  updatedAt: string;
}

// ========== Stakeholder Engagement ==========

export interface StakeholderEngagement {
  id: string;
  stakeholderGroup: "investors" | "customers" | "suppliers" | "employees" | "communities" | "regulators" | "ngos" | "other";
  engagementMethod: "survey" | "workshop" | "interview" | "roundtable" | "meeting" | "other";
  date: string;
  participants: string;
  topConcerns: string[];
  response: string;
  evidenceRef: string;
  influencedMateriality: boolean;
}

export interface StakeholderEngagementRecord {
  engagements: StakeholderEngagement[];
  totalEngaged: number;
  materialTopicsInfluenced: string[];
  status: "draft" | "complete";
  updatedAt: string;
}

// ========== Segment-Level Strategy ==========

export interface SegmentOwnership {
  ownerTitle: string;
  ownerName: string;
  reportsTo: string;
  bonusTiedToClimate: boolean;
  climateCompPercent: number;
  capexApprovalAuthority: string;
  reportingFrequency: "monthly" | "quarterly";
  boardApprovalDate: string;
}

export interface SegmentFinancials {
  currentRevenue: number;
  revenue2030: number;
  revenue2040: number;
  currentEbitda: number;
  ebitda2030: number;
  ebitda2040: number;
  annualCapex2025_2030: number;
  annualCapex2030_2040: number;
  totalCapex15Year: number;
  renewableROI: string;
  efficiencyROI: string;
}

export interface BusinessSegment {
  id: string;
  name: string;
  revenueContribution: number;
  emissionsScope1: number;
  emissionsScope2: number;
  emissionsScope3: number;
  percentOfGroupEmissions: number;
  majorSources: string[];
  climateRisks: { risk: string; impactRM: string; probability: string; mitigation: string }[];
  climateOpportunities: { opportunity: string; potentialRM: string; capexRequired: string; roi: string }[];
  strategy: string;
  targetReduction2030: string;
  targetReduction2040: string;
  targetReduction2050: string;
  renewablePercent2030: string;
  renewablePercent2050: string;
  capexAllocated: number;
  milestones: { year: number; description: string; status: "planned" | "in_progress" | "complete" }[];
  ownership: SegmentOwnership;
  financials: SegmentFinancials;
}

export interface SegmentStrategy {
  segments: BusinessSegment[];
  totalGroupEmissions: number;
  boardApproval?: { date: string; approved: boolean; attendees: string };
  status: "draft" | "complete" | "board_approved";
  updatedAt: string;
}

// ========== Multi-Year Comparatives ==========

export interface YearlyMetric {
  year: number;
  scope1: number;
  scope2: number;
  scope3: number;
  total: number;
  energyConsumption: number;
  waterWithdrawal: number;
  wasteGenerated: number;
  methodology: string;
  notes: string;
}

export interface ComparativeData {
  metrics: YearlyMetric[];
  baselineYear: number;
  trends: { metric: string; direction: "improving" | "stable" | "declining"; annualChange: string }[];
  anomalies: { year: number; metric: string; description: string }[];
  status: "draft" | "complete";
  updatedAt: string;
}

// ========== Audit Export ==========

export interface AuditWorkpaper {
  id: string;
  metricName: string;
  currentValue: string;
  priorYear1: string;
  priorYear2: string;
  calculationMethod: string;
  dataSource: string;
  assumptions: string;
  preparer: string;
  preparerDate: string;
  reviewer: string;
  reviewerDate: string;
}

export interface AuditExportConfig {
  workpapers: AuditWorkpaper[];
  methodologyDoc: { standard: string; scope: string; emissionFactors: string; boundary: string; limitations: string };
  sourceDocIndex: { document: string; location: string; maintainer: string }[];
  auditorSummary: { materialMetrics: string[]; riskAreas: string[]; limitations: string[]; priorFindings: string[] };
  exportFormat: "pdf" | "excel" | "xbrl";
  status: "draft" | "complete";
  updatedAt: string;
}

// ========== App State ==========

export interface SteinwallData {
  companyName: string;
  industry: string;
  auditDueDate?: string;
  standardsSelection: StandardsSelection | null;
  strategicCanvas: StrategicCanvas;
  materiality: MaterialityAssessment | null;
  scopeData: ScopeData;
  strategy: Strategy | null;
  governance: GovernanceFramework | null;
  scenarioAnalysis: ScenarioAnalysis | null;
  financialImpact: FinancialImpactModel | null;
  physicalRisk: PhysicalRiskAssessment | null;
  stakeholderEngagement: StakeholderEngagementRecord | null;
  segmentStrategy: SegmentStrategy | null;
  comparativeData: ComparativeData | null;
  auditExport: AuditExportConfig | null;
  auditDecisions: AuditDecision[];
  methodologyChecks: MethodologyCheck[];
  users: { name: string; email: string; role: "admin" | "contributor" | "viewer" }[];
  lastUpdated: string;
}

export const defaultStrategicCanvas: StrategicCanvas = {
  purpose: null,
  challenges: null,
  mission: null,
  actionPlans: null,
  procurement: null,
  kpis: null,
};

export const defaultScopeData: ScopeData = {
  scope1: [],
  scope2: [],
  scope3: [],
  suppliers: [],
  totalS1: 0,
  totalS2: 0,
  totalS3: 0,
  dataQualityScore: 0,
  updatedAt: new Date().toISOString(),
};

export const defaultSteinwallData: SteinwallData = {
  companyName: "",
  industry: "",
  standardsSelection: null,
  strategicCanvas: defaultStrategicCanvas,
  materiality: null,
  scopeData: defaultScopeData,
  strategy: null,
  governance: null,
  scenarioAnalysis: null,
  financialImpact: null,
  physicalRisk: null,
  stakeholderEngagement: null,
  segmentStrategy: null,
  comparativeData: null,
  auditExport: null,
  auditDecisions: [],
  methodologyChecks: [
    { id: "mc1", label: "Scope 1 methodology documented", checked: false },
    { id: "mc2", label: "Scope 2 location-based choice justified", checked: false },
    { id: "mc3", label: "Scope 3 categories selected based on materiality", checked: false },
    { id: "mc4", label: "Emission factors from GHG Protocol / ADEME / Ecoinvent", checked: false },
    { id: "mc5", label: "Supplier data from verified sources (CDP, direct inquiry) or industry average", checked: false },
  ],
  users: [],
  lastUpdated: new Date().toISOString(),
};
