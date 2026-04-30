import { type ReactNode } from "react";

interface HelpEntry {
  tooltip: string;
  modal?: { title: string; content: ReactNode };
  guide?: { title: string; content: ReactNode };
}

export const governanceHelp: Record<string, HelpEntry> = {
  governanceModel: {
    tooltip: "How your board oversees climate strategy. Auditors ask: 'Who approved your 2050 net-zero target?'",
    modal: {
      title: "Governance Model Selection",
      content: (
        <div className="flex flex-col gap-2">
          <p>IFRS S1 requires companies to disclose the governance body responsible for oversight of climate-related risks and opportunities.</p>
          <p className="font-medium">Scoring Logic:</p>
          <ul className="list-disc pl-4 space-y-1">
            <li>Model A (Dedicated Committee): +3 points — best practice, auditor-preferred</li>
            <li>Model B (Audit Committee): +2 points — acceptable if ESG agenda time is 30+ min</li>
            <li>Model C (Risk Committee): +2 points — good for risk-heavy industries</li>
            <li>Model D (Direct Board): +3 points — works for smaller boards</li>
            <li>Model E (No Formal): +0 points — red flag, must remediate before 2027</li>
          </ul>
        </div>
      ),
    },
    guide: {
      title: "Governance Model — Full Guide",
      content: (
        <div className="flex flex-col gap-3">
          <p>Your climate governance structure determines how effectively sustainability risks are identified, managed, and escalated. This is the first thing auditors check under IFRS S1.</p>
          <p className="font-medium">Why it matters for 2027 NFRS compliance:</p>
          <p>Malaysian companies must demonstrate board-level oversight of climate strategy. Without a formal governance structure, your NFRS disclosure will receive qualified findings.</p>
          <p className="font-medium">Decision framework:</p>
          <ul className="list-disc pl-4 space-y-1">
            <li>If your board has 10+ members → Dedicated Sustainability Committee (Model A)</li>
            <li>If your audit committee already reviews ESG → Integrate (Model B) with minimum 45 min agenda allocation</li>
            <li>If you are in oil & gas, mining, or heavy industry → Risk Committee (Model C) may be natural fit</li>
            <li>If your board is small (5-7 members) → Direct Board (Model D) keeps it efficient</li>
          </ul>
          <p className="font-medium mt-2">Red flags auditors look for:</p>
          <ul className="list-disc pl-4 space-y-1">
            <li>No named committee or board member responsible for climate</li>
            <li>Climate discussed less than quarterly at board level</li>
            <li>No charter or terms of reference for the oversight body</li>
            <li>No documented meeting minutes showing climate discussion</li>
          </ul>
        </div>
      ),
    },
  },
  committeeName: {
    tooltip: "Name your committee clearly. Auditors will reference this in their reports.",
    modal: {
      title: "Committee Naming",
      content: (
        <div className="flex flex-col gap-2">
          <p>Use a name that clearly signals climate/ESG oversight responsibility.</p>
          <p className="font-medium">Examples:</p>
          <ul className="list-disc pl-4 space-y-1">
            <li>Sustainability & Climate Committee</li>
            <li>Board ESG & Risk Committee</li>
            <li>Climate Transition Oversight Committee</li>
          </ul>
          <p>Avoid generic names like "Special Committee" — auditors need clarity.</p>
        </div>
      ),
    },
  },
  meetingFrequency: {
    tooltip: "How often does your board meet on climate? Quarterly is the minimum for NFRS compliance.",
    modal: {
      title: "Meeting Frequency",
      content: (
        <div className="flex flex-col gap-2">
          <p className="font-medium">Scoring impact:</p>
          <ul className="list-disc pl-4 space-y-1">
            <li>Monthly: +2 points — shows active engagement</li>
            <li>Quarterly: +1 point — minimum acceptable frequency</li>
            <li>Biannual: +0.5 — below NFRS expectations</li>
            <li>Annual: +0 — insufficient for compliance</li>
          </ul>
          <p>Tip: If monthly is too frequent for full board, consider monthly committee meetings with quarterly board reporting.</p>
        </div>
      ),
    },
  },
  authorityLevel: {
    tooltip: "Can this committee make binding decisions, or only recommendations?",
  },
  executiveAccountability: {
    tooltip: "Name the person, not just the role. Auditors ask: 'Who specifically is accountable if you miss your emissions targets?'",
    modal: {
      title: "Executive Accountability",
      content: (
        <div className="flex flex-col gap-2">
          <p>IFRS S1 requires disclosure of management's role in climate oversight. This means named individuals with clear mandates.</p>
          <p className="font-medium">Minimum roles to assign:</p>
          <ul className="list-disc pl-4 space-y-1">
            <li>CEO / Group CEO — overall strategy ownership</li>
            <li>CFO — financial impact quantification, capex allocation</li>
            <li>COO — operational decarbonization execution</li>
            <li>Head of Sustainability — data quality, reporting</li>
          </ul>
          <p className="font-medium">Scoring: +2 points for having any named owner, +1 per 2 additional owners, +2 if compensation-linked</p>
        </div>
      ),
    },
  },
  compensationLinkage: {
    tooltip: "If executives' bonuses aren't tied to climate targets, the strategy is theater. This is where it becomes real.",
    modal: {
      title: "Compensation Linkage to Climate Targets",
      content: (
        <div className="flex flex-col gap-2">
          <p>Best practice: 15-25% of variable compensation tied to climate KPIs.</p>
          <p className="font-medium">Typical bonus structure:</p>
          <ul className="list-disc pl-4 space-y-1">
            <li>Financial performance: 50-60%</li>
            <li>Strategic initiatives: 20-30%</li>
            <li>Climate targets: 15-25%</li>
          </ul>
          <p className="font-medium">Climate metrics that work:</p>
          <ul className="list-disc pl-4 space-y-1">
            <li>Scope 1+2 emissions reduction (% vs baseline)</li>
            <li>Renewable energy procurement (% of total)</li>
            <li>Green capex deployment (RM spent vs target)</li>
            <li>Data quality score (% of emissions verified)</li>
          </ul>
        </div>
      ),
    },
  },
  capexThreshold: {
    tooltip: "Below this amount, the committee can approve. Above this, it must go to the full board.",
  },
};

export const scenarioHelp: Record<string, HelpEntry> = {
  scenarioDefinition: {
    tooltip: "IFRS S2 requires at least 3 climate scenarios. BAU + 1.5C + Stress is the standard set.",
    modal: {
      title: "Climate Scenario Requirements",
      content: (
        <div className="flex flex-col gap-2">
          <p>Under IFRS S2, you must model at least 3 climate futures and quantify their financial impact.</p>
          <p className="font-medium">Standard set:</p>
          <ul className="list-disc pl-4 space-y-1">
            <li>BAU (Business As Usual): Current policies continue, slow transition</li>
            <li>1.5C Aligned: Aggressive transition consistent with Paris Agreement</li>
            <li>Stress: Sudden, disruptive shock (regulatory, technological, or geopolitical)</li>
          </ul>
          <p>Each scenario needs: assumptions, carbon price trajectory, financial impact, and resilience assessment.</p>
        </div>
      ),
    },
  },
  carbonPrice: {
    tooltip: "What you'll pay per tonne of CO2. IEA projections: BAU RM 80-150, 1.5C RM 300-500 by 2050.",
    modal: {
      title: "Carbon Price Trajectories",
      content: (
        <div className="flex flex-col gap-2">
          <p>Carbon pricing is the single biggest variable in climate financial modeling.</p>
          <p className="font-medium">Reference curves (RM/tonne CO2):</p>
          <table className="w-full text-[12px] border border-neutral-lighter mt-1">
            <thead className="bg-neutral-light"><tr><th className="px-2 py-1 text-left">Year</th><th className="px-2 py-1">BAU</th><th className="px-2 py-1">1.5C</th><th className="px-2 py-1">Stress</th></tr></thead>
            <tbody>
              <tr className="border-t border-neutral-lighter"><td className="px-2 py-1">2025</td><td className="px-2 py-1 text-center">20</td><td className="px-2 py-1 text-center">50</td><td className="px-2 py-1 text-center">20</td></tr>
              <tr className="border-t border-neutral-lighter"><td className="px-2 py-1">2030</td><td className="px-2 py-1 text-center">40</td><td className="px-2 py-1 text-center">150</td><td className="px-2 py-1 text-center">200</td></tr>
              <tr className="border-t border-neutral-lighter"><td className="px-2 py-1">2040</td><td className="px-2 py-1 text-center">80</td><td className="px-2 py-1 text-center">300</td><td className="px-2 py-1 text-center">400</td></tr>
              <tr className="border-t border-neutral-lighter"><td className="px-2 py-1">2050</td><td className="px-2 py-1 text-center">150</td><td className="px-2 py-1 text-center">500</td><td className="px-2 py-1 text-center">600</td></tr>
            </tbody>
          </table>
          <p className="mt-2">Sources: IEA World Energy Outlook, NGFS scenarios, Malaysia carbon tax roadmap.</p>
        </div>
      ),
    },
  },
  financialImpact: {
    tooltip: "Auditors want numbers, not narratives. Revenue, cost, EBITDA impact for each scenario.",
  },
  resilience: {
    tooltip: "Does your strategy survive all 3 futures? If it only works in BAU, you have a problem.",
    modal: {
      title: "Strategy Resilience Assessment",
      content: (
        <div className="flex flex-col gap-2">
          <p>A resilient strategy works across multiple climate futures — not just the one you hope for.</p>
          <p className="font-medium">Scoring:</p>
          <ul className="list-disc pl-4 space-y-1">
            <li>3/3 scenarios: Excellent — strategy adapts to any future</li>
            <li>2/3 scenarios: Acceptable — needs contingency for the failing one</li>
            <li>1/3 scenarios: Warning — high risk, redesign needed</li>
            <li>0/3 scenarios: Critical — fundamental strategy failure</li>
          </ul>
          <p>The "survive" test: Can the company service its debt and maintain minimum operations under each scenario?</p>
        </div>
      ),
    },
  },
};

export const financialHelp: Record<string, HelpEntry> = {
  baseline: {
    tooltip: "Your starting position. Auditors need a clear baseline before they can assess transition impact.",
  },
  capexBreakdown: {
    tooltip: "BAU = what you'd spend anyway. Transition = additional investment needed to decarbonize.",
    modal: {
      title: "BAU vs Transition Capex",
      content: (
        <div className="flex flex-col gap-2">
          <p>This comparison answers the auditor question: "How much more do you need to spend to transition?"</p>
          <p className="font-medium">BAU categories typically include:</p>
          <ul className="list-disc pl-4 space-y-1">
            <li>Maintenance capex (keeping existing assets running)</li>
            <li>Regulatory compliance (current regulations)</li>
            <li>Capacity expansion (using current technology)</li>
          </ul>
          <p className="font-medium">Transition categories typically include:</p>
          <ul className="list-disc pl-4 space-y-1">
            <li>Renewable energy procurement / installation</li>
            <li>Energy efficiency retrofits</li>
            <li>Carbon capture technology</li>
            <li>Fleet electrification</li>
            <li>Process transformation</li>
          </ul>
        </div>
      ),
    },
  },
  strandedAssets: {
    tooltip: "Assets that lose value due to climate transition. Auditors ask: 'Do you have a realistic estimate?'",
    modal: {
      title: "Stranded Asset Assessment",
      content: (
        <div className="flex flex-col gap-2">
          <p>Stranded assets are investments that become worthless or significantly devalued before the end of their economic life due to climate transition.</p>
          <p className="font-medium">Probability-weighted calculation:</p>
          <p>Expected write-down = (BAU probability x BAU write-down) + (1.5C probability x 1.5C write-down) + (Stress probability x Stress write-down)</p>
          <p className="font-medium">Mitigation strategies:</p>
          <ul className="list-disc pl-4 space-y-1">
            <li>Early retirement with salvage value</li>
            <li>Retrofit / repurpose for low-carbon use</li>
            <li>Accelerated depreciation (reduce book value exposure)</li>
            <li>Divest before value decline materializes</li>
          </ul>
        </div>
      ),
    },
  },
  fundingGap: {
    tooltip: "Does your transition capex exceed available funding? If so, you need a gap strategy.",
  },
};

export const segmentHelp: Record<string, HelpEntry> = {
  emissions: {
    tooltip: "Scope 1 (direct), Scope 2 (electricity), Scope 3 (supply chain). Auto-calculates % of group.",
  },
  climateRisks: {
    tooltip: "Physical risks (flooding, heat), transition risks (regulation, technology), liability risks.",
    modal: {
      title: "Climate Risk Assessment by Segment",
      content: (
        <div className="flex flex-col gap-2">
          <p>Each segment faces different climate risks. Quantify impact in RM and probability.</p>
          <p className="font-medium">Risk categories:</p>
          <ul className="list-disc pl-4 space-y-1">
            <li>Physical: Extreme weather, sea-level rise, water stress</li>
            <li>Transition: Carbon pricing, regulation, technology disruption</li>
            <li>Liability: Litigation, greenwashing claims, compliance penalties</li>
            <li>Market: Demand shifts, stranded assets, competitor advantage</li>
          </ul>
        </div>
      ),
    },
  },
  strategy: {
    tooltip: "Multi-year targets (2030/2040/2050) with renewable energy % and reduction targets.",
  },
  ownership: {
    tooltip: "Who owns this segment's decarbonization? Is their bonus tied to it? Auditors will ask.",
  },
};
