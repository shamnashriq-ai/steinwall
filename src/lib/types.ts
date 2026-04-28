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

// ========== Materiality Assessment ==========

export interface MaterialityIssue {
  id: string;
  name: string;
  businessImpact: number; // 1-10 Likert
  stakeholderConcern: number; // 1-10 Likert
  isMaterial: boolean;
}

export interface MaterialityAssessment {
  id: string;
  industry: string;
  companyName: string;
  issues: MaterialityIssue[];
  scopePriorities: { scope1: number; scope2: number; scope3: number };
  boardMemo?: {
    meetingDate: string;
    attendees: string;
    approved: boolean;
    approvedDate?: string;
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

// ========== App State ==========

export interface SteinwallData {
  companyName: string;
  industry: string;
  auditDueDate?: string;
  strategicCanvas: StrategicCanvas;
  materiality: MaterialityAssessment | null;
  scopeData: ScopeData;
  strategy: Strategy | null;
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
  strategicCanvas: defaultStrategicCanvas,
  materiality: null,
  scopeData: defaultScopeData,
  strategy: null,
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
