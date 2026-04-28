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
  materiality: MaterialityAssessment | null;
  scopeData: ScopeData;
  strategy: Strategy | null;
  auditDecisions: AuditDecision[];
  methodologyChecks: MethodologyCheck[];
  users: { name: string; email: string; role: "admin" | "contributor" | "viewer" }[];
  lastUpdated: string;
}

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
