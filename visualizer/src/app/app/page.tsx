"use client";

import { DisclaimerGate } from "@/components/disclaimer-gate";
import { Dashboard } from "@/components/dashboard/dashboard";

export default function AppPage() {
  return (
    <DisclaimerGate>
      <Dashboard />
    </DisclaimerGate>
  );
}
