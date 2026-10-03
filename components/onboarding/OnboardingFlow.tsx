"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ShareClassList } from "@/components/ShareClassList";
import { Field } from "@/components/Field";
import { Button } from "@/components/ui/Button";
import { SelectInput, TextInput } from "@/components/ui/Input";
import { YesNo } from "@/components/ui/YesNo";
import { newClassForm } from "@/lib/example";
import {
  parseIssuedShares,
  parseNonNegativeDecimal,
} from "@/lib/formValidation";
import type { CalculatorForm } from "@/lib/formTypes";
import {
  companyProfileSchema,
  createDraftProfile,
  emptyShareStructure,
  type CompanyProfile,
} from "@/lib/profile";
import { useAppState } from "@/components/app/AppState";

const STEPS = [
  "Company",
  "Ownership",
  "India",
  "Founders",
  "Contractors",
  "Shares",
] as const;

type Draft = Omit<CompanyProfile, "completedAt">;

type OnboardingFlowProps = {
  mode?: "create" | "edit";
};

export function OnboardingFlow({ mode = "create" }: OnboardingFlowProps) {
  const router = useRouter();
  const { state, saveProfile } = useAppState();
  const [step, setStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [draft, setDraft] = useState<Draft>(() =>
    state.profile
      ? omitCompleted(state.profile)
      : createDraftProfile(),
  );
  const [shareForm, setShareForm] = useState<CalculatorForm>(
    () => state.profile?.shareStructure ?? emptyShareStructure(),
  );

  const progress = `${step + 1} of ${STEPS.length}`;

  function next() {
    const message = validateStep(step, draft);
    if (message) {
      setError(message);
      return;
    }
    setError(null);
    setStep((current) => Math.min(current + 1, STEPS.length - 1));
  }

  function finish() {
    const shareStructure = hasShareInput(shareForm) ? shareForm : null;
    const result = companyProfileSchema.safeParse({
      ...draft,
      india: draft.hasIndianSubsidiary ? draft.india : null,
      shareStructure,
      completedAt: new Date().toISOString(),
    });
    if (!result.success) {
      setError(result.error.issues[0]?.message ?? "Check the highlighted fields");
      return;
    }
    saveProfile(result.data);
    router.push(mode === "edit" ? "/settings" : "/");
  }

  return (
    <main className="mx-auto w-full max-w-xl px-4 py-10 pb-16">
      <p className="text-sm font-medium uppercase tracking-[0.14em] text-accent">
        {mode === "edit" ? "Edit profile" : "Set up Founder Desk"}
      </p>
      <h1 className="mt-2 font-serif text-3xl font-medium tracking-tight">
        {STEPS[step]}
      </h1>
      <p className="mt-2 text-sm text-muted">Step {progress}</p>
      <ol className="mt-4 flex gap-1" aria-hidden="true">
        {STEPS.map((label, index) => (
          <li
            key={label}
            className={`h-1 flex-1 rounded-full ${
              index <= step ? "bg-accent" : "bg-line"
            }`}
          />
        ))}
      </ol>

      <div className="mt-8 flex flex-col gap-5">
        {step === 0 ? <CompanyStep draft={draft} setDraft={setDraft} /> : null}
        {step === 1 ? <OwnershipStep draft={draft} setDraft={setDraft} /> : null}
        {step === 2 ? <IndiaStep draft={draft} setDraft={setDraft} /> : null}
        {step === 3 ? <FoundersStep draft={draft} setDraft={setDraft} /> : null}
        {step === 4 ? <ContractorsStep draft={draft} setDraft={setDraft} /> : null}
        {step === 5 ? (
          <SharesStep form={shareForm} onChange={setShareForm} />
        ) : null}
        {error ? (
          <p role="alert" className="text-sm font-medium">
            {error}
          </p>
        ) : null}
      </div>

      <div className="mt-8 flex flex-wrap gap-2">
        {step > 0 ? (
          <Button variant="secondary" onClick={() => setStep((s) => s - 1)}>
            Back
          </Button>
        ) : null}
        {step < STEPS.length - 1 ? (
          <Button onClick={next}>Continue</Button>
        ) : (
          <Button onClick={finish}>
            {mode === "edit" ? "Save profile" : "Open my desk"}
          </Button>
        )}
      </div>
    </main>
  );
}

function omitCompleted(profile: CompanyProfile): Draft {
  const { completedAt: _completedAt, ...draft } = profile;
  return draft;
}

function validateStep(step: number, draft: Draft): string | null {
  if (step === 0 && draft.companyName.trim() === "") {
    return "Enter the company name";
  }
  if (step === 2 && draft.hasIndianSubsidiary) {
    if (!draft.india) {
      return "Add Indian subsidiary details";
    }
    if (draft.india.directorCount < 1) {
      return "Enter the number of directors";
    }
  }
  return null;
}

function hasShareInput(form: CalculatorForm): boolean {
  return Boolean(
    form.issuedShares.trim() ||
      form.grossAssets.trim() ||
      form.classes.some(
        (cls) => cls.authorized.trim() || cls.parValue.trim(),
      ),
  );
}

function CompanyStep({
  draft,
  setDraft,
}: {
  draft: Draft;
  setDraft: (draft: Draft) => void;
}) {
  return (
    <>
      <TextInput
        id="company-name"
        label="Company name"
        value={draft.companyName}
        onChange={(event) =>
          setDraft({ ...draft, companyName: event.target.value })
        }
        placeholder="Northbridge Labs, Inc."
        hint="The US parent — usually the Delaware C-corp."
      />
      <div>
        <p className="text-sm font-medium">US entity</p>
        <p className="mt-1 text-sm text-muted">
          Delaware C-corporation (default for this desk).
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <SelectInput
          id="tax-month"
          label="US tax year end — month"
          value={String(draft.usTaxYearEnd.month)}
          onChange={(event) =>
            setDraft({
              ...draft,
              usTaxYearEnd: {
                ...draft.usTaxYearEnd,
                month: Number(event.target.value),
              },
            })
          }
        >
          {MONTHS.map((month, index) => (
            <option key={month} value={index + 1}>
              {month}
            </option>
          ))}
        </SelectInput>
        <SelectInput
          id="tax-day"
          label="Day"
          value={String(draft.usTaxYearEnd.day)}
          onChange={(event) =>
            setDraft({
              ...draft,
              usTaxYearEnd: {
                ...draft.usTaxYearEnd,
                day: Number(event.target.value),
              },
            })
          }
        >
          {Array.from({ length: 31 }, (_, index) => (
            <option key={index + 1} value={index + 1}>
              {index + 1}
            </option>
          ))}
        </SelectInput>
      </div>
    </>
  );
}

function OwnershipStep({
  draft,
  setDraft,
}: {
  draft: Draft;
  setDraft: (draft: Draft) => void;
}) {
  return (
    <YesNo
      name="foreign-owned"
      legend="Is the US company 25% or more foreign-owned?"
      hint="Including ownership by Indian residents or an Indian company. This can trigger Form 5472."
      value={draft.foreignOwned25}
      onChange={(foreignOwned25) => setDraft({ ...draft, foreignOwned25 })}
    />
  );
}

function IndiaStep({
  draft,
  setDraft,
}: {
  draft: Draft;
  setDraft: (draft: Draft) => void;
}) {
  return (
    <>
      <YesNo
        name="india-sub"
        legend="Does the US company have an Indian subsidiary?"
        value={draft.hasIndianSubsidiary}
        onChange={(hasIndianSubsidiary) =>
          setDraft({
            ...draft,
            hasIndianSubsidiary,
            india: hasIndianSubsidiary
              ? draft.india ?? {
                  financialYear: "apr-mar",
                  gstRegistered: false,
                  receivesForeignInvestment: false,
                  directorCount: 2,
                }
              : null,
          })
        }
      />
      {draft.hasIndianSubsidiary && draft.india ? (
        <>
          <p className="text-sm text-muted">
            India financial year defaults to April–March.
          </p>
          <YesNo
            name="gst"
            legend="GST registered?"
            value={draft.india.gstRegistered}
            onChange={(gstRegistered) =>
              setDraft({
                ...draft,
                india: { ...draft.india!, gstRegistered },
              })
            }
          />
          <YesNo
            name="fdi"
            legend="Does it receive foreign investment from the US parent?"
            value={draft.india.receivesForeignInvestment}
            onChange={(receivesForeignInvestment) =>
              setDraft({
                ...draft,
                india: { ...draft.india!, receivesForeignInvestment },
              })
            }
          />
          <TextInput
            id="directors"
            label="Number of directors"
            inputMode="numeric"
            value={String(draft.india.directorCount)}
            onChange={(event) =>
              setDraft({
                ...draft,
                india: {
                  ...draft.india!,
                  directorCount: Number(event.target.value) || 0,
                },
              })
            }
          />
        </>
      ) : null}
    </>
  );
}

function FoundersStep({
  draft,
  setDraft,
}: {
  draft: Draft;
  setDraft: (draft: Draft) => void;
}) {
  return (
    <YesNo
      name="resident-founders"
      legend="Do any Indian-resident founders hold shares in the US company?"
      hint="This can create an overseas direct investment reporting duty."
      value={draft.indianResidentFoundersHoldShares}
      onChange={(indianResidentFoundersHoldShares) =>
        setDraft({ ...draft, indianResidentFoundersHoldShares })
      }
    />
  );
}

function ContractorsStep({
  draft,
  setDraft,
}: {
  draft: Draft;
  setDraft: (draft: Draft) => void;
}) {
  return (
    <YesNo
      name="contractors"
      legend="Does the US company pay US contractors?"
      hint="If yes, Form 1099-NEC may be due each January."
      value={draft.paysUsContractors}
      onChange={(paysUsContractors) => setDraft({ ...draft, paysUsContractors })}
    />
  );
}

function SharesStep({
  form,
  onChange,
}: {
  form: CalculatorForm;
  onChange: (form: CalculatorForm) => void;
}) {
  const issued = parseIssuedShares(form.issuedShares);
  const assets = parseNonNegativeDecimal(form.grossAssets);
  const issuedError = useMemo(
    () => (issued.ok || issued.empty ? null : issued.message),
    [issued],
  );
  const assetsError = useMemo(
    () => (assets.ok || assets.empty ? null : assets.message),
    [assets],
  );

  return (
    <div className="flex flex-col gap-5">
      <p className="text-sm leading-6 text-muted">
        Optional. Add the Delaware share structure if you have it — the
        dashboard can then estimate franchise tax. You can skip this and
        use the Franchise Tax Checker later.
      </p>
      <ShareClassList
        classes={form.classes}
        onChange={(classes) => onChange({ ...form, classes })}
      />
      <button
        type="button"
        onClick={() =>
          onChange({
            ...form,
            classes: [...form.classes, newClassForm()],
          })
        }
        className="self-start text-sm font-medium text-accent underline decoration-accent/30 underline-offset-4"
      >
        Add a share class
      </button>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          id="onboard-issued"
          label="Issued shares"
          hint="Including treasury shares."
          value={form.issuedShares}
          onChange={(issuedShares) => onChange({ ...form, issuedShares })}
          error={issuedError}
          inputMode="numeric"
        />
        <Field
          id="onboard-assets"
          label="Total gross assets"
          hint="Form 1120 Schedule L, if you have it."
          value={form.grossAssets}
          onChange={(grossAssets) => onChange({ ...form, grossAssets })}
          error={assetsError}
          inputMode="decimal"
        />
      </div>
    </div>
  );
}

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
