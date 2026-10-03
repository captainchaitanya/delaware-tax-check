"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ANALYTICS_EVENTS, capture, savingsBucket } from "@/lib/analytics";
import { NextSteps } from "./NextSteps";
import { ResultsPanel } from "./ResultsPanel";
import { ShareClassList } from "./ShareClassList";
import { Field } from "./Field";
import { CLASSIC_EXAMPLE, EMPTY_FORM, newClassForm } from "@/lib/example";
import {
  calculateIfReady,
  parseIssuedShares,
  parseNonNegativeDecimal,
} from "@/lib/formValidation";
import type { CalculatorForm } from "@/lib/formTypes";
import { selectResultsPresentation } from "@/lib/resultsPresentation";
import { TAX_CONFIG } from "@/lib/taxConfig";

type CalculatorProps = {
  initialForm?: CalculatorForm;
};

export function Calculator({ initialForm }: CalculatorProps) {
  const [form, setForm] = useState<CalculatorForm>(initialForm ?? EMPTY_FORM);

  const issued = parseIssuedShares(form.issuedShares);
  const assets = parseNonNegativeDecimal(form.grossAssets);
  const calculation = useMemo(() => calculateIfReady(form), [form]);
  const lastCalc = useRef<string | null>(null);

  useEffect(() => {
    if (!calculation.ready) {
      return;
    }
    const bucket = savingsBucket(calculation.result.savings);
    const signature = `${calculation.result.winningMethod}:${bucket}`;
    if (lastCalc.current === signature) {
      return;
    }
    lastCalc.current = signature;
    capture(ANALYTICS_EVENTS.franchiseTaxCalculated, {
      winningMethod: calculation.result.winningMethod,
      savingsBucket: bucket,
    });
  }, [calculation]);

  function loadExample() {
    setForm({
      issuedShares: CLASSIC_EXAMPLE.issuedShares,
      grossAssets: CLASSIC_EXAMPLE.grossAssets,
      classes: CLASSIC_EXAMPLE.classes.map((cls) => ({ ...cls })),
    });
    requestAnimationFrame(() => {
      document.getElementById("results-heading")?.focus();
    });
  }

  return (
    <div className="flex flex-col gap-10">
      <section className="flex flex-col gap-4">
        <p className="text-sm font-medium uppercase tracking-[0.14em] text-accent">
          Delaware C-corp franchise tax
        </p>
        <h1 className="max-w-xl font-serif text-[2rem] leading-tight font-medium tracking-tight sm:text-4xl">
          Got a scary Delaware tax bill? Check if you&apos;re overpaying.
        </h1>
        <p className="max-w-xl text-[15px] leading-7 text-muted">
          Delaware&apos;s default notice uses the Authorized Shares Method.
          The Assumed Par Value Capital Method is legal and often far
          lower — frequently the $400 minimum. Enter the figures from your
          certificate and tax return to see both.
        </p>
        <div>
          <button
            type="button"
            onClick={loadExample}
            className="h-11 rounded-md border border-line bg-card px-4 text-sm font-medium text-foreground hover:border-accent/40 focus:border-accent focus:ring-2 focus:ring-accent/20 focus:outline-none"
          >
            Try an example
          </button>
        </div>
      </section>

      <form
        className="flex flex-col gap-6"
        onSubmit={(event) => event.preventDefault()}
      >
        <ShareClassList
          classes={form.classes}
          onChange={(classes) => setForm((current) => ({ ...current, classes }))}
        />

        <button
          type="button"
          onClick={() =>
            setForm((current) => ({
              ...current,
              classes: [...current.classes, newClassForm()],
            }))
          }
          className="self-start text-sm font-medium text-accent underline decoration-accent/30 underline-offset-4 hover:decoration-accent"
        >
          Add a share class
        </button>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field
            id="issued-shares"
            label="Issued shares"
            hint="All issued shares, including treasury. From the cap table or the annual report."
            value={form.issuedShares}
            onChange={(issuedShares) =>
              setForm((current) => ({ ...current, issuedShares }))
            }
            error={issued.ok || issued.empty ? null : issued.message}
            inputMode="numeric"
            placeholder="8,000,000"
          />
          <Field
            id="gross-assets"
            label="Total gross assets"
            hint={'Form 1120 Schedule L, the "Total assets" line.'}
            value={form.grossAssets}
            onChange={(grossAssets) =>
              setForm((current) => ({ ...current, grossAssets }))
            }
            error={assets.ok || assets.empty ? null : assets.message}
            inputMode="decimal"
            placeholder="100,000"
          />
        </div>
      </form>

      {calculation.ready ? (
        <ResultsPanel input={calculation.input} result={calculation.result} />
      ) : (
        <p className="text-sm text-muted">
          Enter every figure to see both methods. Results update as you
          type — there is nothing to submit.
        </p>
      )}

      {calculation.ready ? (
        <NextSteps
          showRefileStep={
            selectResultsPresentation(calculation.result).showRefileStep
          }
        />
      ) : null}

      <p className="border-t border-line pt-6 text-xs leading-5 text-muted">
        Educational tool, not tax advice.{" "}
        {TAX_CONFIG.status === "verified"
          ? `Verified ${TAX_CONFIG.lastChecked}. `
          : `Unverified candidate figures, last noted ${TAX_CONFIG.lastChecked}. `}
        {TAX_CONFIG.notes} Recheck{" "}
        <a
          href={TAX_CONFIG.sources[0]}
          className="underline decoration-line underline-offset-2 hover:text-foreground"
        >
          corp.delaware.gov
        </a>{" "}
        before you file.
      </p>
    </div>
  );
}
