"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { useAppState } from "@/components/app/AppState";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Dialog } from "@/components/ui/Dialog";
import { useToast } from "@/components/ui/Toast";
import {
  clearState,
  exportState,
  importState,
  type ThemePreference,
} from "@/lib/storage";

export function SettingsPanel() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const { notify } = useToast();
  const { state, setTheme, replaceState, resetState } = useAppState();
  const [confirmReset, setConfirmReset] = useState(false);
  const profile = state.profile;

  function downloadExport() {
    const blob = new Blob([exportState(state)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "founder-desk-backup.json";
    link.click();
    URL.revokeObjectURL(url);
    notify("Backup downloaded");
  }

  async function onImport(file: File | undefined) {
    if (!file) {
      return;
    }
    try {
      const text = await file.text();
      const next = importState(text);
      replaceState(next);
      notify("Backup imported");
    } catch (error) {
      notify(error instanceof Error ? error.message : "Import failed");
    }
  }

  function onReset() {
    clearState();
    resetState();
    setConfirmReset(false);
    router.replace("/onboarding");
  }

  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-8 pb-24 lg:py-10">
      <h1 className="font-serif text-3xl font-medium tracking-tight">
        Settings
      </h1>
      <p className="mt-2 text-sm text-muted">
        Everything stays on this device. Founder Desk has no account and no
        server-side database.
      </p>

      <div className="mt-8 flex flex-col gap-5">
        <Card>
          <h2 className="font-serif text-xl font-medium">Company profile</h2>
          {profile ? (
            <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
              <Item label="Name" value={profile.companyName} />
              <Item label="US entity" value="Delaware C-corp" />
              <Item
                label="US tax year end"
                value={`${String(profile.usTaxYearEnd.month).padStart(2, "0")} / ${String(profile.usTaxYearEnd.day).padStart(2, "0")}`}
              />
              <Item
                label="25%+ foreign-owned"
                value={profile.foreignOwned25 ? "Yes" : "No"}
              />
              <Item
                label="Indian subsidiary"
                value={profile.hasIndianSubsidiary ? "Yes" : "No"}
              />
              <Item
                label="Indian-resident founders hold US shares"
                value={profile.indianResidentFoundersHoldShares ? "Yes" : "No"}
              />
              <Item
                label="Pays US contractors"
                value={profile.paysUsContractors ? "Yes" : "No"}
              />
            </dl>
          ) : (
            <p className="mt-3 text-sm text-muted">No profile yet.</p>
          )}
          <div className="mt-4">
            <Button variant="secondary" onClick={() => router.push("/onboarding?mode=edit")}>
              Edit profile
            </Button>
          </div>
        </Card>

        <Card>
          <h2 className="font-serif text-xl font-medium">Appearance</h2>
          <p className="mt-1 text-sm text-muted">
            Defaults to your system preference.
          </p>
          <fieldset className="mt-4">
            <legend className="sr-only">Theme</legend>
            <div className="flex flex-wrap gap-2">
              {(["system", "light", "dark"] as ThemePreference[]).map(
                (option) => (
                  <label
                    key={option}
                    className={`flex h-11 cursor-pointer items-center rounded-md border px-4 text-sm capitalize ${
                      state.theme === option
                        ? "border-accent bg-accent-soft"
                        : "border-line bg-card"
                    }`}
                  >
                    <input
                      type="radio"
                      name="theme"
                      className="sr-only"
                      checked={state.theme === option}
                      onChange={() => setTheme(option)}
                    />
                    {option}
                  </label>
                ),
              )}
            </div>
          </fieldset>
        </Card>

        <Card>
          <h2 className="font-serif text-xl font-medium">Your data</h2>
          <p className="mt-1 text-sm text-muted">
            Export a JSON backup, import it on another browser, or reset this
            device.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button variant="secondary" onClick={downloadExport}>
              Export my data
            </Button>
            <Button
              variant="secondary"
              onClick={() => fileRef.current?.click()}
            >
              Import
            </Button>
            <Button variant="danger" onClick={() => setConfirmReset(true)}>
              Reset
            </Button>
            <input
              ref={fileRef}
              type="file"
              accept="application/json"
              className="sr-only"
              onChange={(event) => {
                void onImport(event.target.files?.[0]);
                event.target.value = "";
              }}
            />
          </div>
        </Card>

        <p className="text-xs text-muted">
          <Link href="/tools/franchise-tax" className="underline underline-offset-2">
            Franchise Tax Checker
          </Link>
          {" · "}
          Educational tool, not tax or legal advice.
        </p>
      </div>

      <Dialog
        open={confirmReset}
        title="Reset this device?"
        confirmLabel="Reset"
        onClose={() => setConfirmReset(false)}
        onConfirm={onReset}
      >
        This clears the company profile and any saved data on this browser. A
        JSON export is the only way to get it back.
      </Dialog>
    </main>
  );
}

function Item({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-muted">{label}</dt>
      <dd className="mt-0.5 text-foreground">{value}</dd>
    </div>
  );
}
