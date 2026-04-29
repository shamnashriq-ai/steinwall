export interface ScaleDefinition {
  score: number;
  label: string;
  ebitdaRange: string;
  description: string;
  boardLevel: string;
}

export const financialScaleDefinitions: ScaleDefinition[] = [
  { score: 1, label: "Negligible", ebitdaRange: "< 0.1%", description: "Would never appear in board reporting. Single process, single location.", boardLevel: "Not reported" },
  { score: 2, label: "Minor", ebitdaRange: "0.1% – 0.5%", description: "Operational issue, not strategic. Could affect budget, not capital allocation.", boardLevel: "Not reported" },
  { score: 3, label: "Low", ebitdaRange: "0.5% – 1%", description: "Noticeable operational cost but manageable. Board mentions in passing.", boardLevel: "Mentioned" },
  { score: 4, label: "Moderate-Low", ebitdaRange: "1% – 2%", description: "Affects departmental budgets. Board discusses in ESG committee, not main board.", boardLevel: "ESG committee" },
  { score: 5, label: "Moderate", ebitdaRange: "2% – 5%", description: "Significant operational cost — first material threshold. Investors ask about it.", boardLevel: "Quarterly review" },
  { score: 6, label: "Moderate-High", ebitdaRange: "5% – 10%", description: "Material to strategic planning. Affects access to finance and credit ratings.", boardLevel: "Board-level decision" },
  { score: 7, label: "High", ebitdaRange: "10% – 20%", description: "Significant threat to profitability. Must be disclosed to investors as material risk.", boardLevel: "Board owns" },
  { score: 8, label: "Very High", ebitdaRange: "20% – 50%", description: "Existential risk to business model. Affects bond ratings and covenant compliance.", boardLevel: "Board priority" },
  { score: 9, label: "Critical", ebitdaRange: "50% – 100%+", description: "Could bankrupt the company if not managed. Every stakeholder is watching.", boardLevel: "CEO owns" },
  { score: 10, label: "Existential", ebitdaRange: "> 100%", description: "Could eliminate the company. Questions the company's long-term viability.", boardLevel: "Existential" },
];

export interface StakeholderScaleDefinition {
  score: number;
  label: string;
  percentCare: string;
  description: string;
}

export const stakeholderScaleDefinitions: StakeholderScaleDefinition[] = [
  { score: 1, label: "No Concern", percentCare: "< 10%", description: "Not mentioned in engagement conversations. Not a decision factor." },
  { score: 2, label: "Minor Interest", percentCare: "10–20%", description: "Some stakeholders mention it, but not a decision driver." },
  { score: 3, label: "Low Concern", percentCare: "20–30%", description: "On stakeholder radar but not high priority. Investors ask occasionally." },
  { score: 4, label: "Moderate-Low", percentCare: "30–50%", description: "Clear interest starting to influence behavior. Customers asking, investors requesting data." },
  { score: 5, label: "Moderate", percentCare: "50%+", description: "Explicitly influences decisions — first material threshold. Investors use in ESG screening." },
  { score: 6, label: "Moderate-High", percentCare: "50–70%", description: "Key decision criterion. Major investors have specific targets you must meet." },
  { score: 7, label: "High", percentCare: "70%+", description: "Make-or-break for key stakeholders. Market access depends on performance." },
  { score: 8, label: "Very High", percentCare: "80%+", description: "Existential to stakeholder confidence. Regulatory with teeth — penalties or license loss." },
  { score: 9, label: "Critical", percentCare: "90%+", description: "Defines company reputation and viability. Failure triggers divestment, boycott, or regulatory action." },
  { score: 10, label: "Existential", percentCare: "95%+", description: "Non-negotiable. Failure triggers legal action, boycotts, regulatory shutdown." },
];

export interface StakeholderCheck {
  id: string;
  label: string;
  weight: number;
  description: string;
}

export const stakeholderChecks: StakeholderCheck[] = [
  { id: "investors", label: "Investors ask about this", weight: 0.3, description: "ESG screening, divestment risk, valuation impact" },
  { id: "customers", label: "Customers demand action", weight: 0.25, description: "Purchasing decisions, supplier requirements, brand preference" },
  { id: "lenders", label: "Lenders tie financing to this", weight: 0.2, description: "Green bonds, sustainability-linked loans, credit terms" },
  { id: "regulators", label: "Regulators require disclosure", weight: 0.15, description: "NFRS compliance, carbon tax, ETS, Bursa requirements" },
  { id: "employees", label: "Employees view this as critical", weight: 0.1, description: "Talent attraction, retention, morale, purpose alignment" },
  { id: "communities", label: "Communities demand action", weight: 0.1, description: "License to operate, local impact, social pressure" },
];

export type MaterialityVerdict = "not_material" | "operational" | "material" | "highly_material" | "critical";

export interface VerdictDefinition {
  key: MaterialityVerdict;
  label: string;
  range: string;
  color: string;
  bgColor: string;
  description: string;
  actions: string[];
}

export const verdictDefinitions: VerdictDefinition[] = [
  {
    key: "not_material",
    label: "Not Material",
    range: "1–2",
    color: "text-text-secondary",
    bgColor: "bg-neutral-light",
    description: "Low financial impact, low stakeholder concern. Nice to have, not strategic.",
    actions: ["No disclosure required", "Address if budget allows"],
  },
  {
    key: "operational",
    label: "Operationally Important",
    range: "3–4",
    color: "text-primary",
    bgColor: "bg-primary-light",
    description: "Costs money, stakeholders notice, but not critical to business.",
    actions: ["Budget approval", "Departmental monitoring", "Optional disclosure"],
  },
  {
    key: "material",
    label: "Material",
    range: "5–6",
    color: "text-warning",
    bgColor: "bg-warning-light",
    description: "Significant financial impact OR clear stakeholder concern. Board should oversee.",
    actions: ["Board quarterly review", "Capital allocation", "NFRS disclosure required", "Auditor review"],
  },
  {
    key: "highly_material",
    label: "Highly Material",
    range: "7–8",
    color: "text-error",
    bgColor: "bg-error-light",
    description: "Significant financial impact AND high stakeholder concern. Strategic priority.",
    actions: ["Board member accountability", "Material to NFRS/IFRS", "Affects credit rating", "Investor communication"],
  },
  {
    key: "critical",
    label: "Critical",
    range: "9–10",
    color: "text-error",
    bgColor: "bg-error-light",
    description: "Could threaten company viability. CEO/Board ownership with continuous monitoring.",
    actions: ["CEO/Board ownership", "Continuous monitoring", "Affects bonuses/incentives", "May affect credit rating"],
  },
];

export function computeCombinedScore(financial: number, stakeholder: number): number {
  return Math.round(((financial + stakeholder) / 2) * 10) / 10;
}

export function getVerdict(combinedScore: number): VerdictDefinition {
  if (combinedScore <= 2) return verdictDefinitions[0];
  if (combinedScore <= 4) return verdictDefinitions[1];
  if (combinedScore <= 6) return verdictDefinitions[2];
  if (combinedScore <= 8) return verdictDefinitions[3];
  return verdictDefinitions[4];
}

export function computeStakeholderScore(checks: Record<string, boolean>): number {
  const totalWeight = stakeholderChecks.reduce((sum, c) => sum + c.weight, 0);
  const selectedWeight = stakeholderChecks
    .filter((c) => checks[c.id])
    .reduce((sum, c) => sum + c.weight, 0);
  const ratio = selectedWeight / totalWeight;
  const count = stakeholderChecks.filter((c) => checks[c.id]).length;

  if (count === 0) return 1;
  if (count === 1) return 2;
  if (count === 2) return 3;
  if (count === 3) return ratio >= 0.55 ? 5 : 4;
  if (count === 4) return ratio >= 0.7 ? 6 : 5;
  if (count === 5) return ratio >= 0.8 ? 7 : 6;
  return 8;
}

export function getEbitdaImpact(score: number, ebitda: number): { low: number; high: number } {
  const ranges: [number, number][] = [
    [0, 0.001],      // 1
    [0.001, 0.005],   // 2
    [0.005, 0.01],    // 3
    [0.01, 0.02],     // 4
    [0.02, 0.05],     // 5
    [0.05, 0.10],     // 6
    [0.10, 0.20],     // 7
    [0.20, 0.50],     // 8
    [0.50, 1.00],     // 9
    [1.00, 2.00],     // 10
  ];
  const [lowPct, highPct] = ranges[Math.min(score, 10) - 1];
  return { low: Math.round(ebitda * lowPct), high: Math.round(ebitda * highPct) };
}

export function getMatrixColor(financial: number, stakeholder: number): string {
  const combined = (financial + stakeholder) / 2;
  if (combined >= 9) return "#DC2626";
  if (combined >= 7) return "#EA580C";
  if (combined >= 5) return "#D97706";
  if (combined >= 3) return "#2563EB";
  return "#6B7280";
}

export interface NfrsThreshold {
  scoreRange: string;
  status: string;
  disclosure: string;
  auditorReview: string;
}

export const nfrsThresholds: NfrsThreshold[] = [
  { scoreRange: "1–2", status: "Not material", disclosure: "No disclosure", auditorReview: "Not reviewed" },
  { scoreRange: "3–4", status: "Below materiality", disclosure: "Optional disclosure", auditorReview: "Not reviewed" },
  { scoreRange: "5–7", status: "Material", disclosure: "Board disclosure required", auditorReview: "External auditor verifies" },
  { scoreRange: "8–10", status: "Critical Material", disclosure: "Full disclosure + risk section", auditorReview: "Deep audit dive" },
];

export interface ScoringMistake {
  title: string;
  wrong: string;
  right: string;
  fix: string;
}

export const scoringMistakes: ScoringMistake[] = [
  {
    title: "Confusing Stakeholder Noise with Materiality",
    wrong: "Activists are loudly complaining about X, so it's score 8",
    right: "Activists + investors + customers care, 70% of stakeholders affected — Score 6-7",
    fix: "Only count stakeholders who actively influence decisions (invest/divest, buy/don't buy, work/leave).",
  },
  {
    title: "Inflating Financial Impact",
    wrong: "Climate change could destroy the world, so all issues are Score 10",
    right: "Specific carbon tax on our operations = RM X million = Y% of EBITDA — Score [specific]",
    fix: "Quantify. Use EBITDA as denominator. Get specific. Avoid unlikely what-if scenarios.",
  },
  {
    title: "Forgetting to Update Scores",
    wrong: "Score something in 2024, never revisit",
    right: "Rescore annually or when material change occurs",
    fix: "Stakeholder concern increases over time. A Score 4 in 2024 might be Score 6 in 2026.",
  },
];
