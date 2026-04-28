"use client";

import { CheckCircle, Circle, Loader2 } from "lucide-react";

export type StepStatus = "not_started" | "in_progress" | "complete" | "pending_approval" | "approved";

interface ProgressStepProps {
  steps: {
    label: string;
    status: StepStatus;
    detail?: string;
  }[];
}

const statusIcon: Record<StepStatus, React.ReactNode> = {
  not_started: <Circle className="w-5 h-5 text-neutral-lighter" />,
  in_progress: <Loader2 className="w-5 h-5 text-primary animate-spin" />,
  complete: <CheckCircle className="w-5 h-5 text-success" />,
  pending_approval: <Circle className="w-5 h-5 text-warning" />,
  approved: <CheckCircle className="w-5 h-5 text-success" />,
};

const statusLabel: Record<StepStatus, string> = {
  not_started: "Not Started",
  in_progress: "In Progress",
  complete: "Complete",
  pending_approval: "Pending Approval",
  approved: "Approved",
};

export function ProgressSteps({ steps }: ProgressStepProps) {
  return (
    <div className="flex flex-col gap-1">
      {steps.map((step, i) => (
        <div key={i} className="flex items-center gap-3 py-2">
          {statusIcon[step.status]}
          <div className="flex-1">
            <p className="text-[14px] font-medium text-text-primary">{step.label}</p>
            {step.detail && <p className="text-[13px] text-text-secondary">{step.detail}</p>}
          </div>
          <span className={`text-[12px] font-medium ${
            step.status === "complete" || step.status === "approved" ? "text-success" :
            step.status === "in_progress" ? "text-primary" :
            step.status === "pending_approval" ? "text-warning" :
            "text-text-secondary"
          }`}>
            {statusLabel[step.status]}
          </span>
        </div>
      ))}
    </div>
  );
}
