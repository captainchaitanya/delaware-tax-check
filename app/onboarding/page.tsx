"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { OnboardingFlow } from "@/components/onboarding/OnboardingFlow";

function OnboardingInner() {
  const params = useSearchParams();
  return (
    <OnboardingFlow mode={params.get("mode") === "edit" ? "edit" : "create"} />
  );
}

export default function OnboardingPage() {
  return (
    <Suspense
      fallback={
        <p className="px-4 py-10 text-sm text-muted">Loading setup…</p>
      }
    >
      <OnboardingInner />
    </Suspense>
  );
}
