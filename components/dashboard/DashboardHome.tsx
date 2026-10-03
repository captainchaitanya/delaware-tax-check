"use client";

import { useAppState } from "@/components/app/AppState";
import { UnverifiedBadge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { LinkButton } from "@/components/ui/LinkButton";
import { Stat } from "@/components/ui/Stat";
import { formatUsd } from "@/lib/format";
import { franchiseEstimateFromProfile } from "@/lib/franchiseEstimate";
import { greetingFor } from "@/lib/greeting";
import { TAX_CONFIG } from "@/lib/taxConfig";

export function DashboardHome() {
  const { state } = useAppState();
  const profile = state.profile;
  if (!profile) {
    return null;
  }

  const estimate = franchiseEstimateFromProfile(profile);

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8 lg:py-10">
      <p className="text-sm text-muted">Dashboard</p>
      <h1 className="mt-1 font-serif text-3xl font-medium tracking-tight sm:text-4xl">
        {greetingFor(profile.companyName, new Date(), profile.firstName)}
      </h1>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
        A quiet place to see what Delaware, the IRS, and India may expect
        next. Nothing here files anything for you.
      </p>

      <div className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat
          label="Next deadline"
          value="—"
          hint="Appears when the calendar has dates"
        />
        <Stat
          label="Overdue"
          value="—"
          hint="Filings past their due date"
        />
        <Stat
          label="Done this quarter"
          value="—"
          hint="Marked complete in this quarter"
        />
        <Stat
          label="Est. annual cost"
          value={estimate ? formatUsd(estimate.filingTotal) : "—"}
          hint={
            estimate
              ? "Delaware franchise tax and annual report"
              : "Add share data to estimate"
          }
        />
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <Card>
          <h2 className="mb-3 font-serif text-xl font-medium">Next deadlines</h2>
          <EmptyState
            title="No upcoming dates yet"
            body={`Your deadlines will appear here once the calendar is set up for ${profile.companyName}.`}
            action={<LinkButton href="/calendar">Open Calendar</LinkButton>}
          />
        </Card>

        <Card>
          <h2 className="mb-3 font-serif text-xl font-medium">Action items</h2>
          <EmptyState
            title="You're clear"
            body="Nothing needs your attention right now."
            action={<LinkButton href="/inbox">Open Inbox</LinkButton>}
          />
        </Card>

        <Card>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-serif text-xl font-medium">
              Estimated annual compliance cost
            </h2>
            {TAX_CONFIG.verified ? null : <UnverifiedBadge />}
          </div>
          {estimate ? (
            <div className="flex flex-col gap-4">
              <Stat
                label="Delaware franchise tax + annual report"
                value={formatUsd(estimate.filingTotal)}
                hint={`${formatUsd(estimate.tax)} tax and ${formatUsd(estimate.annualReportFee)} report fee. Other costs are not estimated yet.`}
              />
              <LinkButton href="/tools/franchise-tax">
                Review the calculation
              </LinkButton>
            </div>
          ) : (
            <EmptyState
              title="No share data yet"
              body="Add authorized shares, issued shares, and assets to estimate the Delaware franchise tax."
              action={
                <LinkButton href="/tools/franchise-tax">
                  Open Franchise Tax Checker
                </LinkButton>
              }
            />
          )}
        </Card>

        <Card>
          <h2 className="mb-3 font-serif text-xl font-medium">
            Recent documents
          </h2>
          <EmptyState
            title="Inbox is empty"
            body="No documents yet. Paste a notice or certificate in the Inbox and it will show up here after you review it."
            action={<LinkButton href="/inbox">Open Inbox</LinkButton>}
          />
        </Card>
      </div>
    </main>
  );
}
