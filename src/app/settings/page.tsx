"use client";

import { useSteinwall } from "@/lib/context";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { clearData } from "@/lib/persistence";
import { defaultSteinwallData } from "@/lib/types";
import { Save, Trash2 } from "lucide-react";

export default function SettingsPage() {
  const { data, update, hydrated } = useSteinwall();
  const [companyName, setCompanyName] = useState(data.companyName);
  const [industry, setIndustry] = useState(data.industry);
  const [auditDueDate, setAuditDueDate] = useState(data.auditDueDate || "");

  if (!hydrated) {
    return <div className="flex items-center justify-center h-64"><p className="text-text-secondary">Loading...</p></div>;
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-[24px] text-primary mb-6">Settings</h1>

      <Card className="mb-6">
        <h2 className="text-[18px] text-primary mb-4">Company Information</h2>
        <div className="flex flex-col gap-4">
          <Input
            label="Company Name"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
          />
          <Input
            label="Industry"
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
          />
          <Input
            label="Audit Due Date"
            type="date"
            value={auditDueDate}
            onChange={(e) => setAuditDueDate(e.target.value)}
          />
          <Button
            variant="primary"
            onClick={() => update({ companyName, industry, auditDueDate })}
          >
            <Save className="w-4 h-4" /> Save Changes
          </Button>
        </div>
      </Card>

      <Card>
        <h2 className="text-[18px] text-error mb-2">Danger Zone</h2>
        <p className="text-[14px] text-text-secondary mb-4">
          Reset all data. This will permanently delete all assessments, emissions data, strategies, and audit records.
        </p>
        <Button
          variant="destructive"
          onClick={() => {
            if (confirm("Delete ALL Steinwall data? This cannot be undone.")) {
              clearData();
              update({ ...defaultSteinwallData });
              window.location.reload();
            }
          }}
        >
          <Trash2 className="w-4 h-4" /> Reset All Data
        </Button>
      </Card>
    </div>
  );
}
