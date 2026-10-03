"use client";

import { Calculator } from "@/components/Calculator";
import { useAppState } from "@/components/app/AppState";

export default function FranchiseTaxPage() {
  const { state } = useAppState();
  const initial = state.profile?.shareStructure ?? undefined;

  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-8 pb-24 lg:py-10">
      <Calculator
        key={initial ? JSON.stringify(initial) : "empty"}
        initialForm={initial}
      />
    </main>
  );
}
